#!/usr/bin/env python3
"""Põe um móvel bloqueante na planta de trabalho a partir das coordenadas da tela (já giradas), como o Diretor indica.

Uso: python3 tools-arte/movel_para_tmx.py <área> "<Nome>" <coluna> <linha> <largura> <altura>
  coluna, linha, largura e altura em tiles do conteúdo girado (o que aparece nos previews).
  Ex.: python3 tools-arte/movel_para_tmx.py sala "Sofá" 3 3 2 2
Converte para o TMX (antes do giro), grava um retângulo com texto no grupo `Objetos da casa bloqueantes` de
maps/casa-real/home-v2-jogo.tmx e não faz mais nada: rode depois `python3 tools-arte/tmx_para_conteudo.py --girar
--atualizar-golden`. O id do móvel no conteúdo é o nome sem acento, em minúsculas e com _ (ex.: "Rack da sala" -> rack_da_sala);
o sprite de cada um é spr_<id>.png (tools-arte/gerar_placeholders_hd.py). Se o nome já existe no grupo, não duplica.
Fórmula (ADR-011 seção 2.5): tile girado (x', y') -> TMX (BX + y', BY + h0 - 1 - x'), com BX, BY e h0 do golden.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TMX = RAIZ / "maps" / "casa-real" / "home-v2-jogo.tmx"
RESUMO = RAIZ / "tools-arte" / "golden" / "casa-real" / "resumo.json"
T = 32


def origem(area):
    for s in json.loads(RESUMO.read_text(encoding="utf-8"))["subareas"]:
        if s["id"] == area:
            d0, d1 = s["deslocamento"]
            w_rot = s["largura"]          # largura girada = altura original (h0)
            return d1, -d0 - w_rot, w_rot
    raise SystemExit(f"área '{area}' não existe no golden")


def main(a):
    if len(a) != 6:
        raise SystemExit(__doc__)
    area, nome = a[0], a[1]
    c, l, w, h = map(int, a[2:])
    bx, by, h0 = origem(area)
    x0 = bx + l
    x1 = bx + l + h - 1
    y0 = by + (h0 - 1 - (c + w - 1))
    y1 = by + (h0 - 1 - c)
    s = TMX.read_text(encoding="utf-8")
    if f">{nome}</text>" in s:
        print(f"'{nome}' já existe no TMX; nada a fazer")
        return
    m = re.search(r'nextobjectid="(\d+)"', s)
    oid = int(m.group(1))
    s = s.replace(m.group(0), f'nextobjectid="{oid + 1}"')
    obj = (f'  <object id="{oid}" x="{x0 * T}" y="{y0 * T}" width="{(x1 - x0 + 1) * T}" height="{(y1 - y0 + 1) * T}">\n'
           f'   <text wrap="1" halign="center">{nome}</text>\n  </object>\n')
    i = s.index('<objectgroup id="13" name="Objetos da casa bloqueantes">')
    j = s.index(" </objectgroup>", i)
    s = s[:j] + obj + s[j:]
    TMX.write_text(s, encoding="utf-8")
    print(f"{nome}: TMX x {x0}..{x1}, y {y0}..{y1} (px {x0 * T},{y0 * T} {(x1 - x0 + 1) * T}x{(y1 - y0 + 1) * T})")


if __name__ == "__main__":
    main(sys.argv[1:])
