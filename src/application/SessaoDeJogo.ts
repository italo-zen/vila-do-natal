import type { Fase } from '../domain/progresso/Fase';
import { indiceDaFase } from '../domain/progresso/Fase';
import type { Progresso } from '../domain/progresso/Progresso';

/** Estado da partida em memória. Só os casos de uso o alteram. Não é gravado (ADR-002 seção 3). */
export class SessaoDeJogo {
  private _progresso: Progresso | null = null;
  private erros = 0;
  private readonly vistos = new Set<string>();

  get progresso(): Progresso {
    if (!this._progresso) throw new Error('Não há partida em andamento.');
    return this._progresso;
  }
  get temPartida(): boolean {
    return this._progresso !== null;
  }
  iniciar(p: Progresso): void {
    this._progresso = p;
    this.erros = 0;
    this.vistos.clear();
  }
  definir(p: Progresso): void {
    this._progresso = p;
  }
  get fase(): Fase {
    return this.progresso.faseAtual;
  }
  /** Fase concluída na partida: a atual já passou dela (portas trancadas, ADR-004 seção 3). */
  faseConcluida(fase: Fase): boolean {
    return indiceDaFase(this.fase) > indiceDaFase(fase);
  }
  portaAberta(): boolean {
    return indiceDaFase(this.fase) > indiceDaFase('porta');
  }
  luzesAcesas(): boolean {
    return indiceDaFase(this.fase) > indiceDaFase('luzes');
  }
  /** Índice (0, 1, 2, 0, ...) da próxima mensagem de incentivo da porta (GDD 14.1, em ordem). */
  proximoIndiceDeErro(): number {
    const i = this.erros % 3;
    this.erros += 1;
    return i;
  }
  zerarErros(): void {
    this.erros = 0;
  }
  /** Consulta sem marcar. */
  foiVisto(chave: string): boolean {
    return this.vistos.has(chave);
  }
  /** Marca um aviso como visto. Devolve true só na primeira vez. */
  primeiraVez(chave: string): boolean {
    if (this.vistos.has(chave)) return false;
    this.vistos.add(chave);
    return true;
  }
}
