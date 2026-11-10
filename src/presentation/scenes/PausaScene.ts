import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, telaDe } from '../ui/tema';
import { Barra, barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';
import { textoDeEntrada } from '../ui/textoDeEntrada';
import { toqueDaCena } from '../ui/toque/toqueDaCena';
import { definirTelaDoSom, somDaCena, tocarSom } from '../audio/somDaCena';
import { confirmarItem, estadoInicialDaPausa, ITEM, moverFoco, voltarDaPausa, type AcaoDaPausa, type EstadoDaPausa, type VisaoDaPausa } from '../ui/pausa/estadoDaPausa';

export interface DadosDaPausa {
  /** Cena que foi pausada e que volta com "Continuar" (a casa). */
  origem: string;
}

/** Linhas de Como jogar dentro da pausa (GDD 19.3.3, item 3): as mesmas chaves da tela de Como jogar. */
const LINHAS_DE_COMO_JOGAR = ['comojogar.mover', 'comojogar.botaoA', 'comojogar.botaoB', 'comojogar.farejar', 'comojogar.dica', 'comojogar.pausa'];

/**
 * Tela de pausa (GDD 19.3; ADR-008 6). Cena sobreposta: a casa é pausada por `scene.pause` e volta por `resume`. Três
 * visões no mesmo lugar (pausa, confirmação e Como jogar), dirigidas pelo estado puro `estadoDaPausa`. Sem tempo na tela.
 */
export class PausaScene extends Phaser.Scene {
  private controles!: Controles;
  private estado: EstadoDaPausa = estadoInicialDaPausa();
  private origem = 'Casa';
  private menu: Menu | null = null;
  private objetos: Phaser.GameObjects.GameObject[] = [];
  private barra!: Barra;

  constructor() {
    super('Pausa');
  }

  create(dados?: DadosDaPausa): void {
    this.origem = dados?.origem ?? 'Casa';
    this.estado = estadoInicialDaPausa();
    this.controles = new Controles(this);
    const p = perfilDe(this);
    const { largura, altura } = telaDe(p);
    // Fundo sólido sobre a casa congelada (GDD 14.1; BUG-R13-03): a cena de trás não aparece nem por transparência.
    const fundo = this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo), 1).setOrigin(0);
    this.objetos.push(fundo);
    this.barra = barraDaTela(this, ['barra.pausa1', 'barra.pausa2']);
    // A pausa tem de ficar por cima da casa congelada em qualquer visão (a ordem de desenho é a da lista de cenas).
    this.scene.bringToTop();
    this.montarVisao();
  }

  update(): void {
    this.controles.atualizar();
    if (this.controles.atalhoApertado('pausa') || this.controles.apertada('b')) {
      this.aplicar(voltarDaPausa(this.estado));
      return;
    }
    const confirmacao = this.estado.visao === 'confirmacao';
    const antes = this.estado.foco;
    if (confirmacao) {
      if (this.controles.apertada('esquerda')) this.estado = moverFoco(this.estado, -1);
      if (this.controles.apertada('direita')) this.estado = moverFoco(this.estado, 1);
    } else {
      if (this.controles.apertada('cima')) this.estado = moverFoco(this.estado, -1);
      if (this.controles.apertada('baixo')) this.estado = moverFoco(this.estado, 1);
    }
    if (this.estado.foco !== antes) {
      tocarSom(this, 'S11');
      this.menu?.definirFoco(this.estado.foco);
    }
    if (this.controles.apertada('a')) {
      const r = confirmarItem(this.estado);
      // Confirmar "Som" não toca S12 ao desligar; ao ligar, o alternarMudo toca (ADR-008 R6).
      if (r.acao.tipo !== 'som') tocarSom(this, 'S12');
      this.aplicar(r);
    }
  }

  /** Aplica a ação da pausa (continuar, som, sair) e troca a visão quando for o caso. */
  private aplicar(r: { acao: AcaoDaPausa; estado: EstadoDaPausa }): void {
    const visaoAntes: VisaoDaPausa = this.estado.visao;
    this.estado = r.estado;
    switch (r.acao.tipo) {
      case 'continuar':
        this.continuar();
        return;
      case 'sair':
        this.voltarAoTitulo();
        return;
      case 'som':
        somDaCena(this)?.alternarMudo('pausa');
        this.montarVisao();
        return;
      default:
        if (visaoAntes !== this.estado.visao) this.montarVisao();
        else this.menu?.definirFoco(this.estado.foco);
    }
  }

  /** "Continuar": a casa volta do mesmo tile e do mesmo ponto no tempo (PS3). Nenhuma tecla do menu vale na casa. */
  private continuar(): void {
    this.scene.wake(this.origem);
    this.scene.stop();
  }

  /** "Sim" na confirmação: volta ao título e começa do zero (sem save, ADR-002 seção 3). A música segue (AU2). */
  private voltarAoTitulo(): void {
    this.scene.stop(this.origem);
    this.scene.start('Titulo');
  }

  /** Desenha a visão atual: texto, itens e barra. Trocar de visão refaz a tela (não troca de cena). */
  private montarVisao(): void {
    const t = textoDeEntrada(this);
    const p = perfilDe(this);
    const { largura } = telaDe(p);
    const tela = p.telas.comoJogar;
    this.menu?.destruir();
    this.menu = null;
    for (const o of this.objetos.splice(1)) o.destroy();
    this.scene.bringToTop();
    const visao = this.estado.visao;
    const mudo = somDaCena(this)?.estaMudo ?? false;
    const titulo = (texto: string, y: number) =>
      this.objetos.push(this.add.text(largura / 2, y, texto, estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center' })).setOrigin(0.5, 0));

    definirTelaDoSom(this, visao === 'pausa' ? 'pausa' : visao === 'confirmacao' ? 'pausaSair' : 'pausaComoJogar');
    toqueDaCena(this)?.mostrarPara(visao === 'pausa' ? 'pausa' : visao === 'confirmacao' ? 'pausaSair' : 'pausaComoJogar');

    if (visao === 'pausa') {
      this.objetos.push(this.add.text(largura / 2, 20, t.t('pausa.titulo'), estilo(p, p.fonte.titulo, p.tema.destaque)).setOrigin(0.5, 0));
      this.barra.definir(['barra.pausa1', 'barra.pausa2']);
      this.menu = new Menu(
        this,
        [
          { texto: t.t('pausa.continuar'), y: 64, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.continuar })) },
          { texto: t.t(mudo ? 'pausa.som.desligado' : 'pausa.som.ligado'), y: 120, semConfirmacaoSonora: true, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.som })) },
          { texto: t.t('pausa.comojogar'), y: 176, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.comoJogar })) },
          { texto: t.t('pausa.sair'), y: 232, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.sair })) },
        ],
        { tamanho: p.fonte.corpo, mouse: true, focoInicial: this.estado.foco },
      );
    } else if (visao === 'confirmacao') {
      const pergunta = t.t('pausa.sair.pergunta');
      const linhas = Array.isArray(pergunta) ? pergunta : [pergunta];
      linhas.forEach((linha, i) => titulo(linha, 64 + i * 24));
      this.barra.definir(['barra.sair']);
      this.menu = new Menu(
        this,
        [
          { texto: t.t('pausa.sair.sim'), y: 136, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.sim })) },
          { texto: t.t('pausa.sair.nao'), y: 192, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.nao })) },
        ],
        { tamanho: p.fonte.corpo, mouse: true, focoInicial: this.estado.foco },
      );
    } else {
      let y = tela.listaY - 8;
      for (const chave of LINHAS_DE_COMO_JOGAR) {
        const linha = this.add.text(tela.listaX, y, t.t(chave), estilo(p, p.fonte.corpo, p.tema.texto, { wordWrap: { width: tela.listaLargura }, lineSpacing: p.fonte.entrelinhasFina }));
        this.objetos.push(linha);
        y += linha.height + p.fonte.entrelinhasFina;
      }
      this.barra.definir(['barra.comojogar']);
      this.menu = new Menu(
        this,
        [{ texto: t.t('comojogar.voltar'), y: tela.voltarY, aoAtivar: () => this.aplicar(confirmarItem({ visao, foco: ITEM.voltar })) }],
        { tamanho: p.fonte.titulo, mouse: true, focoInicial: 0 },
      );
    }
  }
}
