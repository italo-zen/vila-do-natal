#!/usr/bin/env python3
"""Conversor da planta do Tiled para o conteúdo do jogo (ADR-004, docs/conversor-tmx.md).

Lê a cópia de trabalho `maps/casa-real/our-home-jogo.tmx` e grava, por subárea,
`content/maps/casa-real/<id>.json`, o golden em `tools-arte/golden/casa-real/` e
(opcional) as entradas do manifesto. Só biblioteca padrão. Não altera src/.

Uso:
    python3 tools-arte/tmx_para_conteudo.py [--entrada CAMINHO] [--perfil ID]
        [--verificar | --atualizar-golden] [--atualizar-manifesto]
        [--girar]

    --girar              gira a planta 90° no sentido horário (GDD 14.12.1) em memória, antes de converter.
                         Só o conversor gira: o TMX de trabalho fica na orientação atual (padrão provisório
                         do Orquestrador, 2026-11-08).
    Marca planta: propriedade do mapa no TMX. "atual" = o TMX está na orientação atual: o conversor exige
    --girar. "girada" = o TMX já está girado: --girar recusa. Sem marca: nenhuma checagem.

    --perfil ID          perfil de arte (content/art-profiles/ID.json). Padrão: hd-480x352.
                         O manifesto ainda aponta para gba-240x160 (tile 16); por isso o padrão
                         é o HD, que é o perfil da planta (ADR-004 seção 9 e ADR-003 seção 1.1).
    --verificar          não grava nada; compara com content/ e com o golden; sai com 1 se diferir (E017).
    --atualizar-golden   grava também o golden (tools-arte/golden/casa-real/).
    --atualizar-manifesto  grava as entradas maps[] em content/manifest.json. Desligado por padrão:
                         o validador de manifesto atual (schemaVersion 1) exige `rooms`, e a
                         entrada nova ainda não tem esse campo (ADR-002, pendente de 026).

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
ENTRADA_PADRAO = RAIZ / "maps" / "casa-real" / "our-home-jogo.tmx"
SAIDA_CONTEUDO = RAIZ / "content" / "maps" / "casa-real"
GOLDEN = RAIZ / "tools-arte" / "golden" / "casa-real"
MANIFESTO = RAIZ / "content" / "manifest.json"
PERFIS = RAIZ / "content" / "art-profiles"
PERFIL_PADRAO = "hd-480x352"

G_PISOS = "Pisos"
G_ROTULOS = "Rótulos das subáreas"
G_PORTAS = "Portas"
G_BLOQ = "Objetos da casa bloqueantes"
G_JOGO = "Objetos de jogo"
GRUPOS_CONHECIDOS = {G_ROTULOS, G_PORTAS, G_BLOQ, G_JOGO}
GRUPOS_OBRIGATORIOS = [G_ROTULOS, G_PORTAS, G_BLOQ]
CLASSES_JOGO = {"spawn", "interruptor", "bilhete", "arvore", "examinavel", "peca"}
ESTADOS_PECA = {"visivel", "escondida"}                # ADR-004 seção 6; estado inicial da peça
DIRECOES = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}
NOME_DIRECAO = {v: k for k, v in DIRECOES.items()}
# Giro de 90° no sentido horário (GDD 14.12.1): o que estava em cima vai para a direita, etc.
ROTACAO_DIRECAO = {"cima": "direita", "direita": "baixo", "baixo": "esquerda", "esquerda": "cima"}
ID_RE = re.compile(r"^[a-z0-9_]+$")
MARCA_RE = re.compile(r"^P\d+$")
AMOSTRAS = 8          # 8 x 8 pontos por tile (ADR-004 seção 4, regra 1)
LIMIAR_PONTOS = 32    # de 64 pontos: pelo menos metade do tile
MASCARA_FLIP = 0xE0000000


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
        self.avisos.append(f"AVISO {codigo} {self.arquivo}: {msg}")


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
        """Caixa envolvente em px, com rotação em torno do canto superior esquerdo (contrato 3.7)."""
        if self.rot % 360 == 0:
            return (self.x, self.y, self.x + self.w, self.y + self.h)
        th = math.radians(self.rot)
        c, s = math.cos(th), math.sin(th)
        ps = [(self.x + dx * c - dy * s, self.y + dx * s + dy * c)
              for dx, dy in [(0, 0), (self.w, 0), (0, self.h), (self.w, self.h)]]
        return (min(p[0] for p in ps), min(p[1] for p in ps), max(p[0] for p in ps), max(p[1] for p in ps))


def _marca_da_planta(raiz):
    for p in raiz.findall("properties/property"):
        if p.get("name") == "planta":
            return p.get("value")
    return None


def ler_tmx(caminho, perfil, col, girar=False):
    raiz = ET.parse(caminho).getroot()
    T = perfil["tile"]
    marca = _marca_da_planta(raiz)
    if girar and marca == "girada":
        col.erro("E000", "o TMX está marcado como planta=girada: --girar giraria de novo")
    if not girar and marca == "atual":
        col.erro("E000", "o TMX está na planta atual (planta=atual): rode com --girar (GDD 14.12)")
    if raiz.get("orientation") != "orthogonal":
        col.erro("E000", "orientation deve ser orthogonal")
    tw, th = int(raiz.get("tilewidth", 0)), int(raiz.get("tileheight", 0))
    if tw != T or th != T:
        col.erro("E001", f"tilewidth {tw} / tileheight {th} ≠ perfil.tile {T} ({perfil['id']})")

    # tileset único 'tiles_casa'
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
            valores = [v for v in b.text.replace("\n", "").split(",") if v.strip() != ""]
            for i, v in enumerate(valores):
                _guardar_gid(piso, cx + i % cw, cy + i // cw, int(v), primeiro, contagem, col)
    else:
        cw = int(camadas[0].get("width"))
        valores = [v for v in dados.text.replace("\n", "").split(",") if v.strip() != ""]
        for i, v in enumerate(valores):
            _guardar_gid(piso, i % cw, i // cw, int(v), primeiro, contagem, col)

    grupos = {}
    for og in raiz.findall("objectgroup"):
        nome = og.get("name")
        if nome == "Nome das subareas":
            col.erro("E000", "renomeie o grupo 'Nome das subareas' para 'Rótulos das subáreas'")
            continue
        if nome not in GRUPOS_CONHECIDOS and nome != G_PORTAS + " pendentes":
            col.erro("E000", f"grupo de objetos '{nome}' não é previsto (contrato, seção 2.3)")
            continue
        grupos[nome] = [Obj(o) for o in og.findall("object")]
    for nome in GRUPOS_OBRIGATORIOS:
        if nome not in grupos:
            col.erro("E000", f"grupo '{nome}' não encontrado")
    if G_JOGO not in grupos:
        col.aviso("W002", f"grupo '{G_JOGO}' ausente: nenhum objeto de jogo")
        grupos[G_JOGO] = []
    if not piso:
        col.erro("E016", f"grupo '{G_PISOS}' sem tiles")
    if girar:
        piso = {girar_tile(p): g for p, g in piso.items()}
        for lst in grupos.values():
            for o in lst:
                girar_obj(o, col)
    return piso, grupos


# ---------------------------------------------------------------- giro da planta (GDD 14.12)

def girar_tile(p):
    """Tile (x, y) -> (-y - 1, x): 90° no sentido horário, vista de cima (GDD 14.12.1; equivale à
    fórmula da subárea (altura − 1 − y, x), com a origem de cada caixa recalculada pelo conversor)."""
    x, y = p
    return (-y - 1, x)


def girar_px(x, y, w, h):
    """Retângulo em px (x, y, w, h) -> (-(y + h), x, h, w). Ponto (w = h = 0) cai na mesma fórmula."""
    return (-(y + h), x, h, w)


def girar_obj(o, col):
    if o.rot % 360 != 0:
        col.erro("E012", f"objeto {o.id}: --girar não aceita rotação {o.rot:g}°")
        return
    o.x, o.y, o.w, o.h = girar_px(o.x, o.y, o.w, o.h)
    if "direcao" in o.props:
        o.props["direcao"] = ROTACAO_DIRECAO.get(o.props["direcao"], o.props["direcao"])


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


def componentes(piso):
    visto, saida = set(), []
    for p in sorted(piso, key=lambda p: (p[1], p[0])):
        if p in visto:
            continue
        fila, mem = deque([p]), []
        visto.add(p)
        while fila:
            q = fila.popleft()
            mem.append(q)
            for n in vizinhos4(q):
                if n in piso and n not in visto:
                    visto.add(n)
                    fila.append(n)
        saida.append(frozenset(mem))
    return saida


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


def moveis_por_subarea(grupos, T, dono, col):
    """Móveis nomeados (objeto `movel`, contrato da Arte com o Dev, 2026-11-08): cada retângulo com texto em
    'Objetos da casa bloqueantes' é um móvel. Mesmo retângulo da colisão (já girado). Tem de estar alinhado à
    grade e cair em piso de uma única subárea (E020). Retorna {subárea: [(x, y, w, h, nome)]} em tiles do TMX girado."""
    saida = {}
    for o in grupos.get(G_BLOQ, []):
        if not o.texto:
            continue                                   # parede, pilar ou batente: sem móvel
        x0, y0, x1, y1 = o.retangulo()
        if any(v % T for v in (x0, y0, x1 - x0, y1 - y0)):
            col.erro("E020", f"móvel '{o.texto}' (id {o.id}): retângulo fora da grade de {T} px")
            continue
        donos = {dono.get(t) for t in tiles_do_retangulo((x0, y0, x1, y1), T)}
        if None in donos or len(donos) != 1:
            col.erro("E020", f"móvel '{o.texto}' (id {o.id}): tiles fora do piso ou em mais de uma subárea")
            continue
        saida.setdefault(donos.pop(), []).append((int(x0 // T), int(y0 // T),
                                                  int((x1 - x0) // T), int((y1 - y0) // T), o.texto))
    return saida


# ---------------------------------------------------------------- conversão

def calcular_bloqueio(grupos, T, col):
    """Retângulos de colisão e conjunto de tiles bloqueados pela união (ADR-004 seção 4)."""
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
    return rects, bloqueado


def converter(caminho, perfil, col, vao_livre=(), girar=False):
    lido = ler_tmx(caminho, perfil, col, girar)
    if lido is None or col.erros:
        return None
    piso, grupos = lido
    T = perfil["tile"]
    tela_c, tela_l = perfil["sala"]["colunas"], perfil["sala"]["linhas"]
    comps = componentes(piso)
    retangulos, bloqueado = calcular_bloqueio(grupos, T, col)
    if col.erros:
        return None

    # 4. rótulos
    subs = []
    for m in comps:
        subs.append({"comp": m, "id": None, "escuro": False, "rotulo": None})
    dono = {}
    for i, s in enumerate(subs):
        for p in s["comp"]:
            dono[p] = i
    rotulos_por_comp = {}
    ids_vistos = set()
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
            col.erro("E004", f"componente {i} do piso (tile {min(s['comp'])}): {len(lst)} rótulos ({', '.join(nomes) or 'nenhum'}); esperado 1")
            continue
        s["id"], s["escuro"] = lst[0]
    if col.erros:
        return None

    # chegada declarada (ADR-004 seção 13.14; contrato 2.3): spawn com `chegada` no grupo Objetos de jogo.
    # Lido antes das marcas: o par explícito (chegada nos dois lados) aceita vão de 1 ou mais tiles.
    declaradas = {}                                    # (subarea, id da porta) -> (tile, direcao)
    for o in grupos.get(G_JOGO, []):
        if o.classe == "spawn" and "chegada" in o.props and not o.nome:
            t_decl = o.tile(T)
            if t_decl in dono and isinstance(o.props.get("chegada"), str):
                declaradas[(dono[t_decl], o.props["chegada"])] = (t_decl, o.props.get("direcao"))

    # 5. marcas de porta
    marcas = {}
    for o in grupos.get(G_PORTAS, []):
        if o.texto is None or o.texto == "":
            continue                                   # batente: visual (contrato, 3.5)
        if not MARCA_RE.match(o.texto):
            col.aviso("W003", f"texto '{o.texto}' em Portas não é Pn: ignorado")
            continue
        marcas.setdefault(o.texto, []).append(o)

    def subarea_da_marca(t):
        donos = {dono[n] for n in [t] + vizinhos4(t) if n in dono}
        return donos

    portas = []                                        # (nome, subarea, tile, fechada, trancada)
    saida_porta = {}                                   # (subarea, tile do gatilho) -> saida (campo `saida` do porta)
    pares = {}
    saidas_fechadas = {}                               # (subarea, tile) -> saida (cima, baixo, esquerda, direita)
    for nome in sorted(marcas, key=lambda s: int(s[1:])):
        lst = marcas[nome]
        fechadas = [o for o in lst if o.props.get("fechada") is True]
        if fechadas:
            if len(lst) != 1:
                col.erro("E007", f"{nome}: porta fechada exige uma marca só (há {len(lst)})")
                continue
            t = lst[0].tile(T)
            donos = subarea_da_marca(t)
            if len(donos) != 1:
                col.erro("E007", f"{nome}: porta fechada em {t} sem subárea vizinha única")
                continue
            saida = lst[0].props.get("saida")
            if saida not in DIRECOES:
                col.erro("E014", f"{nome}: porta fechada em {t} sem 'saida' válida (cima, baixo, esquerda ou direita)")
                continue
            sub = donos.pop()
            portas.append((nome, sub, t, True, None))
            saidas_fechadas[(sub, t)] = saida
            continue
        if len(lst) != 2:
            col.erro("E007", f"{nome}: {len(lst)} marca(s); par exige 2")
            continue
        pts = [o.tile(T) for o in lst]
        pares[nome] = pts
        for t in pts:
            if t not in dono or t in bloqueado:
                col.erro("E008", f"{nome}: marca em {t} fora do piso livre")
        vals = {o.props.get("trancadaAte") for o in lst}
        if len(vals) > 1:
            col.erro("E007", f"{nome}: trancadaAte diferente nos dois lados")
            continue
        trancada = vals.pop()
        if any(t not in dono or t in bloqueado for t in pts):
            continue
        a, b = pts
        if dono[a] == dono[b]:
            col.erro("E008", f"{nome}: os dois lados caem na mesma subárea")
            continue
        dx, dy = b[0] - a[0], b[1] - a[1]
        if not (dx == 0 or dy == 0):
            col.erro("E008", f"{nome}: marcas {a} e {b} não estão na mesma linha ou coluna")
            continue
        dist = max(abs(dx), abs(dy))
        d = (int(math.copysign(1, dx)) if dx else 0, int(math.copysign(1, dy)) if dy else 0)
        vao = [(a[0] + d[0] * k, a[1] + d[1] * k) for k in range(1, dist)]
        explicito = (dono[a], nome) in declaradas and (dono[b], nome) in declaradas
        if dist < 2:
            col.erro("E008", f"{nome}: marcas em {a} e {b} sem vão (é preciso ao menos 1 tile entre elas)")
            continue
        if dist != 2 and not explicito and nome not in vao_livre:
            col.erro("E008", f"{nome}: marcas em {a} e {b}; par sem chegada declarada nos dois lados exige vão de 1 tile, há {dist - 1} (ADR-004 seção 13.14, e)")
            continue
        if any(v in piso for v in vao):
            col.erro("E008", f"{nome}: o vão {vao} tem piso")
            continue
        if dist != 2 and not explicito:
            col.aviso("W004", f"{nome}: vão de {dist - 1} tile(s) aceito por --vao-livre")
        # saída de cada lado (ADR-004 seção 13.14, f): direção do gatilho ao primeiro tile do vão
        saida_porta[(dono[a], a)] = NOME_DIRECAO[d]
        saida_porta[(dono[b], b)] = NOME_DIRECAO[(-d[0], -d[1])]
        portas.append((nome, dono[a], a, False, trancada))
        portas.append((nome, dono[b], b, False, trancada))
    if col.erros:
        return None

    # 6. caixa de cada subárea (piso da subárea + marcas dela)
    for nome, sub, t, fechada, trancada in portas:
        subs[sub].setdefault("marcas", set()).add(t)
    # Vão de saída para baixo (ADR-004 seção 2; GDD 15.3.4, item 5): o vão entra na caixa de quem sai por ele,
    # para o tapete ter onde aparecer. Saída = V − G, na planta girada (o vão é o tile entre os dois gatilhos).
    for nome, pts in pares.items():
        if len(pts) != 2 or any(t not in dono for t in pts) or dono[pts[0]] == dono[pts[1]]:
            continue
        a, b = pts
        if not (a[0] == b[0] or a[1] == b[1]) or max(abs(b[0] - a[0]), abs(b[1] - a[1])) < 2:
            continue
        d = (int(math.copysign(1, b[0] - a[0])) if b[0] != a[0] else 0,
             int(math.copysign(1, b[1] - a[1])) if b[1] != a[1] else 0)
        if d == (0, 1):
            subs[dono[a]].setdefault("marcas", set()).add((a[0], a[1] + 1))
        if (-d[0], -d[1]) == (0, 1):
            subs[dono[b]].setdefault("marcas", set()).add((b[0], b[1] + 1))
    for s in subs:
        s.setdefault("marcas", set())
    caixas = []
    for i, s in enumerate(subs):
        pontos = set(s["comp"]) | s["marcas"]
        x0 = min(p[0] for p in pontos); x1 = max(p[0] for p in pontos)
        y0 = min(p[1] for p in pontos); y1 = max(p[1] for p in pontos)
        w, h = x1 - x0 + 1, y1 - y0 + 1
        if w > tela_c or h > tela_l:
            col.erro("E006", f"subárea '{s['id']}': caixa {w}×{h} > tela {tela_c}×{tela_l}")
        caixas.append((x0, y0, w, h))
    if col.erros:
        return None

    # 7. colisão: calculada no início (calcular_bloqueio); aqui só segue o fluxo

    # 8. objetos de jogo e spawns de chegada
    gatilhos = {(sub, t) for nome, sub, t, fechada, trancada in portas if not fechada}
    fechadas_t = {(sub, t) for nome, sub, t, fechada, trancada in portas if fechada}
    # chegada declarada (ADR-004 seção 13; contrato seção 2.3): spawn com `chegada` no grupo Objetos de jogo.
    # Substitui a chegada da fórmula do lado de mesmo id (regra 10). Validada depois de bloqueado |= árvores.
    spawns_chegada = []
    for nome in sorted(pares, key=lambda s: int(s[1:])):
        if nome not in pares or any(t not in dono for t in pares[nome]):
            continue
        a, b = pares[nome]
        if dono[a] == dono[b] or not (a[0] == b[0] or a[1] == b[1]) or max(abs(b[0]-a[0]), abs(b[1]-a[1])) < 2:
            continue
        d = (int(math.copysign(1, b[0] - a[0])) if b[0] != a[0] else 0,
             int(math.copysign(1, b[1] - a[1])) if b[1] != a[1] else 0)
        for lado, alvo, sinal in ((b, b, d), (a, a, (-d[0], -d[1]))):
            if (dono[alvo], nome) in declaradas:
                continue                               # a chegada declarada deste lado substitui a fórmula
            sp = (alvo[0] + sinal[0], alvo[1] + sinal[1])
            sub = dono.get(sp)
            if sub is None or sub != dono[alvo] or sp not in piso or sp in bloqueado or (dono[alvo], sp) in gatilhos:
                col.erro("E009", f"spawn {nome} de chegada em {sp} não é piso livre da subárea de destino")
                continue
            spawns_chegada.append((dono[alvo], nome, sp, sinal))
    if col.erros:
        return None

    objetos_por_sub = {i: [] for i in range(len(subs))}
    jogo = grupos.get(G_JOGO, [])
    nomes_spawn = {}
    arvores = set()
    reservados = set()
    pecas_lidas = []                                   # (ordem, subarea, tile, estadoInicial)
    for o in jogo:
        if o.classe not in CLASSES_JOGO:
            col.erro("E014", f"objeto {o.id} ({o.nome or o.texto}): classe '{o.classe}' desconhecida")
            continue
        t = o.tile(T)
        if o.classe == "spawn" and "chegada" in o.props:
            # chegada declarada: nome e chegada juntos, ou direcao inválida, é E014 (contrato 2.3)
            ident = o.props.get("chegada")
            direcao = o.props.get("direcao")
            if o.nome or not isinstance(ident, str) or not ident or direcao not in DIRECOES:
                col.erro("E014", f"chegada declarada em {t}: exige 'chegada' (id da porta) e 'direcao', e não 'nome'")
                continue
            if t not in dono:
                col.erro("E025", f"chegada '{ident}' em {t} fora do piso da subárea")
                continue
            sub = dono[t]
            if (sub, t) in reservados:
                col.erro("E025", f"chegada '{ident}' em {t} sobre outro objeto")
                continue
            reservados.add((sub, t))
            objetos_por_sub[sub].append({"tipo": "spawn", "nome": ident, "x": t[0], "y": t[1], "direcao": direcao})
            nomes_spawn[(sub, ident)] = nomes_spawn.get((sub, ident), 0) + 1
            continue
        if t not in dono:
            col.erro("E010", f"{o.classe} {o.nome} em {t}: fora do piso")
            continue
        if o.w > T or o.h > T or (o.w and not (2 <= (o.x + o.w / 2) % T <= T - 2)):
            col.erro("E013", f"{o.classe} {o.nome}: retângulo maior que um tile ou centro a menos de 2 px da borda")
            continue
        sub = dono[t]
        if (sub, t) in gatilhos or (sub, t) in fechadas_t:
            col.erro("E010", f"{o.classe} {o.nome} em {t}: sobre gatilho ou porta")
            continue
        if o.classe == "spawn":
            direcao = o.props.get("direcao")
            if not o.nome or direcao not in DIRECOES:
                col.erro("E014", f"spawn '{o.nome}': nome ou direcao inválida")
                continue
            if t not in piso or t in bloqueado:
                col.erro("E010", f"spawn '{o.nome}' em {t} não é piso livre")
                continue
            objetos_por_sub[sub].append({"tipo": "spawn", "nome": o.nome, "x": t[0], "y": t[1], "direcao": direcao})
            nomes_spawn.setdefault((sub, o.nome), 0)
            nomes_spawn[(sub, o.nome)] += 1
        elif o.classe == "interruptor":
            if t in bloqueado:
                col.erro("E010", f"interruptor em {t} sobre bloqueio")
                continue
            objetos_por_sub[sub].append({"tipo": "interruptor", "x": t[0], "y": t[1]})
        elif o.classe == "bilhete":
            # Bilhete de parede (GDD 14.10.9, item 040; ADR-004 seção 6): tile bloqueado com vizinho livre, como examinável.
            if not o.props.get("texto"):
                col.erro("E014", f"bilhete em {t}: texto ausente")
                continue
            vizl = [n for n in vizinhos4(t) if n in piso and n not in bloqueado and dono.get(n) == sub]
            if t not in bloqueado or not vizl:
                col.erro("E010", f"bilhete em {t}: exige tile bloqueado (parede) com vizinho de piso livre")
                continue
            objetos_por_sub[sub].append({"tipo": "bilhete", "x": t[0], "y": t[1], "texto": o.props["texto"]})
        elif o.classe == "arvore":
            if not o.props.get("estado"):
                col.erro("E014", "arvore sem 'estado'")
                continue
            arvores.add(t)
            objetos_por_sub[sub].append({"tipo": "arvore", "x": t[0], "y": t[1], "estado": o.props["estado"]})
        elif o.classe == "peca":
            # Peça da árvore (GDD 15.2; ADR-004 seção 6). Texto = ordem; estadoInicial obrigatório.
            # O vizinho livre, a interação com o interruptor e a ordem são conferidos depois do laço.
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
            if t in bloqueado:
                col.erro("E010", f"peça {ordem} em {t}: exige piso livre, não bloqueio")
                continue
            pecas_lidas.append((ordem, sub, t, estado))
        elif o.classe == "examinavel":
            if not o.props.get("texto"):
                col.erro("E014", f"examinável em {t} sem 'texto'")
                continue
            vizl = [n for n in vizinhos4(t) if n in piso and n not in bloqueado and dono.get(n) == sub]
            if t not in bloqueado or not vizl:
                col.erro("E010", f"examinável em {t}: exige tile bloqueado com vizinho livre")
                continue
            objetos_por_sub[sub].append({"tipo": "examinavel", "x": t[0], "y": t[1], "texto": o.props["texto"]})
        if (sub, t) in reservados:
            col.erro("E015", f"dois objetos no tile {t}")
        reservados.add((sub, t))
    for sub, nome, sp, sinal in spawns_chegada:
        if (sub, nome) in nomes_spawn:
            col.erro("E015", f"spawn '{nome}' repetido em '{subs[sub]['id']}'")
        nomes_spawn[(sub, nome)] = nomes_spawn.get((sub, nome), 0) + 1
        objetos_por_sub[sub].append({"tipo": "spawn", "nome": nome, "x": sp[0], "y": sp[1], "direcao": NOME_DIRECAO[sinal]})
    if col.erros:
        return None

    # peças (ADR-004 seção 8, itens 15 a 17; GDD 15.2.2 e 15.2.5)
    # Tiles que não podem ser vizinho livre da peça: gatilho, porta fechada, spawn (inclui chegada), interruptor.
    proibidos_vizinho = {(sub, t) for nome, sub, t, fechada, trancada in portas}
    interruptores_t = set()
    for sub_i, lst in objetos_por_sub.items():
        for o in lst:
            if o["tipo"] in ("spawn", "interruptor", "portaFechada", "porta"):
                proibidos_vizinho.add((sub_i, (o["x"], o["y"])))
            if o["tipo"] == "interruptor":
                interruptores_t.add((sub_i, (o["x"], o["y"])))
    ordens = [p[0] for p in pecas_lidas]
    for ordem in sorted(set(ordens)):
        if ordens.count(ordem) > 1:
            col.erro("E021", f"peça {ordem} aparece {ordens.count(ordem)} vezes")
    faltam = sorted({1, 2, 3} - set(ordens))
    if faltam:
        col.erro("E021", f"peças ausentes: {faltam}; o conteúdo exige 1, 2 e 3 (cada uma uma vez)")
    for ordem, sub, t, estado in pecas_lidas:
        esperado = "visivel" if ordem == 1 else "escondida"
        if estado != esperado:
            col.erro("E022", f"peça {ordem}: estadoInicial '{estado}', esperado '{esperado}'")
        if any((sub, n) in interruptores_t for n in [t] + vizinhos4(t)):
            col.erro("E023", f"peça {ordem} em {t} encosta no interruptor (mesma subárea)")
        if (sub, t) in proibidos_vizinho:
            col.erro("E010", f"peça {ordem} em {t} cai em gatilho, porta, spawn ou interruptor")
            continue
        vizl = [n for n in vizinhos4(t) if n in piso and n not in bloqueado and dono.get(n) == sub
                and (sub, n) not in proibidos_vizinho]
        if not vizl:
            col.erro("E010", f"peça {ordem} em {t}: sem vizinho de piso livre (que não seja gatilho, vão, spawn, chegada, interruptor ou porta)")
            continue
        objetos_por_sub[sub].append({"tipo": "peca", "id": f"peca{ordem}", "ordem": ordem,
                                     "estadoInicial": estado, "x": t[0], "y": t[1]})
    if col.erros:
        return None
    moveis = moveis_por_subarea(grupos, T, dono, col)
    if col.erros:
        return None

    # portas (pares e fechadas) na saída
    par_dest = {}
    for nome, sub, t, fechada, trancada in portas:
        if not fechada:
            par_dest.setdefault(nome, {})[sub] = t
    for nome, sub, t, fechada, trancada in portas:
        if fechada:
            livres = [n for n in vizinhos4(t) if n in piso and n not in bloqueado and dono.get(n) == sub]
            if not livres:
                col.erro("E010", f"portaFechada {nome} em {t}: sem vizinho de piso livre na subárea")
                continue
            objetos_por_sub[sub].append({"tipo": "portaFechada", "id": nome, "x": t[0], "y": t[1],
                                         "texto": "porta.fechada", "saida": saidas_fechadas[(sub, t)]})
        else:
            outro = [s for s in par_dest[nome] if s != sub][0]
            obj = {"tipo": "porta", "id": nome, "x": t[0], "y": t[1], "destino": subs[outro]["id"], "spawnDestino": nome,
                   "saida": saida_porta[(sub, t)]}
            if trancada:
                obj["trancadaAte"] = trancada
            objetos_por_sub[sub].append(obj)
    # árvore: o tile vira bloqueio
    bloqueado |= arvores

    # chegadas (ADR-004 seção 13; contrato seção 3, regras 10 e 10b): E024 a E026 valem para a chegada declarada
    # e para a da fórmula (E026); E025 é só da declarada. E027 vale para gatilho de par com chegada declarada do seu
    # lado; para gatilho de par com chegada da fórmula, é W027 (aviso), para não quebrar P3, P7 e P8 (ADR-004 13.8).
    chegadas = [(sub, ident, t_dir[0], True) for (sub, ident), t_dir in declaradas.items()]
    chegadas += [(sub, nome, sp, False) for sub, nome, sp, sinal in spawns_chegada]
    for sub, ident, t, declarada in chegadas:
        rotulo = f"chegada '{ident}' em '{subs[sub]['id']}' {t}"
        par = pares.get(ident)
        if not par or any(p not in dono for p in par) or dono[par[0]] == dono[par[1]] \
                or sub not in (dono[par[0]], dono[par[1]]):
            col.erro("E024", f"{rotulo}: nenhum gatilho {ident} leva a '{subs[sub]['id']}'")
            continue
        if declarada and (t not in piso or t in bloqueado or (sub, t) in gatilhos or (sub, t) in fechadas_t):
            col.erro("E025", f"{rotulo} sem piso livre (sobre bloqueio, gatilho, vão ou fora do piso)")
            continue
        g = par[0] if dono[par[0]] == sub else par[1]
        if abs(t[0] - g[0]) + abs(t[1] - g[1]) != 1:
            col.erro("E026", f"{rotulo} não encosta no gatilho {g} de '{subs[sub]['id']}'")
            continue
        if declarada:
            sentido = NOME_DIRECAO[(t[0] - g[0], t[1] - g[1])]
            dir_decl = declaradas[(sub, ident)][1]
            if dir_decl != sentido:
                col.erro("E028", f"{rotulo}: direção '{dir_decl}', esperado '{sentido}' (sentido do gatilho para dentro)")
    for nome, pts in pares.items():
        if len(pts) != 2 or any(t not in dono for t in pts) or dono[pts[0]] == dono[pts[1]]:
            continue
        for t in pts:
            sub = dono[t]
            livres = [n for n in vizinhos4(t) if n in piso and n not in bloqueado and dono.get(n) == sub]
            if len(livres) == 1:
                continue
            msg = f"gatilho {nome} em '{subs[sub]['id']}' {t}: {len(livres)} vizinho(s) de piso livre (esperado 1)"
            if (sub, nome) in declaradas:
                col.erro("E027", msg)
            else:
                col.aviso("W027", msg + "; par com chegada da fórmula (ADR-004 seção 13.8), não bloqueia")
    if col.erros:
        return None

    # 9. montagem
    x0m = min(p[0] for p in piso)
    y0m = min(p[1] for p in piso)
    resultado = {"subareas": [], "origemDaCasa": [x0m, y0m], "avisos": [], "rotacao": 90 if girar else 0}
    for i, s in enumerate(subs):
        bx, by, w, h = caixas[i]
        chao, colisao = [], []
        contagem = {"piso": 0, "livres": 0, "bloqueadosComPiso": 0, "semPiso": 0}
        mapa_linhas = []
        for j in range(h):
            linha = []
            for k in range(w):
                p = (bx + k, by + j)
                tem = p in piso and dono.get(p) == i
                if p in piso and not tem:
                    resultado["avisos"].append(f"W001 {s['id']}: piso de outra subárea em {p} vira sem piso nesta caixa")
                if tem:
                    chao.append(piso[p]); contagem["piso"] += 1
                    if p in bloqueado:
                        colisao.append(1); contagem["bloqueadosComPiso"] += 1
                    else:
                        colisao.append(0); contagem["livres"] += 1
                else:
                    chao.append(0); colisao.append(1); contagem["semPiso"] += 1
                linha.append(p)
            mapa_linhas.append(linha)
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
        ordem = {"porta": 0, "portaFechada": 1, "spawn": 2, "interruptor": 3, "bilhete": 4, "arvore": 5,
                 "examinavel": 6, "peca": 7, "movel": 8}
        objs.sort(key=lambda o: (ordem[o["tipo"]], str(o.get("id") or o.get("nome") or ""), o["y"], o["x"]))
        contagem["objetos"] = {}
        for o in objs:
            contagem["objetos"][o["tipo"]] = contagem["objetos"].get(o["tipo"], 0) + 1
        doc = {"altura": h, "chao": chao, "colisao": colisao, "escuro": s["escuro"], "id": s["id"],
               "largura": w, "objetos": objs, "tile": T}
        texto = json.dumps(doc, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        piso_local = {p for p in piso if dono.get(p) == i}
        grade = desenhar(mapa_linhas, piso_local, bloqueado, objs, bx, by)
        resultado["subareas"].append({
            "id": s["id"], "doc": doc, "texto": texto, "grade": grade,
            "deslocamento": [bx, by], "largura": w, "altura": h,
            "deslocamentoNaTela": [(tela_c - w) // 2, (tela_l - h) // 2],
            "escuro": s["escuro"], "contagens": contagem,
            "sha256": hashlib.sha256(texto.encode("utf-8")).hexdigest(),
        })
    # 11. Linha da barra (ADR-004 seção 8, item 6): a última linha da tela não pode ter chão andável nem objeto.
    for s in resultado["subareas"]:
        ls = tela_l - 1 - s["deslocamentoNaTela"][1]
        if not (0 <= ls < s["altura"]):
            continue
        for k in range(s["largura"]):
            i = ls * s["largura"] + k
            if s["doc"]["chao"][i] != 0 and s["doc"]["colisao"][i] == 0:
                col.erro("E018", f"subárea '{s['id']}': chão andável em ({k}, {ls}), linha {tela_l - 1} da tela; a barra cobre essa linha")
        for o in s["doc"]["objetos"]:
            if o["y"] == ls:
                col.erro("E019", f"subárea '{s['id']}': {o['tipo']} em ({o['x']}, {ls}), linha {tela_l - 1} da tela; a barra cobre essa linha")
    if col.erros:
        return None
    resultado["subareas"].sort(key=lambda s: s["id"])
    resultado["avisos"] = sorted(set(resultado["avisos"]))
    return resultado


def desenhar(mapa_linhas, piso, bloqueado, objs, bx, by):
    simbolo = {"porta": "G", "portaFechada": "F", "spawn": "S", "interruptor": "I",
               "bilhete": "B", "arvore": "A", "examinavel": "E"}
    marcas = {}
    for o in objs:
        if o["tipo"] == "movel":
            continue                                   # móvel é bloqueio (já aparece como '#')
        if o["tipo"] == "peca":
            marcas[(o["x"], o["y"])] = str(o["ordem"])  # contrato 5: dígito da ordem
            continue
        marcas[(o["x"], o["y"])] = simbolo[o["tipo"]]
    linhas = []
    for j, linha in enumerate(mapa_linhas):
        s = ""
        for k, p in enumerate(linha):
            if (k, j) in marcas:
                s += marcas[(k, j)]
            elif p not in piso:
                s += " "
            elif p in bloqueado:
                s += "#"
            else:
                s += "."
        linhas.append(s.rstrip())
    return linhas


def carregar_perfil(identificador):
    caminho = PERFIS / f"{identificador}.json"
    if not caminho.exists():
        raise Erro("E001", f"perfil '{identificador}' não encontrado em {caminho}")
    return json.loads(caminho.read_text(encoding="utf-8"))


def gravar_ou_comparar(resultado, verificar, golden, manifesto_atualizado):
    diffs = []
    for s in resultado["subareas"]:
        arq = SAIDA_CONTEUDO / f"{s['id']}.json"
        if verificar:
            atual = arq.read_text(encoding="utf-8") if arq.exists() else None
            if atual != s["texto"]:
                diffs.append(f"ERRO E017 {arq}: difere do gerado")
        else:
            SAIDA_CONTEUDO.mkdir(parents=True, exist_ok=True)
            arq.write_text(s["texto"], encoding="utf-8")
    if golden:
        resumo = {
            "origemDaCasa": resultado["origemDaCasa"],
            "rotacao": resultado["rotacao"],
            "subareas": [{k: v for k, v in s.items() if k in ("id", "deslocamento", "largura", "altura",
                                                               "deslocamentoNaTela", "escuro", "contagens", "sha256")}
                         for s in resultado["subareas"]],
            "avisos": resultado["avisos"],
        }
        texto_resumo = json.dumps(resumo, indent=2, sort_keys=True, ensure_ascii=False) + "\n"
        if verificar:
            atual = (GOLDEN / "resumo.json").read_text(encoding="utf-8") if (GOLDEN / "resumo.json").exists() else None
            if atual != texto_resumo:
                diffs.append(f"ERRO E017 {GOLDEN / 'resumo.json'}: difere do golden")
            for s in resultado["subareas"]:
                arq = GOLDEN / f"{s['id']}.txt"
                txt = "\n".join(s["grade"]) + "\n"
                if not arq.exists() or arq.read_text(encoding="utf-8") != txt:
                    diffs.append(f"ERRO E017 {arq}: difere do golden")
        else:
            GOLDEN.mkdir(parents=True, exist_ok=True)
            (GOLDEN / "resumo.json").write_text(texto_resumo, encoding="utf-8")
            for s in resultado["subareas"]:
                (GOLDEN / f"{s['id']}.txt").write_text("\n".join(s["grade"]) + "\n", encoding="utf-8")
    if manifesto_atualizado and not verificar:
        m = json.loads(MANIFESTO.read_text(encoding="utf-8"))
        existentes = {e["id"]: e for e in m.get("maps", [])}
        for s in resultado["subareas"]:
            entrada = {"id": s["id"], "file": f"maps/casa-real/{s['id']}.json", "tileset": "tiles_casa"}
            if s["id"] in existentes:
                existentes[s["id"]].update(entrada)
            else:
                m.setdefault("maps", []).append(entrada)
        MANIFESTO.write_text(json.dumps(m, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return diffs


def main(argv):
    ap = argparse.ArgumentParser(description="Converte a planta do Tiled em conteúdo (ADR-004).")
    ap.add_argument("--entrada", default=str(ENTRADA_PADRAO))
    ap.add_argument("--perfil", default=PERFIL_PADRAO)
    ap.add_argument("--vao-livre", default="", help="ids de par cujo vão pode ter mais de 1 tile (ex.: P1). Vai para o golden.")
    g = ap.add_mutually_exclusive_group()
    g.add_argument("--verificar", action="store_true")
    g.add_argument("--atualizar-golden", action="store_true")
    ap.add_argument("--atualizar-manifesto", action="store_true")
    ap.add_argument("--girar", action="store_true", help="gira a planta 90° horário antes de converter (GDD 14.12)")
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
    except Erro as e:
        print(f"ERRO {e.codigo} {e.msg}", file=sys.stderr)
        return 1
    vao_livre = tuple(x for x in a.vao_livre.split(",") if x)
    res = converter(entrada, perfil, col, vao_livre, a.girar)
    for av in col.avisos:
        print(av)
    if res is None:
        for e in col.erros:
            print(e, file=sys.stderr)
        return 1
    for av in res["avisos"]:
        print(av)
    diffs = gravar_ou_comparar(res, a.verificar, a.atualizar_golden, a.atualizar_manifesto)
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
