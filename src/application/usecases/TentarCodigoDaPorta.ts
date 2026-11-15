import type { SessaoDeJogo } from '../SessaoDeJogo';

export type ResultadoDaTentativa =
  | { tipo: 'incompleto' }
  | { tipo: 'errado'; /** 0, 1 ou 2: qual mensagem de incentivo mostrar (GDD 14.1). */ mensagem: number }
  | { tipo: 'certo' }
  | { tipo: 'ja_aberta' };

/** Sem limite de tentativas e sem penalidade. */
export class TentarCodigoDaPorta {
  constructor(private readonly sessao: SessaoDeJogo) {}

  executar(tentativa: string): ResultadoDaTentativa {
    if (this.sessao.portaAberta()) return { tipo: 'ja_aberta' };
    const r = this.sessao.progresso.tentarPorta(tentativa);
    if (!r.ok) return { tipo: 'ja_aberta' };
    switch (r.valor.avaliacao) {
      case 'incompleto':
        return { tipo: 'incompleto' };
      case 'errado':
        return { tipo: 'errado', mensagem: this.sessao.proximoIndiceDeErro() };
      case 'certo':
        this.sessao.definir(r.valor.progresso);
        this.sessao.zerarErros();
        return { tipo: 'certo' };
    }
  }
}
