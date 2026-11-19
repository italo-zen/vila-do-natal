#!/usr/bin/env python3
"""Preview das 9 áreas (planta nova, girada). Uso: /Library/Developer/CommandLineTools/usr/bin/python3 tools-arte/preview_nove_areas.py [saida.png]  (a partir da raiz; usa preview_objetos_164.py)."""
import importlib.util,sys
from PIL import Image,ImageDraw
sp=importlib.util.spec_from_file_location('p','tools-arte/preview_objetos_164.py');p=importlib.util.module_from_spec(sp);sp.loader.exec_module(p)
A=[("sala","Sala (aberta)"),("hall","Hall (aberto)"),("cozinha","Cozinha e Lavanderia (aberta)"),("quarto","Quarto da Oli (aberto)"),("escritorio","Escritório (aberto)"),
("quartinho","Quartinho (FECHADO)"),("quarto_casal","Quarto do casal (FECHADO)"),("banheiro1","Banheiro 1 (FECHADO)"),("banheiro_escritorio","Banheiro do escritório (FECHADO)")]
ims=[p.desenhar(a,t) for a,t in A]
cols=3;cw=max(i.width for i in ims)+20
rows=[ims[i:i+cols] for i in range(0,9,cols)]
rh=[max(i.height for i in r)+20 for r in rows]
out=Image.new("RGB",(cols*cw+20,sum(rh)+70),(255,255,255))
y=10
for r,h in zip(rows,rh):
    for k,i in enumerate(r): out.paste(i,(10+k*cw,y))
    y+=h
ImageDraw.Draw(out).text((10,y+5),"Planta nova, 9 áreas, já girada (o que o motor lê). Preto = parede; azul = porta; ponto cinza = chegada; cinza escuro = bloqueado.\nObjetos de jogo só nas áreas abertas; os decorativos e a arte final ainda não entraram.",fill=(0,0,0),font=p.f(13))
out.save((sys.argv[1] if len(sys.argv)>1 else 'tools-arte/preview/nove-areas.png'));print(out.size)
