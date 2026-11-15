#!/usr/bin/env python3
"""
Captura simples de conferência da decoração (ADR-010; item 153): um PNG por cômodo, com o mapa renderizado como o
jogo desenha (piso do tileset; paredes e vazio não aparecem; móveis como retângulo com o rótulo; enfeites com o sprite
real). Serve para ver se algum enfeite cai no vazio ou sobre um rótulo.

Uso: /usr/bin/python3 tools-arte/captura_decoracao_m7.py <pasta_de_saida>   (fora do Git, em scratchpad)
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
MAPAS = RAIZ / "content" / "maps" / "casa-real"
DECOR = RAIZ / "content" / "maps" / "decoracao"
ATLAS = RAIZ / "assets" / "hd-480x352"
TILE = 32
ESCALA = 2
COR_VAZIO = (11, 16, 48)
COR_MOVEL = (138, 106, 74)
COR_BORDA_MOVEL = (70, 48, 31)
COR_ROTULO = (244, 233, 200)
SUBAREAS = ["hall", "sala", "cozinha", "quarto", "escritorio"]


def carregar_tileset():
    return Image.open(ATLAS / "tiles_casa.png").convert("RGBA")


def desenhar(subarea, tiles, saida: Path):
    mapa = json.loads((MAPAS / f"{subarea}.json").read_text(encoding="utf-8"))
    w, h = mapa["largura"], mapa["altura"]
    imagem = Image.new("RGB", (w * TILE, h * TILE), COR_VAZIO)
    for i, gid in enumerate(mapa["chao"]):
        if gid <= 0:
            continue
        x, y = (i % w) * TILE, (i // w) * TILE
        k = gid - 1
        recorte = tiles.crop(((k % 32) * TILE, (k // 32) * TILE, (k % 32) * TILE + TILE, (k // 32) * TILE + TILE))
        imagem.paste(recorte, (x, y), recorte)
    d = ImageDraw.Draw(imagem)
    for o in mapa["objetos"]:
        if o["tipo"] != "movel":
            continue
        x, y, mw, mh = o["x"] * TILE, o["y"] * TILE, o["w"] * TILE, o["h"] * TILE
        d.rectangle([x + 1, y + 1, x + mw - 2, y + mh - 2], fill=COR_MOVEL, outline=COR_BORDA_MOVEL)
        if o["w"] >= 2:  # rótulo: o jogo centraliza o nome no móvel
            d.text((x + mw // 2 - 14, y + mh // 2 - 5), o["nome"][:6], fill=COR_ROTULO)
    dados = json.loads((DECOR / f"{subarea}.json").read_text(encoding="utf-8"))
    for e in dados["enfeites"]:
        sprite = Image.open(ATLAS / (e["sprite"] + ".png")).convert("RGBA")
        sprite = sprite.crop((0, 0, TILE, TILE)) if sprite.width > TILE else sprite
        imagem.paste(sprite, (e["x"] * TILE, e["y"] * TILE), sprite)
        d.rectangle([e["x"] * TILE, e["y"] * TILE, e["x"] * TILE + TILE - 1, e["y"] * TILE + TILE - 1], outline=(255, 0, 255))
    imagem.resize((imagem.width * ESCALA, imagem.height * ESCALA), Image.Resampling.NEAREST).save(saida)
    return len(dados["enfeites"])


def main(argv):
    if not argv:
        print(__doc__)
        return 2
    pasta = Path(argv[0])
    pasta.mkdir(parents=True, exist_ok=True)
    tiles = carregar_tileset()
    for sub in SUBAREAS:
        n = desenhar(sub, tiles, pasta / f"decoracao-{sub}.png")
        print(f"{sub}: {n} enfeites -> {pasta / f'decoracao-{sub}.png'}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
