#!/usr/bin/env python3
"""Protótipo em imagem da visão 3/4 (ADR-012, entrega E1; Arte, 2026-11-18). Sem código de jogo.

Gera, a partir de tools-arte/paleta-casa-3-4.json (paleta-mestre da casa, escrita por este script na primeira execução):
  tools-arte/prototipo-3-4/spr_*.png        peças e móveis da Sala, PNG indexado 8 bits, <= 16 cores cada
  tools-arte/preview/prototipo-3-4-sala.png composição da Sala em 480x352 (recuo de 16 px, barra de 48 px)
  tools-arte/preview/prototipo-3-4-sala@2x.png   a mesma em 960x704
  tools-arte/preview/prototipo-3-4-portas.png    3 lados x 3 estados, com o recorte de 16 px da alcova marcado
  tools-arte/preview/prototipo-3-4-oclusao.png   personagens ao norte, ao sul e ao lado do cacto e do sofá; cacto em 1x e 0,5x

Regras (style-guide, "Visão 3/4"): luz de cima à esquerda; contorno de 1 px escuro; sombra preta 25% deslocada 6 px, embutida;
âncora = canto sudoeste da pegada; E = H - h*32 <= 32 (<= 24 se o piso ao norte é andável); o desenho já nasce na orientação da tela.
Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/gerar_prototipo_3_4.py   (precisa de Pillow)
     ... gerar_prototipo_3_4.py --assets   também grava o KIT REAL em assets/hd-480x352/ (17 peças spr_parede_<peça>, 3 folhas
     spr_porta_norte|lado|sul e os 5 móveis da Sala spr_<id>) e acrescenta/atualiza as entradas em sprites.json (movel, ancora).
     Rode depois de gerar_placeholders_hd.py (que reescreve o sprites.json sem o kit 3/4 e restaura os móveis da 1.1.0).
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
PASTA = RAIZ / "tools-arte" / "prototipo-3-4"
PREVIEW = RAIZ / "tools-arte" / "preview"
ASSETS = RAIZ / "assets" / "hd-480x352"
CONTEUDO = RAIZ / "content" / "maps" / "casa-real"
T = 32
SOMBRA = 6
FUNDO = "#0b1030"

# ------------------------------------------------------------------ paleta-mestre (<= 64 cores)
PALETA = {
    # madeira e contornos
    "contorno": "#3a2416", "madeira_escura": "#5c3a21", "madeira": "#8a5a33", "madeira_clara": "#b07a47", "madeira_realce": "#d9a96a",
    # barro
    "barro_contorno": "#4a2414", "barro_escuro": "#7a3f22", "barro": "#a8582f", "barro_claro": "#cf7a45", "solo": "#2a1a10",
    # verdes e flor
    "verde_contorno": "#123a26", "verde_escuro": "#1f5a3a", "verde": "#2f7d4a", "verde_claro": "#4aa05f", "verde_realce": "#86d27f",
    "rosa": "#e8728a", "rosa_escuro": "#b84a64", "espinho": "#f4ecd8",
    # sofá (tecido azul-acinzentado)
    "tecido_contorno": "#2a3a4e", "tecido_escuro": "#4f6d8a", "tecido": "#6b8cab", "tecido_claro": "#93b0c9", "almofada": "#4aa05f",
    # mesa e toalha
    "toalha_escura": "#8a2420", "toalha": "#b8352c", "prato": "#f4ecd8", "prato_sombra": "#c9bfa5", "vela_dourado": "#f4d35e",
    # TV e rack
    "tv_preto": "#15181f", "tv_tela": "#2b3a5c", "tv_brilho": "#6b7a9a",
    # parede (face norte e linhas)
    "coroa": "#fff3d6", "coroa_sombra": "#cdb88c", "parede": "#e8d3a8", "parede_escura": "#d1b88a", "linha_sombra": "#8a7048",
    # portas
    "vao": "#1a1210", "aco_escuro": "#3a4a6a", "aco": "#5a6e96", "aco_claro": "#8aa0c8", "luz_vermelha": "#e04a3a", "teclas": "#e8e0c8",
    # eletrodomésticos, metais e vidro (lote 2 e parede de vidro)
    "branco_frio": "#e6eef2", "branco_sombra": "#aab7bf", "metal": "#9aa6b0", "metal_escuro": "#5f6a73", "corpo_fogao": "#4a4f57",
    "moldura_vidro": "#cfd8e3", "moldura_vidro_sombra": "#7d8da3", "vidro": "#aee0f2", "reflexo": "#f2fbff",
    # 1.2.1: creme/off-white, travertino, tapete, vidro cinza, mel (fotos do Diretor)
    "creme_luz": "#faf5e8", "creme": "#efe6d2", "creme_sombra": "#d6c9ad", "creme_escuro": "#b9a98a", "creme_contorno": "#7a6a4c",
    "tapete": "#d9c7a0", "tapete_escuro": "#bda980", "pedra": "#e3d7bd", "pedra_veio": "#c9b998",
    "tampo_vidro": "#dfe3e0", "tampo_sombra": "#b9c0bd", "mel": "#c8913f", "mel_escuro": "#8f5f26", "pe_preto": "#1f1d1a",
    "cortica": "#c89c5c", "cortica_escura": "#a07a40", "foto": "#f7f3ea", "pino_azul": "#3f7fc0", "pino_amarelo": "#e8c43a",
    "praia_mar": "#4fb3c9", "praia_areia": "#f1d79a", "caixa_verde": "#4f9a62", "caixa_verde_escura": "#2f6a40",
    # base
    "preto_sombra": "#000000", "branco": "#ffffff",
}
ALFA_SOMBRA = 64   # 25% (um único valor)


def cor(nome, alfa=255):
    h = PALETA[nome].lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16), alfa)


def hex_rgb(h):
    h = h.lstrip("#")
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


class Tela:
    """Desenho 1 px = 1 px de jogo, com cores pelo nome da paleta."""

    def __init__(self, w, h):
        self.im = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        self.d = ImageDraw.Draw(self.im)
        self.w, self.h = w, h

    def r(self, x0, y0, x1, y1, nome):
        self.d.rectangle([x0, y0, x1, y1], fill=cor(nome))

    def p(self, x, y, nome):
        self.d.point((x, y), fill=cor(nome))

    def el(self, x0, y0, x1, y1, nome):
        self.d.ellipse([x0, y0, x1, y1], fill=cor(nome))

    def poly(self, pts, nome):
        self.d.polygon(pts, fill=cor(nome))

    def contorno_interno(self, nome, regiao=None):
        """Pinta de `nome` os pixels opacos que encostam em pixel transparente (4 vizinhos): contorno de 1 px sem aumentar a imagem."""
        a = self.im.load()
        w, h = self.im.size
        marca = []
        for y in range(h):
            for x in range(w):
                if a[x, y][3] == 0:
                    continue
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    nx, ny = x + dx, y + dy
                    if nx < 0 or ny < 0 or nx >= w or ny >= h or a[nx, ny][3] == 0:
                        marca.append((x, y))
                        break
        for x, y in marca:
            a[x, y] = cor(nome)

    def com_sombra(self, dx=SOMBRA, dy=SOMBRA):
        """Devolve uma imagem de (w+dx) x (h+dy) com a silhueta deslocada em preto 25% por baixo (embutida)."""
        out = Image.new("RGBA", (self.w + dx, self.h + dy), (0, 0, 0, 0))
        a = self.im.load()
        o = out.load()
        for y in range(self.h):
            for x in range(self.w):
                if a[x, y][3]:
                    o[x + dx, y + dy] = (0, 0, 0, ALFA_SOMBRA)
        out.alpha_composite(self.im, (0, 0))
        return out


def salvar_indexado(im, caminho, max_cores=16):
    """PNG indexado de 8 bits com a transparência por entrada da paleta. Devolve o número de cores (sem contar o transparente)."""
    px = list(im.getdata())
    cores = []
    for c in px:
        if c[3] == 0:
            continue
        if c not in cores:
            cores.append(c)
    assert len(cores) <= max_cores, f"{caminho.name}: {len(cores)} cores (máximo {max_cores})"
    tabela = [(0, 0, 0, 0)] + cores
    idx = {c: i for i, c in enumerate(tabela)}
    saida = Image.new("P", im.size)
    pal = []
    for c in tabela:
        pal += [c[0], c[1], c[2]]
    pal += [0] * (768 - len(pal))
    saida.putpalette(pal)
    saida.putdata([0 if c[3] == 0 else idx[c] for c in px])
    saida.save(caminho, transparency=bytes(c[3] for c in tabela), optimize=True)
    return len(cores)


# ------------------------------------------------------------------ móveis (pegada w x h tiles; H = altura total acima da aresta sul)
def sombra_de_contato(im, pes, vaos):
    """Sombra de CONTATO embutida (preto 25%, um único valor): nasce onde o pé ou a base toca o piso, não é a silhueta deslocada.
    `pes` = [(x0, x1, y_base)]: faixa de 2 px logo abaixo da linha de base, alongada para a direita e para baixo (até 6 px, luz de cima
    à esquerda). `vaos` = [(x0, y0, x1, y1)]: o chão visível entre os pés (borda inferior do móvel), só onde a imagem é transparente.
    Devolve imagem (w+6) x (h+6), com o móvel por cima."""
    w, h = im.size
    out = Image.new("RGBA", (w + SOMBRA, h + SOMBRA), (0, 0, 0, 0))
    o = out.load()

    def marca(x, y):
        if 0 <= x < w + SOMBRA and 0 <= y < h + SOMBRA:
            o[x, y] = (0, 0, 0, ALFA_SOMBRA)

    for x0, x1, yb in pes:
        for x in range(x0, x1 + 1):
            marca(x, yb + 1); marca(x, yb + 2)
        for s in range(1, SOMBRA + 1):
            dy = (s + 2) // 3
            for x in range(x0, x1 + 1):
                marca(x + s, yb + 1 + dy); marca(x + s, yb + 2 + dy)
    for x0, y0, x1, y1 in vaos:
        for y in range(y0, y1 + 1):
            for x in range(x0, x1 + 1):
                marca(x, y)
    out.alpha_composite(im, (0, 0))
    return out


def sprite_movel(w, h, H, desenhar):
    """Cria o PNG do móvel: largura w*32+6, altura max(h*32, H)+6. `desenhar(tela, hn)` desenha na área w*32 x max(h*32, H) e
    preenche `tela.pes` e `tela.vaos` (contato com o piso). A aresta sul da pegada é a linha max(h*32, H). Âncora (0, max(h*32, H)).
    `movel.sombra` (dx, dy) = alcance máximo da sombra de contato (a margem do PNG)."""
    hn = max(h * T, H)
    t = Tela(w * T, hn)
    t.pes, t.vaos = [], []
    desenhar(t, hn)
    if desenhar.__name__ not in ("cacto", "arvore") and not getattr(t, "sem_contorno_auto", False):
        t.contorno_interno("contorno")
    im = sombra_de_contato(t.im, t.pes, t.vaos)
    return im, {"pegada": {"w": w, "h": h}, "ancora": {"x": 0, "y": hn}, "sombra": {"dx": SOMBRA, "dy": SOMBRA}, "H": H, "E": max(0, H - h * T)}


def cacto(t, hn):
    # H = 48: vaso trapezoidal, coluna com 2 braços em U (alto à esquerda, baixo à direita), 6 espinhos, flor rosa
    t.pes = [(10, 21, 47)]                                          # base do vaso: elipse curta, mais larga à direita
    # vaso
    t.el(6, 33, 25, 40, "barro_claro")                                   # borda elíptica (vista de cima)
    t.el(8, 34, 23, 39, "solo")
    t.poly([(7, 38), (24, 38), (21, 47), (10, 47)], "barro")           # corpo trapezoidal
    t.r(8, 38, 10, 41, "barro_claro")                                    # luz da esquerda
    t.poly([(22, 38), (24, 38), (21, 47), (19, 47)], "barro_escuro")   # lado escuro
    t.r(11, 44, 20, 47, "barro_escuro")
    t.r(9, 38, 22, 40, "barro_claro")                                    # lábio
    t.r(10, 41, 21, 42, "barro_escuro")
    # braço esquerdo (alto) em U
    t.r(4, 15, 9, 29, "verde")
    t.r(4, 24, 13, 29, "verde")
    t.r(5, 14, 8, 14, "verde")
    # braço direito (baixo)
    t.r(22, 23, 27, 33, "verde")
    t.r(18, 29, 27, 34, "verde")
    t.r(23, 22, 26, 22, "verde")
    # coluna
    t.r(12, 9, 19, 37, "verde")
    t.r(13, 7, 18, 8, "verde")
    # luz esquerda, sombra direita, costela central
    for x0, y0, y1 in ((12, 10, 36), (4, 16, 28), (22, 24, 33)):
        t.r(x0, y0, x0 + 1, y1, "verde_claro")
    t.r(13, 9, 14, 12, "verde_realce")
    for x0, y0, y1 in ((18, 10, 36), (8, 18, 28), (26, 25, 33)):
        t.r(x0, y0, x0 + 1, y1, "verde_escuro")
    t.r(15, 10, 15, 36, "verde_escuro")
    t.r(9, 27, 13, 29, "verde_escuro")
    t.r(19, 31, 22, 33, "verde_escuro")
    # espinhos (6 pontos claros)
    for x, y in ((14, 16), (17, 22), (14, 28), (6, 20), (24, 27), (17, 33)):
        t.p(x, y, "espinho")
    # flor rosa no alto da coluna
    t.r(14, 4, 17, 7, "rosa")
    t.p(14, 4, "rosa_escuro"); t.p(17, 7, "rosa_escuro"); t.p(15, 5, "vela_dourado")
    # contorno verde nas bordas das partes verdes e barro nas do vaso (contorno interno por região)
    a = t.im.load()
    verdes = {cor(n) for n in ("verde", "verde_claro", "verde_escuro", "verde_realce", "rosa", "rosa_escuro", "espinho", "vela_dourado")}
    barros = {cor(n) for n in ("barro", "barro_claro", "barro_escuro", "solo")}
    marca = []
    for y in range(t.h):
        for x in range(t.w):
            c = a[x, y]
            if c[3] == 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                viz = a[nx, ny] if 0 <= nx < t.w and 0 <= ny < t.h else (0, 0, 0, 0)
                if viz[3] == 0 or (c in verdes and viz in barros and y > 37) or (c in verdes and viz in barros):
                    marca.append((x, y, "verde_contorno" if c in verdes else "barro_contorno"))
                    break
                if c in barros and viz in verdes:
                    marca.append((x, y, "barro_contorno"))
                    break
    for x, y, n in marca:
        a[x, y] = cor(n)


def sofa(t, hn):
    # 2x2, H = 64: visto pelas COSTAS (a frente aponta para a TV, ao norte): assento ao fundo, encosto baixo e reto com aba, braços baixos,
    # dois módulos creme, pés pretos finos e tapete bege de trama grossa sob ele (dentro da pegada)
    t.sem_contorno_auto = True
    t.pes = [(6, 7, 57), (31, 32, 57), (56, 57, 57)]
    t.r(0, 0, 63, 0, "creme_contorno") if False else None
    # tapete: faixa de trama grossa na frente (sul) do sofá, largura total da pegada
    t.r(0, 56, 63, 63, "tapete")
    for y in range(56, 64):
        for x in range(0, 64):
            if (x // 2 + y // 2) % 2 == 0:
                t.p(x, y, "tapete_escuro")
    t.r(0, 63, 63, 63, "creme_escuro")
    # assento visto por cima do encosto (parte de trás do sofá, ao norte)
    t.r(2, 2, 61, 24, "creme"); t.r(2, 2, 61, 4, "creme_luz")
    t.r(31, 2, 32, 24, "creme_sombra")                              # divisão dos dois módulos
    t.r(5, 7, 28, 20, "creme_luz"); t.r(35, 7, 58, 20, "creme_luz")  # almofadas de assento
    t.r(5, 20, 28, 21, "creme_sombra"); t.r(35, 20, 58, 21, "creme_sombra")
    # braços baixos
    t.r(0, 4, 9, 46, "creme"); t.r(54, 4, 63, 46, "creme_sombra")
    t.r(0, 4, 9, 9, "creme_luz"); t.r(54, 4, 63, 9, "creme")
    t.r(0, 4, 2, 46, "creme_luz")
    # encosto: aba superior e painel traseiro liso
    t.r(8, 22, 55, 27, "creme_luz"); t.r(8, 22, 55, 22, "branco")  # aba
    t.r(8, 28, 55, 47, "creme"); t.r(8, 28, 55, 29, "creme_sombra")
    t.r(31, 28, 32, 47, "creme_sombra")                             # emenda entre os módulos
    t.r(8, 44, 55, 47, "creme_sombra")
    # base e pés pretos
    t.r(8, 48, 55, 53, "creme_escuro")
    t.r(6, 54, 7, 57, "pe_preto"); t.r(31, 54, 32, 57, "pe_preto"); t.r(56, 54, 57, 57, "pe_preto")
    # contorno de 1 px (tom escuro do próprio creme), só no sofá (não no tapete)
    a = t.im.load()
    caixa = []
    for y in range(0, 56):
        for x in range(64):
            if a[x, y][3] == 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or nx > 63 or ny < 0 or a[nx, ny][3] == 0 or (ny >= 56 and a[nx, ny] in (cor("tapete"), cor("tapete_escuro"))):
                    caixa.append((x, y)); break
    for x, y in caixa:
        if a[x, y] != cor("pe_preto"):
            a[x, y] = cor("creme_contorno")
    for x in range(0, 64):                                           # contorno do tapete
        a[x, 63] = cor("creme_escuro")
    for y in range(56, 64):
        a[0, y] = cor("creme_escuro"); a[63, y] = cor("creme_escuro")


def cadeira_creme(t, x, y, lado):
    """Cadeira de tecido creme com braços e encosto curvo de madeira cor de mel, em miniatura. lado: 'costas' (vista por trás),
    'leste' ou 'oeste' (de perfil)."""
    if lado == "costas":
        t.r(x, y, x + 13, y + 9, "creme"); t.r(x, y, x + 13, y + 1, "creme_luz")            # encosto curvo (costas)
        t.r(x - 1, y + 1, x, y + 9, "mel"); t.r(x + 14, y + 1, x + 15, y + 9, "mel")         # braços de madeira
        t.r(x + 1, y + 10, x + 12, y + 12, "creme_sombra")                                  # assento visto por baixo do encosto
        t.r(x, y + 13, x + 1, y + 15, "mel_escuro"); t.r(x + 12, y + 13, x + 13, y + 15, "mel_escuro")   # pés
    else:
        t.r(x, y, x + 9, y + 11, "creme"); t.r(x, y, x + 9, y + 1, "creme_luz")             # perfil: assento e encosto
        t.r(x if lado == "oeste" else x + 8, y, x + 1 if lado == "oeste" else x + 9, y + 11, "mel")   # encosto de madeira
        t.r(x + 1, y + 12, x + 2, y + 14, "mel_escuro"); t.r(x + 7, y + 12, x + 8, y + 14, "mel_escuro")


def mesa(t, hn):
    # 3x2, H = 64 (baixo): tampo cinza claro de vidro, toalha bordada branca cobrindo a parte direita, pratos vermelhos, pernas cor de mel
    # e 6 cadeiras creme com madeira, tudo dentro da pegada de 96x64
    t.pes = [(20, 23, 61), (72, 75, 61)]
    for x in (18, 62):                                         # 2 cadeiras ao norte (atrás da mesa), vistas pela frente: encosto
        t.r(x, 0, x + 13, 7, "creme"); t.r(x, 0, x + 13, 1, "creme_luz"); t.r(x - 1, 1, x, 8, "mel"); t.r(x + 14, 1, x + 15, 8, "mel")
    t.r(14, 14, 81, 40, "tampo_vidro"); t.r(14, 14, 81, 15, "branco"); t.r(14, 14, 15, 40, "tampo_vidro")   # tampo
    t.r(14, 38, 81, 40, "tampo_sombra")
    t.r(52, 12, 81, 41, "creme_luz")                           # toalha bordada (lado direito), um pouco maior que o tampo
    t.r(52, 12, 81, 13, "branco"); t.r(52, 40, 81, 41, "creme_sombra")
    for x, y in ((58, 20), (66, 28), (74, 18), (60, 34)):
        t.p(x, y, "rosa"); t.p(x + 1, y + 1, "pino_azul")      # bordado de passarinhos
    for cx, cy in ((22, 22), (46, 22), (62, 31), (74, 31)):    # pratos vermelhos
        t.el(cx - 4, cy - 2, cx + 4, cy + 2, "toalha"); t.el(cx - 2, cy - 1, cx + 2, cy + 1, "toalha_escura")
    t.r(14, 41, 81, 46, "mel")                                 # saia do tampo
    t.r(14, 41, 81, 42, "mel_escuro") if False else None
    t.r(20, 47, 23, 60, "mel"); t.r(72, 47, 75, 60, "mel"); t.r(20, 47, 20, 60, "mel_escuro") if False else None
    t.r(24, 47, 25, 56, "mel_escuro"); t.r(76, 47, 77, 56, "mel_escuro")       # pernas de trás
    for x in (18, 62):                                         # 2 cadeiras ao sul (na frente), vistas por trás
        cadeira_creme(t, x, 46, "costas")
    cadeira_creme(t, 1, 26, "oeste"); cadeira_creme(t, 84, 26, "leste")          # cadeiras das cabeceiras
    t.contorno_interno("creme_contorno")


def rack(t, hn):
    # 4x1, H = 64 (E = 32; atrás há a face norte): painel de madeira com a TV na parede acima, bancada de travertino que se estende
    # pelos lados, módulo central creme (nicho aberto com aparelhos + 2 gavetas largas), vaso de flores à esquerda e abajur à direita
    t.sem_contorno_auto = True
    t.pes = [(4, 8, 63), (119, 123, 63), (38, 89, 63)]; t.vaos = [(9, 56, 37, 63), (90, 56, 118, 63)]
    t.r(8, 0, 119, 33, "mel"); t.r(8, 0, 119, 1, "mel_escuro") if False else None                  # painel de madeira
    t.r(8, 0, 10, 33, "madeira_realce") if False else None
    t.r(8, 0, 119, 2, "madeira_realce")
    t.r(24, 5, 103, 28, "mel_escuro"); t.r(27, 8, 100, 25, "tv_preto"); t.r(29, 10, 98, 23, "tv_tela"); t.r(31, 11, 52, 12, "tv_brilho")   # TV
    t.r(0, 34, 127, 44, "pedra"); t.r(0, 34, 127, 35, "creme_luz")                                    # bancada: topo
    for x in (14, 40, 70, 100):
        t.r(x, 38, x + 8, 38, "pedra_veio"); t.r(x + 4, 41, x + 12, 41, "pedra_veio")               # veios do travertino
    t.r(0, 45, 127, 49, "pedra_veio"); t.r(0, 45, 127, 45, "pedra")                                   # espessura da pedra
    t.r(4, 50, 8, 63, "creme"); t.r(119, 50, 123, 63, "creme_sombra")                                 # laterais de apoio
    t.r(38, 50, 89, 63, "creme"); t.r(38, 50, 89, 51, "creme_luz")                                    # módulo central
    t.r(42, 52, 85, 56, "tv_preto")                                                                   # nicho aberto
    t.r(45, 53, 52, 55, "metal"); t.r(60, 54, 72, 55, "metal_escuro"); t.r(76, 53, 82, 55, "branco_sombra")   # aparelhos
    t.r(40, 57, 87, 59, "creme_sombra"); t.r(40, 60, 87, 62, "creme_sombra")                         # 2 gavetas largas
    t.r(60, 58, 67, 58, "metal"); t.r(60, 61, 67, 61, "metal")                                        # puxadores
    # vaso de flores claras à esquerda
    t.r(9, 27, 18, 37, "branco"); t.r(9, 27, 10, 37, "creme_luz"); t.r(17, 28, 18, 37, "creme_sombra")
    for x, y in ((8, 18), (12, 14), (16, 19), (10, 22), (14, 23), (18, 15), (6, 24)):
        t.r(x, y, x + 2, y + 2, "branco"); t.p(x + 1, y + 1, "rosa")
    t.r(13, 24, 13, 27, "verde_escuro")
    # abajur à direita
    t.poly([(106, 22), (118, 22), (120, 32), (104, 32)], "creme_luz"); t.r(106, 22, 118, 23, "branco"); t.r(112, 33, 114, 37, "mel_escuro")
    t.r(108, 37, 118, 38, "mel_escuro")
    # contorno: tom escuro da própria cor
    a = t.im.load()
    pontos = []
    for y in range(t.h):
        for x in range(t.w):
            if a[x, y][3] == 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= t.w or ny >= t.h or a[nx, ny][3] == 0:
                    pontos.append((x, y)); break
    for x, y in pontos:
        a[x, y] = cor("contorno") if y < 33 and 8 <= x <= 119 else cor("creme_contorno")


def comoda(t, hn):
    # 1x3, H = 104 (E = 8): aparador creme, frente a oeste (vê-se o topo com os objetos e a ponta sul lisa): quadro de praia, difusor,
    # duas caixas verdes com bolsas pretas
    t.pes = [(2, 6, 103), (25, 29, 103)]; t.vaos = [(7, 101, 24, 103)]
    t.r(0, 8, 31, 86, "creme"); t.r(0, 8, 31, 9, "creme_luz"); t.r(0, 8, 2, 86, "creme_luz")           # bancada larga
    t.r(0, 87, 31, 100, "creme_sombra"); t.r(0, 87, 31, 88, "creme"); t.r(3, 91, 28, 97, "creme")     # ponta sul lisa
    t.r(2, 101, 6, 103, "pe_preto"); t.r(25, 101, 29, 103, "pe_preto")
    # quadro de praia encostado ao fundo (norte)
    t.r(17, 1, 30, 22, "branco"); t.r(18, 2, 29, 21, "praia_mar"); t.r(18, 13, 29, 21, "praia_areia"); t.r(22, 5, 24, 12, "verde"); t.p(21, 5, "verde"); t.p(25, 5, "verde")
    t.r(18, 2, 29, 3, "branco")
    # difusor
    t.r(4, 18, 8, 27, "barro_claro"); t.r(5, 19, 7, 20, "creme_luz"); t.p(5, 14, "creme_contorno"); t.p(7, 12, "creme_contorno"); t.p(6, 16, "creme_contorno")
    # caixas verdes com bolsas pretas
    for y0 in (62, 40):
        t.r(5, y0 + 6, 25, y0 + 20, "caixa_verde"); t.r(5, y0 + 6, 25, y0 + 8, "verde_realce"); t.r(5, y0 + 16, 25, y0 + 20, "caixa_verde_escura")
        t.r(7, y0 - 8, 23, y0 + 6, "pe_preto"); t.r(7, y0 - 8, 23, y0 - 6, "creme_contorno"); t.r(14, y0 - 3, 17, y0, "branco")
    t.contorno_interno("creme_contorno")


# ---- Lote 2: Cozinha e Lavanderia ------------------------------------------------------------------------------------------
def _topo_e_frente(t, w, hn, topo_h, cor_topo, cor_topo_luz, cor_frente, cor_frente_luz):
    """Corpo de eletrodoméstico: plano de cima (topo_h px) e face frontal até a base (hn)."""
    t.r(0, 0, w - 1, topo_h - 1, cor_topo); t.r(0, 0, w - 1, 1, cor_topo_luz); t.r(0, 0, 1, topo_h - 1, cor_topo_luz)
    t.r(0, topo_h, w - 1, hn - 1, cor_frente); t.r(0, topo_h, 1, hn - 1, cor_frente_luz)


def fogao(t, hn):
    # 1x1, H = 44 (E = 12): fogão de 4 bocas visto de cima e forno na frente (parede norte: frente para o sul)
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 13, "corpo_fogao"); t.r(0, 0, 31, 1, "metal")
    for cx, cy in ((9, 4), (22, 4), (9, 10), (22, 10)):
        t.r(cx - 4, cy - 1, cx + 4, cy + 1, "tv_preto"); t.r(cx - 1, cy, cx + 1, cy, "toalha")
    t.r(0, 14, 31, hn - 1, "corpo_fogao"); t.r(0, 14, 1, hn - 1, "metal_escuro")
    for x in (6, 13, 20, 27):
        t.r(x, 16, x + 1, 17, "metal")
    t.r(3, 20, 28, 39, "tv_preto"); t.r(5, 22, 26, 37, "tv_tela"); t.r(6, 23, 12, 24, "tv_brilho")
    t.r(3, 19, 28, 19, "metal")
    t.contorno_interno("contorno")


def pia_cozinha(t, hn):
    # 1x3, H = 104 (E = 8): bancada com cuba em coluna junto à parede leste; frente para oeste (vemos o topo e a ponta sul)
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 86, "metal"); t.r(0, 0, 31, 1, "branco_frio"); t.r(0, 0, 1, 86, "branco_frio")
    t.r(4, 22, 27, 68, "metal_escuro"); t.r(6, 24, 25, 66, "metal")
    t.r(6, 24, 25, 25, "metal_escuro"); t.r(6, 24, 7, 66, "metal_escuro")
    t.r(14, 44, 17, 47, "contorno")
    t.r(2, 8, 12, 12, "metal_escuro"); t.r(3, 9, 11, 10, "branco_frio")
    t.r(0, 87, 31, hn - 1, "madeira"); t.r(0, 87, 31, 88, "madeira_clara")
    t.r(4, 92, 27, hn - 5, "madeira_escura")
    t.contorno_interno("contorno")


def armario_lavanderia(t, hn):
    # 1x2, H = 80 (E = 16): armário alto junto à parede oeste, visto pela ponta sul (portas voltadas para leste)
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 56, "madeira_clara"); t.r(0, 0, 31, 1, "madeira_realce"); t.r(0, 0, 1, 56, "madeira_realce")
    for y in (14, 30, 44):
        t.r(26, y, 28, y + 5, "vela_dourado")
    t.r(0, 57, 31, hn - 1, "madeira"); t.r(0, 57, 31, 58, "madeira_clara")
    t.r(4, 62, 27, hn - 5, "madeira_escura"); t.r(4, 62, 27, 63, "madeira_clara")
    t.contorno_interno("contorno")


# ---- Eletros vistos pelas COSTAS (frente para o norte) -----------------------------------------------------------------------
def geladeira_costas(t, hn):
    t.pes = [(1, 30, hn - 1)]
    _topo_e_frente(t, 32, hn, 8, "branco_sombra", "branco_frio", "branco_sombra", "branco_frio")
    for y in range(11, 21, 3):
        t.r(5, y, 26, y, "metal_escuro")
    t.r(6, 28, 25, 46, "metal_escuro")
    for y in (31, 35, 39, 43):
        t.r(8, y, 23, y, "metal")
    t.r(8, 31, 8, 43, "metal"); t.r(23, 31, 23, 43, "metal")
    t.r(27, 22, 28, 47, "tv_preto"); t.r(24, 47, 28, 48, "tv_preto")
    t.r(3, hn - 3, 6, hn - 2, "metal_escuro"); t.r(25, hn - 3, 28, hn - 2, "metal_escuro")
    t.contorno_interno("contorno")


def forno_costas(t, hn):
    t.pes = [(1, 30, hn - 1)]
    _topo_e_frente(t, 32, hn, 9, "corpo_fogao", "metal", "corpo_fogao", "metal_escuro")
    t.r(0, 9, 31, 10, "metal_escuro")
    for y in (14, 17, 20):
        t.r(6, y, 25, y + 1, "tv_preto")
    t.r(10, 28, 21, 33, "metal"); t.r(11, 29, 20, 32, "metal_escuro")
    t.r(26, 24, 27, 40, "tv_preto"); t.r(22, 40, 27, 41, "tv_preto")
    t.contorno_interno("contorno")


def armario_cozinha_costas(t, hn):
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 8, "madeira_clara"); t.r(0, 0, 31, 1, "madeira_realce"); t.r(0, 0, 1, 8, "madeira_realce")
    t.r(0, 9, 31, 10, "madeira_escura")
    t.r(1, 11, 30, hn - 1, "madeira"); t.r(1, 11, 2, hn - 1, "madeira_clara")
    t.r(15, 11, 16, hn - 3, "madeira_escura")
    for x, y in ((5, 15), (26, 15), (5, 38), (26, 38)):
        t.r(x, y, x + 1, y + 1, "madeira_escura")
    t.contorno_interno("contorno")


def tanque_costas(t, hn):
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 12, "metal"); t.r(0, 0, 31, 1, "branco_frio"); t.r(0, 0, 1, 12, "branco_frio")
    t.r(3, 3, 28, 6, "metal_escuro")
    t.r(0, 13, 31, hn - 1, "branco_sombra"); t.r(0, 13, 1, hn - 1, "branco_frio")
    t.r(7, 14, 10, 30, "tecido"); t.r(7, 14, 8, 30, "tecido_claro")
    t.r(21, 14, 24, 30, "toalha"); t.r(21, 14, 22, 30, "toalha_escura")
    t.r(6, 30, 11, 32, "metal"); t.r(20, 30, 25, 32, "metal")
    t.r(14, 24, 17, 38, "metal_escuro"); t.r(14, 38, 20, 39, "metal_escuro")
    t.contorno_interno("contorno")


def lava_roupas_costas(t, hn):
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 10, "branco_sombra"); t.r(0, 0, 31, 1, "branco_frio"); t.r(0, 0, 1, 10, "branco_frio")
    t.r(3, 3, 28, 8, "branco_frio"); t.r(3, 8, 28, 8, "metal")
    t.r(0, 11, 31, hn - 1, "branco_frio"); t.r(0, 11, 1, hn - 1, "branco_sombra")
    t.r(5, 12, 8, 28, "tecido"); t.r(5, 12, 6, 28, "tecido_claro"); t.r(5, 28, 10, 30, "tecido")
    t.r(14, 12, 17, 26, "metal_escuro"); t.r(14, 26, 21, 28, "metal_escuro")
    t.r(7, 32, 24, 42, "branco_sombra"); t.r(9, 34, 22, 36, "metal"); t.r(9, 38, 22, 40, "metal")
    t.r(26, 14, 27, 40, "tv_preto")
    for x, y in ((3, 14), (28, 14), (3, 44), (28, 44)):
        t.p(x, y, "metal")
    t.contorno_interno("contorno")


# ---- Lote 3: Quarto da Oli, Quarto do casal e Escritório ---------------------------------------------------------------------
def _cama(t, hn, w, h, coberta, coberta_luz):
    W = w * 32
    t.pes = [(2, 7, hn - 1), (W - 8, W - 3, hn - 1)]
    t.r(0, 0, W - 1, 7, "madeira_escura"); t.r(0, 0, W - 1, 1, "madeira")
    t.r(1, 8, W - 2, hn - 14, "prato")
    for i in range(w):
        t.r(i * 32 + 4, 10, i * 32 + 27, 22, "branco_frio"); t.r(i * 32 + 4, 10, i * 32 + 27, 11, "prato")
        t.r(i * 32 + 4, 21, i * 32 + 27, 22, "prato_sombra")
    t.r(1, 26, W - 2, hn - 14, coberta); t.r(1, 26, W - 2, 28, coberta_luz); t.r(1, 26, 2, hn - 14, coberta_luz)
    t.r(0, hn - 13, W - 1, hn - 6, "madeira"); t.r(0, hn - 13, W - 1, hn - 12, "madeira_clara")
    t.r(2, hn - 5, 7, hn - 1, "madeira_escura"); t.r(W - 8, hn - 5, W - 3, hn - 1, "madeira_escura")
    t.contorno_interno("contorno")


def cama_oli(t, hn):
    _cama(t, hn, 1, 2, "toalha", "toalha_escura")


def cama_casal(t, hn):
    _cama(t, hn, 2, 3, "tecido_escuro", "tecido")


def cama_escritorio(t, hn):
    t.pes = [(2, 7, hn - 1), (56, 61, hn - 1)]
    t.r(0, 0, 63, hn - 14, "prato")
    t.r(56, 0, 63, hn - 14, "madeira_escura"); t.r(56, 0, 57, hn - 14, "madeira")
    t.r(38, 8, 55, 38, "branco_frio"); t.r(38, 8, 55, 9, "prato"); t.r(54, 8, 55, 38, "prato_sombra")
    t.r(2, 6, 37, hn - 16, "verde"); t.r(2, 6, 37, 8, "verde_claro"); t.r(2, 6, 3, hn - 16, "verde_claro")
    t.r(0, hn - 13, 63, hn - 6, "madeira"); t.r(0, hn - 13, 63, hn - 12, "madeira_clara")
    t.r(2, hn - 5, 7, hn - 1, "madeira_escura"); t.r(56, hn - 5, 61, hn - 1, "madeira_escura")
    t.contorno_interno("contorno")


def comoda_oli(t, hn):
    t.pes = [(1, 5, hn - 1), (26, 30, hn - 1)]; t.vaos = [(6, hn - 4, 25, hn - 1)]
    t.r(0, 8, 31, 22, "madeira_clara"); t.r(0, 8, 31, 9, "madeira_realce"); t.r(0, 8, 2, 22, "madeira_realce")
    for y in (11, 17):
        t.r(3, y, 5, y + 2, "vela_dourado")
    t.r(0, 23, 31, 34, "madeira"); t.r(0, 23, 31, 24, "madeira_clara")
    t.r(4, 27, 27, 31, "madeira_escura")
    t.r(1, 35, 5, hn - 1, "madeira_escura"); t.r(26, 35, 30, hn - 1, "madeira_escura")
    t.contorno_interno("contorno")


def cadeira_amamentacao(t, hn):
    t.pes = [(3, 8, hn - 1), (23, 28, hn - 1)]
    t.r(19, 2, 30, 40, "metal"); t.r(19, 2, 30, 4, "branco_sombra"); t.r(19, 2, 21, 40, "branco_sombra")
    t.r(21, 6, 28, 14, "branco_sombra")
    t.r(3, 28, 22, 40, "metal"); t.r(3, 28, 22, 30, "branco_sombra")
    t.r(3, 19, 24, 25, "metal_escuro"); t.r(3, 19, 24, 20, "metal"); t.r(3, 19, 5, 25, "metal")
    t.r(4, 41, 8, hn - 1, "madeira_escura"); t.r(23, 41, 27, hn - 1, "madeira_escura")
    t.contorno_interno("contorno")


def armario_casal_costas(t, hn):
    t.pes = [(2, 125, hn - 1)]
    t.r(0, 0, 127, 9, "madeira_clara"); t.r(0, 0, 127, 1, "madeira_realce"); t.r(0, 0, 1, 9, "madeira_realce")
    t.r(0, 10, 127, 11, "madeira_escura")
    t.r(1, 12, 126, hn - 1, "madeira"); t.r(1, 12, 3, hn - 1, "madeira_clara")
    for x in (31, 63, 95):
        t.r(x, 12, x + 1, hn - 3, "madeira_escura")
    for x0 in (0, 32, 64, 96):
        for x, y in ((x0 + 6, 17), (x0 + 25, 17), (x0 + 6, hn - 8), (x0 + 25, hn - 8)):
            t.r(x, y, x + 1, y + 1, "madeira_escura")
    t.r(122, 20, 123, 42, "tv_preto")
    t.contorno_interno("contorno")


def mesa_escritorio(t, hn):
    t.pes = [(4, 9, hn - 1), (86, 91, hn - 1)]; t.vaos = [(10, hn - 3, 85, hn - 1)]
    t.r(0, 10, 95, 26, "madeira_clara"); t.r(0, 10, 95, 11, "madeira_realce"); t.r(0, 10, 2, 26, "madeira_realce")
    t.r(10, 0, 31, 12, "tv_preto"); t.r(12, 2, 29, 10, "tv_tela"); t.r(13, 3, 20, 4, "tv_brilho")
    t.r(8, 12, 33, 22, "metal"); t.r(8, 12, 33, 13, "branco_frio")
    t.r(46, 14, 62, 24, "prato"); t.r(46, 14, 62, 15, "branco_frio"); t.r(48, 17, 58, 17, "prato_sombra")
    t.el(74, 14, 84, 23, "toalha"); t.el(76, 16, 82, 20, "toalha_escura")
    t.r(0, 27, 95, 33, "madeira"); t.r(0, 27, 95, 28, "madeira_clara")
    t.r(60, 29, 85, 32, "madeira_escura"); t.r(70, 30, 75, 31, "vela_dourado")
    t.r(4, 34, 9, hn - 1, "madeira_escura"); t.r(86, 34, 91, hn - 1, "madeira_escura")
    t.contorno_interno("contorno")


# ---- Lote 4: banheiros e Quartinho ---------------------------------------------------------------------------------------------
def box_frente(t, hn):
    W = 96
    t.pes = [(2, W - 3, hn - 1)]
    t.r(0, 0, W - 1, 7, "metal"); t.r(0, 0, W - 1, 1, "branco_frio"); t.r(0, 0, 1, 7, "branco_frio")
    t.r(0, 8, W - 1, hn - 7, "moldura_vidro_sombra")
    for i in range(3):
        x0 = i * 32
        t.d.rectangle([x0 + 3, 10, x0 + 28, hn - 9], fill=cor("vidro", 120))
        t.r(x0 + 3, 10, x0 + 28, 10, "moldura_vidro"); t.r(x0 + 3, 10, x0 + 3, hn - 9, "moldura_vidro")
        for k in range(3):
            t.d.point((x0 + 6 + k, 14 + k), fill=cor("reflexo", 220)); t.d.point((x0 + 18 + k, 24 + k), fill=cor("reflexo", 220))
    t.r(30, 28, 33, 44, "metal"); t.r(31, 28, 31, 44, "branco_frio")
    t.r(62, 28, 65, 44, "metal"); t.r(63, 28, 63, 44, "branco_frio")
    t.r(44, 26, 46, 38, "metal_escuro")
    t.r(0, hn - 6, W - 1, hn - 1, "branco_sombra"); t.r(0, hn - 6, W - 1, hn - 5, "branco_frio")
    t.contorno_interno("contorno")


def privada_frente(t, hn):
    t.pes = [(6, 25, hn - 1)]
    t.r(6, 0, 25, 14, "branco_frio"); t.r(6, 0, 25, 1, "prato"); t.r(6, 0, 7, 14, "prato")
    t.r(23, 0, 25, 14, "branco_sombra"); t.r(14, 3, 17, 5, "metal")
    t.el(5, 15, 26, 34, "branco_frio"); t.el(8, 18, 23, 31, "branco_sombra"); t.el(10, 20, 21, 29, "tecido_claro")
    t.poly([(6, 29), (25, 29), (22, 44), (9, 44)], "branco_frio")
    t.poly([(20, 31), (25, 29), (22, 44), (19, 44)], "branco_sombra")
    t.r(9, 44, 22, hn - 1, "branco_sombra")
    t.contorno_interno("contorno")


def pia_banheiro_costas(w):
    def desenhar(t, hn):
        W = w * 32
        t.pes = [(2, W - 3, hn - 1)]
        t.r(0, 0, W - 1, 11, "branco_frio"); t.r(0, 0, W - 1, 1, "prato"); t.r(0, 0, 1, 11, "prato")
        for i in range(w):
            t.el(i * 32 + 6, 3, i * 32 + 25, 10, "branco_sombra"); t.el(i * 32 + 9, 4, i * 32 + 22, 9, "metal")
            t.r(i * 32 + 14, 0, i * 32 + 17, 2, "metal_escuro")
        t.r(0, 12, W - 1, hn - 1, "branco_sombra"); t.r(0, 12, 1, hn - 1, "branco_frio")
        for i in range(w):
            t.r(i * 32 + 14, 14, i * 32 + 17, 32, "metal"); t.r(i * 32 + 14, 14, i * 32 + 14, 32, "branco_frio")
            t.r(i * 32 + 10, 32, i * 32 + 21, 34, "metal_escuro")
        t.contorno_interno("contorno")
    return desenhar


def pia_banheiro_frente(t, hn):
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 13, "branco_frio"); t.r(0, 0, 31, 1, "prato"); t.r(0, 0, 1, 13, "prato")
    t.el(5, 3, 26, 12, "branco_sombra"); t.el(8, 4, 23, 11, "metal"); t.r(14, 0, 17, 3, "metal_escuro")
    t.r(0, 14, 31, hn - 1, "branco_sombra"); t.r(0, 14, 1, hn - 1, "branco_frio")
    t.r(4, 18, 27, hn - 5, "branco_frio"); t.r(4, 18, 27, 19, "prato"); t.r(22, 28, 24, 32, "metal")
    t.contorno_interno("contorno")


def privada_costas(t, hn):
    t.pes = [(6, 25, hn - 1)]
    t.r(6, 0, 25, 8, "branco_frio"); t.r(6, 0, 25, 1, "prato"); t.r(6, 0, 7, 8, "prato")
    t.r(6, 9, 25, 26, "branco_sombra"); t.r(6, 9, 7, 26, "branco_frio")
    t.r(10, 12, 12, 13, "metal"); t.r(19, 12, 21, 13, "metal")
    t.r(21, 22, 24, 40, "metal"); t.r(21, 22, 21, 40, "branco_frio")
    t.poly([(7, 27), (24, 27), (21, 44), (10, 44)], "branco_frio")
    t.r(10, 44, 21, hn - 1, "branco_sombra")
    t.r(9, 28, 22, 30, "metal_escuro")
    t.contorno_interno("contorno")


def box_costas(t, hn):
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 7, "metal"); t.r(0, 0, 31, 1, "branco_frio"); t.r(0, 0, 1, 7, "branco_frio")
    t.r(0, 8, 31, hn - 1, "tecido_claro"); t.r(0, 8, 1, hn - 1, "branco_frio")
    for x in (10, 21):
        t.r(x, 8, x, hn - 1, "tecido")
    for y in (18, 28, 38):
        t.r(1, y, 31, y, "tecido")
    t.r(14, 8, 17, 30, "metal"); t.r(14, 8, 14, 30, "branco_frio"); t.r(10, 30, 21, 33, "metal_escuro")
    t.contorno_interno("contorno")


def prateleira_costas(t, hn):
    W = 96
    t.pes = [(2, W - 3, hn - 1)]
    t.r(0, 0, W - 1, 9, "madeira_clara"); t.r(0, 0, W - 1, 1, "madeira_realce"); t.r(0, 0, 1, 9, "madeira_realce")
    for x0, c in ((8, "toalha"), (30, "verde_claro"), (56, "vela_dourado"), (76, "tecido")):
        t.r(x0, 0, x0 + 12, 7, c); t.r(x0, 0, x0 + 12, 1, "prato")
    t.r(0, 10, W - 1, hn - 1, "madeira"); t.r(0, 10, 3, hn - 1, "madeira_clara")
    for x in (28, 60, 90):
        t.r(x, 10, x + 3, hn - 1, "madeira_escura")
    for y in (22, 36, 48):
        t.r(4, y, W - 5, y + 2, "madeira_escura")
    t.d.line([(6, 24), (28, 46)], fill=cor("madeira_escura"), width=2); t.d.line([(62, 24), (88, 46)], fill=cor("madeira_escura"), width=2)
    t.contorno_interno("contorno")


def prateleira_frente(t, hn):
    t.pes = [(1, 30, hn - 1)]
    t.r(0, 0, 31, 5, "madeira_clara"); t.r(0, 0, 31, 1, "madeira_realce")
    t.r(0, 6, 31, hn - 1, "madeira_escura")
    t.r(0, 6, 3, hn - 1, "madeira"); t.r(28, 6, 31, hn - 1, "madeira")
    for y in (6, 24, 42):
        t.r(0, y + 16, 31, y + 18, "madeira"); t.r(0, y + 16, 31, y + 16, "madeira_clara")
    for x, y, c in ((6, 14, "toalha"), (16, 12, "verde_claro"), (22, 16, "vela_dourado"), (7, 32, "tecido"), (17, 30, "toalha_escura"), (7, 50, "vela_dourado"), (18, 48, "verde_claro")):
        t.r(x, y, x + 7, y + 7 if y < 40 else y + 8, c); t.r(x, y, x + 7, y, "prato")
    t.contorno_interno("contorno")


# ---- Árvore de Natal e mini-árvores (estilo do cacto) ----------------------------------------------------------------------------
def _folhagem(t, cx, ytopo, ybase, largura, luz=True):
    meia = largura // 2
    pts = [(cx, ytopo), (cx + meia, ybase - 3), (cx + meia - 3, ybase), (cx + meia // 2, ybase - 2), (cx, ybase), (cx - meia // 2, ybase - 2),
           (cx - meia + 3, ybase), (cx - meia, ybase - 3)]
    t.poly(pts, "verde")
    t.poly([(cx, ytopo), (cx - meia, ybase - 3), (cx - meia + 3, ybase), (cx - meia // 2, ybase - 2), (cx, ybase - 4), (cx, ytopo + 4)], "verde_claro")
    t.poly([(cx, ytopo + 3), (cx + meia, ybase - 3), (cx + meia - 3, ybase), (cx + meia // 2, ybase - 2), (cx, ybase - 1)], "verde")
    t.poly([(cx + 2, ytopo + 5), (cx + meia - 1, ybase - 4), (cx + meia - 3, ybase - 1), (cx + meia // 2, ybase - 3), (cx + 2, ybase - 2)], "verde_escuro")
    if luz:
        t.r(cx - meia // 2, ybase - 4, cx - meia // 2 + 2, ybase - 3, "verde_realce")


def _vaso_arvore(t, base, topo, esq, dir_):
    t.poly([(esq, topo), (dir_, topo), (dir_ - 3, base), (esq + 3, base)], "toalha")
    t.r(esq + 1, topo, esq + 3, base - 1, "toalha")
    t.poly([(dir_ - 5, topo), (dir_, topo), (dir_ - 3, base), (dir_ - 6, base)], "toalha_escura")
    t.r(esq, topo, dir_, topo + 2, "vela_dourado")
    t.r(esq + 3, topo + 5, dir_ - 3, topo + 6, "vela_dourado")


def _arvore(estado):
    def desenhar(t, hn):
        t.pes = [(8, 23, hn - 1)]
        if estado != "desmontada":
            t.r(14, 24 if estado != "1parte" else 14, 17, 45, "madeira"); t.r(14, 14 if estado == "1parte" else 24, 15, 45, "madeira_clara")
        _vaso_arvore(t, hn - 1, 43, 6, 25)
        if estado == "desmontada":
            t.r(14, 38, 17, 44, "madeira"); t.r(14, 38, 15, 44, "madeira_clara")
            t.poly([(2, 54), (5, 46), (8, 54)], "verde_escuro"); t.poly([(3, 54), (5, 49), (7, 54)], "verde")
            t.poly([(25, 55), (29, 47), (31, 55)], "verde_escuro"); t.poly([(26, 55), (29, 50), (30, 55)], "verde_claro")
        else:
            if estado in ("2partes", "completa", "enfeitada"):
                _folhagem(t, 16, 18, 44, 30)
            if estado in ("completa", "enfeitada"):
                _folhagem(t, 16, 4, 26, 22)
            if estado == "enfeitada":
                for (x, y, c) in ((12, 20, "toalha"), (21, 21, "vela_dourado"), (10, 33, "vela_dourado"), (22, 34, "toalha"), (16, 28, "toalha"), (13, 11, "vela_dourado"), (19, 14, "toalha")):
                    t.r(x - 1, y - 1, x + 1, y + 1, c); t.p(x - 1, y - 1, "reflexo")
                t.poly([(16, 0), (17, 2), (20, 2), (18, 4), (19, 7), (16, 5), (13, 7), (14, 4), (12, 2), (15, 2)], "vela_dourado")
                for (x0, y0, x1, y1) in ((9, 24, 14, 26), (14, 26, 22, 28), (11, 36, 17, 38), (17, 38, 23, 40)):
                    t.r(x0, y0, x1, y1, "verde_realce")
    return desenhar


def _contorno_colorido(t, verdes, castanhos):
    a = t.im.load()
    marca = []
    for y in range(t.h):
        for x in range(t.w):
            c = a[x, y]
            if c[3] == 0:
                continue
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                nx, ny = x + dx, y + dy
                if nx < 0 or ny < 0 or nx >= t.w or ny >= t.h or a[nx, ny][3] == 0:
                    marca.append((x, y, "verde_contorno" if c in verdes else "contorno"))
                    break
    for x, y, n in marca:
        a[x, y] = cor(n)


def arvore_estado(estado):
    fn = _arvore(estado)

    def desenhar(t, hn):
        fn(t, hn)
        verdes = {cor(n) for n in ("verde", "verde_claro", "verde_escuro", "verde_realce")}
        _contorno_colorido(t, verdes, None)
    desenhar.__name__ = "arvore"
    return desenhar


def mini_arvore(H, andares):
    def desenhar(t, hn):
        t.pes = [(9, 22, hn - 1)]
        base = hn
        _vaso_arvore(t, base - 1, base - 9, 8, 23)
        t.r(14, base - 14, 17, base - 9, "madeira")
        topo = 2
        if andares == 1:
            _folhagem(t, 16, topo + 8, base - 8, 22)
        else:
            _folhagem(t, 16, topo + 12, base - 8, 26)
            _folhagem(t, 16, topo, topo + 22, 18)
            t.poly([(16, 0), (17, 2), (19, 2), (17, 3), (18, 5), (16, 4), (14, 5), (15, 3), (13, 2), (15, 2)], "vela_dourado")
        verdes = {cor(n) for n in ("verde", "verde_claro", "verde_escuro", "verde_realce")}
        _contorno_colorido(t, verdes, None)
    desenhar.__name__ = "arvore"
    return desenhar


# ---- Peças da árvore, bilhete e interruptor de parede --------------------------------------------------------------------------
def peca_3_4(ordem):
    t = Tela(32, 32)
    if ordem == 1:
        t.r(13, 6, 18, 18, "madeira"); t.r(13, 6, 14, 18, "madeira_clara")
        _vaso_arvore(t, 28, 17, 6, 25)
    elif ordem == 2:
        _folhagem(t, 16, 5, 27, 26)
    else:
        _folhagem(t, 16, 8, 27, 18)
        t.poly([(16, 1), (17, 3), (19, 3), (17, 4), (18, 6), (16, 5), (14, 6), (15, 4), (13, 3), (15, 3)], "vela_dourado")
    verdes = {cor(n) for n in ("verde", "verde_claro", "verde_escuro", "verde_realce")}
    _contorno_colorido(t, verdes, None)
    t.pes = [(8, 23, 28)]
    im = sombra_de_contato(t.im, t.pes, [])
    return im.crop((0, 0, 32, 32))


def bilhete_parede():
    t = Tela(16, 24)
    t.r(3, 3, 12, 17, "tecido_contorno")
    t.r(4, 4, 11, 16, "prato"); t.r(4, 4, 11, 4, "branco_frio"); t.r(4, 4, 4, 16, "branco_frio"); t.r(11, 5, 11, 16, "prato_sombra")
    for y in (8, 11, 14):
        t.r(5, y, 10 if y != 14 else 8, y, "tecido")
    t.r(7, 5, 8, 6, "luz_vermelha")
    t.r(4, 17, 11, 18, "prato_sombra")
    return t.im


def interruptor_parede(aceso):
    t = Tela(16, 24)
    if aceso:
        t.d.rectangle([2, 0, 13, 17], fill=cor("vela_dourado", 70))
    t.r(3, 2, 12, 15, "tecido_contorno")
    t.r(4, 3, 11, 14, "moldura_vidro"); t.r(4, 3, 11, 3, "branco_frio"); t.r(4, 3, 4, 14, "branco_frio"); t.r(11, 4, 11, 14, "moldura_vidro_sombra")
    t.r(6, 5, 9, 12, "metal_escuro")
    if aceso:
        t.r(6, 5, 9, 8, "vela_dourado"); t.r(6, 9, 9, 12, "metal")
        t.r(5, 4, 10, 4, "verde_realce")
    else:
        t.r(6, 9, 9, 12, "metal"); t.r(6, 5, 9, 8, "tv_preto")
        t.r(7, 4, 8, 4, "luz_vermelha")
    return t.im


# ---- Parede de vidro (Sala, lado oeste) -----------------------------------------------------------------------------------------
def _vidro_v(altura, antes, depois, sombra):
    t = Tela(8, altura)
    a = t.im
    d = t.d
    h_vidro0 = 32 if altura > 32 else 0
    t.r(0, 0, 0, altura - 1, "tecido_contorno"); t.r(7, 0, 7, altura - 1, "tecido_contorno")
    t.r(1, 0, 6, altura - 1, "moldura_vidro")
    for y in range(h_vidro0, altura):
        d.rectangle([2, y, 5, y], fill=cor("vidro", 110))
    t.r(1, 0, 1, altura - 1, "moldura_vidro"); t.r(6, 0, 6, altura - 1, "moldura_vidro_sombra")
    for y0 in ([h_vidro0] if altura > 32 else [0]):
        d.rectangle([1, y0, 6, y0 + 1], fill=cor("moldura_vidro"))
        d.rectangle([1, y0 + 1, 6, y0 + 1], fill=cor("moldura_vidro_sombra"))
    d.rectangle([1, altura - 2, 6, altura - 1], fill=cor("moldura_vidro_sombra") if not depois else cor("moldura_vidro"))
    for y in range(h_vidro0 + 4, altura - 3, 16):
        for k in range(4):
            if y + k < altura - 2:
                d.point((2 + k, y + k), fill=cor("reflexo", 200))
    if not antes:
        t.r(0, 0, 7, 0, "tecido_contorno")
    if not depois:
        t.r(0, altura - 1, 7, altura - 1, "tecido_contorno")
    im = Image.new("RGBA", (8 + (SOMBRA if sombra else 0), altura), (0, 0, 0, 0))
    im.alpha_composite(a, (0, 0))
    if sombra:
        y0 = (altura - 32) + (0 if antes else SOMBRA)
        for y in range(y0, altura):
            for x in range(8, 12):
                im.putpixel((x, y), (0, 0, 0, ALFA_SOMBRA))
    return im


def pecas_de_vidro():
    p = {}
    for sombra in (False, True):
        suf = "_sombra" if sombra else ""
        p["vidro_meio" + suf] = _vidro_v(32, True, True, sombra)
        p["vidro_fim" + suf] = _vidro_v(32, True, False, sombra)
        p["vidro_ilha" + suf] = _vidro_v(32, False, False, sombra)
        p["vidro_topo" + suf] = _vidro_v(32, False, True, sombra)
        p["vidro_topo_com_face" + suf] = _vidro_v(64, False, True, sombra)
    return p


# ------------------------------------------------------------------ paredes
def face_meio():
    t = Tela(T, 32)
    t.r(0, 6, 31, 25, "parede")                                # parede
    t.r(0, 6, 31, 8, "parede_escura")                          # sombra sob a coroa
    t.r(0, 0, 31, 0, "contorno")                               # contorno da coroa
    t.r(0, 1, 31, 4, "coroa"); t.r(0, 5, 31, 5, "coroa_sombra")   # coroa (1 + 5 px)
    t.r(0, 26, 31, 26, "madeira_clara"); t.r(0, 27, 31, 30, "madeira"); t.r(0, 31, 31, 31, "contorno")   # rodapé 6 px
    im = Image.new("RGBA", (T, 32 + SOMBRA), (0, 0, 0, 0))
    im.alpha_composite(t.im, (0, 0))
    for y in range(32, 32 + SOMBRA):                           # sombra de 6 px sobre a primeira linha de piso
        for x in range(T):
            im.putpixel((x, y), (0, 0, 0, ALFA_SOMBRA))
    return im


def linha_v(altura=32, sombra_leste=False):
    t = Tela(8, altura)
    t.r(0, 0, 0, altura - 1, "contorno"); t.r(1, 0, 5, altura - 1, "coroa"); t.r(6, 0, 6, altura - 1, "linha_sombra")
    t.r(7, 0, 7, altura - 1, "contorno"); t.r(0, 0, 7, 0, "contorno")
    t.r(1, 1, 5, 1, "coroa_sombra")
    if altura > 32:
        t.r(0, 32, 7, 32, "coroa_sombra")                    # junta entre a parte da face e a linha
    im = Image.new("RGBA", (8 + (SOMBRA if sombra_leste else 0), altura), (0, 0, 0, 0))
    im.alpha_composite(t.im, (0, 0))
    if sombra_leste:
        for y in range(altura - 32 + 4 if altura > 32 else 4, altura):
            for x in range(8, 12):
                im.putpixel((x, y), (0, 0, 0, ALFA_SOMBRA))
    return im


def _faces(esq, dir_):
    im = face_meio()
    for x, ativo in ((0, esq), (T - 1, dir_)):
        if ativo:
            for y in range(32):
                im.putpixel((x, y), cor("contorno"))
    return im


def _linha_h(esq, dir_):
    """Muro interno horizontal (piso dos dois lados): 32x8, mesmo corte da linha lateral girado (1 contorno, 5 topo claro, 2 sombra)."""
    t = Tela(T, 8)
    t.r(0, 0, T - 1, 0, "contorno"); t.r(0, 1, T - 1, 5, "coroa"); t.r(0, 6, T - 1, 6, "linha_sombra"); t.r(0, 7, T - 1, 7, "contorno")
    t.r(1, 1, T - 2, 1, "coroa_sombra")
    for x, ativo in ((0, esq), (T - 1, dir_)):
        if ativo:
            t.r(x, 0, x, 7, "contorno")
    return t.im


def _linha_v(altura, antes, depois, sombra):
    """Linha lateral de 8 px. `antes`: continua para cima (sem tampa); `depois`: continua para baixo. Com 64 de altura, os 32 de cima
    são o pilar da face. Sombra de 6 px a leste na parte de piso (a partir de 6 px do topo do tile, contínua se `antes`)."""
    t = Tela(8, altura)
    t.r(0, 0, 0, altura - 1, "contorno"); t.r(1, 0, 5, altura - 1, "coroa"); t.r(6, 0, 6, altura - 1, "linha_sombra"); t.r(7, 0, 7, altura - 1, "contorno")
    if not antes:
        t.r(0, 0, 7, 0, "contorno"); t.r(1, 1, 5, 1, "coroa_sombra")
    if not depois:
        t.r(0, altura - 1, 7, altura - 1, "contorno")
    if altura > 32:
        t.r(1, 31, 5, 31, "coroa_sombra")
    im = Image.new("RGBA", (8 + (SOMBRA if sombra else 0), altura), (0, 0, 0, 0))
    im.alpha_composite(t.im, (0, 0))
    if sombra:
        y0 = (altura - 32) + (0 if antes else SOMBRA)
        for y in range(y0, altura):
            for x in range(8, 12):                    # sombra de base: faixa de 4 px colada à linha (não a silhueta)
                im.putpixel((x, y), (0, 0, 0, ALFA_SOMBRA))
    return im


def pecas_de_parede():
    """As 17 peças que `tools/listar-combinacoes-de-parede.mjs` lista nas 9 áreas (nome = chaveDaPeca)."""
    p = {}
    for nome, (e, d) in {"meio": (False, False), "esquerda": (True, False), "direita": (False, True), "ilha": (True, True)}.items():
        p[f"face_norte_{nome}"] = _faces(e, d)
        p[f"linha_h_{nome}"] = _linha_h(e, d)
    for sombra in (False, True):
        suf = "_sombra" if sombra else ""
        p["linha_v_meio" + suf] = _linha_v(32, True, True, sombra)
        p["linha_v_fim" + suf] = _linha_v(32, True, False, sombra)
        p["linha_v_ilha" + suf] = _linha_v(32, False, False, sombra)
        p["linha_v_topo_com_face" + suf] = _linha_v(64, False, True, sombra)
    p["linha_v_topo_sombra"] = _linha_v(32, False, True, True)
    p["linha_v_topo"] = _linha_v(32, False, True, False)
    return p


# Arestas desenhadas com a peça `spr_parede_vidro_<posição>[_sombra]` em vez de `spr_parede_<posição>[_sombra]` (só desenho; a colisão
# não muda). Coordenadas do CONTEÚDO (já girado): aresta vertical à esquerda do tile (x, y). Sala: parede oeste, coluna 0, linhas 3 a 8.
VISTA_JSON = {
    "_nota": "dados de arte da visão 3/4 (ADR-012). vidro: arestas `linha_v` desenhadas com a peça de vidro; chave = id da área.",
    "schemaVersion": 1,
    "vidro": {"sala": [{"tipo": "linha_v", "x": 0, "y": y} for y in range(3, 9)]},
}


def gerar_assets(moveis_im, moveis_meta):
    """Grava o kit real em assets/hd-480x352/ e atualiza o sprites.json (idempotente)."""
    novos = {}
    for nome, im in pecas_de_parede().items():
        salvar_indexado(im, ASSETS / f"spr_parede_{nome}.png", 32)
        novos[f"spr_parede_{nome}.png"] = {"arquivo": f"spr_parede_{nome}.png", "tipo": "imagem"}
    for nome, im in pecas_de_vidro().items():
        salvar_indexado(im, ASSETS / f"spr_parede_{nome}.png", 32)
        novos[f"spr_parede_{nome}.png"] = {"arquivo": f"spr_parede_{nome}.png", "tipo": "imagem"}
    (ASSETS / "vista.json").write_text(json.dumps(VISTA_JSON, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    # peças que a lista não pede hoje (linha_v_topo) ficam de reserva; o desenho cai no `spr_parede_<tipo>` se faltar alguma
    for lado, fn, w, h, anc in (("norte", porta_norte, 32, 38, (16, 32)), ("lado", porta_lado, 12, 32, (6, 16)), ("sul", porta_sul, 32, 12, (16, 12))):
        folha = Image.new("RGBA", (w * 3, h), (0, 0, 0, 0))
        for i in range(3):
            folha.alpha_composite(fn(i), (i * w, 0))
        salvar_indexado(folha, ASSETS / f"spr_porta_{lado}.png", 32)
        novos[f"spr_porta_{lado}.png"] = {"arquivo": f"spr_porta_{lado}.png", "tipo": "folhas", "quadro": {"w": w, "h": h}, "quadros": 3,
                                           "ancora": {"x": anc[0], "y": anc[1]}}
    for o in (1, 2, 3):
        im = peca_3_4(o)
        salvar_indexado(im, ASSETS / f"spr_peca_{o}.png", 32)
        salvar_indexado(im.resize((96, 96), Image.NEAREST), ASSETS / f"spr_conquista_parte{o}.png", 32)
    salvar_indexado(bilhete_parede(), ASSETS / "spr_bilhete.png", 32)
    novos["spr_bilhete.png"] = {"arquivo": "spr_bilhete.png", "tipo": "imagem", "ancora": {"x": 8, "y": 23}}
    folha_i = Image.new("RGBA", (32, 24), (0, 0, 0, 0))
    folha_i.alpha_composite(interruptor_parede(False), (0, 0)); folha_i.alpha_composite(interruptor_parede(True), (16, 0))
    salvar_indexado(folha_i, ASSETS / "spr_interruptor.png", 32)
    novos["spr_interruptor.png"] = {"arquivo": "spr_interruptor.png", "tipo": "folhas", "quadro": {"w": 16, "h": 24}, "quadros": 2,
                                    "ancora": {"x": 8, "y": 23}}
    for nome, im in moveis_im.items():
        salvar_indexado(im, ASSETS / f"{nome}.png", 16)
        meta = moveis_meta[nome]
        novos[f"{nome}.png"] = {"arquivo": f"{nome}.png", "tipo": "imagem",
                                    "movel": {"pegada": meta["pegada"], "ancora": meta["ancora"], "sombra": meta["sombra"]}}
    caminho = ASSETS / "sprites.json"
    dados = json.loads(caminho.read_text(encoding="utf-8"))
    imagens = [i for i in dados["imagens"] if i["arquivo"] not in novos] + list(novos.values())
    imagens.sort(key=lambda i: i["arquivo"])
    dados["imagens"] = imagens
    caminho.write_text(json.dumps(dados, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    return sorted(novos)


# ------------------------------------------------------------------ portas (3 estados por lado: 0 fechada, 1 com código, 2 aberta)
def porta_norte(estado):
    """32x38 (peça na face: 32 de face + 6 de sombra). O sinal do estado fica nos 16 px de baixo (y 16..31)."""
    t = Tela(T, 32)
    t.r(0, 0, 31, 0, "contorno"); t.r(0, 1, 31, 4, "coroa"); t.r(0, 5, 31, 5, "coroa_sombra")     # coroa contínua
    t.r(0, 6, 31, 31, "parede"); t.r(0, 6, 31, 8, "parede_escura")
    t.r(3, 6, 28, 31, "contorno")                                                                  # batente
    if estado == 0:   # fechada: folha de madeira, painéis, maçaneta dourada embaixo
        t.r(4, 7, 27, 31, "madeira"); t.r(4, 7, 27, 8, "madeira_clara"); t.r(4, 7, 5, 31, "madeira_clara")
        t.r(8, 11, 23, 17, "madeira_escura"); t.r(8, 21, 23, 29, "madeira_escura")
        t.r(8, 11, 23, 11, "madeira_clara"); t.r(8, 21, 23, 21, "madeira_clara")
        t.r(21, 22, 24, 25, "vela_dourado"); t.p(24, 25, "contorno")
    elif estado == 1:  # com código: folha azul-aço, placa de teclas e luz vermelha
        t.r(4, 7, 27, 31, "aco"); t.r(4, 7, 27, 8, "aco_claro"); t.r(4, 7, 5, 31, "aco_claro")
        t.r(8, 11, 23, 14, "aco_escuro")
        t.r(17, 18, 26, 29, "tv_preto"); t.r(18, 19, 25, 28, "aco_escuro")                       # placa de teclas
        for x in (19, 22):
            for y in (23, 26):
                t.r(x, y, x + 1, y + 1, "teclas")
        t.r(20, 20, 23, 21, "luz_vermelha")
    else:              # aberta: vão escuro, folha encostada de lado (faixa estreita à esquerda), soleira dourada
        t.r(4, 7, 27, 31, "vao"); t.r(4, 7, 27, 8, "tv_preto")
        t.poly([(4, 7), (10, 9), (10, 31), (4, 31)], "madeira"); t.r(4, 7, 5, 31, "madeira_clara")
        t.r(11, 28, 27, 31, "tecido_escuro"); t.r(11, 30, 27, 31, "vela_dourado")                  # piso do vão e soleira
    t.r(3, 31, 28, 31, "contorno")
    im = Image.new("RGBA", (T, 38), (0, 0, 0, 0))
    im.alpha_composite(t.im, (0, 0))
    for y in range(32, 38):
        for x in range(T):
            im.putpixel((x, y), (0, 0, 0, ALFA_SOMBRA))
    return im


def porta_lado(estado):
    """12x32 sobre a linha lateral (8 px) com 2 px de cada lado para o batente."""
    t = Tela(12, 32)
    if estado == 0:   # fechada: folha de perfil, dobradiças
        t.r(2, 0, 9, 31, "contorno"); t.r(3, 1, 8, 30, "madeira"); t.r(3, 1, 4, 30, "madeira_clara")
        t.r(2, 3, 9, 5, "linha_sombra"); t.r(2, 26, 9, 28, "linha_sombra")                         # dobradiças
        t.r(6, 15, 8, 17, "vela_dourado")
    elif estado == 1:  # com código
        t.r(2, 0, 9, 31, "contorno"); t.r(3, 1, 8, 30, "aco"); t.r(3, 1, 4, 30, "aco_claro")
        t.r(4, 12, 7, 19, "tv_preto"); t.r(5, 13, 6, 14, "luz_vermelha"); t.r(5, 16, 6, 18, "teclas")
    else:              # aberta: sem folha; vão com soleira e batentes
        t.r(0, 0, 11, 1, "contorno"); t.r(0, 30, 11, 31, "contorno")
        t.r(3, 2, 8, 29, "vao"); t.r(5, 2, 6, 29, "vela_dourado")
    return t.im


def porta_sul(estado):
    """32x12: faixa vista de cima, toda ACIMA da aresta (âncora y = 12: a base da faixa encosta na aresta), para não sumir sob a barra."""
    im = _porta_sul_base(estado)
    out = Image.new("RGBA", (T, 12), (0, 0, 0, 0))
    out.alpha_composite(im, (0, 1))
    return out


def _porta_sul_base(estado):
    t = Tela(T, 11)
    if estado == 0:
        t.r(0, 1, 31, 10, "contorno"); t.r(1, 2, 30, 9, "madeira"); t.r(1, 2, 30, 3, "madeira_clara")
        t.r(20, 5, 24, 8, "vela_dourado")
    elif estado == 1:
        t.r(0, 1, 31, 10, "contorno"); t.r(1, 2, 30, 9, "aco"); t.r(1, 2, 30, 3, "aco_claro")
        t.r(14, 4, 24, 8, "tv_preto"); t.r(15, 5, 17, 6, "luz_vermelha"); t.r(19, 5, 23, 7, "teclas")
    else:
        t.r(0, 1, 3, 10, "contorno"); t.r(28, 1, 31, 10, "contorno")
        t.r(4, 5, 27, 6, "vela_dourado")
    return t.im


# ------------------------------------------------------------------ cena da Sala
def carregar(nome):
    return Image.open(ASSETS / f"{nome}.png").convert("RGBA")


def fonte(n):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", n)
    except OSError:
        return ImageFont.load_default()


def arestas_da_sala():
    d = json.loads((CONTEUDO / "sala.json").read_text(encoding="utf-8"))
    w, h = d["largura"], d["altura"]
    piso = lambda x, y: 0 <= x < w and 0 <= y < h and d["chao"][y * w + x] > 0
    mask = lambda x, y: d["paredes"][y * w + x] if piso(x, y) else 0
    faces, verts = set(), set()
    for y in range(h):
        for x in range(w):
            if not piso(x, y):
                continue
            m = mask(x, y)
            if m & 1 and not piso(x, y - 1):
                faces.add((x, y))                  # face norte sobre o tile (x, y-1), aresta no topo de (x, y)
            if m & 2:
                verts.add((x + 1, y))
            if m & 8:
                verts.add((x, y))
    portas = [o for o in d["objetos"] if o["tipo"] == "porta"]
    return d, piso, faces, verts, portas


def compor_sala(estados_portas=None):
    d, piso, faces, verts, portas = arestas_da_sala()
    W, H = 480, 352
    RECUO = 16
    OX, OY = 2 * T, 0 + RECUO
    tela = Image.new("RGBA", (W, H), hex_rgb(FUNDO) + (255,))
    ts = carregar("tiles_casa")
    gid = 358
    p = gid - 1
    piso_img = ts.crop(((p % 32) * 32, (p // 32) * 32, (p % 32) * 32 + 32, (p // 32) * 32 + 32))
    for y in range(d["altura"]):
        for x in range(d["largura"]):
            if d["chao"][y * d["largura"] + x]:
                tela.alpha_composite(piso_img, (OX + x * T, OY + y * T))
    pecas = {}
    lado_porta = {}
    for o in portas:
        lado_porta[(o["x"], o["y"], o["lado"])] = o["id"]
    estados = estados_portas or {}
    f_norte = [Image.open(PASTA / "spr_porta_norte.png").convert("RGBA").crop((i * 32, 0, i * 32 + 32, 38)) for i in range(3)]
    f_lado = [Image.open(PASTA / "spr_porta_lado.png").convert("RGBA").crop((i * 12, 0, i * 12 + 12, 32)) for i in range(3)]
    f_sul = [Image.open(PASTA / "spr_porta_sul.png").convert("RGBA").crop((i * 32, 0, i * 32 + 32, 12)) for i in range(3)]
    face = Image.open(PASTA / "spr_parede_face.png").convert("RGBA")
    lin = {k: Image.open(PASTA / f"spr_parede_{k}.png").convert("RGBA") for k in ("linha", "linha_sombra", "linha_topo", "linha_topo_sombra")}
    itens = []     # (base_y, ordem, imagem, x, y)
    porta_norte_em = {(o["x"], o["y"]) for o in portas if o["lado"] == "cima"}
    for (x, y) in sorted(faces):
        if (x, y) in porta_norte_em:
            im = f_norte[estados.get(lado_porta[(x, y, "cima")], 0)]
        else:
            im = face
        itens.append((OY + y * T + 4, 0, im, OX + x * T, OY + y * T - 32))
    for (vx, vy) in sorted(verts):
        # porta lateral sobre esta aresta?
        porta = lado_porta.get((vx, vy, "esquerda")) or lado_porta.get((vx - 1, vy, "direita"))
        if porta:
            im = f_lado[estados.get(porta, 0)]
            itens.append((OY + (vy + 1) * T, 0, im, OX + vx * T - 6, OY + vy * T))
            continue
        topo = ((vx - 1, vy) in faces or (vx, vy) in faces) and (vx, vy - 1) not in verts
        sombra = piso(vx, vy)
        k = ("linha_topo" if topo else "linha") + ("_sombra" if sombra else "")
        im = lin[k]
        itens.append((OY + (vy + 1) * T, 0, im, OX + vx * T - 4, OY + vy * T - (32 if topo else 0)))
    # portas sul
    for o in portas:
        if o["lado"] == "baixo":
            im = f_sul[estados.get(o["id"], 0)]
            itens.append((OY + (o["y"] + 1) * T, 0, im, OX + o["x"] * T, OY + (o["y"] + 1) * T - 12))
    # móveis
    for nome, tx, ty, w, h in (("sofa", 3, 3, 2, 2), ("mesa_de_jantar", 6, 5, 3, 2), ("rack_da_sala", 2, 1, 4, 1), ("comoda", 10, 5, 1, 3), ("cacto", 0, 3, 1, 1)):
        im = Image.open(PASTA / f"spr_{nome}.png").convert("RGBA")
        anc = json.loads((PASTA / "movel.json").read_text(encoding="utf-8"))[nome]["ancora"]
        itens.append((OY + (ty + h) * T, 1, im, OX + tx * T - anc["x"], OY + (ty + h) * T - anc["y"]))
    # personagens: sobrinho (32x48) ao sul do sofá e Nick (32x32) ao lado
    lolo = carregar("spr_lolo_idle")
    nick = carregar("spr_nick_idle_right")
    for im, tx, ty in ((lolo, 3, 5), (nick, 2, 4), (carregar("spr_bibi_idle"), 3, 2)):
        itens.append((OY + (ty + 1) * T + 0.01, 2, im, OX + tx * T, OY + (ty + 1) * T - im.height))
    for base, ordem, im, x, y in sorted(itens, key=lambda i: (i[0], i[1])):
        tela.alpha_composite(im, (int(x), int(y)))
    # barra de 48 px (opção A)
    g = ImageDraw.Draw(tela)
    g.rectangle([0, H - 48, W - 1, H - 1], fill=hex_rgb("#1b2452") + (255,), outline=hex_rgb("#9aa3c7") + (255,))
    f = fonte(15)
    g.text((16, H - 48 + 6), "Setas: andar   Z: examinar", fill=hex_rgb("#f4e9c8"), font=f)
    g.text((16, H - 48 + 26), "X: farejar   H: dica", fill=hex_rgb("#f4e9c8"), font=f)
    return tela


def compor_area(ident, gid, recuo, estados, personagens, moveis_im, moveis_meta):
    """Composição de uma área com o KIT REAL (17 peças de parede + vidro + 3 folhas de porta + móveis), 480x352, barra de 48 px.
    Mesma classificação de arestas do Dev (chaveDaPeca): face_norte_*, linha_h_*, linha_v_* (+ vidro de `VISTA_JSON`)."""
    d = json.loads((CONTEUDO / f"{ident}.json").read_text(encoding="utf-8"))
    w, h = d["largura"], d["altura"]
    OX, OY = ((15 - w) // 2) * T, ((11 - h) // 2) * T + recuo
    piso = lambda x, y: 0 <= x < w and 0 <= y < h and d["chao"][y * w + x] > 0
    bit = lambda x, y, b: piso(x, y) and d["paredes"][y * w + x] & b
    F, V, Hh = set(), set(), set()
    for y in range(h):
        for x in range(w):
            if not piso(x, y):
                continue
            if bit(x, y, 1):
                (Hh if piso(x, y - 1) else F).add((x, y))
            if bit(x, y, 4) and piso(x, y + 1):
                Hh.add((x, y + 1))
            if bit(x, y, 8):
                V.add((x, y))
            if bit(x, y, 2):
                V.add((x + 1, y))
    portas = [o for o in d["objetos"] if o["tipo"] == "porta"]
    lado_porta = {(o["x"], o["y"], o["lado"]): o["id"] for o in portas}
    kit = pecas_de_parede()
    kit.update(pecas_de_vidro())
    vidro = {(e["x"], e["y"]) for e in VISTA_JSON["vidro"].get(ident, [])}
    tela = Image.new("RGBA", (480, 352), hex_rgb(FUNDO) + (255,))
    ts = carregar("tiles_casa")
    pg = gid - 1
    piso_img = ts.crop(((pg % 32) * 32, (pg // 32) * 32, (pg % 32) * 32 + 32, (pg // 32) * 32 + 32))
    for y in range(h):
        for x in range(w):
            if d["chao"][y * w + x]:
                tela.alpha_composite(piso_img, (OX + x * T, OY + y * T))
    itens = []
    folhas = {}
    for lado, fn, fw, fh in (("norte", porta_norte, 32, 38), ("lado", porta_lado, 12, 32), ("sul", porta_sul, 32, 12)):
        folhas[lado] = [fn(i) for i in range(3)]
    port_n = {(o["x"], o["y"]) for o in portas if o["lado"] == "cima"}
    for (x, y) in sorted(F):
        a, dd = (x - 1, y) in F, (x + 1, y) in F
        im = kit["face_norte_" + ("meio" if a and dd else "direita" if a else "esquerda" if dd else "ilha")]
        if (x, y) in port_n:
            im = folhas["norte"][estados.get(lado_porta[(x, y, "cima")], 0)]
        itens.append((OY + y * T + 4, 0, im, OX + x * T, OY + y * T - 32))
    for (x, y) in sorted(Hh):
        if (x, y, "cima") in lado_porta or (x, y - 1, "baixo") in lado_porta:
            continue
        a, dd = (x - 1, y) in Hh, (x + 1, y) in Hh
        im = kit["linha_h_" + ("meio" if a and dd else "direita" if a else "esquerda" if dd else "ilha")]
        itens.append((OY + y * T + 4, 0, im, OX + x * T, OY + y * T - 4))
    for (vx, vy) in sorted(V):
        pid = lado_porta.get((vx, vy, "esquerda")) or lado_porta.get((vx - 1, vy, "direita"))
        if pid:
            itens.append((OY + (vy + 1) * T, 0, folhas["lado"][estados.get(pid, 0)], OX + vx * T - 6, OY + vy * T))
            continue
        antes, depois = (vx, vy - 1) in V, (vx, vy + 1) in V
        topo_face = (not antes) and ((vx - 1, vy) in F or (vx, vy) in F)
        pos = ("meio" if depois else "fim") if antes else ("topo_com_face" if topo_face else ("topo" if depois else "ilha"))
        nome = ("vidro_" if (vx, vy) in vidro else "linha_v_") + pos + ("_sombra" if piso(vx, vy) else "")
        im = kit[nome]
        itens.append((OY + (vy + 1) * T, 0, im, OX + vx * T - 4, OY + vy * T - (32 if topo_face else 0)))
    for o in portas:
        if o["lado"] == "baixo":
            itens.append((OY + (o["y"] + 1) * T, 0, folhas["sul"][estados.get(o["id"], 0)], OX + o["x"] * T, OY + (o["y"] + 1) * T - 12))
    for o in d["objetos"]:
        chave = "spr_" + o.get("id", "") if o["tipo"] == "movel" else ("spr_arvore_completa" if o["tipo"] == "arvore" else None)
        if chave and chave in moveis_im:
            m = moveis_meta[chave]
            hh = o.get("h", 1)
            itens.append((OY + (o["y"] + hh) * T, 1, moveis_im[chave], OX + o["x"] * T - m["ancora"]["x"], OY + (o["y"] + hh) * T - m["ancora"]["y"]))
        if o["tipo"] == "bilhete":
            itens.append((OY + o["y"] * T + 5, 0, bilhete_parede(), OX + o["x"] * T + 16 - 8, OY + o["y"] * T - 23))
        if o["tipo"] == "interruptor":
            itens.append((OY + o["y"] * T + 5, 0, interruptor_parede(False), OX + o["x"] * T + 16 - 8, OY + o["y"] * T - 23))
    for nome, tx, ty in personagens:
        im = carregar(nome)
        itens.append((OY + (ty + 1) * T + 0.01, 2, im, OX + tx * T, OY + (ty + 1) * T - im.height))
    for base, ordem, im, x, y in sorted(itens, key=lambda i: (i[0], i[1])):
        tela.alpha_composite(im, (int(x), int(y)))
    g = ImageDraw.Draw(tela)
    g.rectangle([0, 352 - 48, 479, 351], fill=hex_rgb("#1b2452") + (255,), outline=hex_rgb("#9aa3c7") + (255,))
    f = fonte(15)
    g.text((16, 352 - 48 + 6), "Setas: andar   Z: examinar", fill=hex_rgb("#f4e9c8"), font=f)
    g.text((16, 352 - 48 + 26), "X: farejar   H: dica", fill=hex_rgb("#f4e9c8"), font=f)
    return tela


def painel_arvores(im_movel):
    ts = carregar("tiles_casa"); pg = 357
    pm = ts.crop(((pg % 32) * 32, (pg // 32) * 32, (pg % 32) * 32 + 32, (pg // 32) * 32 + 32))
    nomes = ["spr_arvore_desmontada", "spr_arvore_1parte", "spr_arvore_2partes", "spr_arvore_completa", "spr_arvore_enfeitada", "dec_arvore_p", "dec_arvore_g"]
    Z = 3
    cena = Image.new("RGBA", (len(nomes) * 48, 80), (0, 0, 0, 0))
    for y in range(0, 80, 32):
        for x in range(0, len(nomes) * 48, 32):
            cena.alpha_composite(pm, (x, y))
    for i, n in enumerate(nomes):
        im = im_movel[n]
        cena.alpha_composite(im, (i * 48 + 5, 80 - im.height + 12 if im.height > 62 else 80 - im.height + 6))
    return cena.resize((cena.width * Z, cena.height * Z), Image.NEAREST)


def painel_portas():
    nomes = ["fechada", "com código", "aberta"]
    f_norte = Image.open(PASTA / "spr_porta_norte.png").convert("RGBA")
    f_lado = Image.open(PASTA / "spr_porta_lado.png").convert("RGBA")
    f_sul = Image.open(PASTA / "spr_porta_sul.png").convert("RGBA")
    face = Image.open(PASTA / "spr_parede_face.png").convert("RGBA")
    linha_s = Image.open(PASTA / "spr_parede_linha_sombra.png").convert("RGBA")
    ts = carregar("tiles_casa"); p = 357
    pm = ts.crop(((p % 32) * 32, (p // 32) * 32, (p % 32) * 32 + 32, (p // 32) * 32 + 32))
    Z = 3
    colw, linh = 96 * Z + 20, 170 * Z
    out = Image.new("RGBA", (3 * colw + 10, 60 + 3 * 0 + 60 * Z + 64 * Z + 48 * Z + 90), hex_rgb(FUNDO) + (255,))
    g = ImageDraw.Draw(out)
    fnt = fonte(14)
    for i, nm in enumerate(nomes):
        cx = 10 + i * colw
        g.text((cx, 6), nm.upper(), fill=(255, 255, 255, 255), font=fonte(16))
        # norte: face com a porta e duas faces vizinhas
        cena = Image.new("RGBA", (96, 60), hex_rgb(FUNDO) + (255,))
        for x in range(3):
            cena.alpha_composite(pm, (x * 32, 32))
        cena.alpha_composite(face, (0, 0)); cena.alpha_composite(face, (64, 0))
        cena.alpha_composite(f_norte.crop((i * 32, 0, i * 32 + 32, 38)), (32, 0))
        y0 = 40
        out.alpha_composite(cena.resize((96 * Z, 60 * Z), Image.NEAREST), (cx, y0))
        g.line([(cx, y0 + 16 * Z), (cx + 96 * Z, y0 + 16 * Z)], fill=(255, 90, 90, 255), width=1)
        g.text((cx + 2, y0 + 16 * Z + 2), "recorte da Sala: some o que está acima da linha vermelha", fill=(255, 130, 130, 255), font=fonte(10))
        g.text((cx, y0 + 60 * Z + 2), "norte (na face)", fill=(200, 200, 200, 255), font=fnt)
        # lateral: linha com sombra a leste e a peça da porta no lugar da linha
        y1 = y0 + 60 * Z + 24
        lat = Image.new("RGBA", (96, 64), hex_rgb(FUNDO) + (255,))
        for yy in range(2):
            for xx in range(1, 3):
                lat.alpha_composite(pm, (xx * 32, yy * 32))
        lat.alpha_composite(linha_s, (28, 0))
        lat.alpha_composite(f_lado.crop((i * 12, 0, i * 12 + 12, 32)), (26, 32))
        out.alpha_composite(lat.resize((96 * Z, 64 * Z), Image.NEAREST), (cx, y1))
        g.text((cx, y1 + 64 * Z + 2), "lateral (no lugar da linha de 8 px)", fill=(200, 200, 200, 255), font=fnt)
        # sul
        y2 = y1 + 64 * Z + 24
        sul = Image.new("RGBA", (96, 40), hex_rgb(FUNDO) + (255,))
        for xx in range(3):
            sul.alpha_composite(pm, (xx * 32, 0))
        sul.alpha_composite(f_sul.crop((i * 32, 0, i * 32 + 32, 12)), (32, 26))
        out.alpha_composite(sul.resize((96 * Z, 40 * Z), Image.NEAREST), (cx, y2))
        g.text((cx, y2 + 40 * Z + 2), "sul (faixa sobre a aresta)", fill=(200, 200, 200, 255), font=fnt)
    return out


def painel_oclusao():
    ts = carregar("tiles_casa"); p = 357
    pm = ts.crop(((p % 32) * 32, (p // 32) * 32, (p % 32) * 32 + 32, (p // 32) * 32 + 32))
    cena = Image.new("RGBA", (320, 192), hex_rgb(FUNDO) + (255,))
    for y in range(6):
        for x in range(10):
            cena.alpha_composite(pm, (x * 32, y * 32))
    anc = json.loads((PASTA / "movel.json").read_text(encoding="utf-8"))
    cact = Image.open(PASTA / "spr_cacto.png").convert("RGBA")
    sofa = Image.open(PASTA / "spr_sofa.png").convert("RGBA")
    lolo = carregar("spr_lolo_idle"); nick = carregar("spr_nick_idle_down")
    itens = []
    def mov(im, nome, tx, ty, w, h):
        a = anc["spr_" + nome]["ancora"]
        itens.append(((ty + h) * 32, 1, im, tx * 32 - a["x"], (ty + h) * 32 - a["y"]))
    mov(cact, "cacto", 1, 2, 1, 1); mov(cact, "cacto", 1, 5, 1, 1); mov(sofa, "sofa", 5, 2, 2, 2)
    def pers(im, tx, ty):
        itens.append(((ty + 1) * 32 + 0.01, 2, im, tx * 32, (ty + 1) * 32 - im.height))
    pers(lolo, 1, 1); pers(nick, 2, 2); pers(lolo, 1, 4); pers(nick, 0, 5); pers(lolo, 5, 1); pers(nick, 7, 3); pers(lolo, 4, 3); pers(nick, 4, 1)
    for base, o, im, x, y in sorted(itens, key=lambda i: (i[0], i[1])):
        cena.alpha_composite(im, (int(x), int(y)))
    big = cena.resize((640, 384), Image.NEAREST)
    # cacto isolado em 1x e 0,5x
    cx = Image.new("RGBA", (640, 150), hex_rgb(FUNDO) + (255,))
    cx.alpha_composite(pm.resize((32, 32)), (0, 0)) if False else None
    base = Image.new("RGBA", (96, 64), hex_rgb(FUNDO) + (255,))
    for x in range(3):
        for y in range(2):
            base.alpha_composite(pm, (x * 32, y * 32)) if False else None
    full = Image.new("RGBA", (640, 384 + 290), hex_rgb(FUNDO) + (255,))
    full.alpha_composite(big, (0, 0))
    g = ImageDraw.Draw(full)
    fnt = fonte(13)
    g.text((8, 388), "Cacto em 1x, 0,5x e 4x. Em cima: personagens ao norte, ao sul e ao lado do cacto e do sofá.", fill=(255, 255, 255, 255), font=fnt)
    tile = lambda: pm
    def fundo_piso(w, h):
        im = Image.new("RGBA", (w, h))
        for yy in range(0, h, 32):
            for xx in range(0, w, 32):
                im.alpha_composite(pm, (xx, yy))
        return im
    b1 = fundo_piso(64, 64); b1.alpha_composite(cact, (13, 64 - 54 - 0 + 7 - 7 + 0)); full.alpha_composite(b1, (8, 420))
    b2 = fundo_piso(64, 64); b2.alpha_composite(cact, (13, 7)); b2 = b2.resize((32, 32), Image.NEAREST); full.alpha_composite(b2, (100, 436))
    b3 = fundo_piso(64, 64); b3.alpha_composite(cact, (13, 7)); b3 = b3.resize((256, 256), Image.NEAREST); full.alpha_composite(b3, (180, 408))
    return full


def main():
    PASTA.mkdir(parents=True, exist_ok=True)
    PREVIEW.mkdir(parents=True, exist_ok=True)
    (RAIZ / "tools-arte" / "paleta-casa-3-4.json").write_text(
        json.dumps({"_nota": "paleta-mestre da casa, visão 3/4 (ADR-012, E1); <= 64 cores; cada PNG usa <= 16 dela; sombra = preto 25%",
                    "cores": PALETA, "sombra": {"rgb": "#000000", "alfa": ALFA_SOMBRA}}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    movel = {}
    relatorio = {}
    imagens_movel = {}
    MOVEIS = {
        # Sala (lote 1)
        "spr_cacto": (1, 1, 48, cacto), "spr_sofa": (2, 2, 64, sofa), "spr_mesa_de_jantar": (3, 2, 64, mesa),
        "spr_rack_da_sala": (4, 1, 48, rack), "spr_comoda": (1, 3, 104, comoda),
        # Cozinha e Lavanderia (lote 2); geladeira, forno, armário, tanque e lava-roupas vistos pelas costas
        "spr_geladeira": (1, 1, 56, geladeira_costas), "spr_forno": (1, 1, 44, forno_costas), "spr_fogao": (1, 1, 44, fogao),
        "spr_armario_da_cozinha": (1, 1, 44, armario_cozinha_costas), "spr_pia": (1, 3, 104, pia_cozinha),
        "spr_armario_da_lavanderia": (1, 2, 80, armario_lavanderia), "spr_lava_roupas": (1, 1, 48, lava_roupas_costas),
        "spr_tanque": (1, 1, 44, tanque_costas),
        # lote 3
        "spr_cama_da_oli": (1, 2, 64, cama_oli), "spr_comoda_da_oli": (1, 1, 40, comoda_oli),
        "spr_cadeira_de_amamentacao": (1, 1, 48, cadeira_amamentacao), "spr_cama_do_casal": (2, 3, 96, cama_casal),
        "spr_armario_do_casal": (4, 1, 56, armario_casal_costas), "spr_mesa_do_escritorio": (3, 1, 40, mesa_escritorio),
        "spr_cama_do_escritorio": (2, 2, 64, cama_escritorio),
        # lote 4: banheiros e Quartinho
        "spr_box_do_banheiro_1": (3, 1, 64, box_frente), "spr_privada_do_banheiro_1": (1, 1, 48, privada_frente),
        "spr_pia_do_banheiro_1": (3, 1, 44, pia_banheiro_costas(3)),
        "spr_pia_do_banheiro_do_escritorio": (1, 1, 44, pia_banheiro_frente),
        "spr_privada_do_banheiro_do_escritorio": (1, 1, 48, privada_costas), "spr_box_do_banheiro_do_escritorio": (1, 1, 48, box_costas),
        "spr_prateleira": (3, 1, 56, prateleira_costas), "spr_prateleira_pequena": (1, 1, 64, prateleira_frente),
        # árvore de Natal (5 estados, 1x1, H = 56, E = 24) e mini-árvores dos enfeites
        "spr_arvore_desmontada": (1, 1, 56, arvore_estado("desmontada")), "spr_arvore_1parte": (1, 1, 56, arvore_estado("1parte")),
        "spr_arvore_2partes": (1, 1, 56, arvore_estado("2partes")), "spr_arvore_completa": (1, 1, 56, arvore_estado("completa")),
        "spr_arvore_enfeitada": (1, 1, 56, arvore_estado("enfeitada")),
        "dec_arvore_p": (1, 1, 40, mini_arvore(40, 1)), "dec_arvore_g": (1, 1, 56, mini_arvore(56, 2)),
    }
    for nome, (w, h, H, fn) in MOVEIS.items():
        im, meta = sprite_movel(w, h, H, fn)
        assert im.size == (w * T + SOMBRA, max(h * T, H) + SOMBRA), (nome, im.size)
        assert meta["E"] <= 32
        relatorio[nome] = salvar_indexado(im, PASTA / f"{nome}.png")
        movel[nome] = meta
        imagens_movel[nome] = im
    (PASTA / "movel.json").write_text(json.dumps(movel, indent=2) + "\n", encoding="utf-8")
    relatorio["parede_face"] = salvar_indexado(face_meio(), PASTA / "spr_parede_face.png")
    relatorio["parede_linha"] = salvar_indexado(linha_v(32, False), PASTA / "spr_parede_linha.png")
    relatorio["parede_linha_sombra"] = salvar_indexado(linha_v(32, True), PASTA / "spr_parede_linha_sombra.png")
    relatorio["parede_linha_topo"] = salvar_indexado(linha_v(64, False), PASTA / "spr_parede_linha_topo.png")
    relatorio["parede_linha_topo_sombra"] = salvar_indexado(linha_v(64, True), PASTA / "spr_parede_linha_topo_sombra.png")
    for nome, fn, largura, altura in (("norte", porta_norte, 32, 38), ("lado", porta_lado, 12, 32), ("sul", porta_sul, 32, 12)):
        folha = Image.new("RGBA", (largura * 3, altura), (0, 0, 0, 0))
        for i in range(3):
            folha.alpha_composite(fn(i), (i * largura, 0))
        relatorio[f"porta_{nome}"] = salvar_indexado(folha, PASTA / f"spr_porta_{nome}.png", 32)   # folha de 3 estados: <= 32 (ADR-012 seção 8)
    estados = {"quarto-sala": 0, "quarto_casal-sala": 0, "escritorio-sala": 1, "cozinha-sala": 2, "hall-sala": 0}
    sala = compor_area("sala", 358, 16, estados, [("spr_lolo_idle", 3, 5), ("spr_nick_idle_right", 2, 4), ("spr_bibi_idle", 3, 2)], imagens_movel, movel)
    sala.convert("RGB").save(PREVIEW / "prototipo-3-4-sala.png")
    sala.resize((960, 704), Image.NEAREST).convert("RGB").save(PREVIEW / "prototipo-3-4-sala@2x.png")
    cozinha = compor_area("cozinha", 38, 0, {"cozinha-sala": 2, "cozinha-quartinho": 0},
                          [("spr_lolo_idle", 3, 1), ("spr_nick_idle_right", 1, 1)], imagens_movel, movel)
    cozinha.convert("RGB").save(PREVIEW / "prototipo-3-4-cozinha.png")
    cozinha.resize((960, 704), Image.NEAREST).convert("RGB").save(PREVIEW / "prototipo-3-4-cozinha@2x.png")
    for ident, gid, pers in (("hall", 34, [("spr_lolo_idle", 1, 1)]), ("banheiro1", 38, [("spr_lolo_idle", 1, 1)]),
                             ("banheiro_escritorio", 34, []), ("quartinho", 4, [("spr_nick_idle_right", 1, 0)]),
                             ("quarto", 34, [("spr_lolo_idle", 2, 2)]), ("escritorio", 258, [("spr_lolo_idle", 4, 3)]),
                             ("quarto_casal", 258, [("spr_nick_idle_right", 3, 3)])):
        im = compor_area(ident, gid, 0, {}, pers, imagens_movel, movel)
        im.convert("RGB").save(PREVIEW / f"prototipo-3-4-{ident}.png")
        im.resize((960, 704), Image.NEAREST).convert("RGB").save(PREVIEW / f"prototipo-3-4-{ident}@2x.png")
    painel_arvores(imagens_movel).convert("RGB").save(PREVIEW / "prototipo-3-4-arvores.png")
    painel_portas().convert("RGB").save(PREVIEW / "prototipo-3-4-portas.png")
    painel_oclusao().convert("RGB").save(PREVIEW / "prototipo-3-4-oclusao.png")
    if "--assets" in sys.argv:
        print("kit gravado em assets:", len(gerar_assets(imagens_movel, movel)), "arquivos")
    print("cores por PNG:", relatorio)
    print("paleta-mestre:", len(PALETA), "cores")


if __name__ == "__main__":
    main()
