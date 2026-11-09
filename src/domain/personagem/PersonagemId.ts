import { DomainError } from '../shared/DomainError';
import { erro, ok, type Result } from '../shared/Result';

export const PERSONAGEM_IDS = ['lolo', 'bibi', 'dandan', 'tutu'] as const;
export type PersonagemId = (typeof PERSONAGEM_IDS)[number];

export function parsePersonagemId(valor: unknown): Result<PersonagemId, DomainError> {
  if (typeof valor === 'string' && (PERSONAGEM_IDS as readonly string[]).includes(valor)) {
    return ok(valor as PersonagemId);
  }
  return erro(new DomainError('personagem_desconhecido', `Personagem desconhecido: ${String(valor)}`));
}
