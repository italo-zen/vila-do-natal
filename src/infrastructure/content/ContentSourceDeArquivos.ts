import type { ContentSource } from '../../application/ports/ContentSource';

interface ManifestoBruto {
  maps?: Array<{ id: string; file: string }>;
  missions?: Array<{ id: string; file: string }>;
  texts?: Array<{ locale: string; file: string }>;
}

/**
 * Adaptador de ContentSource sobre um dicionário caminho -> JSON (caminhos relativos a `content/`).
 * Em produção o dicionário vem de `import.meta.glob` (embutido na build); nos testes, de arquivos lidos do disco.
 */
export class ContentSourceDeArquivos implements ContentSource {
  constructor(private readonly arquivos: Record<string, unknown>) {}

  private ler(caminho: string): unknown {
    if (!(caminho in this.arquivos)) throw new Error(`Arquivo de conteúdo não encontrado: content/${caminho}`);
    return this.arquivos[caminho];
  }

  private manifestoBruto(): ManifestoBruto {
    return (this.arquivos['manifest.json'] ?? {}) as ManifestoBruto;
  }

  async manifesto(): Promise<unknown> {
    return this.ler('manifest.json');
  }
  async perfilDeArte(id: string): Promise<unknown> {
    const caminho = `art-profiles/${id}.json`;
    if (!(caminho in this.arquivos)) throw new Error(`Perfil de arte "${id}" não encontrado em content/art-profiles/.`);
    return this.arquivos[caminho];
  }
  async mapa(id: string): Promise<unknown> {
    const d = this.manifestoBruto().maps?.find((m) => m.id === id);
    if (!d) throw new Error(`Mapa "${id}" não está no manifesto.`);
    return this.ler(d.file);
  }
  async textos(locale: string): Promise<unknown> {
    const d = this.manifestoBruto().texts?.find((t) => t.locale === locale);
    if (!d) throw new Error(`Textos "${locale}" não estão no manifesto.`);
    return this.ler(d.file);
  }
  async missao(id: string): Promise<unknown> {
    const d = this.manifestoBruto().missions?.find((m) => m.id === id);
    if (!d) throw new Error(`Missão "${id}" não está no manifesto.`);
    return this.ler(d.file);
  }
}

/** Converte chaves do glob ("../../../content/maps/casa.json") em caminhos relativos a content/. */
export function normalizarChavesDoGlob(glob: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(glob)) {
    const i = k.lastIndexOf('content/');
    out[i >= 0 ? k.slice(i + 'content/'.length) : k] = v;
  }
  return out;
}
