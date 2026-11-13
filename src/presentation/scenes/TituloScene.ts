import Phaser from 'phaser';
import { estilo, perfilDe, servicosDe, telaDe } from '../ui/tema';
import { barraDaTela } from '../ui/Barra';
import { Menu } from '../ui/Menu';
import { Controles } from '../input/Controles';
import { toqueDaCena } from '../ui/toque/toqueDaCena';
import { definirTelaDoSom, somDaCena } from '../audio/somDaCena';
import { IconeDeTela, CHAVES_DO_SOM } from '../ui/icones/IconeDeTela';
import { iconesDaTela, xDoIcone } from '../ui/icones/iconesDaTela';
import { caixaOpaca } from '../ui/caixaOpaca';
import { carregarImagemDeTela, TEXTURA_DE_TELA } from '../recursos/imagensDeTela';
import type { Recursos } from '../recursos/recursos';

/** Fundo sólido antes da imagem (ADR-009 4.1; TI2, GDD 20.3). Mesmo valor de `tema.fundo`. */
const FUNDO_DE_CARGA = 0x0b1030;
const PROFUNDIDADE_IMAGEM = 1;
const PROFUNDIDADE_CAIXA = 2;
const PROFUNDIDADE_TEXTO = 3;
/** Metade esquerda da tela de 480 px: nome e botões ficam à esquerda; a árvore fica inteira à direita (GDD 20.3). */
const CENTRO_ESQUERDO = 122;
const NOME_Y = 40;
const TAMANHO_DO_NOME = 16;
const LARGURA_DO_NOME = 216;
const LARGURA_DO_BOTAO = 184;
const Y_BOTOES = [196, 252];

/**
 * Título (GDD 14.1 e 20.3): nome, "Começar" (foco inicial) e "Como jogar", versão no canto. A imagem de sala e árvore
 * (`tela_titulo`) entra quando chega; antes, o fundo sólido e os textos já aparecem (ADR-009 4). Nome, botões e versão ficam
 * em caixas opacas com contorno escuro (TI1). Setas trocam o foco, A confirma. Mouse: passar e clicar. X/Esc não fazem nada.
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

    // Fundo sólido antes da imagem: é o que aparece se a imagem demorar ou falhar (TI2).
    this.add.rectangle(0, 0, largura, altura, FUNDO_DE_CARGA).setOrigin(0).setDepth(0);
    carregarImagemDeTela(this, 'titulo', () => {
      this.add.image(0, 0, TEXTURA_DE_TELA.titulo).setOrigin(0).setDepth(PROFUNDIDADE_IMAGEM);
    });

    // Metade esquerda (GDD 20.3; ordem do Diretor: a árvore fica inteira à direita). Nome em 24 px, em até 216 px de largura.
    const nome = this.add
      .text(
        CENTRO_ESQUERDO,
        NOME_Y,
        t.t('titulo.nome'),
        estilo(p, TAMANHO_DO_NOME, p.tema.destaque, { align: 'center', wordWrap: { width: LARGURA_DO_NOME }, lineSpacing: 6 }),
      )
      .setOrigin(0.5, 0)
      .setDepth(PROFUNDIDADE_TEXTO);
    const caixaDoNome = nome.getBounds();
    const pad = p.espaco.pequeno;
    caixaOpaca(this, caixaDoNome.x - pad, caixaDoNome.y - pad / 2, caixaDoNome.width + 2 * pad, caixaDoNome.height + pad, PROFUNDIDADE_CAIXA);

    const versao = this.add
      .text(largura - p.espaco.pequeno, tela.versaoTopo, t.t('titulo.versao', { versao: sv.versao }), estilo(p, p.fonte.corpo, p.tema.fraco))
      .setOrigin(1, 0)
      .setDepth(PROFUNDIDADE_TEXTO);
    const caixaDaVersao = versao.getBounds();
    caixaOpaca(this, caixaDaVersao.x - pad / 2, caixaDaVersao.y - pad / 4, caixaDaVersao.width + pad, caixaDaVersao.height + pad / 2, PROFUNDIDADE_CAIXA);

    this.menu = new Menu(
      this,
      [
        { texto: t.t('titulo.comecar'), y: Y_BOTOES[0], aoAtivar: () => this.scene.start('Selecao') },
        { texto: t.t('titulo.comojogar'), y: Y_BOTOES[1], aoAtivar: () => this.scene.start('ComoJogar') },
      ],
      { tamanho: p.fonte.corpo, mouse: true, focoInicial: 0, contornoExterno: true, centroX: CENTRO_ESQUERDO, largura: LARGURA_DO_BOTAO },
    );
    barraDaTela(this, ['barra.titulo']);
    // Depois de desenhado o título, começa a carga externa da release (ADR-009 4.1). No playtest, não faz nada.
    (this.registry.get('recursos') as Recursos | undefined)?.iniciar();
  }

  update(): void {
    this.controles.atualizar();
    const mudo = somDaCena(this)?.estaMudo ?? false;
    this.iconeSom.trocarChaves(mudo ? CHAVES_DO_SOM.desligado : CHAVES_DO_SOM.ligado);
    this.iconeSom.setVisivel(iconesDaTela('titulo').som);
    this.menu.atualizarTeclado(this.controles);
  }
}
