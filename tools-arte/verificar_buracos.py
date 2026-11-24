#!/usr/bin/env python3
"""Verifica (e, com --corrigir, preenche) buracos nos sprites dos sobrinhos e do Nick (Arte, 2026-11-19).

Buraco = pixel transparente ou quase (alfa < 255) DENTRO da silhueta de um quadro, que o flood fill a partir da borda do quadro não alcança
(vãos ligados ao fundo, como entre o braço e o corpo, são legítimos e ficam). Defeito = componente fechado de até MAX_DEFEITO px, ou de qualquer
tamanho cercado por no máximo 2 cores (miolo de cabelo ou de roupa). Vão fechado maior, cercado por 3 ou mais cores (pode ser um vão legítimo
entre braço e corpo), é só LISTADO (vai ao Orquestrador). Com --corrigir, o defeito é preenchido de fora para dentro com a cor dos vizinhos
opacos mais frequente (empate: cima, depois esquerda: luz de cima à esquerda), sem mexer em nenhum outro pixel e sem cor nova.
Uso: python3 tools-arte/verificar_buracos.py [--corrigir] [--so ARQUIVO...]   (precisa de Pillow; saída 1 se sobrar buraco)
"""
import glob
import sys
from collections import Counter, deque
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
ASSETS = RAIZ / "assets" / "hd-480x352"
MAX_DEFEITO = 4          # buracos isolados de 1 a 4 px
PADROES = ["spr_bibi_*.png", "spr_lolo_*.png", "spr_dandan_*.png", "spr_tutu_*.png", "spr_nick_*.png"]
LARGURA_DO_QUADRO = 32


def arquivos(filtro):
    achados = []
    for p in PADROES:
        achados += sorted(ASSETS.glob(p))
    if filtro:
        achados = [a for a in achados if a.name in filtro]
    return achados


def buracos_do_quadro(px, ox, w, h):
    """Componentes (listas de (x, y) globais) de pixels com alfa < 255 não ligados à borda do quadro (4-conexão)."""
    vazio = lambda x, y: px[ox + x, y][3] < 255
    visto = set()
    fila = deque()
    for x in range(w):
        for y in (0, h - 1):
            if vazio(x, y) and (x, y) not in visto:
                visto.add((x, y)); fila.append((x, y))
    for y in range(h):
        for x in (0, w - 1):
            if vazio(x, y) and (x, y) not in visto:
                visto.add((x, y)); fila.append((x, y))
    while fila:
        x, y = fila.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visto and vazio(nx, ny):
                visto.add((nx, ny)); fila.append((nx, ny))
    resto = {(x, y) for y in range(h) for x in range(w) if vazio(x, y)} - visto
    comps = []
    while resto:
        ini = resto.pop(); comp = [ini]; f = deque([ini])
        while f:
            x, y = f.popleft()
            for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                v = (x + dx, y + dy)
                if v in resto:
                    resto.discard(v); comp.append(v); f.append(v)
        comps.append(sorted(comp))
    return comps


def cor_de_preenchimento(px, ox, comp, w, h):
    ocup = set(comp)
    votos = Counter(); ordem = []
    for x, y in comp:
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):          # cima, esquerda, direita, baixo
            nx, ny = x + dx, y + dy
            if (nx, ny) in ocup or not (0 <= nx < w and 0 <= ny < h):
                continue
            c = px[ox + nx, ny]
            if c[3] == 255:
                votos[c] += 1
                if c not in ordem:
                    ordem.append(c)
    if not votos:
        return None
    melhor = max(votos.values())
    for c in ordem:                                                  # empate: o primeiro visto (cima, depois esquerda)
        if votos[c] == melhor:
            return c


def vizinhas(px, ox, comp, w, h):
    ocup = set(comp); cores = set()
    for x, y in comp:
        for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
            n = (x + dx, y + dy)
            if n in ocup or not (0 <= n[0] < w and 0 <= n[1] < h):
                continue
            c = px[ox + n[0], n[1]]
            if c[3] == 255:
                cores.add(c)
    return cores


def preencher(px, ox, comp, w, h):
    """Preenche de fora para dentro; devolve False se não houver vizinho opaco."""
    resto = set(comp)
    while resto:
        lote = {}
        for x, y in sorted(resto, key=lambda p: (p[1], p[0])):
            votos = Counter(); ordem = []
            for dx, dy in ((0, -1), (-1, 0), (1, 0), (0, 1)):
                n = (x + dx, y + dy)
                if n in resto or not (0 <= n[0] < w and 0 <= n[1] < h):
                    continue
                c = px[ox + n[0], n[1]]
                if c[3] == 255:
                    votos[c] += 1; ordem.append(c)
            if votos:
                m = max(votos.values())
                lote[(x, y)] = next(c for c in ordem if votos[c] == m)
        if not lote:
            return False
        for (x, y), c in lote.items():
            px[ox + x, y] = c
        resto -= set(lote)
    return True


def processar(caminho, corrigir):
    im = Image.open(caminho)
    rgba = im.convert("RGBA")
    px = rgba.load()
    W, H = rgba.size
    n = max(1, W // LARGURA_DO_QUADRO)
    relatorio = []
    mudou = False
    for q in range(n):
        ox = q * LARGURA_DO_QUADRO
        for comp in buracos_do_quadro(px, ox, LARGURA_DO_QUADRO, H):
            defeito = len(comp) <= MAX_DEFEITO or len(vizinhas(px, ox, comp, LARGURA_DO_QUADRO, H)) <= 2
            relatorio.append((q, comp, defeito))
            if corrigir and defeito:
                if preencher(px, ox, comp, LARGURA_DO_QUADRO, H):
                    mudou = True
    if corrigir and mudou:
        # volta ao PNG indexado: a paleta original, sem cores novas (as cores de preenchimento já existem na imagem)
        if im.mode == "P":
            pal = im.getpalette()
            cores = {}
            transp = im.info.get("transparency")
            tabela = []
            for i in range(len(pal) // 3):
                a = 255
                if isinstance(transp, (bytes, bytearray)):
                    a = transp[i] if i < len(transp) else 255
                elif isinstance(transp, int):
                    a = 0 if i == transp else 255
                tabela.append((pal[3 * i], pal[3 * i + 1], pal[3 * i + 2], a))
            inverso = {}
            for i, c in enumerate(tabela):
                inverso.setdefault(c, i)
            novo = Image.new("P", rgba.size)
            novo.putpalette(pal)
            dados = []
            for y in range(H):
                for x in range(W):
                    c = px[x, y]
                    if c not in inverso:
                        raise SystemExit(f"{caminho.name}: cor {c} fora da paleta original")
                    dados.append(inverso[c])
            novo.putdata(dados)
            salvar = {"optimize": True}
            if transp is not None:
                salvar["transparency"] = transp
            novo.save(caminho, **salvar)
        else:
            rgba.save(caminho, optimize=True)
    return relatorio, mudou


def main(argv):
    corrigir = "--corrigir" in argv
    filtro = []
    if "--so" in argv:
        filtro = argv[argv.index("--so") + 1:]
    total = {}
    sobra = 0
    for caminho in arquivos(filtro):
        rel, _ = processar(caminho, corrigir)
        quem = caminho.name.split("_")[1]
        for q, comp, defeito in rel:
            total[quem] = total.get(quem, 0) + (len(comp) if defeito else 0)
            print(f"{caminho.name} quadro {q}: {len(comp)} px em {comp[:6]}{'...' if len(comp) > 6 else ''} ({'defeito' if defeito else 'VÃO FECHADO GRANDE, só listado'})")
        if rel and not corrigir:
            sobra += sum(1 for r in rel)
        elif rel and corrigir:
            sobra += sum(1 for r in rel if not r[2])
    print("pixels por personagem:", total or "nenhum")
    print("buracos restantes:", sobra)
    return 1 if sobra else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
