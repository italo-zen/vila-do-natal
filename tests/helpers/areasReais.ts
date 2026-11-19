import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Manifest } from '../../src/application/content/Manifest';
import type { MapaDoJogo } from '../../src/application/content/Mapa';
import { interpretarSubarea } from '../../src/application/content/interpretarSubarea';
import type { PerfilDeArte } from '../../src/application/arte/PerfilDeArte';
import { interpretarTextos } from '../../src/application/content/Textos';
import type { EntradaDeConteudo } from '../../src/application/content/validarConteudo';
import { missoesReais } from './missoesReais';

const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');
const ler = (c: string) => JSON.parse(readFileSync(join(CONTENT, c), 'utf-8'));

/**
 * As áreas reais de `content/maps/casa-real` lidas direto, sem `CarregarConteudo`: a forma (schema 3, `paredes`, portas)
 * já existe, mesmo enquanto as peças, a caixa e as coordenadas das missões (itens 164 e 174) ainda não estão na planta nova.
 */
export function areasReais(): { manifesto: Manifest; todos: Map<string, MapaDoJogo> } {
  const manifesto = ler('manifest.json') as Manifest;
  const todos = new Map<string, MapaDoJogo>();
  for (const d of manifesto.maps) todos.set(d.id, interpretarSubarea(ler(d.file), d));
  return { manifesto, todos };
}

/** Entrada completa de `validarConteudo` com o conteúdo real (as missões vêm do disco), sem validar nada. */
export function entradaReal(): EntradaDeConteudo {
  const { manifesto, todos } = areasReais();
  return { manifesto, todos, missoes: missoesReais(), textos: interpretarTextos(ler(manifesto.texts[0].file)), perfil: ler(`art-profiles/${manifesto.artProfile}.json`) as PerfilDeArte };
}
