#!/usr/bin/env python3
"""Prévia dos indicadores de porta (Arte, item 046, PT2b): a tela da Sala e a tela do Hall, como o jogador vê.

Cada área é desenhada na sua posição de tela (ADR-004, seção 2; GDD 14.12.2): Sala em (2, 0), Hall em (5, 4),
numa tela de 15×11 tiles. Piso por gid de content/maps/casa-real/*.json, objetos por tipo, sprites de
assets/hd-480x352. A linha 10 da tela (sob a barra, GDD 14.8) aparece escura e marcada como "barra".

Regra dos indicadores (GDD 14.10.10, item 046; Produto, 2026-11-08, substitui a versão anterior da Arte):
- saída para cima (P1, P2, P3, P8 vista do Hall): nenhum indicador;
- saída para a direita/esquerda: seta branca sobre o tile da porta (P7 da Sala: direita; P7 da Cozinha: esquerda);
- saída para baixo (P8 vista da Sala): tapete no tile de chão onde o jogador nasce, (6, 6). Não ocupa gatilho nem vão.
Os indicadores são estáticos e só desenho: não criam colisão nem gatilho.

Portas: P1 e P3 estão em parede vertical (spr_porta_vertical); P2 e P8 em parede horizontal (spr_porta).
P8 é desenhada no vão (2·gatilho − spawn, como em preview_casa.py), não no gatilho.
P7 (passagem aberta) é desenhada pelo tile 538 da planta; o indicador fica por cima.

Saídas (tools-arte/previews/): indicadores-sala.png, indicadores-hall.png, indicadores-cozinha.png.
Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_indicadores.py   (precisa de Pillow)
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
ESCALA = 2
T = 32
PX = T * ESCALA
FUNDO = (11, 16, 48, 255)        # tema.fundo #0b1030
BARRA = (30, 34, 60, 255)        # faixa da barra (escura, só para conferência)
COR_MOVEL = (138, 90, 51, 255)   # placeholder do móvel (decisions.md, 2026-11-08)
COR_MOVEL_BORDA = (90, 58, 31, 255)

# Posição de tela de cada área (golden/casa-real/resumo.json, deslocamentoNaTela; GDD 14.12.2).
TELA_DA_AREA = {"sala": (2, 0), "hall": (5, 4), "cozinha": (4, 2)}

# Indicadores do Marco 1 (tile da subárea -> sprite). Decisão de 2026-11-08, ver docstring.
INDICADORES = {
    "sala": [
        {"tile": (6, 2), "sprite": "indicador_seta_esquerda", "porta": "P1"},
        {"tile": (8, 2), "sprite": "indicador_seta_direita", "porta": "P3"},
        {"tile": (10, 5), "sprite": "indicador_seta_direita", "porta": "P7"},
        {"tile": (6, 8), "sprite": "indicador_tapete", "porta": "P8 (saída para baixo, vão, fora do piso)"},
    ],
    "hall": [],      # P8 vista do Hall é para cima: sem indicador
    "cozinha": [
        {"tile": (0, 0), "sprite": "indicador_seta_esquerda", "porta": "P7"},
    ],
}

# Orientação da folha de cada porta: "vertical" para parede vertical (P1, P3), "horizontal" nas demais.
ORIENTACAO_DA_PORTA = {"P1": "vertical", "P3": "vertical", "P2": "horizontal", "P8": "horizontal"}


def carregar():
    tileset = Image.open(ASSETS / "tiles_casa.png").convert("RGBA")
    nomes = ["porta", "porta_vertical", "interruptor", "bilhete", "arvore_desmontada", "indicador_seta_direita",
             "indicador_seta_esquerda", "indicador_seta_baixo", "indicador_tapete"]
    sprites = {}
    for n in nomes:
        arq = "spr_arvore_desmontada.png" if n == "arvore_desmontada" else f"spr_{n}.png"
        sprites[n] = Image.open(ASSETS / arq).convert("RGBA")
    areas = {}
    for nome in TELA_DA_AREA:
        areas[nome] = json.loads((CONTEUDO / f"{nome}.json").read_text(encoding="utf-8"))
    return tileset, sprites, areas


def cola_tile(tileset, gid):
    pos = gid - 1
    x, y = (pos % 32) * T, (pos // 32) * T
    return tileset.crop((x, y, x + T, y + T))


def pos_tela(area, x, y):
    ox, oy = TELA_DA_AREA[area]
    return ((ox + x) * PX, (oy + y) * PX)


def colar(img, sprite, xy):
    img.alpha_composite(sprite.resize((PX, PX), Image.NEAREST), xy)


def desenhar(area, d, tileset, sprites, img):
    W, A = d["largura"], d["altura"]
    for y in range(A):
        for x in range(W):
            g = d["chao"][y * W + x]
            if g:
                t = cola_tile(tileset, g).resize((PX, PX), Image.NEAREST)
                img.paste(t, pos_tela(area, x, y), t)
    # Tapete: camada de chão (sob a porta da P8). Setas: camada de objeto (sobre a porta lateral).
    desenhar_indicadores(area, sprites, img, "chao")
    # Móveis (retângulos com contorno; é o placeholder do Dev, não a arte final)
    dr = ImageDraw.Draw(img)
    for o in d["objetos"]:
        if o["tipo"] == "movel":
            x0, y0 = pos_tela(area, o["x"], o["y"])
            x1, y1 = pos_tela(area, o["x"] + o["w"], o["y"] + o["h"])
            dr.rectangle([x0 + 2, y0 + 2, x1 - 3, y1 - 3], fill=COR_MOVEL, outline=COR_MOVEL_BORDA, width=2)
    for o in d["objetos"]:
        t = o["tipo"]
        if t == "arvore":
            colar(img, sprites["arvore_desmontada"], pos_tela(area, o["x"], o["y"]))
        elif t == "interruptor":
            colar(img, sprites["interruptor"], pos_tela(area, o["x"], o["y"]))
        elif t == "bilhete":
            colar(img, sprites["bilhete"], pos_tela(area, o["x"], o["y"]))
    # Portas: fechadas (P1 a P3) e a P8 no vão (2·gatilho − spawn), como em preview_casa.py.
    spawns = {s.get("nome"): s for s in d["objetos"] if s["tipo"] == "spawn"}
    for o in d["objetos"]:
        if o["tipo"] == "portaFechada":
            nome = ORIENTACAO_DA_PORTA.get(o["id"], "horizontal")
            colar(img, sprites["porta_vertical" if nome == "vertical" else "porta"], pos_tela(area, o["x"], o["y"]))
        elif o["tipo"] == "porta" and o.get("trancadaAte"):
            sp = spawns.get(o["id"])
            if sp:
                vx, vy = 2 * o["x"] - sp["x"], 2 * o["y"] - sp["y"]
                horizontal = o["x"] == sp["x"]
                colar(img, sprites["porta" if horizontal else "porta_vertical"], pos_tela(area, vx, vy))
    desenhar_indicadores(area, sprites, img, "objeto")


def desenhar_indicadores(area, sprites, img, camada):
    for ind in INDICADORES[area]:
        if ind["sprite"] == "indicador_tapete" and camada != "chao":
            continue
        if ind["sprite"] != "indicador_tapete" and camada != "objeto":
            continue
        colar(img, sprites[ind["sprite"]], pos_tela(area, *ind["tile"]))


def rotulos(area, d, img):
    dr = ImageDraw.Draw(img)
    fonte = ImageFont.load_default()
    for o in d["objetos"]:
        if o["tipo"] in ("portaFechada", "porta"):
            x, y = pos_tela(area, o["x"], o["y"])
            dr.text((x + 2, y + 2), o["id"], fill=(255, 255, 255, 255), font=fonte)
    for ind in INDICADORES[area]:
        x, y = pos_tela(area, *ind["tile"])
        dr.text((x + 2, y + PX - 14), ind["sprite"].replace("indicador_", "")[:14], fill=(255, 230, 120, 255), font=fonte)


def tela(area, tileset, sprites, d):
    img = Image.new("RGBA", (TELA[0] * PX, TELA[1] * PX), FUNDO)
    dr = ImageDraw.Draw(img)
    # Faixa da barra (linha 10 da tela, GDD 14.8): só marcação de conferência.
    dr.rectangle([0, 10 * PX, TELA[0] * PX - 1, TELA[1] * PX - 1], fill=BARRA)
    desenhar(area, d, tileset, sprites, img)
    rotulos(area, d, img)
    return img


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    tileset, sprites, areas = carregar()
    for area in ("sala", "hall", "cozinha"):
        img = tela(area, tileset, sprites, areas[area])
        destino = SAIDA / f"indicadores-{area}.png"
        img.save(destino)
        print(destino)


if __name__ == "__main__":
    main()
