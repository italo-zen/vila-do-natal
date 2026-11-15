#!/usr/bin/env python3
"""
Decoração do modo "Explorar a casa" (GDD 20.6; ADR-010 seções 3 e 8; item 153).

Gera os cinco arquivos de content/maps/decoracao/<subarea>.json (schemaVersion 2, ADR-010 3.2) a partir da
tabela POSICOES, e grava a proposta do trecho de manifesto em assets/hd-480x352/decoracao-manifesto-proposta.json
(a chave `decoracao` no manifesto é do Dev; esta Arte só propõe o trecho).

Valida contra os mapas, as missões e o sprites.json (regras do ADR-010 seção 8.2):
  E1  schemaVersion 2 e chaves conhecidas;
  E2  subárea em missions[enfeites].maps;
  E3  contagem exata por subárea (Hall 4, Sala 8, Cozinha e Lavanderia 6, Quarto 4, Escritório 3; total 25);
  E4  tile dentro do mapa e fora de: spawn, porta, portaFechada, interruptor, bilhete, árvore, peça, examinável,
      outro objeto, passagem (gids 537 e 538), linhas da barra (tela sala.linhas-2 e -1) e tile de dormir do Nick;
  E5  tile andável (colisão 0): examinar null; pisca só em sprite de luz ou vela;
  E6  tile bloqueado: examinar é uma chave de 3.4 ou null;
  E7  sprite em sprites.json com prefixo dec_; pisca exige quadros 2;
  E8  atlas dec_* somado ≤ 16.000 bytes (tamanho dos PNG no disco);
  E9  chaves de 3.4 existem em content/texts/pt-BR.json (PENDENTE até o item 156; relatado, não bloqueia).

Uso: /usr/bin/python3 tools-arte/decoracao_m7.py [--so-validar]
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MAPAS = RAIZ / "content" / "maps" / "casa-real"
DECOR = RAIZ / "content" / "maps" / "decoracao"
MISSOES = RAIZ / "content" / "missions"
TEXTOS = RAIZ / "content" / "texts" / "pt-BR.json"
SPRITES = RAIZ / "assets" / "hd-480x352" / "sprites.json"
ATLAS = RAIZ / "assets" / "hd-480x352"
PROPOSTA_MANIFESTO = ATLAS / "decoracao-manifesto-proposta.json"

PASSAGEM = {537, 538}
TIPOS_PROIBIDOS = {"spawn", "porta", "portaFechada", "interruptor", "bilhete", "arvore", "peca", "examinavel",
                   "caixa", "painel"}
CONTAGEM = {"hall": 4, "sala": 8, "cozinha": 6, "quarto": 4, "escritorio": 3}
LINHAS_TELA = 11  # sala.linhas (perfil hd-480x352)
MAX_ATLAS = 16_000

# Chave de texto por família de sprite (ADR-010 3.4). None = sem texto (visual).
TEXTO = {
    "dec_luz": "enfeite.pisca", "dec_vela": "enfeite.vela",
    "dec_guirlanda": "enfeite.guirlanda",
    "dec_presente_vermelho": "enfeite.presente", "dec_presente_verde": "enfeite.presente",
    "dec_meias": "enfeite.meias",
    "dec_arvore_p": "enfeite.arvore", "dec_arvore_g": "enfeite.arvore",
    "dec_cortina": None, "dec_pano": None, "dec_estrela": None, "dec_bola": None,
}
PISCA = {"dec_luz", "dec_vela"}

# (subárea, x, y, sprite, local). local: "parede" e "movel" são bloqueados; "chao" é andável.
# "Cozinha e Lavanderia" = subárea cozinha (ADR-010 6; GDD 15.3). Nick dorme: sala (8,5), cozinha (5,3), quarto (4,3),
# escritório (6,1); nenhum enfeite nesses tiles.
POSICOES = [
    # Hall (sem móvel: só piso)
    ("hall", 1, 1, "dec_arvore_p", "chao"),
    ("hall", 2, 1, "dec_presente_vermelho", "chao"),
    ("hall", 2, 2, "dec_presente_verde", "chao"),
    ("hall", 3, 2, "dec_arvore_g", "chao"),
    # Sala (rótulos de Mesa e Rack TV ficam livres)
    ("sala", 0, 0, "dec_arvore_p", "chao"),
    ("sala", 0, 4, "dec_arvore_g", "chao"),
    ("sala", 0, 8, "dec_presente_vermelho", "chao"),
    ("sala", 1, 8, "dec_presente_verde", "chao"),
    ("sala", 2, 3, "dec_meias", "chao"),
    ("sala", 3, 3, "dec_luz", "movel"),
    ("sala", 10, 6, "dec_guirlanda", "movel"),
    ("sala", 10, 7, "dec_vela", "movel"),
    # Cozinha e Lavanderia (rótulos de Fogão, Forno e Geladeira ficam livres)
    ("cozinha", 5, 0, "dec_pano", "movel"),
    ("cozinha", 2, 1, "dec_meias", "chao"),
    ("cozinha", 3, 1, "dec_arvore_p", "chao"),
    ("cozinha", 3, 3, "dec_presente_vermelho", "chao"),
    ("cozinha", 4, 3, "dec_presente_verde", "chao"),
    ("cozinha", 2, 4, "dec_arvore_g", "chao"),
    # Quarto (sem móvel: só piso)
    ("quarto", 2, 3, "dec_presente_vermelho", "chao"),
    ("quarto", 3, 3, "dec_arvore_p", "chao"),
    ("quarto", 1, 4, "dec_presente_verde", "chao"),
    ("quarto", 4, 4, "dec_arvore_g", "chao"),
    # Escritório (rótulo da Mesa fica livre)
    ("escritorio", 5, 1, "dec_arvore_p", "chao"),
    ("escritorio", 6, 2, "dec_luz", "movel"),
    ("escritorio", 6, 3, "dec_meias", "movel"),
]


def carregar_mapa(subarea):
    d = json.loads((MAPAS / f"{subarea}.json").read_text(encoding="utf-8"))
    w, h = d["largura"], d["altura"]
    info = {"w": w, "h": h, "altura": h, "colisao": {}, "chao": {}, "objetos": {}, "tipos": {}}
    for i, c in enumerate(d["colisao"]):
        info["colisao"][(i % w, i // w)] = c
    for i, t in enumerate(d["chao"]):
        info["chao"][(i % w, i // w)] = t
    info["moveis_area"] = {}  # tile -> largura em tiles do móvel que o cobre (rótulo aparece se >= 2)
    for o in d["objetos"]:
        xy = (o["x"], o["y"])
        info["objetos"].setdefault(xy, []).append(o["tipo"])
        info["tipos"].setdefault(o["tipo"], []).append(xy)
        if o["tipo"] == "movel":
            for dx in range(o["w"]):
                for dy in range(o["h"]):
                    info["moveis_area"][(o["x"] + dx, o["y"] + dy)] = o["w"]
    return info


def carregar_dormir():
    dorme = {}
    for f in MISSOES.glob("*.json"):
        d = json.loads(f.read_text(encoding="utf-8"))
        nick = d.get("nick") if isinstance(d, dict) else None
        if nick and nick.get("dorme") and nick["dorme"].get("x") is not None:
            dorme.setdefault(nick["dorme"]["mapa"], set()).add((nick["dorme"]["x"], nick["dorme"]["y"]))
    return dorme


def linha_de_tela(y, altura):
    """Linha da tela de um tile (ADR-004 seção 2): y + floor((linhas - altura) / 2)."""
    dy = math.floor((LINHAS_TELA - altura) / 2)
    return y + dy


def sprites_registrados():
    d = json.loads(SPRITES.read_text(encoding="utf-8"))
    return {i["arquivo"]: i for i in d["imagens"]}


def montar():
    """Converte POSICOES nos arquivos do ADR-010 3.2 e aplica E4 a E7 (sem gravar)."""
    mapas = {s: carregar_mapa(s) for s in CONTAGEM}
    dormir = carregar_dormir()
    registro = sprites_registrados()
    erros, pendencias = [], []
    por_sub = {s: [] for s in CONTAGEM}
    usados = {}
    for sub, x, y, sprite, local in POSICOES:
        arq = f"{sprite}.png"
        m = mapas[sub]
        xy = (x, y)
        if sub not in CONTAGEM:
            erros.append(f"E2 {sub}: subárea fora de missions[enfeites].maps")
            continue
        if not (0 <= x < m["w"] and 0 <= y < m["h"]):
            erros.append(f"E4 {sub} ({x},{y}): fora do mapa")
            continue
        if m["chao"].get(xy) in PASSAGEM:
            erros.append(f"E4 {sub} ({x},{y}): tile de passagem")
        proibidos = [t for t in m["objetos"].get(xy, []) if t in TIPOS_PROIBIDOS or t != "movel"]
        if local == "movel":
            proibidos = [t for t in proibidos if t != "movel"]
        if proibidos:
            erros.append(f"E4 {sub} ({x},{y}): tile ocupado por {proibidos}")
        if xy in dormir.get(sub, set()):
            erros.append(f"E4 {sub} ({x},{y}): tile onde o Nick dorme")
        if linha_de_tela(y, m["altura"]) >= LINHAS_TELA - 2:
            erros.append(f"E4 {sub} ({x},{y}): cai nas linhas da barra")
        colisao = m["colisao"].get(xy)
        # Visível no jogo: piso desenhado (gid > 0) ou móvel desenhado. Vazio e parede não aparecem (regra da Arte).
        if local == "chao":
            if colisao != 0 or m["chao"].get(xy, 0) <= 0:
                erros.append(f"E5 {sub} ({x},{y}): chão de decoração fora do piso desenhado (vazio ou parede)")
        if local == "movel":
            if xy not in m["moveis_area"]:
                erros.append(f"E6 {sub} ({x},{y}): 'movel' fora da área de um móvel")
            elif m["moveis_area"][xy] >= 2:
                erros.append(f"E6 {sub} ({x},{y}): tile do rótulo de móvel de {m['moveis_area'][xy]} tiles")
        if arq not in registro:
            erros.append(f"E7 {arq}: não está em sprites.json")
            continue
        quadros = registro[arq].get("quadros", 1)
        pisca = sprite in PISCA
        if pisca and quadros != 2:
            erros.append(f"E7 {arq}: pisca exige 2 quadros")
        chave = TEXTO[sprite]
        if local == "chao":  # E5: andável é só visual; o texto do sprite não vale aqui
            chave = None
            pisca = False
        if local != "chao" and chave is None and sprite not in ("dec_cortina", "dec_pano", "dec_estrela", "dec_bola"):
            erros.append(f"E6 {sub} ({x},{y}): bloqueado sem texto para {sprite}")
        ident = f"{sub}_{sprite.replace('dec_', '')}_{sum(1 for e in por_sub[sub] if e['sprite'] == sprite) + 1}"
        por_sub[sub].append({"id": ident, "sprite": sprite, "x": x, "y": y, "pisca": pisca, "examinar": chave})
        usados[sprite] = usados.get(sprite, 0) + 1
    for sub, n in CONTAGEM.items():
        if len(por_sub[sub]) != n:
            erros.append(f"E3 {sub}: {len(por_sub[sub])} enfeites, o GDD 20.6 pede {n}")
    total = sum(len(v) for v in por_sub.values())
    if total != 25:
        erros.append(f"E3 total {total}, o GDD 20.6 pede 25")
    atlas = sum((ATLAS / (sp + ".png")).stat().st_size for sp in usados if (ATLAS / (sp + ".png")).exists())
    if atlas > MAX_ATLAS:
        erros.append(f"E8 atlas dec_* em uso: {atlas} bytes (limite 16.000)")
    textos = json.loads(TEXTOS.read_text(encoding="utf-8"))
    for chave in sorted({e["examinar"] for v in por_sub.values() for e in v if e["examinar"]}):
        if chave not in textos:
            pendencias.append(f"E9 chave '{chave}' ausente em content/texts/pt-BR.json (item 156)")
    return por_sub, erros, pendencias, atlas, usados


def gravar(por_sub):
    DECOR.mkdir(parents=True, exist_ok=True)
    for sub, lista in por_sub.items():
        dados = {"schemaVersion": 2, "subarea": sub, "enfeites": lista}
        (DECOR / f"{sub}.json").write_text(json.dumps(dados, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    proposta = {
        "_status": "proposta da Arte (item 153, ADR-010 8.1). A chave `decoracao` é do Dev; esta Arte só propõe o trecho.",
        "maps": [{"id": sub, "decoracao": f"maps/decoracao/{sub}.json"} for sub in CONTAGEM],
    }
    PROPOSTA_MANIFESTO.write_text(json.dumps(proposta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def main(argv):
    por_sub, erros, pendencias, atlas, usados = montar()
    if erros:
        for e in erros:
            print("FALHA", e)
        return 1
    if "--so-validar" not in argv:
        gravar(por_sub)
        print(f"Gravado: {', '.join(f'content/maps/decoracao/{s}.json' for s in CONTAGEM)}")
        print(f"Proposta de manifesto: {PROPOSTA_MANIFESTO}")
    print(f"OK: 25 enfeites, E1 a E8. Atlas dec_* em uso: {atlas} bytes (limite 16.000). Sprites: {sorted(usados)}")
    for p in pendencias:
        print("PENDENTE", p)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
