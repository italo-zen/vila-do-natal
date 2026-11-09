import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validarPerfilDeArte } from '../../src/application/arte/validarPerfilDeArte';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

/**
 * Perfil de teste "2× do v1" (ADR-003 seção 11): dobra as medidas em px do v1. Só para desenvolvimento e
 * teste; nunca publicado. Com a casa real no perfil HD, o percurso no mapa 2× não se aplica mais: o
 * percurso da casa real está em casa-real.test.ts.
 */
const v1: PerfilDeArte = JSON.parse(readFileSync(join(__dirname, '..', '..', 'content', 'art-profiles', 'gba-240x160.json'), 'utf-8'));

function dobrar(p: PerfilDeArte): PerfilDeArte {
  const d = JSON.parse(JSON.stringify(p)) as PerfilDeArte;
  const x2 = (n: number) => n * 2;
  d.id = 'gba-2x-teste';
  d.tile = x2(d.tile);
  d.fonte.corpo = x2(d.fonte.corpo);
  d.fonte.titulo = x2(d.fonte.titulo);
  d.fonte.entrelinhas = x2(d.fonte.entrelinhas);
  d.fonte.entrelinhasFina = x2(d.fonte.entrelinhasFina);
  d.espaco = { pequeno: x2(d.espaco.pequeno), medio: x2(d.espaco.medio), grande: x2(d.espaco.grande) };
  d.barra.margemLateral = x2(d.barra.margemLateral);
  d.barra.margemInferior = x2(d.barra.margemInferior);
  d.barra.entreLinhas = x2(d.barra.entreLinhas);
  d.barra.alturaPorLinhas = { '1': x2(d.barra.alturaPorLinhas['1']), '2': x2(d.barra.alturaPorLinhas['2']) };
  d.dialogo = { ...d.dialogo, altura: x2(d.dialogo.altura), borda: x2(d.dialogo.borda), seta: { largura: x2(d.dialogo.seta.largura), altura: x2(d.dialogo.seta.altura), deTopo: x2(d.dialogo.seta.deTopo), recuo: x2(d.dialogo.seta.recuo) } };
  d.luz.passoDegrau = x2(d.luz.passoDegrau);
  d.objetos.halo.margem = x2(d.objetos.halo.margem);
  d.corpos.sobrinho = { quadro: { w: x2(d.corpos.sobrinho.quadro.w), h: x2(d.corpos.sobrinho.quadro.h) }, pes: { w: x2(d.corpos.sobrinho.pes.w), h: x2(d.corpos.sobrinho.pes.h) }, quadrosDeAndar: d.corpos.sobrinho.quadrosDeAndar, fpsAndar: d.corpos.sobrinho.fpsAndar };
  return d;
}

describe('perfil de teste 2× do v1 (ADR-003 seção 11)', () => {
  it('é válido e dobra as medidas em px, com a sala em tiles', () => {
    const d = dobrar(v1);
    expect(validarPerfilDeArte(d, 'gba-2x-teste').ok).toBe(true);
    expect(d.tile).toBe(32);
    expect(d.sala).toEqual(v1.sala);
    expect(d.corpos.sobrinho.quadro).toEqual({ w: 32, h: 48 });
  });
});
