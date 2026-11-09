import { sprites, urls } from 'virtual:perfil-de-arte';

/** Arquivos do perfil de arte ativo, ainda não validados: sprites.json e URLs dos PNG (ADR-003 seção 3). */
export interface ArquivosDoPerfil {
  sprites: unknown;
  urls: Record<string, string>;
}

export function arquivosDoPerfilAtivo(): ArquivosDoPerfil {
  return { sprites, urls };
}
