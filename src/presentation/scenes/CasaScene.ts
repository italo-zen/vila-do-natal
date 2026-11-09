import Phaser from 'phaser';
import { servicosDe, perfilDe, telaDe, numeroDaCor, estilo } from '../ui/tema';
import { Barra } from '../ui/Barra';
import { PERSONAGEM_IDS } from '../../domain/personagem/PersonagemId';
import { Controles } from '../input/Controles';
import { Dialogo } from '../ui/Dialogo';
import type { PosicaoDaCaixa } from '../ui/posicaoDoDialogo';
import { PainelDeCodigo } from '../ui/PainelDeCodigo';
import { criarIluminacao, type Iluminacao } from '../ui/iluminacao/Iluminacao';
import {
  CHAVE,
  CHAVE_DA_ARVORE,
  CHAVE_DA_CONQUISTA_DA_PECA,
  CHAVE_DA_PECA,
  CHAVE_DO_TILESET,
  sprites,
} from '../assets/registro';
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
import { conducaoDaFase, missaoDaFase } from '../../application/mundo/missoes';
import { fatorDaConducao } from '../../domain/progresso/Conducao';
import {
  ColisaoDoMapa,
  alvoDaInteracao,
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
import { alfaDoPisca } from '../ui/pisca';

export interface DadosDaCasa {
  /** "intro": começa pela introdução no início da missão. "conducao": a conquista acabou; o jogo leva o Sobrinho ao destino da fase (GDD 14.11). */
  modo: 'intro' | 'conducao';
  /** Tile (local) de onde a condução começa, e a fase que ela conclui (modo "conducao"). */
  origem?: { mapa: string; x: number; y: number };
  fase?: string;
}

type Estado = 'livre' | 'dialogo' | 'painel' | 'cena' | 'conducao';
type Lado = LadoDaPorta;

/** Objetos que respondem à ação A (GDD 14.9.2 e ADR-004 seção 6). */
const TIPOS_INTERATIVOS = new Set(['bilhete', 'porta', 'portaFechada', 'examinavel', 'interruptor', 'arvore', 'peca']);

/** Pausa depois de fechar um diálogo ou painel, antes de o personagem voltar a andar. Tempo de jogo. */
const PAUSA_DE_ENTRADA_MS = 200;
/** Duração de cada metade do fade entre subáreas (GDD 14.10.5: ~0,5 s no total). */
const METADE_DO_FADE_MS = 250;
/** Encaixe da peça (GDD 15.6.4): a peça desce em 0,6 s; o flash dourado dura 0,3 s. */
const DURACAO_DA_DESCIDA_MS = 600;
const DURACAO_DO_FLASH_MS = 300;
/** Halo da peça no chão (GDD 15.2.4): 4 px de margem; opacidade de 40% a 70% em pulso de 2 s. */
const MARGEM_DO_BRILHO_DA_PECA = 4;
const BRILHO_DA_PECA_MIN = 0.4;
const BRILHO_DA_PECA_MAX = 0.7;
const PERIODO_DO_BRILHO_DA_PECA_MS = 2000;
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
    this.cameras.main.setScroll(0, 0);
    this.estado = 'livre';
    this.bloqueadoAte = 0;
    this.painel = null;
    this.gatilhoDoPainel = null;
    this.transitando = false;
    this.interagindoAte = 0;
    this.copaDaArvore = null;
    this.escuro = { alpha: this.sv.sessao.luzesAcesas() ? 0 : 1 };

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(this.perfil.tema.fundo)).setOrigin(0).setScrollFactor(0).setDepth(0);
    this.luz = criarIluminacao(this, this.perfil);
    this.dialogo = new Dialogo(this);
    this.barra = new Barra(this, 900);
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

  /** Contexto de agora. Durante a condução de uma parte, a peça dela sai do chão (chão livre, sem desenho). */
  private contexto(): ContextoDeArea {
    const retirada = this.estado === 'conducao' ? pecaRetiradaNaConducao(this.faseDaConducao) : undefined;
    return contextoDaPartida(this.sv.conteudo.missoes, this.concluida, retirada);
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
  private chegou(): void {
    this.pararAnimacao();
    const destino = conducaoDaFase(this.sv.conteudo.missoes, this.faseDaConducao)!;
    this.dir = destino.direcao;
    const ordem = ordemDaFase(this.faseDaConducao);
    if (this.faseDaConducao !== 'luzes' && ordem !== undefined) {
      this.encaixar(ordem);
      return;
    }
    this.estado = 'livre';
    this.criarHaloDaArvore();
    if (!deveAbrirChegada(this.sv.sessao)) return;
    this.bloqueadoAte = this.time.now + PAUSA_DE_ENTRADA_MS;
    // BUG-R15-01 (opção b): a caixa sobe para o topo, sem cobrir a árvore, o sobrinho nem o halo.
    this.abrirDialogo(this.paginasDe([...CHAVES_DA_CHEGADA], {}), { posicao: 'topo' });
  }

  /**
   * Encaixe de uma peça (GDD 15.6.4 e 15.6.5): a peça desce sobre a árvore em 0,6 s, com flash dourado de 0,3 s. A
   * fase é concluída no fim do flash; depois a árvore muda de estado e o diálogo de chegada abre sozinho.
   */
  private encaixar(ordem: number): void {
    this.estado = 'cena';
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
              },
            });
          },
        });
      },
    });
  }

  update(time: number, delta: number): void {
    if (this.estado === 'conducao') {
      // Durante a condução nenhuma tecla age (GDD 14.11.2): só o trajeto e a barra vazia.
      // A leitura descarta o que foi apertado no trajeto; sem isso, uma tecla segurada até a chegada
      // fecharia o diálogo forçado assim que ele abrisse (o Phaser guarda o "apertou" até ser lido).
      this.controles.atualizar();
      this.conduzir(delta);
      this.atualizarSprite(time);
      this.atualizarLuz();
      this.barra.setVisible(false);
      return;
    }
    this.controles.atualizar();
    const entradaLiberada = time >= this.bloqueadoAte && !this.transitando;
    const a = entradaLiberada && this.controles.apertada('a');
    const b = entradaLiberada && this.controles.apertada('b');

    if (this.estado === 'dialogo') {
      if (a) this.dialogo.avancar();
      else if (b) this.dialogo.tratarX();
    } else if (this.estado === 'livre' && !this.transitando) {
      this.mover(delta, time);
      if (this.pisouNumaPorta()) return;
      if (a) this.interagir(time);
    }

    this.atualizarSprite(time);
    this.atualizarLuz();
    this.atualizarHalo();
    if (this.estado === 'livre') this.barra.definir(['barra.casa']);
    this.barra.setVisible(this.estado === 'livre');
  }

  // ---------- Subárea ----------

  /** Monta a subárea: piso, objetos, colisão e spawn. Apaga o que era da subárea anterior. */
  carregarSubarea(id: string, nomeDoSpawn?: string, tile?: { x: number; y: number }): void {
    for (const d of this.desenhos) d.destroy();
    this.desenhos = [];
    this.halo = null;
    this.copaDaArvore = null;
    const mapa = this.sv.conteudo.todosOsMapas.get(id);
    if (!mapa || !this.areaAberta(id)) throw new Error(`Subárea "${id}" não está aberta nesta missão.`);
    const tela = this.perfil.sala;
    this.mapa = mapa;
    this.desl = deslocamentoDaSubarea(mapa, tela);
    this.colisao = new ColisaoDoMapa(bloqueiosDaSubarea(mapa, this.concluida, this.contexto()));
    this.objetosTela = objetosNaTela(mapa, this.desl);

    this.desenharPiso();
    this.desenharObjetos();
    this.desenharIndicadores();

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
      if (o.tipo === 'bilhete') {
        const bilhete = this.registrar(this.add.image(x, y, CHAVE.bilhete).setOrigin(0, 0).setDepth(y + tile));
        // Pisca suave para chamar atenção (GDD 14.4).
        this.tweens.add({ targets: bilhete, alpha: 0.6, duration: 900, yoyo: true, repeat: -1 });
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
    this.registrar(this.add.image(x, y, CHAVE_DA_PECA[ordem]).setOrigin(0, 0).setDepth(y + tile));
  }

  /**
   * Indicadores de saída das portas (GDD 14.10.10, item 046; pedido do Diretor: setas também nas portas fechadas
   * laterais): imagens estáticas, sem colisão nem gatilho. A seta fica logo acima do sprite da própria porta
   * (profundidade da porta + 0,5); o tapete fica no chão.
   */
  private desenharIndicadores(): void {
    const tile = this.perfil.tile;
    for (const i of indicadoresDaSubarea(this.mapa, this.perfil.sala)) {
      const chave = CHAVE_DO_INDICADOR[i.tipo];
      // Sprite que não existe no perfil ativo não desenha nada (em vez de quebrar a cena).
      if (!this.textures.exists(chave)) continue;
      const x = (this.desl.x + i.x) * tile;
      const y = (this.desl.y + i.y) * tile;
      const profundidade = i.tipo === 'tapete' ? PROFUNDIDADE_INDICADOR : y + tile + 0.5;
      this.registrar(this.add.image(x, y, chave).setOrigin(0, 0).setDepth(profundidade));
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
    const nome = this.add
      .text(x + largura / 2, y + altura / 2, String(o.dados.nome), estilo(this.perfil, this.perfil.fonte.grade, this.perfil.tema.texto))
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
    this.pararAnimacao();
    this.tweens.add({
      targets: this.fade,
      alpha: 1,
      duration: METADE_DO_FADE_MS,
      onComplete: () => {
        this.carregarSubarea(mapa, spawn);
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
    const alvo = alvoDaInteracao(
      this.objetosTela.filter((o) => TIPOS_INTERATIVOS.has(o.tipo)),
      this.pos,
      this.dir,
      this.geo,
    );
    if (!alvo) return;
    this.pararAnimacao();
    this.jogador.setTexture(sprites.interagir(this.sobrinho().id));
    this.interagindoAte = time + 300;

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
        this.acenderLuzes();
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
    const c = centroDosPes(this.pos, this.geo);
    const origem = {
      mapa: this.mapa.id,
      x: Math.floor(c.x / this.perfil.tile) - this.desl.x,
      y: Math.floor(c.y / this.perfil.tile) - this.desl.y,
    };
    const fase = FASE_DA_PECA[ordem];
    const missao = missaoDaFase(this.sv.conteudo.missoes, fase)!;
    this.estado = 'cena';
    this.scene.start('Conquista', {
      chave: missao.missao.conquistas[fase],
      origem,
      fase,
      ilustracao: CHAVE_DA_CONQUISTA_DA_PECA[ordem],
    });
  }

  private acenderLuzes(): void {
    if (!this.sv.acenderLuzes.executar()) return;
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

  // ---------- Diálogo ----------

  /** Páginas de uma lista de chaves: cada chave pode ter uma ou várias páginas (avisos, ADR-002 seção 2.2). */
  private paginasDe(chaves: string[], vars: Record<string, string>): string[] {
    const t = this.sv.conteudo.textos;
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
    this.dialogo.abrir(
      inicio.paginas.map((k) => t.t(k, { nome: sobrinho.nome })),
      {
        // X volta uma página e nunca pula; na página 1 volta à seleção (GDD 14.1 e 14.8).
        barra: ['barra.intro'],
        podeFechar: false,
        paginaAnterior: { aoVoltarDaPrimeira: () => this.voltarASelecao() },
        aoFim: () => {
          this.estado = 'livre';
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
        this.painel?.mostrarMensagem(t.t(`porta.erro.${r.mensagem + 1}`));
        this.painel?.limpar();
        break;
      case 'certo': {
        const porta = this.gatilhoDoPainel!;
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
