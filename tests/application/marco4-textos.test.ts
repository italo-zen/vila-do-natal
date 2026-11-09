import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { interpretarTextos } from '../../src/application/content/Textos';
import { linhasDe } from '../../src/application/content/validarConteudo';
import { PERSONAGEM_IDS } from '../../src/domain/personagem/PersonagemId';
import { sobrinhoPorId } from '../../src/domain/personagem/sobrinhos';

/**
 * Textos do Marco 4 (GDD 17.8; ADR-006 seção 8.5 e 10): texto exato, número de páginas, o `{versao}` e a varredura de
 * `depois` e `livre` no conteúdo. Lê os arquivos que a build embute.
 */

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const ler = (rel: string) => readFileSync(join(RAIZ, rel), 'utf-8');
const bruto = JSON.parse(ler('content/texts/pt-BR.json')) as Record<string, string | string[]>;
const t = interpretarTextos(bruto);
const versaoDoPacote = (JSON.parse(ler('package.json')) as { version: string }).version;

describe('textos exatos do Marco 4 (GDD 17.8)', () => {
  it.each([
    ['conquista.enfeites', 'Parabéns, você conseguiu encontrar a caixa de enfeites de Natal!'],
    ['aviso.enfeite.antes3', ['Ainda não!', 'Essa é a caixa de enfeites. Monte a árvore antes.']],
    ['arvore.estado.3', ['A árvore está montada!', 'Falta a caixa de enfeites.']],
    ['arvore.chegada.3', ['A árvore está montada! Que linda!', 'Mas tem algo estranho... Ainda falta alguma coisa.', 'Deve estar perdida pela casa.']],
    ['arvore.chegada.4', ['Agora a árvore está toda enfeitada!', 'Feliz Natal para a família!']],
    ['dica.enfeites.dormindo', ['Procure a caixa de enfeites.', 'O Nick ainda está dormindo.']],
    ['dica.enfeites.acordado', ['Procure a caixa de enfeites.', 'Aperte X e o Nick fareja.']],
    ['creditos.titulo', 'Créditos'],
    ['creditos.jogo', 'Natal na Casa do Tio Ítalo e da Tia Nath'],
    ['creditos.nick', 'O Nick também ajudou muito!'],
    ['creditos.agradecimento', 'Feito com carinho para a família.'],
    ['creditos.voltar', 'Voltar ao título'],
    ['barra.creditos', 'Z ou X: voltar ao título'],
  ])('%s tem o texto do GDD 17.8', (chave, esperado) => {
    expect(t.paginas(chave)).toEqual(Array.isArray(esperado) ? esperado : [esperado]);
  });

  it('creditos.sobrinho tem o nome do sobrinho escolhido, nos 4 nomes', () => {
    for (const id of PERSONAGEM_IDS) {
      const nome = sobrinhoPorId(id).nome;
      expect(t.t('creditos.sobrinho', { nome })).toBe(`Obrigado, ${nome}! A árvore ficou linda.`);
    }
  });

  it('creditos.versao usa {versao}, preenchida com a versão do package.json (ADR-002 seção 1)', () => {
    expect(t.t('creditos.versao', { versao: versaoDoPacote })).toBe(`Versão ${versaoDoPacote}`);
    expect(versaoDoPacote).toBe('0.8.1');
  });

  it('cada página cabe no teto de linhas de 28 caracteres (diálogo e créditos: 2; conquista e dica: 3, GDD 17.8)', () => {
    const chaves = ['aviso.enfeite.antes3', 'arvore.chegada.3', 'arvore.chegada.4', 'creditos.jogo', 'creditos.nick', 'creditos.agradecimento'];
    for (const chave of chaves) for (const p of t.paginas(chave)) expect(linhasDe(p, 28), `${chave}: "${p}"`).toBeLessThanOrEqual(2);
    for (const p of t.paginas('conquista.enfeites')) expect(linhasDe(p, 28)).toBeLessThanOrEqual(3);
    for (const chave of ['dica.enfeites.dormindo', 'dica.enfeites.acordado']) {
      for (const p of t.paginas(chave)) expect(linhasDe(p, 28), `${chave}: "${p}"`).toBe(1);
    }
  });
});

describe('varreduras do conteúdo (ADR-006 seções 6 e 10)', () => {
  it('nenhum `depois` nas missões (ADR-006 seção 6; N008)', () => {
    const missoes = readdirSync(join(RAIZ, 'content', 'missions')).filter((f) => f.endsWith('.json'));
    for (const f of missoes) expect(ler(`content/missions/${f}`), f).not.toMatch(/"depois"/);
  });

  it('nenhum `livre` nas dicas das missões (ADR-006 seção 6; N014)', () => {
    const missoes = readdirSync(join(RAIZ, 'content', 'missions')).filter((f) => f.endsWith('.json'));
    for (const f of missoes) {
      const json = JSON.parse(ler(`content/missions/${f}`)) as { dica?: Record<string, unknown> };
      expect(Object.keys(json.dica ?? {}), f).not.toContain('livre');
    }
  });

  it('nenhum dica.livre nos textos (ADR-006 seção 6)', () => {
    expect(t.tem('dica.livre')).toBe(false);
  });

  it('os créditos e o diálogo final não citam nome de pessoa da família, além do nome do jogo (GDD 17.8; item 034)', () => {
    const chaves = ['creditos.titulo', 'creditos.sobrinho', 'creditos.nick', 'creditos.agradecimento', 'creditos.voltar', 'arvore.chegada.4', 'conquista.enfeites'];
    for (const chave of chaves) {
      for (const p of t.paginas(chave)) expect(p, chave).not.toMatch(/Ítalo|Nath/);
    }
  });
});
