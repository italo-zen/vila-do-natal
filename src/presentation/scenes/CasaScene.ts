import Phaser from 'phaser';
import { servicosDe, perfilDe, telaDe, numeroDaCor, estilo, arteDe } from '../ui/tema';
import { quadroDoPisca, type EnfeiteBruto } from '../../application/content/decoracao';
import { maiorTamanhoQueCabe, tamanhosAteOPiso } from '../ui/tamanhoDoTexto';
import { definirTelaDoSom, somDaCena, telaDoSomDaCena, tocarSom } from '../audio/somDaCena';
import { IconeDeTela, CHAVES_DA_PAUSA, CHAVES_DO_SOM } from '../ui/icones/IconeDeTela';
import { iconesDaTela, xDoIcone } from '../ui/icones/iconesDaTela';
import type { TelaDoSom } from '../audio/politicaDeSom';
import { podeAbrirPausa } from '../ui/pausa/podeAbrirPausa';
import { Barra } from '../ui/Barra';
import { PERSONAGEM_IDS } from '../../domain/personagem/PersonagemId';
import { Controles } from '../input/Controles';
import { Dialogo } from '../ui/Dialogo';
import { NickSprite } from '../nick/NickSprite';
import { BalaoDoNick } from '../nick/BalaoDoNick';
import { SetaDeFarejar } from '../nick/SetaDeFarejar';
import { fumacaDeDormir } from '../nick/FumacaDeDormir';
import { ACORDAR_MS, ABANAR_MS, BALAO_MS, FAREJAR_MS } from '../nick/temporizacao';
import { DicaOverlay } from '../ui/DicaOverlay';
import { IconeDeDica } from '../ui/IconeDeDica';
import { alvoDoA } from '../../application/mundo/nick/alvoDoA';
import { reacaoDoNickNaConquista } from '../../application/mundo/nick/reacaoConquista';
import { FELIZ_MS } from '../nick/temporizacao';
import { podeAbrirDica, podeFarejar, type ModoDaTela } from '../../application/mundo/nick/modoDaTela';
import { ANIM_NICK, CHAVE_BALAO } from '../assets/registro';
import type { MovimentoDoNick } from '../../domain/nick/Nick';
import type { Tile } from '../../domain/shared/Tile';
import type { Direcao as DirecaoDoDominio } from '../../domain/shared/Direcao';
import type { PosicaoDaCaixa } from '../ui/posicaoDoDialogo';
import { PainelDeCodigo } from '../ui/PainelDeCodigo';
import { textoDeEntrada } from '../ui/textoDeEntrada';
import { caixaYDoDialogo } from '../ui/posicaoDoDialogo';
import { toqueDaCena } from '../ui/toque/toqueDaCena';
import { criarIluminacao, type Iluminacao } from '../ui/iluminacao/Iluminacao';
import {
  CHAVE,
  CHAVE_DA_ARVORE,
  CHAVE_DA_CONQUISTA_DA_PECA,
  CHAVE_DA_CONQUISTA_DO_ENFEITE,
  CHAVE_DA_PECA,
  CHAVE_DO_ENFEITE,
  CHAVE_DO_TILESET,
  sprites,
} from '../assets/registro';
import {
  CHAVE_DA_CHEGADA_FINAL,
  CHAVE_DO_AVISO_DO_ENFEITE,
  FASE_DO_ENFEITE,
} from '../../application/mundo/enfeite';
import { indicadoresDaSubarea, portaEhVertical, type LadoDaPorta, type TipoDeIndicador } from '../../application/mundo/indicadores';
import { calcularRotaDeConducao, type NoDaRota } from '../../application/mundo/conducao';
import { CHAVE_EXAMINADA, CHAVES_DA_CHEGADA, deveAbrirChegada, haloDaArvoreVisivel } from '../../application/mundo/chegadaDaArvore';
import {
  FASE_DA_PECA,
  chaveDaChegada,
  chaveDoAviso,
  chaveDoEstadoDaArvore,
  contextoDaPartida,
  estadoDaArvore,
  ordemDaFase,
  pecaRetiradaNaConducao,
  situacaoDaFase,
} from '../../application/mundo/pecas';
import { conducaoDaFase, jogoTerminou, missaoDaFase } from '../../application/mundo/missoes';
import { fatorDaConducao } from '../../domain/progresso/Conducao';
import {
  ColisaoDoMapa,
  centroDoQuadro,
  centroDosPes,
  geometriaDoSobrinho,
  mover,
  posicaoDoTile,
  profundidadeDoQuadro,
  type Direcao,
  type Geometria,
  type Posicao,
} from '../../application/mundo/movimento';
import {
  bloqueiosDaSubarea,
  deslocamentoDaSubarea,
  objetosNaTela,
  posicaoDoSpritePelaBase,
  arestaDoParFechado,
  ladoDaPorta,
  resolverPorta,
  vaoDaPorta,
  type ContextoDeArea,
} from '../../application/mundo/subarea';
import type { MapaDoJogo, ObjetoDoMapa } from '../../application/content/Mapa';
import type { Fase } from '../../domain/progresso/Fase';
import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';
import type { Sobrinho } from '../../domain/personagem/Sobrinho';
import { alfaDoPisca, PERIODOS_DE_PULSO_MS } from '../ui/pisca';

export interface DadosDaCasa {
  /** "intro": começa pela introdução no início da missão. "conducao": a conquista acabou; o jogo leva o Sobrinho ao destino da fase (GDD 14.11). */
  modo: 'intro' | 'conducao' | 'explorar';
  /** Tile (local) de onde a condução começa, e a fase que ela conclui (modo "conducao"). */
  origem?: { mapa: string; x: number; y: number };
  fase?: string;
}

type Estado = 'livre' | 'dialogo' | 'painel' | 'cena' | 'conducao';
type Lado = LadoDaPorta;

/** Objetos que respondem à ação A (GDD 14.9.2 e ADR-004 seção 6). */
const TIPOS_INTERATIVOS = new Set(['bilhete', 'porta', 'portaFechada', 'examinavel', 'interruptor', 'arvore', 'peca', 'enfeite']);

/** Pausa depois de fechar um diálogo ou painel, antes de o personagem voltar a andar. Tempo de jogo. */
const PAUSA_DE_ENTRADA_MS = 200;
/** Duração de cada metade do fade entre subáreas (GDD 14.10.5: ~0,5 s no total). */
const METADE_DO_FADE_MS = 250;
/** Encaixe da peça (GDD 15.6.4): a peça desce em 0,6 s; o flash dourado dura 0,3 s. */
const DURACAO_DA_DESCIDA_MS = 600;
const DURACAO_DO_FLASH_MS = 300;
/**
 * Encaixe da caixa de enfeite (GDD 17.4 item 3; ADR-006 seção 4, passo 5): a caixa abre em 0,6 s, o enfeite sobe em 0,8 s
 * e o flash dura 0,3 s. Total de 1,7 s, com a árvore mudando só no fim.
 */
const ABERTURA_DA_CAIXA_MS = 600;
const SUBIDA_DO_ENFEITE_MS = 800;
/** Fade para os créditos depois do diálogo final (GDD 17.4 item 6; cor de fundo da casa). */
const DURACAO_DO_FADE_FINAL_MS = 500;
/** Halo da peça no chão (GDD 15.2.4): 4 px de margem; opacidade de 40% a 70% em pulso de 2 s. */
const MARGEM_DO_BRILHO_DA_PECA = 4;
const BRILHO_DA_PECA_MIN = 0.4;
const BRILHO_DA_PECA_MAX = 0.7;
const PERIODO_DO_BRILHO_DA_PECA_MS = PERIODOS_DE_PULSO_MS.brilhoDaPeca;
/** Profundidades de desenho (ordem de camadas, não arte). */
const PROFUNDIDADE_JOGADOR = 10;
const PROFUNDIDADE_BRILHO = 950;
const RECUO_DO_HALO_NA_PROFUNDIDADE = -1;
const PROFUNDIDADE_FADE = 1100;
/**
 * Indicadores de porta (GDD 14.10.10): acima do chão (profundidade 0) e abaixo de qualquer objeto ou sobrinho,
 * que têm profundidade de base em px (≥ 32). Só desenho, sem pisca.
 */
const PROFUNDIDADE_INDICADOR = 1;
const CHAVE_DO_INDICADOR: Record<TipoDeIndicador, string> = {
  'seta-direita': CHAVE.indicadorSetaDireita,
  'seta-esquerda': CHAVE.indicadorSetaEsquerda,
  tapete: CHAVE.indicadorTapete,
};

/** Lado oposto (a aresta da porta fica do lado de dentro, oposto à saída; docs/mapa-casa-real.md, 8.2). */
const OPOSTO: Record<Lado, Lado> = { cima: 'baixo', baixo: 'cima', esquerda: 'direita', direita: 'esquerda' };

/**
 * Cor do móvel placeholder (madeira) e da sua borda de 1 px. O perfil HD ainda não tem cor de madeira; quando
 * tiver, estas duas constantes saem daqui e passam a vir do perfil (ADR-003).
 */
const COR_DO_MOVEL = 0x8a5a33;
const COR_DA_BORDA_DO_MOVEL = 0x5a3a1f;

/**
 * Cena da casa (ADR-004). Mostra uma subárea por vez, com câmera fixa e centralizada na tela do perfil.
 * Só orquestra: regras (fases, código, luzes, portas, peças) ficam na aplicação e no domínio.
 */
export class CasaScene extends Phaser.Scene {
  private sv!: ReturnType<typeof servicosDe>;
  private perfil!: PerfilDeArte;
  /** Geometria do Sobrinho (tile, quadro e caixa dos pés), lida do perfil. */
  private geo!: Geometria;
  private controles!: Controles;
  private dialogo!: Dialogo;
  private painel: PainelDeCodigo | null = null;
  private barra!: Barra;
  private fade!: Phaser.GameObjects.Rectangle;
  private transitando = false;
  private gatilhoDoPainel: ObjetoDoMapa | null = null;

  private mapa!: MapaDoJogo;
  private desl = { x: 0, y: 0 };
  private colisao!: ColisaoDoMapa;
  private objetosTela: ObjetoDoMapa[] = [];
  /** Desenhos da subárea atual (apagados ao trocar de subárea). */
  private desenhos: Phaser.GameObjects.GameObject[] = [];
  /** Enfeites do modo explorar da subárea atual (ADR-010 3): total e os que piscam (quadro pelo tempo). */
  private enfeitesDaArea: { area: string | null; total: number; piscantes: Phaser.GameObjects.Sprite[] } = { area: null, total: 0, piscantes: [] };
  private halo: Phaser.GameObjects.Rectangle | null = null;
  private inicioPisca = 0;
  private estado: Estado = 'livre';
  private bloqueadoAte = 0;
  /** Sprite da árvore da subárea atual: é trocado quando a árvore muda de estado (GDD 15.4). */
  private copaDaArvore: { img: Phaser.GameObjects.Image; x: number; y: number; w: number; h: number } | null = null;

  private jogador!: Phaser.GameObjects.Sprite;
  /** Posição do Sobrinho em px da tela (a câmera não rola: tela e mundo coincidem). */
  private pos: Posicao = { x: 0, y: 0 };
  private dir: Direcao = 'baixo';
  private interagindoAte = 0;
  private luz!: Iluminacao;
  /** Intensidade do escuro (1 = escuro, 0 = luzes acesas). Animada por tween no fade. */
  private escuro = { alpha: 1 };

  /** Nick (ADR-005 seção 7.2): sprite, balão, seta de farejar e ícone de dica. A cena só orquestra. */
  private nick!: NickSprite;
  private balao!: BalaoDoNick;
  private seta!: SetaDeFarejar;
  private icone!: IconeDeDica;
  /** Ícones do canto superior esquerdo (GDD 19.3.2): pausa (II) e som (ADR-008 7.2). */
  private iconePausa!: IconeDeTela;
  private iconeSom!: IconeDeTela;
  /** Tela da dica aberta: enquanto existe, o mundo está parado (GDD 16.8.5). */
  private dica: DicaOverlay | null = null;
  /** Ações temporizadas do Nick e dos balões, em tempo de jogo (param com a dica). */
  private tarefas: { restante: number; fn: () => void }[] = [];
  /** Tile local do sobrinho no último quadro em que foi registrado (passo novo = tile diferente). */
  private ultimoTile: { x: number; y: number } | null = null;
  /** Nick ocupado (acordar, farejar, abanar): B e A não reiniciam a animação. */
  private nickOcupado = false;
  /** Farejando (animação de 1,2 s antes da seta): a seta ainda não aparece e os 5 s não correm (ADR-005 seção 4.5). */
  private sniffando = false;
  private emIntro = false;
  /** Posição da caixa do diálogo aberto (base ou topo), para reservar a área no toque. */
  private posicaoDaCaixa: PosicaoDaCaixa = 'base';
  private balaoId = 0;
  /** Indicador estático de cada porta (para trocar pela seta de farejar, GDD 14.10.10). */
  private indicadoresDePorta = new Map<string, Phaser.GameObjects.Image>();

  constructor() {
    super('Casa');
  }

  /** Condução automática (GDD 14.11; ADR-004 seção 11): rota pronta, índice do nó atual e fator de velocidade. */
  private rota: NoDaRota[] = [];
  private indiceRota = 0;
  private fatorConducao = 1;
  /** Fase que a condução atual conclui ao chegar (`luzes`, `parte1` a `parte3`). */
  private faseDaConducao: Fase = 'luzes';

  create(dados: DadosDaCasa): void {
    this.sv = servicosDe(this);
    this.perfil = perfilDe(this);
    this.geo = geometriaDoSobrinho(this.perfil);
    const { largura, altura } = telaDe(this.perfil);
    this.controles = new Controles(this);
    // Ao acordar da pausa, as teclas apertadas com o menu da pausa não podem valer aqui (ADR-008 6.2).
    this.events.on(Phaser.Scenes.Events.WAKE, () => {
      this.controles.atualizar();
      this.controles.descartarEntradas();
    });
    this.mostrarToque();
    this.cameras.main.setScroll(0, 0);
    this.estado = 'livre';
    this.bloqueadoAte = 0;
    this.painel = null;
    this.gatilhoDoPainel = null;
    this.transitando = false;
    this.interagindoAte = 0;
    this.copaDaArvore = null;
    this.escuro = { alpha: this.sv.sessao.luzesAcesas() ? 0 : 1 };
    this.dica = null;
    this.tarefas = [];
    this.ultimoTile = null;
    this.nickOcupado = false;
    this.sniffando = false;
    this.emIntro = false;
    this.indicadoresDePorta = new Map();

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(this.perfil.tema.fundo)).setOrigin(0).setScrollFactor(0).setDepth(0);
    this.luz = criarIluminacao(this, this.perfil);
    this.dialogo = new Dialogo(this);
    this.barra = new Barra(this, 900);
    this.nick = new NickSprite(this, this.perfil);
    this.balao = new BalaoDoNick(this);
    this.seta = new SetaDeFarejar(this);
    this.icone = new IconeDeDica(this, () => this.abrirDica());
    const margem = perfilDe(this).espaco.pequeno;
    const lado = perfilDe(this).tile;
    this.iconePausa = new IconeDeTela(this, 'pausa', margem, margem, CHAVES_DA_PAUSA, () => this.abrirPausaPeloIcone());
    this.iconeSom = new IconeDeTela(this, 'som', xDoIcone('som', 'exploracao', margem, lado), margem, CHAVES_DO_SOM.ligado, () => this.alternarSomPeloIcone());
    this.fade = this.add
      .rectangle(0, 0, largura, altura, numeroDaCor(this.perfil.tema.fundo), 1)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(PROFUNDIDADE_FADE)
      .setAlpha(0);

    const inicio = this.sv.conteudo.inicio;
    this.jogador = this.add.sprite(0, 0, sprites.andar(this.sobrinho().id, 'baixo'), 0).setOrigin(0, 0).setDepth(PROFUNDIDADE_JOGADOR);
    if (dados.modo === 'intro') {
      this.carregarSubarea(inicio.mapa, inicio.spawn);
      this.iniciarIntroducao(this.sobrinho());
    } else if (dados.modo === 'explorar') {
      // Modo explorar (ADR-010 1.2, EX1): a Sala, tile (3, 7), de frente para a árvore, com o Nick acordado atrás (3, 6).
      this.carregarSubarea('sala', undefined, { x: 3, y: 7 });
      this.dir = 'baixo';
      this.sv.sessao.progresso.nick.posicionarNoModoExplorar({ mapa: 'sala', x: 3, y: 6 }, 'baixo');
      this.atualizarVisualDoNick();
      this.fade.setAlpha(1);
      this.tweens.add({ targets: this.fade, alpha: 0, duration: 500 });
    } else {
      // Condução: a casa já está com as luzes acesas; o Sobrinho começa no tile da ação (na frente do interruptor).
      const o = dados.origem!;
      // Estado de condução antes de carregar: o pisca da árvore não nasce durante o trajeto (GDD 14.11.1, item 5).
      // A fase vem antes da subárea: a peça que sai do chão já não é desenhada nem bloqueia (backlog 052, critério 5).
      this.estado = 'conducao';
      this.faseDaConducao = (dados.fase ?? 'luzes') as Fase;
      this.carregarSubarea(o.mapa, undefined, { x: o.x, y: o.y });
      this.iniciarConducao(o, dados.fase ?? 'luzes');
    }
  }

  /** Situação atual da partida: fases concluídas e subáreas abertas pela missão ativa (ADR-004 seção 9.1). */
  private concluida = (fase: Fase): boolean => this.sv.sessao.faseConcluida(fase);

  /**
   * Contexto de agora. Durante a condução de uma parte (ou da caixa), a peça (ou a caixa) dela sai do chão: chão livre,
   * sem desenho. A caixa de enfeite só fica visível depois que a parte 3 libera a fase (ADR-006 seção 2.4).
   */
  private contexto(): ContextoDeArea {
    const retirada = this.estado === 'conducao' ? pecaRetiradaNaConducao(this.faseDaConducao) : undefined;
    return contextoDaPartida(this.sv.conteudo.missoes, this.concluida, { retirada, caixaLiberada: this.sv.sessao.progresso.caixaLiberada });
  }

  private areaAberta(id: string): boolean {
    return this.contexto().areaAberta(id);
  }

  /** Calcula a rota (Dijkstra, ADR-004 seção 11.2), decide a velocidade e começa o trajeto (GDD 14.11). */
  private iniciarConducao(origem: { mapa: string; x: number; y: number }, fase: string): void {
    const f = fase as Fase;
    const destino = conducaoDaFase(this.sv.conteudo.missoes, f);
    if (!destino) throw new Error(`Não há condução para a fase "${fase}".`);
    // Rota pela situação da própria fase: subáreas da missão dela, e a peça dela visível (ADR-004 seção 11.2).
    const { concluida, ctx } = situacaoDaFase(this.sv.conteudo.missoes, f);
    const r = calcularRotaDeConducao(this.sv.conteudo.todosOsMapas, { mapa: origem.mapa, x: origem.x, y: origem.y }, destino, concluida, ctx);
    if (!r) throw new Error(`Condução de "${fase}" sem rota a partir de (${origem.mapa}, ${origem.x}, ${origem.y}).`);
    this.rota = r.nos;
    this.indiceRota = 0;
    this.fatorConducao = fatorDaConducao(r.passos);
    this.faseDaConducao = f;
    this.estado = 'conducao';
    this.barra.setVisible(false);
    // A seta de farejar não atravessa a condução (B não age nela, GDD 16.5.1).
    this.sv.sessao.farejo.cancelar();
  }

  /** Avança o trajeto: anda tile a tile na velocidade decidida; cada porta é um fade (GDD 14.11.3). */
  private conduzir(delta: number): void {
    if (this.transitando) return;
    const prox = this.rota[this.indiceRota + 1];
    if (!prox) {
      this.chegou();
      return;
    }
    if (prox.mapa !== this.mapa.id) {
      // Entrada de porta: o próximo nó é o spawn de chegada, na outra subárea (fade de 14.10.5).
      this.indiceRota++;
      this.transitar(prox.mapa, prox.spawn!);
      return;
    }
    const alvo = posicaoDoTile(prox.x + this.desl.x, prox.y + this.desl.y, this.geo);
    const passo = (this.sv.sessao.progresso.sobrinho.habilidades.velocidadeTilesPorSegundo * this.perfil.tile * this.fatorConducao * delta) / 1000;
    const dx = alvo.x - this.pos.x;
    const dy = alvo.y - this.pos.y;
    if (Math.abs(dx) < 0.01 && Math.abs(dy) < 0.01) {
      this.pos = alvo;
      this.indiceRota++;
      return;
    }
    const dir: Direcao = Math.abs(dx) >= Math.abs(dy) ? (dx > 0 ? 'direita' : 'esquerda') : dy > 0 ? 'baixo' : 'cima';
    this.dir = dir;
    if (Math.abs(dx) >= Math.abs(dy)) this.pos = { x: this.pos.x + Math.sign(dx) * Math.min(passo, Math.abs(dx)), y: this.pos.y };
    else this.pos = { x: this.pos.x, y: this.pos.y + Math.sign(dy) * Math.min(passo, Math.abs(dy)) };
    this.andarAnimado(dir);
  }

  /**
   * Chegada ao destino da condução. Luzes (Marco 1): para de frente para a árvore e o diálogo automático abre sem tecla
   * (GDD 14.9.3, 14.11.1; D11). Peças (Marco 2): a peça desce sobre a árvore, a árvore muda, e então o diálogo de
   * chegada abre sozinho (GDD 15.6).
   */
  /** Reação à conquista (GDD 16.7): Nick acordado faz "feliz" 1,6 s e "Au!" uma vez. Sem esperar: o diálogo começa junto. */
  private reagirAConquista(): void {
    const n = this.sv.sessao.progresso.nick;
    if (reacaoDoNickNaConquista(n) !== 'feliz-e-au' || !this.nickNaArea()) return;
    // O último passo de caminhada do Nick ainda pode estar em tween: o fim dele chamaria parado() e cortaria o "feliz".
    // Cancela o tween e põe o Nick na posição final antes da animação.
    this.tweens.killTweensOf(this.nick.sprite);
    this.nick.posicionar(n.tile.x + this.desl.x, n.tile.y + this.desl.y, true);
    this.nick.feliz();
    this.mostrarBalao(CHAVE_BALAO.au, true);
    this.aguardar(FELIZ_MS, () => this.nick.parado(this.sv.sessao.progresso.nick.direcao));
  }

  private chegou(): void {
    this.pararAnimacao();
    const destino = conducaoDaFase(this.sv.conteudo.missoes, this.faseDaConducao)!;
    this.dir = destino.direcao;
    if (this.faseDaConducao === FASE_DO_ENFEITE) {
      this.encaixarEnfeite();
      return;
    }
    const ordem = ordemDaFase(this.faseDaConducao);
    if (this.faseDaConducao !== 'luzes' && ordem !== undefined) {
      this.encaixar(ordem);
      return;
    }
    this.estado = 'livre';
    this.criarHaloDaArvore();
    this.reagirAConquista();
    if (!deveAbrirChegada(this.sv.sessao)) {
      this.devolverControle();
      return;
    }
    this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
    // BUG-R15-01 (opção b): a caixa sobe para o topo, sem cobrir a árvore, o sobrinho nem o halo.
    // Depois do diálogo, o controle volta ao sobrinho e o Nick vai dormir no tile da próxima fase (ADR-005 seção 3.5).
    this.abrirDialogo(this.paginasDe([...CHAVES_DA_CHEGADA], {}), { posicao: 'topo', aoFim: () => this.devolverControle() });
  }

  /**
   * Encaixe de uma peça (GDD 15.6.4 e 15.6.5): a peça desce sobre a árvore em 0,6 s, com flash dourado de 0,3 s. A
   * fase é concluída no fim do flash; depois a árvore muda de estado e o diálogo de chegada abre sozinho.
   */
  private encaixar(ordem: number): void {
    tocarSom(this, 'S06');
    this.estado = 'cena';
    this.reagirAConquista();
    this.barra.setVisible(false);
    const copa = this.copaDaArvore;
    if (!copa) throw new Error('Encaixe sem árvore na subárea atual.');
    const tile = this.perfil.tile;
    const cx = copa.x + copa.w / 2;
    const cy = copa.y + copa.h / 2;
    const fase = FASE_DA_PECA[ordem];
    const peca = this.add.image(cx, cy - 2 * tile, CHAVE_DA_PECA[ordem]).setOrigin(0.5).setDepth(PROFUNDIDADE_BRILHO);
    this.tweens.add({
      targets: peca,
      y: cy,
      duration: DURACAO_DA_DESCIDA_MS,
      ease: 'Quad.easeIn',
      onComplete: () => {
        peca.destroy();
        const flash = this.add.rectangle(copa.x, copa.y, copa.w, copa.h, numeroDaCor(this.perfil.tema.destaque), 0.9).setOrigin(0).setDepth(PROFUNDIDADE_BRILHO);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          duration: DURACAO_DO_FLASH_MS,
          onComplete: () => {
            flash.destroy();
            // Nada se move antes do fim do encaixe (GDD 15.6.4): a árvore muda só agora.
            this.sv.concluirFase.executar(fase);
            const estado = estadoDaArvore(this.concluida);
            copa.img.setTexture(CHAVE_DA_ARVORE[estado]);
            this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
            this.abrirDialogo(this.paginasDe([chaveDaChegada(ordem)], {}), {
              posicao: 'topo',
              pausaAoFechar: false,
              aoFim: () => {
                this.estado = 'livre';
                this.devolverControle();
              },
            });
          },
        });
      },
    });
  }

  /**
   * Encaixe da caixa de enfeite (GDD 17.4 itens 3 e 4; ADR-006 seção 4, passo 5). Na Sala, ao chegar (3, 7): a caixa abre
   * (0,6 s), o enfeite sobe à árvore (0,8 s) e o flash (0,3 s) acaba o encaixe, 1,7 s no total. Só então a fase é
   * concluída e a árvore vai ao estado 4. Nick acordado reage junto. Depois, o diálogo final (ADR-006 seção 4, passo 6).
   */
  private encaixarEnfeite(): void {
    tocarSom(this, 'S06');
    this.estado = 'cena';
    this.reagirAConquista();
    this.barra.setVisible(false);
    const copa = this.copaDaArvore;
    if (!copa) throw new Error('Encaixe do enfeite sem árvore na subárea atual.');
    const tile = this.perfil.tile;
    // A caixa surge no tile do sobrinho, por cima dele, e o enfeite sai dela para a copa da árvore.
    const c = centroDosPes(this.pos, this.geo);
    const x = Math.floor(c.x / tile) * tile;
    const y = Math.floor(c.y / tile) * tile;
    const cx = copa.x + copa.w / 2;
    const cy = copa.y + copa.h / 2;
    const caixa = this.add.image(x, y, CHAVE_DO_ENFEITE.caixa, 0).setOrigin(0, 0).setDepth(PROFUNDIDADE_BRILHO);
    let enfeite: Phaser.GameObjects.Image | null = null;
    this.aguardar(ABERTURA_DA_CAIXA_MS, () => {
      caixa.setFrame(1);
      enfeite = this.add.image(x + tile / 2, y + tile / 2, CHAVE_DO_ENFEITE.flutuante).setOrigin(0.5).setDepth(PROFUNDIDADE_BRILHO);
      this.tweens.add({ targets: enfeite, x: cx, y: cy, duration: SUBIDA_DO_ENFEITE_MS, ease: 'Quad.easeOut' });
    });
    this.aguardar(ABERTURA_DA_CAIXA_MS + SUBIDA_DO_ENFEITE_MS, () => {
      caixa.destroy();
      enfeite?.destroy();
      const flash = this.add.rectangle(copa.x, copa.y, copa.w, copa.h, numeroDaCor(this.perfil.tema.destaque), 0.9).setOrigin(0).setDepth(PROFUNDIDADE_BRILHO);
      this.tweens.add({ targets: flash, alpha: 0, duration: DURACAO_DO_FLASH_MS, onComplete: () => flash.destroy() });
    });
    this.aguardar(ABERTURA_DA_CAIXA_MS + SUBIDA_DO_ENFEITE_MS + DURACAO_DO_FLASH_MS, () => {
      // Nada muda antes do fim do encaixe (GDD 17.4 item 3): a fase e a árvore mudam só agora.
      this.sv.concluirFase.executar(FASE_DO_ENFEITE);
      copa.img.setTexture(CHAVE_DA_ARVORE[estadoDaArvore(this.concluida)]);
      this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
      this.abrirDialogo(this.paginasDe([CHAVE_DA_CHEGADA_FINAL], {}), {
        posicao: 'topo',
        pausaAoFechar: false,
        aoFim: () => this.fimDoJogo(),
      });
    });
  }

  /**
   * Fim do jogo (GDD 17.4 item 6; ADR-006 seção 7.2): depois do diálogo final, fade de 0,5 s na cor do fundo e a tela de
   * créditos. Não há `DevolverControle`: não há destino de Nick depois da missão final (ADR-006 seção 1.4).
   */
  private fimDoJogo(): void {
    if (!jogoTerminou(this.sv.conteudo.missoes, this.concluida)) {
      this.devolverControle();
      return;
    }
    this.estado = 'cena';
    this.transitando = true;
    this.tweens.add({
      targets: this.fade,
      alpha: 1,
      duration: DURACAO_DO_FADE_FINAL_MS,
      // Tela de fim (GDD 20.4) antes dos créditos: a família, o texto e o JC (uma vez).
      onComplete: () => this.scene.start('Fim'),
    });
  }

  update(time: number, delta: number): void {
    // Botões do toque conforme a tela (GDD 18.4). Antes e depois do quadro: o fade, a condução e a porta mudam o modo
    // no meio do quadro, e a base do joystick não pode ficar visível um quadro a mais (backlog 134). Só age quando muda.
    this.mostrarToque();
    this.atualizarQuadro(time, delta);
    this.mostrarToque();
  }

  private atualizarQuadro(time: number, delta: number): void {
    this.atualizarPisca(time);
    // Tela da dica aberta: o mundo está parado (GDD 16.8.5). Só as teclas da dica agem.
    if (this.dica) {
      this.controles.atualizar();
      this.dica.atualizar(this.controles);
      this.icone.setVisible(false);
      this.atualizarIconesDeTela();
      return;
    }
    this.rodarTarefas(delta);
    if (this.estado === 'conducao') {
      // Durante a condução nenhuma tecla age (GDD 14.11.2): só o trajeto e a barra vazia.
      // A leitura descarta o que foi apertado no trajeto; sem isso, uma tecla segurada até a chegada
      // fecharia o diálogo forçado assim que ele abrisse (o Phaser guarda o "apertou" até ser lido).
      this.controles.atualizar();
      this.conduzir(delta);
      this.atualizarSprite(time);
      this.atualizarLuz();
      this.registrarPassoDoSobrinho();
      this.atualizarNickEFarejo(delta);
      this.barra.setVisible(false);
      this.icone.setVisible(false);
      this.atualizarIconesDeTela();
      return;
    }
    this.controles.atualizar();
    const entradaLiberada = time >= this.bloqueadoAte && !this.transitando;
    const a = entradaLiberada && this.controles.apertada('a');
    const b = entradaLiberada && this.controles.apertada('b');
    const h = entradaLiberada && this.controles.apertada('dica');
    if (this.estado === 'livre' && !this.transitando && this.controles.atalhoApertado('pausa') && podeAbrirPausa(this.modo())) {
      this.abrirPausa();
      return;
    }

    if (this.estado === 'dialogo') {
      if (a) this.dialogo.avancar();
      else if (b) this.dialogo.tratarX();
    } else if (this.estado === 'livre' && !this.transitando) {
      this.mover(delta, time);
      if (this.pisouNumaPorta()) return;
      if (a) this.interagir(time);
      else if (b && podeFarejar(this.modo())) this.farejar();
      else if (h) this.abrirDica();
    }

    this.atualizarSprite(time);
    this.atualizarLuz();
    this.atualizarHalo();
    this.registrarPassoDoSobrinho();
    this.atualizarNickEFarejo(delta);
    const modo = this.modo();
    if (this.estado === 'livre') this.barra.definir(this.sv.sessao.modo === 'explorar' ? ['barra.explorar1', 'barra.explorar2'] : ['barra.casa', 'barra.casa2']);
    this.barra.setVisible(this.estado === 'livre');
    this.icone.setVisible(podeAbrirDica(modo, this.sv.sessao.modo));
    this.atualizarIconesDeTela();
  }

  /** Ícones de pausa e de som conforme a tela (GDD 19.3.2; ADR-008 7.4). O som mostra ligado ou desligado. */
  private atualizarIconesDeTela(): void {
    const visiveis = iconesDaTela(this.modo());
    this.iconePausa.setVisivel(visiveis.pausa);
    this.iconeSom.setVisivel(visiveis.som);
    this.iconeSom.trocarChaves(somDaCena(this)?.estaMudo ? CHAVES_DO_SOM.desligado : CHAVES_DO_SOM.ligado);
  }

  /** II: abre a pausa, se a casa estiver livre e a regra de abertura permitir (ADR-008 6.1). */
  private abrirPausaPeloIcone(): void {
    if (this.estado === 'livre' && !this.transitando && podeAbrirPausa(this.modo())) this.abrirPausa();
  }

  /** Som: liga ou desliga (mesmo efeito de M e do item da pausa; ADR-008 3.3). */
  private alternarSomPeloIcone(): void {
    somDaCena(this)?.alternarMudo(telaDoSomDaCena(this));
  }

  /**
   * Botões do toque para o modo atual (ADR-007 seção 6). Sem toque, não faz nada. Nos diálogos, a caixa de texto é
   * reservada: no layout B, A e B ficam fora dela (ela cobre a parte de baixo ou de cima da tela).
   */
  /**
   * Pausa (GDD 19.3; ADR-008 6.2): a casa dorme (`sleep`: não atualiza e não desenha, então nada dela aparece por baixo da
   * pausa; `pause` ainda desenhava a cena congelada) e a PausaScene abre por cima. O `wake` devolve a casa do mesmo ponto.
   */
  private abrirPausa(): void {
    this.scene.sleep();
    this.scene.launch('Pausa', { origem: 'Casa' });
  }

  private mostrarToque(): void {
    const modo = this.modo();
    definirTelaDoSom(this, modo as TelaDoSom);
    let reserva: { topo: number; fundo: number } | null = null;
    if (modo === 'dialogo' || modo === 'introducao') {
      const altura = this.perfil.dialogo.altura;
      const topo = caixaYDoDialogo(telaDe(this.perfil).altura, altura, this.posicaoDaCaixa);
      reserva = { topo, fundo: topo + altura };
    }
    toqueDaCena(this)?.mostrarPara(modo, reserva);
  }

  /** Modo da tela (ADR-005 seção 1.4): a fonte dos bloqueios de B e H. */
  private modo(): ModoDaTela {
    if (this.dica) return 'dica';
    if (this.transitando) return 'fade';
    switch (this.estado) {
      case 'livre':
        return 'exploracao';
      case 'dialogo':
        return this.emIntro ? 'introducao' : 'dialogo';
      case 'painel':
        return 'painel';
      case 'cena':
        return 'conquista';
      case 'conducao':
        return 'conducao';
    }
  }

  /** Ações temporizadas (Nick, balões). Não correm com a dica aberta, porque update retorna antes. */
  private aguardar(ms: number, fn: () => void): void {
    this.tarefas.push({ restante: ms, fn });
  }

  private rodarTarefas(delta: number): void {
    if (this.tarefas.length === 0) return;
    for (const t of this.tarefas) t.restante -= delta;
    const prontas = this.tarefas.filter((t) => t.restante <= 0);
    this.tarefas = this.tarefas.filter((t) => t.restante > 0);
    for (const t of prontas) t.fn();
  }

  // ---------- Subárea ----------

  /** Monta a subárea: piso, objetos, colisão e spawn. Apaga o que era da subárea anterior. */
  carregarSubarea(id: string, nomeDoSpawn?: string, tile?: { x: number; y: number }): void {
    for (const d of this.desenhos) d.destroy();
    this.desenhos = [];
    this.halo = null;
    this.copaDaArvore = null;
    // Trocar de subárea apaga a seta e o balão (GDD 16.5.3: "trocar de cômodo: a seta some").
    this.seta.apagar();
    this.balao.apagar();
    this.sv.sessao.farejo.cancelar();
    this.indicadoresDePorta.clear();
    const mapa = this.sv.conteudo.todosOsMapas.get(id);
    if (!mapa || !this.areaAberta(id)) throw new Error(`Subárea "${id}" não está aberta nesta missão.`);
    const tela = this.perfil.sala;
    this.mapa = mapa;
    this.desl = deslocamentoDaSubarea(mapa, tela);
    this.colisao = new ColisaoDoMapa(this.bloqueiosComNick());
    this.objetosTela = objetosNaTela(mapa, this.desl);
    this.enfeitesDaArea = { area: null, total: 0, piscantes: [] };
    const decoracao = this.sv.sessao.modo === 'explorar' ? this.sv.conteudo.decoracao.get(id) : undefined;
    if (decoracao) this.objetosTela.push(...this.objetosDaDecoracao(decoracao.enfeites, mapa));

    this.desenharPiso();
    this.desenharObjetos();
    this.desenharIndicadores();
    if (decoracao) this.desenharDecoracao(id, decoracao.enfeites);

    if (tile) {
      // Tile dado (condução): o personagem fica no tile, de frente para a direção que tinha.
      this.pos = posicaoDoTile(tile.x + this.desl.x, tile.y + this.desl.y, this.geo);
    } else {
      const sp = this.objetosTela.find((o) => o.tipo === 'spawn' && o.dados.nome === nomeDoSpawn);
      if (!sp) throw new Error(`Spawn "${nomeDoSpawn}" não existe em "${id}".`);
      this.pos = posicaoDoTile(sp.x, sp.y, this.geo);
      this.dir = sp.dados.direcao as Direcao;
    }
    this.pararAnimacao();
    this.atualizarSprite(this.time.now);
    this.ultimoTile = this.tileDoSobrinho();
    this.atualizarVisualDoNick();
    // O pisca da árvore começa ao chegar, não ao carregar a subárea (GDD 14.11.1, item 5).
    this.criarHaloDaArvore();
    // Cômodo escuro: aviso da primeira entrada, se a subárea tem o texto (GDD 14.1, 14.10.4).
    if (mapa.escuro && !this.sv.sessao.luzesAcesas() && this.sv.conteudo.textos.tem(`escuro.${id}`) && this.sv.sessao.primeiraVez(`escuro.${id}`)) {
      this.falar([`escuro.${id}`]);
    }
  }

  private registrar<T extends Phaser.GameObjects.GameObject>(objeto: T): T {
    this.desenhos.push(objeto);
    return objeto;
  }

  private desenharPiso(): void {
    const tile = this.perfil.tile;
    this.mapa.chao.forEach((linha, y) =>
      linha.forEach((gid, x) => {
        if (gid > 0) this.registrar(this.add.image((this.desl.x + x) * tile, (this.desl.y + y) * tile, CHAVE_DO_TILESET, gid - 1).setOrigin(0, 0));
      }),
    );
  }

  private desenharObjetos(): void {
    const tile = this.perfil.tile;
    for (const o of this.objetosTela) {
      const x = o.x * tile;
      const y = o.y * tile;
      if (o.tipo === 'movel') this.desenharMovel(o);
      if (o.tipo === 'arvore') {
        // Árvore: sprite do estado atual (GDD 15.4), ancorado pela base no tile do objeto (a imagem cresce para cima).
        const estado = estadoDaArvore(this.concluida);
        const copa = this.registrar(this.add.image(0, 0, CHAVE_DA_ARVORE[estado]).setOrigin(0, 0));
        const p = posicaoDoSpritePelaBase(o, tile, copa.height);
        copa.setPosition(p.x, p.y).setDepth(y + tile);
        this.copaDaArvore = { img: copa, x: p.x, y: p.y, w: copa.width, h: copa.height };
      }
      if (o.tipo === 'peca') this.desenharPeca(o);
      if (o.tipo === 'enfeite') this.desenharEnfeite(o);
      if (o.tipo === 'bilhete') {
        const bilhete = this.registrar(this.add.image(x, y, CHAVE.bilhete).setOrigin(0, 0).setDepth(y + tile));
        // Pisca suave para chamar atenção (GDD 14.4).
        this.tweens.add({ targets: bilhete, alpha: 0.6, duration: PERIODOS_DE_PULSO_MS.bilhete / 2, yoyo: true, repeat: -1 });
      }
      if (o.tipo === 'interruptor') {
        this.registrar(this.add.image(x, y, CHAVE.interruptor).setOrigin(0, 0).setDepth(y + tile));
        // Brilho fraco e constante para ser achável no escuro (GDD 14.3). Raio e alfa vêm do perfil.
        const brilho = this.perfil.objetos.brilhoInterruptor;
        this.registrar(
          this.add
            .graphics()
            .setDepth(PROFUNDIDADE_BRILHO)
            .fillStyle(numeroDaCor(this.perfil.tema.destaque), brilho.alfa)
            .fillCircle(x + tile / 2, y + tile / 2, brilho.raioEmTiles * tile),
        );
      }
      // Porta fechada: spr_porta (vista superior), com a faixa fina na aresta do lado de dentro (ADR-004 seção 6; docs, 8.2).
      if (o.tipo === 'portaFechada') {
        const saida = String(o.dados.saida) as Lado;
        this.desenharFaixaDePorta(o.x, o.y, OPOSTO[saida], portaEhVertical(o));
      }
      // Par com destino fechado nesta missão: age e desenha como porta fechada (ADR-004 seção 3). A faixa fica na aresta
      // voltada para a chegada, que é o lado de dentro; a orientação do sprite segue a aresta (vertical na parede
      // esquerda ou direita, horizontal em cima ou embaixo). Para P3 é a esquerda, e para P2 é a de baixo.
      if (o.tipo === 'porta' && !this.areaAberta(String(o.dados.destino))) {
        const chegada = this.objetosTela.find((c) => c.tipo === 'spawn' && c.dados.nome === o.dados.id);
        const aresta = chegada ? arestaDoParFechado(o, chegada) : undefined;
        if (aresta) this.desenharFaixaDePorta(o.x, o.y, aresta, aresta === 'esquerda' || aresta === 'direita');
      }
      // Porta trancada (P8): a porta fica no vão, não no gatilho (ADR-004 seção 3): o vão é o tile da saída do conteúdo.
      if (o.tipo === 'porta' && o.dados.trancadaAte !== undefined && !this.concluida(String(o.dados.trancadaAte) as Fase)) {
        const saida = ladoDaPorta(o);
        if (saida) {
          const v = vaoDaPorta(o, saida);
          this.desenharFaixaDePorta(v.x, v.y, OPOSTO[saida], saida === 'esquerda' || saida === 'direita', v.y * tile + tile);
        }
      }
    }
    // Porta destrancada e passagem aberta não têm sprite: o piso já é a passagem (ADR-004 seção 3).
  }

  /**
   * Desenha o sprite fino de porta (32×32, faixa de 8 px no centro) com o centro na aresta do tile (tx, ty) indicado pelo
   * lado `aresta` (docs/mapa-casa-real.md, 8.2). `tx, ty` são tiles da tela (como `objetosTela`). A profundidade é a da
   * linha do tile, como os outros objetos.
   */
  private desenharFaixaDePorta(tx: number, ty: number, aresta: Lado, vertical: boolean, profundidade?: number): void {
    const tile = this.perfil.tile;
    const x = tx * tile;
    const y = ty * tile;
    const meio = tile / 2;
    const centro =
      aresta === 'cima' ? { x: x + meio, y } : aresta === 'baixo' ? { x: x + meio, y: y + tile } : aresta === 'esquerda' ? { x, y: y + meio } : { x: x + tile, y: y + meio };
    this.registrar(
      this.add
        .image(centro.x, centro.y, vertical ? CHAVE.portaVertical : CHAVE.porta)
        .setOrigin(0.5)
        .setDepth(profundidade ?? y + tile),
    );
  }

  /**
   * Peça da árvore (GDD 15.2.3 e 15.2.4): só a visível aparece, com o brilho dourado. A escondida não é desenhada, e a
   * encaixada some do chão (a camada aparece na árvore).
   */
  private desenharPeca(o: ObjetoDoMapa): void {
    const ordem = Number(o.dados.ordem);
    if (this.contexto().estadoDaPeca(ordem) !== 'visivel') return;
    const tile = this.perfil.tile;
    const x = o.x * tile;
    const y = o.y * tile;
    this.brilhoDoTile(x, y);
    this.registrar(this.add.image(x, y, CHAVE_DA_PECA[ordem]).setOrigin(0, 0).setDepth(y + tile));
  }

  /**
   * Caixa de enfeite (GDD 17.3; ADR-006 seção 2.4): só aparece `visivel`, com o brilho dourado. Escondida não tem desenho
   * (o tile só tem aviso); encaixada sai do chão (a caixa vai para a árvore).
   */
  private desenharEnfeite(o: ObjetoDoMapa): void {
    if (this.contexto().estadoDoEnfeite() !== 'visivel') return;
    const tile = this.perfil.tile;
    const x = o.x * tile;
    const y = o.y * tile;
    this.brilhoDoTile(x, y);
    this.registrar(this.add.image(x, y, CHAVE_DO_ENFEITE.caixa, 0).setOrigin(0, 0).setDepth(y + tile));
  }

  /** Brilho dourado pulsante atrás de um objeto de tile (GDD 15.2.4; a peça e a caixa usam o mesmo, ADR-006 seção 2.4). */
  private brilhoDoTile(x: number, y: number): void {
    const tile = this.perfil.tile;
    const m = MARGEM_DO_BRILHO_DA_PECA;
    const brilho = this.registrar(
      this.add
        .rectangle(x - m, y - m, tile + 2 * m, tile + 2 * m, numeroDaCor(this.perfil.tema.destaque), BRILHO_DA_PECA_MIN)
        .setOrigin(0, 0)
        .setDepth(y + tile - RECUO_DO_HALO_NA_PROFUNDIDADE),
    );
    this.tweens.add({
      targets: brilho,
      alpha: { from: BRILHO_DA_PECA_MIN, to: BRILHO_DA_PECA_MAX },
      duration: PERIODO_DO_BRILHO_DA_PECA_MS / 2,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Indicadores de saída das portas (GDD 14.10.10, item 046; pedido do Diretor: setas também nas portas fechadas
   * laterais): imagens estáticas, sem colisão nem gatilho. A seta fica logo acima do sprite da própria porta
   * (profundidade da porta + 0,5); o tapete fica no chão.
   */
  /**
   * Enfeites do modo explorar (ADR-010 3.3 e 3.4): só os de tile bloqueado com texto viram alvo do A, como objetos
   * examináveis. A colisão não muda: o tile já era bloqueado.
   */
  private objetosDaDecoracao(enfeites: EnfeiteBruto[], mapa: MapaDoJogo): ObjetoDoMapa[] {
    return enfeites
      .filter((e) => mapa.colisao[e.y]?.[e.x] === true && e.examinar !== null)
      .map((e) => ({ tipo: 'examinavel', x: e.x + this.desl.x, y: e.y + this.desl.y, dados: { texto: e.examinar!, nome: e.id } }));
  }

  /** Desenha os enfeites da subárea (ADR-010 3.9): ordenados pela base, como os outros objetos de tile. */
  private desenharDecoracao(area: string, enfeites: EnfeiteBruto[]): void {
    const tile = this.perfil.tile;
    const piscantes: Phaser.GameObjects.Sprite[] = [];
    for (const e of enfeites) {
      const x = (this.desl.x + e.x) * tile;
      const y = (this.desl.y + e.y) * tile;
      if (this.quadrosDoSprite(e.sprite) === 2) {
        const s = this.add.sprite(x, y, e.sprite, 0).setOrigin(0, 0).setDepth(y + tile);
        this.registrar(s);
        if (e.pisca) piscantes.push(s);
      } else {
        this.registrar(this.add.image(x, y, e.sprite).setOrigin(0, 0).setDepth(y + tile));
      }
    }
    this.enfeitesDaArea = { area, total: enfeites.length, piscantes };
  }

  /** Quadros do sprite do perfil (ADR-003): 2 para folha de luz ou vela; 1 para imagem. */
  private quadrosDoSprite(chave: string): number {
    const img = arteDe(this).sprites.imagens.find((i) => i.arquivo === `${chave}.png`);
    return img?.quadros ?? 1;
  }

  /** Pisca de 1 Hz das luzes (ADR-010 3.5). Só troca o quadro; nunca mais de um ciclo por segundo (AC4). */
  private atualizarPisca(time: number): void {
    const quadro = quadroDoPisca(time);
    for (const s of this.enfeitesDaArea.piscantes) s.setFrame(quadro);
  }

  /** Resumo dos enfeites para o gancho de QA (ADR-010 4): total, visíveis, piscando e quadro. */
  enfeites(): { area: string | null; total: number; visiveis: number; piscando: number; quadro: 0 | 1 } {
    const visiveis = this.sv.sessao.modo === 'explorar' ? this.enfeitesDaArea.total : 0;
    return {
      area: this.enfeitesDaArea.area ?? this.mapa?.id ?? null,
      total: this.enfeitesDaArea.total,
      visiveis,
      piscando: this.enfeitesDaArea.piscantes.length,
      quadro: quadroDoPisca(this.time.now),
    };
  }

  private desenharIndicadores(): void {
    const tile = this.perfil.tile;
    for (const i of indicadoresDaSubarea(this.mapa, this.perfil.sala)) {
      const chave = CHAVE_DO_INDICADOR[i.tipo];
      // Sprite que não existe no perfil ativo não desenha nada (em vez de quebrar a cena).
      if (!this.textures.exists(chave)) continue;
      const x = (this.desl.x + i.x) * tile;
      const y = (this.desl.y + i.y) * tile;
      const profundidade = i.tipo === 'tapete' ? PROFUNDIDADE_INDICADOR : y + tile + 0.5;
      this.indicadoresDePorta.set(i.porta, this.registrar(this.add.image(x, y, chave).setOrigin(0, 0).setDepth(profundidade)));
    }
  }

  /**
   * Móvel (contrato da Arte): retângulo de madeira placeholder, sem sprite. A profundidade é a da base do
   * retângulo, como a dos outros objetos de tile: fica acima do chão e sob os sobrinhos que estão na frente dele.
   * O nome sai centralizado só se couber em 2 tiles ou mais. Tudo isso entra na penumbra como os outros objetos.
   */
  private desenharMovel(o: ObjetoDoMapa): void {
    const tile = this.perfil.tile;
    const tilesDeLargura = Number(o.dados.w);
    const largura = tilesDeLargura * tile;
    const altura = Number(o.dados.h) * tile;
    const x = o.x * tile;
    const y = o.y * tile;
    const profundidade = y + altura;
    const retangulo = this.add.graphics().setDepth(profundidade);
    retangulo.fillStyle(COR_DA_BORDA_DO_MOVEL).fillRect(x, y, largura, altura);
    retangulo.fillStyle(COR_DO_MOVEL).fillRect(x + 1, y + 1, largura - 2, altura - 2);
    this.registrar(retangulo);
    if (tilesDeLargura < 2) return;
    // Piso de 12 px (backlog 131): o rótulo usa o maior tamanho (do corpo até 12) que cabe no móvel; se nem 12 cabe, não aparece.
    const rotulo = String(o.dados.nome);
    const tamanho = maiorTamanhoQueCabe(tamanhosAteOPiso(this.perfil.fonte.corpo), (t) => this.larguraDoRotulo(rotulo, t), largura - 2);
    const nome = this.add
      .text(x + largura / 2, y + altura / 2, rotulo, estilo(this.perfil, tamanho, this.perfil.tema.texto))
      .setOrigin(0.5)
      .setDepth(profundidade + 0.5);
    // Só se couber: se o nome for mais largo que o móvel, não aparece (sem corte nem reticências).
    if (nome.width <= largura - 2) this.registrar(nome);
    else nome.destroy();
  }

  // ---------- Jogador ----------

  private mover(delta: number, time: number): void {
    let dx = 0;
    let dy = 0;
    if (this.controles.segurada('esquerda')) dx = -1;
    else if (this.controles.segurada('direita')) dx = 1;
    else if (this.controles.segurada('cima')) dy = -1;
    else if (this.controles.segurada('baixo')) dy = 1;
    if (dx === 0 && dy === 0) {
      this.pararAnimacao();
      return;
    }
    const dir: Direcao = dx < 0 ? 'esquerda' : dx > 0 ? 'direita' : dy < 0 ? 'cima' : 'baixo';
    this.dir = dir;
    const velocidade = this.sv.sessao.progresso.sobrinho.habilidades.velocidadeTilesPorSegundo * this.perfil.tile;
    this.pos = mover(this.pos, dir, (velocidade * delta) / 1000, this.bloqueado, this.geo);
    if (time >= this.interagindoAte) this.andarAnimado(dir);
  }

  /** Bloqueio em coordenadas de tela: fora da subárea é sempre bloqueado (ADR-004 seção 2). */
  private bloqueado = (tx: number, ty: number): boolean => this.colisao.bloqueado(tx - this.desl.x, ty - this.desl.y);

  /** Tile dos pés, na tela, e o objeto de porta em cima dele (se houver). */
  private portaSobOsPes(): ObjetoDoMapa | undefined {
    const c = centroDosPes(this.pos, this.geo);
    const tx = Math.floor(c.x / this.perfil.tile);
    const ty = Math.floor(c.y / this.perfil.tile);
    return this.objetosTela.find((o) => o.tipo === 'porta' && o.x === tx && o.y === ty);
  }

  /** Andar sobre um gatilho destrancado leva à outra subárea (GDD 14.10.5 a). Retorna true se trocou. */
  private pisouNumaPorta(): boolean {
    const porta = this.portaSobOsPes();
    if (!porta) return false;
    const r = resolverPorta(porta, this.concluida, this.contexto());
    if (r.tipo !== 'entrar') return false;
    this.transitar(r.mapa, r.spawn);
    return true;
  }

  private andarAnimado(dir: Direcao): void {
    const chave = sprites.animacaoDeAndar(this.sobrinho().id, dir);
    if (this.jogador.anims.currentAnim?.key !== chave) this.jogador.play(chave);
  }

  private pararAnimacao(): void {
    if (this.jogador.anims.isPlaying) this.jogador.anims.stop();
  }

  private atualizarSprite(time: number): void {
    this.jogador.setPosition(this.pos.x, this.pos.y).setDepth(profundidadeDoQuadro(this.pos, this.geo));
    if (time < this.interagindoAte) return;
    // Parado: quadro 0 da caminhada na direção olhada (provisório até haver sprites parados por direção).
    if (!this.jogador.anims.isPlaying) this.jogador.setTexture(sprites.andar(this.sobrinho().id, this.dir), 0);
  }

  private sobrinho(): Sobrinho {
    return this.sv.sessao.progresso.sobrinho;
  }

  // ---------- Transição (ADR-004 seção 10; GDD 14.10.5) ----------

  /** Fade pela cor de fundo, troca de subárea e nascimento no spawn de chegada. Bloqueia o A durante o fade. */
  private transitar(mapa: string, spawn: string): void {
    this.transitando = true;
    definirTelaDoSom(this, 'fade');
    tocarSom(this, 'S02');
    this.pararAnimacao();
    this.tweens.add({
      targets: this.fade,
      alpha: 1,
      duration: METADE_DO_FADE_MS,
      onComplete: () => {
        this.carregarSubarea(mapa, spawn);
        // O Nick acordado vai para a chegada, oculto, e aparece no primeiro passo (PT3, 2026-11-09). Dormindo, não muda.
        const sp = this.mapa.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === spawn)!;
        this.sv.entrarNaArea.executar(this.mapa.id, { x: sp.x, y: sp.y }, sp.dados.direcao as DirecaoDoDominio);
        this.ultimoTile = { x: sp.x, y: sp.y };
        this.atualizarVisualDoNick();
        this.atualizarLuz();
        this.tweens.add({
          targets: this.fade,
          alpha: 0,
          duration: METADE_DO_FADE_MS,
          onComplete: () => {
            this.transitando = false;
            this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
          },
        });
      },
    });
  }

  // ---------- Interação (A) ----------

  private interagir(time: number): void {
    // Ordem do A (ADR-005 seção 3.6): objeto na frente ou encostado; o Nick dormindo entra nessa lista, no fim; o Nick
    // acordado só se nada acima achou.
    const achado = alvoDoA(
      this.objetosTela.filter((o) => TIPOS_INTERATIVOS.has(o.tipo)),
      this.objetoDoNickNaTela() ? { acordado: this.sv.sessao.progresso.nick.acordado, objeto: this.objetoDoNickNaTela()! } : undefined,
      this.pos,
      this.dir,
      this.geo,
    );
    if (!achado) return;
    this.pararAnimacao();
    this.jogador.setTexture(sprites.interagir(this.sobrinho().id));
    this.interagindoAte = time + 300;
    if (achado.tipo === 'nick') {
      this.interagirComNick();
      return;
    }
    const alvo = achado.objeto;

    switch (alvo.tipo) {
      case 'bilhete':
        this.falar(['bilhete.1', String(alvo.dados.texto)], { nome: this.sobrinho().nome });
        break;
      case 'porta': {
        const r = resolverPorta(alvo, this.concluida, this.contexto());
        if (r.tipo === 'trancada') this.abrirPainel(alvo);
        else if (r.tipo === 'fechada') this.falar(['porta.fechada']);
        else this.transitar(r.mapa, r.spawn);
        break;
      }
      case 'portaFechada':
      case 'examinavel':
        this.falar([String(alvo.dados.texto)]);
        break;
      case 'interruptor':
        // No modo explorar as luzes já estão acesas: o interruptor não tem ação, nem som nem texto (ADR-010 2).
        if (this.sv.sessao.modo !== 'explorar') this.acenderLuzes();
        break;
      case 'arvore':
        // Antes das luzes, A na árvore não faz nada (GDD 14.10.2, item 7). Depois, mostra o texto do estado (GDD 15.4).
        if (!this.sv.sessao.luzesAcesas()) break;
        this.sv.sessao.primeiraVez(CHAVE_EXAMINADA);
        // Caixa no topo, como a chegada (BUG-R15-01): o texto não cobre a árvore que ele descreve.
        this.falar([chaveDoEstadoDaArvore(estadoDaArvore(this.concluida))], {}, undefined, 'topo');
        break;
      case 'peca':
        this.interagirComPeca(alvo);
        break;
      case 'enfeite':
        this.interagirComEnfeite();
        break;
      default:
        break;
    }
  }

  /**
   * A numa peça (GDD 15.2.5 e 15.2.7). Visível: pega, e a conquista abre. Escondida: o aviso "ainda não" da peça
   * (não pega nada, não muda estado). Encaixada: nada. Antes das luzes, nenhuma peça responde (GDD 15.2.7).
   */
  private interagirComPeca(alvo: ObjetoDoMapa): void {
    if (!this.sv.sessao.luzesAcesas()) return;
    const ordem = Number(alvo.dados.ordem);
    const estado = this.contexto().estadoDaPeca(ordem);
    if (estado === 'visivel') {
      this.pegarPeca(ordem);
    } else if (estado === 'escondida') {
      const chave = chaveDoAviso(ordem, this.concluida);
      if (chave) this.falar([chave]);
    }
  }

  /** Pega a peça: a conquista abre com a ilustração da peça; a condução segue depois de "Continuar" (GDD 15.5 e 15.6). */
  private pegarPeca(ordem: number): void {
    tocarSom(this, 'S05');
    const fase = FASE_DA_PECA[ordem];
    const missao = missaoDaFase(this.sv.conteudo.missoes, fase)!;
    this.estado = 'cena';
    this.scene.start('Conquista', {
      chave: missao.missao.conquistas[fase],
      origem: this.origemDoSobrinho(),
      fase,
      ilustracao: CHAVE_DA_CONQUISTA_DA_PECA[ordem],
    });
  }

  /**
   * A (ou o encostado) na caixa de enfeite (GDD 17.3 e 17.4; ADR-006 seção 4). Escondida: o aviso "ainda não" (não pega
   * nada). Visível: pega. Encaixada: nada. Antes das luzes, nada responde.
   */
  private interagirComEnfeite(): void {
    if (!this.sv.sessao.luzesAcesas()) return;
    const estado = this.contexto().estadoDoEnfeite();
    if (estado === 'visivel') this.pegarEnfeite();
    else if (estado === 'escondida') this.falar([CHAVE_DO_AVISO_DO_ENFEITE]);
  }

  /** Pega a caixa: a conquista abre com a caixa aberta; a condução leva à Sala depois de "Continuar" (GDD 17.4 itens 1 e 2). */
  private pegarEnfeite(): void {
    const missao = missaoDaFase(this.sv.conteudo.missoes, FASE_DO_ENFEITE)!;
    this.estado = 'cena';
    this.scene.start('Conquista', {
      chave: missao.missao.conquistas[FASE_DO_ENFEITE],
      origem: this.origemDoSobrinho(),
      fase: FASE_DO_ENFEITE,
      ilustracao: CHAVE_DA_CONQUISTA_DO_ENFEITE,
    });
  }

  /** Tile local, na subárea, de onde o A foi dado (ponto de partida da condução, ADR-004 seção 11.1). */
  private origemDoSobrinho(): { mapa: string; x: number; y: number } {
    const c = centroDosPes(this.pos, this.geo);
    return {
      mapa: this.mapa.id,
      x: Math.floor(c.x / this.perfil.tile) - this.desl.x,
      y: Math.floor(c.y / this.perfil.tile) - this.desl.y,
    };
  }

  private acenderLuzes(): void {
    if (!this.sv.acenderLuzes.executar()) return;
    tocarSom(this, 'S04');
    this.falar(['luz.clique'], {}, () => {
      this.estado = 'cena';
      this.tweens.add({
        targets: this.escuro,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          // Tela de sucesso (GDD 14.11.1, item 2); "Continuar" começa a condução a partir deste tile.
          const c = centroDosPes(this.pos, this.geo);
          const origem = {
            mapa: this.mapa.id,
            x: Math.floor(c.x / this.perfil.tile) - this.desl.x,
            y: Math.floor(c.y / this.perfil.tile) - this.desl.y,
          };
          this.scene.start('Conquista', { chave: this.sv.conteudo.missao.conquistas['luzes'], origem, fase: 'luzes' });
        },
      });
    });
  }


  // ---------- Nick e farejar (ADR-005 seções 3, 4 e 5) ----------

  /** Tile local do sobrinho, no quadro atual (centro dos pés). */
  private tileDoSobrinho(): { x: number; y: number } {
    const c = centroDosPes(this.pos, this.geo);
    return { x: Math.floor(c.x / this.perfil.tile) - this.desl.x, y: Math.floor(c.y / this.perfil.tile) - this.desl.y };
  }

  private tileDoSobrinhoNoMapa(): Tile {
    const t = this.tileDoSobrinho();
    return { mapa: this.mapa.id, x: t.x, y: t.y };
  }

  /** O Nick está nesta subárea e não está oculto. */
  private nickNaArea(): boolean {
    const n = this.sv.sessao.progresso.nick;
    return n.tile.mapa === this.mapa.id && !n.oculto;
  }

  /** O Nick como objeto da lista do A (coordenadas da tela). Só existe se está nesta subárea. */
  private objetoDoNickNaTela(): ObjetoDoMapa | undefined {
    if (!this.nickNaArea()) return undefined;
    const n = this.sv.sessao.progresso.nick;
    return { tipo: 'nick', x: n.tile.x + this.desl.x, y: n.tile.y + this.desl.y, dados: {} };
  }

  /** Bloqueios da subárea mais o tile de dormir do Nick (ADR-005 seção 3.4). Acordado não bloqueia. */
  private bloqueiosComNick(): boolean[][] {
    const grade = bloqueiosDaSubarea(this.mapa, this.concluida, this.contexto());
    const n = this.sv.sessao.progresso.nick;
    if (n.dormindo && n.tile.mapa === this.mapa.id && grade[n.tile.y]?.[n.tile.x] !== undefined) grade[n.tile.y][n.tile.x] = true;
    return grade;
  }

  private atualizarBloqueioDoNick(): void {
    this.colisao = new ColisaoDoMapa(this.bloqueiosComNick());
  }

  /** Posição e pose do Nick a partir do estado. Não mexe no Nick enquanto ele anda (tween) nem nas animações de ação. */
  private atualizarVisualDoNick(): void {
    const n = this.sv.sessao.progresso.nick;
    if (!this.nickNaArea()) {
      this.nick.visivel(false);
      return;
    }
    const sp = this.nick.sprite;
    if (!this.tweens.isTweening(sp)) this.nick.posicionar(n.tile.x + this.desl.x, n.tile.y + this.desl.y, true);
    this.nick.visivel(true);
    const anim = sp.anims.currentAnim?.key;
    if (n.dormindo && anim !== ANIM_NICK.dormir) this.nick.dormir();
    else if (n.acordado && anim === ANIM_NICK.dormir) this.nick.parado(n.direcao);
  }

  /** Cada tile novo do sobrinho vai à fila do Nick (ADR-005 seção 3.1), também na condução. */
  private registrarPassoDoSobrinho(): void {
    if (this.transitando) return;
    const t = this.tileDoSobrinho();
    if (this.ultimoTile && this.ultimoTile.x === t.x && this.ultimoTile.y === t.y) return;
    this.ultimoTile = t;
    tocarSom(this, 'S01');
    const mov = this.sv.registrarPasso.executar({ mapa: this.mapa.id, x: t.x, y: t.y }, this.dir);
    this.aoMoverNick(mov);
  }

  /** O Nick andou um tile (tween na velocidade do sobrinho, 2× na condução) ou saltou (fila descontínua). */
  private aoMoverNick(mov: MovimentoDoNick): void {
    if (mov.tipo === 'parou' || !this.nickNaArea()) {
      this.atualizarVisualDoNick();
      return;
    }
    const sp = this.nick.sprite;
    const destino = posicaoDoTile(mov.para.x + this.desl.x, mov.para.y + this.desl.y, this.nick.geo);
    this.tweens.killTweensOf(sp);
    this.nick.visivel(true);
    if (mov.tipo === 'saltou') {
      this.nick.moverPx(destino.x, destino.y);
      this.nick.parado(mov.direcao);
      return;
    }
    const velocidade = this.sv.sessao.progresso.sobrinho.habilidades.velocidadeTilesPorSegundo;
    const fator = this.estado === 'conducao' ? this.fatorConducao : 1;
    this.nick.andar(mov.direcao);
    this.tweens.add({
      targets: sp,
      x: destino.x,
      y: destino.y,
      duration: 1000 / (velocidade * fator),
      onUpdate: () => this.nick.moverPx(sp.x, sp.y),
      onComplete: () => this.nick.parado(mov.direcao),
    });
  }

  /** A no Nick (ADR-005 seção 3.6): dormindo acorda (1,2 s, controle travado); acordado abana. */
  private interagirComNick(): void {
    const r = this.sv.acordarNick.executar(this.tileDoSobrinhoNoMapa());
    if (r.tipo === 'abanou') {
      this.abanar();
      return;
    }
    const primeiraVez = r.primeiraVez;
    this.estado = 'cena';
    this.nickOcupado = true;
    this.nick.acordar();
    // "Au!" no segundo quadro (GDD 16.3). O "!" amarelo já está no quadro 2 do sprite de acordar.
    this.aguardar(ACORDAR_MS / 4, () => this.mostrarBalao(CHAVE_BALAO.au, true));
    this.aguardar(ACORDAR_MS, () => {
      this.nickOcupado = false;
      this.nick.parado(this.sv.sessao.progresso.nick.direcao);
      this.atualizarBloqueioDoNick();
      if (primeiraVez) this.abrirDialogo(this.paginasDe(['nick.acordou'], {}), {});
      else this.estado = 'livre';
    });
  }

  private abanar(): void {
    this.estado = 'cena';
    this.nickOcupado = true;
    this.nick.feliz();
    this.aguardar(ABANAR_MS, () => {
      this.nickOcupado = false;
      this.estado = 'livre';
      this.nick.parado(this.sv.sessao.progresso.nick.direcao);
    });
  }

  /**
   * B na exploração (ADR-005 seção 4.1; GDD 16.5.3, 16.17 (a) e pergunta 35). Cada B refaz o farejando (1,2 s), depois as
   * tremidas da seta e os 5 s. B só é ignorado enquanto o farejando está em curso (nickOcupado). Com o Nick oculto (troca
   * de área, GDD 16.17 (c)), não há animação de farejar: a seta aparece na hora e o "Au!" sai no tile dele.
   */
  private farejar(): void {
    if (this.nickOcupado) return;
    // Modo explorar (ADR-010 2): o Nick fareja com a animação e o S08, sem seta (não há alvo).
    if (this.sv.sessao.modo === 'explorar') {
      this.farejarEDepois(() => undefined);
      return;
    }
    const oculto = this.sv.sessao.progresso.nick.oculto;
    const r = this.sv.farejarComNick.executar(this.mapa.id);
    switch (r.tipo) {
      case 'dormindo':
        this.mostrarBalao(CHAVE_BALAO.zzz, false);
        return;
      case 'mesmoComodo':
        if (oculto) this.mostrarBalao(CHAVE_BALAO.au, true);
        else this.farejarEDepois(() => this.mostrarBalao(CHAVE_BALAO.au, true));
        return;
      case 'porta':
        // Farejo.mostrar já reiniciou os 5 s. A seta some enquanto o farejando roda (atualizarSeta) e volta tremendo.
        if (oculto) return;
        this.sniffando = true;
        this.farejarEDepois(() => {
          this.sniffando = false;
        });
        return;
      case 'semAlvo':
        this.nickOcupado = true;
        this.nick.feliz();
        this.mostrarBalao(CHAVE_BALAO.au, true);
        this.aguardar(ABANAR_MS, () => {
          this.nickOcupado = false;
          this.nick.parado(this.sv.sessao.progresso.nick.direcao);
        });
        return;
    }
  }

  private farejarEDepois(depois: () => void): void {
    tocarSom(this, 'S08');
    this.nickOcupado = true;
    this.nick.farejar();
    this.aguardar(FAREJAR_MS, () => {
      this.nickOcupado = false;
      this.nick.parado(this.sv.sessao.progresso.nick.direcao);
      depois();
    });
  }

  /**
   * Balão sobre o Nick por 1,5 s. Um balão novo substitui o anterior. Com o Nick oculto, o balão sai sobre o tile dele
   * (GDD 16.17 (c)), mesmo sem o sprite desenhado.
   */
  private mostrarBalao(chave: string, comTexto: boolean): void {
    if (comTexto) tocarSom(this, 'S07');
    const n = this.sv.sessao.progresso.nick;
    if (n.tile.mapa !== this.mapa.id) return;
    const p = this.nickNaArea()
      ? { x: this.nick.sprite.x, y: this.nick.sprite.y }
      : posicaoDoTile(n.tile.x + this.desl.x, n.tile.y + this.desl.y, this.nick.geo);
    const id = ++this.balaoId;
    this.balao.mostrar(chave, p.x, p.y, this.nick.geo.quadro.w, comTexto ? this.sv.conteudo.textos.t('nick.latido') : undefined);
    this.aguardar(BALAO_MS, () => {
      if (this.balaoId === id) this.balao.apagar();
    });
  }

  /** Seta dourada na porta a seguir enquanto o Farejo tem a porta e o Nick não está farejando (GDD 16.5.3). */
  private atualizarSeta(): void {
    const f = this.sv.sessao.farejo;
    const porta = f.porta;
    if (f.ativo && porta && porta.mapa === this.mapa.id && !this.sniffando) {
      this.seta.mostrar(porta, this.desl, this.perfil.tile);
      this.indicadoresDePorta.get(porta.id)?.setVisible(false);
      return;
    }
    if (this.seta.visivel) this.seta.apagar(!f.ativo);
    // A seta branca estática só volta quando a seta de farejar acabou (não durante o farejando refeito).
    if (!f.ativo) this.indicadoresDePorta.forEach((i) => i.setVisible(true));
  }

  private atualizarNickEFarejo(delta: number): void {
    const f = this.sv.sessao.farejo;
    // Os 5 s não correm durante a animação de farejar nem com a dica aberta (ADR-005 seção 4.5).
    if (!this.sniffando && f.ativo) f.avancar(delta);
    this.atualizarSeta();
    this.atualizarVisualDoNick();
  }

  /** Dica (H ou o ícone): só na exploração (ADR-005 seção 5.2). Congela o mundo. */
  private abrirDica(): void {
    if (!podeAbrirDica(this.modo(), this.sv.sessao.modo)) return;
    const d = this.sv.montarDica.executar();
    if (!d) return;
    const t = this.sv.conteudo.textos;
    const entrada = textoDeEntrada(this);
    const linhas = d.chavesDoTexto.flatMap((k) => entrada.paginas(k));
    this.pausarMundo(true);
    // A barra é passada como chave: o Barra resolve o texto (e a versão de toque). Passar o texto virava "[texto]".
    this.dica = new DicaOverlay(
      this,
      { titulo: t.t(d.tituloChave), linhas, estadoDaArvore: d.estadoDaArvore, voltar: t.t('dica.voltar'), barra: 'barra.dica' },
      () => this.fecharDica(),
    );
  }

  private fecharDica(): void {
    this.dica = null;
    this.pausarMundo(false);
  }

  /** Pausa do mundo com a dica: tweens, animações do sobrinho e do Nick. Os tempos (tarefas) param porque update retorna. */
  private pausarMundo(pausado: boolean): void {
    if (pausado) {
      this.tweens.pauseAll();
      this.jogador.anims.pause();
      this.nick.pausar();
    } else {
      this.tweens.resumeAll();
      this.jogador.anims.resume();
      this.nick.retomar();
    }
  }

  /**
   * Fim do diálogo de chegada, com o controle de volta (ADR-005 seção 3.5). O Nick sai da fila e dorme no tile da próxima
   * fase, com fumacinha de 0,5 s onde estava e onde vai dormir (se a subárea atual é uma delas).
   */
  private devolverControle(): void {
    const r = this.sv.devolverControle.executar();
    if (!r) return;
    if (r.anterior.mapa === this.mapa.id) {
      const p = posicaoDoTile(r.anterior.x + this.desl.x, r.anterior.y + this.desl.y, this.nick.geo);
      fumacaDeDormir(this, p.x, p.y);
    }
    this.atualizarBloqueioDoNick();
    this.atualizarVisualDoNick();
    if (r.destino.mapa === this.mapa.id) {
      const p = posicaoDoTile(r.destino.x + this.desl.x, r.destino.y + this.desl.y, this.nick.geo);
      fumacaDeDormir(this, p.x, p.y);
    }
  }

  // ---------- Diálogo ----------

  /** Páginas de uma lista de chaves: cada chave pode ter uma ou várias páginas (avisos, ADR-002 seção 2.2). */
  private paginasDe(chaves: string[], vars: Record<string, string>): string[] {
    const t = textoDeEntrada(this);
    return chaves.flatMap((k) => t.paginas(k, vars));
  }

  private falar(chaves: string[], vars: Record<string, string> = {}, aoFim?: () => void, posicao: PosicaoDaCaixa = 'base'): void {
    this.abrirDialogo(this.paginasDe(chaves, vars), { posicao, aoFim });
  }

  /**
   * Abre um diálogo. Por padrão, ao fechar, o controle volta depois de 200 ms (como os outros diálogos, GDD 14.9.1).
   * Com `pausaAoFechar: false`, o controle volta na hora (GDD 15.6.6, diálogo de chegada da peça).
   */
  private abrirDialogo(
    paginas: string[],
    op: { posicao?: PosicaoDaCaixa; aoFim?: () => void; pausaAoFechar?: boolean } = {},
  ): void {
    this.estado = 'dialogo';
    this.posicaoDaCaixa = op.posicao ?? 'base';
    this.dialogo.abrir(paginas, {
      barra: ['barra.dialogo'],
      posicao: op.posicao ?? 'base',
      podeFechar: true,
      aoFim: () => {
        this.estado = 'livre';
        if (op.pausaAoFechar !== false) this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
        op.aoFim?.();
      },
    });
  }

  private iniciarIntroducao(sobrinho: Sobrinho): void {
    const inicio = this.sv.conteudo.inicio;
    const t = this.sv.conteudo.textos;
    this.estado = 'dialogo';
    this.emIntro = true;
    this.dialogo.abrir(
      inicio.paginas.map((k) => t.t(k, { nome: sobrinho.nome })),
      {
        // X volta uma página e nunca pula; na página 1 volta à seleção (GDD 14.1 e 14.8).
        barra: ['barra.intro'],
        podeFechar: false,
        paginaAnterior: { aoVoltarDaPrimeira: () => this.voltarASelecao() },
        aoFim: () => {
          this.estado = 'livre';
          this.emIntro = false;
          this.sv.concluirFase.executar('introducao');
          // Orientação ao ganhar o controle, uma vez por partida (GDD 14.9.1).
          if (this.sv.sessao.primeiraVez('orientacao')) this.falar(['orientacao.1', 'orientacao.2'], { nome: sobrinho.nome });
        },
      },
    );
  }

  /** Halo dourado atrás da árvore: pisca depois das luzes, até a árvore ser examinada (GDD 14.9.3; regra em chegadaDaArvore). */
  private criarHaloDaArvore(): void {
    if (this.estado === 'conducao') return;
    const arvore = this.objetosTela.find((o) => o.tipo === 'arvore');
    if (!arvore || !haloDaArvoreVisivel(this.sv.sessao)) return;
    const tile = this.perfil.tile;
    const m = this.perfil.objetos.halo.margem;
    const x = arvore.x * tile;
    const y = arvore.y * tile;
    this.halo = this.registrar(
      this.add
        .rectangle(x - m, y - m, tile + 2 * m, tile + 2 * m, numeroDaCor(this.perfil.tema.destaque), 1)
        .setOrigin(0, 0)
        .setDepth(y + tile + RECUO_DO_HALO_NA_PROFUNDIDADE),
    );
    this.inicioPisca = this.time.now;
  }

  private atualizarHalo(): void {
    if (!this.halo) return;
    if (!haloDaArvoreVisivel(this.sv.sessao)) {
      this.halo.setAlpha(0);
      this.halo = null;
      return;
    }
    // A intensidade vem do alfa do objeto (o preenchimento é opaco; setAlpha multiplica).
    this.halo.setAlpha(alfaDoPisca(this.time.now - this.inicioPisca));
  }

  /** Página 1 da introdução com X: volta à seleção, com o cartão escolhido em foco. */
  private voltarASelecao(): void {
    this.scene.start('Selecao', { foco: PERSONAGEM_IDS.indexOf(this.sobrinho().id) });
  }

  /** Passa à interface de luz o centro do personagem, o escuro da subárea e o fade (ADR-003 seção 7). */
  private atualizarLuz(): void {
    const c = centroDoQuadro(this.pos, this.geo);
    this.luz.atualizar({ x: c.x, y: c.y, cenaEscura: this.mapa.escuro, intensidade: this.escuro.alpha });
  }

  private larguraDoRotulo(texto: string, tamanho: number): number {
    const medida = this.add.text(0, 0, texto, estilo(this.perfil, tamanho));
    const largura = medida.width;
    medida.destroy();
    return largura;
  }

  // ---------- Porta trancada (painel do código) ----------

  private abrirPainel(porta: ObjetoDoMapa): void {
    const t = this.sv.conteudo.textos;
    this.estado = 'painel';
    this.gatilhoDoPainel = porta;
    this.barra.setVisible(false);
    this.painel = new PainelDeCodigo(this, {
      pergunta: t.t('porta.pergunta'),
      apagar: t.t('painel.apagar'),
      ok: t.t('painel.ok'),
      barra: ['barra.painel1', 'barra.painel2'],
      aoConfirmar: (digitos) => this.tentarCodigo(digitos),
      aoFechar: () => this.fecharPainel(),
    });
  }

  private fecharPainel(): void {
    this.painel?.destruir();
    this.painel = null;
    this.estado = 'livre';
    this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
  }

  private tentarCodigo(digitos: string): void {
    const t = this.sv.conteudo.textos;
    const r = this.sv.tentarCodigo.executar(digitos);
    switch (r.tipo) {
      case 'incompleto':
        this.painel?.mostrarMensagem(t.t('porta.faltam'));
        break;
      case 'errado':
        tocarSom(this, 'S13');
        this.painel?.mostrarMensagem(t.t(`porta.erro.${r.mensagem + 1}`));
        this.painel?.limpar();
        break;
      case 'certo': {
        const porta = this.gatilhoDoPainel!;
        tocarSom(this, 'S03');
        this.fecharPainel();
        // Ao fechar "Clique! A porta abriu.", o jogador vai para o outro lado (GDD 14.10.2, item 3).
        this.falar(['porta.abriu'], {}, () => this.transitar(String(porta.dados.destino), String(porta.dados.spawnDestino)));
        break;
      }
      case 'ja_aberta':
        this.fecharPainel();
        break;
    }
  }
}
