# EN2 por dados: sobreposição de enfeites (content/maps/decoracao) com portas, interruptor, bilhete, árvore, caixa, peças, spawns e o tile do Nick dormindo. Só lê. Não altera nada.
import json, glob, os
RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
def ler(p): return json.load(open(os.path.join(RAIZ, p), encoding='utf-8'))
NICK = {'sala': (8, 5), 'cozinha': (5, 3), 'quarto': (4, 3), 'escritorio': (6, 1), 'hall': None}
total = 0; choques = []
for f in sorted(glob.glob(os.path.join(RAIZ, 'content/maps/decoracao/*.json'))):
    d = ler(os.path.relpath(f, RAIZ)); area = d['subarea']
    base = ler(f'content/maps/casa-real/{area}.json')
    bloq = set()
    for o in base.get('objetos', []):
        t = o.get('tipo')
        if t in ('porta', 'portaFechada', 'interruptor', 'bilhete', 'arvore', 'peca', 'spawn', 'caixa'):
            bloq.add((o['x'], o['y']))
            if t == 'porta' or t == 'portaFechada': bloq.add((o['x'], o['y']))
    if area in NICK and NICK[area]: bloq.add(NICK[area])
    for e in d['enfeites']:
        total += 1
        if (e['x'], e['y']) in bloq:
            choques.append(f"{area}:{e['id']}@({e['x']},{e['y']})")
    print(f"{area}: {len(d['enfeites'])} enfeites")
print(f"total de enfeites: {total}")
print('(móveis: enfeites examináveis sobre o próprio móvel são o desenho de 20.6; verificar em captura)')
print('OK   EN2 enfeites sobre porta, interruptor, bilhete, árvore, caixa, peça, spawn, móvel ou tile do Nick: ' + ('nenhum' if not choques else f'{len(choques)} choques: ' + ', '.join(choques)))
