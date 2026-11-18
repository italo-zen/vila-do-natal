#!/usr/bin/env python3
"""Prévia dos objetos de jogo na planta nova (backlog 164, Arte 2026-11-17).

Lê content/maps/casa-real/<id>.json (já girado, o que o motor lê) e desenha, por área aberta, o piso, as paredes
(arestas), as portas, os móveis e os objetos de jogo, com a coordenada de cada tile. Não é a cena do jogo.
Saída: tools-arte/preview/objetos-164.png. Uso: python3 tools-arte/preview_objetos_164.py (precisa de Pillow).
"""
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
C = RAIZ / "content" / "maps" / "casa-real"
SAIDA = RAIZ / "tools-arte" / "preview" / "objetos-164.png"
T = 44
AREAS = [("hall", "Hall"), ("sala", "Sala (escura)"), ("cozinha", "Cozinha (cima) e Lavanderia (baixo)"),
         ("escritorio", "Escritório")]
COR = {"interruptor": ((250, 200, 40), "I"), "arvore": ((40, 150, 70), "Á"), "bilhete": ((240, 240, 240), "B"),
       "peca": ((230, 90, 60), "P"), "examinavel": ((150, 110, 200), "E"), "enfeite": ((60, 140, 230), "C"),
       "elevador": ((20, 20, 20), "El")}
NOMES = {(2, 0): ""}


def f(n):
    for c in ("/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"):
        try:
            return ImageFont.truetype(c, n)
        except OSError:
            pass
    return ImageFont.load_default()


def desenhar(ident, titulo):
    d = json.loads((C / f"{ident}.json").read_text(encoding="utf-8"))
    w, h = d["largura"], d["altura"]
    M = 30
    im = Image.new("RGB", (w * T + 2 * M, h * T + 2 * M + 34), (255, 255, 255))
    g = ImageDraw.Draw(im)
    g.text((M, 6), titulo + f"  ({w}x{h})", fill=(0, 0, 0), font=f(16))
    ox, oy = M, M + 28
    movel = {}
    for o in d["objetos"]:
        if o["tipo"] == "movel":
            for yy in range(o["y"], o["y"] + o["h"]):
                for xx in range(o["x"], o["x"] + o["w"]):
                    movel[(xx, yy)] = o["nome"]
    for x in range(w):
        g.text((ox + x * T + T // 2 - 6, oy - 16), str(x), fill=(120, 120, 120), font=f(12))
    for y in range(h):
        g.text((6, oy + y * T + T // 2 - 7), str(y), fill=(120, 120, 120), font=f(12))
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if not d["chao"][i]:
                continue
            bx, by = ox + x * T, oy + y * T
            cor = (225, 205, 170) if d["colisao"][i] == 0 else (140, 140, 140)
            g.rectangle([bx, by, bx + T, by + T], fill=cor, outline=(200, 185, 155))
            if (x, y) in movel:
                g.text((bx + 2, by + T - 14), movel[(x, y)][:7], fill=(255, 255, 255), font=f(11))
    for y in range(h):
        for x in range(w):
            i = y * w + x
            if not d["chao"][i]:
                continue
            m = d["paredes"][i]
            bx, by = ox + x * T, oy + y * T
            if m & 1: g.line([bx, by, bx + T, by], fill=(30, 30, 30), width=4)
            if m & 2: g.line([bx + T, by, bx + T, by + T], fill=(30, 30, 30), width=4)
            if m & 4: g.line([bx, by + T, bx + T, by + T], fill=(30, 30, 30), width=4)
            if m & 8: g.line([bx, by, bx, by + T], fill=(30, 30, 30), width=4)
    for o in d["objetos"]:
        bx, by = ox + o["x"] * T, oy + o["y"] * T
        if o["tipo"] == "porta":
            L = o["lado"]
            seg = {"cima": [bx + 8, by, bx + T - 8, by], "baixo": [bx + 8, by + T, bx + T - 8, by + T],
                   "esquerda": [bx, by + 8, bx, by + T - 8], "direita": [bx + T, by + 8, bx + T, by + T - 8]}[L]
            g.line(seg, fill=(40, 120, 255), width=7)
            tx = {"cima": bx + 4, "baixo": bx + 4, "esquerda": bx + 3, "direita": bx + 3}[L]
            g.text((bx + 3, by + (3 if L != "baixo" else T - 28)), o["id"].split("-")[0][:6] + ">", fill=(40, 90, 200), font=f(10))
        elif o["tipo"] == "spawn" and o.get("nome") == "elevador":
            g.ellipse([bx + 6, by + 6, bx + T - 6, by + T - 6], fill=COR["elevador"][0])
            g.text((bx + 12, by + 14), "El", fill=(255, 255, 255), font=f(14))
        elif o["tipo"] in COR:
            cor, s = COR[o["tipo"]]
            if o["tipo"] == "peca":
                s = f"P{o['ordem']}"
            g.ellipse([bx + 6, by + 6, bx + T - 6, by + T - 6], fill=cor, outline=(0, 0, 0))
            g.text((bx + 13, by + 13), s, fill=(0, 0, 0), font=f(15))
            if o["tipo"] == "bilhete":
                L = o["lado"]
                p = {"cima": (bx + T // 2, by + 2), "baixo": (bx + T // 2, by + T - 2),
                     "esquerda": (bx + 2, by + T // 2), "direita": (bx + T - 2, by + T // 2)}[L]
                g.ellipse([p[0] - 4, p[1] - 4, p[0] + 4, p[1] + 4], fill=(220, 0, 0))
    # spawns de chegada (pequeno ponto cinza com seta de direção)
    for o in d["objetos"]:
        if o["tipo"] == "spawn" and o.get("nome") != "elevador":
            bx, by = ox + o["x"] * T + T // 2, oy + o["y"] * T + T // 2
            dx, dy = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}[o["direcao"]]
            g.line([bx, by, bx + dx * 12, by + dy * 12], fill=(90, 90, 90), width=2)
            g.ellipse([bx - 3, by - 3, bx + 3, by + 3], fill=(90, 90, 90))
    return im


def main():
    ims = [desenhar(a, t) for a, t in AREAS]
    leg = ("Legenda: preto = parede (aresta); azul = porta; ponto cinza + linha = chegada (direção); cinza escuro = bloqueado;\n"
           "El = elevador (início); I = interruptor; Á = árvore; B = bilhete (ponto vermelho = parede lida);\n"
           "P1 a P3 = peças; E = examinável (Fogão, Pia, Geladeira); C = caixa de enfeite. Sala e Cozinha são escuras.")
    W = max(i.width for i in ims[:2]) * 1 + 20
    colA = ims[1].width
    wtot = max(ims[1].width + ims[0].width, ims[2].width + ims[3].width, 900) + 40
    htot = max(ims[1].height, ims[0].height) + max(ims[2].height, ims[3].height) + 100
    out = Image.new("RGB", (wtot, htot), (255, 255, 255))
    out.paste(ims[1], (10, 10)); out.paste(ims[0], (ims[1].width + 30, 10))
    y2 = max(ims[1].height, ims[0].height) + 30
    out.paste(ims[2], (10, y2)); out.paste(ims[3], (ims[2].width + 30, y2))
    ImageDraw.Draw(out).text((10, htot - 60), leg, fill=(0, 0, 0), font=f(13))
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    out.save(SAIDA)
    print(SAIDA)


if __name__ == "__main__":
    main()
