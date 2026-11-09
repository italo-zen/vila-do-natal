#!/usr/bin/env python3
"""Inventário medido da planta real (Tiled, maps/casa-real/our-home.tmx).

Só leitura: não grava nada no projeto. Usa somente a biblioteca padrão.
Uso:
    python3 tools-arte/inventario_casa_real.py [caminho/do/arquivo.tmx] [--ascii]

Convenções (ver docs/mapa-casa-real.md, seção 1):
- Tile da planta = 32 px (tilewidth do TMX). Coordenadas de objeto do Tiled são em px.
- Subárea = componente conexo (4 vizinhos) de tiles não vazios da camada "Pisos".
  Também é reportada a versão com 8 vizinhos, para ver se há encostos na diagonal.
- Rótulo de subárea/porta: associado à subárea que contém o centro do rótulo
  (ou, se o centro cair fora do piso, a subárea mais próxima).
- Objeto bloqueante: retângulo (com rotação aplicada, pivô no canto superior esquerdo,
  convenção assumida do Tiled). Tile bloqueado se a área sobreposta for >= 50%.
  Tiles com sobreposição parcial (entre 10% e 90%) são contados como "de borda".
- Cômodo "cabe na tela": bounding box da subárea <= 15 × 10 tiles (e <= 15 × 9 se a
  última faixa for reservada à barra de controles, GDD 14.8).
"""
import math
import sys
import xml.etree.ElementTree as ET
from collections import Counter, defaultdict, deque
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
PADRAO = RAIZ / "maps" / "casa-real" / "our-home.tmx"
TELA_W, TELA_H = 15, 10
TAMANHO_TILE_TMX = None  # preenchido ao ler o arquivo


def ler_tmx(caminho):
    raiz = ET.parse(caminho).getroot()
    global TAMANHO_TILE_TMX
    TAMANHO_TILE_TMX = float(raiz.get("tilewidth"))
    camadas = {}
    grupos = {}
    tilesets = []
    for ts in raiz.findall("tileset"):
        tilesets.append({
            "firstgid": int(ts.get("firstgid")),
            "name": ts.get("name"),
            "source": ts.get("source"),
            "tilecount": ts.get("tilecount"),
        })
    for camada in raiz.findall("layer"):
        nome = camada.get("name")
        dados = camada.find("data")
        if dados is None or dados.get("encoding") != "csv":
            raise SystemExit(f"Camada {nome}: esperado data encoding=csv")
        celulas = {}
        for chunk in dados.findall("chunk"):
            cx, cy = int(chunk.get("x")), int(chunk.get("y"))
            cw, ch = int(chunk.get("width")), int(chunk.get("height"))
            valores = [int(v) for v in chunk.text.replace("\n", "").split(",") if v.strip() != ""]
            if len(valores) != cw * ch:
                raise SystemExit(f"Chunk ({cx},{cy}) da camada {nome}: {len(valores)} valores, esperado {cw*ch}")
            for i, gid in enumerate(valores):
                x = cx + i % cw
                y = cy + i // cw
                celulas[(x, y)] = gid
        camadas[nome] = celulas
    for og in raiz.findall("objectgroup"):
        objs = []
        for o in og.findall("object"):
            texto = o.find("text")
            objs.append({
                "id": int(o.get("id")),
                "x": float(o.get("x")),
                "y": float(o.get("y")),
                "w": float(o.get("width", "0")),
                "h": float(o.get("height", "0")),
                "rot": float(o.get("rotation", "0")),
                "texto": (texto.text or "").strip() if texto is not None else None,
            })
        grupos[og.get("name")] = objs
    return camadas, grupos, tilesets


def gid_para_fonte(gid, tilesets):
    """Diz de qual tileset vem o gid (sem flags de espelhamento)."""
    base = gid & 0x1FFFFFFF
    if base == 0:
        return "vazio"
    escolhido = None
    for ts in tilesets:
        if ts["firstgid"] <= base:
            escolhido = ts
    if escolhido is None:
        return "?"
    return f'{escolhido["name"] or escolhido["source"]} (firstgid {escolhido["firstgid"]})'


def componentes(celulas, conexao8=False):
    vizinhos = [(-1, 0), (1, 0), (0, -1), (0, 1)]
    if conexao8:
        vizinhos += [(-1, -1), (1, -1), (-1, 1), (1, 1)]
    visto = set()
    comps = []
    for p in celulas:
        if p in visto:
            continue
        fila = deque([p])
        visto.add(p)
        membros = []
        while fila:
            x, y = fila.popleft()
            membros.append((x, y))
            for dx, dy in vizinhos:
                q = (x + dx, y + dy)
                if q in celulas and q not in visto:
                    visto.add(q)
                    fila.append(q)
        comps.append(membros)
    comps.sort(key=lambda m: (min(y for _, y in m), min(x for x, _ in m)))
    return comps


def caixa_tiles(membros):
    xs = [x for x, _ in membros]
    ys = [y for _, y in membros]
    return min(xs), min(ys), max(xs), max(ys)


def retangulo_em_tiles(obj):
    """Retângulo (x0,y0,x1,y1) em tiles fracionários, com rotação (pivô = canto sup. esq.)."""
    t = TAMANHO_TILE_TMX
    x, y, w, h = obj["x"], obj["y"], obj["w"], obj["h"]
    if obj["rot"] == 0:
        return (x / t, y / t, (x + w) / t, (y + h) / t)
    th = math.radians(obj["rot"])
    c, s = math.cos(th), math.sin(th)
    pontos = []
    for dx, dy in [(0, 0), (w, 0), (0, h), (w, h)]:
        pontos.append((x + dx * c - dy * s, y + dx * s + dy * c))
    xs = [p[0] for p in pontos]
    ys = [p[1] for p in pontos]
    return (min(xs) / t, min(ys) / t, max(xs) / t, max(ys) / t)


def area_sobreposta(ret, tx, ty):
    x0, y0, x1, y1 = ret
    ix = max(0.0, min(x1, tx + 1) - max(x0, tx))
    iy = max(0.0, min(y1, ty + 1) - max(y0, ty))
    return ix * iy


def fmt(v):
    return f"{v:.2f}".rstrip("0").rstrip(".")


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    mostrar_ascii = "--ascii" in sys.argv
    caminho = Path(args[0]) if args else PADRAO
    camadas, grupos, tilesets = ler_tmx(caminho)
    piso = {p: g for p, g in camadas["Pisos"].items() if g != 0}
    fontes = Counter(gid & 0x1FFFFFFF for g in piso.values() for gid in [g])

    print("=== 0. Arquivo ===")
    print(f"Arquivo: {caminho}")
    print(f"tilewidth do TMX: {TAMANHO_TILE_TMX:g} px")
    print("Tilesets:")
    for ts in tilesets:
        print(f"  firstgid {ts['firstgid']}: {ts['name'] or ts['source']} (tilecount={ts['tilecount']}, source={ts['source']})")
    print(f"Camadas de tile: {', '.join(camadas.keys())}")
    print(f"Grupos de objeto: {', '.join(grupos.keys())}")
    print(f"Tiles de piso não vazios: {len(piso)}")
    print("Gids usados na camada Pisos (gid: ocorrências):")
    for gid, n in sorted(fontes.items()):
        print(f"  {gid}: {n}  [{gid_para_fonte(gid, tilesets)}]")
    xs = [p[0] for p in piso]
    ys = [p[1] for p in piso]
    print(f"Caixa do piso (tiles): x {min(xs)}..{max(xs)}, y {min(ys)}..{max(ys)}")

    # --- 1. Subáreas por componentes do piso ---
    comps4 = componentes(piso, conexao8=False)
    comps8 = componentes(piso, conexao8=True)
    print(f"\n=== 1. Subáreas (componentes 4-conexos do piso): {len(comps4)} ===")
    print(f"(com 8-conexão, seriam {len(comps8)}; diferença = encostos só na diagonal)")
    rotulos = [o for o in grupos.get("Nome das subareas", []) if o["texto"]]
    if not rotulos:
        print("AVISO: nenhum rótulo de subárea encontrado")

    indice_comp = {}
    for i, m in enumerate(comps4):
        for p in m:
            indice_comp[p] = i

    def comp_do_rotulo(o):
        t = TAMANHO_TILE_TMX
        cx = (o["x"] + o["w"] / 2) / t
        cy = (o["y"] + o["h"] / 2) / t
        cel = (math.floor(cx), math.floor(cy))
        if cel in indice_comp:
            return indice_comp[cel], "centro sobre o piso"
        # caixa do rótulo sobre o piso: componente com mais tiles sob a caixa
        x0, y0 = math.floor(o["x"] / t), math.floor(o["y"] / t)
        x1, y1 = math.floor((o["x"] + o["w"]) / t), math.floor((o["y"] + o["h"]) / t)
        cont = Counter()
        for yy in range(y0, y1 + 1):
            for xx in range(x0, x1 + 1):
                if (xx, yy) in indice_comp:
                    cont[indice_comp[(xx, yy)]] += 1
        if cont:
            return cont.most_common(1)[0][0], "caixa sobre o piso (parcial)"
        # fora do piso: mais próxima
        melhor = None
        for i, m in enumerate(comps4):
            for (px, py) in m:
                d = math.hypot(px + 0.5 - cx, py + 0.5 - cy)
                if melhor is None or d < melhor[0]:
                    melhor = (d, i)
        return melhor[1], f"fora do piso; mais próxima ({melhor[0]:.1f} tiles)"

    nomes_comp = {}
    print()
    for i, m in enumerate(comps4):
        x0, y0, x1, y1 = caixa_tiles(m)
        w, h = x1 - x0 + 1, y1 - y0 + 1
        cabe = w <= TELA_W and h <= TELA_H
        cabe9 = w <= TELA_W and h <= TELA_H - 1
        print(f"Subárea #{i}: caixa {w}x{h} tiles, {len(m)} tiles não vazios, origem ({x0},{y0}) a ({x1},{y1}); "
              f"cabe em 15x10: {'sim' if cabe else 'NÃO'}; cabe em 15x9 (faixa da barra): {'sim' if cabe9 else 'NÃO'}; "
              f"preenchimento da caixa {len(m)/(w*h):.0%}")
    print("\nRótulos de subárea -> componente:")
    for o in rotulos:
        i, como = comp_do_rotulo(o)
        nomes_comp.setdefault(i, []).append(o["texto"])
        print(f"  '{o['texto']}' (obj {o['id']}, centro {fmt((o['x']+o['w']/2)/TAMANHO_TILE_TMX)}, "
              f"{fmt((o['y']+o['h']/2)/TAMANHO_TILE_TMX)} tiles) -> subárea #{i} [{como}]")
    sem_nome = [i for i in range(len(comps4)) if i not in nomes_comp]
    print(f"Subáreas sem rótulo: {sem_nome if sem_nome else 'nenhuma'}")
    dup = {i: n for i, n in nomes_comp.items() if len(n) > 1}
    print(f"Subáreas com mais de um rótulo: {dup if dup else 'nenhuma'}")

    # --- 2. Portas ---
    print("\n=== 2. Portas (grupo 'Portas') ===")
    marcas = [o for o in grupos.get("Portas", []) if o["texto"] and o["texto"].startswith("P")]
    sem_texto = [o for o in grupos.get("Portas", []) if not o["texto"]]
    pares = defaultdict(list)
    for o in marcas:
        pares[o["texto"]].append(o)
    t = TAMANHO_TILE_TMX
    for nome in sorted(pares, key=lambda s: int(s[1:])):
        lista = pares[nome]
        partes = []
        for o in lista:
            i, como = comp_do_rotulo(o)
            cx, cy = (o["x"] + o["w"] / 2) / t, (o["y"] + o["h"] / 2) / t
            partes.append(f"obj {o['id']} centro ({fmt(cx)},{fmt(cy)}) -> subárea #{i} [{como}]")
        if len(lista) == 2:
            a = comp_do_rotulo(lista[0])[0]
            b = comp_do_rotulo(lista[1])[0]
            ligacao = "liga subáreas diferentes" if a != b else "AMBÍGUO: os dois lados caem na mesma subárea"
        else:
            ligacao = f"SEM PAR ({len(lista)} marca)"
        print(f"{nome}: {ligacao}")
        for p in partes:
            print(f"    {p}")
    print("Objetos de porta sem rótulo P (retângulos finos, possível batente/vão):")
    for o in sem_texto:
        cx, cy = (o["x"] + o["w"] / 2) / t, (o["y"] + o["h"] / 2) / t
        mais_perto, dist = None, None
        for m in marcas:
            mx, my = (m["x"] + m["w"] / 2) / t, (m["y"] + m["h"] / 2) / t
            d = math.hypot(mx - cx, my - cy)
            if dist is None or d < dist:
                dist, mais_perto = d, m["texto"]
        print(f"    obj {o['id']}: caixa {fmt(o['x']/t)},{fmt(o['y']/t)} a {fmt((o['x']+o['w'])/t)},{fmt((o['y']+o['h'])/t)} "
              f"({fmt(o['w']/t)}x{fmt(o['h']/t)} tiles, rot {o['rot']:g}); marca mais próxima: {mais_perto} a {fmt(dist)} tiles")

    # --- 3. Bloqueantes ---
    print("\n=== 3. Objetos bloqueantes (grupo 'Objetos da casa bloqueantes') ===")
    bloq = grupos.get("Objetos da casa bloqueantes", [])
    print(f"Total: {len(bloq)} objetos ({sum(1 for o in bloq if o['texto'])} com nome de móvel; o nome é só rótulo)")
    ocupado_bloq = {}
    rets = {}
    for o in bloq:
        ret = retangulo_em_tiles(o)
        rets[o["id"]] = ret
        x0, y0, x1, y1 = ret
        tiles_cob = []
        borda = 0
        for ty in range(math.floor(y0), math.ceil(y1)):
            for tx in range(math.floor(x0), math.ceil(x1)):
                a = area_sobreposta(ret, tx, ty)
                if a <= 0:
                    continue
                if a >= 0.5:
                    tiles_cob.append((tx, ty))
                if 0.1 < a < 0.9:
                    borda += 1
        for p in tiles_cob:
            ocupado_bloq.setdefault(p, []).append(o["id"])
        rot = f", rot {o['rot']:g}" if o["rot"] else ""
        nome = f" '{o['texto']}'" if o["texto"] else ""
        em_piso = sum(1 for p in tiles_cob if p in piso)
        fora = len(tiles_cob) - em_piso
        print(f"  obj {o['id']}{nome}: caixa real ({fmt(x0)},{fmt(y0)}) a ({fmt(x1)},{fmt(y1)}) tiles, "
              f"{fmt(x1-x0)}x{fmt(y1-y0)}{rot}; tiles bloqueados (>=50%): {len(tiles_cob)}, "
              f"dos quais sobre piso: {em_piso}, fora do piso: {fora}; tiles de borda: {borda}")
    # comparação de regras de bloqueio (centro, >=50% da área, qualquer sobreposição)
    print("Regras de bloqueio por objeto (tiles bloqueados): centro | >=50% | qualquer sobreposição")
    for o in bloq:
        ret = rets[o["id"]]
        x0, y0, x1, y1 = ret
        c_centro = c_meio = c_qualquer = 0
        for ty in range(math.floor(y0), math.ceil(y1)):
            for tx in range(math.floor(x0), math.ceil(x1)):
                a = area_sobreposta(ret, tx, ty)
                if a > 0:
                    c_qualquer += 1
                if a >= 0.5:
                    c_meio += 1
                if x0 <= tx + 0.5 <= x1 and y0 <= ty + 0.5 <= y1:
                    c_centro += 1
        nome = f" '{o['texto']}'" if o["texto"] else ""
        print(f"  obj {o['id']}{nome}: {c_centro} | {c_meio} | {c_qualquer}")

    # --- 2b. Vazio entre subáreas: passagens e distância ---
    print("\n=== 2b. Vazio entre subáreas ===")
    print("Células sem piso que tocam duas subáreas (4-vizinhança):")
    cand = defaultdict(list)
    for yy in range(min(ys) - 2, max(ys) + 3):
        for xx in range(min(xs) - 2, max(xs) + 3):
            if (xx, yy) in piso:
                continue
            viz = {indice_comp[q] for q in [(xx - 1, yy), (xx + 1, yy), (xx, yy - 1), (xx, yy + 1)] if q in indice_comp}
            for a in viz:
                for b in viz:
                    if a < b:
                        cand[(a, b)].append((xx, yy))
    for (a, b), celulas in sorted(cand.items()):
        print(f"  #{a} <-> #{b}: {celulas}")
    print("Distância de Chebyshev mínima entre subáreas (tiles de vazio entre elas = distância - 1):")
    for a in range(len(comps4)):
        for b in range(a + 1, len(comps4)):
            melhor = min(max(abs(p[0] - q[0]), abs(p[1] - q[1])) for p in comps4[a] for q in comps4[b])
            print(f"  #{a} x #{b}: {melhor}")

    # sobreposições entre bloqueantes
    pares_sobre = []
    for i, a in enumerate(bloq):
        for b in bloq[i + 1:]:
            ra, rb = rets[a["id"]], rets[b["id"]]
            ix = max(0.0, min(ra[2], rb[2]) - max(ra[0], rb[0]))
            iy = max(0.0, min(ra[3], rb[3]) - max(ra[1], rb[1]))
            if ix * iy > 0.01:
                pares_sobre.append((a["id"], b["id"], round(ix * iy, 2)))
    print(f"Sobreposições entre bloqueantes (área > 0,01 tile): {pares_sobre if pares_sobre else 'nenhuma'}")

    # bloqueante que cobre marca de porta
    for o in marcas:
        cx, cy = (o["x"] + o["w"] / 2) / t, (o["y"] + o["h"] / 2) / t
        for b in bloq:
            ra = rets[b["id"]]
            if ra[0] <= cx <= ra[2] and ra[1] <= cy <= ra[3]:
                print(f"AVISO: marca {o['texto']} (obj {o['id']}) cai dentro do bloqueante {b['id']}")

    # --- 4. Resumo de contagens ---
    print("\n=== 4. Resumo ===")
    print(f"Subáreas: {len(comps4)} (com rótulo: {len(nomes_comp)}; sem rótulo: {len(sem_nome)})")
    print(f"Portas: {len(pares)} pares/marcas nomeadas; marcas: {len(marcas)}; retângulos sem nome: {len(sem_texto)}")
    print(f"Bloqueantes: {len(bloq)}; rótulos de móvel: {sum(1 for o in bloq if o['texto'])}")

    if mostrar_ascii:
        print("\n=== Mapa ASCII (letra = subárea; '#' = bloqueio (>=50%) sobre piso; '!' = bloqueio (>=50%) fora do piso; "
              "dígito = marca de porta P1..P8; '.' = vazio) ===")
        todos = list(piso.keys()) + list(ocupado_bloq.keys())
        for o in marcas:
            todos.append((math.floor((o["x"] + o["w"] / 2) / t), math.floor((o["y"] + o["h"] / 2) / t)))
        xa, xb = min(p[0] for p in todos), max(p[0] for p in todos)
        ya, yb = min(p[1] for p in todos), max(p[1] for p in todos)
        letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        mapa_marcas = {}
        for o in marcas:
            cel = (math.floor((o["x"] + o["w"] / 2) / t), math.floor((o["y"] + o["h"] / 2) / t))
            mapa_marcas[cel] = o["texto"][1:]
        legenda = {}
        for yy in range(ya, yb + 1):
            linha = []
            for xx in range(xa, xb + 1):
                p = (xx, yy)
                if p in mapa_marcas:
                    linha.append(mapa_marcas[p])
                elif p in ocupado_bloq and p in piso:
                    linha.append("#")
                elif p in ocupado_bloq:
                    linha.append("!")
                elif p in indice_comp:
                    linha.append(letras[indice_comp[p] % 26])
                else:
                    linha.append(".")
            print(f"{yy:>4} " + "".join(linha))
        print("     " + "".join(str(abs(x) % 10) for x in range(xa, xb + 1)))
        print(f"colunas x de {xa} a {xb}; linhas y de {ya} a {yb}")
        for i in range(len(comps4)):
            print(f"  {letras[i % 26]} = subárea #{i} ({', '.join(nomes_comp.get(i, ['sem rótulo']))})")


if __name__ == "__main__":
    main()
