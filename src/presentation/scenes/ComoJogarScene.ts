import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';

/**
 * Como jogar (GDD 14.1): título, uma linha por controle, botão "Voltar" com foco inicial.
 * A ou B voltam ao título. Mouse: clicar em Voltar. Ao voltar, o título abre com foco em "Começar".
 * Posições e larguras vêm de `telas.comoJogar` do perfil.
 */
export class ComoJogarScene extends Phaser.Scene {
  private controles!: Controles;
  private menu!: Menu;

  constructor() {
    super('ComoJogar');
  }

  create(): void {
    const p = perfilDe(this);
    const t = servicosDe(this).conteudo.textos;
    const { largura, altura } = telaDe(p);
    const tela = p.telas.comoJogar;
    this.controles = new Controles(this);

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo)).setOrigin(0);
    this.add.text(largura / 2, tela.tituloY, t.t('comojogar.titulo'), estilo(p, p.fonte.titulo, p.tema.destaque)).setOrigin(0.5, 0);

    let y = tela.listaY;
    for (const chave of ['comojogar.mover', 'comojogar.botaoA', 'comojogar.botaoB', 'comojogar.celular']) {
      const linha = this.add.text(
        tela.listaX,
        y,
        t.t(chave),
        estilo(p, p.fonte.corpo, p.tema.texto, { wordWrap: { width: tela.listaLargura }, lineSpacing: p.fonte.entrelinhasFina }),
      );
      y += linha.height + tela.espacoEntreItens;
    }

    this.menu = new Menu(
      this,
      [{ texto: t.t('comojogar.voltar'), y: tela.voltarY, aoAtivar: () => this.scene.start('Titulo') }],
      { tamanho: p.fonte.titulo, mouse: true, focoInicial: 0 },
    );
    barraDaTela(this, ['barra.comojogar']);
  }

  update(): void {
    this.controles.atualizar();
    this.menu.atualizarTeclado(this.controles);
    if (this.controles.apertada('b')) this.scene.start('Titulo');
  }
}
