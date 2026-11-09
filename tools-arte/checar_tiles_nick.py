#!/usr/bin/env python3
"""
Tiles de dormir do Nick (GDD 16.2.1; backlog 074): candidatos e conferência por cômodo aberto.

Lê content/maps/casa-real/<cômodo>.json (formato do conversor, docs/conversor-tmx.md) e content/missions/*.json.
Para cada cômodo: desenha o mapa em ASCII e lista os tiles que passam nos critérios de 16.2.1 e 074:
  1. piso livre (chão e colisão 0);
  2. pelo menos 2 vizinhos livres (4 vizinhos), nenhum deles tile de peça;
  3. fora da última linha da tela (14.8): a barra ocupa as linhas 9 e 10 da tela, e o cômodo é centralizado;
  4. fora de gatilho de porta, chegada (spawn), vão, interruptor, árvore, peça, bilhete, móvel e examinável;
  5. sem bloquear passagem: com o tile bloqueado, todos os pontos essenciais (chegadas, gatilhos, peças,
     interruptor e árvore) continuam alcançáveis a partir da chegada (N14, pior caso). Um beco sem objeto pode
     ficar isolado: não é passagem;
  6. fora da rota de condução do cômodo: a rota até o destino da condução (3,7) na Sala não muda de tamanho.

Uso (só biblioteca padrão):
  python3 -I tools-arte/checar_tiles_nick.py                # mapas e candidatos
  python3 -I tools-arte/checar_tiles_nick.py --escolhido sala:8,5 cozinha:4,4 quarto:2,4 escritorio:4,3

Saída: texto em português. Código 1 se algum tile escolhido falhar em algum critério.
"""
import argparse
import json
from collections import deque
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MAPAS = RAIZ / "content" / "maps" / "casa-real"
MISSOES = RAIZ / "content" / "missions"
TELA_LINHAS = 11          # perfil hd-480x352: 15×11 tiles; a barra ocupa as linhas 9 e 10 (GDD 16.9)
LINHAS_DA_BARRA = (9, 10)

# Cômodos abertos no Marco 3 (GDD 16.1). A Cozinha e a Lavanderia são uma subárea só (Cozinha e Lavanderia, 15.3).
COMODOS = {"sala": "sala", "cozinha": "cozinha", "quarto": "quarto", "escritorio": "escritorio"}


def carregar_mapa(nome):
    return json.loads((MAPAS / f"{nome}.json").read_text(encoding="utf-8"))


def carregar_missoes():
    return [json.loads(p.read_text(encoding="utf-8")) for p in sorted(MISSOES.glob("*.json"))]


def indice(mapa, x, y):
    return y * mapa["largura"] + x


def dentro(mapa, x, y):
    return 0 <= x < mapa["largura"] and 0 <= y < mapa["altura"]


def tiles_de_objetos(mapa):
    """Tiles ocupados por cada tipo de objeto da subárea (gatilho, chegada, interruptor, árvore, peça, etc.)."""
    marcas = {}
    for o in mapa["objetos"]:
        t = o["tipo"]
        if t == "movel":
            for j in range(o.get("h", 1)):
                for i in range(o.get("w", 1)):
                    marcas.setdefault((o["x"] + i, o["y"] + j), set()).add("móvel")
        elif t in ("porta", "portaFechada"):
            marcas.setdefault((o["x"], o["y"]), set()).add("gatilho" if t == "porta" else "porta fechada")
        elif t == "spawn":
            marcas.setdefault((o["x"], o["y"]), set()).add("chegada")
        else:
            rotulo = {"interruptor": "interruptor", "arvore": "árvore", "peca": "peça", "bilhete": "bilhete",
                      "examinavel": "examinável"}.get(t, t)
            marcas.setdefault((o["x"], o["y"]), set()).add(rotulo)
    return marcas


def livre_de_bloqueio(mapa, x, y):
    """Piso andável sem bloqueio de colisão (o chão 0 é vazio, fora da casa)."""
    return dentro(mapa, x, y) and mapa["chao"][indice(mapa, x, y)] != 0 and mapa["colisao"][indice(mapa, x, y)] == 0


def vizinhos4(x, y):
    return [(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)]


def deslocamento_da_tela(mapa):
    """Centralização do cômodo na tela (ADR-004; subárea menor que a tela é centralizada)."""
    return (TELA_LINHAS - mapa["altura"]) // 2 if mapa["altura"] < TELA_LINHAS else 0


def caminho_mais_curto(mapa, origem, destino, bloqueado=frozenset()):
    if origem == destino:
        return 0
    fila = deque([(origem, 0)])
    visto = {origem}
    while fila:
        (x, y), d = fila.popleft()
        for nx, ny in vizinhos4(x, y):
            if (nx, ny) in visto or (nx, ny) in bloqueado or not livre_de_bloqueio(mapa, nx, ny):
                continue
            if (nx, ny) == destino:
                return d + 1
            visto.add((nx, ny))
            fila.append(((nx, ny), d + 1))
    return None


def pontos_essenciais(mapa):
    """Pontos que a passagem precisa alcançar: chegadas, gatilhos de porta, peças, interruptor e árvore."""
    return [(o["x"], o["y"]) for o in mapa["objetos"] if o["tipo"] in ("spawn", "porta", "peca", "interruptor", "arvore")]


def alcancaveis(mapa, origem, bloqueado):
    """Piso livre alcançável a partir de `origem`, sem passar pelos bloqueados."""
    visto = {origem}
    fila = deque([origem])
    while fila:
        x, y = fila.popleft()
        for nx, ny in vizinhos4(x, y):
            if (nx, ny) not in visto and (nx, ny) not in bloqueado and livre_de_bloqueio(mapa, nx, ny):
                visto.add((nx, ny))
                fila.append((nx, ny))
    return visto


def essenciais_seguem_alcancaveis(mapa, bloqueado):
    """Com `bloqueado`, cada ponto essencial ainda é alcançável (pelo próprio tile ou por um vizinho livre)."""
    spawns = [(o["x"], o["y"]) for o in mapa["objetos"] if o["tipo"] == "spawn"]
    if not spawns:
        return True
    origem = spawns[0]
    if not livre_de_bloqueio(mapa, *origem) or origem in bloqueado:
        return False
    visto = alcancaveis(mapa, origem, frozenset(bloqueado))
    for ponto in pontos_essenciais(mapa):
        if ponto in bloqueado:
            continue
        if ponto in visto or any(v in visto for v in vizinhos4(*ponto)):
            continue
        return False
    return True


def candidatos(nome, mapa):
    marcas = tiles_de_objetos(mapa)
    pecas = {(o["x"], o["y"]) for o in mapa["objetos"] if o["tipo"] == "peca"}
    desloc = deslocamento_da_tela(mapa)
    resultado = []
    for y in range(mapa["altura"]):
        for x in range(mapa["largura"]):
            if not livre_de_bloqueio(mapa, x, y):
                continue
            if (x, y) in marcas:
                continue
            if any(vz in pecas for vz in vizinhos4(x, y)):
                continue
            livres = [v for v in vizinhos4(x, y) if livre_de_bloqueio(mapa, *v)]
            if len(livres) < 2 or any(v in pecas for v in livres):
                continue
            if y + desloc in LINHAS_DA_BARRA or y + desloc >= TELA_LINHAS - 1:
                continue
            resultado.append((x, y))
    return resultado


def checar(nome, mapa, tile, missoes):
    """Confere os critérios 1 a 6 para um tile escolhido. Devolve a lista de falhas (vazia = passou)."""
    falhas = []
    x, y = tile
    marcas = tiles_de_objetos(mapa)
    if not livre_de_bloqueio(mapa, x, y):
        falhas.append("não é piso livre (chão e colisão 0)")
    if (x, y) in marcas:
        falhas.append(f"ocupado por: {', '.join(sorted(marcas[(x, y)]))}")
    livres = [v for v in vizinhos4(x, y) if livre_de_bloqueio(mapa, *v)]
    pecas = {(o["x"], o["y"]) for o in mapa["objetos"] if o["tipo"] == "peca"}
    if len(livres) < 2:
        falhas.append(f"só {len(livres)} vizinho(s) livre(s); mínimo 2")
    if any(v in pecas for v in livres):
        falhas.append("vizinho é tile de peça")
    desloc = deslocamento_da_tela(mapa)
    if y + desloc in LINHAS_DA_BARRA or y + desloc >= TELA_LINHAS - 1:
        falhas.append(f"na linha {y + desloc} da tela (barra)")
    if not essenciais_seguem_alcancaveis(mapa, frozenset()):
        falhas.append("o cômodo já não alcança todos os pontos essenciais sem o Nick (verificar o mapa)")
    elif not essenciais_seguem_alcancaveis(mapa, frozenset({(x, y)})):
        falhas.append("o bloqueio corta a passagem até um ponto essencial (chegada, porta, peça, interruptor ou árvore)")
    # Critério 6: a rota até o destino da condução na Sala não pode ficar mais longa com o tile bloqueado.
    if nome == "sala":
        destinos = {(c["x"], c["y"]) for m in missoes for c in m.get("conducao", {}).values() if c.get("mapa") == "sala"}
        for destino in sorted(destinos):
            for ponto in pontos_essenciais(mapa):
                if ponto in (destino, (x, y)) or not livre_de_bloqueio(mapa, *ponto):
                    continue
                antes = caminho_mais_curto(mapa, ponto, destino)
                depois = caminho_mais_curto(mapa, ponto, destino, frozenset({(x, y)}))
                if antes is not None and (depois is None or depois > antes):
                    falhas.append(f"rota {ponto}->{destino} vai de {antes} para {depois} com o tile bloqueado")
    return falhas


def desenhar(nome, mapa, escolhido=None, candidatos_=()):
    marcas = tiles_de_objetos(mapa)
    linhas = []
    for y in range(mapa["altura"]):
        linha = []
        for x in range(mapa["largura"]):
            if (x, y) == escolhido:
                c = "N"
            elif (x, y) in marcas:
                rot = marcas[(x, y)]
                c = ("P" if "gatilho" in rot else "x" if "porta fechada" in rot else "S" if "chegada" in rot
                     else "I" if "interruptor" in rot else "A" if "árvore" in rot else "p" if "peça" in rot
                     else "b" if "bilhete" in rot else "m" if "móvel" in rot else "?")
            elif (x, y) in candidatos_:
                c = "*"
            elif not livre_de_bloqueio(mapa, x, y):
                c = "#" if mapa["chao"][indice(mapa, x, y)] != 0 else " "
            else:
                c = "."
            linha.append(c)
        linhas.append(f"  {y:>2} " + "".join(linha))
    cab = "     " + "".join(str(x % 10) for x in range(mapa["largura"]))
    return cab + "\n" + "\n".join(linhas)


def main():
    ap = argparse.ArgumentParser(description="Candidatos e conferência dos tiles de dormir do Nick (GDD 16.2.1, item 074).")
    ap.add_argument("--escolhido", nargs="*", default=[], help="cômodo:x,y para conferir (ex.: sala:8,5)")
    args = ap.parse_args()
    missoes = carregar_missoes()
    escolhidos = {}
    for item in args.escolhido:
        comodo, par = item.split(":")
        x, y = (int(v) for v in par.split(","))
        escolhidos[comodo] = (x, y)

    legenda = ("Legenda: '.' piso livre, '#' bloqueado, ' ' vazio, '*' candidato, 'N' escolhido, "
               "'P' gatilho de porta, 'x' porta fechada, 'S' chegada, 'I' interruptor, 'A' árvore, 'p' peça, "
               "'b' bilhete, 'm' móvel.")
    print(legenda)
    falhou = False
    for comodo, nome_mapa in COMODOS.items():
        mapa = carregar_mapa(nome_mapa)
        cands = candidatos(comodo, mapa)
        escolhido = escolhidos.get(comodo)
        print(f"\n== {comodo} ({mapa['largura']}×{mapa['altura']} tiles, id {mapa['id']}; centralizado na tela +{deslocamento_da_tela(mapa)} linha(s))")
        print(desenhar(comodo, mapa, escolhido, cands))
        print(f"  candidatos: {len(cands)} -> {cands}")
        if escolhido:
            falhas = checar(comodo, mapa, escolhido, missoes)
            if falhas:
                falhou = True
                print(f"  ESCOLHIDO {escolhido}: REPROVADO")
                for f in falhas:
                    print(f"    - {f}")
            else:
                print(f"  ESCOLHIDO {escolhido}: passa em todos os critérios (1 a 6)")
    return 1 if falhou else 0


if __name__ == "__main__":
    raise SystemExit(main())
