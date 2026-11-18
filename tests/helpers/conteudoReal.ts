import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CarregarConteudo, ConteudoInvalidoError, type Conteudo } from '../../src/application/usecases/CarregarConteudo';
import { ContentSourceDeArquivos } from '../../src/infrastructure/content/ContentSourceDeArquivos';

/** Todo o content/ do disco, com as chaves relativas a content/ (mesma forma que a build embute). */
const CONTENT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', 'content');

function lerBruto(): Record<string, unknown> {
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

/** A decoração do modo explorar (ADR-010) ainda é da planta antiga? (item 175 da Arte). Medido uma vez, ao importar. */
async function decoracaoEstaVigente(): Promise<boolean> {
  try {
    await new CarregarConteudo(new ContentSourceDeArquivos(lerBruto())).executar();
    return true;
  } catch (e) {
    if (e instanceof ConteudoInvalidoError && e.erros.every((x) => /^E\d/.test(x))) return false;
    return true; // outro erro: não é da decoração, e quem carregar vai ver
  }
}
export const decoracaoVigente = await decoracaoEstaVigente();

/**
 * Todo o content/ do disco, com as chaves relativas a content/ (mesma forma que a build embute). Enquanto a decoração
 * reprova (item 175), as tabelas saem do manifesto: o motor, as missões e as áreas não dependem delas.
 */
export function lerConteudoDoDisco(): Record<string, unknown> {
  const out = lerBruto();
  if (!decoracaoVigente) {
    const m = JSON.parse(JSON.stringify(out['manifest.json'])) as { maps: { decoracao?: string }[] };
    for (const x of m.maps) delete x.decoracao;
    out['manifest.json'] = m;
  }
  return out;
}

/** Conteúdo real já carregado e validado (CarregarConteudo, como a build). */
export async function carregarConteudoReal(): Promise<Conteudo> {
  return new CarregarConteudo(new ContentSourceDeArquivos(lerConteudoDoDisco())).executar();
}
