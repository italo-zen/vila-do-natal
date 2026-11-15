#!/usr/bin/env python3
"""
Converte a folha oficial do Nick (Diretor) em sprites de jogo em pixel art, perfil hd-480x352 (ADR-003).

Entrada : assets/referencia/ref_nick_folha.webp   (1536×1024)
Saída   : assets/hd-480x352/spr_nick_*.png        (quadro 32×32 do perfil: corpos.nick.quadro)
            spr_nick_idle_<dir>.png     32×32     parado, 4 direções (cartões "Parado / Idle")
            spr_nick_walk_<dir>.png     128×32    andar, 4 quadros lado a lado (painel "Andar"; ADR-005 7.1)
            spr_nick_sleep.png          128×32    dormindo, 4 quadros ("Dormindo", com respiração)
            spr_nick_wake.png           128×32    acordando, 4 quadros ("Acordando", com o "!" amarelo do quadro 2)
            spr_nick_sniff.png          128×32    farejando, 4 quadros ("Farejando", com as marcas azuis)
            spr_nick_happy.png          128×32    feliz/abanando, 4 quadros ("Feliz / Comemoração")
          tools-arte/paletas_nick_hd-480x352.json  cores usadas e caixas medidas (conferência)
          As prévias (Nick em todos os estados e ao lado de um Sobrinho) são de tools-arte/preview_marco3.py.

Uso:
  python3 tools-arte/gerar_nick.py --perfil hd-480x352
  Não gera o sprites.json: as entradas do Nick ficam em tools-arte/gerar_placeholders_hd.py (sprites_json),
  para o JSON ser escrito por um só gerador.

Método (reprodutível, sem aleatoriedade; igual ao de gerar_sobrinhos.py):
  1. Cada célula da folha é recortada por uma janela medida no painel (constantes abaixo). Figura = pixel
     diferente do fundo do painel (50, 26, 52) por mais de 60 na soma dos canais. O contorno preto do Nick
     entra, porque é diferente do fundo.
  2. Uma escala única para todos os estados (escala_unica, calculada das caixas medidas): o Nick tem o mesmo
     tamanho em todos os estados, e o quadro de 32×32 cabe o dormindo (o estado mais largo).
  3. Cada pixel de saída é o pixel mais frequente (voto da maioria) no seu bloco da folha. Quadro ancorado
     pelos pés (base da caixa) e pelo centro horizontal da caixa da célula.
  4. Cores: k-means (K, semente fixa) sobre os pixels do Nick em todas as células, uma paleta só.
"""
import argparse
import json
from pathlib import Path

import numpy as np
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
REFERENCIA = RAIZ / "assets" / "referencia" / "ref_nick_folha.webp"
PERFIS = RAIZ / "content" / "art-profiles"
FUNDO_PAINEL = np.array([50, 26, 52])     # fundo dos painéis, medido na folha (uniforme)
LIMIAR_FIGURA = 60
SEMENTE = 7
K_CORES_PADRAO = 28                     # 24 deixava o idle de costas com 15 cores (mínimo 16 por sprite)
MARGEM_LATERAL = 1                        # pixels de respiro ao redor do Nick no quadro

# ---- Janelas medidas na folha (1536×1024), (x0, x1, y0, y1). Cada janela contém uma célula. ----
# Painel "Andar": 4 colunas × 4 direções. Usa as colunas 2 e 4 (índices 1 e 3) no ciclo de 2 quadros.
ANDAR_X = [(480, 580), (580, 683), (683, 786), (786, 890)]
ANDAR_Y = {"down": (70, 168), "up": (182, 284), "left": (298, 396), "right": (412, 510)}
# Painel "Parado / Idle": 4 cartões, frente, costas, esquerda, direita.
PARADO_X = [(950, 1079), (1079, 1217), (1217, 1363), (1363, 1500)]
PARADO_Y = (60, 175)
# Painel "Dormindo" e "Acordando": 4 quadros cada. As divisas caem nas frestas entre os corpos (o "!" do
# acordar, quadro 2, passa de 1215; o zzz, à direita do quadro 4, começa em 1493 e fica fora da janela 4).
DORMINDO_X = [(955, 1083), (1083, 1222), (1222, 1350), (1350, 1482)]
DORMINDO_Y = (255, 345)
ACORDANDO_X = [(955, 1083), (1083, 1222), (1222, 1350), (1350, 1512)]
ACORDANDO_Y = (418, 520)        # a linha divisória do painel fica em y 408 a 411
# Painel "Farejando" (B): 4 quadros. A borda rosa do painel fica em x 696 a 700.
FAREJAR_X = [(345, 434), (434, 521), (521, 610), (610, 692)]
FAREJAR_Y = (630, 725)
# Painel "Feliz / Comemoração": 4 quadros. A linha divisória fica em y 608 a 611. Sob o quadro 3 há uma
# sombra roxa (y 705 a 716) que não é do Nick: a janela 3 termina em 703.
FELIZ = [(722, 817, 617, 725), (817, 913, 617, 725), (913, 1005, 617, 703), (1005, 1098, 617, 725)]

# Os frames de andar usados no ciclo: os 4 do painel (ADR-005 7.1, backlog 067, GDD 16.4.1).
QUADROS_ANDAR = (0, 1, 2, 3)


def carregar():
    img = Image.open(REFERENCIA).convert("RGB")
    return np.asarray(img).astype(np.int16)


def figura_em(arr, janela):
    """Máscara de figura (pixel diferente do fundo do painel) numa janela (x0, x1, y0, y1) da folha."""
    x0, x1, y0, y1 = janela
    sub = arr[y0:y1, x0:x1]
    return np.abs(sub - FUNDO_PAINEL).sum(-1) > LIMIAR_FIGURA


def componente_principal(mascara):
    """Só o maior componente conectado (8 vizinhos) da máscara: o corpo do Nick. Faíscas, zzz e marcas de
    farejar ficam separados do corpo (com folga), então não entram na medida nem na âncora do quadro."""
    altura, largura = mascara.shape
    visto = np.zeros_like(mascara, dtype=bool)
    maior, maior_n = None, 0
    for j in range(altura):
        for i in range(largura):
            if not mascara[j, i] or visto[j, i]:
                continue
            pilha, pontos = [(j, i)], []
            visto[j, i] = True
            while pilha:
                y, x = pilha.pop()
                pontos.append((y, x))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < altura and 0 <= nx < largura and mascara[ny, nx] and not visto[ny, nx]:
                            visto[ny, nx] = True
                            pilha.append((ny, nx))
            if len(pontos) > maior_n:
                maior, maior_n = pontos, len(pontos)
    saida = np.zeros_like(mascara, dtype=bool)
    for y, x in maior or []:
        saida[y, x] = True
    return saida


def azul_do_zzz(arr, janela):
    """Marca azul (zzz do dormir, 4 quadro): pixels em que o azul domina o vermelho."""
    x0, x1, y0, y1 = janela
    sub = arr[y0:y1, x0:x1]
    return sub[:, :, 2] > sub[:, :, 0] + 30


def caixa_da_figura(mascara, x0, y0):
    ys, xs = np.nonzero(mascara)
    if xs.size == 0:
        raise ValueError(f"nenhum pixel do Nick na janela ({x0}, {y0})")
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


def definir_celulas():
    """Nome da célula -> janela (x0, x1, y0, y1). A ordem dos quadros de cada estado é a da folha, da esquerda."""
    celulas = {}
    for i, (x0, x1) in enumerate(PARADO_X):
        celulas[f"idle_{i}"] = (x0, x1, *PARADO_Y)
    for direcao, (y0, y1) in ANDAR_Y.items():
        for k in QUADROS_ANDAR:
            x0, x1 = ANDAR_X[k]
            celulas[f"walk_{direcao}_{k}"] = (x0, x1, y0, y1)
    for i, (x0, x1) in enumerate(DORMINDO_X):
        celulas[f"sleep_{i}"] = (x0, x1, *DORMINDO_Y)
    for i, (x0, x1) in enumerate(ACORDANDO_X):
        celulas[f"wake_{i}"] = (x0, x1, *ACORDANDO_Y)
    for i, (x0, x1) in enumerate(FAREJAR_X):
        celulas[f"sniff_{i}"] = (x0, x1, *FAREJAR_Y)
    for i, (x0, x1, y0, y1) in enumerate(FELIZ):
        celulas[f"happy_{i}"] = (x0, x1, y0, y1)
    return celulas


def medir(arr, celulas):
    """Caixa de cada célula (x0, y0, x1, y1) na folha, pelo pixel do Nick (sem o zzz)."""
    caixas, mascaras = {}, {}
    for nome, janela in celulas.items():
        x0, x1, y0, y1 = janela
        m = figura_em(arr, janela)
        if nome.startswith("sleep_"):
            m = m & ~azul_do_zzz(arr, janela)      # dormindo: sem o zzz (ele é o balão da B, 16.5.5)
        corpo = componente_principal(m)            # escala e âncora: só o corpo do Nick
        caixas[nome] = caixa_da_figura(corpo, x0, y0)
        mascaras[nome] = m
    return caixas, mascaras


def escala_unica(caixas, largura, altura):
    """Uma escala para todos os quadros: a caixa mais larga/alta cabe no quadro com MARGEM_LATERAL de respiro."""
    dentro_w = largura - 2 * MARGEM_LATERAL
    dentro_h = altura - 2 * MARGEM_LATERAL
    s = 0.0
    for x0, y0, x1, y1 in caixas.values():
        s = max(s, (x1 - x0) / dentro_w, (y1 - y0) / dentro_h)
    return round(s + 0.005, 2)


def quadro_de(arr, caixa, mascara_inteira, janela, indice_cor, centros, escala, largura, altura):
    """Reduz uma célula a largura×altura por voto da maioria. A origem é o centro e os pés da caixa do Nick."""
    x0c, y0c, x1c, y1c = caixa
    cx = (x0c + x1c) / 2
    fy = y1c
    saida = np.zeros((altura, largura, 4), dtype=np.uint8)
    ox = cx - largura * escala / 2
    oy = fy - altura * escala
    xs_ini, ys_ini = janela[0], janela[2]
    m = mascara_inteira
    for j in range(altura):
        ya = int(round(oy + j * escala)) - ys_ini
        yb = int(round(oy + (j + 1) * escala)) - ys_ini
        for i in range(largura):
            xa = int(round(ox + i * escala)) - xs_ini
            xb = int(round(ox + (i + 1) * escala)) - xs_ini
            ya_, yb_ = max(ya, 0), min(yb, m.shape[0])
            xa_, xb_ = max(xa, 0), min(xb, m.shape[1])
            if yb_ <= ya_ or xb_ <= xa_:
                continue
            bloco = m[ya_:yb_, xa_:xb_]
            if bloco.mean() < 0.5:
                continue
            cores = indice_cor[ya_:yb_, xa_:xb_][bloco]
            cor = np.bincount(cores, minlength=len(centros)).argmax()
            saida[j, i] = (*centros[cor], 255)
    return saida


def sem_efeitos_cortados(mascara, janela, caixa, escala, largura, altura):
    """Tira os componentes que não cabem inteiros no quadro (faísca, marca de farejar). Um efeito cortado pela
    borda vira fragmento; o corpo (componente principal) fica sempre, porque a escala cabe nele (ver escala_unica)."""
    x0, _, y0, _ = janela
    x0c, y0c, x1c, y1c = caixa
    cx = (x0c + x1c) / 2
    ox = cx - largura * escala / 2
    oy = y1c - altura * escala
    altura_m, largura_m = mascara.shape
    visto = np.zeros_like(mascara, dtype=bool)
    saida = np.zeros_like(mascara, dtype=bool)
    for j in range(altura_m):
        for i in range(largura_m):
            if not mascara[j, i] or visto[j, i]:
                continue
            pilha, pontos = [(j, i)], []
            visto[j, i] = True
            while pilha:
                y, x = pilha.pop()
                pontos.append((y, x))
                for dy in (-1, 0, 1):
                    for dx in (-1, 0, 1):
                        ny, nx = y + dy, x + dx
                        if 0 <= ny < altura_m and 0 <= nx < largura_m and mascara[ny, nx] and not visto[ny, nx]:
                            visto[ny, nx] = True
                            pilha.append((ny, nx))
            ys = [p[0] + y0 for p in pontos]
            xs = [p[1] + x0 for p in pontos]
            dentro = (min(xs) >= ox - 0.5 and max(xs) + 1 <= ox + largura * escala + 0.5
                      and min(ys) >= oy - 0.5 and max(ys) + 1 <= oy + altura * escala + 0.5)
            corpo = (min(xs), min(ys), max(xs) + 1, max(ys) + 1) == caixa
            if dentro or corpo:
                for y, x in pontos:
                    saida[y, x] = True
    return saida


def remover_especks(sprite, minimo=2):
    """Tira pixels sem vizinho opaco e componentes de 1 a `minimo` pixels (restos da redução).

    Não tira o efeito das marcas (farejar, "!"): elas têm mais de 2 pixels.
    """
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
    opaco = saida[:, :, 3] > 0
    altura, largura = opaco.shape
    visto = np.zeros_like(opaco, dtype=bool)
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
            if len(pontos) <= minimo:
                for y, x in pontos:
                    saida[y, x] = 0
    return saida


def gerar(largura, altura, k_cores):
    arr = carregar()
    celulas = definir_celulas()
    caixas, mascaras = medir(arr, celulas)
    escala = escala_unica(caixas, largura, altura)

    # Paleta: k-means sobre os pixels do Nick de todas as células (uma paleta só, para os 4 estados).
    amostra = np.concatenate([arr[celulas[n][2]:celulas[n][3], celulas[n][0]:celulas[n][1]][mascaras[n]]
                              for n in celulas]).astype(float)
    centros = kmeans(amostra, k_cores)

    quadros = {}
    for nome, janela in celulas.items():
        x0, x1, y0, y1 = janela
        m = mascaras[nome]
        pts = arr[y0:y1, x0:x1][m].astype(float)
        indice = np.full(m.shape, 0, dtype=np.int64)
        indice[m] = ((pts[:, None, :] - centros[None].astype(float)) ** 2).sum(-1).argmin(1)
        m_util = sem_efeitos_cortados(m, janela, caixas[nome], escala, largura, altura)
        indice = np.where(m_util, indice, 0)
        quadros[nome] = remover_especks(quadro_de(arr, caixas[nome], m_util, janela, indice, centros, escala, largura, altura))

    sprites = {}
    for i in range(4):
        sprites[f"idle_{['down', 'up', 'left', 'right'][i]}"] = quadros[f"idle_{i}"]
    for direcao in ANDAR_Y:
        tira = np.zeros((altura, largura * len(QUADROS_ANDAR), 4), dtype=np.uint8)
        for i, k in enumerate(QUADROS_ANDAR):
            tira[:, i * largura:(i + 1) * largura] = quadros[f"walk_{direcao}_{k}"]
        sprites[f"walk_{direcao}"] = tira
    for estado, prefixo in (("sleep", "sleep"), ("wake", "wake"), ("sniff", "sniff"), ("happy", "happy")):
        tira = np.zeros((altura, largura * 4, 4), dtype=np.uint8)
        for i in range(4):
            tira[:, i * largura:(i + 1) * largura] = quadros[f"{prefixo}_{i}"]
        sprites[estado] = tira

    usadas = sorted({tuple(int(v) for v in p[:3]) for s in sprites.values() for p in s.reshape(-1, 4) if p[3] == 255})
    info = {
        "escala": escala,
        "quadro": [largura, altura],
        "cores_usadas": ["#%02x%02x%02x" % c for c in usadas],
        "total_cores": len(usadas),
        "caixas_medidas": {k: list(map(int, v)) for k, v in caixas.items()},
    }
    return sprites, info


def main():
    ap = argparse.ArgumentParser(description="Gera os sprites do Nick a partir da folha de referência.")
    ap.add_argument("--perfil", default="hd-480x352", help="id do perfil de arte (padrão hd-480x352)")
    ap.add_argument("--cores", type=int, default=K_CORES_PADRAO, help="máximo de cores (padrão 28; o perfil aceita 16 a 32)")
    args = ap.parse_args()

    perfil = json.loads((PERFIS / f"{args.perfil}.json").read_text(encoding="utf-8"))
    quadro = perfil["corpos"]["nick"]["quadro"]
    largura, altura = int(quadro["w"]), int(quadro["h"])
    minimo, maximo = perfil["paleta"]["minimoDeCores"], perfil["paleta"]["maximoDeCores"]
    if not (minimo <= args.cores <= maximo):
        raise SystemExit(f"--cores {args.cores} fora de {minimo}..{maximo} (paleta do perfil)")
    pasta = RAIZ / perfil["pasta"]
    pasta.mkdir(parents=True, exist_ok=True)

    sprites, info = gerar(largura, altura, args.cores)
    for nome, arr in sprites.items():
        Image.fromarray(arr, "RGBA").save(pasta / f"spr_nick_{nome}.png", optimize=True)

    minimo_nick = perfil.get("sprites", {}).get("nick", {}).get("coresMin", 16)
    if info["total_cores"] < minimo_nick:
        raise SystemExit(f"Nick com {info['total_cores']} cores; o mínimo é {minimo_nick} (sprites.nick.coresMin)")

    paletas = Path(__file__).resolve().parent / f"paletas_nick_{args.perfil}.json"
    paletas.write_text(json.dumps(info, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Nick: quadro {largura}x{altura}, escala única {info['escala']}, cores={info['total_cores']}")
    for nome, arr in sprites.items():
        print(f"  spr_nick_{nome}.png {arr.shape[1]}x{arr.shape[0]}")
    print(f"Gerado em {pasta}")


if __name__ == "__main__":
    main()
