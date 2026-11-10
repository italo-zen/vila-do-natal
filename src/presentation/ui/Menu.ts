import Phaser from 'phaser';
import { Botao, PRESSIONADO_MS } from './Botao';
import type { Controles } from '../input/Controles';
import { perfilDe, telaDe } from './tema';
import { tocarSom } from '../audio/somDaCena';

export interface ItemDeMenu {
  texto: string;
  /** true: confirmar este item não toca S12 (o item "Som" toca só ao ligar, ADR-008 R6). */
  semConfirmacaoSonora?: boolean;
  /** Topo do botão, em px da tela (token do perfil na tela que monta o menu). */
  y: number;
  aoAtivar: () => void;
}

export interface OpcoesDoMenu {
  /** Tamanho da fonte (corpo ou título do perfil). */
  tamanho: number;
  /** Clique do mouse ativa o item (só títulos e Como jogar, decisão do Diretor). */
  mouse: boolean;
  focoInicial?: number;
  /** Largura da caixa de cada botão. Padrão: perfil (botao.largura). */
  largura?: number;
}

/**
 * Lista vertical de botões com caixa (GDD 14.9.4). Teclado: cima/baixo trocam o foco, A (Z/Enter)
 * ativa e mostra o pressionado. Mouse (quando habilitado): passar por cima foca, clicar ativa.
 */
export class Menu {
  private readonly botoes: Botao[] = [];
  private foco: number;
  private readonly cena: Phaser.Scene;

  constructor(
    cena: Phaser.Scene,
    private readonly itens: ItemDeMenu[],
    opcoes: OpcoesDoMenu,
  ) {
    this.cena = cena;
    this.foco = opcoes.focoInicial ?? 0;
    const p = perfilDe(cena);
    const largura = opcoes.largura ?? p.botao.largura;
    const altura = p.botao.altura;
    const centroX = telaDe(p).largura / 2;
    itens.forEach((item, i) => {
      const botao = new Botao(cena, centroX, item.y + altura / 2, item.texto, {
        w: largura,
        h: altura,
        tamanho: opcoes.tamanho,
        marca: true,
        mouse: opcoes.mouse,
      });
      this.botoes.push(botao);
      botao.sobreMouse?.on('pointerover', () => this.definirFoco(i));
      botao.sobreMouse?.on('pointerdown', () => this.ativar(i));
    });
    this.definirFoco(this.foco);
  }

  get focado(): number {
    return this.foco;
  }

  definirFoco(i: number): void {
    this.foco = i;
    this.botoes.forEach((b, k) => b.setFoco(k === i));
  }

  /** Remove os botões da tela (a pausa troca de visão sem trocar de cena). */
  destruir(): void {
    this.botoes.forEach((b) => b.destruir());
    this.botoes.length = 0;
  }

  /** Chamar no update, depois de `controles.atualizar()`. */
  atualizarTeclado(controles: Controles): void {
    const antes = this.foco;
    if (controles.apertada('cima')) this.definirFoco(Math.max(0, this.foco - 1));
    if (controles.apertada('baixo')) this.definirFoco(Math.min(this.itens.length - 1, this.foco + 1));
    // Mudar o foco pelo teclado ou pelo joystick toca S11 (ADR-008 R3). Chegar ao limite não muda o foco, não toca.
    if (this.foco !== antes) tocarSom(this.cena, 'S11');
    if (controles.apertada('a')) this.ativar(this.foco);
  }

  /** Ativa o item i (A, clique ou toque). Toca S12 (ADR-008 R2). */
  ativar(i: number): void {
    if (!this.itens[i].semConfirmacaoSonora) tocarSom(this.cena, 'S12');
    // A ação acontece depois dos 150 ms do estado pressionado, para o feedback aparecer antes da troca de tela.
    this.botoes[i].pressionar();
    this.cena.time.delayedCall(PRESSIONADO_MS, () => this.itens[i].aoAtivar());
  }
}
