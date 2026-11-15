#!/usr/bin/env python3
"""Previews da casa real (Arte, GDD 14.12 e 14.10.9): planta inteira e áreas do Marco 1, em PNG.

Lê content/maps/casa-real/*.json, golden/resumo.json (posição de cada subárea na planta) e os
tiles e sprites de assets/hd-480x352. Desenha como o motor (CasaScene): piso por gid, objetos por tipo,
sobre o fundo tema.fundo. Não é a cena do jogo: é a conferência visual da Arte (R10 do GDD 14.12.6).

Saída (padrão tools-arte/previews/): planta-girada.png, area-hall.png, area-sala.png, area-cozinha.png.
Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_casa.py   (precisa de Pillow)
Diferença deliberada em relação ao motor atual: a porta fechada é desenhada no próprio tile (o motor
hoje a desenha um tile acima, em CasaScene.desenharObjetos; ver PARA O DEV).
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
CONTEUDO = RAIZ / "content" / "maps" / "casa-real"
ASSETS = RAIZ / "assets" / "hd-480x352"
SAIDA = RAIZ / "tools-arte" / "previews"
TELA = (15, 11)
FUNDO = (11, 16, 48, 255)  # tema.fundo #0b1030
ESCALA = 2                 # 1 tile = 64 px nas áreas; a planta usa 1 tile = 32 px (escala 1)
MARCAS_DE_PORTA = {}

ordem_ok = ["hall", "sala", "cozinha"]


def carregar_subareas():
    subs = {}
    for arq in CONTEUDO.glob("*.json"):
        d = json.loads(arq.read_text(encoding="utf-8"))
        subs[d["id"]] = d
    resumo = json.loads((RAIZ / "tools-arte" / "golden" / "casa-real" / "resumo.json").read_text(encoding="utf-8"))
    return subs, resumo


def cola_tile(tileset, gid):
    pos = gid - 1
    x, y = (pos % 32) * 32, (pos // 32) * 32
    return tileset.crop((x, y, x + 32, y + 32))


def desenhar_subarea(img, tileset, sprites, d, ox, oy, escala, rotulo=None):
    """Desenha uma subárea com canto superior esquerdo em (ox, oy) tiles da imagem."""
    W, A, T = d["largura"], d["altura"], 32
    px = T * escala
    for y in range(A):
        for x in range(W):
            i = y * W + x
            g = d["chao"][i]
            if g:
                t = cola_tile(tileset, g).resize((px, px), Image.NEAREST)
                img.paste(t, ((ox + x) * px, (oy + y) * px))
    j = {}
    for o in d["objetos"]:
        j.setdefault(o["tipo"], []).append(o)
    def pos(o):
        return ((ox + o["x"]) * px, (oy + o["y"]) * px)
    def sprite(nome, pos_px, sz=None):
        s = sprites[nome]
        if sz:
            s = s.resize(sz, Image.NEAREST)
        else:
            s = s.resize((int(s.width * escala * 1), int(s.height * escala * 1)), Image.NEAREST)
        img.alpha_composite(s, pos_px) if img.mode == "RGBA" else img.paste(s, pos_px, s)
    for o in j.get("arvore", []):
        sprite("arvore", pos(o))
    for o in j.get("bilhete", []):
        sprite("bilhete", pos(o))
    for o in j.get("interruptor", []):
        sprite("interruptor", pos(o))
    for o in j.get("portaFechada", []):
        sprite("porta", pos(o))
    for o in j.get("porta", []):
        if o.get("trancadaAte"):
            # Porta trancada: folha no vão (tile entre o gatilho e o spawn de chegada: V = 2G − spawn).
            sp = [s for s in d["objetos"] if s["tipo"] == "spawn" and s["nome"] == o["id"]]
            if sp:
                vx, vy = 2 * o["x"] - sp[0]["x"], 2 * o["y"] - sp[0]["y"]
                horizontal = o["x"] == sp[0]["x"]
                nome = "porta_vertical" if not horizontal else "porta"
                sprite(nome, ((ox + vx) * px, (oy + vy) * px))
    if rotulo:
        dr = ImageDraw.Draw(img)
        fonte = ImageFont.load_default()
        for o in j.get("portaFechada", []) + j.get("porta", []):
            dr.text(((ox + o["x"]) * px + 2, (oy + o["y"]) * px + 2), o["id"], fill=(255, 255, 255, 255), font=fonte)
    return j


def carregar_imagens():
    tileset = Image.open(ASSETS / "tiles_casa.png").convert("RGBA")
    nomes = ["arvore_desmontada", "bilhete", "interruptor", "porta", "porta_vertical"]
    sprites = {}
    for n in nomes:
        sprites[n if n != "arvore_desmontada" else "arvore"] = Image.open(ASSETS / f"spr_{n}.png").convert("RGBA")
    return tileset, sprites


def area(subs, nome, destino):
    tileset, sprites = carregar_imagens()
    W, H = TELA[0] * 32 * ESCALA, TELA[1] * 32 * ESCALA
    img = Image.new("RGBA", (W, H), FUNDO)
    d = subs[nome]
    from_resumo = RESUMO_POR_ID[nome]
    dx, dy = from_resumo["deslocamentoNaTela"]
    desenhar_subarea(img, tileset, sprites, d, dx, dy, ESCALA, rotulo=True)
    img.save(destino)
    return destino


def planta(subs, resumo, destino):
    tileset, sprites = carregar_imagens()
    origem = resumo["origemDaCasa"]
    pos = {s["id"]: s for s in resumo["subareas"]}
    minx = min(pos[k]["deslocamento"][0] - origem[0] for k in subs)
    miny = min(pos[k]["deslocamento"][1] - origem[1] for k in subs)
    maxx = max(pos[k]["deslocamento"][0] - origem[0] + pos[k]["largura"] for k in subs)
    maxy = max(pos[k]["deslocamento"][1] - origem[1] + pos[k]["altura"] for k in subs)
    margem = 1
    L, A = (maxx - minx + 2 * margem), (maxy - miny + 2 * margem)
    img = Image.new("RGBA", (L * 32, A * 32), FUNDO)
    for k, d in subs.items():
        bx = pos[k]["deslocamento"][0] - origem[0] - minx + margem
        by = pos[k]["deslocamento"][1] - origem[1] - miny + margem
        # Tiles sem o mesmo deslocamento (a caixa é o mesmo retângulo do TMX): desenho por caixa.
        desenhar_subarea(img, tileset, sprites, d, bx, by, 1)
    img.save(destino)
    return destino


RESUMO_POR_ID = {}


def main():
    global RESUMO_POR_ID
    subs, resumo = carregar_subareas()
    RESUMO_POR_ID = {s["id"]: s for s in resumo["subareas"]}
    SAIDA.mkdir(parents=True, exist_ok=True)
    feitos = [planta(subs, resumo, SAIDA / "planta-girada.png")]
    for nome in ordem_ok:
        feitos.append(area(subs, nome, SAIDA / f"area-{nome}.png"))
    for f in feitos:
        print(f)


if __name__ == "__main__":
    sys.exit(main())
