import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Controles } from '../input/Controles';
import { definirTelaDoSom, tocarCreditosDaCena } from '../audio/somDaCena';
import { caixaOpaca } from '../ui/caixaOpaca';
import { carregarImagemDeTela, TEXTURA_DE_TELA } from '../recursos/imagensDeTela';
import { podeContinuarNaFim } from './transicaoDaFim';

/** Fade de entrada, em tempo de jogo (GDD 17.4 item 6, 0,5 s). */
const DURACAO_DO_FADE_MS = 500;
const PROFUNDIDADE_FADE = 1100;
const FUNDO_DE_CARGA = 0x0b1030;

/**
 * Tela de fim (GDD 20.4; FI1 a FI2): a família da referência `tela_fim.png` (árvore, Nath, Ítalo, Nick e os quatro sobrinhos),
 * antes dos créditos. Três linhas de texto (`fim.obrigado`), sem nomes (regra 034). O jingle de créditos (JC) toca uma vez
 * ao abrir esta tela (20.4, única mudança do gatilho de 19.2.7 c). Z, X ou Enter (A ou B no toque) seguem para os créditos.
 * Sem pressa: fica até a pessoa continuar. Se a imagem falhar, a tela segue com o fundo sólido e o texto (ADR-009 4.4).
 */
export class FimScene extends Phaser.Scene {
  private controles!: Controles;
  private fade!: Phaser.GameObjects.Rectangle;
  private pronta = false;
  private saindo = false;

  constructor() {
    super('Fim');
  }

  create(): void {
    const sv = servicosDe(this);
    const p = perfilDe(this);
    const t = sv.conteudo.textos;
    const { largura, altura } = telaDe(p);
    this.controles = new Controles(this);
    // Mesma política de som dos créditos: o JC é o único jingle que toca fora da conquista (ADR-008 R9, 20.4).
    definirTelaDoSom(this, 'creditos');
    this.pronta = false;
    this.saindo = false;

    this.add.rectangle(0, 0, largura, altura, FUNDO_DE_CARGA).setOrigin(0).setDepth(0);
    carregarImagemDeTela(this, 'fim', () => {
      this.add.image(0, 0, TEXTURA_DE_TELA.fim).setOrigin(0).setDepth(1);
    });

    // Texto em caixa opaca no topo: os quatro sobrinhos ficam livres (FI2); o topo tem só a árvore e o espelho.
    const linhas = t.t('fim.obrigado');
    const texto = this.add
      .text(largura / 2, 10, linhas, estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center', lineSpacing: p.fonte.entrelinhas }))
      .setOrigin(0.5, 0)
      .setDepth(3);
    const caixa = texto.getBounds();
    const pad = p.espaco.pequeno;
    caixaOpaca(this, caixa.x - pad, caixa.y - pad / 2, caixa.width + 2 * pad, caixa.height + pad, 2);

    barraDaTela(this, ['barra.fim']);
    // Toque em qualquer ponto da tela avança (layout B, sem botões A e B: BUG-M7-01). A zona cobre a tela inteira.
    const toque = this.add.zone(0, 0, largura, altura).setOrigin(0).setDepth(1200).setInteractive();
    toque.on('pointerdown', () => this.tentarContinuar());
    this.fade = this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo), 1).setOrigin(0).setDepth(PROFUNDIDADE_FADE);
    this.tweens.add({
      targets: this.fade,
      alpha: 0,
      duration: DURACAO_DO_FADE_MS,
      onComplete: () => {
        this.pronta = true;
        tocarCreditosDaCena(this);
      },
    });
  }

  update(): void {
    this.controles.atualizar();
    if (!this.pronta || this.saindo) return;
    if (this.controles.apertada('a') || this.controles.apertada('b')) this.tentarContinuar();
  }

  private tentarContinuar(): void {
    if (!podeContinuarNaFim(this.pronta, this.saindo)) return;
    this.saindo = true;
    this.scene.start('Creditos');
  }
}
