import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, telaDe } from './tema';
import { Barra } from './Barra';
import { caixaYDoDialogo, type PosicaoDaCaixa } from './posicaoDoDialogo';

export interface OpcoesDoDialogo {
  /** Chaves das linhas da barra de controles (ex.: "barra.dialogo"). */
  barra: string[];
  /** Onde a caixa fica: embaixo (padrão) ou no topo (só o diálogo automático da árvore, BUG-R15-01). */
  posicao?: PosicaoDaCaixa;
  /** X/Esc fecham o diálogo (a introdução não fecha). */
  podeFechar: boolean;
  /** X volta uma página; na primeira, chama aoVoltarDaPrimeira (introdução: volta à seleção). */
  paginaAnterior?: { aoVoltarDaPrimeira: () => void };
  aoFim?: () => void;
}

/** Caixa de texto na parte de baixo; A avança, sem tempo automático (GDD 6 e 14.8). */
export class Dialogo {
  private paginas: string[] = [];
  private indice = 0;
  private opcoes: OpcoesDoDialogo | null = null;
  private readonly caixa: Phaser.GameObjects.Graphics;
  private readonly texto: Phaser.GameObjects.Text;
  private readonly seta: Phaser.GameObjects.Graphics;
  private readonly tween: Phaser.Tweens.Tween;
  private readonly barra: Barra;

  private readonly perfil: ReturnType<typeof perfilDe>;
  private readonly largura: number;
  private readonly alturaTela: number;

  constructor(cena: Phaser.Scene) {
    const p = perfilDe(cena);
    const { largura, altura } = telaDe(p);
    this.perfil = p;
    this.largura = largura;
    this.alturaTela = altura;

    this.caixa = cena.add.graphics().setScrollFactor(0).setDepth(1000);
    this.texto = cena.add
      .text(0, 0, '', estilo(p, p.fonte.corpo, p.tema.texto, { wordWrap: { width: largura - 2 * p.espaco.medio }, lineSpacing: p.fonte.entrelinhas }))
      .setScrollFactor(0)
      .setDepth(1001);
    // Seta de "próxima página": triângulo no canto inferior direito da caixa.
    this.seta = cena.add.graphics().setScrollFactor(0).setDepth(1001);
    this.tween = cena.tweens.add({ targets: this.seta, alpha: 0.2, duration: 450, yoyo: true, repeat: -1, paused: true });
    this.barra = new Barra(cena, 1002);
    this.posicionar('base');
    this.esconder();
  }

  /** Desenha a caixa, o texto e a seta na posição pedida (a caixa do topo não muda a barra de controles). */
  private posicionar(posicao: PosicaoDaCaixa): void {
    const p = this.perfil;
    const d = p.dialogo;
    const margem = p.espaco.medio;
    const largura = this.largura;
    const caixaY = caixaYDoDialogo(this.alturaTela, d.altura, posicao);

    this.caixa.clear();
    this.caixa.fillStyle(numeroDaCor(p.tema.fundo), p.tema.alfaCaixa).fillRect(0, caixaY, largura, d.altura);
    // Contorno inteiro dentro da caixa: meio pixel de recuo na espessura da linha (como o v1).
    this.caixa
      .lineStyle(d.borda, numeroDaCor(p.tema.texto), 1)
      .strokeRect(d.borda / 2, caixaY + d.borda / 2, largura - d.borda, d.altura - d.borda);
    this.texto.setPosition(margem, caixaY + margem);
    const x1 = largura - d.seta.recuo;
    const x0 = x1 - d.seta.largura;
    const yTopo = caixaY + d.seta.deTopo;
    this.seta.clear();
    this.seta.fillStyle(numeroDaCor(p.tema.destaque), 1).fillTriangle(x0, yTopo, x1, yTopo, x0 + d.seta.largura / 2, yTopo + d.seta.altura);
  }

  get aberto(): boolean {
    return this.opcoes !== null;
  }

  abrir(paginas: string[], opcoes: OpcoesDoDialogo): void {
    this.paginas = paginas;
    this.indice = 0;
    this.opcoes = opcoes;
    this.posicionar(opcoes.posicao ?? 'base');
    this.mostrar();
  }

  /** Z: próxima página; na última, fecha e chama aoFim. */
  avancar(): void {
    if (!this.opcoes) return;
    if (this.indice < this.paginas.length - 1) {
      this.indice += 1;
      this.mostrar();
      return;
    }
    this.fechar();
  }

  /** X ou Esc. Com página anterior: volta uma página. Senão: fecha, se o diálogo permite. */
  tratarX(): void {
    const o = this.opcoes;
    if (!o) return;
    if (o.paginaAnterior) {
      if (this.indice > 0) {
        this.indice -= 1;
        this.mostrar();
      } else {
        o.paginaAnterior.aoVoltarDaPrimeira();
      }
      return;
    }
    if (o.podeFechar) this.fechar();
  }

  private fechar(): void {
    const fim = this.opcoes?.aoFim;
    this.esconder();
    this.opcoes = null;
    fim?.();
  }

  private mostrar(): void {
    const o = this.opcoes!;
    this.texto.setText(this.paginas[this.indice]);
    this.barra.setVisible(true);
    this.barra.definir(o.barra);
    this.caixa.setVisible(true);
    this.texto.setVisible(true);
    const ultima = this.indice === this.paginas.length - 1;
    this.seta.setVisible(!ultima);
    if (!ultima) this.tween.play();
    else this.tween.pause();
  }

  private esconder(): void {
    this.caixa.setVisible(false);
    this.texto.setVisible(false);
    this.seta.setVisible(false);
    this.barra.setVisible(false);
    this.tween.pause();
  }
}
