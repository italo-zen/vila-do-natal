#!/usr/bin/env python3
"""Capturas por área da planta nova (backlog 173 e 175, Arte 2026-11-17).

Compõe, com Pillow, o que a CasaScene vai mostrar: tela 15×11 de 32 px (fundo tema.fundo), piso por gid, muros por aresta,
móveis (spr_pia, spr_fogao, spr_geladeira), objetos de jogo, portas (aberta, fechada, com código) e, no modo `explorar`,
os enfeites de content/maps/decoracao. As duas últimas linhas da tela são a barra (faixa escura de 56 px ancorada na base, como barra.alturaPorLinhas[2], sem texto). Não é o jogo:
é a conferência visual da Arte para o Diretor aprovar (EN2, PL12). Escuro (Sala e Cozinha) não é simulado.

Regra de desenho que o Dev replica na cena:
  - muro: para cada tile de piso e cada bit de `paredes`, uma aresta; arestas repetidas (par de tiles) valem uma só vez;
    aresta de porta não leva muro (leva o sprite da porta); `spr_parede_h` (40×8) em aresta horizontal e `spr_parede_v` (8×40)
    em aresta vertical, centro no ponto médio da aresta;
  - porta: sprite 32×32 centrado no ponto médio da aresta do `lado`: aberta, fechada ou com código (vertical se o lado
    é esquerda ou direita).
Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/captura_area_v2.py <pasta de saída>
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
C = RAIZ / "content" / "maps" / "casa-real"
DEC = RAIZ / "content" / "maps" / "decoracao"
A = RAIZ / "assets" / "hd-480x352"
T = 32
COLS, LINS = 15, 11
FUNDO = (11, 16, 48, 255)
AREAS = ["hall", "sala", "cozinha", "quarto", "escritorio"]
FECHADAS = {"quarto_casal-sala", "banheiro1-quarto", "banheiro_escritorio-escritorio", "cozinha-quartinho"}
CODIGO = {"hall-sala"}   # aberta depois do código; no começo do jogo a Sala tem a porta com código
VEC = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}
BIT = {"cima": 1, "direita": 2, "baixo": 4, "esquerda": 8}


def img(nome):
    return Image.open(A / f"{nome}.png").convert("RGBA")


def tile(ts, gid):
    p = gid - 1
    x, y = (p % 32) * 32, (p // 32) * 32
    return ts.crop((x, y, x + 32, y + 32))


def capturar(ident, explorar, estado_porta="aberta"):
    d = json.loads((C / f"{ident}.json").read_text(encoding="utf-8"))
    w, h = d["largura"], d["altura"]
    dx, dy = (COLS - w) // 2, (LINS - h) // 2
    ts = img("tiles_casa")
    tela = Image.new("RGBA", (COLS * T, LINS * T), FUNDO)

    def colar(im, x, y, centro=False):
        if centro:
            x -= im.width // 2
            y -= im.height // 2
        tela.alpha_composite(im, (int(x), int(y)))

    for y in range(h):
        for x in range(w):
            g = d["chao"][y * w + x]
            if g:
                colar(tile(ts, g), (dx + x) * T, (dy + y) * T)
    portas = {(o["x"], o["y"], o["lado"]): o for o in d["objetos"] if o["tipo"] == "porta"}
    # muros por aresta
    arestas = set()
    for y in range(h):
        for x in range(w):
            if not d["chao"][y * w + x]:
                continue
            m = d["paredes"][y * w + x]
            for lado, b in BIT.items():
                if m & b and (x, y, lado) not in portas:
                    vx, vy = VEC[lado]
                    nx, ny = x + vx, y + vy
                    outro = (nx, ny, {"cima": "baixo", "baixo": "cima", "esquerda": "direita", "direita": "esquerda"}[lado])
                    if outro in portas:
                        continue
                    if lado == "cima": e = ("h", x, y)
                    elif lado == "baixo": e = ("h", x, y + 1)
                    elif lado == "esquerda": e = ("v", x, y)
                    else: e = ("v", x + 1, y)
                    arestas.add(e)
    ph, pv = img("spr_parede_h"), img("spr_parede_v")
    for k, x, y in sorted(arestas):
        if k == "h":
            colar(ph, (dx + x) * T + T // 2, (dy + y) * T, True)
        else:
            colar(pv, (dx + x) * T, (dy + y) * T + T // 2, True)
    # objetos (profundidade = base do tile)
    itens = []
    for o in d["objetos"]:
        t = o["tipo"]
        if t == "movel":
            nome = f"spr_{o['id']}"            # contrato: sprite do móvel = spr_<id>
            if (A / f"{nome}.png").exists():
                itens.append(((o["y"] + 1) * T, img(nome), (dx + o["x"]) * T, (dy + o["y"]) * T))
        elif t == "arvore":
            itens.append(((o["y"] + 1) * T, img("spr_arvore_desmontada"), (dx + o["x"]) * T, (dy + o["y"]) * T))
        elif t == "interruptor":
            itens.append(((o["y"] + 1) * T, img("spr_interruptor"), (dx + o["x"]) * T, (dy + o["y"]) * T))
        elif t == "bilhete":
            itens.append(((o["y"] + 1) * T, img("spr_bilhete"), (dx + o["x"]) * T, (dy + o["y"]) * T))
        elif t == "peca" and o["estadoInicial"] == "visivel":
            itens.append(((o["y"] + 1) * T, img("spr_peca_1"), (dx + o["x"]) * T, (dy + o["y"]) * T))
    if explorar:
        decor = json.loads((DEC / f"{ident}.json").read_text(encoding="utf-8"))
        for e in decor["enfeites"]:
            im = img(e["sprite"])
            if im.width == 64:
                im = im.crop((0, 0, 32, 32))
            itens.append(((e["y"] + 1) * T + 1, im, (dx + e["x"]) * T, (dy + e["y"]) * T))
    for _, im, x, y in sorted(itens, key=lambda i: i[0]):
        colar(im, x, y)
    # portas
    for (x, y, lado), o in portas.items():
        pid = o["id"]
        estado = "fechada" if pid in FECHADAS else ("codigo" if pid in CODIGO and estado_porta == "codigo" else "aberta")
        vert = lado in ("esquerda", "direita")
        nome = {"fechada": "spr_porta", "codigo": "spr_porta_codigo", "aberta": "spr_porta_aberta"}[estado] + ("_vertical" if vert else "")
        px = (dx + x) * T + {"esquerda": 0, "direita": T}.get(lado, T // 2)
        py = (dy + y) * T + {"cima": 0, "baixo": T}.get(lado, T // 2)
        colar(img(nome), px, py, True)
    # barra
    g = ImageDraw.Draw(tela)
    g.rectangle([0, LINS * T - 56, COLS * T, LINS * T], fill=(27, 36, 82, 255), outline=(154, 163, 199, 255))
    return tela


def main(saida):
    saida = Path(saida)
    saida.mkdir(parents=True, exist_ok=True)
    for a in AREAS:
        for modo in ("jogo", "explorar"):
            im = capturar(a, modo == "explorar", "codigo")
            im = im.resize((im.width * 2, im.height * 2), Image.NEAREST)
            im.convert("RGB").save(saida / f"{a}-{modo}.png")
    print(saida)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else RAIZ / "tools-arte" / "previews" / "v2")
