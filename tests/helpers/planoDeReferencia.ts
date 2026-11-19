import type { Plano } from '../../src/domain/plano/Plano';
import type { PlanejadorDaPartida } from '../../src/application/usecases/IniciarNovoJogo';
import { IniciarNovoJogo } from '../../src/application/usecases/IniciarNovoJogo';
import type { SessaoDeJogo } from '../../src/application/SessaoDeJogo';
import { missoesReais } from './missoesReais';
import { carregarConteudoPuro } from './conteudoReal';

/**
 * Plano de referência: as posições fixas de antes do sorteio (1.2.x), para os testes antigos que dependem de um lugar certo
 * (marco 2, condução, Nick). Os testes do sorteio usam `sortearPlano` de verdade.
 */
export const PLANO_DE_REFERENCIA: Plano = {
  semente: 0,
  pecas: [
    { ordem: 1, area: 'sala', comodo: 'sala', mapa: 'sala', x: 0, y: 5 },
    { ordem: 2, area: 'cozinha', comodo: 'cozinha', mapa: 'cozinha', x: 3, y: 1 },
    { ordem: 3, area: 'cozinha', comodo: 'cozinha', mapa: 'cozinha', x: 5, y: 3 },
  ],
  nick: {
    marco1: { missao: 'marco1', mapa: 'sala', x: 9, y: 5, direcao: 'baixo', alvo: 'sala' },
    parte1: { missao: 'parte1', mapa: 'cozinha', x: 1, y: 1, direcao: 'baixo', alvo: 'sala' },
    parte2: { missao: 'parte2', mapa: 'quarto', x: 1, y: 2, direcao: 'baixo', alvo: 'cozinha' },
    parte3: { missao: 'parte3', mapa: 'escritorio', x: 4, y: 2, direcao: 'baixo', alvo: 'cozinha' },
    enfeites: { missao: 'enfeites', mapa: 'sala', x: 9, y: 5, direcao: 'baixo', alvo: 'escritorio' },
  },
};

const puro = await carregarConteudoPuro();

/** Planejador que devolve sempre o plano de referência. */
export function planejadorDeReferencia(): PlanejadorDaPartida {
  return { todos: puro.todosOsMapas, fonte: { nova: () => 0 }, sortear: () => PLANO_DE_REFERENCIA };
}

/** `IniciarNovoJogo` com o plano de referência (testes antigos). */
export const iniciarComReferencia = (sessao: SessaoDeJogo): IniciarNovoJogo => new IniciarNovoJogo(sessao, missoesReais(), planejadorDeReferencia());
