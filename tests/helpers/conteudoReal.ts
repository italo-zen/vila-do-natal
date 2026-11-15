import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CarregarConteudo, type Conteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';

/** Todo o content/ do disco, com as chaves relativas a content/ (mesma forma que a build embute). */
const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');

export function lerConteudoDoDisco(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const varrer = (dir: string) => {
    for (const nome of readdirSync(dir)) {
      const cam = join(dir, nome);
      if (statSync(cam).isDirectory()) varrer(cam);
      else if (nome.endsWith('.json')) out[relative(CONTENT, cam).split('\\').join('/')] = JSON.parse(readFileSync(cam, 'utf-8'));
    }
  };
  varrer(CONTENT);
  return out;
}

/** Conteúdo real já carregado e validado (CarregarConteudo, como a build). */
export async function carregarConteudoReal(): Promise<Conteudo> {
  return new CarregarConteudo(new ContentSourceDeArquivos(lerConteudoDoDisco())).executar();
}
