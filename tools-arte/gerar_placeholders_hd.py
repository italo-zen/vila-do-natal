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
  sprites.json               lista de imagens do perfil (ADR-003 seção 4)

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
                 "peca_1", "peca_2", "peca_3", "conquista_parte1", "conquista_parte2", "conquista_parte3"):
        imagens.append({"arquivo": f"spr_{nome}.png", "tipo": "imagem"})
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
    }
    for nome, im in desenhos.items():
        im.save(PASTA / nome, optimize=True)
    (PASTA / "sprites.json").write_text(json.dumps(sprites_json(), indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{len(desenhos)} objetos e sprites.json gerados em {PASTA}")


if __name__ == "__main__":
    main()
