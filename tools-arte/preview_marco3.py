#!/usr/bin/env python3
"""Prévias do Marco 3 (Arte, itens 067, 068, 074): Nick em todos os estados, tamanho ao lado de um Sobrinho,
setas de farejar, ícone da dica, balões, fumacinha, e os 4 cômodos abertos com o Nick dormindo no tile de 074.

Saídas (tools-arte/previews/):
  m3-nick-estados.png      Nick em todos os estados, em 4× e em dois fundos (penumbra #0b1030 e chão claro).
  m3-nick-tamanho.png      Nick e LoLô (sobrinho 32×48) lado a lado, em escala 2 da tela (480×352), parados e andando.
  m3-setas-icone-baloes.png  setas de farejar (direita, esquerda, cima), "?" da dica, balões, "!" e fumacinha.
  m3-dormir-sala.png, m3-dormir-cozinha.png, m3-dormir-quarto.png, m3-dormir-escritorio.png
                           cada cômodo como o jogador vê (tela 15×11, escala 2), com o Nick dormindo no tile de 074.
                           A faixa dourada marca as linhas 9 e 10 da tela, sob a barra de duas linhas (GDD 16.9).

Desenho: reaproveita tools-arte/preview_marco2.py (piso, móveis, portas, peças, árvore). Os sprites são os de
assets/hd-480x352 (gerados por gerar_nick.py e gerar_placeholders_hd.py). Nada aqui é do jogo: é revisão da Arte.

Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_marco3.py   (precisa de Pillow)
"""
import importlib.util
from pathlib import Path

from PIL import Image, ImageDraw

RAIZ = Path(__file__).resolve().parent.parent
FERRAMENTAS = Path(__file__).resolve().parent
ASSETS = RAIZ / "assets" / "hd-480x352"
SAIDA = FERRAMENTAS / "previews"

# Reaproveita o desenho do Marco 2 (mesma pasta), sem duplicar código.
_spec = importlib.util.spec_from_file_location("pm2", FERRAMENTAS / "preview_marco2.py")
pm2 = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(pm2)

T = 32
ESC = 2                    # escala da tela de jogo (como preview_marco2)
PX = T * ESC
FUNDO_PENUMBRA = (11, 16, 48)      # tema.fundo #0b1030
ALFA_PENUMBRA = 0.85               # luz.alfa do perfil
CHAO_CLARO = (120, 80, 50)         # só para o fundo de comparação
OURO = (244, 211, 94, 255)
FONTE = pm2.fonte

# Tile de dormir por cômodo (GDD 16.2.2; ADR-005 2.3). Cozinha e Lavanderia são uma subárea (ADR-004 seção 2).
DORMIR = {
    "sala": (8, 5),        # P8 abre a Sala; sugestão do Produto, confirmada pela Arte (ver checar_tiles_nick.py)
    "cozinha": (5, 3),     # parte 1 (Cozinha e Lavanderia)
    "quarto": (4, 3),      # parte 2
    "escritorio": (6, 1),  # parte 3
}


def abrir_frame(nome, indice=0):
    """Um quadro 32×32 de uma tira de folhas (ex.: spr_nick_sleep.png, 4 quadros)."""
    im = Image.open(ASSETS / nome).convert("RGBA")
    return im.crop((indice * T, 0, indice * T + T, T))


def ampliar(im, escala):
    return im.resize((im.width * escala, im.height * escala), Image.NEAREST)


def tela_com_fundo(largura, altura, cor):
    return Image.new("RGBA", (largura, altura), (*cor, 255))


def rotulo(img, texto, xy=(8, 6)):
    ImageDraw.Draw(img).text(xy, texto, fill=(255, 255, 255, 255), font=FONTE)


def gravar(img, nome):
    SAIDA.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(SAIDA / nome, optimize=True)
    print("gravado", SAIDA / nome, img.size)


def chao_mosaico(largura, altura):
    """Fundo de piso (tile 310 da planta) repetido, para as células das setas e dos balões."""
    chao = pm2.tile_do_piso(310)
    fundo = Image.new("RGBA", (largura, altura), (0, 0, 0, 255))
    for y in range(0, altura, PX):
        for x in range(0, largura, PX):
            fundo.alpha_composite(chao, (x, y))
    return fundo


def estados_nick(arquivo):
    """Todos os estados do Nick em 4×, em fundo de penumbra (sobre o chão escurecido) e em chão claro."""
    sprites = [
        ("parado: baixo", "spr_nick_idle_down.png", None),
        ("parado: cima", "spr_nick_idle_up.png", None),
        ("parado: esquerda", "spr_nick_idle_left.png", None),
        ("parado: direita", "spr_nick_idle_right.png", None),
        ("andar: baixo (4 quadros)", "spr_nick_walk_down.png", 4),
        ("andar: esquerda (4 quadros)", "spr_nick_walk_left.png", 4),
        ("dormindo (4 quadros)", "spr_nick_sleep.png", 4),
        ("acordando (4 quadros)", "spr_nick_wake.png", 4),
        ("farejando (4 quadros)", "spr_nick_sniff.png", 4),
        ("feliz (4 quadros)", "spr_nick_happy.png", 4),
    ]
    escala = 4
    celula = T * escala + 14
    larg_rotulo = 210
    largura = larg_rotulo + max(1 if q is None else q for _, _, q in sprites) * (T * escala + 8) + 20
    altura = 40 + len(sprites) * celula
    img = tela_com_fundo(largura * 2 + 30, altura, (30, 22, 40))
    d = ImageDraw.Draw(img)
    rotulo(img, "Nick: estados (assets/hd-480x352, quadro 32×32, ampliado 4×). Esquerda: penumbra (escurecido). Direita: piso sem luz.")
    for bloco, (fundo, cor) in enumerate([("penumbra", FUNDO_PENUMBRA), ("claro", None)]):
        x_base = 10 + bloco * (largura + 10)
        for i, (nome_linha, arq, quadros) in enumerate(sprites):
            y = 40 + i * celula
            if bloco == 0:
                d.text((x_base, y + 8), nome_linha, fill=(240, 230, 200, 255), font=FONTE)
            x = x_base + larg_rotulo
            n = 1 if quadros is None else quadros
            largura_fundo, altura_fundo = n * (T * escala + 8), T * escala + 6
            if cor is None:                        # chão claro: piso real do jogo (tile 310 da planta)
                fundo_img = chao_mosaico(largura_fundo, altura_fundo).resize((largura_fundo, altura_fundo), Image.NEAREST)
            else:
                fundo_img = Image.new("RGBA", (largura_fundo, altura_fundo), (*cor, 255))
            if fundo == "penumbra":
                sombra = Image.new("RGBA", fundo_img.size, (*FUNDO_PENUMBRA, int(255 * ALFA_PENUMBRA)))
                fundo_img.alpha_composite(sombra)
            for k in range(n):
                quadro = abrir_frame(arq, k) if quadros else Image.open(ASSETS / arq).convert("RGBA")
                fundo_img.alpha_composite(ampliar(quadro, escala), (k * (T * escala + 8), 3))
            img.alpha_composite(fundo_img, (x, y))
    gravar(img, arquivo)


def tamanho_nick(arquivo):
    """Nick (32×32) e LoLô (32×48, perfil) lado a lado na escala da tela (2×), sobre o chão da Sala."""
    cena = Image.new("RGBA", (6 * PX, 4 * PX), (*FUNDO_PENUMBRA, 255))
    chao = pm2.tile_do_piso(310)
    for ty in range(4):
        for tx in range(6):
            cena.alpha_composite(chao, (tx * PX, ty * PX))
    sombra = Image.new("RGBA", cena.size, (*FUNDO_PENUMBRA, int(255 * ALFA_PENUMBRA)))
    cena.alpha_composite(sombra)
    base_y = 3 * PX + PX // 2
    # Nick dormindo (quadro 0), parado (baixo) e andando (baixo, quadro 0): todos com os pés na mesma linha
    nick_parado = ampliar(Image.open(ASSETS / "spr_nick_idle_down.png").convert("RGBA"), ESC)
    nick_dormindo = ampliar(abrir_frame("spr_nick_sleep.png", 0), ESC)
    lolo = ampliar(Image.open(ASSETS / "spr_lolo_idle.png").convert("RGBA"), ESC)
    cena.alpha_composite(lolo, (PX * 1, base_y - lolo.height + PX // 2))
    cena.alpha_composite(nick_parado, (PX * 2 + 8, PX * 3 - nick_parado.height + PX // 2))
    cena.alpha_composite(nick_dormindo, (PX * 4, PX * 3 - nick_dormindo.height + PX // 2))
    img = Image.new("RGBA", (max(cena.width, 640), cena.height + 50), (30, 22, 40, 255))
    img.alpha_composite(cena, (0, 0))
    rotulo(img, "LoLô 32×48 | Nick acordado 32×32 | Nick dormindo 32×32 | escala 2", (8, cena.height + 8))
    rotulo(img, "Altura do Nick: 32×32 (folha e ADR-005 7.1). Sobrinho segue em 32×48.", (8, cena.height + 26))
    gravar(img, arquivo)


def setas_icone_baloes(arquivo):
    """Setas de farejar, ícone da dica, balões, "!" e fumacinha. Sobre penumbra e chão claro."""
    itens = [
        ("seta: direita", ampliar(Image.open(ASSETS / "spr_seta_farejar_direita.png").convert("RGBA"), 3)),
        ("seta: esquerda", ampliar(Image.open(ASSETS / "spr_seta_farejar_esquerda.png").convert("RGBA"), 3)),
        ("seta: cima", ampliar(Image.open(ASSETS / "spr_seta_farejar_cima.png").convert("RGBA"), 3)),
        ("ícone ? (dica)", ampliar(Image.open(ASSETS / "spr_icone_dica.png").convert("RGBA"), 3)),
        ("balão (bolha)", ampliar(Image.open(ASSETS / "spr_balao_au.png").convert("RGBA"), 3)),
        ("balão zzz", ampliar(Image.open(ASSETS / "spr_balao_zzz.png").convert("RGBA"), 3)),
        ("! de acordar", ampliar(Image.open(ASSETS / "spr_balao_exclamacao.png").convert("RGBA"), 3)),
    ]
    fumaca = [ampliar(abrir_frame("spr_fumaca_dormir.png", k), 3) for k in range(3)]
    largura_cel = 150
    altura = 260
    img = tela_com_fundo(len(itens) * largura_cel + 3 * 110 + 40, altura * 2 + 40, (30, 22, 40))
    rotulo(img, "Setas dourada de farejar (#f4d35e), ícone ? (32×32), balões, ! de acordar e fumacinha de dormir (3 quadros)")
    for fundo_i, cor in enumerate([FUNDO_PENUMBRA, CHAO_CLARO]):
        y0 = 40 + fundo_i * altura
        x = 10
        for nome, spr in itens:
            cel = Image.new("RGBA", (largura_cel - 10, altura - 40), (*cor, 255))
            cel.alpha_composite(chao_mosaico(cel.width, cel.height), (0, 0))
            if fundo_i == 0:
                cel.alpha_composite(Image.new("RGBA", cel.size, (*FUNDO_PENUMBRA, int(255 * ALFA_PENUMBRA))))
            cel.alpha_composite(spr, ((cel.width - spr.width) // 2, (cel.height - spr.height) // 2))
            img.alpha_composite(cel, (x, y0 + 18))
            ImageDraw.Draw(img).text((x, y0), nome, fill=(240, 230, 200, 255), font=FONTE)
            x += largura_cel
        x = 10 + len(itens) * largura_cel
        for k, f in enumerate(fumaca):
            cel = Image.new("RGBA", (100, altura - 40), (*cor, 255))
            if fundo_i == 0:
                cel.alpha_composite(Image.new("RGBA", cel.size, (*FUNDO_PENUMBRA, int(255 * ALFA_PENUMBRA))))
            cel.alpha_composite(f, ((cel.width - f.width) // 2, (cel.height - f.height) // 2))
            img.alpha_composite(cel, (x + k * 100, y0 + 18))
        ImageDraw.Draw(img).text((x, y0), "fumaça: quadro 1, 2, 3", fill=(240, 230, 200, 255), font=FONTE)
    gravar(img, arquivo)


def cenario_dormir(comodo, arquivo, area):
    """Um cômodo como o jogador vê, com o Nick dormindo no tile de 074 e a faixa das linhas 9 e 10 marcada."""
    tile = DORMIR[comodo]
    tela = pm2.tela_da_area(area)
    img = pm2.nova_tela()
    pm2.desenhar_subarea(img, area, tela, None, peca_todas=False, revisao=False)
    # faixa das duas linhas da barra (GDD 16.9), tracejada dourada, para conferir a regra N006
    d = ImageDraw.Draw(img)
    for linha in (9, 10):
        y0 = linha * PX
        d.rectangle([0, y0, pm2.TELA[0] * PX - 1, y0 + PX - 1], outline=(244, 211, 94, 160), width=2)
    # Nick dormindo: quadro 0 da folha de dormir, no tile escolhido
    x, y = pm2.ponto(tela, *tile)
    img.alpha_composite(ampliar(abrir_frame("spr_nick_sleep.png", 0), ESC), (x, y))
    # marcador do tile (contorno dourado), só para a revisão
    d.rectangle([x + 1, y + 1, x + PX - 2, y + PX - 2], outline=OURO, width=2)
    rotulo(img, f"{comodo}: Nick dorme em {tile}, direcao baixo. Faixa dourada: linhas 9 e 10 (barra).")
    gravar(img, arquivo)


def main():
    golden = pm2.carregar_golden()
    areas = pm2.carregar_subareas(golden)
    pm2.calcular_saidas(areas, golden)
    estados_nick("m3-nick-estados.png")
    tamanho_nick("m3-nick-tamanho.png")
    setas_icone_baloes("m3-setas-icone-baloes.png")
    for comodo in ("sala", "cozinha", "quarto", "escritorio"):
        cenario_dormir(comodo, f"m3-dormir-{comodo}.png", areas[comodo])


if __name__ == "__main__":
    main()
