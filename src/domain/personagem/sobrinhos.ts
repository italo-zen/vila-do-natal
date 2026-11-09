import { CodigoDaPorta } from '../porta/CodigoDaPorta';
import { PERSONAGEM_IDS, type PersonagemId } from './PersonagemId';
import { Sobrinho } from './Sobrinho';

/** Tabela única dos Sobrinhos (GDD 4.2 e 4.8). Ordem = ordem na seleção. */
export const SOBRINHOS: readonly Sobrinho[] = [
  new Sobrinho('lolo', 'LoLô', 'menina', CodigoDaPorta.criar('017')),
  new Sobrinho('bibi', 'BiBi', 'menina', CodigoDaPorta.criar('020')),
  new Sobrinho('dandan', 'DanDan', 'menino', CodigoDaPorta.criar('023')),
  new Sobrinho('tutu', 'TuTu', 'menino', CodigoDaPorta.criar('024')),
];

export function sobrinhoPorId(id: PersonagemId): Sobrinho {
  const s = SOBRINHOS.find((x) => x.id === id);
  if (!s) throw new Error(`Sobrinho sem cadastro: ${id}`);
  return s;
}

export { PERSONAGEM_IDS };
