import type { Conteudo } from './usecases/CarregarConteudo';
import { SessaoDeJogo } from './SessaoDeJogo';
import { AcenderLuzes } from './usecases/AcenderLuzes';
import { ConcluirFase } from './usecases/ConcluirFase';
import { IniciarNovoJogo, planejadorDoConteudo } from './usecases/IniciarNovoJogo';
import { TentarCodigoDaPorta } from './usecases/TentarCodigoDaPorta';
import { AcordarNick } from './usecases/AcordarNick';
import { RegistrarPassoDoSobrinho } from './usecases/RegistrarPassoDoSobrinho';
import { EntrarNaArea } from './usecases/EntrarNaArea';
import { DevolverControle } from './usecases/DevolverControle';
import { FarejarComNick } from './usecases/FarejarComNick';
import { MontarDica } from './usecases/MontarDica';
import type { FonteDeSemente } from './ports/FonteDeSemente';

/** Casos de uso já montados, entregues às cenas. A apresentação não conhece infraestrutura. */
export interface Servicos {
  versao: string;
  conteudo: Conteudo;
  sessao: SessaoDeJogo;
  iniciarNovoJogo: IniciarNovoJogo;
  concluirFase: ConcluirFase;
  tentarCodigo: TentarCodigoDaPorta;
  acenderLuzes: AcenderLuzes;
  acordarNick: AcordarNick;
  registrarPasso: RegistrarPassoDoSobrinho;
  entrarNaArea: EntrarNaArea;
  devolverControle: DevolverControle;
  farejarComNick: FarejarComNick;
  montarDica: MontarDica;
}

/** `fonte`: de onde vem a semente nova de cada partida (o navegador injeta `crypto`; o teste, uma fixa). */
export function montarServicos(conteudo: Conteudo, versao: string, fonte: FonteDeSemente): Servicos {
  const sessao = new SessaoDeJogo();
  return {
    versao,
    conteudo,
    sessao,
    iniciarNovoJogo: new IniciarNovoJogo(sessao, conteudo.missoes, planejadorDoConteudo({ sorteio: conteudo.sorteio, todos: conteudo.todosOsMapas, missoes: conteudo.missoes, perfil: conteudo.perfil }, fonte)),
    concluirFase: new ConcluirFase(sessao),
    tentarCodigo: new TentarCodigoDaPorta(sessao),
    acenderLuzes: new AcenderLuzes(sessao),
    acordarNick: new AcordarNick(sessao),
    registrarPasso: new RegistrarPassoDoSobrinho(sessao),
    entrarNaArea: new EntrarNaArea(sessao),
    devolverControle: new DevolverControle(sessao, conteudo.missoes),
    farejarComNick: new FarejarComNick(sessao, conteudo.missoes),
    montarDica: new MontarDica(sessao, conteudo.missoes),
  };
}
