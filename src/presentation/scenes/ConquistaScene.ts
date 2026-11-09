import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';
import { CHAVE, sprites } from '../assets/registro';

export interface DadosDaConquista {
  /** Chave do texto da conquista (ex.: "conquista.luzes"). */
  chave: string;
  /** Tile de onde a condução começa (a frente do interruptor) e a fase que ela conclui (GDD 14.11). */
  origem: { mapa: string; x: number; y: number };
  fase: string;
  /** Sprite da ilustração da peça (GDD 15.5, 96×96). Sem ele, é a conquista das luzes (lâmpada). */
  ilustracao?: string;
}

/** Tela de conquista (GDD 3, 8 e 14.1): ilustração, texto e "Continuar" (A). Não é tela de carregamento. */
export class ConquistaScene extends Phaser.Scene {
  private controles!: Controles;
  private dados!: DadosDaConquista;

  constructor() {
    super('Conquista');
  }

  create(dados: DadosDaConquista): void {
    const p = perfilDe(this);
    const t = servicosDe(this).conteudo.textos;
    const { largura, altura } = telaDe(p);
    const tela = p.telas.conquista;
    this.controles = new Controles(this);
    this.dados = dados;

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo)).setOrigin(0);
    // Sobrinho comemorando (GDD 7.2: pose de comemoração na tela de conquista). Na conquista das luzes, a lâmpada;
    // na de peça (GDD 15.5), a ilustração da peça à esquerda e o sobrinho à direita.
    const id = servicosDe(this).sessao.progresso.sobrinho.id;
    if (dados.ilustracao) {
      this.add.image(tela.peca.x, tela.peca.y, dados.ilustracao).setOrigin(0, 0).setScale(tela.peca.escala);
      this.add.image(tela.personagemDaPeca.x, tela.personagemDaPeca.y, sprites.comemorar(id)).setOrigin(0, 0).setScale(p.escalaDeExibicao.conquista);
    } else {
      this.add.image(tela.personagem.x, tela.personagem.y, sprites.comemorar(id)).setOrigin(0, 0).setScale(p.escalaDeExibicao.conquista);
      this.add.image(tela.lampada.x, tela.lampada.y, CHAVE.lampada).setOrigin(0, 0);
    }
    this.add
      .text(
        largura / 2,
        tela.textoY,
        t.t(dados.chave),
        estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center', wordWrap: { width: tela.textoLargura }, lineSpacing: p.fonte.entrelinhas }),
      )
      .setOrigin(0.5, 0);

    new Menu(
      this,
      [{ texto: t.t('conquista.continuar'), y: tela.continuarY, aoAtivar: () => this.continuar() }],
      { tamanho: p.fonte.titulo, mouse: false, focoInicial: 0 },
    ).definirFoco(0);
    barraDaTela(this, ['barra.conquista']);
  }

  update(): void {
    this.controles.atualizar();
    // Z, X ou Esc continuam (GDD 14.1 e 14.8: a conquista não tem voltar).
    if (this.controles.apertada('a') || this.controles.apertada('b')) this.continuar();
  }

  private continuar(): void {
    this.scene.start('Casa', { modo: 'conducao', origem: this.dados.origem, fase: this.dados.fase });
  }
}
