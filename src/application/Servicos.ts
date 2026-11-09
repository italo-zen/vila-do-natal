import type { Conteudo } from './usecases/CarregarConteudo';
import { SessaoDeJogo } from './SessaoDeJogo';
import { AcenderLuzes } from './usecases/AcenderLuzes';
import { ConcluirFase } from './usecases/ConcluirFase';
import { IniciarNovoJogo } from './usecases/IniciarNovoJogo';
import { TentarCodigoDaPorta } from './usecases/TentarCodigoDaPorta';

/** Casos de uso já montados, entregues às cenas. A apresentação não conhece infraestrutura. */
export interface Servicos {
  versao: string;
  conteudo: Conteudo;
  sessao: SessaoDeJogo;
  iniciarNovoJogo: IniciarNovoJogo;
  concluirFase: ConcluirFase;
  tentarCodigo: TentarCodigoDaPorta;
  acenderLuzes: AcenderLuzes;
}

export function montarServicos(conteudo: Conteudo, versao: string): Servicos {
  const sessao = new SessaoDeJogo();
  return {
    versao,
    conteudo,
    sessao,
    iniciarNovoJogo: new IniciarNovoJogo(sessao),
    concluirFase: new ConcluirFase(sessao),
    tentarCodigo: new TentarCodigoDaPorta(sessao),
    acenderLuzes: new AcenderLuzes(sessao),
  };
}
