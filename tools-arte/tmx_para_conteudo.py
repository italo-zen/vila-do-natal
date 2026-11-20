#!/usr/bin/env python3
"""Conversor da planta do Tiled para o conteúdo do jogo (ADR-011, docs/conversor-tmx.md).

Lê a cópia de trabalho `maps/casa-real/home-v2-jogo.tmx` e grava, por área,
`content/maps/casa-real/<id>.json` (schemaVersion 3), as entradas `maps[]` do manifesto e,
com --atualizar-golden, o golden em `tools-arte/golden/casa-real/`. Só biblioteca padrão.
Não altera src/.

Uso:
    python3 tools-arte/tmx_para_conteudo.py [--entrada CAMINHO] [--perfil ID]
        [--verificar | --atualizar-golden] [--girar]

    --girar              gira cada área 90° no sentido horário na saída (ADR-011 seção 2.5).
                         O TMX nunca gira; só a saída.
    --perfil ID          perfil de arte (content/art-profiles/ID.json). Padrão: hd-480x352.
    --verificar          não grava nada; compara content/, entradas maps[] do manifesto e golden;
                         sai com 1 se algo diferir (E017).
    --atualizar-golden   grava também o golden (tools-arte/golden/casa-real/).

Códigos de saída: 0 ok; 1 erro de regra (E0xx); 2 uso incorreto.
"""
import argparse
import hashlib
import json
import math
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from collections import deque
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ENTRADA_PADRAO = RAIZ / "maps" / "casa-real" / "home-v2-jogo.tmx"
SAIDA_CONTEUDO = RAIZ / "content" / "maps" / "casa-real"
GOLDEN = RAIZ / "tools-arte" / "golden" / "casa-real"
MANIFESTO = RAIZ / "content" / "manifest.json"
PERFIS = RAIZ / "content" / "art-profiles"
PERFIL_PADRAO = "hd-480x352"
SCHEMA_VERSION = 3

G_PISOS = "Pisos"
G_ROTULOS = "Rótulos das subáreas"
G_PORTAS = "Portas"
G_MUROS = "muros"
G_BLOQ = "Objetos da casa bloqueantes"
G_JOGO = "Objetos de jogo"
GRUPOS_CONHECIDOS = {G_ROTULOS, G_PORTAS, G_MUROS, G_BLOQ, G_JOGO}
GRUPOS_OBRIGATORIOS = [G_ROTULOS, G_PORTAS, G_MUROS]       # G_BLOQ e G_JOGO são opcionais
CLASSES_JOGO = {"spawn", "interruptor", "bilhete", "arvore", "examinavel", "peca", "enfeite"}
ESTADOS_PECA = {"visivel", "escondida"}
ORDEM_DO_ENFEITE = 4                                       # ADR-006 seção 2.2 (fixo)
ESTADO_DO_ENFEITE = "escondida"                            # ADR-006 seção 2.4 (fixo)
DIRECOES = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}
NOME_DIRECAO = {v: k for k, v in DIRECOES.items()}
BIT = {"cima": 1, "direita": 2, "baixo": 4, "esquerda": 8}  # ADR-011 seção 2.1
OPOSTO = {"cima": "baixo", "baixo": "cima", "esquerda": "direita", "direita": "esquerda"}
# Giro de 90° no sentido horário: cima vira direita, direita vira baixo, baixo vira esquerda, esquerda vira cima.
ROTACAO_DIRECAO = {"cima": "direita", "direita": "baixo", "baixo": "esquerda", "esquerda": "cima"}
ID_RE = re.compile(r"^[a-z0-9_]+$")
ID_PORTA_RE = re.compile(r"^[a-z0-9_]+(-[a-z0-9_]+)*$")
PROPS_PORTA = {"id", "trancadaAte"}
AMOSTRAS = 8          # 8 x 8 pontos por tile (regra 7 do conversor, colisão de móveis)
LIMIAR_PONTOS = 32    # de 64 pontos: pelo menos metade do tile
MASCARA_FLIP = 0xE0000000
# Constantes do conversor (ADR-011 seções 2.2 e 3.1): configuração, não do motor.
ESPESSURA_MAX = 12.0  # px; os dois lados do muro acima disto: E033
DISTANCIA_GRADE_MAX = 8.0   # px da linha central do muro à linha da grade
TOLERANCIA_PORTA = 12.0     # px do ponto da porta à aresta
FOLGA_PORTA = 2.0           # px: a mais próxima tem de vencer a segunda por isto
ORDEM_TIPOS = {"porta": 0, "spawn": 1, "interruptor": 2, "bilhete": 3, "arvore": 4,
               "examinavel": 5, "peca": 6, "enfeite": 7, "movel": 8}


class Erro(Exception):
    def __init__(self, codigo, msg):
        super().__init__(msg)
        self.codigo, self.msg = codigo, msg


class Coletor:
    """Acumula erros e avisos; nada é gravado se houver erro (contrato, seção 4.4)."""

    def __init__(self, arquivo):
        self.arquivo, self.erros, self.avisos = arquivo, [], []

    def erro(self, codigo, msg):
        self.erros.append(f"ERRO {codigo} {self.arquivo}: {msg}")

    def aviso(self, codigo, msg):
        self.avisos.append((codigo, msg))

    def avisos_ordenados(self):
        return sorted(set(self.avisos))

    def linhas_de_aviso(self):
        return [f"AVISO {c} {self.arquivo}: {m}" for c, m in self.avisos_ordenados()]


# ---------------------------------------------------------------- leitura do TMX

class Obj:
    def __init__(self, el):
        self.id = el.get("id")
        self.nome = el.get("name") or ""
        self.classe = el.get("class") or el.get("type") or ""
        self.x = float(el.get("x", 0))
        self.y = float(el.get("y", 0))
        self.w = float(el.get("width", 0))
        self.h = float(el.get("height", 0))
        self.rot = float(el.get("rotation", 0))
        self.ponto = el.find("point") is not None
        t = el.find("text")
        self.texto = (t.text or "").strip() if t is not None else None
        self.props = {}
        pr = el.find("properties")
        if pr is not None:
            for p in pr.findall("property"):
                tipo = p.get("type", "string")
                v = p.get("value", "")
                if tipo == "bool":
                    v = v == "true"
                elif tipo == "int":
                    v = int(v)
                self.props[p.get("name")] = v

    def tile(self, T):
        if self.w or self.h:
            return (math.floor((self.x + self.w / 2) / T), math.floor((self.y + self.h / 2) / T))
        return (math.floor(self.x / T), math.floor(self.y / T))

    def retangulo(self):
        """Caixa envolvente em px, com rotação em torno do canto superior esquerdo."""
        if self.rot % 360 == 0:
            return (self.x, self.y, self.x + self.w, self.y + self.h)
        th = math.radians(self.rot)
        c, s = math.cos(th), math.sin(th)
        ps = [(self.x + dx * c - dy * s, self.y + dx * s + dy * c)
              for dx, dy in [(0, 0), (self.w, 0), (0, self.h), (self.w, self.h)]]
        return (min(p[0] for p in ps), min(p[1] for p in ps), max(p[0] for p in ps), max(p[1] for p in ps))


def ler_tmx(caminho, perfil, col):
    """Lê o TMX na orientação do Diretor (não gira). Retorna (piso, grupos, primeiro_gid) ou None."""
    raiz = ET.parse(caminho).getroot()
    T = perfil["tile"]
    # A propriedade de mapa `planta` do TMX do Diretor é ignorada (ADR-011 seção 6).
    if raiz.get("orientation") != "orthogonal":
        col.erro("E000", "orientation deve ser orthogonal")
    tw, th = int(raiz.get("tilewidth", 0)), int(raiz.get("tileheight", 0))
    if tw != T or th != T:
        col.erro("E001", f"tilewidth {tw} / tileheight {th} ≠ perfil.tile {T} ({perfil['id']})")

    ts_list = raiz.findall("tileset")
    tiles = [t for t in ts_list if t.get("name") == "tiles_casa"]
    if len(tiles) != 1:
        col.erro("E002", "esperado um tileset 'tiles_casa' (embutido ou .tsx)")
        return None
    ts = tiles[0]
    primeiro = int(ts.get("firstgid", 1))
    contagem = ts.get("tilecount")
    if ts.get("source"):
        arq = (caminho.parent / ts.get("source")).resolve()
        if not arq.exists():
            col.erro("E002", f"tileset 'tiles_casa' aponta para {ts.get('source')}, que não existe")
            return None
        contagem = ET.parse(arq).getroot().get("tilecount")
    if contagem is None:
        col.erro("E002", "tileset 'tiles_casa' sem tilecount")
        return None
    contagem = int(contagem)
    for outro in ts_list:
        if outro is not ts:
            col.erro("E002", f"tileset extra '{outro.get('name') or outro.get('source')}': só 'tiles_casa' é aceito")

    camadas = raiz.findall("layer")
    if [c.get("name") for c in camadas] != [G_PISOS]:
        col.erro("E000", f"camadas de tile devem ser só '{G_PISOS}'")
        return None
    piso = {}
    dados = camadas[0].find("data")
    if dados is None or dados.get("encoding") != "csv":
        col.erro("E000", "camada 'Pisos' precisa de data encoding=csv (base64 não é aceito)")
        return None
    blocos = dados.findall("chunk")
    if blocos:
        for b in blocos:
            cx, cy, cw = int(b.get("x")), int(b.get("y")), int(b.get("width"))
            valores = [v for v in (b.text or "").replace("\n", "").split(",") if v.strip() != ""]
            for i, v in enumerate(valores):
                _guardar_gid(piso, cx + i % cw, cy + i // cw, int(v), primeiro, contagem, col)
    else:
        cw = int(camadas[0].get("width"))
        valores = [v for v in (dados.text or "").replace("\n", "").split(",") if v.strip() != ""]
        for i, v in enumerate(valores):
            _guardar_gid(piso, i % cw, i // cw, int(v), primeiro, contagem, col)

    grupos = {}
    for og in raiz.findall("objectgroup"):
        nome = og.get("name")
        if nome not in GRUPOS_CONHECIDOS:
            col.erro("E000", f"grupo de objetos '{nome}' não é previsto (contrato, seção 2.3)")
            continue
        grupos[nome] = [Obj(o) for o in og.findall("object")]
    for nome in GRUPOS_OBRIGATORIOS:
        if nome not in grupos:
            col.erro("E000", f"grupo '{nome}' não encontrado")
    grupos.setdefault(G_BLOQ, [])
    grupos.setdefault(G_JOGO, [])
    if not piso:
        col.erro("E016", f"grupo '{G_PISOS}' sem tiles")
    return piso, grupos, primeiro


def _guardar_gid(piso, x, y, gid, primeiro, contagem, col):
    if gid & MASCARA_FLIP:
        col.erro("E003", f"gid com flag de flip/rotação em ({x}, {y})")
        return
    if gid == 0:
        return
    if not (primeiro <= gid < primeiro + contagem):
        col.erro("E002", f"gid {gid} em ({x}, {y}) não está em 'tiles_casa' (firstgid {primeiro}, tilecount {contagem})")
        return
    piso[(x, y)] = gid


# ---------------------------------------------------------------- geometria

def vizinhos4(p):
    x, y = p
    return [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]


def somar(p, nome):
    dx, dy = DIRECOES[nome]
    return (p[0] + dx, p[1] + dy)


def componentes_por_gid(piso):
    """Componentes 4-conexas de mesmo gid (ADR-011 seção 1). Ordem estável: pelo primeiro tile (y, x)."""
    visto, saida = set(), []
    for p in sorted(piso, key=lambda p: (p[1], p[0])):
        if p in visto:
            continue
        gid = piso[p]
        fila, mem = deque([p]), []
        visto.add(p)
        while fila:
            q = fila.popleft()
            mem.append(q)
            for n in vizinhos4(q):
                if n in piso and n not in visto and piso[n] == gid:
                    visto.add(n)
                    fila.append(n)
        saida.append(frozenset(mem))
    return saida


# Aresta: ("h", x, y) = linha de grade y entre os tiles (x, y-1) e (x, y);
#         ("v", x, y) = linha de grade x entre os tiles (x-1, y) e (x, y).
def aresta_do_lado(t, lado):
    x, y = t
    return {"cima": ("h", x, y), "baixo": ("h", x, y + 1),
            "esquerda": ("v", x, y), "direita": ("v", x + 1, y)}[lado]


def tiles_da_aresta(e):
    """(tile de cima ou da esquerda, tile de baixo ou da direita)."""
    k, x, y = e
    return ((x, y - 1), (x, y)) if k == "h" else ((x - 1, y), (x, y))


def bloqueio_do_tile(retangulos, tile, T):
    """True se a união dos retângulos cobre pelo menos metade do tile (amostragem 8×8)."""
    tx, ty = tile
    n = 0
    for i in range(AMOSTRAS):
        for j in range(AMOSTRAS):
            px = tx * T + (i + 0.5) * T / AMOSTRAS
            py = ty * T + (j + 0.5) * T / AMOSTRAS
            if any(x0 <= px < x1 and y0 <= py < y1 for x0, y0, x1, y1 in retangulos):
                n += 1
    return n >= LIMIAR_PONTOS


def tiles_do_retangulo(r, T):
    x0, y0, x1, y1 = r
    return [(tx, ty) for ty in range(math.floor(y0 / T), math.ceil(y1 / T))
            for tx in range(math.floor(x0 / T), math.ceil(x1 / T))]


def slug(nome):
    """'Rack TV' -> 'rack_tv' (ASCII, minúsculas, [a-z0-9_])."""
    base = unicodedata.normalize("NFKD", nome).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "_", base).strip("_")


def moveis_por_area(grupos, T, dono, col):
    """Móveis nomeados: cada retângulo com texto em 'Objetos da casa bloqueantes' (opcional). Alinhado à
    grade e dentro do piso de uma única área (E020). Retorna {área: [(x, y, w, h, nome)]} em tiles do TMX."""
    saida = {}
    for o in grupos.get(G_BLOQ, []):
        if not o.texto:
            continue
        x0, y0, x1, y1 = o.retangulo()
        if any(v % T for v in (x0, y0, x1 - x0, y1 - y0)):
            col.erro("E020", f"móvel '{o.texto}' (id {o.id}): retângulo fora da grade de {T} px")
            continue
        donos = {dono.get(t) for t in tiles_do_retangulo((x0, y0, x1, y1), T)}
        if None in donos or len(donos) != 1:
            col.erro("E020", f"móvel '{o.texto}' (id {o.id}): tiles fora do piso ou em mais de uma área")
            continue
        saida.setdefault(donos.pop(), []).append((int(x0 // T), int(y0 // T),
                                                  int((x1 - x0) // T), int((y1 - y0) // T), o.texto))
    return saida


def calcular_bloqueio(grupos, T, col):
    """Retângulos de colisão e conjunto de tiles bloqueados pela união (regra 7; grupo opcional)."""
    retangulos = []
    for o in grupos.get(G_BLOQ, []):
        if o.rot % 90 > 1 and o.rot % 90 < 89:
            col.erro("E012", f"objeto {o.id}: rotação {o.rot:g}°")
            continue
        retangulos.append((o.id, o.texto, o.retangulo()))
    for oid, texto, r in retangulos:
        if not any(bloqueio_do_tile([r], t, T) for t in tiles_do_retangulo(r, T)):
            col.erro("E011", f"'{texto or ''}' (id {oid}): 0 tiles pela regra de 50%")
    bloqueado = set()
    rects = [r for _, _, r in retangulos]
    for t in {t for r in rects for t in tiles_do_retangulo(r, T)}:
        if bloqueio_do_tile(rects, t, T):
            bloqueado.add(t)
    return bloqueado


# ---------------------------------------------------------------- muros por aresta (ADR-011 seção 2.2)

def muro_para_arestas(o, T, col):
    """Retorna o conjunto de arestas que o muro bloqueia (cobertura de T/2, linha a até 8 px da grade).
    Erros E033 (forma, espessura, fora da grade) devolvem None."""
    rotulo = f"muro {o.id}"
    if o.rot % 360 != 0:
        col.erro("E033", f"{rotulo}: rotação {o.rot:g}°; muro rotacionado não é aceito")
        return None
    w, h = round(o.w, 2), round(o.h, 2)
    if w > ESPESSURA_MAX and h > ESPESSURA_MAX:
        col.erro("E033", f"{rotulo}: {w:g}×{h:g} px; a espessura passa de {ESPESSURA_MAX:g} px nos dois lados")
        return None
    if w == h:
        return set()                                   # menos de 16 px de comprimento: sem aresta (W034)
    horizontal = w > h
    ac = (o.y + o.h / 2) if horizontal else (o.x + o.w / 2)       # linha central
    k = math.floor(ac / T + 0.5)
    d = abs(ac - k * T)
    if round(d, 2) > DISTANCIA_GRADE_MAX:
        col.erro("E033", f"{rotulo}: linha central a {d:.2f} px da grade; o máximo é {DISTANCIA_GRADE_MAX:g} px")
        return None
    ini, fim = (o.x, o.x + o.w) if horizontal else (o.y, o.y + o.h)
    arestas = set()
    for c in range(math.floor(ini / T), math.ceil(fim / T)):
        dentro = min(fim, (c + 1) * T) - max(ini, c * T)
        if round(dentro, 2) >= T / 2:
            arestas.add(("h", c, k) if horizontal else ("v", k, c))
    return arestas


# ---------------------------------------------------------------- máscara, giro, desenho (funções puras)

def girar_mascara(m):
    """Rotação de bits de 90° horário: cima vira direita, direita baixo, baixo esquerda, esquerda cima."""
    return ((m << 1) | (m >> 3)) & 15


def girar_area(doc):
    """Gira o documento de uma área 90° no sentido horário: (x, y) -> (altura − 1 − y, x) (ADR-011 seção 2.5).
    Gira chao, colisao, paredes, objetos (x, y, lado, direcao, w, h). A tela não gira."""
    w, h = doc["largura"], doc["altura"]
    novo = dict(doc)
    novo["largura"], novo["altura"] = h, w

    def girar_lista(lista, f=lambda v: v):
        saida = [0] * (w * h)
        for y in range(h):
            for x in range(w):
                saida[x * h + (h - 1 - y)] = f(lista[y * w + x])
        return saida

    novo["chao"] = girar_lista(doc["chao"])
    novo["colisao"] = girar_lista(doc["colisao"])
    novo["paredes"] = girar_lista(doc["paredes"], girar_mascara)
    objs = []
    for o in doc["objetos"]:
        o2 = dict(o)
        if o["tipo"] == "movel":
            o2["x"], o2["y"] = h - o["y"] - o["h"], o["x"]
            o2["w"], o2["h"] = o["h"], o["w"]
        else:
            o2["x"], o2["y"] = h - 1 - o["y"], o["x"]
        for campo in ("lado", "direcao"):
            if campo in o2:
                o2[campo] = ROTACAO_DIRECAO[o2[campo]]
        objs.append(o2)
    novo["objetos"] = ordenar_objetos(objs)
    return novo


def ordenar_objetos(objs):
    return sorted(objs, key=lambda o: (ORDEM_TIPOS[o["tipo"]], str(o.get("id") or o.get("nome") or ""), o["y"], o["x"]))


def ha_parede(doc, x, y, lado):
    """Bit do lado em paredes (tile dentro da caixa)."""
    return bool(doc["paredes"][y * doc["largura"] + x] & BIT[lado])


def conexidade(doc):
    """Partes de tiles livres (chao > 0, colisao 0) ligadas pelas arestas abertas. Retorna lista de listas
    de tiles, a maior primeiro (E036 quando há mais de uma)."""
    w, h = doc["largura"], doc["altura"]
    livre = {(i % w, i // w) for i in range(w * h) if doc["chao"][i] > 0 and doc["colisao"][i] == 0}
    visto, partes = set(), []
    for p in sorted(livre, key=lambda p: (p[1], p[0])):
        if p in visto:
            continue
        parte, fila = [], deque([p])
        visto.add(p)
        while fila:
            q = fila.popleft()
            parte.append(q)
            for lado in DIRECOES:
                n = somar(q, lado)
                if n in livre and n not in visto and not ha_parede(doc, q[0], q[1], lado):
                    visto.add(n)
                    fila.append(n)
        partes.append(sorted(parte, key=lambda p: (p[1], p[0])))
    partes.sort(key=lambda parte: (-len(parte), parte[0][1], parte[0][0]))
    return partes


def desenhar(doc):
    """Grade dupla (ADR-011 seção 6): 2·altura+1 linhas por 2·largura+1 colunas. Tiles nas posições ímpares;
    arestas nas mistas (`-` ou `|` parede, `D` porta, espaço aberta); vértices `+` se alguma aresta encostada
    é parede ou porta."""
    w, h = doc["largura"], doc["altura"]
    simbolo = {"spawn": "S", "interruptor": "I", "bilhete": "B", "arvore": "A", "examinavel": "E", "enfeite": "C"}
    marcas, portas = {}, []
    for o in doc["objetos"]:
        if o["tipo"] == "movel":
            continue
        if o["tipo"] == "porta":
            portas.append(o)
        elif o["tipo"] == "peca":
            marcas[(o["x"], o["y"])] = str(o["ordem"])
        else:
            marcas[(o["x"], o["y"])] = simbolo[o["tipo"]]
    g = [[" "] * (2 * w + 1) for _ in range(2 * h + 1)]
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if (x, y) in marcas:
                c = marcas[(x, y)]
            elif doc["chao"][i] == 0:
                c = " "
            elif doc["colisao"][i]:
                c = "#"
            else:
                c = "."
            g[2 * y + 1][2 * x + 1] = c
            if doc["chao"][i] == 0:
                continue
            m = doc["paredes"][i]
            if m & BIT["cima"]:
                g[2 * y][2 * x + 1] = "-"
            if m & BIT["baixo"]:
                g[2 * y + 2][2 * x + 1] = "-"
            if m & BIT["esquerda"]:
                g[2 * y + 1][2 * x] = "|"
            if m & BIT["direita"]:
                g[2 * y + 1][2 * x + 2] = "|"
    for o in portas:
        x, y = o["x"], o["y"]
        if o["lado"] == "cima":
            g[2 * y][2 * x + 1] = "D"
        elif o["lado"] == "baixo":
            g[2 * y + 2][2 * x + 1] = "D"
        elif o["lado"] == "esquerda":
            g[2 * y + 1][2 * x] = "D"
        else:
            g[2 * y + 1][2 * x + 2] = "D"
    for r in range(0, 2 * h + 1, 2):
        for c in range(0, 2 * w + 1, 2):
            viz = []
            if r > 0:
                viz.append(g[r - 1][c])
            if r < 2 * h:
                viz.append(g[r + 1][c])
            if c > 0:
                viz.append(g[r][c - 1])
            if c < 2 * w:
                viz.append(g[r][c + 1])
            if any(v in "-|D" for v in viz):
                g[r][c] = "+"
    return ["".join(linha).rstrip() for linha in g]


# ---------------------------------------------------------------- conversão

def converter(caminho, perfil, col, girar=False):
    lido = ler_tmx(caminho, perfil, col)
    if lido is None or col.erros:
        return None
    piso, grupos, primeiro = lido
    T = perfil["tile"]
    tela_c, tela_l = perfil["sala"]["colunas"], perfil["sala"]["linhas"]
    bloqueado = calcular_bloqueio(grupos, T, col)
    if col.erros:
        return None

    # 1. áreas por gid (ADR-011 seção 1) e 2. rótulos
    comps = componentes_por_gid(piso)
    subs = [{"comp": m, "id": None, "escuro": False} for m in comps]
    dono = {}
    for i, s in enumerate(subs):
        for p in s["comp"]:
            dono[p] = i
    rotulos_por_comp, ids_vistos = {}, set()
    for o in grupos.get(G_ROTULOS, []):
        ident = o.props.get("id")
        if not isinstance(ident, str) or not ID_RE.match(ident):
            col.erro("E005", f"rótulo '{o.texto}' (id {o.id}): id ausente ou fora de [a-z0-9_]+")
            continue
        if ident in ids_vistos:
            col.erro("E005", f"id '{ident}' repetido")
        ids_vistos.add(ident)
        if "escuro" in o.props and not isinstance(o.props["escuro"], bool):
            col.erro("E005", f"rótulo '{ident}': escuro não é booleano")
        t = o.tile(T)
        if t not in dono:
            col.erro("E004", f"rótulo '{ident}' ({o.texto}) fora do piso")
            continue
        rotulos_por_comp.setdefault(dono[t], []).append((ident, bool(o.props.get("escuro", False))))
    for i, s in enumerate(subs):
        lst = rotulos_por_comp.get(i, [])
        nomes = sorted(x[0] for x in lst)
        if len(lst) != 1:
            col.erro("E004", f"área de gid {piso[min(s['comp'], key=lambda p: (p[1], p[0]))]} com primeiro tile "
                             f"{min(s['comp'], key=lambda p: (p[1], p[0]))}: {len(lst)} rótulos "
                             f"({', '.join(nomes) or 'nenhum'}); esperado 1")
            continue
        s["id"], s["escuro"] = lst[0]
    if col.erros:
        return None
    ids = [s["id"] for s in subs]

    def borda(t, lado):
        """True se a aresta do lado de t (tile de piso) é fronteira: o vizinho não é piso da mesma área."""
        return dono.get(somar(t, lado)) != dono.get(t)

    # 4. muros -> arestas (seção 2.2)
    muros = []                                         # (objeto, arestas)
    for o in grupos.get(G_MUROS, []):
        if o.ponto or o.texto:
            col.erro("E033", f"muro {o.id}: o grupo '{G_MUROS}' só aceita retângulos sem texto")
            continue
        arestas = muro_para_arestas(o, T, col)
        if arestas is not None:
            muros.append((o, arestas))
    if col.erros:
        return None

    def classe(e):
        a, b = tiles_da_aresta(e)
        if a in dono and b in dono:
            return "interna" if dono[a] == dono[b] else "fronteira"
        if a in dono or b in dono:
            return "exterior"
        return "vazia"

    arestas_de_muro = set()
    for o, arestas in muros:
        arestas_de_muro |= arestas
        util = [e for e in arestas if classe(e) != "vazia"]
        if not util:
            col.aviso("W034", f"muro {o.id} ({o.x:.1f}, {o.y:.1f}, {o.w:.1f}×{o.h:.1f}): "
                              f"nenhuma aresta de piso bloqueada (curto demais ou só sobre aresta vazia)")

    # 5. portas por ponto (seção 3.1)
    portas = []        # dicts: id, aresta, a, b, sa, sb, trancada
    for o in grupos.get(G_PORTAS, []):
        if o.texto:
            col.aviso("W003", f"texto '{o.texto}' em '{G_PORTAS}' ignorado (a porta é um ponto; ADR-011 seção 3.1)")
            continue
        if not o.ponto:
            continue                                   # retângulo sem texto: batente visual, ignorado
        desconhecidas = sorted(set(o.props) - PROPS_PORTA)
        if desconhecidas:
            col.erro("E014", f"porta {o.id}: propriedade(s) desconhecida(s) {', '.join(desconhecidas)}")
            continue
        tx, ty = math.floor(o.x / T), math.floor(o.y / T)
        cands = []
        for lado, dist in (("cima", o.y - ty * T), ("baixo", (ty + 1) * T - o.y),
                           ("esquerda", o.x - tx * T), ("direita", (tx + 1) * T - o.x)):
            if round(dist, 2) > TOLERANCIA_PORTA:
                continue
            e = aresta_do_lado((tx, ty), lado)
            a, b = tiles_da_aresta(e)
            if a in dono and b in dono and dono[a] != dono[b]:
                cands.append((dist, e))
        if not cands:
            col.erro("E030", f"porta {o.id} em ({o.x:.1f}, {o.y:.1f}): nenhuma aresta entre duas áreas a até "
                             f"{TOLERANCIA_PORTA:g} px")
            continue
        cands.sort(key=lambda c: (c[0], c[1]))
        if len(cands) > 1 and round(cands[1][0] - cands[0][0], 2) < FOLGA_PORTA:
            col.erro("E030", f"porta {o.id} em ({o.x:.1f}, {o.y:.1f}): ambígua, duas arestas a "
                             f"{cands[0][0]:.1f} e {cands[1][0]:.1f} px")
            continue
        e = cands[0][1]
        a, b = tiles_da_aresta(e)
        sa, sb = dono[a], dono[b]
        ident = o.props.get("id")
        if ident is None:
            ident = "-".join(sorted([ids[sa], ids[sb]]))
        elif not isinstance(ident, str) or not ID_PORTA_RE.match(ident):
            col.erro("E014", f"porta {o.id}: id '{ident}' fora do padrão [a-z0-9_]+(-[a-z0-9_]+)*")
            continue
        trancada = o.props.get("trancadaAte")
        if trancada is not None and (not isinstance(trancada, str) or not trancada):
            col.erro("E014", f"porta {ident}: trancadaAte vazio")
            continue
        portas.append({"id": ident, "aresta": e, "a": a, "b": b, "sa": sa, "sb": sb, "trancada": trancada})
    vistos_id, vistas_aresta = {}, {}
    for p in portas:
        if p["id"] in vistos_id:
            col.erro("E031", f"id de porta '{p['id']}' repetido; dê a propriedade 'id' a uma das portas")
        vistos_id[p["id"]] = p
        if p["aresta"] in vistas_aresta:
            col.erro("E031", f"duas portas na mesma aresta ({vistas_aresta[p['aresta']]} e {p['id']})")
        vistas_aresta[p["aresta"]] = p["id"]
        if p["aresta"] in arestas_de_muro:
            col.erro("E032", f"porta '{p['id']}': há muro sobre a aresta da porta; ela tem de ficar numa abertura")
        for t in (p["a"], p["b"]):
            if t in bloqueado:
                col.erro("E009", f"porta '{p['id']}': o tile {t} é bloqueado (móvel); a porta pede piso livre")
    if col.erros:
        return None
    arestas_de_porta = {p["aresta"] for p in portas}
    portas_por_tile = {}                               # (área, tile) -> [(id, lado)]
    for p in portas:
        lado_a = NOME_DIRECAO[(p["b"][0] - p["a"][0], p["b"][1] - p["a"][1])]
        p["lado_a"], p["lado_b"] = lado_a, OPOSTO[lado_a]
        portas_por_tile.setdefault((p["sa"], p["a"]), []).append((p["id"], lado_a))
        portas_por_tile.setdefault((p["sb"], p["b"]), []).append((p["id"], OPOSTO[lado_a]))
    tiles_de_porta = set(portas_por_tile)

    def parede(t, lado):
        """Aresta do lado de t é parede: fronteira (outra área ou vazio) ou muro interno."""
        return borda(t, lado) or aresta_do_lado(t, lado) in arestas_de_muro

    # fronteira sem muro desenhado (seção 2.3): um aviso por par de áreas
    sem_muro = {}                                      # (id1, id2) -> [(tile da área de menor id, aresta)]
    por_area_sem_muro = {i: 0 for i in range(len(subs))}
    for t in sorted(piso, key=lambda p: (p[1], p[0])):
        for lado in ("direita", "baixo"):
            n = somar(t, lado)
            if n not in dono or dono[n] == dono[t]:
                continue
            e = aresta_do_lado(t, lado)
            if e in arestas_de_porta or e in arestas_de_muro:
                continue
            par = tuple(sorted([ids[dono[t]], ids[dono[n]]]))
            sem_muro.setdefault(par, []).append(t)
            por_area_sem_muro[dono[t]] += 1
            por_area_sem_muro[dono[n]] += 1
    for par, lst in sorted(sem_muro.items()):
        col.aviso("W035", f"fronteira {par[0]}|{par[1]} sem muro desenhado em {len(lst)} aresta(s), primeiro tile "
                          f"{lst[0]} (TMX); é parede mesmo assim")

    # 3. caixa de cada área (só piso)
    caixas = []
    for s in subs:
        x0 = min(p[0] for p in s["comp"]); x1 = max(p[0] for p in s["comp"])
        y0 = min(p[1] for p in s["comp"]); y1 = max(p[1] for p in s["comp"])
        caixas.append((x0, y0, x1 - x0 + 1, y1 - y0 + 1))

    # 7. objetos de jogo
    jogo = grupos.get(G_JOGO, [])
    arvores, lidos = set(), []
    reservados = {}
    nomes_spawn = {}
    for o in jogo:
        if o.classe not in CLASSES_JOGO:
            col.erro("E014", f"objeto {o.id} ({o.nome or o.texto}): classe '{o.classe}' desconhecida")
            continue
        t = o.tile(T)
        if t not in dono:
            col.erro("E010", f"{o.classe} {o.nome or o.texto or o.id} em {t}: fora do piso")
            continue
        if o.w > T or o.h > T or (o.w and not (2 <= (o.x + o.w / 2) % T <= T - 2)):
            col.erro("E013", f"{o.classe} {o.nome or o.id}: retângulo maior que um tile ou centro a menos de 2 px da borda")
            continue
        sub = dono[t]
        if (sub, t) in tiles_de_porta and o.classe != "bilhete":       # o bilhete pode ficar no tile da porta (E037 se o lado for a porta)
            col.erro("E010", f"{o.classe} {o.nome or o.id} em {t}: sobre o tile de uma porta")
            continue
        if (sub, t) in reservados:
            col.erro("E015", f"dois objetos no tile {t} de '{ids[sub]}'")
            continue
        reservados[(sub, t)] = o.classe
        lidos.append((o, sub, t))
    if col.erros:
        return None

    # tiles que não são "vizinho livre" (ADR-011 seção 5.5): porta, spawn, interruptor, examinável, árvore, peça visível
    ocupados = set(tiles_de_porta)
    for o, sub, t in lidos:
        if o.classe in ("spawn", "interruptor", "examinavel", "arvore"):
            ocupados.add((sub, t))
        if o.classe == "peca" and o.props.get("estadoInicial") == "visivel":
            ocupados.add((sub, t))
        if o.classe == "arvore":
            arvores.add(t)

    def livres_alcancaveis(t, sub):
        r = []
        for lado in DIRECOES:
            n = somar(t, lado)
            if dono.get(n) == sub and n not in bloqueado and n not in arvores and (sub, n) not in ocupados \
                    and not parede(t, lado):
                r.append(n)
        return r

    objetos_por_sub = {i: [] for i in range(len(subs))}
    pecas_lidas, enfeites_lidos, interruptores = [], [], set()
    for o, sub, t in lidos:
        cl = o.classe
        livre = t not in bloqueado
        if cl == "spawn":
            direcao = o.props.get("direcao")
            if not o.nome or direcao not in DIRECOES:
                col.erro("E014", f"spawn '{o.nome}' em {t}: nome ou direcao inválida")
                continue
            if not livre:
                col.erro("E010", f"spawn '{o.nome}' em {t} não é piso livre")
                continue
            nomes_spawn[(sub, o.nome)] = nomes_spawn.get((sub, o.nome), 0) + 1
            objetos_por_sub[sub].append({"tipo": "spawn", "nome": o.nome, "x": t[0], "y": t[1], "direcao": direcao})
        elif cl == "interruptor":
            if not livre:
                col.erro("E010", f"interruptor em {t} sobre bloqueio")
                continue
            interruptores.add((sub, t))
            objetos_por_sub[sub].append({"tipo": "interruptor", "x": t[0], "y": t[1]})
        elif cl == "bilhete":
            if not o.props.get("texto") or "lado" not in o.props:
                col.erro("E014", f"bilhete em {t}: 'texto' e 'lado' são obrigatórios")
                continue
            lado = o.props["lado"]
            if lado not in DIRECOES:
                col.erro("E037", f"bilhete em {t}: lado '{lado}' inválido")
                continue
            if not livre:
                col.erro("E037", f"bilhete em {t}: o tile deve ser livre (piso, sem bloqueio)")
                continue
            if not parede(t, lado) or aresta_do_lado(t, lado) in arestas_de_porta:
                col.erro("E037", f"bilhete em {t}: a aresta do lado '{lado}' deve ser parede e não pode ser de porta")
                continue
            objetos_por_sub[sub].append({"tipo": "bilhete", "x": t[0], "y": t[1], "lado": lado, "texto": o.props["texto"]})
        elif cl == "arvore":
            if not o.props.get("estado"):
                col.erro("E014", "arvore sem 'estado'")
                continue
            objetos_por_sub[sub].append({"tipo": "arvore", "x": t[0], "y": t[1], "estado": o.props["estado"]})
        elif cl == "examinavel":
            if not o.props.get("texto"):
                col.erro("E014", f"examinável em {t} sem 'texto'")
                continue
            if livre or not livres_alcancaveis(t, sub):
                col.erro("E010", f"examinável em {t}: exige tile bloqueado com vizinho livre alcançável pelas arestas abertas")
                continue
            objetos_por_sub[sub].append({"tipo": "examinavel", "x": t[0], "y": t[1], "texto": o.props["texto"]})
        elif cl == "peca":
            try:
                ordem = int(o.texto)
            except (TypeError, ValueError):
                ordem = None
            if ordem not in (1, 2, 3):
                col.erro("E014", f"peça em {t}: texto '{o.texto}' não é ordem 1, 2 ou 3")
                continue
            estado = o.props.get("estadoInicial")
            if estado not in ESTADOS_PECA:
                col.erro("E014", f"peça {ordem} em {t}: estadoInicial ausente ou fora de visivel/escondida")
                continue
            if not livre:
                col.erro("E010", f"peça {ordem} em {t}: exige piso livre, não bloqueio")
                continue
            pecas_lidas.append((ordem, sub, t, estado))
        elif cl == "enfeite":
            enfeites_lidos.append((sub, t))
    if col.erros:
        return None

    vazio = not jogo
    if vazio:
        col.aviso("W038", f"grupo '{G_JOGO}' vazio: peças (E021) e caixa de enfeite (E029) não conferidas "
                          f"(objetos de jogo pendentes, backlog 164)")
    ordens = [p[0] for p in pecas_lidas]
    if not vazio:
        for ordem in sorted(set(ordens)):
            if ordens.count(ordem) > 1:
                col.erro("E021", f"peça {ordem} aparece {ordens.count(ordem)} vezes")
        # 1.3.0 (ADR-013): as peças são sorteadas pelo motor a cada partida; o TMX pode ter zero peças. Com alguma, têm de ser as 3.
        faltam = sorted({1, 2, 3} - set(ordens))
        if ordens and faltam:
            col.erro("E021", f"peças ausentes: {faltam}; ou nenhuma peça (sorteio do motor, ADR-013) ou 1, 2 e 3 (cada uma uma vez)")
        # 1.3.0 (ADR-013, adendo): a caixa é sorteada pelo motor; o TMX pode ter zero. Com mais de uma, é erro.
        if len(enfeites_lidos) > 1:
            col.erro("E029", f"caixa de enfeite: no máximo 1 (classe 'enfeite'; zero = sorteio do motor), há {len(enfeites_lidos)}")
    for ordem, sub, t, estado in pecas_lidas:
        esperado = "visivel" if ordem == 1 else "escondida"
        if estado != esperado:
            col.erro("E022", f"peça {ordem}: estadoInicial '{estado}', esperado '{esperado}'")
        if any((sub, n) in interruptores for n in [t] + vizinhos4(t)):
            col.erro("E023", f"peça {ordem} em {t} encosta no interruptor (mesma área)")
        if not livres_alcancaveis(t, sub):
            col.erro("E010", f"peça {ordem} em {t}: sem vizinho livre alcançável pelas arestas abertas")
            continue
        objetos_por_sub[sub].append({"tipo": "peca", "id": f"peca{ordem}", "ordem": ordem,
                                     "estadoInicial": estado, "x": t[0], "y": t[1]})
    pecas_t = {(sub, t) for _, sub, t, _ in pecas_lidas}
    for sub, t in enfeites_lidos:
        vizl = [n for n in livres_alcancaveis(t, sub) if (sub, n) not in pecas_t]
        if len(vizl) < 2:
            col.erro("E010", f"enfeite em {t}: exige piso livre com 2 vizinhos livres alcançáveis; há {len(vizl)}")
            continue
        objetos_por_sub[sub].append({"tipo": "enfeite", "id": "enfeite", "ordem": ORDEM_DO_ENFEITE,
                                     "estadoInicial": ESTADO_DO_ENFEITE, "x": t[0], "y": t[1]})
    if col.erros:
        return None
    moveis = moveis_por_area(grupos, T, dono, col)
    if col.erros:
        return None

    # portas e spawns de chegada nas duas áreas (seção 3.2)
    for p in portas:
        for sub, t, lado, outro, t_outro, lado_outro in ((p["sa"], p["a"], p["lado_a"], p["sb"], p["b"], p["lado_b"]),
                                                          (p["sb"], p["b"], p["lado_b"], p["sa"], p["a"], p["lado_a"])):
            obj = {"tipo": "porta", "id": p["id"], "x": t[0], "y": t[1], "lado": lado,
                   "destino": ids[outro], "spawnDestino": p["id"]}
            if p["trancada"]:
                obj["trancadaAte"] = p["trancada"]
            objetos_por_sub[sub].append(obj)
            # chegada: quem vem do outro lado aparece no tile da porta daqui, andando para dentro
            if nomes_spawn.get((sub, p["id"])):
                col.erro("E015", f"spawn '{p['id']}' repetido em '{ids[sub]}'")
            nomes_spawn[(sub, p["id"])] = 1
            objetos_por_sub[sub].append({"tipo": "spawn", "nome": p["id"], "x": t[0], "y": t[1],
                                         "direcao": OPOSTO[lado]})
    if col.erros:
        return None
    # árvore: o tile vira bloqueio
    bloqueado = bloqueado | arvores

    # montagem (orientação do TMX)
    docs = []
    for i, s in enumerate(subs):
        bx, by, w, h = caixas[i]
        chao, colisao, paredes = [], [], []
        contagem = {"piso": 0, "livres": 0, "bloqueadosComPiso": 0, "semPiso": 0}
        outras = 0
        primeira_outra = None
        for j in range(h):
            for k in range(w):
                p = (bx + k, by + j)
                tem = dono.get(p) == i
                if p in piso and not tem:
                    outras += 1
                    primeira_outra = primeira_outra or p
                if tem:
                    chao.append(piso[p] - primeiro + 1); contagem["piso"] += 1
                    if p in bloqueado:
                        colisao.append(1); contagem["bloqueadosComPiso"] += 1
                    else:
                        colisao.append(0); contagem["livres"] += 1
                    m = 0
                    for lado in DIRECOES:
                        if parede(p, lado):
                            m |= BIT[lado]
                    paredes.append(m)
                else:
                    chao.append(0); colisao.append(1); paredes.append(0)
                    contagem["semPiso"] += 1
        if outras:
            col.aviso("W001", f"{s['id']}: {outras} tile(s) de piso de outra área dentro da caixa (viram sem piso); "
                              f"primeiro em {primeira_outra} (TMX)")
        objs = []
        for o in objetos_por_sub[i]:
            o2 = dict(o)
            o2["x"] -= bx; o2["y"] -= by
            objs.append(o2)
        usados = {}
        for mx, my, mw, mh, nome in sorted(moveis.get(i, []), key=lambda m: (m[1], m[0], m[4])):
            base = slug(nome) or "movel"
            usados[base] = usados.get(base, 0) + 1
            ident = base if usados[base] == 1 else f"{base}_{usados[base]}"
            objs.append({"tipo": "movel", "id": ident, "nome": nome,
                         "x": mx - bx, "y": my - by, "w": mw, "h": mh})
        doc = {"altura": h, "chao": chao, "colisao": colisao, "escuro": s["escuro"], "id": s["id"],
               "largura": w, "objetos": ordenar_objetos(objs), "paredes": paredes,
               "schemaVersion": SCHEMA_VERSION, "tile": T}
        # E036 (a conexidade não muda com o giro)
        partes = conexidade(doc)
        if len(partes) > 1:
            iso = partes[1]
            col.erro("E036", f"área '{s['id']}' não é conexa pelas arestas abertas: {len(partes)} partes; "
                             f"a parte isolada começa em {(iso[0][0] + bx, iso[0][1] + by)} (TMX), {len(iso)} tile(s)")
        docs.append((doc, contagem, (bx, by)))
    if col.erros:
        return None

    # 9. giro (só na saída) e conferências sobre a área já girada
    x0m = min(p[0] for p in piso); y0m = min(p[1] for p in piso)
    resultado = {"subareas": [], "rotacao": 90 if girar else 0}
    if girar:
        resultado["origemDaCasa"] = [-max(p[1] for p in piso) - 1, x0m]
    else:
        resultado["origemDaCasa"] = [x0m, y0m]
    for i, (doc, contagem, (bx, by)) in enumerate(docs):
        s = subs[i]
        w0, h0 = doc["largura"], doc["altura"]
        if girar:
            doc = girar_area(doc)
            desloc = [-(by + h0 - 1) - 1, bx]
        else:
            desloc = [bx, by]
        w, h = doc["largura"], doc["altura"]
        if w > tela_c or h > tela_l:
            col.erro("E006", f"área '{s['id']}': caixa {w}×{h} > tela {tela_c}×{tela_l}")
            continue
        texto = json.dumps(doc, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        contagem = dict(contagem)
        contagem["objetos"] = {}
        for o in doc["objetos"]:
            contagem["objetos"][o["tipo"]] = contagem["objetos"].get(o["tipo"], 0) + 1
        internas = fronteiras = 0
        for y in range(h):
            for x in range(w):
                i_ = y * w + x
                if doc["chao"][i_] == 0:
                    continue
                m = doc["paredes"][i_]
                for lado in ("direita", "baixo"):
                    nx, ny = somar((x, y), lado)
                    viz_piso = 0 <= nx < w and 0 <= ny < h and doc["chao"][ny * w + nx] > 0
                    if viz_piso and m & BIT[lado]:
                        internas += 1
                for lado in DIRECOES:
                    nx, ny = somar((x, y), lado)
                    viz_piso = 0 <= nx < w and 0 <= ny < h and doc["chao"][ny * w + nx] > 0
                    if not viz_piso and m & BIT[lado]:
                        fronteiras += 1
        contagem["arestasInternas"] = internas
        contagem["arestasDeFronteira"] = fronteiras
        contagem["fronteirasSemMuro"] = por_area_sem_muro[i]
        resultado["subareas"].append({
            "id": s["id"], "doc": doc, "texto": texto, "grade": desenhar(doc),
            "deslocamento": desloc, "largura": w, "altura": h,
            "deslocamentoNaTela": [(tela_c - w) // 2, (tela_l - h) // 2],
            "escuro": s["escuro"], "contagens": contagem,
            "portas": [{"id": o["id"], "tile": [o["x"], o["y"]], "lado": o["lado"], "destino": o["destino"]}
                       for o in doc["objetos"] if o["tipo"] == "porta"],
            "sha256": hashlib.sha256(texto.encode("utf-8")).hexdigest(),
        })
    if col.erros:
        return None
    # linha da barra (item 6 do ADR-004 seção 8; E018/E019), sobre a área já girada
    for s in resultado["subareas"]:
        ls = tela_l - 1 - s["deslocamentoNaTela"][1]
        if not (0 <= ls < s["altura"]):
            continue
        for k in range(s["largura"]):
            i_ = ls * s["largura"] + k
            if s["doc"]["chao"][i_] != 0 and s["doc"]["colisao"][i_] == 0:
                col.erro("E018", f"área '{s['id']}': chão andável em ({k}, {ls}), linha {tela_l - 1} da tela; a barra cobre essa linha")
        for o in s["doc"]["objetos"]:
            if o["y"] == ls:
                col.erro("E019", f"área '{s['id']}': {o['tipo']} em ({o['x']}, {ls}), linha {tela_l - 1} da tela; a barra cobre essa linha")
    if col.erros:
        return None
    resultado["subareas"].sort(key=lambda s: s["id"])
    resultado["avisos"] = [f"{c} {m}" for c, m in col.avisos_ordenados()]
    return resultado


# ---------------------------------------------------------------- saída

def carregar_perfil(identificador):
    caminho = PERFIS / f"{identificador}.json"
    if not caminho.exists():
        raise Erro("E001", f"perfil '{identificador}' não encontrado em {caminho}")
    return json.loads(caminho.read_text(encoding="utf-8"))


def texto_do_resumo(resultado):
    resumo = {
        "origemDaCasa": resultado["origemDaCasa"],
        "rotacao": resultado["rotacao"],
        "subareas": [{k: v for k, v in s.items() if k in ("id", "deslocamento", "largura", "altura",
                                                           "deslocamentoNaTela", "escuro", "contagens",
                                                           "portas", "sha256")}
                     for s in resultado["subareas"]],
        "avisos": resultado["avisos"],
    }
    return json.dumps(resumo, indent=2, sort_keys=True, ensure_ascii=False) + "\n"


def texto_do_manifesto(resultado, manifesto=MANIFESTO):
    """Só `maps[]`, só entradas cujo file começa com maps/casa-real/ (ADR-011 seção 4). As existentes mantêm a
    posição e as chaves extras (ex.: `decoracao`); as novas vão ao fim, por id; as que sumiram saem."""
    m = json.loads(manifesto.read_text(encoding="utf-8"))
    ids = {s["id"] for s in resultado["subareas"]}
    novos = []
    existentes = set()
    for e in m.get("maps", []):
        if e["file"].startswith("maps/casa-real/"):
            if e["id"] not in ids:
                continue
            existentes.add(e["id"])
            e = dict(e)
            e.update({"file": f"maps/casa-real/{e['id']}.json", "tileset": "tiles_casa"})
        novos.append(e)
    for i in sorted(ids - existentes):
        novos.append({"id": i, "file": f"maps/casa-real/{i}.json", "tileset": "tiles_casa"})
    m["maps"] = novos
    return json.dumps(m, indent=2, ensure_ascii=False) + "\n"


def gravar_ou_comparar(resultado, verificar, golden, saida=SAIDA_CONTEUDO, pasta_golden=GOLDEN, manifesto=MANIFESTO):
    diffs = []
    gerados = {f"{s['id']}.json" for s in resultado["subareas"]}
    sobras = sorted(p for p in saida.glob("*.json") if p.name not in gerados) if saida.exists() else []
    manifesto_novo = texto_do_manifesto(resultado, manifesto) if manifesto.exists() else None
    for s in resultado["subareas"]:
        arq = saida / f"{s['id']}.json"
        if verificar:
            atual = arq.read_text(encoding="utf-8") if arq.exists() else None
            if atual != s["texto"]:
                diffs.append(f"ERRO E017 {arq}: difere do gerado")
        else:
            saida.mkdir(parents=True, exist_ok=True)
            arq.write_text(s["texto"], encoding="utf-8")
    for arq in sobras:
        if verificar:
            diffs.append(f"ERRO E017 {arq}: não corresponde a nenhuma área da planta")
        else:
            print(f"AVISO removido {arq}: não corresponde a nenhuma área da planta")
            arq.unlink()
    if manifesto_novo is not None:
        if verificar:
            if manifesto.read_text(encoding="utf-8") != manifesto_novo:
                diffs.append(f"ERRO E017 {manifesto}: maps[] difere do gerado")
        else:
            manifesto.write_text(manifesto_novo, encoding="utf-8")
    if verificar or golden:
        txt_resumo = texto_do_resumo(resultado)
        if verificar:
            arq = pasta_golden / "resumo.json"
            if not arq.exists() or arq.read_text(encoding="utf-8") != txt_resumo:
                diffs.append(f"ERRO E017 {arq}: difere do golden")
            for s in resultado["subareas"]:
                arq = pasta_golden / f"{s['id']}.txt"
                if not arq.exists() or arq.read_text(encoding="utf-8") != "\n".join(s["grade"]) + "\n":
                    diffs.append(f"ERRO E017 {arq}: difere do golden")
            esperados = {f"{s['id']}.txt" for s in resultado["subareas"]} | {"resumo.json"}
            for arq in sorted(pasta_golden.glob("*")) if pasta_golden.exists() else []:
                if arq.name not in esperados:
                    diffs.append(f"ERRO E017 {arq}: sobra no golden")
        else:
            pasta_golden.mkdir(parents=True, exist_ok=True)
            (pasta_golden / "resumo.json").write_text(txt_resumo, encoding="utf-8")
            for s in resultado["subareas"]:
                (pasta_golden / f"{s['id']}.txt").write_text("\n".join(s["grade"]) + "\n", encoding="utf-8")
            esperados = {f"{s['id']}.txt" for s in resultado["subareas"]} | {"resumo.json"}
            for arq in sorted(pasta_golden.glob("*")):
                if arq.name not in esperados:
                    arq.unlink()
    return diffs


def main(argv):
    ap = argparse.ArgumentParser(description="Converte a planta do Tiled em conteúdo (ADR-011).")
    ap.add_argument("--entrada", default=str(ENTRADA_PADRAO))
    ap.add_argument("--perfil", default=PERFIL_PADRAO)
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--verificar", action="store_true")
    g.add_argument("--atualizar-golden", action="store_true")
    ap.add_argument("--atualizar-manifesto", action="store_true", help="(sem efeito: o manifesto sempre é atualizado ao gravar)")
    ap.add_argument("--girar", action="store_true", help="gira cada área 90° horário na saída (ADR-011 seção 2.5)")
    try:
        a = ap.parse_args(argv)
    except SystemExit:
        return 2
    entrada = Path(a.entrada)
    if not entrada.is_absolute():
        entrada = (Path.cwd() / entrada).resolve()
    col = Coletor(str(entrada.relative_to(RAIZ)) if entrada.is_relative_to(RAIZ) else str(entrada))
    try:
        perfil = carregar_perfil(a.perfil)
        res = converter(entrada, perfil, col, a.girar)
    except Erro as e:
        print(f"ERRO {e.codigo} {e.msg}", file=sys.stderr)
        return 1
    except (ET.ParseError, OSError) as e:
        print(f"ERRO E000 {col.arquivo}: não foi possível ler o TMX ({e})", file=sys.stderr)
        return 1
    for av in col.linhas_de_aviso():
        print(av)
    if res is None:
        for e in col.erros:
            print(e, file=sys.stderr)
        return 1
    diffs = gravar_ou_comparar(res, a.verificar, a.atualizar_golden)
    if diffs:
        for d in diffs:
            print(d, file=sys.stderr)
        return 1
    for s in res["subareas"]:
        c = s["contagens"]
        print(f"{'OK' if a.verificar else 'gravado'} {s['id']}: caixa {s['largura']}×{s['altura']}, "
              f"piso {c['piso']}, bloqueados com piso {c['bloqueadosComPiso']}, objetos {c['objetos']}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
