#!/usr/bin/env python3
"""
Converte as folhas de referência dos 4 Sobrinhos (Diretor) em sprites de jogo em pixel art.

Entrada : assets/referencia/ref_<nome>_folha.webp   (1536×1024; nome = lolo, bibi, dandan, tutu)
Saída   : assets/sobrinhos_final/                    (padrão, perfil v1 gba-240x160: quadro 16×24)
            spr_<nome>_idle.png            16×24  (parado, frente)
            spr_<nome>_interact.png        16×24  (interagindo)
            spr_<nome>_celebrate.png       16×24  (comemorando)
            spr_<nome>_walk_<dir>.png      32×24  (2 quadros lado a lado; dir = down, up, left, right)
            preview.png                            folha de contato ampliada 6×
          tools-arte/paletas_sobrinhos.json        cores usadas por personagem (conferência)

Uso com perfil (ADR-003 seção 11):
  python3 tools-arte/gerar_sobrinhos.py --perfil hd-480x352
    Lê content/art-profiles/<perfil>.json: quadro = corpos.sobrinho.quadro, pasta = pasta do perfil.
    Saída: <pasta do perfil>/spr_<nome>_*.png (sem preview.png, que não entra na build).
    Preview: tools-arte/preview_sobrinhos_<perfil>.png. Paleta: tools-arte/paletas_sobrinhos_<perfil>.json.
    Opcional: --cores N (máximo de cores por personagem, padrão 24; o perfil aceita 16 a 32).

Método (reprodutível, sem aleatoriedade):
  1. Cada célula da folha é recortada pelas coordenadas medidas no painel (constantes abaixo).
  2. A escala é fixa por personagem: a célula "Parado / frente" define a altura e a largura do quadro.
  3. Cada pixel de saída é o pixel mais frequente (voto da maioria) dentro do seu bloco na folha.
  4. As cores vêm de k-means (K = cores, semente fixa) sobre os pixels do próprio personagem,
     amostrados só dentro das janelas das células (as bordas dos painéis ficam de fora).

Dependências: pillow (com WebP) e numpy.
Python com as dependências: /Library/Developer/CommandLineTools/usr/bin/python3 (no Mac).
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
REFERENCIA = RAIZ / "assets" / "referencia"
SAIDA_V1 = RAIZ / "assets" / "sobrinhos_final"
PALETAS_V1 = Path(__file__).resolve().parent / "paletas_sobrinhos.json"
PERFIS = RAIZ / "content" / "art-profiles"

PERSONAGENS = ["lolo", "bibi", "dandan", "tutu"]
NOMES = {"lolo": "LoLô", "bibi": "BiBi", "dandan": "DanDan", "tutu": "TuTu"}
LARGURA_V1, ALTURA_V1 = 16, 24          # quadro do perfil v1 (padrão, sem --perfil)
K_CORES_PADRAO = 24
LIMIAR_FIGURA = 60      # diferença (soma de canais) para considerar pixel do personagem
SEMENTE = 7

# ---- Coordenadas medidas nas folhas (1536×1024). Painel "Andar" (esquerda) ----
COLUNAS_ANDAR = [503, 611, 722, 830]           # centros das 4 colunas de quadros
LINHAS_ANDAR = {                               # faixa vertical de cada direção
    "down": (58, 170),
    "up": (175, 287),
    "left": (292, 400),
    "right": (404, 521),
}
QUADROS_ANDAR = (1, 3)                         # colunas usadas no ciclo de 2 quadros
MEIA_JANELA_ANDAR = 55

# ---- Painéis da direita: Parado (4 cartões), Interagindo e Comemorando ----
PARADO_CX = 1023                               # cartão 1 = frente (idle)
PARADO_Y = (60, 176)
INTERAGIR = {"cx": 1162, "x": (1110, 1215), "y": (250, 356)}     # cartão 2 (com A)
COMEMORAR = {"cx": 1166, "x": (1110, 1225), "y": (412, 541)}     # cartão 2 (braços para cima)

# Fundo do painel (região vazia perto da borda direita do painel Andar)
REGIAO_FUNDO = (890, 905, 70, 150)
# Linhas divisórias dos painéis: linhas horizontais mais longas que isto são descartadas
COMPRIMENTO_LINHA = 300
FAIXAS_DOS_PAINEIS = [(330, 905), (950, 1505)]  # painel Andar e painel da direita (sem a moldura)


def carregar(nome):
    img = Image.open(REFERENCIA / f"ref_{nome}_folha.webp").convert("RGB")
    return np.asarray(img).astype(np.int16)


def remover_linhas(figura):
    """Zera divisórias horizontais dos painéis (linhas longas e contínuas dentro da faixa do painel).

    Só age dentro da faixa x de cada painel, porque a moldura rosa externa também é longa e contínua.
    """
    saida = figura.copy()
    for xa, xb in FAIXAS_DOS_PAINEIS:
        sub = figura[:, xa:xb]
        for j in range(figura.shape[0]):
            linha = sub[j].astype(np.int8)
            if linha.sum() < COMPRIMENTO_LINHA:
                continue
            bordas = np.diff(np.concatenate(([0], linha, [0])))
            inicios, fins = np.nonzero(bordas == 1)[0], np.nonzero(bordas == -1)[0]
            if (fins - inicios).max() >= COMPRIMENTO_LINHA:
                saida[j, xa:xb] = False
    return saida


def remover_isolados(sprite):
    """Apaga pixels de personagem sem nenhum vizinho opaco (restos de faísca e ruído da redução)."""
    opaco = sprite[:, :, 3] > 0
    viz = np.zeros_like(opaco, dtype=int)
    pad = np.pad(opaco, 1)
    for dj in (-1, 0, 1):
        for di in (-1, 0, 1):
            if dj == 0 and di == 0:
                continue
            viz += pad[1 + dj:1 + dj + opaco.shape[0], 1 + di:1 + di + opaco.shape[1]]
    saida = sprite.copy()
    saida[opaco & (viz == 0)] = 0
    return saida


def limpar_soltos(sprite, minimo_componente=8):
    """Limpeza de pixels soltos (regra da Arte, 2026-11-08).

    1. Espinhos: pixel de personagem com no máximo 1 vizinho opaco (8 vizinhos) é removido; faz 2 passadas.
    2. Só fica o componente principal (corpo). Componentes desconectados, como a sombra que sobra
       abaixo dos pés no quadro de andar e faíscas soltas, são removidos. Componentes menores que
       `minimo_componente` também saem, mesmo que sejam o único (segurança).
    """
    saida = sprite.copy()
    for _ in range(2):
        opaco = saida[:, :, 3] > 0
        pad = np.pad(opaco, 1)
        viz = np.zeros_like(opaco, dtype=int)
        for dj in (-1, 0, 1):
            for di in (-1, 0, 1):
                if dj == 0 and di == 0:
                    continue
                viz += pad[1 + dj:1 + dj + opaco.shape[0], 1 + di:1 + di + opaco.shape[1]]
        saida[opaco & (viz <= 1)] = 0
    opaco = saida[:, :, 3] > 0
    altura, largura = opaco.shape
    visto = np.zeros_like(opaco, dtype=bool)
    componentes = []
    for j in range(altura):
        for i in range(largura):
            if not opaco[j, i] or visto[j, i]:
                continue
            pilha, pontos = [(j, i)], []
            visto[j, i] = True
            while pilha:
                y, x = pilha.pop()
                pontos.append((y, x))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < altura and 0 <= nx < largura and opaco[ny, nx] and not visto[ny, nx]:
                            visto[ny, nx] = True
                            pilha.append((ny, nx))
            componentes.append(pontos)
    if componentes:
        principal = max(componentes, key=len)
        for pontos in componentes:
            if pontos is principal and len(pontos) >= minimo_componente:
                continue
            for y, x in pontos:
                saida[y, x] = 0
    return saida


def caixa(figura, x0, x1, y0, y1):
    """Caixa (x0, y0, x1, y1) do personagem dentro da janela, em coordenadas da folha."""
    sub = figura[y0:y1, x0:x1]
    ys, xs = np.nonzero(sub)
    if xs.size == 0:
        raise ValueError(f"nenhum pixel de personagem na janela {x0, x1, y0, y1}")
    return (x0 + xs.min(), y0 + ys.min(), x0 + xs.max() + 1, y0 + ys.max() + 1)


def kmeans(x, k, iteracoes=60):
    rng = np.random.default_rng(SEMENTE)
    centros = [x[rng.integers(len(x))].astype(float)]
    for _ in range(1, k):
        d = np.min(((x[:, None, :] - np.array(centros)[None]) ** 2).sum(-1), axis=1)
        centros.append(x[rng.choice(len(x), p=d / d.sum())].astype(float))
    c = np.array(centros)
    for _ in range(iteracoes):
        rotulo = ((x[:, None, :] - c[None]) ** 2).sum(-1).argmin(1)
        novo = np.array([x[rotulo == j].mean(0) if np.any(rotulo == j) else c[j] for j in range(k)])
        if np.allclose(novo, c, atol=0.5):
            break
        c = novo
    return np.round(c).astype(np.int16)


def processar(nome, largura, altura, k_cores):
    arr = carregar(nome)
    fundo = np.median(arr[REGIAO_FUNDO[2]:REGIAO_FUNDO[3], REGIAO_FUNDO[0]:REGIAO_FUNDO[1]].reshape(-1, 3), axis=0)
    diff = np.abs(arr - fundo).sum(-1)
    figura = diff > LIMIAR_FIGURA
    figura = remover_linhas(figura)

    # Células: (cx, fy, janela) em coordenadas da folha
    celulas = {}
    # Parado frente: define a escala do personagem
    bx = caixa(figura, PARADO_CX - MEIA_JANELA_ANDAR, PARADO_CX + MEIA_JANELA_ANDAR, *PARADO_Y)
    escala_x = (bx[2] - bx[0]) / largura
    escala_y = (bx[3] - bx[1]) / altura
    celulas["idle"] = ((bx[0] + bx[2]) / 2, bx[3])

    celulas["interact"] = (INTERAGIR["cx"], caixa(figura, *INTERAGIR["x"], *INTERAGIR["y"])[3])
    celulas["celebrate"] = (COMEMORAR["cx"], caixa(figura, *COMEMORAR["x"], *COMEMORAR["y"])[3])

    for direcao, (ya, yb) in LINHAS_ANDAR.items():
        for k in QUADROS_ANDAR:
            cxc = COLUNAS_ANDAR[k]
            b = caixa(figura, cxc - MEIA_JANELA_ANDAR, cxc + MEIA_JANELA_ANDAR, ya, yb)
            celulas[f"walk_{direcao}_{k}"] = ((b[0] + b[2]) / 2, b[3])

    # Região de amostragem para cores e mapa de índices, restrita às janelas das células
    x_ini, x_fim, y_ini, y_fim = 430, 1500, 40, 560
    regiao = arr[y_ini:y_fim, x_ini:x_fim]
    dentro = np.zeros(figura.shape, dtype=bool)
    for ya, yb in LINHAS_ANDAR.values():
        for cxc in COLUNAS_ANDAR:
            dentro[ya:yb, cxc - MEIA_JANELA_ANDAR:cxc + MEIA_JANELA_ANDAR] = True
    dentro[PARADO_Y[0]:PARADO_Y[1], PARADO_CX - MEIA_JANELA_ANDAR:PARADO_CX + MEIA_JANELA_ANDAR] = True
    for c in (INTERAGIR, COMEMORAR):
        dentro[c["y"][0]:c["y"][1], c["x"][0]:c["x"][1]] = True
    figura = figura & dentro
    reg_fig = figura[y_ini:y_fim, x_ini:x_fim]

    # Paleta: k-means sobre os pixels do personagem (inclui o contorno escuro)
    amostra = regiao[reg_fig]
    centros = kmeans(amostra.astype(float), k_cores)

    # Índice de cor de cada pixel do personagem (-1 = fundo)
    indice = np.full(reg_fig.shape, -1, dtype=np.int64)
    pts = regiao[reg_fig].astype(float)
    indice[reg_fig] = ((pts[:, None, :] - centros[None].astype(float)) ** 2).sum(-1).argmin(1)

    def quadro(cx, fy, sx, sy):
        """Reduz a célula para largura×altura por voto da maioria dentro de cada bloco da folha."""
        saida = np.zeros((altura, largura, 4), dtype=np.uint8)
        ox = cx - largura * sx / 2 - x_ini
        oy = fy - altura * sy - y_ini
        for j in range(altura):
            ya = int(round(oy + j * sy))
            yb = int(round(oy + (j + 1) * sy))
            for i in range(largura):
                xa = int(round(ox + i * sx))
                xb = int(round(ox + (i + 1) * sx))
                bf = reg_fig[ya:yb, xa:xb]
                if bf.size == 0 or bf.mean() < 0.5:
                    continue
                cores_do_bloco = indice[ya:yb, xa:xb][bf]
                cor = np.bincount(cores_do_bloco, minlength=k_cores).argmax()
                saida[j, i] = (*centros[cor], 255)
        return remover_isolados(saida)

    sprites = {}
    sprites["idle"] = limpar_soltos(quadro(*celulas["idle"], escala_x, escala_y))
    sprites["interact"] = limpar_soltos(quadro(*celulas["interact"], escala_x, escala_y))
    sprites["celebrate"] = limpar_soltos(quadro(*celulas["celebrate"], escala_x, escala_y))
    for direcao in LINHAS_ANDAR:
        frames = [limpar_soltos(quadro(*celulas[f"walk_{direcao}_{k}"], escala_x, escala_y)) for k in QUADROS_ANDAR]
        tira = np.zeros((altura, largura * 2, 4), dtype=np.uint8)
        tira[:, 0:largura] = frames[0]
        tira[:, largura:] = frames[1]
        sprites[f"walk_{direcao}"] = tira

    usadas = sorted({tuple(p[:3]) for s in sprites.values() for p in s.reshape(-1, 4) if p[3] == 255})
    info = {
        "fundo": [int(v) for v in fundo],
        "escala_x": round(float(escala_x), 3),
        "escala_y": round(float(escala_y), 3),
        "cores_usadas": ["#%02x%02x%02x" % c for c in usadas],
        "total_cores": len(usadas),
    }
    return sprites, info


def salvar(sprites, pasta):
    pasta.mkdir(parents=True, exist_ok=True)
    for nome, arr in sprites.items():
        Image.fromarray(arr, "RGBA").save(pasta / f"spr_{nome}.png", optimize=True)


def checker(w, h, quadro=6):
    fundo = np.zeros((h, w, 3), dtype=np.uint8)
    for j in range(h):
        for i in range(w):
            fundo[j, i] = (236, 228, 212) if ((i // quadro) + (j // quadro)) % 2 == 0 else (214, 205, 188)
    return fundo


FONTES_CANDIDATAS = [
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
    "/Library/Fonts/Arial Unicode.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def fontes():
    from PIL import ImageFont

    for caminho in FONTES_CANDIDATAS:
        if Path(caminho).exists():
            return ImageFont.truetype(caminho, 18), ImageFont.truetype(caminho, 13)
    fonte = ImageFont.load_default()
    return fonte, fonte


def preview(todos, largura, altura, destino):
    from PIL import ImageDraw

    escala = 6
    cols = [
        ("idle", "parado"),
        ("interact", "interagir"),
        ("celebrate", "comemorar"),
        ("walk_down", "baixo"),
        ("walk_up", "cima"),
        ("walk_left", "esquerda"),
        ("walk_right", "direita"),
    ]
    # largura: nome(150) + idle(largura) + interact + celebrate + 4 walks (2×largura cada) com espaçamento
    larg_quadro = [largura if c[0] in ("idle", "interact", "celebrate") else largura * 2 for c in cols]
    gap = 14
    margem_esq = 150
    largura_total = margem_esq + sum(l * escala for l in larg_quadro) + gap * (len(cols) + 1)
    altura_linha = altura * escala + 46
    altura_total = 40 + altura_linha * len(PERSONAGENS) + 20
    img = Image.fromarray(checker(largura_total, altura_total), "RGB")
    draw = ImageDraw.Draw(img)
    fonte, fonte_pequena = fontes()
    draw.text((10, 10), f"Sobrinhos (final): quadros {largura}x{altura}, ampliados 6x", fill=(40, 20, 30), font=fonte)
    for linha, nome in enumerate(PERSONAGENS):
        y = 40 + linha * altura_linha
        draw.text((10, y + 60), NOMES[nome], fill=(40, 20, 30), font=fonte)
        x = margem_esq + gap
        for (chave, rotulo), larg in zip(cols, larg_quadro):
            draw.text((x, y), rotulo, fill=(60, 40, 50), font=fonte_pequena)
            sprite = Image.fromarray(todos[nome][chave], "RGBA").resize(
                (larg * escala, altura * escala), Image.NEAREST
            )
            img.paste(sprite, (x, y + 24), sprite)
            x += larg * escala + gap
    destino.parent.mkdir(parents=True, exist_ok=True)
    img.save(destino, optimize=True)


def ler_perfil(perfil_id):
    caminho = PERFIS / f"{perfil_id}.json"
    perfil = json.loads(caminho.read_text(encoding="utf-8"))
    quadro = perfil["corpos"]["sobrinho"]["quadro"]
    return perfil, int(quadro["w"]), int(quadro["h"])


def main():
    ap = argparse.ArgumentParser(description="Gera os sprites dos Sobrinhos a partir das folhas de referência.")
    ap.add_argument("--perfil", help="id do perfil de arte (ex.: hd-480x352). Sem ele, gera o v1 (16×24).")
    ap.add_argument("--cores", type=int, default=K_CORES_PADRAO, help="máximo de cores por personagem (padrão 24)")
    args = ap.parse_args()

    if args.perfil:
        perfil, largura, altura = ler_perfil(args.perfil)
        pasta = RAIZ / perfil["pasta"]
        paletas = Path(__file__).resolve().parent / f"paletas_sobrinhos_{args.perfil}.json"
        previa = Path(__file__).resolve().parent / f"preview_sobrinhos_{args.perfil}.png"
    else:
        largura, altura = LARGURA_V1, ALTURA_V1
        pasta, paletas, previa = SAIDA_V1, PALETAS_V1, SAIDA_V1 / "preview.png"

    todos, infos = {}, {}
    for nome in PERSONAGENS:
        sprites, info = processar(nome, largura, altura, args.cores)
        todos[nome] = sprites
        infos[nome] = info
        salvar({f"{nome}_{k}": v for k, v in sprites.items()}, pasta)
        print(f"{nome}: quadro {largura}x{altura}, escala x={info['escala_x']} y={info['escala_y']}, cores={info['total_cores']}")
    preview(todos, largura, altura, previa)
    paletas.write_text(json.dumps(infos, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Gerado em {pasta}")


if __name__ == "__main__":
    main()
