"""Auxiliar dos testes do conversor: monta TMX mínimos (ADR-011 seção 8)."""
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
import tmx_para_conteudo as c  # noqa: E402

GIDS = {"a": 34, "b": 38, "c": 258, "d": 358, "e": 4}


def _props(props):
    if not props:
        return ""
    itens = []
    for k, v in props.items():
        if isinstance(v, bool):
            itens.append(f'<property name="{k}" type="bool" value="{"true" if v else "false"}"/>')
        else:
            itens.append(f'<property name="{k}" value="{v}"/>')
    return "<properties>" + "".join(itens) + "</properties>"


def construir_tmx(grade, rotulos, muros=(), portas=(), jogo=(), bloq=(), T=32):
    """grade: linhas de texto (letra = gid de GIDS, '.' = vazio). rotulos: (tx, ty, id[, escuro]).
    muros: (x, y, w, h[, rotacao]) em px. portas: (px, py[, props]) em px. jogo: dict com classe, tx, ty, props,
    texto, nome. bloq: (x, y, w, h[, texto])."""
    larg, alt = len(grade[0]), len(grade)
    linhas = []
    for linha in grade:
        linhas.append(",".join(str(GIDS.get(ch, 0)) for ch in linha))
    csv = ",\n".join(linhas)
    o = [f'<?xml version="1.0" encoding="UTF-8"?>',
         f'<map version="1.10" orientation="orthogonal" width="{larg}" height="{alt}" tilewidth="{T}" tileheight="{T}" '
         f'infinite="1" nextlayerid="9" nextobjectid="999">',
         f' <tileset firstgid="1" name="tiles_casa" tilewidth="{T}" tileheight="{T}" tilecount="544" columns="32">'
         f'<image source="x.png" width="1024" height="544"/></tileset>',
         f' <layer id="1" name="Pisos" width="{larg}" height="{alt}"><data encoding="csv">'
         f'<chunk x="0" y="0" width="{larg}" height="{alt}">\n{csv}\n</chunk></data></layer>']
    n = 1
    o.append(' <objectgroup id="2" name="Rótulos das subáreas">')
    for r in rotulos:
        tx, ty, ident = r[0], r[1], r[2]
        escuro = r[3] if len(r) > 3 else False
        o.append(f'  <object id="{n}" x="{tx * T + 4}" y="{ty * T + 4}" width="{T - 8}" height="{T - 8}">'
                 f'{_props({"id": ident, "escuro": escuro})}<text>{ident}</text></object>')
        n += 1
    o.append(' </objectgroup>')
    o.append(' <objectgroup id="3" name="muros">')
    for m in muros:
        rot = f' rotation="{m[4]}"' if len(m) > 4 else ""
        o.append(f'  <object id="{n}" x="{m[0]}" y="{m[1]}" width="{m[2]}" height="{m[3]}"{rot}/>')
        n += 1
    o.append(' </objectgroup>')
    o.append(' <objectgroup id="4" name="Portas">')
    for p in portas:
        props = p[2] if len(p) > 2 else None
        o.append(f'  <object id="{n}" x="{p[0]}" y="{p[1]}">{_props(props)}<point/></object>')
        n += 1
    o.append(' </objectgroup>')
    if bloq:
        o.append(' <objectgroup id="5" name="Objetos da casa bloqueantes">')
        for b in bloq:
            txt = f"<text>{b[4]}</text>" if len(b) > 4 else ""
            o.append(f'  <object id="{n}" x="{b[0]}" y="{b[1]}" width="{b[2]}" height="{b[3]}">{txt}</object>')
            n += 1
        o.append(' </objectgroup>')
    o.append(' <objectgroup id="6" name="Objetos de jogo">')
    for j in jogo:
        tx, ty = j["tx"], j["ty"]
        nome = f' name="{j["nome"]}"' if j.get("nome") else ""
        txt = f'<text>{j["texto"]}</text>' if j.get("texto") else ""
        o.append(f'  <object id="{n}"{nome} class="{j["classe"]}" x="{tx * T + 4}" y="{ty * T + 4}" '
                 f'width="{T - 8}" height="{T - 8}">{_props(j.get("props"))}{txt}</object>')
        n += 1
    o.append(' </objectgroup>')
    o.append('</map>')
    return "\n".join(o) + "\n"


def converter_texto(tmx, girar=False):
    """Roda o conversor sobre um TMX em texto. Retorna (resultado ou None, coletor)."""
    with tempfile.TemporaryDirectory() as d:
        caminho = Path(d) / "t.tmx"
        caminho.write_text(tmx, encoding="utf-8")
        col = c.Coletor("t.tmx")
        res = c.converter(caminho, c.carregar_perfil("hd-480x352"), col, girar)
    return res, col


def codigos(col):
    """Códigos de erro (E0xx) e de aviso (W0xx) emitidos."""
    erros = [e.split()[1] for e in col.erros]
    avisos = [a[0] for a in col.avisos]
    return erros, avisos


def area(res, ident):
    return next(s for s in res["subareas"] if s["id"] == ident)
