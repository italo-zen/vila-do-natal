import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

/**
 * Plugin do perfil de arte (ADR-003 seções 3, 10 e 11). Lê `content/manifest.json` (campo `artProfile`,
 * padrão gba-240x160) e expõe, no módulo virtual `virtual:perfil-de-arte`, só o perfil ativo, o
 * sprites.json da pasta do perfil e os PNG dessa pasta. Nada de outras pastas entra na build.
 */
const RAIZ = dirname(fileURLToPath(import.meta.url));
const VIRTUAL = 'virtual:perfil-de-arte';
const RESOLVIDO = `\0${VIRTUAL}`;
const PERFIL_PADRAO = 'gba-240x160';

const lerJson = (caminho: string) => JSON.parse(readFileSync(caminho, 'utf-8')) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

export function perfilDeArte(): Plugin {
  return {
    name: 'perfil-de-arte',
    resolveId(id) {
      return id === VIRTUAL ? RESOLVIDO : undefined;
    },
    load(id) {
      if (id !== RESOLVIDO) return undefined;
      const manifesto = lerJson(join(RAIZ, 'content', 'manifest.json'));
      const idPerfil: string = manifesto.artProfile ?? PERFIL_PADRAO;
      const arquivoPerfil = join(RAIZ, 'content', 'art-profiles', `${idPerfil}.json`);
      if (!existsSync(arquivoPerfil)) this.error(`Perfil de arte "${idPerfil}" não encontrado: ${arquivoPerfil}`);
      const perfil = lerJson(arquivoPerfil);
      const pasta = join(RAIZ, perfil.pasta as string);
      const arquivoSprites = join(pasta, 'sprites.json');
      if (!existsSync(arquivoSprites)) this.error(`sprites.json do perfil "${idPerfil}" não encontrado em ${arquivoSprites}`);
      const sprites = lerJson(arquivoSprites);
      this.addWatchFile(arquivoPerfil);
      this.addWatchFile(arquivoSprites);

      const imagens = (sprites.imagens as { arquivo: string }[]) ?? [];
      const importacoes: string[] = [];
      const entradas: string[] = [];
      imagens.forEach((img, i) => {
        const arquivo = join(pasta, img.arquivo);
        if (!existsSync(arquivo)) this.error(`PNG "${img.arquivo}" do perfil "${idPerfil}" não existe em ${pasta}`);
        // Caminho relativo à raiz do projeto: o Vite resolve "/..." a partir da raiz, sem depender do sistema de arquivos.
        const caminho = `/${relative(RAIZ, arquivo).split('\\').join('/')}?url`;
        importacoes.push(`import img${i} from ${JSON.stringify(caminho)};`);
        entradas.push(`  ${JSON.stringify(img.arquivo)}: img${i},`);
      });

      return [
        ...importacoes,
        `export const idDoPerfil = ${JSON.stringify(idPerfil)};`,
        `export const perfil = ${JSON.stringify(perfil)};`,
        `export const sprites = ${JSON.stringify(sprites)};`,
        'export const urls = {',
        ...entradas,
        '};',
      ].join('\n');
    },
  };
}
