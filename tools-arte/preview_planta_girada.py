#!/usr/bin/env python3
"""Prévia da planta girada da casa real, com móveis, portas e objetos (Arte, 2026-11-08).

Desenha a planta inteira na mesma grade da referência do Diretor (assets/referencia/planta-girada-diretor.png,
1 tile = 40,9 px, origem (3, 25) na imagem já orientada pelo EXIF) e gera o painel comparativo.

Fontes:
- piso e objetos de jogo: content/maps/casa-real/*.json (o que o motor lê);
- posição das subáreas: tools-arte/golden/casa-real/resumo.json (deslocamento − origemDaCasa);
- móveis: objetos `movel` (nome, x, y, w, h) de content/maps/casa-real/*.json, gravados pelo conversor
  (2026-11-08, Diretor: móveis vão para o conteúdo). A prévia desenha o mesmo retângulo que a colisão;
- paredes sem nome (retângulos bloqueantes sem texto) e batentes das portas, textos P1–P8 e rótulos das subáreas:
  maps/casa-real/our-home-jogo.tmx (cópia de trabalho), só como contorno de conferência;
  P4 a P6 vêm do original our-home.tmx, em cinza, só como referência (fora do Marco 1, ADR-004 seção 9).

Saídas (tools-arte/previews/):
- planta-girada.png: a planta com móveis e portas (substitui a versão sem móveis).
- comparacao-planta-girada.png: referência do Diretor à esquerda, prévia à direita.

Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_planta_girada.py   (precisa de Pillow)
Não é a cena do jogo: é a conferência visual da Arte (GDD 14.12.6, R10).
"""
import json
import math
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "tools-arte"))
from preview_casa import cola_tile  # noqa: E402

CONTEUDO = RAIZ / "content" / "maps" / "casa-real"
GOLDEN = RAIZ / "tools-arte" / "golden" / "casa-real" / "resumo.json"
TMX_JOGO = RAIZ / "maps" / "casa-real" / "our-home-jogo.tmx"
TMX_ORIGINAL = RAIZ / "maps" / "casa-real" / "our-home.tmx"
ASSETS = RAIZ / "assets" / "hd-480x352"
REFERENCIA = RAIZ / "assets" / "referencia" / "planta-girada-diretor.png"
SAIDA = RAIZ / "tools-arte" / "previews"

T = 40.9            # tamanho do tile na imagem (mesma grade da referência)
ORIGEM = (3.0, 25.0)  # canto do tile (0,0) da grade da referência
TAM_PX = 41         # tamanho do tile de piso desenhado
FUNDO = (190, 190, 190)
LINHA = (168, 168, 168)
FONTE_TTF = "/System/Library/Fonts/Helvetica.ttc"
TMX_TILE = 32.0


def fonte(tam):
    try:
        return ImageFont.truetype(FONTE_TTF, tam)
    except OSError:
        return ImageFont.load_default()


# ---------------------------------------------------------------- frame da planta
def carregar_frame():
    """Devolve (TX0, TY1): menor coluna e maior linha de tile do piso do TMX de jogo (mesma origem do conversor)."""
    r = ET.parse(TMX_JOGO).getroot()
    lay = [l for l in r.findall("layer") if l.attrib["name"] == "Pisos"][0]
    tiles = []
    for ch in lay.findall("data/chunk"):
        x0, y0, w = int(ch.attrib["x"]), int(ch.attrib["y"]), int(ch.attrib["width"])
        vals = [int(v) for v in ch.text.replace("\n", "").split(",") if v.strip()]
        for k, g in enumerate(vals):
            if g:
                tiles.append((x0 + k % w, y0 + k // w))
    return min(t[0] for t in tiles), max(t[1] for t in tiles)


TX0, TY1 = carregar_frame()


def cv_tmx(px, py):
    """Ponto do TMX (pixel) -> pixel da imagem, pela rotação global da planta (x,y) -> (TY1 − y, x − TX0)."""
    u = (TY1 + 1 - py / TMX_TILE)       # eixo X da planta, em tiles contínuos
    v = (px / TMX_TILE - TX0)           # eixo Y da planta, em tiles contínuos
    return (ORIGEM[0] + (1 + u) * T, ORIGEM[1] + (4 + v) * T)


def cel(i, j):
    """Canto superior esquerdo do tile (i, j) da planta na imagem."""
    return (ORIGEM[0] + i * T, ORIGEM[1] + j * T)


def centro_tile(i, j):
    x, y = cel(i, j)
    return (x + T / 2, y + T / 2)


# ---------------------------------------------------------------- leitura do TMX
def retangulos_girados(o):
    """Cantos de um objeto retangular do Tiled (rotação em torno do canto superior esquerdo, sentido horário)."""
    th = math.radians(o["rot"])
    c, s = math.cos(th), math.sin(th)
    x, y, w, h = o["x"], o["y"], o["w"], o["h"]
    cantos = [(0, 0), (w, 0), (w, h), (0, h)]
    return [(x + dx * c - dy * s, y + dx * s + dy * c) for dx, dy in cantos]


def ler_objetos(caminho):
    r = ET.parse(caminho).getroot()
    saida = []
    for og in r.findall("objectgroup"):
        for o in og.findall("object"):
            txt = o.find("text")
            saida.append({
                "grupo": og.attrib.get("name"),
                "id": o.attrib.get("id"),
                "x": float(o.attrib["x"]), "y": float(o.attrib["y"]),
                "w": float(o.attrib.get("width", 0)), "h": float(o.attrib.get("height", 0)),
                "rot": float(o.attrib.get("rotation", 0)),
                "props": {p.attrib["name"]: p.attrib.get("value") for p in o.findall("properties/property")},
                "texto": txt.text if txt is not None else None,
            })
    return saida


# ---------------------------------------------------------------- desenho
def carregar_tiles():
    return Image.open(ASSETS / "tiles_casa.png").convert("RGBA")


def poligono_na_imagem(o):
    return [cv_tmx(px, py) for px, py in retangulos_girados(o)]


def centro(pontos):
    return (sum(p[0] for p in pontos) / len(pontos), sum(p[1] for p in pontos) / len(pontos))


def desenhar_planta(largura, altura, com_referencia_tmx=True):
    tiles = carregar_tiles()
    img = Image.new("RGBA", (largura, altura), FUNDO + (255,))
    d = ImageDraw.Draw(img, "RGBA")
    f_nome = fonte(12)
    f_porta = fonte(13)
    f_pequena = fonte(10)

    # Grade (mesma da referência)
    for i in range(0, 24):
        x = ORIGEM[0] + i * T
        d.line([(x, 0), (x, altura)], fill=LINHA + (255,), width=1)
    for j in range(0, 29):
        y = ORIGEM[1] + j * T
        d.line([(0, y), (largura, y)], fill=LINHA + (255,), width=1)

    # Subáreas: piso e objetos de jogo do content/ (o que o motor lê)
    golden = json.loads(GOLDEN.read_text(encoding="utf-8"))
    origem = golden["origemDaCasa"]
    desl = {s["id"]: s["deslocamento"] for s in golden["subareas"]}
    subs = {}
    for arq in sorted(CONTEUDO.glob("*.json")):
        dd = json.loads(arq.read_text(encoding="utf-8"))
        subs[dd["id"]] = dd

    def tile_planta(sid, x, y):
        rx, ry = desl[sid][0] - origem[0], desl[sid][1] - origem[1]
        return (1 + rx + x, 4 + ry + y)

    piso = {}
    for sid, dd in subs.items():
        W = dd["largura"]
        for y in range(dd["altura"]):
            for x in range(W):
                k = y * W + x
                ij = tile_planta(sid, x, y)
                if dd["chao"][k]:
                    piso[ij] = (dd["chao"][k], dd["colisao"][k])
    for (i, j), (gid, _) in piso.items():
        t = cola_tile(tiles, gid).resize((TAM_PX, TAM_PX), Image.NEAREST)
        x, y = cel(i, j)
        img.paste(t, (round(x), round(y)))

    # Móveis: objetos `movel` de content/ (mesmo retângulo que a colisão; nome do TMX)
    for sid, dd in subs.items():
        for o in dd["objetos"]:
            if o["tipo"] != "movel":
                continue
            i0, j0 = tile_planta(sid, o["x"], o["y"])
            x0, y0 = cel(i0, j0)
            x1, y1 = cel(i0 + o["w"], j0 + o["h"])
            pts = [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
            d.polygon(pts, fill=(222, 196, 140, 235), outline=(40, 30, 20, 255))
            d.line(pts + [pts[0]], fill=(40, 30, 20, 255), width=2)
            cx, cy = centro(pts)
            larg = d.textlength(o["nome"], font=f_nome)
            d.text((cx - larg / 2, cy - 7), o["nome"], fill=(20, 15, 10, 255), font=f_nome)

    # Paredes: retângulos bloqueantes do TMX de jogo sem nome (não estão em content/; só contorno fino)
    objs_jogo = ler_objetos(TMX_JOGO)
    for o in objs_jogo:
        if o["grupo"] == "Objetos da casa bloqueantes" and not o["texto"]:
            pts = poligono_na_imagem(o)
            d.line(pts + [pts[0]], fill=(60, 40, 25, 170), width=1)

    # Portas: batentes (retângulos sem texto) e marcas de texto P1–P8 do TMX de jogo
    for o in objs_jogo:
        if o["grupo"] == "Portas" and not o["texto"]:
            pts = poligono_na_imagem(o)
            d.polygon(pts, fill=(40, 25, 15, 255))

    # Objetos de jogo do content (spawns, interruptor, árvore, bilhete, examináveis)
    simbolos = {"interruptor": ("I", (255, 215, 0)), "arvore": ("A", (60, 190, 90)),
                "bilhete": ("B", (255, 255, 255)), "examinavel": ("E", (120, 200, 255))}
    portas_fechadas = []
    pares = {}
    for sid, dd in subs.items():
        for o in dd["objetos"]:
            ij = tile_planta(sid, o["x"], o["y"])
            cx, cy = centro_tile(*ij)
            tipo = o["tipo"]
            if tipo == "porta":
                gx, gy = cel(*ij)
                d.rectangle([gx + 4, gy + 4, gx + T - 4, gy + T - 4], outline=(255, 230, 0, 255), width=3)
                pares.setdefault(o["id"], []).append((ij, o.get("trancadaAte")))
            elif tipo == "portaFechada":
                portas_fechadas.append((o["id"], ij))
            elif tipo == "spawn":
                d.ellipse([cx - 5, cy - 5, cx + 5, cy + 5], fill=(0, 220, 230, 255), outline=(0, 60, 70, 255))
                d.text((cx + 6, cy - 7), o["nome"], fill=(0, 90, 100, 255), font=f_pequena)
            elif tipo in simbolos:
                letra, cor = simbolos[tipo]
                d.ellipse([cx - 9, cy - 9, cx + 9, cy + 9], fill=cor + (255,), outline=(30, 30, 30, 255))
                larg = d.textlength(letra, font=f_pequena)
                d.text((cx - larg / 2, cy - 6), letra, fill=(20, 20, 20, 255), font=f_pequena)
            elif tipo == "bilhete":
                pass

    # Vão de cada par: tile entre os dois gatilhos (sem piso), com o rótulo do par
    for pid, lista in pares.items():
        if len(lista) == 2:
            (a, _), (b, trancada) = lista
            vao = ((a[0] + b[0]) // 2, (a[1] + b[1]) // 2)
            cx, cy = centro_tile(*vao)
            texto = pid
            larg = d.textlength(texto, font=f_porta)
            d.rectangle([cx - larg / 2 - 3, cy - 9, cx + larg / 2 + 3, cy + 9], fill=(255, 245, 200, 235),
                        outline=(120, 90, 0, 255))
            d.text((cx - larg / 2, cy - 8), texto, fill=(60, 40, 0, 255), font=f_porta)

    # Portas fechadas P1–P3: rótulo na tile da marca (vazio, ao lado do piso que ela fecha)
    for pid, ij in portas_fechadas:
        cx, cy = centro_tile(*ij)
        larg = d.textlength(pid, font=f_porta)
        d.rectangle([cx - larg / 2 - 3, cy - 9, cx + larg / 2 + 3, cy + 9], fill=(255, 245, 200, 235),
                    outline=(120, 90, 0, 255))
        d.text((cx - larg / 2, cy - 8), pid, fill=(60, 40, 0, 255), font=f_porta)

    # P4 a P6 e rótulo do Elevador: só referência, do original (fora do Marco 1, ADR-004 seção 9;
    # o Elevador não é subárea, o rótulo saiu da cópia de jogo, docs/mapa-casa-real.md 3.5.1)
    if com_referencia_tmx:
        for o in ler_objetos(TMX_ORIGINAL):
            if o["grupo"] == "Portas" and o["texto"] in ("P4", "P5", "P6"):
                cx, cy = cv_tmx(o["x"] + o["w"] / 2, o["y"] + o["h"] / 2)
                d.text((cx - 10, cy - 8), o["texto"] + "*", fill=(90, 90, 90, 255), font=f_porta)
            if o["texto"] == "Elevador":
                cx, cy = cv_tmx(o["x"] + o["w"] / 2, o["y"] + o["h"] / 2)
                larg = d.textlength("Elevador*", font=f_nome)
                d.text((cx - larg / 2, cy - 7), "Elevador*", fill=(90, 90, 90, 255), font=f_nome)

    # Nomes das áreas (rótulos do TMX de jogo; na horizontal, só para conferência)
    for o in objs_jogo:
        if o["grupo"] == "Rótulos das subáreas" and o["texto"]:
            cx, cy = centro(poligono_na_imagem(o))
            larg = d.textlength(o["texto"], font=f_nome)
            d.text((cx - larg / 2, cy - 7), o["texto"], fill=(10, 10, 10, 255), font=f_nome)
    return img


def comparacao(prévia):
    ref = ImageOps.exif_transpose(Image.open(REFERENCIA)).convert("RGBA")
    W, H = ref.size
    faixa = 34
    fundo = Image.new("RGBA", (W * 2 + 16, H + faixa), (255, 255, 255, 255))
    d = ImageDraw.Draw(fundo)
    f = fonte(18)
    d.text((10, 8), "Referência do Diretor (print)", fill=(0, 0, 0, 255), font=f)
    d.text((W + 26, 8), "Prévia gerada (content + TMX de jogo)", fill=(0, 0, 0, 255), font=f)
    fundo.paste(ref, (0, faixa))
    fundo.paste(prévia.convert("RGBA"), (W + 16, faixa))
    return fundo


def main():
    SAIDA.mkdir(parents=True, exist_ok=True)
    ref = ImageOps.exif_transpose(Image.open(REFERENCIA))
    W, H = ref.size
    previa = desenhar_planta(W, H)
    previa.convert("RGB").save(SAIDA / "planta-girada.png")
    comparacao(previa).convert("RGB").save(SAIDA / "comparacao-planta-girada.png")
    print(SAIDA / "planta-girada.png")
    print(SAIDA / "comparacao-planta-girada.png")


if __name__ == "__main__":
    sys.exit(main())
