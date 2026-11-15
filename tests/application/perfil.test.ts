import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { validarPerfilDeArte } from '../../src/application/arte/validarPerfilDeArte';
import { validarSprites, validarCoresDosSobrinhos } from '../../src/application/arte/SpritesDoPerfil';
import { geometriaDoSobrinho } from '../../src/application/mundo/movimento';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';

const RAIZ = join(__dirname, '..', '..');
const lerV1 = () => JSON.parse(readFileSync(join(RAIZ, 'content', 'art-profiles', 'gba-240x160.json'), 'utf-8')) as PerfilDeArte;
const lerSprites = () => JSON.parse(readFileSync(join(RAIZ, 'assets', 'gba-240x160', 'sprites.json'), 'utf-8'));

/** Copia do perfil v1 para alterar um campo por teste. */
const copia = () => JSON.parse(JSON.stringify(lerV1())) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

describe('perfil de arte v1 (ADR-003 seção 1)', () => {
  it('o perfil gba-240x160 do repositório é válido', () => {
    const r = validarPerfilDeArte(lerV1(), 'gba-240x160');
    expect(r.ok).toBe(true);
  });

  it('a resolução base sai de sala × tile: 15×16 por 10×16 = 240×160', () => {
    const p = lerV1();
    expect(p.sala.colunas * p.tile).toBe(240);
    expect(p.sala.linhas * p.tile).toBe(160);
  });

  it('a geometria do Sobrinho bate com o movimento do v1: caixa dos pés (2, 16, 12, 8)', () => {
    const g = geometriaDoSobrinho(lerV1());
    expect(g.pes).toEqual({ dx: 2, dy: 16, w: 12, h: 8 });
    expect(g.quadro).toEqual({ w: 16, h: 24 });
  });

  it('recusa id que não bate com o nome do arquivo', () => {
    const r = validarPerfilDeArte(copia(), 'outro');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/não bate com o nome do arquivo/);
  });

  it('recusa schemaVersion mais nova que a suportada', () => {
    const p = copia();
    p.schemaVersion = 2;
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/schemaVersion 2/);
  });

  it('recusa tile, sala e escala mínima fora do que o motor aceita', () => {
    const p = copia();
    p.tile = 0;
    p.sala.colunas = 1.5;
    p.escala.minima = 0;
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join('\n')).toMatch(/tile.*inteiro positivo[\s\S]*sala\.colunas[\s\S]*escala\.minima/);
  });

  it('recusa paleta com mínimo maior que o máximo', () => {
    const p = copia();
    p.paleta = { minimoDeCores: 40, maximoDeCores: 32 };
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/minimoDeCores não pode ser maior/);
  });

  it('recusa fonte cujo corpo ou título não é múltiplo da grade', () => {
    const p = copia();
    p.fonte.corpo = 9;
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/fonte\.corpo \(9\) precisa ser múltiplo de fonte\.grade \(8\)/);
  });

  it('recusa caixa dos pés maior que o quadro', () => {
    const p = copia();
    p.corpos.sobrinho.pes = { w: 20, h: 8 };
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/não cabe dentro do quadro/);
  });

  it('recusa cor fora de #rrggbb e tipo de luz desconhecido', () => {
    const p = copia();
    p.tema.fundo = 'azul';
    p.luz.tipo = 'raytracing';
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/tema\.fundo[\s\S]*luz\.tipo "raytracing" desconhecido/);
  });

  it('recusa objeto que não é perfil', () => {
    expect(validarPerfilDeArte([], 'gba-240x160').ok).toBe(false);
  });
});

describe('sprites.json do v1 (ADR-003 seção 4)', () => {
  it('é válido para o perfil v1', () => {
    expect(validarSprites(lerSprites(), lerV1()).ok).toBe(true);
  });

  it('cobre 34 PNG: 1 tileset, 16 folhas de andar (4 Sobrinhos × 4 direções) e 17 imagens', () => {
    const imagens = (lerSprites() as { imagens: { tipo: string }[] }).imagens;
    expect(imagens.length).toBe(34);
    expect(imagens.filter((i) => i.tipo === 'tileset').length).toBe(1);
    expect(imagens.filter((i) => i.tipo === 'folhas').length).toBe(16);
    expect(imagens.filter((i) => i.tipo === 'imagem').length).toBe(17);
  });

  it('recusa sprites.json de outro perfil', () => {
    const s = lerSprites();
    s.perfil = 'outro';
    const r = validarSprites(s, lerV1());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/é do perfil "outro"/);
  });

  it('recusa tileset cujo quadro não é o tile do perfil', () => {
    const s = lerSprites();
    s.imagens.find((i: { tipo: string }) => i.tipo === 'tileset').quadro = { w: 32, h: 32 };
    const r = validarSprites(s, lerV1());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/tileset com quadro 32 px, mas o tile do perfil é 16/);
  });

  it('recusa folha sem número de quadros e arquivo repetido', () => {
    const s = lerSprites();
    const folha = s.imagens.find((i: { tipo: string }) => i.tipo === 'folhas');
    delete folha.quadros;
    s.imagens.push({ ...s.imagens[0] });
    const r = validarSprites(s, lerV1());
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/precisam de "quadros"[\s\S]*repetido/);
  });

  it('BUG-014-01: corpo do Sobrinho com quadro 99 de largura não bate com as folhas de 16×24 (exit 1 no validar:perfil)', () => {
    const p = copia();
    p.corpos.sobrinho.quadro.w = 99;
    // O perfil sozinho ainda é válido (a caixa dos pés cabe no quadro); o erro aparece na comparação com o sprites.json.
    expect(validarPerfilDeArte(p, 'gba-240x160').ok).toBe(true);
    const r = validarSprites(lerSprites(), p as PerfilDeArte);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/quadro 16×24 do Sobrinho não bate com corpos\.sobrinho\.quadro do perfil \(99×24\)/);
  });
});

describe('cores mínimas por sprite de sobrinho (validar:perfil)', () => {
  it('os dois perfis declaram sprites.sobrinho.coresMin = 16 e são válidos', async () => {
    const hd = JSON.parse(readFileSync(join(RAIZ, 'content', 'art-profiles', 'hd-480x352.json'), 'utf-8')) as PerfilDeArte;
    expect(hd.sprites.sobrinho.coresMin).toBe(16);
    expect(lerV1().sprites.sobrinho.coresMin).toBe(16);
    expect(validarPerfilDeArte(hd, 'hd-480x352').ok).toBe(true);
  });

  it('perfil sem sprites.sobrinho.coresMin é erro', () => {
    const p = copia();
    delete p.sprites;
    const r = validarPerfilDeArte(p, 'gba-240x160');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.erros.join(' ')).toMatch(/sprites\.sobrinho\.coresMin precisa ser inteiro/);
  });

  it('sprite de sobrinho com 4 cores falha; de 16 passa; sprite que não é de sobrinho não conta', () => {
    const p = lerV1();
    expect(validarCoresDosSobrinhos({ 'spr_lolo_idle.png': 4 }, p)).toHaveLength(1);
    expect(validarCoresDosSobrinhos({ 'spr_tutu_walk_left.png': 15 }, p)[0]).toMatch(/15 cores; o mínimo por sprite de sobrinho é 16/);
    expect(validarCoresDosSobrinhos({ 'spr_lolo_idle.png': 16, 'spr_bibi_walk_up.png': 32 }, p)).toEqual([]);
    expect(validarCoresDosSobrinhos({ 'spr_bilhete.png': 4, 'tiles_casa.png': 2 }, p)).toEqual([]);
  });
});
