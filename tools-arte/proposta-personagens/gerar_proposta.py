#!/usr/bin/env python3
"""Acabamento dos personagens na visão 3/4 (Arte, 2026-11-19; aprovado pelo Diretor: "Pode retocar o rosto também").

Gera os 4 sobrinhos (LoLô, BiBi, DanDan, TuTu) e o Nick a partir dos PNG da 1.3.0 guardados em
tools-arte/proposta-personagens/originais-1.3.0/ (o "antes"; nunca a partir de assets/, para rodar de novo dá o mesmo resultado)
e dos cartões "Parado" das folhas do Diretor (assets/referencia/ref_<nome>_folha.webp) para os 3 parados que faltavam.

Saída (tools-arte/proposta-personagens/):
  <nome>/spr_*.png                      sprites novos, PNG indexado 8 bits, mesmos nomes e quadros do jogo
                                        (+ spr_<nome>_idle_<dir>.png, só referência: não vão para o jogo)
  antes-depois-<nome>-1x2x4x.png        antes e depois, parado nas 4 direções e cada quadro da caminhada, em 1x, 2x e 4x
  antes-depois-<nome>-caminhada.gif     a caminhada animada em 4x (antes em cima, depois embaixo, cada um no seu ritmo)
  antes-depois-rostos.png               os rostos dos 4 sobrinhos (e o Nick), antes e depois, em 8x
  sala-4-sobrinhos-antes-depois.png     a Sala 3/4 (kit real) com os 4 sobrinhos lado a lado e o Nick, antes e depois (2x)
  sala-4-sobrinhos-meia-escala.png      a mesma em 0,5x (teste: cada um distinguível dos outros)
  relatorio.json                        cores e bytes por PNG
Com --aplicar: grava os PNG (sem os idle_<dir> de referência) em assets/hd-480x352/.

Regras (style-guide, "Visão 3/4" e "Personagens"):
  - quadro e âncora iguais aos de hoje (sobrinho 32x48, Nick 32x32, origem no canto de cima, pés na base);
  - contorno de 1 px na silhueta, no marrom `contorno` da paleta-mestre da casa (nunca preto); olhos em `vao` (#1a1210);
  - luz de cima à esquerda: 1 tom acima na borda de cima/esquerda e 1 abaixo na de baixo/direita, nas rampas do material;
  - sombra de contato preta a 25% sob os pés, mais longa para a direita, embutida no PNG;
  - <= 16 cores por PNG (15 opacas + a sombra), paleta curada por personagem (tabela abaixo);
  - caminhada de 4 quadros: parado, passo A, parado, passo B (os 2 passos são os de hoje);
  - rosto: brilho do olho com 1 px a mais (do lado da luz), sobrancelha de 2 a 3 px quando cabe, bochecha rosada e boca marcada;
    Nick: brilho nos olhos e no focinho, orelha e língua em rosa;
  - buracos de 1 a 8 px dentro do cabelo (sobra da redução da folha) são fechados com o tom vizinho.
Método reprodutível, sem aleatoriedade, sem retoque à mão.

Uso: /usr/bin/python3 tools-arte/proposta-personagens/gerar_proposta.py [--aplicar]
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
sys.path.insert(0, str(RAIZ / "tools-arte"))
import gerar_sobrinhos as gs  # noqa: E402  (extração da folha do Diretor, mesmo método do jogo)

ASSETS = RAIZ / "assets" / "hd-480x352"
ORIGINAIS = AQUI / "originais-1.3.0"
PALETA_CASA = json.loads((RAIZ / "tools-arte" / "paleta-casa-3-4.json").read_text(encoding="utf-8"))["cores"]
ALFA_SOMBRA = 64
W, H = 32, 48
SOBRINHOS = ["lolo", "bibi", "dandan", "tutu"]
DIRS = ["down", "up", "left", "right"]


def hx(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.int16)


def lum(c):
    c = np.asarray(c, dtype=float)
    return 0.299 * c[..., 0] + 0.587 * c[..., 1] + 0.114 * c[..., 2]


def C(nome):
    return PALETA_CASA[nome]


# ------------------------------------------------------------------ paletas curadas
# alvos: as cores finais (as de hoje, ou a da casa quando já está a um passo: marcadas "casa").
# mapa: cor da extração ou do PNG de hoje -> alvo. Cor que não está no mapa vai para o alvo mais próximo (RGB) entre os
# alvos de "corpo" (sem contorno, olho, brilho e bochecha, que só vêm do mapa ou do retoque).
# rampas: tons do mesmo material, do escuro ao claro (luz de cima à esquerda). rosto: nomes usados no retoque.
PALETAS = {
    "lolo": {
        "alvos": {
            "contorno": C("contorno"), "olho": C("vao"),
            "cabelo_1": C("barro_contorno"), "cabelo_2": C("barro_escuro"), "cabelo_3": "#9b5c3c",
            "pele": "#facda1", "pele_sombra": "#e29c6e", "boca": "#b8503c", "bochecha": "#ec9488",
            "branco": C("prato"), "camiseta": "#97283b", "saia": "#f6ca46",
            "azul_1": "#2d4483", "azul_2": "#3e68b1", "azul_3": "#94d0f3",
        },
        "mapa": {
            # extração (parados novos)
            "#0b0203": "olho", "#100711": "olho", "#280702": "olho",
            "#522211": "cabelo_1", "#6a321e": "cabelo_2", "#804227": "cabelo_2", "#9b5c3c": "cabelo_3",
            "#1a2d59": "azul_1", "#2d4483": "azul_1", "#3a5eaa": "azul_2", "#4d8dcb": "azul_2", "#75baea": "azul_3", "#abe1fa": "azul_3",
            "#97283b": "camiseta", "#614457": "camiseta", "#a97b76": "boca", "#c37851": "boca",
            "#e29c6e": "pele_sombra", "#d2a19d": "bochecha", "#f9bf8c": "pele", "#facda1": "pele",
            "#f1be38": "saia", "#fad65a": "saia", "#f7e1e0": "branco",
            # PNG de hoje
            "#090205": "olho", "#160609": "olho", "#320801": "olho",
            "#4e1f0e": "cabelo_1", "#5e2c1a": "cabelo_1", "#713620": "cabelo_2", "#824428": "cabelo_2", "#965939": "cabelo_3",
            "#b4704e": "boca", "#805f7c": "boca", "#1b2e5c": "azul_1", "#304a8d": "azul_1", "#3f74ba": "azul_2",
            "#65abe0": "azul_3", "#a0daf8": "azul_3", "#5d3f4a": "camiseta",
            "#c68f96": "bochecha", "#d18e62": "pele_sombra", "#eba979": "pele_sombra",
            "#f9c48f": "pele", "#f9cea6": "pele", "#f6ca46": "saia", "#f6e2e3": "branco",
        },
        "rampas": [["cabelo_1", "cabelo_2", "cabelo_3"], ["azul_1", "azul_2", "azul_3"]],
        "rosto": {"pele": ["pele", "pele_sombra"], "brilho": "branco", "sobrancelha": "cabelo_1", "boca": "boca",
                  "bochecha": "bochecha", "cabelo": ["cabelo_1", "cabelo_2", "cabelo_3"], "boca_hoje": []},
    },
    "bibi": {
        "alvos": {
            "contorno": C("contorno"), "olho": C("vao"),
            "cabelo_1": C("barro_contorno"), "cabelo_2": "#8b3a20", "cabelo_3": C("barro"),
            "pele": "#fbc47e", "pele_sombra": "#eca067", "pele_2": "#d27a4e", "bochecha": "#f08a78",
            "branco": "#fbf5e3", "branco_sombra": "#efdbca", "cinza": "#c4ada6", "cinza_esc": "#7c6460",
            "short_1": "#e15454", "short_2": "#f5746f",
        },
        "mapa": {
            "#120103": "olho", "#430a02": "olho", "#541b0e": "cabelo_1", "#6d2411": "cabelo_1", "#5e3024": "cabelo_1",
            "#80341d": "cabelo_2", "#953f23": "cabelo_2", "#6e4e43": "cinza_esc", "#ad4d2a": "cabelo_3", "#a05c40": "cabelo_3",
            "#c36439": "cabelo_3", "#897774": "cinza_esc", "#e15454": "short_1", "#c17c59": "pele_2", "#dd804c": "pele_2",
            "#f5746f": "short_2", "#ba928e": "cinza", "#eca067": "pele_sombra", "#cebab4": "cinza", "#fbbf75": "pele",
            "#fccc8d": "pele", "#efdbca": "branco_sombra", "#fbf5e3": "branco",
        },
        "rampas": [["cabelo_1", "cabelo_2", "cabelo_3"], ["short_1", "short_2"], ["cinza", "branco_sombra", "branco"]],
        "rosto": {"pele": ["pele", "pele_sombra"], "brilho": "branco", "sobrancelha": "cabelo_1", "boca": "short_1",
                  "bochecha": "bochecha", "cabelo": ["cabelo_1", "cabelo_2", "cabelo_3"], "boca_hoje": ["pele_2"]},
    },
    "dandan": {
        "alvos": {
            "contorno": C("contorno"), "olho": C("vao"),
            "camisa_1": "#e4471b", "camisa_2": "#bf3f1a", "camisa_3": "#833610",
            "pele": "#fac681", "claro": "#f9d192", "cabelo_2": "#eaa75f", "cabelo_3": "#c47d40", "cabelo_4": "#935223",
            "bochecha": "#f2967a", "bege": "#c8a177", "bege_esc": "#815d3e", "cinza": "#7c6e6f", "branco": "#f8ead3",
        },
        "mapa": {
            "#080103": "olho", "#140202": "olho", "#491403": "olho", "#662205": "camisa_3", "#5c3d24": "bege_esc",
            "#833610": "camisa_3", "#935223": "cabelo_4", "#bf3f1a": "camisa_2", "#815d3e": "bege_esc", "#e4471b": "camisa_1",
            "#7c6e6f": "cinza", "#ab6832": "cabelo_4", "#a9835f": "bege_esc", "#c47d40": "cabelo_3", "#d99451": "cabelo_3",
            "#c8a177": "bege", "#eaa75f": "cabelo_2", "#c9b6a2": "bege", "#f3b671": "cabelo_2", "#fac681": "pele",
            "#f9d192": "claro", "#fbdfa8": "claro", "#f8ead3": "branco",
        },
        "rampas": [["camisa_3", "camisa_2", "camisa_1"], ["cabelo_4", "cabelo_3", "cabelo_2", "claro"], ["bege_esc", "bege"]],
        "rosto": {"pele": ["pele", "claro"], "brilho": "branco", "sobrancelha": "cabelo_3", "boca": "camisa_2",
                  "bochecha": "bochecha", "cabelo": ["cabelo_4", "cabelo_3", "cabelo_2", "claro"], "boca_hoje": ["cabelo_2"]},
    },
    "tutu": {
        "alvos": {
            "contorno": C("contorno"), "olho": C("vao"),
            "navy_1": "#262a4a", "navy_2": "#3a4170",
            "cabelo_1": "#551f08", "cabelo_2": "#773a1b", "cabelo_3": "#b06435", "cabelo_4": "#ce804b",
            "pele": "#f9c48a", "pele_sombra": "#eb9e66", "bochecha": "#f2937c",
            "cinza_1": "#84817f", "cinza_2": "#d1c6b6", "branco": "#f3eada", "amarelo": C("vela_dourado"),
        },
        "mapa": {
            "#080104": "olho", "#150202": "olho", "#262a4a": "navy_1", "#551f08": "cabelo_1", "#2f345a": "navy_2",
            "#593929": "cabelo_1", "#773a1b": "cabelo_2", "#924f2a": "cabelo_2", "#665f59": "cinza_1", "#b06435": "cabelo_3",
            "#a27452": "cabelo_3", "#84817f": "cinza_1", "#c5743e": "cabelo_4", "#ce804b": "cabelo_4", "#e0905a": "pele_sombra",
            "#aea497": "cinza_2", "#c7aa72": "cinza_2", "#f0a46b": "pele_sombra", "#fab97b": "pele", "#d1c6b6": "cinza_2",
            "#f3d22d": "amarelo", "#f9c48a": "pele", "#fad3a1": "pele", "#f3eada": "branco",
        },
        "rampas": [["cabelo_1", "cabelo_2", "cabelo_3", "cabelo_4"], ["navy_1", "navy_2"], ["cinza_1", "cinza_2", "branco"]],
        "rosto": {"pele": ["pele", "pele_sombra"], "brilho": "branco", "sobrancelha": "cabelo_2", "boca": "cabelo_2",
                  "bochecha": "bochecha", "cabelo": ["cabelo_1", "cabelo_2", "cabelo_3", "cabelo_4"], "boca_hoje": ["cabelo_3"]},
    },
    "nick": {
        "alvos": {
            "contorno": C("contorno"), "olho": C("vao"),
            "pelo_0": "#6a2c0c", "pelo_1": "#ab5016", "pelo_2": "#d97a2c", "pelo_3": "#fba23a", "pelo_4": "#fcb354",
            "pelo_5": "#fabe6c", "creme_1": "#fdda9c", "creme_2": "#fbe3b5",
            "rosa": C("rosa"), "azul": "#9eceeb", "faisca": C("vela_dourado"), "brilho": C("prato"),
        },
        "mapa": {
            "#150203": "olho", "#1a0713": "olho", "#2f0901": "olho",
            "#582307": "pelo_0", "#61402b": "pelo_0", "#8b390b": "pelo_0",
            "#885530": "pelo_1", "#ab5016": "pelo_1", "#847261": "pelo_1", "#ae6835": "pelo_1",
            "#d07026": "pelo_2", "#b57e51": "pelo_2", "#d78b4b": "pelo_2", "#ea8930": "pelo_2",
            "#ef9c4a": "pelo_3", "#fba23a": "pelo_3", "#e6a667": "pelo_3", "#fca844": "pelo_4", "#fab157": "pelo_4",
            "#fabe6c": "pelo_5", "#bc9a76": "pelo_5", "#fcce85": "creme_1", "#fdda9c": "creme_1", "#dcbc96": "creme_1",
            "#fbe3b5": "creme_2", "#e6654e": "rosa", "#9eceeb": "azul", "#f6e320": "faisca",
        },
        "rampas": [["pelo_0", "pelo_1", "pelo_2", "pelo_3", "pelo_4", "pelo_5", "creme_1", "creme_2"]],
        "rosto": {"pele": ["pelo_2", "pelo_3", "pelo_4", "pelo_5", "creme_1", "creme_2"], "brilho": "brilho",
                  "cabelo": []},
    },
}
ESPECIAIS = {"contorno", "olho", "brilho", "bochecha"}


# ------------------------------------------------------------------ entradas
def originais(nome):
    pref = f"spr_{nome}_"
    return {f.stem.replace(pref, ""): np.asarray(Image.open(f).convert("RGBA")).copy() for f in sorted(ORIGINAIS.glob(pref + "*.png"))}


PARADO_CX = [1023, 1162, 1300, 1440]          # cartões "Parado / Idle": frente, costas, esquerda, direita (medidos)


def parados_da_folha(nome, k_cores=24):
    """Os 3 parados que faltam (cima, esquerda, direita), pelo método de gerar_sobrinhos.processar: mesma escala (medida no
    parado de frente), voto da maioria e k-means com semente fixa; ancorados pela base e pelo centro da caixa."""
    arr = gs.carregar(nome)
    rf = gs.REGIAO_FUNDO
    fundo = np.median(arr[rf[2]:rf[3], rf[0]:rf[1]].reshape(-1, 3), axis=0)
    figura = gs.remover_linhas(np.abs(arr - fundo).sum(-1) > gs.LIMIAR_FIGURA)
    m = gs.MEIA_JANELA_ANDAR
    bx = gs.caixa(figura, gs.PARADO_CX - m, gs.PARADO_CX + m, *gs.PARADO_Y)
    ex, ey = (bx[2] - bx[0]) / W, (bx[3] - bx[1]) / H
    cel = {}
    for d, cx in zip(DIRS, PARADO_CX):
        b = gs.caixa(figura, cx - 60, cx + 60, *gs.PARADO_Y)
        cel[d] = ((b[0] + b[2]) / 2, b[3])
    x0, x1, y0, y1 = 430, 1500, 40, 560
    dentro = np.zeros(figura.shape, dtype=bool)
    for ya, yb in gs.LINHAS_ANDAR.values():
        for cxc in gs.COLUNAS_ANDAR:
            dentro[ya:yb, cxc - m:cxc + m] = True
    for cx in PARADO_CX:
        dentro[gs.PARADO_Y[0]:gs.PARADO_Y[1], cx - 62:cx + 62] = True
    for c in (gs.INTERAGIR, gs.COMEMORAR):
        dentro[c["y"][0]:c["y"][1], c["x"][0]:c["x"][1]] = True
    figura &= dentro
    regiao, rfig = arr[y0:y1, x0:x1], figura[y0:y1, x0:x1]
    centros = gs.kmeans(regiao[rfig].astype(float), k_cores)
    indice = np.full(rfig.shape, -1, dtype=np.int64)
    pts = regiao[rfig].astype(float)
    indice[rfig] = ((pts[:, None, :] - centros[None].astype(float)) ** 2).sum(-1).argmin(1)

    def quadro(cx, fy):
        sai = np.zeros((H, W, 4), dtype=np.uint8)
        ox, oy = cx - W * ex / 2 - x0, fy - H * ey - y0
        for j in range(H):
            ya, yb = int(round(oy + j * ey)), int(round(oy + (j + 1) * ey))
            for i in range(W):
                xa, xb = int(round(ox + i * ex)), int(round(ox + (i + 1) * ex))
                bf = rfig[ya:yb, xa:xb]
                if bf.size == 0 or bf.mean() < 0.5:
                    continue
                sai[j, i] = (*centros[np.bincount(indice[ya:yb, xa:xb][bf], minlength=k_cores).argmax()], 255)
        return gs.limpar_soltos(gs.remover_isolados(sai))

    return {d: quadro(*cel[d]) for d in ("up", "left", "right")}


def folhas_do_sobrinho(nome):
    hoje = originais(nome)
    novos = parados_da_folha(nome)
    parado = {"down": hoje["idle"], **novos}
    folhas = {"idle": hoje["idle"], "interact": hoje["interact"], "celebrate": hoje["celebrate"]}
    for d in DIRS:
        folhas[f"idle_{d}"] = parado[d]
        passos = quadros_de(hoje[f"walk_{d}"], W)
        folhas[f"walk_{d}"] = np.concatenate([parado[d], passos[0], parado[d], passos[1]], axis=1)   # parado, passo, parado, passo
    return folhas


def folhas_do_nick():
    """O Nick de hoje, subido 1 px no quadro (folga de 5 px em cima) para a sombra aparecer sob as patas."""
    folhas = {}
    for k, a in originais("nick").items():
        assert not a[0, :, 3].any()
        b = np.zeros_like(a)
        b[:-1] = a[1:]
        folhas[k] = b
    return folhas


# ------------------------------------------------------------------ acabamento
def quadros_de(folha, fw):
    return [folha[:, i:i + fw] for i in range(0, folha.shape[1], fw)]


def componentes(mascara, conexao=4):
    hgt, wid = mascara.shape
    visto = np.zeros_like(mascara, dtype=bool)
    viz = ((0, 1), (1, 0), (0, -1), (-1, 0)) + (((1, 1), (1, -1), (-1, 1), (-1, -1)) if conexao == 8 else ())
    saida = []
    for y in range(hgt):
        for x in range(wid):
            if not mascara[y, x] or visto[y, x]:
                continue
            pilha, pts = [(y, x)], []
            visto[y, x] = True
            while pilha:
                cy, cx = pilha.pop()
                pts.append((cy, cx))
                for dy, dx in viz:
                    ny, nx = cy + dy, cx + dx
                    if 0 <= ny < hgt and 0 <= nx < wid and mascara[ny, nx] and not visto[ny, nx]:
                        visto[ny, nx] = True
                        pilha.append((ny, nx))
            saida.append(pts)
    return saida


def mapear(q, cfg, faltas):
    alvo = {k: hx(v) for k, v in cfg["alvos"].items()}
    corpo = [k for k in alvo if k not in ESPECIAIS]
    nomes = np.full(q.shape[:2], "", dtype=object)
    for y in range(q.shape[0]):
        for x in range(q.shape[1]):
            if q[y, x, 3] == 0:
                continue
            h = "#%02x%02x%02x" % tuple(int(v) for v in q[y, x, :3])
            if h in cfg["mapa"]:
                nomes[y, x] = cfg["mapa"][h]
            else:
                c = q[y, x, :3].astype(int)
                if lum(c) < 30:                      # traço quase preto da folha: olho ou linha interna
                    nomes[y, x] = "olho"
                    faltas.add(h)
                    continue
                nomes[y, x] = min(corpo, key=lambda k: int(((alvo[k].astype(int) - c) ** 2).sum()))
                faltas.add(h)
    return nomes


def fechar_buracos(nomes, cabelo):
    """Buraco (transparente fechado, sem tocar a borda do quadro) de 1 a 8 px cercado só de cabelo vira o tom vizinho."""
    if not cabelo:
        return nomes
    vazio = nomes == ""
    hgt, wid = nomes.shape
    for pts in componentes(vazio):
        if len(pts) > 8 or any(y in (0, hgt - 1) or x in (0, wid - 1) for y, x in pts):
            continue
        viz = [nomes[y + dy, x + dx] for y, x in pts for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0))
               if nomes[y + dy, x + dx] != ""]
        if viz and all(v in cabelo for v in viz):
            tom = max(set(viz), key=viz.count)
            for y, x in pts:
                nomes[y, x] = tom
    return nomes


def contorno_e_luz(nomes, cfg):
    a = nomes != ""
    pad = np.pad(a, 1)
    borda = a & ~(pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:])
    passo = {}
    for r in cfg["rampas"]:
        for i, t in enumerate(r):
            passo[t] = (r[i - 1] if i > 0 else t, r[i + 1] if i + 1 < len(r) else t)
    out = nomes.copy()
    hgt, wid = a.shape
    for y in range(hgt):
        for x in range(wid):
            if not a[y, x]:
                continue
            if borda[y, x]:
                out[y, x] = "contorno"
                continue
            t = nomes[y, x]
            if t in passo:
                cima, esq, baixo, dir_ = borda[y - 1, x], borda[y, x - 1], borda[y + 1, x], borda[y, x + 1]
                if (cima or esq) and not (baixo or dir_):
                    out[y, x] = passo[t][1]
                elif (baixo or dir_) and not (cima or esq):
                    out[y, x] = passo[t][0]
    return out, borda


def achar_olhos(n, r, sobrinho):
    """Olhos = pixels `olho` DENTRO do rosto: o rosto é o maior pedaço de pele (4 vizinhos) na parte de cima do quadro; o olho
    tem pele à esquerda e à direita na mesma linha e fica na metade de cima do rosto. Devolve (olhos, rosto)."""
    hgt, wid = n.shape
    pele = set(r["pele"]) | {r["brilho"]}
    limite = int(hgt * (0.62 if sobrinho else 0.9))
    m = np.zeros(n.shape, dtype=bool)
    for y in range(limite):
        for x in range(wid):
            m[y, x] = n[y, x] in pele
    comps = componentes(m)
    if not comps:
        return [], None
    rosto = max(comps, key=len)
    if len(rosto) < 20:
        return [], None
    ry = [p[0] for p in rosto]
    y_ini, y_fim = min(ry), max(ry)
    lin = {}
    for y, x in rosto:
        lo, hi = lin.get(y, (x, x))
        lin[y] = (min(lo, x), max(hi, x))
    cand = np.zeros(n.shape, dtype=bool)
    for y in range(y_ini, y_ini + int((y_fim - y_ini) * 0.7) + 1):
        if y not in lin:
            continue
        lo, hi = lin[y]
        for x in range(lo + 1, hi):
            cand[y, x] = n[y, x] == "olho"
    olhos = []
    for pts in componentes(cand):
        if 2 <= len(pts) <= 12:
            ys = [p[0] for p in pts]
            xs = [p[1] for p in pts]
            olhos.append((pts, min(ys), max(ys), min(xs), max(xs)))
    olhos = sorted(olhos, key=lambda o: -len(o[0]))[:2]
    return olhos, (rosto, lin)


def retocar_rosto(n, borda, cfg, sobrinho):
    """Olho: +1 px de brilho do lado da luz. Sobrinho: sobrancelha (se cabe), bochecha e boca marcada."""
    r = cfg["rosto"]
    pele = set(r["pele"])
    hgt, wid = n.shape
    olhos, rosto = achar_olhos(n, r, sobrinho)
    if not sobrinho:
        # Nick: todo ponto escuro (olho, focinho) com pelo em volta, de 3 px ou mais, ganha 1 px de brilho no canto de cima à
        # esquerda (se ainda não tem brilho)
        for pts in componentes(n == "olho"):
            if not (3 <= len(pts) <= 10) or any(borda[p] for p in pts):
                continue
            viz = [n[y + dy, x + dx] for y, x in pts for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0))]
            if r["brilho"] in viz or sum(v in pele for v in viz) < len(viz) // 3:
                continue
            n[min(pts)] = r["brilho"]
        return n
    for pts, y0, y1, x0, x1 in olhos:
        conj = set(pts)
        brilhos = [(y + dy, x + dx) for y, x in pts for dy, dx in ((0, 1), (1, 0), (0, -1), (-1, 0))
                   if n[y + dy, x + dx] == r["brilho"]]
        alvo = None
        if brilhos and len(pts) >= 4:
            by, bx = min(brilhos)
            for cand in ((by - 1, bx), (by, bx - 1), (by, bx + 1), (by + 1, bx)):
                if cand in conj:
                    alvo = cand
                    break
        elif not brilhos and len(pts) >= 3:
            alvo = min(pts)              # canto de cima, à esquerda (luz de cima à esquerda)
        if alvo:
            n[alvo] = r["brilho"]
    if not olhos:
        return n
    face = set(rosto[0])
    # sobrancelha: 2 linhas acima do olho, se as 2 linhas entre o olho e ela forem rosto
    for pts, y0, y1, x0, x1 in olhos:
        xs = range(x0, min(x1, x0 + 2) + 1)
        yb = y0 - 2
        if yb >= 1 and all((yb, x) in face and (y0 - 1, x) in face for x in xs):
            for x in xs:
                n[yb, x] = r["sobrancelha"]
    frente = len(olhos) == 2
    cx_med = np.mean([(o[3] + o[4]) / 2 for o in olhos])
    # bochecha: 2 px na linha do olho + 2, do lado de fora (frente) ou embaixo do olho (perfil)
    for pts, y0, y1, x0, x1 in olhos:
        yc = y1 + 2
        if frente:
            xs = (x0 - 1, x0) if (x0 + x1) / 2 < cx_med else (x1, x1 + 1)
        else:
            xs = (x0, x0 + 1)
        for x in xs:
            if (yc, x) in face and n[yc, x] in pele:
                n[yc, x] = r["bochecha"]
    # boca marcada: entre os olhos, abaixo deles, os tons da boca de hoje (`boca_hoje`) passam à cor da boca
    if frente and r.get("boca_hoje"):
        e = sorted(olhos, key=lambda o: o[3])
        ybase = max(o[2] for o in e)
        for y in range(ybase + 2, min(hgt, ybase + 9)):
            for x in range(e[0][4] + 1, e[1][3]):
                if n[y, x] in r["boca_hoje"] and not borda[y, x]:
                    n[y, x] = r["boca"]
    return n


def com_sombra(q, alcance, larg):
    """Sombra de contato: elipse preta 25% sob os pés (2 px para a direita), atrás do personagem, nas últimas linhas."""
    a = q[:, :, 3] > 0
    hgt, wid = a.shape
    linhas = np.nonzero(a.any(1))[0]
    if linhas.size == 0:
        return q
    fy = linhas.max()
    cols = np.nonzero(a[max(0, fy - 3):fy + 1].any(0))[0]
    cx = (cols.min() + cols.max()) / 2 + 2
    rx = max(larg / 2, (cols.max() - cols.min()) / 2 + 2)
    cy, ry = hgt - alcance / 2 - 0.5, alcance / 2
    out = q.copy()
    for y in range(hgt - alcance, hgt):
        for x in range(wid):
            if not a[y, x] and ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                out[y, x] = (0, 0, 0, ALFA_SOMBRA)
    return out


def acabamento(folhas, fw, nome, alcance, larg):
    cfg = PALETAS[nome]
    assert len(cfg["alvos"]) <= 15, (nome, len(cfg["alvos"]))
    alvo = {k: hx(v) for k, v in cfg["alvos"].items()}
    faltas = set()
    res = {}
    for chave, folha in folhas.items():
        qs = []
        for q in quadros_de(folha, fw):
            n = fechar_buracos(mapear(q, cfg, faltas), set(cfg["rosto"]["cabelo"]))
            n, borda = contorno_e_luz(n, cfg)
            n = retocar_rosto(n, borda, cfg, nome != "nick")
            out = np.zeros_like(q)
            for y in range(q.shape[0]):
                for x in range(q.shape[1]):
                    if n[y, x]:
                        out[y, x] = (*alvo[n[y, x]], 255)
            qs.append(com_sombra(out, alcance, larg))
        res[chave] = np.concatenate(qs, axis=1)
    return res, sorted(faltas)


# ------------------------------------------------------------------ gravação
def salvar_indexado(arr, caminho):
    cores = sorted({tuple(int(v) for v in p) for p in arr.reshape(-1, 4) if p[3] > 0})
    assert len(cores) <= 16, (caminho.name, len(cores))
    pal = [(0, 0, 0, 0)] + cores
    lut = {c: i for i, c in enumerate(pal)}
    ind = np.zeros(arr.shape[:2], dtype=np.uint8)
    for y in range(arr.shape[0]):
        for x in range(arr.shape[1]):
            p = tuple(int(v) for v in arr[y, x])
            ind[y, x] = lut[p] if p[3] > 0 else 0
    out = Image.fromarray(ind, "P")
    flat = [v for c in pal for v in c[:3]]
    out.putpalette(flat + [0] * (768 - len(flat)))      # paleta cheia: PNG de 8 bits (o validador lê só 8 bits)
    caminho.parent.mkdir(parents=True, exist_ok=True)
    out.save(caminho, optimize=True, transparency=bytes([c[3] for c in pal]))
    return len(cores)


# ------------------------------------------------------------------ pranchas
def fonte(n):
    for c in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf"):
        if Path(c).exists():
            return ImageFont.truetype(c, n)
    return ImageFont.load_default()


_PISO = []


def fundo_piso(w, h):
    if not _PISO:
        ts = Image.open(ASSETS / "tiles_casa.png").convert("RGBA")
        p = 358 - 1
        _PISO.append(ts.crop(((p % 32) * 32, (p // 32) * 32, (p % 32) * 32 + 32, (p // 32) * 32 + 32)))
    im = Image.new("RGBA", (w, h))
    for y in range(0, h, 32):
        for x in range(0, w, 32):
            im.alpha_composite(_PISO[0], (x, y))
    return im


def tira(imgs, gap=4):
    w = sum(i.width for i in imgs) + gap * (len(imgs) - 1)
    h = max(i.height for i in imgs)
    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    x = 0
    for i in imgs:
        out.alpha_composite(i, (x, h - i.height))
        x += i.width + gap
    return out


def prancha(nome, antes, depois, fw, fh, parados, andares, destino):
    f, fp = fonte(16), fonte(13)

    def linha(fol, chaves, n):
        par = [Image.fromarray(fol[k]) for k in chaves]
        ands = []
        for d in DIRS:
            ands += [Image.fromarray(q) for q in quadros_de(fol[f"walk_{d}"], fw)][:n]
            ands.append(Image.new("RGBA", (6, fh)))
        return tira([tira(par, 4), Image.new("RGBA", (16, 1)), tira(ands, 2)], 0)

    blocos = [("ANTES (1.3.0)", linha(antes, parados[0], andares[0])), ("DEPOIS", linha(depois, parados[1], andares[1]))]
    larg = max(b.width for _, b in blocos)
    secoes = []
    for esc in (1, 2, 4):
        sec = Image.new("RGBA", (larg * esc + 140, sum(b.height * esc + 22 for _, b in blocos) + 26), (0, 0, 0, 0))
        g = ImageDraw.Draw(sec)
        g.text((8, 4), f"{esc}x", fill=(244, 233, 200), font=f)
        y = 24
        for rot, b in blocos:
            g.text((8, y + 4), rot, fill=(244, 233, 200), font=fp)
            fundo = fundo_piso(b.width, b.height)
            fundo.alpha_composite(b)
            sec.alpha_composite(fundo.resize((b.width * esc, b.height * esc), Image.NEAREST), (130, y))
            y += b.height * esc + 22
        secoes.append(sec)
    out = Image.new("RGBA", (max(s.width for s in secoes) + 16, sum(s.height for s in secoes) + 44), (11, 16, 48, 255))
    g = ImageDraw.Draw(out)
    g.text((8, 8), f"{nome}: parado (baixo, cima, esquerda, direita) | caminhada baixo, cima, esquerda, direita (cada quadro)",
           fill=(244, 211, 94), font=f)
    y = 36
    for s in secoes:
        out.alpha_composite(s, (8, y))
        y += s.height
    out.convert("RGB").save(destino, optimize=True)


def gif_caminhada(antes, depois, fw, fh, n_antes, n_depois, fps_antes, fps_depois, destino, esc=4):
    passo_ms = 1000 / 24
    frames = []
    for t in range(48):
        ms = t * passo_ms
        fundo = fundo_piso(4 * (fw + 8), 2 * (fh + 6))
        for lin, (fol, n, fps) in enumerate(((antes, n_antes, fps_antes), (depois, n_depois, fps_depois))):
            k = int(ms / 1000 * fps) % n
            for c, d in enumerate(DIRS):
                fundo.alpha_composite(Image.fromarray(quadros_de(fol[f"walk_{d}"], fw)[k]), (c * (fw + 8) + 4, lin * (fh + 6) + 3))
        frames.append(fundo.resize((fundo.width * esc, fundo.height * esc), Image.NEAREST).convert("P", palette=Image.ADAPTIVE, colors=64))
    frames[0].save(destino, save_all=True, append_images=frames[1:], duration=int(passo_ms), loop=0, optimize=True)


def prancha_rostos(antes, depois, destino):
    """Cabeças em 8x: parado de frente, interagir e comemorar de cada sobrinho, e o Nick; antes em cima, depois embaixo."""
    f = fonte(16)
    colunas = []
    for nome in SOBRINHOS:
        for k in ("idle", "interact", "celebrate"):
            colunas.append((nome, antes[nome][k][:30], depois[nome][k][:30]))
    for k in ("idle_down", "idle_left"):
        colunas.append(("nick", antes["nick"][k], depois["nick"][k]))
    larg = sum(c[1].shape[1] + 2 for c in colunas)
    hh = max(c[1].shape[0] for c in colunas)
    out = Image.new("RGBA", (larg * 8 + 120, (hh * 2 + 6) * 8 + 40), (11, 16, 48, 255))
    g = ImageDraw.Draw(out)
    g.text((8, 10), "antes", fill=(244, 211, 94), font=f)
    g.text((8, 30 + (hh + 6) * 8), "depois", fill=(244, 211, 94), font=f)
    x = 100
    for nome, a, d in colunas:
        for lin, im in enumerate((a, d)):
            fundo = fundo_piso(im.shape[1], im.shape[0])
            fundo.alpha_composite(Image.fromarray(np.ascontiguousarray(im)))
            out.alpha_composite(fundo.resize((im.shape[1] * 8, im.shape[0] * 8), Image.NEAREST), (x, 30 + lin * (hh + 6) * 8))
        x += (a.shape[1] + 2) * 8
    out.convert("RGB").save(destino, optimize=True)


def sala_4(antes, depois, destino, destino_meia):
    """A Sala com o kit 3/4 real: os 4 sobrinhos lado a lado ao sul do sofá e da mesa (LoLô, BiBi, DanDan, TuTu),
    o Nick ao lado, a LoLô de costas atrás do sofá e a BiBi andando."""
    import gerar_prototipo_3_4 as gp
    meta, imgs = {}, {}
    for e in json.loads((ASSETS / "sprites.json").read_text(encoding="utf-8"))["imagens"]:
        if "movel" in e:
            imgs[e["arquivo"][:-4]] = Image.open(ASSETS / e["arquivo"]).convert("RGBA")
            meta[e["arquivo"][:-4]] = {"ancora": e["movel"]["ancora"]}
    original = gp.carregar
    paineis = []
    for fol in (antes, depois):
        temp = {}
        for nome in SOBRINHOS:
            temp[f"__{nome}"] = Image.fromarray(fol[nome]["idle"])
        temp["__lolo_up"] = Image.fromarray(quadros_de(fol["lolo"]["walk_up"], 32)[0])
        temp["__bibi_passo"] = Image.fromarray(quadros_de(fol["bibi"]["walk_right"], 32)[1])
        temp["__nick"] = Image.fromarray(fol["nick"]["idle_right"])
        temp["__nick_up"] = Image.fromarray(fol["nick"]["idle_left"])
        gp.carregar = lambda n, temp=temp: temp[n] if n.startswith("__") else original(n)
        estados = {"quarto-sala": 0, "quarto_casal-sala": 0, "escritorio-sala": 0, "cozinha-sala": 2, "hall-sala": 0}
        pos = [("__lolo", 2, 6), ("__bibi", 3, 6), ("__dandan", 4, 6), ("__tutu", 5, 6), ("__nick", 1, 6),
               ("__lolo_up", 4, 2), ("__bibi_passo", 5, 4), ("__nick_up", 9, 4)]
        paineis.append(gp.compor_area("sala", 358, 16, estados, pos, imgs, meta))
        gp.carregar = original
    f = fonte(14)
    W2, H2 = 480 * 2 + 16, 352 + 28
    um = Image.new("RGB", (W2, H2), (11, 16, 48))
    g = ImageDraw.Draw(um)
    for i, (rot, p) in enumerate((("ANTES (1.3.0)", paineis[0]), ("DEPOIS", paineis[1]))):
        g.text((i * 496 + 4, 6), rot, fill=(244, 211, 94), font=f)
        um.paste(p.convert("RGB"), (i * 496, 28))
    um.resize((W2 * 2, H2 * 2), Image.NEAREST).save(destino, optimize=True)
    meia = Image.new("RGB", (W2 // 2 + 8, H2 // 2 + 20), (11, 16, 48))
    g = ImageDraw.Draw(meia)
    for i, (rot, p) in enumerate((("antes", paineis[0]), ("depois", paineis[1]))):
        g.text((i * 248 + 4, 2), rot + " (0,5x)", fill=(244, 211, 94), font=fonte(11))
        meia.paste(p.convert("RGB").resize((240, 176), Image.BILINEAR), (i * 248, 18))
    meia.save(destino_meia, optimize=True)


# ------------------------------------------------------------------ principal
def main():
    aplicar = "--aplicar" in sys.argv
    rel, antes_t, depois_t = {}, {}, {}
    for nome in SOBRINHOS + ["nick"]:
        antes = originais(nome)
        if nome == "nick":
            depois, faltas = acabamento(folhas_do_nick(), 32, "nick", 3, 20)
        else:
            depois, faltas = acabamento(folhas_do_sobrinho(nome), 32, nome, 4, 18)
        antes_t[nome], depois_t[nome] = antes, depois
        r = {"_cores_sem_mapa": faltas}
        for k, v in depois.items():
            caminho = AQUI / nome / f"spr_{nome}_{k}.png"
            r[caminho.name] = {"cores": salvar_indexado(v, caminho), "bytes": caminho.stat().st_size, "tam": list(v.shape[1::-1])}
            if aplicar and not (nome != "nick" and k.startswith("idle_")):
                salvar_indexado(v, ASSETS / caminho.name)
        r["_bytes_antes"] = sum(f.stat().st_size for f in ORIGINAIS.glob(f"spr_{nome}_*.png"))
        r["_bytes_depois_jogo"] = sum(v["bytes"] for k, v in r.items() if isinstance(v, dict)
                                      and not (nome != "nick" and "_idle_" in k))
        rel[nome] = r
        if nome == "nick":
            prancha("Nick", antes, depois, 32, 32, ([f"idle_{d}" for d in DIRS],) * 2, (4, 4), AQUI / "antes-depois-nick-1x2x4x.png")
            gif_caminhada(antes, depois, 32, 32, 4, 4, 8, 8, AQUI / "antes-depois-nick-caminhada.gif")
        else:
            ap = dict(antes)
            for d in ("up", "left", "right"):
                ap[f"parado_{d}"] = antes[f"walk_{d}"][:, :32]     # o que o jogo mostra hoje ao parar
            prancha(nome, ap, depois, 32, 48, (["idle", "parado_up", "parado_left", "parado_right"], [f"idle_{d}" for d in DIRS]),
                    (2, 4), AQUI / f"antes-depois-{nome}-1x2x4x.png")
            gif_caminhada(antes, depois, 32, 48, 2, 4, 6, 8, AQUI / f"antes-depois-{nome}-caminhada.gif")
        print(nome, "cores máx", max(v["cores"] for v in r.values() if isinstance(v, dict)),
              "mín", min(v["cores"] for v in r.values() if isinstance(v, dict)),
              "bytes antes", r["_bytes_antes"], "depois (jogo)", r["_bytes_depois_jogo"], "sem mapa", faltas)
    prancha_rostos(antes_t, depois_t, AQUI / "antes-depois-rostos.png")
    sala_4(antes_t, depois_t, AQUI / "sala-4-sobrinhos-antes-depois.png", AQUI / "sala-4-sobrinhos-meia-escala.png")
    (AQUI / "relatorio.json").write_text(json.dumps(rel, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    if aplicar:
        print("gravado em", ASSETS)


if __name__ == "__main__":
    main()
