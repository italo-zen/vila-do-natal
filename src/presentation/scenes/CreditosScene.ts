import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';
import { toqueDaCena } from '../ui/toque/toqueDaCena';
import { definirTelaDoSom, pararCreditosDaCena } from '../audio/somDaCena';

/** Fade de entrada e de saída da tela, em tempo de jogo (GDD 17.7: 0,5 s para entrar e sair). */
const DURACAO_DO_FADE_MS = 500;
/** Profundidade do fade: acima de tudo, como o fade da casa (ADR-004 seção 10). */
const PROFUNDIDADE_FADE = 1100;
/** Posições sem o sobrinho e a árvore (GDD 20.4): Nick, agradecimento e os dois botões, em pilha. */
const Y_NICK = 110;
const Y_AGRADECIMENTO = 142;
const Y_BOTAO_VOLTAR = 214;
const Y_BOTAO_EXPLORAR = 270;

/**
 * Créditos (GDD 17.7 e 20.4; ADR-006 seção 7; ADR-010 1 e 7). Itens 1, 2, 5, 6 e 7 de 17.7: título, nome do jogo, o Nick (só
 * o texto), o agradecimento e a versão. Sobrinho e árvore saem (a imagem de fim já traz). Dois botões: "Voltar ao título"
 * (foco inicial) e "Explorar a casa" (modo explorar, ADR-010 1.2). Z, X, Enter e clique agem sobre o botão; Esc age como X.
 * O jingle de créditos não toca aqui: toca ao abrir a tela de fim (GDD 20.4). Sem tempo, sem rolagem e sem gravação.
 */
export class CreditosScene extends Phaser.Scene {
  private controles!: Controles;
  private fade!: Phaser.GameObjects.Rectangle;
  private menu!: Menu;
  /** Verdadeiro depois do fade de entrada: antes dele, A e B não saem (evita sair com a tecla da casa). */
  private pronta = false;
  private saindo = false;

  constructor() {
    super('Creditos');
  }

  create(): void {
    const sv = servicosDe(this);
    const p = perfilDe(this);
    const t = sv.conteudo.textos;
    const { largura, altura } = telaDe(p);
    const tela = p.telas.creditos;
    this.controles = new Controles(this);
    definirTelaDoSom(this, 'creditos');
    toqueDaCena(this)?.mostrarPara('creditos');
    this.pronta = false;
    this.saindo = false;

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo)).setOrigin(0);
    this.add.text(tela.tituloX, tela.tituloY, t.t('creditos.titulo'), estilo(p, 24, p.tema.destaque));
    this.add
      .text(largura - p.espaco.pequeno, tela.versaoTopo, t.t('creditos.versao', { versao: sv.versao }), estilo(p, p.fonte.corpo, p.tema.fraco))
      .setOrigin(1, 0);
    const corpo = { align: 'center', wordWrap: { width: tela.larguraTexto }, lineSpacing: p.fonte.entrelinhas };
    this.add.text(largura / 2, tela.nomeY, t.t('creditos.jogo'), estilo(p, p.fonte.corpo, p.tema.texto, corpo)).setOrigin(0.5, 0);
    this.add.text(largura / 2, Y_NICK, t.t('creditos.nick'), estilo(p, p.fonte.corpo, p.tema.texto, corpo)).setOrigin(0.5, 0);
    this.add.text(largura / 2, Y_AGRADECIMENTO, t.t('creditos.agradecimento'), estilo(p, p.fonte.corpo, p.tema.texto, corpo)).setOrigin(0.5, 0);

    // Botões: "Voltar ao título" com foco inicial (GDD 17.7 e 20.4). Mouse também age.
    this.menu = new Menu(
      this,
      [
        { texto: t.t('creditos.voltar'), y: Y_BOTAO_VOLTAR, aoAtivar: () => this.voltar() },
        { texto: t.t('creditos.explorar'), y: Y_BOTAO_EXPLORAR, aoAtivar: () => this.explorar() },
      ],
      { tamanho: p.fonte.corpo, mouse: true, focoInicial: 0 },
    );
    barraDaTela(this, ['barra.creditos.menu']);

    this.fade = this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo), 1).setOrigin(0).setDepth(PROFUNDIDADE_FADE);
    this.tweens.add({
      targets: this.fade,
      alpha: 0,
      duration: DURACAO_DO_FADE_MS,
      onComplete: () => {
        this.pronta = true;
      },
    });
  }

  update(): void {
    this.controles.atualizar();
    if (!this.pronta || this.saindo) return;
    this.menu.atualizarTeclado(this.controles);
    // Esc age como X (ADR-010 1.2 e GDD 20.4): volta ao título.
    if (this.controles.apertada('b')) this.voltar();
  }

  /** Volta ao título com fade de 0,5 s. Sem save: o título começa do zero (ADR-002 seção 3). */
  private voltar(): void {
    if (!this.pronta || this.saindo) return;
    this.saindo = true;
    pararCreditosDaCena(this);
    this.tweens.add({
      targets: this.fade,
      alpha: 1,
      duration: DURACAO_DO_FADE_MS,
      onComplete: () => this.scene.start('Titulo'),
    });
  }

  /** "Explorar a casa" (ADR-010 1.2): entra no modo explorar e vai à casa, com fade de 0,5 s (EX1). */
  private explorar(): void {
    if (!this.pronta || this.saindo) return;
    this.saindo = true;
    pararCreditosDaCena(this);
    servicosDe(this).sessao.entrarNoModoExplorar();
    this.tweens.add({
      targets: this.fade,
      alpha: 1,
      duration: DURACAO_DO_FADE_MS,
      onComplete: () => this.scene.start('Casa', { modo: 'explorar' }),
    });
  }
}
