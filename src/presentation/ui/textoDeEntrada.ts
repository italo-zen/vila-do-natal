import type Phaser from 'phaser';
import { servicosDe } from './tema';
import { comToqueDaCena } from './toque/toqueDaCena';
import type { Variaveis } from '../../application/content/Textos';

/**
 * Chave de texto para a entrada atual (ADR-007 seção 9.1). Com toque, usa a versão `.toque` se ela existir; sem
 * toque, ou sem versão, usa a chave base. Função pura: `existe` diz se a chave existe nos textos.
 */
export function chaveDeEntrada(chave: string, comToque: boolean, existe: (chave: string) => boolean, semBotoes = false): string {
  if (!comToque) return chave;
  // Sem nenhum botão na tela (layout B nos menus, 2026-11-09): a barra diz o que tocar, na chave `.toque.menu`.
  if (semBotoes && existe(`${chave}.toque.menu`)) return `${chave}.toque.menu`;
  const versao = `${chave}.toque`;
  return existe(versao) ? versao : chave;
}

/** Textos da cena já resolvidos pela entrada (teclado ou toque). Leitura por cena; o conteúdo é o mesmo. */
export function textoDeEntrada(cena: Phaser.Scene) {
  const textos = servicosDe(cena).conteudo.textos;
  const resolver = (chave: string) => chaveDeEntrada(chave, comToqueDaCena(cena), (c) => textos.tem(c));
  return {
    t: (chave: string, vars: Variaveis = {}) => textos.t(resolver(chave), vars),
    paginas: (chave: string, vars: Variaveis = {}) => textos.paginas(resolver(chave), vars),
  };
}
