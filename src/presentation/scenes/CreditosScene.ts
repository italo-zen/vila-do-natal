import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';
import { toqueDaCena } from '../ui/toque/toqueDaCena';
import { ANIM_NICK, CHAVE_DA_ARVORE, CHAVE_NICK, sprites } from '../assets/registro';
import { definirTelaDoSom } from '../audio/somDaCena';

/** Fade de entrada e de saída da tela, em tempo de jogo (GDD 17.7: 0,5 s para entrar e sair). */
const DURACAO_DO_FADE_MS = 500;
/** Profundidade do fade: acima de tudo, como o fade da casa (ADR-004 seção 10). */
const PROFUNDIDADE_FADE = 1100;

/**
 * Créditos (GDD 17.7; ADR-006 seção 7). Tela de apresentação: não tem regra de domínio, não tem estado e não grava nada.
 * Lê os textos, o sobrinho escolhido e a versão. Sem tempo, sem rolagem e sem música: nada se mexe sozinho, exceto o fade
 * e o Nick, que faz a animação "feliz" uma vez. Z, X, Enter, Esc ou clique em "Voltar ao título" levam ao título (sem save,
 * ADR-002 seção 3). H, o ícone de dica e B não fazem nada aqui (ModoDaTela 'creditos').
 */
export class CreditosScene extends Phaser.Scene {
  private controles!: Controles;
  private fade!: Phaser.GameObjects.Rectangle;
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
    const sobrinho = sv.sessao.progresso.sobrinho;
    this.controles = new Controles(this);
    definirTelaDoSom(this, 'creditos');
    toqueDaCena(this)?.mostrarPara('creditos');
    this.pronta = false;
    this.saindo = false;

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo)).setOrigin(0);
    this.add.text(tela.tituloX, tela.tituloY, t.t('creditos.titulo'), estilo(p, p.fonte.titulo, p.tema.destaque));
    this.add
      .text(largura - p.espaco.pequeno, tela.versaoTopo, t.t('creditos.versao', { versao: sv.versao }), estilo(p, p.fonte.corpo, p.tema.fraco))
      .setOrigin(1, 0);
    this.add
      .text(largura / 2, tela.nomeY, t.t('creditos.jogo'), estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center', wordWrap: { width: tela.larguraTexto }, lineSpacing: p.fonte.entrelinhas }))
      .setOrigin(0.5, 0);

    // Sobrinho escolhido comemorando, com o agradecimento ao lado (GDD 17.7, item 3).
    this.add.image(tela.sobrinhoX, tela.sobrinhoY, sprites.comemorar(sobrinho.id)).setOrigin(0, 0).setScale(p.escalaDeExibicao.conquista);
    this.add.text(
      tela.sobrinhoTextoX,
      tela.sobrinhoY,
      t.t('creditos.sobrinho', { nome: sobrinho.nome }),
      estilo(p, p.fonte.corpo, p.tema.texto, { wordWrap: { width: tela.sobrinhoTextoLargura }, lineSpacing: p.fonte.entrelinhas }),
    );

    // Árvore no estado 4 (GDD 17.7, item 4) e Nick feliz, que faz a animação uma vez (item 5).
    this.add.image(tela.arvoreX, tela.arvoreY, CHAVE_DA_ARVORE[4]).setOrigin(0, 0);
    const nick = this.add.sprite(tela.nickX, tela.nickY, CHAVE_NICK.feliz, 0).setOrigin(0, 0);
    nick.play(ANIM_NICK.feliz);
    this.add.text(
      largura / 2,
      tela.nickY,
      t.t('creditos.nick'),
      estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center', wordWrap: { width: tela.nickTextoLargura }, lineSpacing: p.fonte.entrelinhas }),
    ).setOrigin(0.5, 0);

    this.add
      .text(
        largura / 2,
        tela.agradecimentoY,
        t.t('creditos.agradecimento'),
        estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center', wordWrap: { width: tela.larguraTexto }, lineSpacing: p.fonte.entrelinhas }),
      )
      .setOrigin(0.5, 0);

    // Botão com foco inicial (GDD 17.7). Mouse também volta. Texto em corpo: "Voltar ao título" não cabe no tamanho de título.
    new Menu(this, [{ texto: t.t('creditos.voltar'), y: tela.voltarY, aoAtivar: () => this.voltar() }], {
      tamanho: p.fonte.corpo,
      mouse: true,
      focoInicial: 0,
    }).definirFoco(0);
    barraDaTela(this, ['barra.creditos']);

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
    if (this.controles.apertada('a') || this.controles.apertada('b')) this.voltar();
  }

  /** Volta ao título com fade de 0,5 s. Sem save: o título começa do zero (ADR-002 seção 3). */
  private voltar(): void {
    if (this.saindo) return;
    this.saindo = true;
    this.tweens.add({
      targets: this.fade,
      alpha: 1,
      duration: DURACAO_DO_FADE_MS,
      onComplete: () => this.scene.start('Titulo'),
    });
  }
}
