#!/usr/bin/env python3
"""Prévias do Marco 2 (Arte, item 049/059/050): Sala, Quarto, Escritório, Cozinha e Lavanderia, e o mapa girado inteiro.

Desenha como o jogador vê (tela 15×11 tiles de 32 px, escala 2), a partir de content/maps/casa-real/*.json e de
assets/hd-480x352. Posições de tela e de mapa vêm de tools-arte/golden/casa-real/resumo.json.

Regras de desenho (GDD 14.10.9 e 14.10.10, 15.2 e 15.3.3; ADR-004 seções 3 e 6):
- porta fechada (portaFechada): spr_porta (saida cima/baixo) ou spr_porta_vertical (saida esquerda/direita), faixa
  fina na aresta entre o tile da porta e o chão de dentro (lado oposto à saída). O sprite 32×32 é posto com o centro
  da faixa na aresta (origem 0,5). Quem faz isso no motor é o Dev: ver docs/mapa-casa-real.md, seção 8.
- passagem (par `porta` aberto): sem sprite de porta; o tile já é a passagem (gid 537/538). Seta se a saída for lateral
  (sobre o gatilho); tapete se a saída for para baixo (sobre o vão). Saída para cima: nada.
- P8 trancada (porta no vão): spr_porta na aresta do vão que encosta no gatilho.
- peça visível: spr_peca_N com halo dourado (aproximação do halo do motor); peça escondida não desenha nada no jogo.
  Nesta prévia, cada peça escondida tem um marcador de revisão (contorno magenta), que NÃO é do jogo.
- interruptor com brilho (alfa 0,28, raio 0,625 tile); árvore estado desmontada; bilhete; móveis como retângulo de madeira.
- linha 10 da tela (sob a barra, GDD 14.8) escurecida e rotulada.
- piso bloqueado é mostrado escurecido, para a revisão do bloqueio (não é a arte final).

Saídas (tools-arte/previews/): m2-sala.png, m2-quarto.png, m2-escritorio.png, m2-cozinha.png, m2-mapa-girado.png,
m2-arvore-estados.png.
Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_marco2.py   (precisa de Pillow)
"""
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
CONTEUDO = RAIZ / "content" / "maps" / "casa-real"
ASSETS = RAIZ / "assets" / "hd-480x352"
GOLDEN = RAIZ / "tools-arte" / "golden" / "casa-real"
SAIDA = RAIZ / "tools-arte" / "previews"
TELA = (15, 11)
T = 32
ESCALA = 2
PX = T * ESCALA
FUNDO = (11, 16, 48, 255)                 # tema.fundo #0b1030
BARRA = (20, 24, 44, 255)
COR_MOVEL = (138, 90, 51, 255)
COR_MOVEL_BORDA = (90, 58, 31, 255)
COR_BLOQUEIO = (0, 0, 0, 120)             # piso bloqueado, escurecido (revisão)
COR_OURO = (244, 211, 94, 255)            # #f4d35e
COR_REVISAO = (255, 60, 220, 255)         # marcador de revisão (não é do jogo)
OPOSTO = {"cima": "baixo", "baixo": "cima", "esquerda": "direita", "direita": "esquerda"}
DIRECAO = {"cima": (0, -1), "baixo": (0, 1), "esquerda": (-1, 0), "direita": (1, 0)}

fonte = ImageFont.load_default()


def carregar_golden():
    r = json.loads((GOLDEN / "resumo.json").read_text(encoding="utf-8"))
    return r


def carregar_subareas(golden):
    saida = {}
    for s in golden["subareas"]:
        doc = json.loads((CONTEUDO / f"{s['id']}.json").read_text(encoding="utf-8"))
        saida[s["id"]] = {"doc": doc, "gold": s}
    return saida


def abrir(nome):
    return Image.open(ASSETS / nome).convert("RGBA")


SPR = {}


def sprite(nome):
    if nome not in SPR:
        im = abrir(nome)
        SPR[nome] = im.resize((im.width * ESCALA, im.height * ESCALA), Image.NEAREST)
    return SPR[nome]


ATLAS = None


def tile_do_piso(gid):
    """gid local de content (1 = primeiro do tiles_casa) -> recorte 32×32 do atlas, ampliado."""
    global ATLAS
    if ATLAS is None:
        ATLAS = abrir("tiles_casa.png")
    i = gid - 1
    x, y = (i % 32) * T, (i // 32) * T
    return ATLAS.crop((x, y, x + T, y + T)).resize((PX, PX), Image.NEAREST)


def ponto(tela_xy, x, y):
    """Coordenada de pixel de um tile da subárea na imagem (já com o deslocamento de tela)."""
    return ((tela_xy[0] + x) * PX, (tela_xy[1] + y) * PX)


def colar_no_tile(img, spr, px, py, cx=None, cy=None):
    """Cola sprite 32×32 (escala 2) com canto em (px, py) em pixel de imagem, sem cortar fora da imagem."""
    img.alpha_composite(spr, (int(px), int(py)))


def faixa_na_aresta(img, spr_h, spr_v, tx, ty, lado, tela_xy):
    """Faixa fina de porta na aresta `lado` do tile (tx, ty) da subárea: centro do sprite na aresta."""
    x0, y0 = ponto(tela_xy, tx, ty)
    if lado == "cima":
        cx, cy, sp = x0 + PX // 2, y0, spr_h
    elif lado == "baixo":
        cx, cy, sp = x0 + PX // 2, y0 + PX, spr_h
    elif lado == "esquerda":
        cx, cy, sp = x0, y0 + PX // 2, spr_v
    else:  # direita
        cx, cy, sp = x0 + PX, y0 + PX // 2, spr_v
    img.alpha_composite(sp, (int(cx - PX // 2), int(cy - PX // 2)))


def seta(img, tx, ty, lado, tela_xy):
    nome = {"direita": "spr_indicador_seta_direita.png", "esquerda": "spr_indicador_seta_esquerda.png"}[lado]
    x0, y0 = ponto(tela_xy, tx, ty)
    img.alpha_composite(sprite(nome), (x0, y0))


def tapete(img, tx, ty, tela_xy):
    x0, y0 = ponto(tela_xy, tx, ty)
    img.alpha_composite(sprite("spr_indicador_tapete.png"), (x0, y0))


def halo(img, x0, y0, cor=COR_OURO, alfa=110, margem=4):
    """Brilho dourado em volta do tile (aproximação do halo do motor, GDD 15.2.4)."""
    camada = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(camada)
    d.rounded_rectangle([x0 - margem, y0 - margem, x0 + PX + margem, y0 + PX + margem], radius=8,
                        outline=(*cor[:3], alfa), width=6)
    img.alpha_composite(camada)


def desenhar_subarea(img, area, tela_xy, golden_orig, peca_mostra=None, revisao=True, peca_todas=False):
    """Desenha uma subárea na imagem. tela_xy = (x, y) em tiles de tela; golden_orig = origem para mapa girado."""
    doc = area["doc"]
    W, H = doc["largura"], doc["altura"]
    chao, colisao = doc["chao"], doc["colisao"]
    objs = doc["objetos"]
    # piso e bloqueio
    for y in range(H):
        for x in range(W):
            i = y * W + x
            if chao[i] > 0:
                img.alpha_composite(tile_do_piso(chao[i]), ponto(tela_xy, x, y))
                if colisao[i] == 1:
                    x0, y0 = ponto(tela_xy, x, y)
                    camada = Image.new("RGBA", (PX, PX), COR_BLOQUEIO)
                    img.alpha_composite(camada, (x0, y0))
    # móveis (retângulo de madeira, como o motor)
    d = ImageDraw.Draw(img)
    for o in objs:
        if o["tipo"] != "movel":
            continue
        x0, y0 = ponto(tela_xy, o["x"], o["y"])
        d.rectangle([x0 + 2, y0 + 2, x0 + o["w"] * PX - 3, y0 + o["h"] * PX - 3], fill=COR_MOVEL, outline=COR_MOVEL_BORDA, width=2)
        d.text((x0 + 6, y0 + 6), o["nome"], fill=(245, 230, 200, 255), font=fonte)
    # portas: fechadas (faixa na aresta) e trancadas (P8, no vão)
    for o in objs:
        if o["tipo"] == "portaFechada":
            lado = OPOSTO[o["saida"]]                     # aresta voltada para o chão de dentro
            faixa_na_aresta(img, sprite("spr_porta.png"), sprite("spr_porta_vertical.png"), o["x"], o["y"], lado, tela_xy)
            if o["saida"] in ("esquerda", "direita"):
                seta(img, o["x"], o["y"], o["saida"], tela_xy)
    for o in objs:
        if o["tipo"] != "porta":
            continue
        # par: saída = vão − gatilho. Indicadores (GDD 14.10.10); a passagem é o próprio tile.
        lado = SAIDAS[(area["gold"]["id"], o["id"])]
        dx, dy = DIRECAO[lado]
        if lado in ("esquerda", "direita"):
            seta(img, o["x"], o["y"], lado, tela_xy)
        if lado == "baixo":
            tapete(img, o["x"] + dx, o["y"] + dy, tela_xy)
        if o.get("trancadaAte"):
            # P8 trancada: porta no vão, na aresta que encosta no gatilho (oposta à saída)
            vx, vy = o["x"] + dx, o["y"] + dy
            faixa_na_aresta(img, sprite("spr_porta.png"), sprite("spr_porta_vertical.png"), vx, vy, OPOSTO[lado], tela_xy)
    # interruptor com brilho
    for o in objs:
        if o["tipo"] == "interruptor":
            x0, y0 = ponto(tela_xy, o["x"], o["y"])
            camada = Image.new("RGBA", img.size, (0, 0, 0, 0))
            cx, cy = x0 + PX // 2, y0 + PX // 2
            r = int(0.625 * PX)
            ImageDraw.Draw(camada).ellipse([cx - r, cy - r, cx + r, cy + r], fill=(244, 211, 94, int(255 * 0.28)))
            img.alpha_composite(camada)
            img.alpha_composite(sprite("spr_interruptor.png"), (x0, y0))
    # árvore (estado desmontada na Sala)
    for o in objs:
        if o["tipo"] == "arvore":
            x0, y0 = ponto(tela_xy, o["x"], o["y"])
            nome = {"desmontada": "spr_arvore_desmontada.png", "1parte": "spr_arvore_1parte.png",
                    "2partes": "spr_arvore_2partes.png", "completa": "spr_arvore_completa.png"}[o["estado"]]
            img.alpha_composite(sprite(nome), (x0, y0))
    # bilhete e examináveis
    for o in objs:
        if o["tipo"] == "bilhete":
            x0, y0 = ponto(tela_xy, o["x"], o["y"])
            img.alpha_composite(sprite("spr_bilhete.png"), (x0, y0))
    # peças
    for o in objs:
        if o["tipo"] != "peca":
            continue
        x0, y0 = ponto(tela_xy, o["x"], o["y"])
        n = o["ordem"]
        mostra = peca_todas or o["estadoInicial"] == "visivel"
        if mostra:
            halo(img, x0, y0)
            img.alpha_composite(sprite(f"spr_peca_{n}.png"), (x0, y0))
        if revisao and not mostra:
            ImageDraw.Draw(img).rectangle([x0 + 1, y0 + 1, x0 + PX - 2, y0 + PX - 2], outline=COR_REVISAO, width=3)
            ImageDraw.Draw(img).text((x0 + 4, y0 + 4), f"p{n}", fill=COR_REVISAO, font=fonte)
    return img


SAIDAS = {}   # (id da subárea, id da porta) -> lado de saída (vão − gatilho), GDD 14.10.10


def calcular_saidas(areas, golden):
    """Saída de cada gatilho de par = vão − gatilho. O vão é o ponto médio entre os dois gatilhos de mesmo id
    (em coordenadas globais da planta girada); funciona entre subáreas diferentes (P2, P3, P7, P8)."""
    orig = golden["origemDaCasa"]
    por_id = {}
    for k, a in areas.items():
        dx, dy = a["gold"]["deslocamento"]
        for o in a["doc"]["objetos"]:
            if o["tipo"] == "porta":
                por_id.setdefault(o["id"], []).append((k, (dx - orig[0] + o["x"], dy - orig[1] + o["y"])))
    nomes = {(0, -1): "cima", (0, 1): "baixo", (-1, 0): "esquerda", (1, 0): "direita"}
    SAIDAS.clear()
    for pid, lst in por_id.items():
        if len(lst) != 2:
            continue
        (_, pa), (_, pb) = lst[0], lst[1]
        vao = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
        for k, p in lst:
            d = (int(vao[0] - p[0]), int(vao[1] - p[1]))
            SAIDAS[(k, pid)] = nomes[d]


def tela_da_area(area):
    return tuple(area["gold"]["deslocamentoNaTela"])


def nova_tela():
    img = Image.new("RGBA", (TELA[0] * PX, TELA[1] * PX), FUNDO)
    d = ImageDraw.Draw(img)
    d.rectangle([0, (TELA[1] - 1) * PX, TELA[0] * PX, TELA[1] * PX], fill=BARRA)
    d.text((8, (TELA[1] - 1) * PX + 10), "barra de controles (linha 10 da tela; sem jogo)", fill=(150, 150, 170, 255), font=fonte)
    return img


def rotulo(img, texto):
    ImageDraw.Draw(img).text((8, 8), texto, fill=(255, 255, 255, 255), font=fonte)


def gravar(img, nome):
    SAIDA.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(SAIDA / nome, optimize=True)
    print("gravado", SAIDA / nome, img.size)


def previa_de_area(areas, nome_area, arquivo, titulo, peca_todas=False):
    img = nova_tela()
    tela = tela_da_area(areas[nome_area])
    desenhar_subarea(img, areas[nome_area], tela, None, peca_todas=peca_todas)
    rotulo(img, titulo)
    gravar(img, arquivo)


def previa_sala_cozinha(areas, arquivo, titulo, peca_todas):
    """Sala e Cozinha (com Lavanderia) numa mesma tela grande só para a visão de conjunto do Marco 2."""
    golden = carregar_golden()
    tudo = {"sala": areas["sala"], "cozinha": areas["cozinha"]}
    minx = min(v["gold"]["deslocamentoNaTela"][0] for v in tudo.values())
    img = Image.new("RGBA", (TELA[0] * PX, TELA[1] * PX), FUNDO)
    for k in tudo:
        desenhar_subarea(img, tudo[k], tela_da_area(tudo[k]), None, peca_todas=peca_todas)
    rotulo(img, titulo)
    gravar(img, arquivo)


def mapa_girado(areas, golden, arquivo):
    orig = golden["origemDaCasa"]
    xs, ys = [], []
    for k, a in areas.items():
        dx, dy = a["gold"]["deslocamento"]
        xs += [dx - orig[0], dx - orig[0] + a["gold"]["largura"]]
        ys += [dy - orig[1], dy - orig[1] + a["gold"]["altura"]]
    W, H = max(xs) + 1, max(ys) + 1
    img = Image.new("RGBA", (W * PX, H * PX), FUNDO)
    for k, a in areas.items():
        dx, dy = a["gold"]["deslocamento"]
        tela = (dx - orig[0], dy - orig[1])
        desenhar_subarea(img, a, tela, None, peca_todas=True)
    rotulo(img, "Mapa girado inteiro (Marco 2). Peças mostradas todas (revisão). Sem tela de jogo: 15x11 não cabe.")
    gravar(img, arquivo)


def arvore_estados(arquivo):
    """Os quatro estados da árvore (GDD 15.4) no tile (3, 8) da Sala, com o chão ao redor, em escala 2."""
    estados = ["spr_arvore_desmontada.png", "spr_arvore_1parte.png", "spr_arvore_2partes.png", "spr_arvore_completa.png"]
    rotulos = ["0 desmontada", "1 parte", "2 partes", "3 partes (sem enfeite)"]
    chao = tile_do_piso(310)
    cada = PX * 3
    img = Image.new("RGBA", (cada * 4 + 30, PX * 3 + 60), FUNDO)
    d = ImageDraw.Draw(img)
    for i, (nome, rot) in enumerate(zip(estados, rotulos)):
        x0 = 15 + i * cada
        for ty in range(3):
            for tx in range(3):
                img.alpha_composite(chao, (x0 + tx * PX, 30 + ty * PX))
        img.alpha_composite(sprite(nome), (x0 + PX, 30 + PX * 2 - PX))
        d.text((x0 + 4, 8), rot, fill=(255, 255, 255, 255), font=fonte)
    gravar(img, arquivo)


def main():
    golden = carregar_golden()
    areas = carregar_subareas(golden)
    calcular_saidas(areas, golden)
    previa_de_area(areas, "sala", "m2-sala.png", "Sala (Marco 2): alcova com P1, P2 e P3; parte 1 visível (1,4). Regra da barra: linha 10.")
    previa_de_area(areas, "quarto", "m2-quarto.png", "Quarto: P2 abre pela alcova da Sala (vão de 1 tile, chegada em (3,-10) da planta girada); P4 porta fechada para o Banheiro Casal.")
    previa_de_area(areas, "escritorio", "m2-escritorio.png", "Escritório: passagem P3 à esquerda (gatilho em (4,-8) do mapa); P6 fechada para o Banheiro do Escritório.")
    previa_de_area(areas, "cozinha", "m2-cozinha.png", "Cozinha e Lavanderia: parte 2 em (4,1), parte 3 em (3,5). Marcador magenta = peça escondida (revisão, não é do jogo).")
    mapa_girado(areas, golden, "m2-mapa-girado.png")
    arvore_estados("m2-arvore-estados.png")


if __name__ == "__main__":
    main()
