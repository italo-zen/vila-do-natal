#!/usr/bin/env python3
"""Prévia da P2 (Sala + Quarto + Suíte) a partir de um TMX de trabalho.

Lê um TMX de trabalho (por padrão, o de prova em scratch) pelo próprio conversor (em memória, sem gravar
content/) e desenha a planta girada: piso livre, piso bloqueado, vão, gatilhos, chegadas e portas.
Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_p2_opcao.py <tmx> <saida.png>
"""
import importlib.util
import sys
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
spec = importlib.util.spec_from_file_location("conv", RAIZ / "tools-arte" / "tmx_para_conteudo.py")
conv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(conv)

DELTA = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}
ESC = 26
X0, X1, Y0, Y1 = -7, 9, -17, 0
CORES = {"fundo": (11, 16, 48), "livre": (222, 206, 160), "bloq": (92, 74, 58), "vao": (30, 60, 120),
         "gatilho": (244, 150, 40), "chegada": (80, 200, 110), "fechada": (200, 50, 60), "linha": (255, 255, 255)}


class Col:
    def __init__(self):
        self.erros, self.avisos = [], []

    def erro(self, c, m):
        self.erros.append((c, m))

    def aviso(self, c, m):
        self.avisos.append((c, m))


def main(argv):
    tmx, saida = Path(argv[0]), Path(argv[1])
    col = Col()
    perfil = conv.carregar_perfil("hd-480x352")
    res = conv.converter(tmx, perfil, col, (), True)
    if res is None:
        print("erros:", col.erros)
        return 1
    img = Image.new("RGB", ((X1 - X0 + 1) * ESC, (Y1 - Y0 + 1) * ESC), CORES["fundo"])
    d = ImageDraw.Draw(img)
    mapa = {}
    chegadas = []
    for s in res["subareas"]:
        bx, by = s["deslocamento"]
        doc = s["doc"]
        for j in range(doc["altura"]):
            for k in range(doc["largura"]):
                i = j * doc["largura"] + k
                p = (bx + k, by + j)
                if doc["chao"][i] > 0:
                    mapa[p] = ("bloq" if doc["colisao"][i] else "livre", s["id"])
        for o in doc["objetos"]:
            p = (bx + o["x"], by + o["y"])
            if o["tipo"] == "porta":
                mapa[p] = ("gatilho", s["id"], o["id"])
            elif o["tipo"] == "portaFechada":
                mapa[p] = ("fechada", s["id"], o["id"])
            elif o["tipo"] == "spawn":
                chegadas.append(p)
        # vão do lado: primeiro tile fora do piso ao lado de cada gatilho (saída)
        for o in doc["objetos"]:
            if o["tipo"] == "porta":
                g = (bx + o["x"], by + o["y"])
                dx, dy = DELTA[o["saida"]]
                v = (g[0] + dx, g[1] + dy)
                if v not in mapa:
                    mapa[v] = ("vao", s["id"])
    for p, v in mapa.items():
        x, y = (p[0] - X0) * ESC, (p[1] - Y0) * ESC
        if v[0] == "vao":
            d.rectangle([x, y, x + ESC - 1, y + ESC - 1], fill=CORES["vao"])
            d.line([x, y, x + ESC - 1, y + ESC - 1], fill=CORES["linha"])
            d.line([x + ESC - 1, y, x, y + ESC - 1], fill=CORES["linha"])
        else:
            d.rectangle([x, y, x + ESC - 1, y + ESC - 1], fill=CORES[v[0]], outline=(40, 40, 40))
    for p in chegadas:
        x, y = (p[0] - X0) * ESC, (p[1] - Y0) * ESC
        d.rectangle([x + 4, y + 4, x + ESC - 5, y + ESC - 5], outline=CORES["chegada"], width=3)
    # contorno das caixas e nomes
    for s in res["subareas"]:
        bx, by = s["deslocamento"]
        if s["id"] in ("sala", "quarto", "suite_casal"):
            x0, y0 = (bx - X0) * ESC, (by - Y0) * ESC
            d.rectangle([x0, y0, x0 + s["largura"] * ESC - 1, y0 + s["altura"] * ESC - 1],
                        outline=(255, 255, 0) if s["id"] == "quarto" else (150, 150, 255), width=2)
            d.text((x0 + 4, y0 + 2), s["id"], fill=(255, 255, 255))
    d.text((6, 6), "P2 APLICADA AO TMX DE JOGO: Sala, Quarto, Suite", fill=(255, 255, 255))
    img.save(saida)
    print("prévia gravada:", saida)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
