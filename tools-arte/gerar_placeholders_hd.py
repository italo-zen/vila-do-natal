#!/usr/bin/env python3
"""
Placeholders do perfil HD `hd-480x352` (tile 32): piso e paredes, objetos e sprites.json.

Saída: assets/hd-480x352/
  tiles_casa.png     tileset 32×32, grade de 32 colunas × 17 linhas (1024×544). Índice k = posição k (a partir de 1).
  spr_porta.png              32×32   porta horizontal (P1 a P8; a P8 tem o painel)
  spr_porta_vertical.png     32×32   porta vertical (mesma porta girada)
  spr_interruptor.png        32×32
  spr_lampada.png            64×64
  spr_bilhete.png            32×32
  spr_arvore_desmontada.png  32×32   árvore (4 estados, GDD 7.2), no tile (3,8) da sala; base na base do tile
  spr_arvore_1parte.png      32×32
  spr_arvore_2partes.png     32×32
  spr_arvore_completa.png    32×32
  spr_pia.png                32×32   (examinável, content/maps/casa-real/cozinha.json)
  spr_fogao.png              64×32   (girado, planta girada)
  spr_geladeira.png          64×32   (girado, planta girada)
  spr_indicador_seta_direita.png   32×32   seta branca com contorno escuro (item 046; porta lateral, passagem para a direita)
  spr_indicador_seta_esquerda.png  32×32   a mesma seta espelhada (porta lateral, passagem para a esquerda)
  spr_indicador_seta_baixo.png     32×32   a mesma seta girada (porta de baixo, saída para baixo; sem uso no Marco 1)
  spr_indicador_tapete.png         32×32   tapete vermelho com borda clara (porta de baixo; saída para baixo)
  spr_seta_farejar_direita.png     32×32   seta de farejar dourada #f4d35e (GDD 16.5.3; ADR-005 7.1)
  spr_seta_farejar_esquerda.png    32×32   a mesma seta espelhada
  spr_seta_farejar_cima.png        32×32   a mesma seta girada para cima (P8 saindo do Hall)
  spr_icone_dica.png               32×32   "?" dourado em caixa #1b2452, borda 1 px #9aa3c7 (GDD 16.8.1)
  spr_balao_au.png                 48×32   bolha do balão, sem texto (o "Au!" é desenhado pelo jogo, nick.latido)
  spr_balao_zzz.png                48×32   balão com o zzz desenhado (GDD 16.5.5)
  spr_balao_exclamacao.png         16×24   "!" amarelo de acordar (ADR-005 7.1)
  spr_fumaca_dormir.png            96×32   fumacinha de dormir, 3 quadros de 32×32 (GDD 16.6)
  spr_enfeite_caixa.png            64×32   caixa de enfeite, 2 quadros de 32×32: 0 fechada, 1 aberta (GDD 17.3; backlog 088)
  spr_enfeite_flutuante.png        32×32   enfeite que sobe até a árvore no encaixe (GDD 17.4)
  spr_arvore_enfeitada.png         32×32   árvore com enfeites, estado 4 (GDD 17.5), mesma âncora de spr_arvore_completa
  spr_conquista_enfeites.png       96×96   ilustração da conquista da caixa (GDD 17.4, item 1), escala 3
  sprites.json               lista de imagens do perfil (ADR-003 seção 4), com as do Nick (spr_nick_*, de
                             tools-arte/gerar_nick.py; as entradas são escritas aqui, para o JSON sair de um só gerador)

  ctl_botao_a.png, ctl_botao_b.png (e _pressionado)  64 CSS px → 192×192, com a letra desenhada
  ctl_celular.png            folhas 4 × (288×288), 96 CSS px por quadro: celular girando, sem texto (GDD 18.8)
  ctl_analogico_base.png              360×360 (120 CSS px): base redonda do joystick, repouso (GDD 18.19.3)
  ctl_analogico_bolinha.png           144×144 (48 CSS px): bolinha em repouso
  ctl_analogico_bolinha_pressionada.png  144×144: bolinha com o dedo (creme #f4e9c8, borda #0b1030; separa do setor)
  ctl_analogico_brilho_<dir>.png      360×360: anel de 90° #f4d35e, de 52 a 60 CSS px, uma direção (cima, baixo, esquerda, direita; GDD 18.19.7; ADR-007 5.5)
  (o joystick não tem texto nem letra)
  (ícone "?" e "Fechar" não têm sprite novo: o "?" é spr_icone_dica; "Fechar" é texto da grade do painel.)

Os sobrinhos (spr_<nome>_*.png) não saem daqui: vêm de tools-arte/gerar_sobrinhos.py --perfil hd-480x352.

Tiles: os índices do `chao` de content/maps/casa-real/*.json são gids do TMX da Arte (ADR-004 seção 6).
Os gids são compartilhados entre cômodos (ex.: 1 e 310 aparecem em vários). Por isso a cor de cada tile
marca o tipo de cômodo onde o gid mais aparece; os gids que valem para vários cômodos ficam em tom neutro.
O piso real vem do tileset do Diretor. Placeholders, sem textura.

Paredes (533 a 536): o bilhete do Hall fica num tile de parede (GDD 14.10.9, item 040), com gid 533.

Planta girada (GDD 14.12, item 045): os tiles da planta (gids 1 a 536) e os objetos de móvel (pia, fogão,
geladeira) saem girados 90° no sentido horário, como imagem. Sobrinhos, Nick, árvore, interruptor, bilhete e
lâmpada ficam em pé (não giram). Passagens (gids 537 e 538, GDD 14.10.9, item 041) são desenhadas já na
orientação final e não giram de novo.

Portas (GDD 14.10.9, itens 043 e 044): vista superior, retângulo comprido de 28 × 10 px dentro de um tile 32×32.
`spr_porta.png` é a porta de parede horizontal; `spr_porta_vertical.png` é a mesma porta girada.

Indicadores de porta (GDD 14.12.3, item 046; referências assets/referencia/ref_porta_seta.webp e
ref_saida_tapete.webp): pixel art, 32×32, sem textura. Cada sprite é desenhado sobre o tile da porta (ou da saída).
Regra de uso (decidida pelo Diretor, 2026-11-08): porta para cima não tem indicador; lateral tem seta; porta
de baixo tem tapete (ou seta). Os sprites não são tiles: entram em sprites.json como imagens do perfil.

Python: /Library/Developer/CommandLineTools/usr/bin/python3 (com Pillow). Sem aleatoriedade.
"""
import json
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "assets" / "hd-480x352"
TILE = 32
COLUNAS = 32
LINHAS = 17

# Tipo de cômodo -> (cor base, cor da borda da grade). Paleta total do tileset: poucas cores.
TIPOS = {
    "neutro": ((138, 106, 74), (110, 82, 56)),
    "hall": ((185, 138, 90), (151, 104, 63)),
    "sala": ((168, 100, 58), (132, 72, 42)),
    "cozinha": ((207, 214, 216), (154, 166, 170)),
    "quartos": ((90, 63, 46), (70, 48, 31)),
    "parede": ((59, 63, 107), (42, 45, 80)),
}

# gid -> tipo. Gids de content/maps/casa-real/*.json (ver docstring).
GIDS_POR_TIPO = {
    "hall": [2, 3, 4, 18, 19, 20, 258, 274],
    "sala": [260, 355, 358],
    "cozinha": [38, 277, 532],
    "quartos": [34, 310],
    "neutro": [1, 37],
    "parede": [533, 534, 535, 536],
    "passagem_h": [537],   # passagem em parede horizontal (P8): soleira horizontal
    "passagem_v": [538],   # passagem em parede vertical (P7): soleira vertical
}

# Gids de passagem: não giram com a planta (já saem na orientação final).
GIDS_PASSAGEM = {537, 538}


def girar_celula(im):
    """Giro de 90° no sentido horário (GDD 14.12.1): o canto superior esquerdo vai para o superior direito."""
    return im.transpose(Image.Transpose.ROTATE_270)


def tile_passagem(orientacao):
    """Passagem de parede (GDD 14.10.9, item 041): piso escuro com soleira dourada de 6 px, no meio do tile.
    A soleira é um retângulo comprido, alinhado à parede; a cor não é de piso nem de parede."""
    img = Image.new("RGBA", (TILE, TILE), (*cor_hex("#6b4a2b"), 255))
    d = ImageDraw.Draw(img)
    if orientacao == "h":
        d.rectangle([0, 13, TILE - 1, 18], fill=cor_hex("#f4d35e") + (255,))
    else:
        d.rectangle([13, 0, 18, TILE - 1], fill=cor_hex("#f4d35e") + (255,))
    return img


def cor_hex(hexa):
    h = hexa.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def tile_piso(tipo, variante):
    base, borda = TIPOS[tipo]
    img = Image.new("RGBA", (TILE, TILE), (*base, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, TILE - 1, 0], fill=(*borda, 255))
    d.rectangle([0, 0, 0, TILE - 1], fill=(*borda, 255))
    d.rectangle([0, TILE - 1, TILE - 1, TILE - 1], fill=(*borda, 255))
    d.rectangle([TILE - 1, 0, TILE - 1, TILE - 1], fill=(*borda, 255))
    # Uma tábua (ou ladrilho) por variante, sem aleatoriedade: só para não parecer um bloco liso.
    y = 8 + (variante % 2) * 12
    d.line([(2, y), (TILE - 3, y)], fill=(*borda, 255))
    return img


def tile_parede(variante):
    base, borda = TIPOS["parede"]
    img = Image.new("RGBA", (TILE, TILE), (*base, 255))
    d = ImageDraw.Draw(img)
    d.rectangle([0, 0, TILE - 1, 5], fill=(90, 96, 150, 255))
    d.rectangle([0, 0, TILE - 1, 0], fill=(*borda, 255))
    d.rectangle([0, TILE - 1, TILE - 1, TILE - 1], fill=(*borda, 255))
    if variante % 2:
        d.line([(0, 18), (TILE - 1, 18)], fill=(*borda, 255))
    return img


def desenhar_tileset():
    img = Image.new("RGBA", (COLUNAS * TILE, LINHAS * TILE), (0, 0, 0, 0))
    usados = {}
    for tipo, gids in GIDS_POR_TIPO.items():
        for n, gid in enumerate(gids):
            usados[gid] = (tipo, n)
    for gid, (tipo, n) in usados.items():
        pos = gid - 1
        x, y = (pos % COLUNAS) * TILE, (pos // COLUNAS) * TILE
        if tipo == "passagem_h":
            t = tile_passagem("h")
        elif tipo == "passagem_v":
            t = tile_passagem("v")
        else:
            t = tile_parede(n) if tipo == "parede" else tile_piso(tipo, n)
            t = girar_celula(t)  # planta girada (GDD 14.12)
        img.paste(t, (x, y))
    img.save(PASTA / "tiles_casa.png", optimize=True)
    return sorted(usados)


def canvas(w, h):
    return Image.new("RGBA", (w, h), (0, 0, 0, 0))


def cor(hexa):
    h = hexa.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), 255)


def porta():
    """Porta fina na aresta (GDD 14.10.9, itens 043 e 044; regra de arestas, pergunta 26 de 2026-11-08).
    Vista superior: faixa de 32 × 8 px (linhas 12 a 19) num canvas 32×32, com maçaneta dourada no meio.
    A faixa é centrada na linha 16 do canvas: quem desenha põe esse centro na aresta do tile (origem 0,5):
    aresta de cima = y do tile; de baixo = y + 32; esquerda e direita valem para `spr_porta_vertical`.
    Qual aresta: ver docs/mapa-casa-real.md, seção 8.2 (regra de lado por porta)."""
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 12, 31, 19], fill=cor("#8b5a2b"), outline=cor("#3b2416"))
    d.rectangle([13, 14, 18, 17], fill=cor("#f4d35e"), outline=cor("#3b2416"))
    return im


def porta_vertical():
    return girar_celula(porta())


def interruptor():
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    d.rectangle([4, 4, 27, 27], fill=cor("#e8e0c8"), outline=cor("#9a9078"))
    d.rectangle([13, 9, 18, 22], fill=cor("#4a4a4a"))
    d.rectangle([13, 9, 18, 14], fill=cor("#f4d35e"))
    return im


def lampada():
    im = canvas(64, 64)
    d = ImageDraw.Draw(im)
    d.line([(32, 0), (32, 14)], fill=cor("#6b4a1e"), width=2)
    d.polygon([(14, 40), (50, 40), (40, 18), (24, 18)], fill=cor("#d9a441"), outline=cor("#6b4a1e"))
    d.ellipse([24, 36, 40, 50], fill=cor("#fff3b0"))
    return im


def bilhete():
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    d.rectangle([6, 4, 25, 27], fill=cor("#f4e9c8"), outline=cor("#9a9078"))
    for y in (10, 15, 20):
        d.line([(9, y), (22, y)], fill=cor("#9aa3c7"))
    d.rectangle([19, 21, 23, 25], fill=cor("#c0392b"))
    return im


def arvore(estado):
    # Árvore ocupa só o tile (3,8): 32×32, base na última linha. Tronco e copas são os de antes, em escala
    # menor, para não invadir o tile (4,8) nem o (3,7), que são andáveis (GDD 14.9.3, sala.json).
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    tronco = cor("#5c3a21")
    verde_claro = cor("#3f9a5f")
    verde_escuro = cor("#1f5a3a")
    dourado = cor("#f4d35e")
    vermelho = cor("#c0392b")
    if estado == "desmontada":
        # Tronco caído e partes espalhadas no chão, dentro do mesmo tile.
        d.rectangle([3, 27, 28, 31], fill=tronco)
        d.polygon([(4, 27), (10, 16), (16, 27)], fill=verde_escuro)
        d.polygon([(7, 25), (10, 20), (13, 25)], fill=verde_claro)
        d.polygon([(16, 31), (23, 21), (30, 31)], fill=verde_escuro)
        d.polygon([(19, 31), (23, 26), (27, 31)], fill=verde_claro)
        d.rectangle([11, 21, 14, 24], fill=dourado)
        return im
    # Marco 2 (GDD 15.4; item 050): três camadas, nesta ordem. 1 parte = base (tronco com suporte);
    # 2 partes = + meio (ramos); 3 partes = + topo (ponta). Sem enfeite (enfeite é o Marco 4).
    camadas = {"1parte": ["base"], "2partes": ["base", "meio"], "completa": ["base", "meio", "topo"]}[estado]
    for nome in camadas:
        _desenhar_camada(d, nome, 1)
    return im


# Geometria das camadas da árvore (também é a miniatura de cada peça, GDD 15.2.1). Canvas 32×32 em escala 1;
# o canvas 96×96 das ilustrações de conquista usa escala 3 (mesmas formas).
COR_TRONCO = (92, 58, 33, 255)
COR_SUPORTE = (122, 78, 45, 255)
COR_RAMO_ESCURO = (31, 90, 58, 255)
COR_RAMO_CLARO = (63, 154, 95, 255)


def _pontos(pontos, s):
    return [(x * s, y * s) for x, y in pontos]


def _desenhar_camada(d, nome, s, contorno=None):
    """Desenha uma camada da árvore na escala s. `contorno` (cor) desenha a borda dourada das peças."""
    if nome == "base":
        # tronco com suporte: tronco de x 14 a 17, do meio para baixo; suporte em trapézio na base
        d.rectangle([14 * s, 16 * s, 18 * s - 1, 32 * s - 1], fill=COR_TRONCO)
        d.polygon(_pontos([(8, 31), (24, 31), (21, 26), (11, 26)], s), fill=COR_SUPORTE)
        if contorno:
            silhueta = _pontos([(14, 16), (18, 16), (18, 26), (21, 26), (24, 31), (8, 31), (11, 26), (14, 26)], s)
            d.line(silhueta + [silhueta[0]], fill=contorno, width=s, joint="curve")
    elif nome == "meio":
        externo = _pontos([(16, 8), (27, 24), (5, 24)], s)
        d.polygon(externo, fill=COR_RAMO_ESCURO)
        d.polygon(_pontos([(16, 11), (24, 22), (8, 22)], s), fill=COR_RAMO_CLARO)
        if contorno:
            d.line(externo + [externo[0]], fill=contorno, width=s, joint="curve")
    elif nome == "topo":
        externo = _pontos([(16, 2), (23, 13), (9, 13)], s)
        d.polygon(externo, fill=COR_RAMO_ESCURO)
        d.polygon(_pontos([(16, 5), (20, 11), (12, 11)], s), fill=COR_RAMO_CLARO)
        if contorno:
            d.line(externo + [externo[0]], fill=contorno, width=s, joint="curve")


def peca(ordem, s=1):
    """Peça da árvore (GDD 15.2): a própria camada da árvore, com brilho dourado (contorno #f4d35e).
    s = 1 para o chão (32×32); s = 3 para a ilustração da conquista (96×96, GDD 15.5)."""
    nome = {1: "base", 2: "meio", 3: "topo"}[ordem]
    im = canvas(32 * s, 32 * s)
    d = ImageDraw.Draw(im)
    _desenhar_camada(d, nome, s, contorno=cor("#f4d35e"))
    return im


def pia():
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    d.rectangle([2, 8, 29, 29], fill=cor("#b8c0c8"), outline=cor("#7d8790"))
    d.rectangle([7, 13, 24, 25], fill=cor("#5f6a73"))
    d.line([(16, 2), (16, 9)], fill=cor("#d8dde2"), width=2)
    return im


def fogao():
    im = canvas(32, 64)
    d = ImageDraw.Draw(im)
    d.rectangle([1, 1, 30, 62], fill=cor("#4a4f57"), outline=cor("#2a2d33"))
    d.rectangle([3, 3, 28, 18], fill=cor("#2a2d33"))
    for x in (9, 22):
        d.ellipse([x - 3, 8, x + 3, 14], fill=cor("#c0392b"))
    d.rectangle([5, 24, 26, 52], fill=cor("#1b1d22"), outline=cor("#6b7480"))
    d.rectangle([8, 28, 23, 44], fill=cor("#6b7480"))
    return im


def geladeira():
    im = canvas(32, 64)
    d = ImageDraw.Draw(im)
    d.rectangle([1, 1, 30, 62], fill=cor("#e6eef2"), outline=cor("#7d8790"))
    d.line([(2, 26), (29, 26)], fill=cor("#aab7bf"))
    d.rectangle([24, 8, 26, 20], fill=cor("#7d8790"))
    d.rectangle([24, 32, 26, 48], fill=cor("#7d8790"))
    return im


COR_SETA = (251, 248, 239, 255)      # miolo da seta (branco quente)
COR_CONTORNO = (42, 31, 22, 255)     # contorno escuro (marrom muito escuro, como o contorno das portas)
COR_TAPETE = (192, 57, 43, 255)      # vermelho do tapete (mesmo vermelho da árvore)
COR_TAPETE_BORDA = (244, 233, 200, 255)  # borda clara do tapete
COR_TAPETE_MOLDURA = (90, 31, 24, 255)   # moldura escura externa


def seta_direita():
    """Seta apontando para a direita (sentido em que se anda ao atravessar a porta). Contorno de 1 px,
    feito por dilatação da máscara: o miolo fica dentro de 6..27 px no eixo x e 6..25 px no eixo y."""
    mascara = Image.new("L", (TILE, TILE), 0)
    ImageDraw.Draw(mascara).polygon([(6, 12), (18, 12), (18, 6), (27, 15), (18, 24), (18, 19), (6, 19)], fill=255)
    contorno = mascara.filter(ImageFilter.MaxFilter(3))
    im = canvas(TILE, TILE)
    im.paste(COR_CONTORNO, (0, 0, TILE, TILE), contorno)
    im.paste(COR_SETA, (0, 0, TILE, TILE), mascara)
    return im


def seta_esquerda():
    return seta_direita().transpose(Image.Transpose.FLIP_LEFT_RIGHT)


def seta_baixo():
    # Giro de 90° no sentido horário: a seta da direita aponta para baixo.
    return seta_direita().transpose(Image.Transpose.ROTATE_270)


def tapete():
    """Tapete vermelho com borda clara (ref_saida_tapete.webp): moldura escura, miolo vermelho, filete claro.
    Ocupa quase o tile inteiro (linhas 4 a 31, colunas 1 a 30). Vai no tile do vão da P8, fora do piso (GDD 14.10.10,
    pedido do Diretor): a porta é desenhada por cima, e o tapete aparece como saída para baixo."""
    im = canvas(TILE, TILE)
    d = ImageDraw.Draw(im)
    d.rectangle([1, 4, 30, 31], fill=COR_TAPETE_MOLDURA)
    d.rectangle([2, 5, 29, 30], fill=COR_TAPETE)
    d.rectangle([4, 7, 27, 28], outline=COR_TAPETE_BORDA)
    return im


COR_FAREJO = (244, 211, 94, 255)     # #f4d35e: dourado da seta de farejar (GDD 16.5.3)
COR_CAIXA = (27, 36, 82, 255)        # #1b2452: caixa da HUD (GDD 16.8.1)
COR_BORDA_HUD = (154, 163, 199, 255) # #9aa3c7: borda da HUD (GDD 16.8.1)
COR_BALAO = (244, 233, 200, 255)     # #f4e9c8: miolo do balão (texto claro do perfil)
COR_TINTA = (27, 36, 82, 255)        # #1b2452: contorno e traços do balão


def seta_colorida(cor_miolo):
    """Seta para a direita com a geometria da seta branca (seta_direita) e outra cor de miolo."""
    mascara = Image.new("L", (TILE, TILE), 0)
    ImageDraw.Draw(mascara).polygon([(6, 12), (18, 12), (18, 6), (27, 15), (18, 24), (18, 19), (6, 19)], fill=255)
    contorno = mascara.filter(ImageFilter.MaxFilter(3))
    im = canvas(TILE, TILE)
    im.paste(COR_CONTORNO, (0, 0, TILE, TILE), contorno)
    im.paste(cor_miolo, (0, 0, TILE, TILE), mascara)
    return im


def seta_farejo(direcao):
    """Seta dourada de farejar (GDD 16.5.3): direita, esquerda ou cima."""
    base = seta_colorida(COR_FAREJO)
    if direcao == "direita":
        return base
    if direcao == "esquerda":
        return base.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
    return base.transpose(Image.Transpose.ROTATE_90)


# Fonte de pixel 5×7 para os poucos glifos dos balões e do ícone (1 = pixel).
GLIFOS = {
    "z": [".....", ".....", "#####", "...#.", "..#..", ".#...", "#####"],
    "?": [".###.", "#...#", "...#.", "..#..", "..#..", ".....", "..#.."],
    # Letras dos botões de toque (ADR-007 seção 5.5, V7): A e B desenhadas no botão, sem texto de jogo.
    "A": [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
    "B": ["####.", "#...#", "#...#", "####.", "#...#", "#...#", "####."],
}


def desenhar_texto(d, texto, x, y, escala, cor):
    """Escreve `texto` (só glifos de GLIFOS, espaço de 1 pixel entre letras) em pixels grandes `escala`."""
    for letra in texto:
        for j, linha in enumerate(GLIFOS[letra]):
            for i, c in enumerate(linha):
                if c == "#":
                    d.rectangle([x + i * escala, y + j * escala, x + (i + 1) * escala - 1, y + (j + 1) * escala - 1], fill=cor)
        x += (5 + 1) * escala
    return x


def balao(desenho=None):
    """Bolha de balão (ADR-005 7.1, sem texto do jogo): miolo claro, contorno escuro, rabinho para baixo.
    `desenho` é um texto de GLIFOS desenhado dentro da bolha (o zzz); None = só a bolha (o "Au!" vem do jogo)."""
    im = canvas(48, 32)
    d = ImageDraw.Draw(im)
    d.polygon([(19, 21), (29, 21), (22, 29)], fill=COR_BALAO, outline=COR_TINTA)
    d.rounded_rectangle([1, 1, 46, 22], radius=4, fill=COR_BALAO, outline=COR_TINTA, width=2)
    if desenho:
        largura_texto = len(desenho) * 6 * 2 - 2
        desenhar_texto(d, desenho, (48 - largura_texto) // 2, 5, 2, COR_TINTA)
    return im


def exclamacao():
    """"!" amarelo de acordar (ADR-005 7.1): barra e ponto dourados #f4d35e com contorno escuro, 16×24."""
    im = canvas(16, 24)
    d = ImageDraw.Draw(im)
    d.rectangle([4, 0, 11, 15], fill=COR_TINTA)
    d.rectangle([5, 1, 10, 14], fill=(244, 211, 94, 255))
    d.rectangle([4, 17, 11, 23], fill=COR_TINTA)
    d.rectangle([5, 18, 10, 22], fill=(244, 211, 94, 255))
    return im


def icone_ajuda():
    """"?" da dica (GDD 16.8.1): caixa #1b2452, borda 1 px #9aa3c7 (como os botões de 14.9.4, mas 1 px)."""
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    d.rectangle([0, 0, 31, 31], fill=COR_BORDA_HUD)
    d.rectangle([1, 1, 30, 30], fill=COR_CAIXA)
    desenhar_texto(d, "?", 11, 9, 2, (244, 211, 94, 255))
    return im


def fumaca():
    """Fumacinha de dormir, 3 quadros (GDD 16.6; ADR-005 7.1): nuvem se desfazendo. 96×32 (tira de 32×32)."""
    cor_fill = (232, 236, 247, 255)
    cor_linha = (90, 106, 149, 255)
    im = canvas(96, 32)

    def nuvem(d, pontos):
        for cx, cy, r in pontos:
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=cor_fill, outline=cor_linha)

    quadros = [
        [(16, 20, 8), (9, 23, 6), (23, 23, 6)],     # quadro 1: nuvem cheia
        [(15, 16, 6), (8, 21, 5), (23, 19, 5)],     # quadro 2: abrindo, subindo
        [(16, 11, 4), (10, 15, 3), (22, 14, 3)],    # quadro 3: quase sumida
    ]
    for n, pontos in enumerate(quadros):
        quadro = canvas(32, 32)
        nuvem(ImageDraw.Draw(quadro), pontos)
        im.paste(quadro, (n * 32, 0), quadro)
    return im


# Marco 4 (GDD 17.3, 17.4 e 17.5; backlog 088). Placeholders da pergunta 36, com o padrão aplicado: caixa vermelha
# com laço dourado, tampa para cima; árvore com bolas vermelhas e douradas, fita verde e estrela dourada no topo.
# O brilho dourado da caixa é o contorno #f4d35e, como o da peça (sem texto dentro do sprite).
COR_VERMELHO = (192, 57, 43, 255)            # #c0392b
COR_VERMELHO_CLARO = (224, 83, 63, 255)
COR_VERMELHO_ESCURO = (110, 29, 21, 255)
COR_DOURADO = (244, 211, 94, 255)            # #f4d35e
COR_DOURADO_ESCURO = (138, 106, 16, 255)
COR_FITA = (139, 226, 143, 255)              # fita verde, mais clara que a folhagem
COR_INTERIOR = (59, 20, 16, 255)


def _r(d, caixa, s, fill=None, outline=None, w=1, ox=0, oy=0):
    """Retângulo com coordenadas de tile (32) na escala s; a caixa inclui o último pixel de cada célula."""
    x0, y0, x1, y1 = caixa
    d.rectangle([x0 * s + ox, y0 * s + oy, x1 * s + s - 1 + ox, y1 * s + s - 1 + oy], fill=fill, outline=outline, width=w * s)


def _e(d, caixa, s, fill=None, outline=None, w=1, ox=0, oy=0):
    """Elipse com coordenadas de tile (32) na escala s."""
    x0, y0, x1, y1 = caixa
    d.ellipse([x0 * s + ox, y0 * s + oy, x1 * s + s - 1 + ox, y1 * s + s - 1 + oy], fill=fill, outline=outline, width=w * s)


def _caixa(d, estado, s=1, ox=0, oy=0):
    """Caixa de enfeite (GDD 17.3). `fechada`: tampa sobre o corpo. `aberta`: tampa levantada para cima, interior escuro."""
    corpo = (4, 14, 27, 28)
    _r(d, corpo, s, fill=COR_VERMELHO, outline=COR_DOURADO, ox=ox, oy=oy)
    if estado == "fechada":
        _r(d, (2, 9, 29, 14), s, fill=COR_VERMELHO_CLARO, outline=COR_DOURADO, ox=ox, oy=oy)
        _r(d, (14, 9, 17, 28), s, fill=COR_DOURADO, ox=ox, oy=oy)                      # laço, fita vertical
        _e(d, (5, 2, 14, 9), s, fill=COR_DOURADO, outline=COR_DOURADO_ESCURO, ox=ox, oy=oy)   # alça esquerda
        _e(d, (18, 2, 27, 9), s, fill=COR_DOURADO, outline=COR_DOURADO_ESCURO, ox=ox, oy=oy)  # alça direita
        _r(d, (14, 6, 17, 11), s, fill=COR_DOURADO_ESCURO, ox=ox, oy=oy)                 # nó do laço
    elif estado == "aberta":
        _r(d, (5, 15, 26, 18), s, fill=COR_INTERIOR, ox=ox, oy=oy)                     # interior, visto de cima
        _r(d, (14, 14, 17, 28), s, fill=COR_DOURADO, ox=ox, oy=oy)                     # fita no corpo
        _r(d, (3, 1, 28, 7), s, fill=COR_VERMELHO_CLARO, outline=COR_DOURADO, ox=ox, oy=oy)  # tampa para cima
        _r(d, (14, 1, 17, 7), s, fill=COR_DOURADO, ox=ox, oy=oy)                       # fita na tampa
    else:
        raise ValueError(estado)


def _enfeite(d, s=1, ox=0, oy=0):
    """Enfeite que sobe da caixa (GDD 17.4, item 3): bola vermelha com pinta dourada, gancho dourado, brilho claro."""
    _e(d, (7, 8, 24, 25), s, fill=COR_VERMELHO, outline=COR_VERMELHO_ESCURO, ox=ox, oy=oy)
    _r(d, (13, 4, 18, 8), s, fill=COR_DOURADO, outline=COR_DOURADO_ESCURO, ox=ox, oy=oy)   # tampinha
    _r(d, (15, 2, 16, 3), s, fill=COR_DOURADO_ESCURO, ox=ox, oy=oy)                        # gancho
    _e(d, (10, 12, 14, 16), s, fill=(255, 243, 176, 255), ox=ox, oy=oy)                    # brilho claro
    _e(d, (18, 19, 22, 23), s, fill=COR_DOURADO, ox=ox, oy=oy)                             # pinta dourada


def caixa_folhas():
    """Caixa de enfeite, 2 quadros de 32×32 (fechada, aberta), 64×32 (ADR-006 seção 2; backlog 088, item 1)."""
    im = canvas(64, 32)
    for n, estado in enumerate(("fechada", "aberta")):
        quadro = canvas(32, 32)
        _caixa(ImageDraw.Draw(quadro), estado)
        im.paste(quadro, (n * 32, 0), quadro)
    return im


def enfeite_flutuante():
    """Enfeite que sobe e encaixa na árvore (GDD 17.4, item 3), 32×32."""
    im = canvas(32, 32)
    _enfeite(ImageDraw.Draw(im))
    return im


def _estrela(d, cx, cy, r_ext, r_int):
    pontos = []
    for i in range(10):
        ang = -math.pi / 2 + i * math.pi / 5
        r = r_ext if i % 2 == 0 else r_int
        pontos.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    d.polygon(pontos, fill=COR_DOURADO, outline=COR_DOURADO_ESCURO)


def arvore_enfeitada():
    """Árvore completa com enfeites (estado 4, GDD 17.5): as 3 camadas de spr_arvore_completa (mesma âncora e
    escala), com fita verde, bolas vermelhas e douradas e estrela dourada no topo. 32×32."""
    im = canvas(32, 32)
    d = ImageDraw.Draw(im)
    for nome in ("base", "meio", "topo"):
        _desenhar_camada(d, nome, 1)
    d.line([(7, 19), (11, 21), (16, 19), (21, 21), (25, 19)], fill=COR_FITA, width=2, joint="curve")
    bolas = (((12, 11), COR_VERMELHO), ((20, 11), COR_DOURADO), ((13, 15), COR_DOURADO), ((19, 15), COR_VERMELHO),
             ((9, 23), COR_VERMELHO), ((24, 23), COR_DOURADO))
    for (cx, cy), cor in bolas:
        escuro = COR_VERMELHO_ESCURO if cor == COR_VERMELHO else COR_DOURADO_ESCURO
        d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=cor, outline=escuro)
    _estrela(d, 16, 4.5, 4.2, 1.8)
    return im


def conquista_enfeites():
    """Ilustração da conquista da caixa (GDD 17.4, item 1; backlog 088, item 1): caixa aberta, 96×96 como as do
    Marco 2 (escala 3), com o enfeite saindo por cima."""
    im = canvas(96, 96)
    d = ImageDraw.Draw(im)
    _caixa(d, "aberta", s=3)
    _enfeite(d, s=2, ox=17, oy=6)
    return im


# Controles de toque (ADR-007 seção 5.5; GDD 18.2). Desenhados em CSS px (1 pixel de arte = 1 CSS px do aparelho)
# e ampliados 3× com vizinho mais próximo, então a PNG tem 3× o tamanho CSS (nítida em DPR 3, pixel art de blocos).
# Só as cores de 14.9.4 (sem cor nova): caixa #1b2452, borda #9aa3c7, texto #f4e9c8, destaque #f4d35e, fundo #0b1030.
# Sem texto no joystick e no celular. A letra de A e de B é desenho do botão (V7). Sem "Fechar" nem "?": são texto/ícone do jogo.
CTL_ESCALA = 3
CTL_BOTAO_CSS = 64    # diâmetro de A e B (toque.botaoCss)
CTL_ROTACAO_CSS = 96  # quadro do aviso de rotação (toque.rotacao.tamanhoCss)
CTL_ROTACAO_QUADROS = 4
COR_CTL_CAIXA = (27, 36, 82, 255)        # #1b2452
COR_CTL_BORDA = (154, 163, 199, 255)     # #9aa3c7
COR_CTL_TEXTO = (244, 233, 200, 255)     # #f4e9c8
COR_CTL_DESTAQUE = (244, 211, 94, 255)   # #f4d35e
COR_CTL_FUNDO = (11, 16, 48, 255)        # #0b1030


def _ampliar(im):
    return im.resize((im.width * CTL_ESCALA, im.height * CTL_ESCALA), Image.Resampling.NEAREST)


def ctl_botao(letra, pressionado=False):
    """Botão A ou B: círculo de 64 CSS px, borda de 2 px e a letra desenhada (fonte 5×7 ampliada 3×)."""
    fundo = COR_CTL_DESTAQUE if pressionado else COR_CTL_CAIXA
    borda = COR_CTL_DESTAQUE if pressionado else COR_CTL_BORDA
    texto = COR_CTL_FUNDO if pressionado else COR_CTL_TEXTO
    im = canvas(CTL_BOTAO_CSS, CTL_BOTAO_CSS)
    d = ImageDraw.Draw(im)
    d.ellipse([0, 0, CTL_BOTAO_CSS - 1, CTL_BOTAO_CSS - 1], fill=fundo, outline=borda, width=2)
    escala_letra = 3
    largura_letra = 5 * escala_letra
    altura_letra = 7 * escala_letra
    desenhar_texto(d, letra, (CTL_BOTAO_CSS - largura_letra) // 2, (CTL_BOTAO_CSS - altura_letra) // 2, escala_letra, texto)
    return _ampliar(im)


def ctl_celular():
    """Aviso de rotação (GDD 18.8): celular em pé girando até a horizontal, 4 quadros de 96 CSS px, sem texto.
    O celular é a parte que gira; o arco dourado fica parado embaixo."""
    tamanho = CTL_ROTACAO_CSS
    centro = tamanho // 2
    corpo = canvas(tamanho, tamanho)
    d = ImageDraw.Draw(corpo)
    d.rounded_rectangle([centro - 14, centro - 24, centro + 13, centro + 23], radius=5,
                        fill=COR_CTL_CAIXA, outline=COR_CTL_BORDA, width=3)
    d.rectangle([centro - 9, centro - 17, centro + 8, centro + 14], fill=COR_CTL_FUNDO)
    d.ellipse([centro - 3, centro + 17, centro + 2, centro + 22], fill=COR_CTL_TEXTO)
    arco = canvas(tamanho, tamanho)
    da = ImageDraw.Draw(arco)
    da.arc([6, 6, tamanho - 7, tamanho - 7], start=20, end=160, fill=COR_CTL_DESTAQUE, width=4)
    da.polygon([(6, 55), (3, 64), (14, 60)], fill=COR_CTL_DESTAQUE)  # ponta do arco, no fim (160°), apontando para cima
    quadros = canvas(tamanho * CTL_ROTACAO_QUADROS, tamanho)
    for n in range(CTL_ROTACAO_QUADROS):
        angulo = -90 * n / (CTL_ROTACAO_QUADROS - 1)  # 0°, -30°, -60°, -90°: do retrato à paisagem (sentido horário)
        gira = corpo.rotate(angulo, resample=Image.Resampling.NEAREST, center=(centro, centro))
        quadro = arco.copy()
        quadro.alpha_composite(gira)
        quadros.paste(quadro, (n * tamanho, 0))
    return _ampliar(quadros)


# Joystick virtual (ADR-007 5.5, revisão do ajuste 0.10.0; GDD 18.19; backlog 113). Desenhado em CSS px e ampliado 3×.
# Só as cores de 14.9.4. Sem texto. Os números do bloco `toque.analogico` do perfil saem daqui (base e bolinha).
CTL_ANALOGICO_BASE_CSS = 120     # diâmetro da base (toque.analogico.baseCss); área de toque inteira
CTL_ANALOGICO_BOLINHA_CSS = 48   # diâmetro da bolinha (toque.analogico.bolinhaCss); só desenho
CTL_ANALOGICO_AMARELO = (244, 211, 94, 255)  # #f4d35e: só o anel de feedback
CTL_ANALOGICO_SETORES = {
    "cima": (225, 315),
    "baixo": (45, 135),
    "esquerda": (135, 225),
    "direita": (-45, 45),
}


def ctl_analogico_base():
    """Base do joystick: círculo de 120 CSS px, caixa #1b2452 e borda de 2 px #9aa3c7 (repouso). Sem versão ativa: o brilho é o setor."""
    t = CTL_ANALOGICO_BASE_CSS
    im = canvas(t, t)
    d = ImageDraw.Draw(im)
    d.ellipse([0, 0, t - 1, t - 1], fill=COR_CTL_CAIXA, outline=COR_CTL_BORDA, width=2)
    return _ampliar(im)


def ctl_analogico_bolinha(pressionada=False):
    """Bolinha do joystick: círculo de 48 CSS px. Repouso: #9aa3c7 com borda #f4e9c8. Pressionada: #f4e9c8 com borda
    #0b1030 de 2 px, para não se confundir com o setor amarelo #f4d35e (que fica embaixo dela)."""
    t = CTL_ANALOGICO_BOLINHA_CSS
    im = canvas(t, t)
    d = ImageDraw.Draw(im)
    if pressionada:
        d.ellipse([0, 0, t - 1, t - 1], fill=COR_CTL_TEXTO, outline=COR_CTL_FUNDO, width=2)
    else:
        d.ellipse([0, 0, t - 1, t - 1], fill=COR_CTL_BORDA, outline=COR_CTL_TEXTO, width=2)
    return _ampliar(im)


def ctl_analogico_brilho(direcao):
    """Anel de feedback do joystick (ADR-007 5.5 revisado): setor de 90° em #f4d35e, de 52 a 60 CSS px do centro.
    Fica na borda da base, acima da bolinha (que vai até 48 de raio no curso). Mesmo tamanho da base."""
    t = CTL_ANALOGICO_BASE_CSS
    c = t // 2
    raio_externo, raio_interno = 60, 52
    inicio, fim = CTL_ANALOGICO_SETORES[direcao]
    mascara = Image.new("L", (t, t), 0)
    dm = ImageDraw.Draw(mascara)
    dm.pieslice([c - raio_externo, c - raio_externo, c + raio_externo, c + raio_externo], start=inicio, end=fim, fill=255)
    dm.pieslice([c - raio_interno, c - raio_interno, c + raio_interno, c + raio_interno], start=inicio, end=fim, fill=0)
    im = canvas(t, t)
    im.paste(CTL_ANALOGICO_AMARELO, (0, 0, t, t), mascara)
    return _ampliar(im)


def sprites_json(imagens_sobrinho_quadro=(32, 48)):
    w, h = imagens_sobrinho_quadro
    imagens = [{"arquivo": "tiles_casa.png", "tipo": "tileset", "quadro": {"w": TILE, "h": TILE}}]
    for nome in ("lolo", "bibi", "dandan", "tutu"):
        for estado in ("idle", "interact", "celebrate"):
            imagens.append({"arquivo": f"spr_{nome}_{estado}.png", "tipo": "imagem"})
        for direcao in ("down", "up", "left", "right"):
            imagens.append({"arquivo": f"spr_{nome}_walk_{direcao}.png", "tipo": "folhas",
                            "quadro": {"w": w, "h": h}, "quadros": 2})
    for nome in ("porta", "porta_vertical", "interruptor", "lampada", "bilhete", "arvore_desmontada", "arvore_1parte",
                 "arvore_2partes", "arvore_completa", "pia", "fogao", "geladeira", "indicador_seta_direita",
                 "indicador_seta_esquerda", "indicador_seta_baixo", "indicador_tapete",
                 "peca_1", "peca_2", "peca_3", "conquista_parte1", "conquista_parte2", "conquista_parte3",
                 "seta_farejar_direita", "seta_farejar_esquerda", "seta_farejar_cima", "icone_dica",
                 "balao_au", "balao_zzz", "balao_exclamacao",
                 "arvore_enfeitada", "enfeite_flutuante", "conquista_enfeites"):
        imagens.append({"arquivo": f"spr_{nome}.png", "tipo": "imagem"})
    imagens.append({"arquivo": "spr_fumaca_dormir.png", "tipo": "folhas", "quadro": {"w": 32, "h": 32}, "quadros": 3})
    imagens.append({"arquivo": "spr_enfeite_caixa.png", "tipo": "folhas", "quadro": {"w": 32, "h": 32}, "quadros": 2})
    # Controles de toque (ADR-007 5.5): PNG em 3× o tamanho CSS. Sem texto no joystick e no celular.
    for letra in ("a", "b"):
        imagens.append({"arquivo": f"ctl_botao_{letra}.png", "tipo": "imagem"})
        imagens.append({"arquivo": f"ctl_botao_{letra}_pressionado.png", "tipo": "imagem"})
    imagens.append({"arquivo": "ctl_celular.png", "tipo": "folhas", "quadro": {"w": CTL_ROTACAO_CSS * CTL_ESCALA, "h": CTL_ROTACAO_CSS * CTL_ESCALA}, "quadros": CTL_ROTACAO_QUADROS})
    # Joystick virtual (ADR-007 5.5 revisado; GDD 18.19): base, bolinha e setores de brilho.
    imagens.append({"arquivo": "ctl_analogico_base.png", "tipo": "imagem"})
    imagens.append({"arquivo": "ctl_analogico_bolinha.png", "tipo": "imagem"})
    imagens.append({"arquivo": "ctl_analogico_bolinha_pressionada.png", "tipo": "imagem"})
    for direcao in ("cima", "baixo", "esquerda", "direita"):
        imagens.append({"arquivo": f"ctl_analogico_brilho_{direcao}.png", "tipo": "imagem"})
    # Nick (tools-arte/gerar_nick.py, a partir de assets/referencia/ref_nick_folha.webp). Quadro 32×32 (corpos.nick).
    for direcao in ("down", "up", "left", "right"):
        imagens.append({"arquivo": f"spr_nick_idle_{direcao}.png", "tipo": "imagem"})
        imagens.append({"arquivo": f"spr_nick_walk_{direcao}.png", "tipo": "folhas", "quadro": {"w": 32, "h": 32}, "quadros": 4})
    for nome, quadros in (("sleep", 4), ("wake", 4), ("sniff", 4), ("happy", 4)):
        imagens.append({"arquivo": f"spr_nick_{nome}.png", "tipo": "folhas", "quadro": {"w": 32, "h": 32}, "quadros": quadros})
    imagens.sort(key=lambda i: i["arquivo"])
    return {"schemaVersion": 1, "perfil": "hd-480x352", "imagens": imagens}


def main():
    PASTA.mkdir(parents=True, exist_ok=True)
    gids = desenhar_tileset()
    print(f"tiles_casa.png: {len(gids)} tiles nos gids {gids[0]}..{gids[-1]} (dos usados em casa-real + paredes)")
    desenhos = {
        "spr_porta.png": porta(),
        "spr_porta_vertical.png": porta_vertical(),
        "spr_interruptor.png": interruptor(),
        "spr_lampada.png": lampada(),
        "spr_bilhete.png": bilhete(),
        "spr_arvore_desmontada.png": arvore("desmontada"),
        "spr_arvore_1parte.png": arvore("1parte"),
        "spr_arvore_2partes.png": arvore("2partes"),
        "spr_arvore_completa.png": arvore("completa"),
        "spr_pia.png": girar_celula(pia()),        # móveis giram como imagem (GDD 14.12.4)
        "spr_fogao.png": girar_celula(fogao()),    # 64 × 32 depois do giro
        "spr_geladeira.png": girar_celula(geladeira()),
        "spr_indicador_seta_direita.png": seta_direita(),
        "spr_indicador_seta_esquerda.png": seta_esquerda(),
        "spr_indicador_seta_baixo.png": seta_baixo(),
        "spr_indicador_tapete.png": tapete(),
        "spr_peca_1.png": peca(1),                 # Marco 2 (GDD 15.2): miniatura da base, 32×32
        "spr_peca_2.png": peca(2),                 # miniatura do meio
        "spr_peca_3.png": peca(3),                 # miniatura do topo
        "spr_conquista_parte1.png": peca(1, 3),    # ilustração da conquista (GDD 15.5), 96×96
        "spr_conquista_parte2.png": peca(2, 3),
        "spr_conquista_parte3.png": peca(3, 3),
        "spr_seta_farejar_direita.png": seta_farejo("direita"),     # Marco 3 (070): seta dourada de farejar
        "spr_seta_farejar_esquerda.png": seta_farejo("esquerda"),
        "spr_seta_farejar_cima.png": seta_farejo("cima"),
        "spr_icone_dica.png": icone_ajuda(),                        # "?" da dica (071)
        "spr_balao_au.png": balao(None),                            # bolha do latido; o "Au!" é texto do jogo
        "spr_balao_zzz.png": balao("zzz"),                            # balão do zzz (desenhado, sem chave de texto)
        "spr_balao_exclamacao.png": exclamacao(),                   # "!" amarelo de acordar
        "spr_fumaca_dormir.png": fumaca(),                          # fumacinha de dormir (3 quadros)
        "spr_arvore_enfeitada.png": arvore_enfeitada(),             # Marco 4 (GDD 17.5): estado 4 da árvore
        "spr_enfeite_caixa.png": caixa_folhas(),                    # caixa de enfeite: quadro 0 fechada, 1 aberta
        "spr_enfeite_flutuante.png": enfeite_flutuante(),           # enfeite que sobe até a árvore
        "spr_conquista_enfeites.png": conquista_enfeites(),         # conquista da caixa, 96×96 (GDD 17.4)
        "ctl_botao_a.png": ctl_botao("A"),
        "ctl_botao_a_pressionado.png": ctl_botao("A", True),
        "ctl_botao_b.png": ctl_botao("B"),
        "ctl_botao_b_pressionado.png": ctl_botao("B", True),
        "ctl_celular.png": ctl_celular(),
        "ctl_analogico_base.png": ctl_analogico_base(),              # joystick virtual (ADR-007 5.5 revisado; GDD 18.19)
        "ctl_analogico_bolinha.png": ctl_analogico_bolinha(),
        "ctl_analogico_bolinha_pressionada.png": ctl_analogico_bolinha(True),
        "ctl_analogico_brilho_cima.png": ctl_analogico_brilho("cima"),
        "ctl_analogico_brilho_baixo.png": ctl_analogico_brilho("baixo"),
        "ctl_analogico_brilho_esquerda.png": ctl_analogico_brilho("esquerda"),
        "ctl_analogico_brilho_direita.png": ctl_analogico_brilho("direita"),
    }
    for nome, im in desenhos.items():
        im.save(PASTA / nome, optimize=True)
    (PASTA / "sprites.json").write_text(json.dumps(sprites_json(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(desenhos)} objetos e sprites.json gerados em {PASTA}")


if __name__ == "__main__":
    main()
