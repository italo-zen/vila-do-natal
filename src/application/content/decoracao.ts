/**
 * Enfeites de Natal do modo explorar (ADR-010 3 e 8.2; GDD 20.6). Camada de decoração em `content/maps/decoracao/<subarea>.json`.
 * Função pura: a validação recebe o conteúdo já lido e o contexto da subárea (mapa, missão e textos). Erros em português.
 */

/** Subáreas do modo explorar, na ordem da tabela de 20.6. A Lavanderia é tile da cozinha (GDD 15.3). */
export const SUBAREAS_DA_DECORACAO = ['hall', 'sala', 'cozinha', 'quarto', 'escritorio'] as const;

/** Contagem exata por subárea (GDD 20.6; ADR-010 3.6). Total 25. */
export const QUANTIDADE_DE_ENFEITES: Record<string, number> = { hall: 4, sala: 8, cozinha: 6, quarto: 4, escritorio: 3 };
export const TOTAL_DE_ENFEITES = 25;

/** Chaves de examinar permitidas (ADR-010 3.4; GDD 20.8). Cortina e pano não respondem ao A. */
export const CHAVES_DE_EXAMINAR = ['enfeite.pisca', 'enfeite.vela', 'enfeite.guirlanda', 'enfeite.presente', 'enfeite.meias', 'enfeite.arvore'] as const;
/** Sprites que nunca têm texto de examinar (visuais, ADR-010 3.4). */
export const SPRITES_SEM_EXAMINAR = ['dec_cortina', 'dec_pano'] as const;
/** Sprites que podem piscar: luz e vela, de 2 quadros (ADR-010 3.5). */
export const SPRITES_DE_LUZ = ['dec_luz', 'dec_vela'] as const;

export interface EnfeiteBruto {
  id: string;
  sprite: string;
  x: number;
  y: number;
  pisca: boolean;
  examinar: string | null;
}

export interface DecoracaoBruta {
  schemaVersion: number;
  subarea: string;
  enfeites: EnfeiteBruto[];
}

export interface ContextoDaDecoracao {
  /** Subáreas de `missions[enfeites].maps` (ADR-010 E2). */
  subareasDoModo: readonly string[];
  largura: number;
  altura: number;
  /** Tile bloqueado (parede, móvel): o enfeite pode ser examinável (E5, E6). */
  bloqueado(x: number, y: number): boolean;
  /** Tile proibido para enfeite: spawn, porta, interruptor, bilhete, árvore, caixa, peça, passagem, barra, Nick (ADR-010 3.7). */
  proibido(x: number, y: number): boolean;
  /** Sprites registrados em `sprites.json`, com `quadros` quando for folha. Sem o registro, E7 não confere a existência. */
  sprites?: Record<string, { quadros?: number }>;
  /** Chaves de texto de `content/texts/pt-BR.json` (E9). */
  chavesDeTexto: readonly string[];
}

export interface DecoracaoDaSubarea {
  subarea: string;
  enfeites: EnfeiteBruto[];
}

const CHAVES_DO_ENFEITE = ['id', 'sprite', 'x', 'y', 'pisca', 'examinar'];

/** Valida uma subárea de decoração (E1 a E7 e E9). Devolve os erros; lista vazia é válido. E8 (peso do atlas) fica no `verificar:conteudo`. */
export function validarDecoracao(bruta: unknown, ctx: ContextoDaDecoracao): string[] {
  const erros: string[] = [];
  const d = bruta as Partial<DecoracaoBruta> | null;
  if (!d || typeof d !== 'object') return ['E1: decoração precisa ser um objeto JSON.'];

  // E1: schemaVersion 2 e nenhuma chave desconhecida.
  for (const k of Object.keys(d)) if (!['schemaVersion', 'subarea', 'enfeites'].includes(k)) erros.push(`E1: chave "${k}" não existe na decoração.`);
  if (d.schemaVersion !== 2) erros.push(`E1: schemaVersion precisa ser 2 (encontrou ${d.schemaVersion}).`);
  const subarea = String(d.subarea ?? '');
  const lista = Array.isArray(d.enfeites) ? d.enfeites : [];
  if (!Array.isArray(d.enfeites)) erros.push('E1: "enfeites" precisa ser uma lista.');

  // E2: subárea conhecida e dentro do modo explorar (EX3).
  if (!(SUBAREAS_DA_DECORACAO as readonly string[]).includes(subarea)) erros.push(`E2: subárea "${subarea}" não é do modo explorar.`);
  else if (!ctx.subareasDoModo.includes(subarea)) erros.push(`E2: subárea "${subarea}" não está em missions[enfeites].maps.`);

  // E3: contagem exata da subárea.
  const esperado = QUANTIDADE_DE_ENFEITES[subarea];
  if (esperado !== undefined && lista.length !== esperado) erros.push(`E3: ${subarea} tem ${lista.length} enfeites; a tabela pede ${esperado}.`);

  const ids = new Set<string>();
  for (const e of lista) {
    const rotulo = `${subarea}/${String((e as EnfeiteBruto).id ?? '?')}`;
    for (const k of Object.keys(e)) if (!CHAVES_DO_ENFEITE.includes(k)) erros.push(`E1: ${rotulo} tem a chave "${k}" desconhecida.`);
    if (typeof e.id !== 'string' || !e.id) erros.push(`E1: enfeite sem "id" em ${subarea}.`);
    else if (ids.has(e.id)) erros.push(`E1: id "${e.id}" repetido em ${subarea}.`);
    else ids.add(e.id);
    const { x, y } = e;
    // E4: tile inteiro dentro da caixa e fora dos tiles proibidos.
    if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= ctx.largura || y >= ctx.altura) {
      erros.push(`E4: ${rotulo} fora da subárea (${x}, ${y}).`);
      continue;
    }
    if (ctx.proibido(x, y)) erros.push(`E4: ${rotulo} em tile proibido (${x}, ${y}).`);
    // E7: sprite registrado com prefixo dec_; pisca só em folha de 2 quadros.
    if (typeof e.sprite !== 'string' || !e.sprite.startsWith('dec_')) erros.push(`E7: ${rotulo} com sprite "${e.sprite}" fora do prefixo dec_.`);
    else if (ctx.sprites && !ctx.sprites[e.sprite]) erros.push(`E7: sprite "${e.sprite}" não está em sprites.json.`);
    if (e.pisca === true && ctx.sprites && ctx.sprites[e.sprite]?.quadros !== 2) erros.push(`E7: ${rotulo} pisca, e o sprite não tem 2 quadros.`);
    const bloqueado = ctx.bloqueado(x, y);
    const examinar = e.examinar;
    if (!bloqueado) {
      // E5: tile andável é só visual; pisca só em luz ou vela.
      if (examinar !== null) erros.push(`E5: ${rotulo} em tile andável não pode ter "examinar".`);
      if (e.pisca === true && !(SPRITES_DE_LUZ as readonly string[]).includes(e.sprite)) erros.push(`E5: ${rotulo} pisca, e só luz ou vela piscam.`);
    } else {
      // E6: tile bloqueado: examinar é uma das chaves de 3.4 ou null; cortina e pano não respondem.
      if (examinar !== null && !(CHAVES_DE_EXAMINAR as readonly string[]).includes(examinar)) erros.push(`E6: ${rotulo} com examinar "${examinar}", que não está na lista.`);
      if ((SPRITES_SEM_EXAMINAR as readonly string[]).includes(e.sprite) && examinar !== null) erros.push(`E6: ${rotulo} (${e.sprite}) não responde ao A.`);
    }
    // E9: a chave de examinar existe no texto da build.
    if (examinar !== null && !ctx.chavesDeTexto.includes(examinar)) erros.push(`E9: chave "${examinar}" não existe em pt-BR.json.`);
  }
  return erros;
}

/** Quadro do pisca de luz (ADR-010 3.5): 0 nos primeiros 500 ms de cada segundo, 1 nos 500 ms seguintes. 1 Hz. */
export function quadroDoPisca(tempoMs: number): 0 | 1 {
  const t = Math.max(0, Math.floor(tempoMs));
  return Math.floor(t / 500) % 2 === 0 ? 0 : 1;
}
