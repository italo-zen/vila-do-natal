#!/usr/bin/env python3
"""Folhas de contato das capturas de tools-arte/captura_pecas_nick.mjs: pecas-22-folha.png e nick-amostra-folha.png (Pillow)."""
import glob, json, os
from PIL import Image, ImageDraw
D = "tools-arte/preview/pecas-22/"
r = json.load(open(D + "relatorio-pecas.json"))
C = 176; cols = 6; rows = (len(r) + cols - 1) // cols
out = Image.new("RGB", (cols * C, rows * (C + 16)), (11, 16, 48)); g = ImageDraw.Draw(out)
for i, e in enumerate(sorted(r, key=lambda e: e["k"])):
    m, xy = e["k"].split(":"); x, y = map(int, xy.split(","))
    im = Image.open(D + f"peca-{m}-{x}-{y}.png").convert("RGB")
    cx = (e["imagens"][0]["x"] + 16) * 2; cy = (e["imagens"][0]["y"] + 16) * 2
    c = im.crop((max(0, cx - C // 2), max(0, cy - C // 2), min(im.width, cx + C // 2), min(im.height, cy + C // 2)))
    X = (i % cols) * C; Y = (i // cols) * (C + 16); out.paste(c, (X, Y + 16)); g.text((X + 3, Y + 2), f"{m} ({x},{y}) peca {e['ordem']}", fill=(255, 255, 255))
out.save("tools-arte/preview/pecas-22-folha.png")
ns = sorted(glob.glob(D + "nick-*.png")); W = 4; cell = (480, 352)
sheet = Image.new("RGB", (W * cell[0], ((len(ns) + W - 1) // W) * (cell[1] + 16)), (11, 16, 48)); g = ImageDraw.Draw(sheet)
for i, f in enumerate(ns):
    X = (i % W) * cell[0]; Y = (i // W) * (cell[1] + 16); sheet.paste(Image.open(f).convert("RGB").resize(cell), (X, Y + 16)); g.text((X + 3, Y + 2), os.path.basename(f)[5:-4], fill=(255, 255, 255))
sheet.save("tools-arte/preview/nick-amostra-folha.png")
