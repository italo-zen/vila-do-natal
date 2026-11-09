import { SCHEMA_PERFIL_SUPORTADO, TIPOS_DE_LUZ, type PerfilDeArte } from './PerfilDeArte';
import { validarToque } from './validarToque';

export type ResultadoPerfil = { ok: true; perfil: PerfilDeArte } | { ok: false; erros: string[] };

const COR = /^#[0-9a-fA-F]{6}$/;
const ehInteiro = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v);
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** `ativo`: o perfil é o da build (manifesto `artProfile`). O perfil ativo precisa do bloco `toque` (ADR-007 seção 5.3). */
export interface OpcoesDoPerfil {
  ativo?: boolean;
}

/**
 * Valida o perfil de arte (ADR-003 seção 1). Devolve todos os erros de uma vez, em português.
 * `idEsperado` é o nome do arquivo do perfil (sem .json); o campo `id` precisa bater.
 */
export function validarPerfilDeArte(bruto: unknown, idEsperado?: string, opcoes: OpcoesDoPerfil = {}): ResultadoPerfil {
  const erros: string[] = [];
  if (!ehObjeto(bruto)) return { ok: false, erros: ['O perfil de arte precisa ser um objeto.'] };
  const p = bruto as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

  if (!ehInteiro(p.schemaVersion)) erros.push('schemaVersion ausente ou inválido no perfil.');
  else if (p.schemaVersion > SCHEMA_PERFIL_SUPORTADO) {
    erros.push(`schemaVersion ${p.schemaVersion} do perfil é mais nova que a suportada (${SCHEMA_PERFIL_SUPORTADO}). Atualize o jogo.`);
  }
  if (typeof p.id !== 'string' || p.id.length === 0) erros.push('id do perfil ausente.');
  else if (idEsperado !== undefined && p.id !== idEsperado) {
    erros.push(`id "${p.id}" do perfil não bate com o nome do arquivo ("${idEsperado}").`);
  }
  if (typeof p.nome !== 'string') erros.push('nome do perfil ausente.');
  if (typeof p.pasta !== 'string' || p.pasta.length === 0) erros.push('pasta do perfil ausente.');

  // Inteiros positivos: tile, sala, escala.minima.
  if (!ehInteiro(p.tile) || p.tile <= 0) erros.push('tile precisa ser um inteiro positivo.');
  if (!ehObjeto(p.sala) || !ehInteiro(p.sala.colunas) || p.sala.colunas <= 0) erros.push('sala.colunas precisa ser um inteiro positivo.');
  if (!ehObjeto(p.sala) || !ehInteiro(p.sala.linhas) || p.sala.linhas <= 0) erros.push('sala.linhas precisa ser um inteiro positivo.');
  if (!ehObjeto(p.escala) || !ehInteiro(p.escala.minima) || p.escala.minima < 1) erros.push('escala.minima precisa ser um inteiro ≥ 1.');
  if (ehObjeto(p.escala) && p.escala.modo !== 'inteira' && p.escala.modo !== 'hibrida') erros.push('escala.modo precisa ser "inteira" ou "hibrida".');
  if (ehObjeto(p.escala) && p.escala.modo === 'hibrida' && (!ehInteiro(p.escala.inteiraAPartirDe) || p.escala.inteiraAPartirDe < 1)) {
    erros.push('escala hibrida exige inteiraAPartirDe inteiro ≥ 1.');
  }
  if (ehObjeto(p.luz) && p.luz.tons !== undefined && (!ehInteiro(p.luz.tons) || p.luz.tons < 1 || p.luz.tons > 4)) {
    erros.push('luz.tons precisa ser inteiro de 1 a 4.');
  }

  // Paleta: mínimo não pode passar do máximo.
  if (!ehObjeto(p.paleta) || !ehInteiro(p.paleta.minimoDeCores) || !ehInteiro(p.paleta.maximoDeCores)) {
    erros.push('paleta.minimoDeCores e paleta.maximoDeCores precisam ser inteiros.');
  } else if (p.paleta.minimoDeCores > p.paleta.maximoDeCores) {
    erros.push('paleta.minimoDeCores não pode ser maior que paleta.maximoDeCores.');
  }
  const coresMin = ehObjeto(p.sprites) && ehObjeto(p.sprites.sobrinho) ? p.sprites.sobrinho.coresMin : undefined;
  if (!ehInteiro(coresMin) || coresMin < 1) erros.push('sprites.sobrinho.coresMin precisa ser inteiro ≥ 1.');
  else if (ehObjeto(p.paleta) && ehInteiro(p.paleta.maximoDeCores) && coresMin > p.paleta.maximoDeCores) {
    erros.push('sprites.sobrinho.coresMin não pode ser maior que paleta.maximoDeCores.');
  }

  // Fonte: corpo e título múltiplos da grade nativa (para os pixels da fonte caírem em pixels inteiros).
  if (!ehObjeto(p.fonte)) erros.push('fonte ausente.');
  else {
    const grade = p.fonte.grade;
    if (!ehInteiro(grade) || grade <= 0) erros.push('fonte.grade precisa ser um inteiro positivo.');
    for (const campo of ['corpo', 'titulo'] as const) {
      const valor: unknown = p.fonte[campo];
      if (!ehInteiro(valor) || valor <= 0) erros.push(`fonte.${campo} precisa ser um inteiro positivo.`);
      else if (ehInteiro(grade) && grade > 0 && valor % grade !== 0) {
        erros.push(`fonte.${campo} (${valor}) precisa ser múltiplo de fonte.grade (${grade}).`);
      }
    }
    if (typeof p.fonte.familia !== 'string' || p.fonte.familia.length === 0) erros.push('fonte.familia ausente.');
  }

  // Corpo do Sobrinho: a caixa dos pés cabe dentro do quadro (ADR-003 seção 1).
  const corpo = ehObjeto(p.corpos) ? p.corpos.sobrinho : undefined;
  if (!ehObjeto(corpo) || !ehObjeto(corpo.quadro) || !ehObjeto(corpo.pes)) {
    erros.push('corpos.sobrinho precisa de quadro e pes.');
  } else {
    const { quadro, pes } = corpo as { quadro: Record<string, unknown>; pes: Record<string, unknown> };
    if (!ehInteiro(quadro.w) || !ehInteiro(quadro.h) || (quadro.w as number) <= 0 || (quadro.h as number) <= 0) {
      erros.push('corpos.sobrinho.quadro precisa de w e h inteiros positivos.');
    } else if (!ehInteiro(pes.w) || !ehInteiro(pes.h) || (pes.w as number) <= 0 || (pes.h as number) <= 0) {
      erros.push('corpos.sobrinho.pes precisa de w e h inteiros positivos.');
    } else if ((pes.w as number) > (quadro.w as number) || (pes.h as number) > (quadro.h as number)) {
      erros.push(`corpos.sobrinho.pes (${pes.w}×${pes.h}) não cabe dentro do quadro (${quadro.w}×${quadro.h}).`);
    }
    if (!ehInteiro(corpo.quadrosDeAndar) || corpo.quadrosDeAndar < 1) erros.push('corpos.sobrinho.quadrosDeAndar precisa ser inteiro ≥ 1.');
    if (typeof corpo.fpsAndar !== 'number' || corpo.fpsAndar <= 0) erros.push('corpos.sobrinho.fpsAndar precisa ser maior que 0.');
  }

  // Cores da interface: sempre #rrggbb.
  if (!ehObjeto(p.tema)) erros.push('tema ausente.');
  else {
    for (const campo of ['fundo', 'texto', 'destaque', 'fraco', 'caixa'] as const) {
      if (typeof p.tema[campo] !== 'string' || !COR.test(p.tema[campo])) erros.push(`tema.${campo} precisa ser uma cor #rrggbb.`);
    }
  }

  // Luz: só tipos conhecidos pela apresentação.
  if (!ehObjeto(p.luz)) erros.push('luz ausente.');
  else if (!(TIPOS_DE_LUZ as readonly unknown[]).includes(p.luz.tipo)) {
    erros.push(`luz.tipo "${String(p.luz.tipo)}" desconhecido (aceitos: ${TIPOS_DE_LUZ.join(', ')}).`);
  }

  // Números de medida (espaços, margens, alturas, tamanhos de tela) não podem ser negativos.
  const naoNegativos: [string, unknown][] = [
    ['espaco.pequeno', ehObjeto(p.espaco) ? p.espaco.pequeno : undefined],
    ['espaco.medio', ehObjeto(p.espaco) ? p.espaco.medio : undefined],
    ['espaco.grande', ehObjeto(p.espaco) ? p.espaco.grande : undefined],
    ['barra.margemLateral', ehObjeto(p.barra) ? p.barra.margemLateral : undefined],
    ['barra.margemInferior', ehObjeto(p.barra) ? p.barra.margemInferior : undefined],
    ['barra.entreLinhas', ehObjeto(p.barra) ? p.barra.entreLinhas : undefined],
    ['barra.alturaPorLinhas.1', ehObjeto(p.barra) && ehObjeto(p.barra.alturaPorLinhas) ? p.barra.alturaPorLinhas['1'] : undefined],
    ['barra.alturaPorLinhas.2', ehObjeto(p.barra) && ehObjeto(p.barra.alturaPorLinhas) ? p.barra.alturaPorLinhas['2'] : undefined],
    ['dialogo.altura', ehObjeto(p.dialogo) ? p.dialogo.altura : undefined],
    ['luz.raioEmTiles', ehObjeto(p.luz) ? p.luz.raioEmTiles : undefined],
    ['luz.passoDegrau', ehObjeto(p.luz) ? p.luz.passoDegrau : undefined],
    ['fonte.entrelinhas', ehObjeto(p.fonte) ? p.fonte.entrelinhas : undefined],
    ['fonte.entrelinhasFina', ehObjeto(p.fonte) ? p.fonte.entrelinhasFina : undefined],
    ['botao.largura', ehObjeto(p.botao) ? p.botao.largura : undefined],
    ['botao.altura', ehObjeto(p.botao) ? p.botao.altura : undefined],
    ['botao.larguraTecla', ehObjeto(p.botao) ? p.botao.larguraTecla : undefined],
    ['botao.alturaTecla', ehObjeto(p.botao) ? p.botao.alturaTecla : undefined],
  ];
  for (const [caminho, valor] of naoNegativos) {
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) erros.push(`${caminho} precisa ser um número ≥ 0.`);
  }

  // Telas e painel: posições e tamanhos em px do perfil (token, nunca número nas cenas).
  if (!ehObjeto(p.telas) || !ehObjeto(p.painel) || !ehObjeto(p.objetos) || !ehObjeto(p.escalaDeExibicao)) {
    erros.push('telas, painel, objetos e escalaDeExibicao são obrigatórios.');
  }
  if (ehObjeto(p.painel) && ehObjeto(p.painel.grade)) {
    const g = p.painel.grade;
    if (!ehInteiro(g.colunas) || g.colunas < 1) erros.push('painel.grade.colunas precisa ser inteiro ≥ 1.');
  }

  // Controles de toque (ADR-007 seção 5.3): obrigatórios no perfil ativo; o bloco, quando existe, é sempre validado.
  if (p.toque === undefined) {
    if (opcoes.ativo) erros.push('toque ausente: o perfil ativo precisa do bloco "toque" (ADR-007 seção 5.1).');
  } else if (ehObjeto(p.sala) && ehObjeto(p.barra) && ehObjeto(p.painel) && ehInteiro(p.tile)) {
    erros.push(...validarToque(p.toque, p as unknown as Parameters<typeof validarToque>[1]));
  } else {
    erros.push('toque não pode ser validado: faltam sala, barra, painel ou tile.');
  }

  return erros.length > 0 ? { ok: false, erros } : { ok: true, perfil: bruto as unknown as PerfilDeArte };
}
