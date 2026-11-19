import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from './tema';
import { chaveDeEntrada } from './textoDeEntrada';
import { comToqueDaCena, toqueDaCena } from './toque/toqueDaCena';

/**
 * Barra de controles fixa (GDD 14.8): até 2 linhas, alinhadas à esquerda, na base da tela.
 * Margens, espaçamento e alturas vêm do perfil (`barra`). Os textos vêm de content/ (chaves "barra.*").
 * Não pisca nem anima. Se a linha for mais larga que a área útil, reduz só o espaçamento entre letras.
 */
export class Barra {
  private readonly fundo: Phaser.GameObjects.Graphics;
  private readonly linhas: Phaser.GameObjects.Text[] = [];
  private chaves: string[] = [];
  private visivel = true;

  constructor(
    private readonly cena: Phaser.Scene,
    profundidade: number,
    /** Fundo da cor da caixa e borda de cima (a barra da casa na visão 3/4). Os menus seguem com o fundo de sempre. */
    private readonly destacar = false,
  ) {
    const p = perfilDe(cena);
    this.fundo = cena.add.graphics().setScrollFactor(0).setDepth(profundidade);
    const { altura } = telaDe(p);
    for (let i = 0; i < 2; i++) {
      this.linhas.push(
        cena.add
          .text(p.barra.margemLateral, altura - p.barra.margemInferior, '', estilo(p, p.fonte.corpo, p.tema.fraco))
          .setOrigin(0, 1)
          .setScrollFactor(0)
          .setDepth(profundidade + 1),
      );
    }
  }

  /** Define as linhas pelas chaves de texto. Chamar à vontade: não redesenha se nada mudou. */
  definir(chaves: string[]): void {
    const textos = servicosDe(this.cena).conteudo.textos;
    // Chave resolvida pela entrada (teclado, toque, toque sem botões): o cache compara as chaves já resolvidas.
    const semBotoes = toqueDaCena(this.cena)?.semControles() ?? false;
    const resolvidas = chaves.map((c) => chaveDeEntrada(c, comToqueDaCena(this.cena), (k) => textos.tem(k), semBotoes));
    if (resolvidas.join('|') === this.chaves.join('|')) return;
    this.chaves = resolvidas;
    const p = perfilDe(this.cena);
    const { largura, altura } = telaDe(p);
    const base = altura - p.barra.margemInferior;
    const topo = altura - p.barra.alturaPorLinhas[chaves.length >= 2 ? '2' : '1'];
    this.fundo.clear();
    // Na visão 3/4 a área da casa acaba exatamente no topo da barra (ADR-012 seção 4): o fundo da barra tem a cor da caixa, para a barra se
    // distinguir do vazio, e uma linha fina de `tema.fraco` marca a borda de cima. Sem `vista`, o fundo de sempre.
    const painel = this.destacar && p.vista !== undefined;
    const cor = painel ? p.tema.caixa : p.tema.fundo;
    this.fundo.fillStyle(numeroDaCor(cor), p.tema.alfaBarra).fillRect(0, topo, largura, altura - topo);
    if (painel) this.fundo.fillStyle(numeroDaCor(p.tema.fraco), 1).fillRect(0, topo, largura, p.barra.bordaDeCima ?? 0);

    this.linhas.forEach((t, i) => {
      if (i >= chaves.length) {
        t.setVisible(false);
        return;
      }
      const linhaDaBase = chaves.length - 1 - i;
      t.setText(textos.t(resolvidas[i])).setY(base - linhaDaBase * p.barra.entreLinhas);
      this.ajustarLargura(t);
      t.setVisible(this.visivel);
    });
    this.fundo.setVisible(this.visivel);
  }

  destruir(): void {
    this.fundo.destroy();
    this.linhas.forEach((t) => t.destroy());
  }

  setVisible(v: boolean): void {
    this.visivel = v;
    this.fundo.setVisible(v);
    this.linhas.forEach((t, i) => t.setVisible(v && i < this.chaves.length));
  }

  /** Mantém a linha dentro da área útil, com espaçamento entre letras reduzido só se preciso. */
  private ajustarLargura(t: Phaser.GameObjects.Text): void {
    const p = perfilDe(this.cena);
    const areaUtil = telaDe(p).largura - 2 * p.barra.margemLateral;
    t.setLetterSpacing(0);
    const largura = t.width;
    if (largura <= areaUtil) return;
    t.setLetterSpacing((areaUtil - largura) / Math.max(1, t.text.length - 1));
  }
}

/** Barra fixa de uma tela de menu, com as chaves de texto dadas. */
export function barraDaTela(cena: Phaser.Scene, chaves: string[]): Barra {
  const barra = new Barra(cena, 900);
  barra.definir(chaves);
  return barra;
}
