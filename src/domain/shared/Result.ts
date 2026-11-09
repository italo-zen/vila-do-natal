export type Result<T, E = Error> = { ok: true; valor: T } | { ok: false; erro: E };

export const ok = <T>(valor: T): Result<T, never> => ({ ok: true, valor });
export const erro = <E>(e: E): Result<never, E> => ({ ok: false, erro: e });
