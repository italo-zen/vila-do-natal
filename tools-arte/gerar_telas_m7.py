#!/usr/bin/env python3
"""
Imagens de tela do Marco 7 (GDD 20.3 e 20.4; item 151 e 152), perfil hd-480x352.

Converte as referências do Diretor (1536×1024, só leitura) para o quadro nativo de 480×352:
  tela_titulo.png  sala e árvore, sem pessoas nem Nick (inicio-arvore.webp)
  tela_fim.png     árvore, Nath, Ítalo, Nick e os 4 sobrinhos, em ordem LoLô, BiBi, DanDan, TuTu (fim-familia.webp)

Método (reprodutível, sem repintura à mão):
  1. recorte 3:2 -> 480:352 com altura inteira (1396×1024). O título corta 140 px à direita (a árvore fica na
     metade direita, 20.3); o fim corta 140 px à direita (LoLô e os rostos ficam inteiros);
  2. reamostragem por área (BOX) para 480×352;
  3. quantização para 32 cores (FASTOCTREE, com dithering de Floyd-Steinberg), PNG indexado, optimize.
A exibição no jogo é NEAREST (20.3). Os originais não são alterados. Sem véu: o contraste das caixas do título é do jogo (contorno escuro de 1 px e fundo opaco, Dev).

Saída: assets/hd-480x352/tela_titulo.png e tela_fim.png (ambos ≤ 60 000 bytes; alvo 50 000 no título).
Uso: /usr/bin/python3 tools-arte/gerar_telas_m7.py [--ampliar DIR]   (--ampliar grava cópias ×2 para inspeção)
"""
from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
REF = RAIZ / "assets" / "referencia" / "diretor-2026-11-10"
SAIDA = RAIZ / "assets" / "hd-480x352"
W, H = 480, 352
CORTE = 1396  # 1024 × 480 / 352: largura para manter a altura inteira
LIMITE_BYTES = 60_000

TELAS = [
    # (arquivo de referência, arquivo de saída, deslocamento x do recorte)
    ("inicio-arvore.webp", "tela_titulo.png", 0),
    ("fim-familia.webp", "tela_fim.png", 0),
]


def converter(ref: Path, x0: int) -> Image.Image:
    im = Image.open(ref).convert("RGB")
    assert im.size == (1536, 1024), f"{ref.name}: {im.size}"
    recorte = im.crop((x0, 0, x0 + CORTE, 1024))
    pequena = recorte.resize((W, H), Image.Resampling.BOX)
    return pequena.quantize(colors=32, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)


def main(argv):
    ampliar = Path(argv[argv.index("--ampliar") + 1]) if "--ampliar" in argv else None
    SAIDA.mkdir(parents=True, exist_ok=True)
    for ref_nome, saida_nome, x0 in TELAS:
        q = converter(REF / ref_nome, x0)
        destino = SAIDA / saida_nome
        q.save(destino, "PNG", optimize=True)
        tamanho = destino.stat().st_size
        cores = len(set(q.getdata()))
        print(f"{saida_nome}: {W}x{H}, {tamanho} bytes, {cores} cores usadas")
        if tamanho > LIMITE_BYTES:
            raise SystemExit(f"{saida_nome}: {tamanho} bytes passa de {LIMITE_BYTES} (20.7)")
        if ampliar:
            ampliar.mkdir(parents=True, exist_ok=True)
            q.convert("RGB").resize((W * 2, H * 2), Image.Resampling.NEAREST).save(ampliar / saida_nome.replace(".png", "_x2.png"))
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
