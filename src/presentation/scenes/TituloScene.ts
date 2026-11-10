import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';
import { toqueDaCena } from '../ui/toque/toqueDaCena';
import { definirTelaDoSom, somDaCena } from '../audio/somDaCena';
import { IconeDeTela, CHAVES_DO_SOM } from '../ui/icones/IconeDeTela';
import { iconesDaTela, xDoIcone } from '../ui/icones/iconesDaTela';

/**
 * Título (GDD 14.1): nome, "Começar" (foco inicial) e "Como jogar", versão no canto.
 * Setas trocam o foco, A confirma. Mouse: passar e clicar. X/Esc não fazem nada aqui (decisão do Diretor).
 * Não há "Continuar": nada é lido nem gravado. Posições vêm de `telas.titulo` do perfil.
 */
export class TituloScene extends Phaser.Scene {
  private controles!: Controles;
  private iconeSom!: IconeDeTela;
  private menu!: Menu;

  constructor() {
    super('Titulo');
  }

  create(): void {
    const sv = servicosDe(this);
    const p = perfilDe(this);
    const t = sv.conteudo.textos;
    const { largura, altura } = telaDe(p);
    const tela = p.telas.titulo;
    this.controles = new Controles(this);
    definirTelaDoSom(this, 'titulo');
    // Ícone de som no canto superior esquerdo do título (GDD 19.3.2): liga ou desliga, como M.
    // Y 2 (não 8): o nome do jogo começa em y 36 (telas.titulo.nomeY); o ícone de 32 px tem de terminar antes dele.
    const margem = p.espaco.pequeno;
    this.iconeSom = new IconeDeTela(this, 'som', xDoIcone('som', 'titulo', margem, p.tile), 2, CHAVES_DO_SOM.ligado, () => somDaCena(this)?.alternarMudo('titulo'));
    toqueDaCena(this)?.mostrarPara('titulo');

    this.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo)).setOrigin(0);
    this.add
      .text(
        largura / 2,
        tela.nomeY,
        t.t('titulo.nome'),
        estilo(p, p.fonte.titulo, p.tema.destaque, { align: 'center', wordWrap: { width: largura - 2 * p.espaco.medio }, lineSpacing: p.fonte.entrelinhas }),
      )
      .setOrigin(0.5, 0);
    this.add
      .text(largura - p.espaco.pequeno, tela.versaoTopo, t.t('titulo.versao', { versao: sv.versao }), estilo(p, p.fonte.corpo, p.tema.fraco))
      .setOrigin(1, 0);

    this.menu = new Menu(
      this,
      [
        { texto: t.t('titulo.comecar'), y: tela.menuY[0], aoAtivar: () => this.scene.start('Selecao') },
        { texto: t.t('titulo.comojogar'), y: tela.menuY[1], aoAtivar: () => this.scene.start('ComoJogar') },
      ],
      { tamanho: p.fonte.titulo, mouse: true, focoInicial: 0 },
    );
    barraDaTela(this, ['barra.titulo']);
  }

  update(): void {
    this.controles.atualizar();
    const mudo = somDaCena(this)?.estaMudo ?? false;
    this.iconeSom.trocarChaves(mudo ? CHAVES_DO_SOM.desligado : CHAVES_DO_SOM.ligado);
    this.iconeSom.setVisivel(iconesDaTela('titulo').som);
    this.menu.atualizarTeclado(this.controles);
  }
}
