#!/usr/bin/env python3
"""Folha de contato das capturas de tools-arte/captura_caixa.mjs: tools-arte/preview/caixa-folha.png (Pillow)."""
import json
from PIL import Image, ImageDraw
D = "tools-arte/preview/caixa-candidatos/"
r = json.load(open(D + "relatorio-caixa.json"))
C = 176; cols = 6; rows = (len(r) + cols - 1) // cols
out = Image.new("RGB", (cols * C, rows * (C + 16)), (11, 16, 48)); g = ImageDraw.Draw(out)
for i, e in enumerate(sorted(r, key=lambda e: e["k"])):
    m, xy = e["k"].split(":"); x, y = map(int, xy.split(","))
    im = Image.open(D + f"caixa-{m}-{x}-{y}.png").convert("RGB")
    cx = (e["imagens"][0]["x"] + 16) * 2; cy = (e["imagens"][0]["y"] + 16) * 2
    c = im.crop((max(0, cx - C // 2), max(0, cy - C // 2), min(im.width, cx + C // 2), min(im.height, cy + C // 2)))
    X = (i % cols) * C; Y = (i // cols) * (C + 16); out.paste(c, (X, Y + 16)); g.text((X + 3, Y + 2), f"{m} ({x},{y})", fill=(255, 255, 255))
out.save("tools-arte/preview/caixa-folha.png"); print(out.size)
