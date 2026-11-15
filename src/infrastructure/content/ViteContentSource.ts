import type { ContentSource } from '../../application/ports/ContentSource';
import { ContentSourceDeArquivos, normalizarChavesDoGlob } from './ContentSourceDeArquivos';
import { idDoPerfil, perfil } from 'virtual:perfil-de-arte';

/**
 * Conteúdo de `content/` embutido pelo Vite (dev e build de playtest, sem rede).
 * Os perfis de arte ficam fora do glob: só o perfil ativo entra, pelo plugin de perfil (ADR-003 seção 10).
 */
const conteudo = import.meta.glob(['../../../content/**/*.json', '!../../../content/art-profiles/**'], {
  eager: true,
  import: 'default',
});

export function criarFonteDoVite(): ContentSource {
  const arquivos = {
    ...normalizarChavesDoGlob(conteudo as Record<string, unknown>),
    [`art-profiles/${idDoPerfil}.json`]: perfil,
  };
  return new ContentSourceDeArquivos(arquivos);
}
