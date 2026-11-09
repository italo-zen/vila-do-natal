import { SCHEMA_VERSION_SUPORTADA, type Manifest } from './Manifest';

export type ResultadoValidacao = { ok: true; manifesto: Manifest } | { ok: false; erros: string[] };

const ehTexto = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

function duplicados(ids: string[]): string[] {
  return ids.filter((id, i) => ids.indexOf(id) !== i);
}

/**
 * Valida o manifesto (schema 2): formato, ids únicos e referências entre maps, missions e texts.
 * Sem migração do schema 1 (ADR-002 seção 2.1): ele é recusado com mensagem clara.
 * As regras que dependem do conteúdo das subáreas (portas, spawns, missão) são de `validarConteudo`.
 */
export function validarManifesto(bruto: unknown): ResultadoValidacao {
  const erros: string[] = [];
  if (typeof bruto !== 'object' || bruto === null || Array.isArray(bruto)) {
    return { ok: false, erros: ['O manifesto precisa ser um objeto.'] };
  }
  const m = bruto as Record<string, unknown>;

  if (!Number.isInteger(m.schemaVersion)) {
    erros.push('schemaVersion ausente ou inválido.');
  } else if ((m.schemaVersion as number) > SCHEMA_VERSION_SUPORTADA) {
    erros.push(`schemaVersion ${String(m.schemaVersion)} é mais nova que a suportada (${SCHEMA_VERSION_SUPORTADA}). Atualize o jogo.`);
  } else if ((m.schemaVersion as number) < SCHEMA_VERSION_SUPORTADA) {
    erros.push(`schemaVersion ${String(m.schemaVersion)} não é mais suportada: o motor lê a ${SCHEMA_VERSION_SUPORTADA} (ADR-002 seção 2.1).`);
  }
  if ('startMap' in m) erros.push('startMap foi removido no schema 2: o início da partida fica em missions/<id>.json (campo inicio).');
  if (!ehTexto(m.contentVersion)) erros.push('contentVersion ausente.');
  if (!ehTexto(m.locale)) erros.push('locale ausente.');
  if (m.artProfile !== undefined && !ehTexto(m.artProfile)) erros.push('artProfile, quando existe, precisa ser o id de um perfil de arte.');
  for (const campo of ['maps', 'missions', 'texts'] as const) {
    if (!Array.isArray(m[campo])) erros.push(`"${campo}" precisa ser uma lista.`);
  }
  if (erros.length > 0) return { ok: false, erros };

  const maps = m.maps as Array<Record<string, unknown>>;
  const missions = m.missions as Array<Record<string, unknown>>;
  const texts = m.texts as Array<Record<string, unknown>>;

  maps.forEach((x, i) => {
    if (!ehTexto(x.id) || !ehTexto(x.file) || !ehTexto(x.tileset)) erros.push(`maps[${i}] incompleto (id, file e tileset são obrigatórios).`);
  });
  missions.forEach((x, i) => {
    if (!ehTexto(x.id) || !ehTexto(x.file) || !Array.isArray(x.maps) || !Array.isArray(x.requires)) {
      erros.push(`missions[${i}] incompleta (id, file, maps e requires são obrigatórios).`);
    }
  });
  texts.forEach((x, i) => {
    if (!ehTexto(x.locale) || !ehTexto(x.file)) erros.push(`texts[${i}] incompleto (locale e file).`);
  });
  if (erros.length > 0) return { ok: false, erros };

  const mapIds = maps.map((x) => x.id as string);
  const missionIds = missions.map((x) => x.id as string);
  for (const d of duplicados(mapIds)) erros.push(`Id de subárea duplicado: "${d}".`);
  for (const d of duplicados(missionIds)) erros.push(`Id de missão duplicado: "${d}".`);
  for (const d of duplicados(texts.map((x) => x.locale as string))) erros.push(`Locale de texto duplicado: "${d}".`);
  if (!texts.some((x) => x.locale === m.locale)) erros.push(`Não há arquivo de textos para o locale "${String(m.locale)}".`);

  missions.forEach((x) => {
    const abertas = x.maps as unknown[];
    for (const r of abertas) {
      if (typeof r !== 'string' || !mapIds.includes(r)) erros.push(`A missão "${String(x.id)}" abre a subárea "${String(r)}", que não existe em maps.`);
    }
    for (const d of duplicados(abertas.map(String))) erros.push(`A missão "${String(x.id)}" lista a subárea "${d}" mais de uma vez.`);
    for (const r of x.requires as unknown[]) {
      if (typeof r !== 'string' || !missionIds.includes(r) || r === x.id) {
        erros.push(`A missão "${String(x.id)}" exige "${String(r)}", que não é uma missão válida.`);
      }
    }
  });

  return erros.length > 0 ? { ok: false, erros } : { ok: true, manifesto: bruto as Manifest };
}
