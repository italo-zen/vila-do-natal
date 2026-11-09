import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Botao, PRESSIONADO_MS } from '../ui/Botao';
import { inicioCentrado } from '../ui/layout';
import { Controles } from '../input/Controles';
import { sprites } from '../assets/registro';
import { PERSONAGEM_IDS, type PersonagemId } from '../../domain/personagem/PersonagemId';
import { SOBRINHOS } from '../../domain/personagem/sobrinhos';

export interface DadosDaSelecao {
  /** Cartão em foco ao abrir (ao voltar da introdução, o cartão escolhido). */
  foco?: number;
}

/** Profundidade do sprite dentro do cartão (acima da caixa do cartão). */
const PROFUNDIDADE_SPRITE = 11;

/**
 * Seleção (GDD 14.1 e 14.8): 4 cartões em fila. Setas movem, Z/Enter confirma (inicia a partida em
 * memória), X/Esc voltam ao título. Foco inicial em LoLô, salvo quando volta da introdução.
 * Cartões, espaços e escala vêm de `telas.selecao` e `escalaDeExibicao` do perfil.
 */
export class SelecaoScene extends Phaser.Scene {
  private controles!: Controles;
  private foco = 0;
  private cartoes: Botao[] = [];
  private confirmando = false;

  constructor() {
    super('Selecao');
  }

  create(dados?: DadosDaSelecao): void {
    const sv = servicosDe(this);
    const p = perfilDe(this);
    const { largura, altura } = telaDe(p);
    const tela = p.telas.selecao;
    this.controles = new Controles(this);
    this.foco = Math.min(PERSONAGEM_IDS.length - 1, Math.max(0, dados?.foco ?? 0));
    this.cartoes = [];
    this.confirmando = false;

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo)).setOrigin(0);
    this.add
      .text(largura / 2, tela.tituloY, sv.conteudo.textos.t('selecao.titulo'), estilo(p, p.fonte.titulo, p.tema.destaque, { align: 'center', wordWrap: { width: tela.tituloLargura } }))
      .setOrigin(0.5, 0);

    const n = PERSONAGEM_IDS.length;
    const larguraDoGrupo = n * tela.cartaoLargura + (n - 1) * tela.espaco;
    const inicioX = inicioCentrado(largura, larguraDoGrupo);
    PERSONAGEM_IDS.forEach((id: PersonagemId, i) => {
      const x = inicioX + i * (tela.cartaoLargura + tela.espaco);
      const nome = SOBRINHOS.find((s) => s.id === id)!.nome;
      // Cartão com caixa e borda (GDD 14.9.4): o nome fica no rodapé do cartão.
      this.cartoes.push(
        new Botao(this, x + tela.cartaoLargura / 2, tela.cartaoTopo + tela.cartaoAltura / 2, nome, {
          w: tela.cartaoLargura,
          h: tela.cartaoAltura,
          tamanho: p.fonte.corpo,
          textoY: tela.cartaoTopo + tela.nomeDeTopo,
        }),
      );
      this.add
        .image(x + tela.cartaoLargura / 2, tela.cartaoTopo + tela.spriteDeTopo, sprites.parado(id))
        .setScale(p.escalaDeExibicao.cartao)
        .setOrigin(0.5, 0)
        .setDepth(PROFUNDIDADE_SPRITE);
    });
    this.desenharFoco();
    barraDaTela(this, ['barra.selecao1', 'barra.selecao2']);
  }

  update(): void {
    this.controles.atualizar();
    if (this.controles.apertada('esquerda')) this.mudarFoco(-1);
    if (this.controles.apertada('direita')) this.mudarFoco(1);
    if (this.controles.apertada('a') && !this.confirmando) {
      // Mostra o estado pressionado (150 ms) e só então segue para a introdução.
      this.confirmando = true;
      this.cartoes[this.foco].pressionar();
      this.time.delayedCall(PRESSIONADO_MS, () => {
        servicosDe(this).iniciarNovoJogo.executar(PERSONAGEM_IDS[this.foco]);
        this.scene.start('Casa', { modo: 'intro' });
      });
    }
    if (this.controles.apertada('b')) this.scene.start('Titulo');
  }

  private mudarFoco(delta: number): void {
    this.foco = Math.min(PERSONAGEM_IDS.length - 1, Math.max(0, this.foco + delta));
    this.desenharFoco();
  }

  private desenharFoco(): void {
    this.cartoes.forEach((c, i) => c.setFoco(i === this.foco));
  }
}
