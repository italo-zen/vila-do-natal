import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Botao, PRESSIONADO_MS } from '../ui/Botao';
import { inicioCentrado } from '../ui/layout';
import { Controles } from '../input/Controles';
import { sprites } from '../assets/registro';
import { comToqueDaCena, toqueDaCena } from '../ui/toque/toqueDaCena';
import { caixaDoVoltarDaSelecao, zonaDoVoltarDaSelecao } from '../ui/toque/layout';
import { fatorDaCena } from '../ui/toque/toqueDaCena';
import { ALVO_DE_TOQUE_CSS } from '../ui/escala';
import { textoDeEntrada } from '../ui/textoDeEntrada';
import { FOLGA_MINIMA_DO_NOME, maiorTamanhoQueCabe, tamanhosAteOPiso } from '../ui/tamanhoDoTexto';
import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';
import type { Barra } from '../ui/Barra';
import { PERSONAGEM_IDS, type PersonagemId } from '../../domain/personagem/PersonagemId';
import { SOBRINHOS } from '../../domain/personagem/sobrinhos';
import { definirTelaDoSom, tocarSom } from '../audio/somDaCena';

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
    definirTelaDoSom(this, 'selecao');
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
      // Backlog 130: o nome tem ≥ 4 px de folga até a borda interna do cartão em foco; só o nome que não cabe reduz (piso 12).
      const cartao = new Botao(this, x + tela.cartaoLargura / 2, tela.cartaoTopo + tela.cartaoAltura / 2, nome, {
        w: tela.cartaoLargura,
        h: tela.cartaoAltura,
        tamanho: this.tamanhoDoNome(nome, tela.cartaoLargura, p),
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
      // Zona de toque (backlog 138, PO3): começa na linha de baixo dos cartões e tem ≥ 48 CSS px; o desenho não muda.
      const zona = zonaDoVoltarDaSelecao(faixaTopo, caixa.altura, fatorDaCena(this), ALVO_DE_TOQUE_CSS);
      this.voltar = new Botao(this, caixa.x + caixa.largura / 2, caixa.y + caixa.altura / 2, textoDeEntrada(this).t('selecao.voltar'), {
        w: caixa.largura,
        h: caixa.altura,
        tamanho: p.fonte.corpo,
        areaDeToque: { w: caixa.largura, h: zona.altura },
      });
      this.voltar.zona?.setPosition(caixa.x + caixa.largura / 2, zona.y + zona.altura / 2);
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

  /** Maior tamanho do nome (do corpo até 12) que deixa a folga mínima dos dois lados, com a borda de foco (backlog 130). */
  private tamanhoDoNome(nome: string, cartaoLargura: number, p: PerfilDeArte): number {
    const limite = cartaoLargura - 2 * (p.botao.bordaFoco + FOLGA_MINIMA_DO_NOME);
    return maiorTamanhoQueCabe(tamanhosAteOPiso(p.fonte.corpo), (t) => this.larguraDoTexto(nome, t, p), limite);
  }

  private larguraDoTexto(texto: string, tamanho: number, p: PerfilDeArte): number {
    const medida = this.add.text(0, 0, texto, estilo(p, tamanho));
    const largura = medida.width;
    medida.destroy();
    return largura;
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
    tocarSom(this, 'S12');
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
    const antes = this.foco;
    this.foco = Math.min(PERSONAGEM_IDS.length - 1, Math.max(0, this.foco + delta));
    if (this.foco !== antes) tocarSom(this, 'S11');
    this.desenharFoco();
  }

  private desenharFoco(): void {
    this.cartoes.forEach((c, i) => c.setFoco(i === this.foco));
  }
}
