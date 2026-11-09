import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Botao, PRESSIONADO_MS } from '../ui/Botao';
import { inicioCentrado } from '../ui/layout';
import { Controles } from '../input/Controles';
import { sprites } from '../assets/registro';
import { comToqueDaCena, toqueDaCena } from '../ui/toque/toqueDaCena';
import { caixaDoVoltarDaSelecao } from '../ui/toque/layout';
import { textoDeEntrada } from '../ui/textoDeEntrada';
import type { Barra } from '../ui/Barra';
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
 * Toque (GDD 18.5, regra 6): tocar num cartão confirma aquele sobrinho, como Z no cartão em foco.
 * Cartões, espaços e escala vêm de `telas.selecao` e `escalaDeExibicao` do perfil.
 */
export class SelecaoScene extends Phaser.Scene {
  private controles!: Controles;
  private foco = 0;
  private cartoes: Botao[] = [];
  private confirmando = false;
  /** Layout B sem botão B: o botão "Voltar ao título" (pergunta 42, padrão aplicado) aparece só aí, no toque. */
  private voltar: Botao | null = null;
  private botaoVisivel = false;
  private barra!: Barra;

  constructor() {
    super('Selecao');
  }

  create(dados?: DadosDaSelecao): void {
    const sv = servicosDe(this);
    const p = perfilDe(this);
    const { largura, altura } = telaDe(p);
    const tela = p.telas.selecao;
    this.controles = new Controles(this);
    toqueDaCena(this)?.mostrarPara('selecao');
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
      const cartao = new Botao(this, x + tela.cartaoLargura / 2, tela.cartaoTopo + tela.cartaoAltura / 2, nome, {
        w: tela.cartaoLargura,
        h: tela.cartaoAltura,
        tamanho: p.fonte.corpo,
        textoY: tela.cartaoTopo + tela.nomeDeTopo,
      });
      // Com toque, o cartão é alvo: tocar confirma (zona só existe com toque; o clique do computador não muda).
      cartao.sobreMouse?.on('pointerdown', () => this.confirmar(i));
      this.cartoes.push(cartao);
      this.add
        .image(x + tela.cartaoLargura / 2, tela.cartaoTopo + tela.spriteDeTopo, sprites.parado(id))
        .setScale(p.escalaDeExibicao.cartao)
        .setOrigin(0.5, 0)
        .setDepth(PROFUNDIDADE_SPRITE);
    });
    this.desenharFoco();
    this.barra = barraDaTela(this, ['barra.selecao1', 'barra.selecao2']);
    if (comToqueDaCena(this)) {
      // Botão "Voltar ao título": entre a linha de baixo dos cartões e o texto da barra (ver caixaDoVoltarDaSelecao).
      const faixaTopo = tela.cartaoTopo + tela.cartaoAltura;
      const faixaFundo = altura - p.barra.margemInferior - p.barra.entreLinhas - p.fonte.corpo;
      const caixa = caixaDoVoltarDaSelecao(largura, faixaTopo, faixaFundo, p.botao.largura, p.fonte.corpo + p.espaco.medio);
      this.voltar = new Botao(this, caixa.x + caixa.largura / 2, caixa.y + caixa.altura / 2, textoDeEntrada(this).t('selecao.voltar'), {
        w: caixa.largura,
        h: caixa.altura,
        tamanho: p.fonte.corpo,
      });
      this.voltar.sobreMouse?.on('pointerdown', () => this.voltarAoTitulo());
      this.botaoVisivel = this.emLayoutB();
      this.voltar.setVisivel(this.botaoVisivel);
    }
  }

  update(): void {
    this.controles.atualizar();
    // O layout pode mudar com a janela: o botão e a barra acompanham (barra: versão `.toque.menu` no B, sem botão de controle).
    const emB = this.emLayoutB();
    if (this.voltar && emB !== this.botaoVisivel) {
      this.botaoVisivel = emB;
      this.voltar.setVisivel(emB);
    }
    this.barra.definir(['barra.selecao1', 'barra.selecao2']);
    if (this.controles.apertada('esquerda')) this.mudarFoco(-1);
    if (this.controles.apertada('direita')) this.mudarFoco(1);
    if (this.controles.apertada('a')) this.confirmar(this.foco);
    if (this.controles.apertada('b')) this.scene.start('Titulo');
  }

  private emLayoutB(): boolean {
    return comToqueDaCena(this) && toqueDaCena(this)?.layoutAtual() === 'B';
  }

  /** Botão "Voltar ao título" (toque, layout B): mesmo efeito do B do teclado, com o pressionado de 150 ms. */
  private voltarAoTitulo(): void {
    if (this.confirmando) return;
    this.confirmando = true;
    this.voltar?.pressionar();
    this.time.delayedCall(PRESSIONADO_MS, () => this.scene.start('Titulo'));
  }

  /** Confirma o sobrinho `i` (A no cartão em foco, ou toque no cartão). Mostra o pressionado e segue para a introdução. */
  private confirmar(i: number): void {
    if (this.confirmando) return;
    this.confirmando = true;
    this.foco = i;
    this.desenharFoco();
    this.cartoes[i].pressionar();
    this.time.delayedCall(PRESSIONADO_MS, () => {
      servicosDe(this).iniciarNovoJogo.executar(PERSONAGEM_IDS[i]);
      this.scene.start('Casa', { modo: 'intro' });
    });
  }

  private mudarFoco(delta: number): void {
    this.foco = Math.min(PERSONAGEM_IDS.length - 1, Math.max(0, this.foco + delta));
    this.desenharFoco();
  }

  private desenharFoco(): void {
    this.cartoes.forEach((c, i) => c.setFoco(i === this.foco));
  }
}
