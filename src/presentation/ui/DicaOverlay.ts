import Phaser from 'phaser';
import { Botao, PRESSIONADO_MS } from './Botao';
import { Barra } from './Barra';
import { CHAVE_DA_ARVORE } from '../assets/registro';
import { estilo, numeroDaCor, perfilDe, telaDe } from './tema';
import type { Controles } from '../input/Controles';

/** Profundidade da tela de dica: acima de tudo (penumbra, barra, ícone e fade). ADR-005 seção 5.1. */
const PROFUNDIDADE_DICA = 1200;

export interface DadosDaDica {
  titulo: string;
  /** Linhas do texto da fase e do Nick (cada uma até 28 caracteres, GDD 16.11). */
  linhas: string[];
  estadoDaArvore: 0 | 1 | 2 | 3;
  voltar: string;
  barra: string;
}

/**
 * Tela da dica (GDD 16.8; ADR-005 seção 5): título, imagem da árvore no estado atual ampliada pelo maior inteiro que cabe,
 * texto da fase e do Nick, botão "Voltar" com foco inicial e a barra "Z ou X: voltar". Não tem estado de jogo: a cena
 * congela o mundo enquanto ela existe. Z, X, Esc, Enter ou clique em "Voltar" fecham (H não fecha, D2).
 */
export class DicaOverlay {
  private readonly objetos: Phaser.GameObjects.GameObject[] = [];
  private readonly botao: Botao;
  private readonly barra: Barra;

  constructor(
    private readonly cena: Phaser.Scene,
    dados: DadosDaDica,
    private readonly aoFechar: () => void,
  ) {
    const p = perfilDe(cena);
    const { largura, altura } = telaDe(p);
    const m = p.espaco.medio;
    const alturaBarra = p.barra.alturaPorLinhas['1'];
    const voltarY = altura - alturaBarra - m - p.botao.altura;
    const textoH = dados.linhas.length * (p.fonte.corpo + p.fonte.entrelinhas);
    const textoY = voltarY - m - textoH;
    const topo = m + p.fonte.titulo + m;

    const fundo = cena.add.rectangle(0, 0, largura, altura, numeroDaCor(p.tema.fundo), 1).setOrigin(0).setScrollFactor(0).setDepth(PROFUNDIDADE_DICA);
    const titulo = cena.add.text(m, m, dados.titulo, estilo(p, p.fonte.titulo, p.tema.destaque)).setScrollFactor(0).setDepth(PROFUNDIDADE_DICA + 1);
    this.objetos.push(fundo, titulo);

    // Árvore no estado atual, ampliada pelo maior inteiro que cabe na área acima do texto (GDD 16.8.2).
    const chave = CHAVE_DA_ARVORE[dados.estadoDaArvore];
    if (cena.textures.exists(chave)) {
      const img = cena.textures.get(chave).getSourceImage();
      const areaW = largura - 2 * m;
      const areaH = textoY - m - topo;
      const escala = Math.max(1, Math.floor(Math.min(areaW / img.width, areaH / img.height)));
      const x = (largura - img.width * escala) / 2;
      const y = topo + (areaH - img.height * escala) / 2;
      const arvore = cena.add.image(x, y, chave).setOrigin(0, 0).setScale(escala).setScrollFactor(0).setDepth(PROFUNDIDADE_DICA + 1);
      this.objetos.push(arvore);
    }

    const texto = cena.add
      .text(largura / 2, textoY, dados.linhas.join('\n'), estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center', lineSpacing: p.fonte.entrelinhas }))
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setDepth(PROFUNDIDADE_DICA + 1);
    this.objetos.push(texto);

    this.botao = new Botao(cena, largura / 2, voltarY + p.botao.altura / 2, dados.voltar, {
      w: p.botao.largura,
      h: p.botao.altura,
      tamanho: p.fonte.titulo,
      marca: true,
      mouse: true,
      profundidade: PROFUNDIDADE_DICA + 2,
    });
    this.botao.setFoco(true);
    this.botao.sobreMouse?.on('pointerdown', () => this.fechar());

    this.barra = new Barra(cena, PROFUNDIDADE_DICA + 3);
    this.barra.definir([dados.barra]);
  }

  /** Teclas da tela: Z ou Enter (A) e X ou Esc (B) fecham. H não fecha. Devolve true quando fechou. */
  atualizar(controles: Controles): boolean {
    if (controles.apertada('a')) {
      this.botao.pressionar();
      this.cena.time.delayedCall(PRESSIONADO_MS, () => this.fechar());
      return false;
    }
    if (controles.apertada('b')) {
      this.fechar();
      return true;
    }
    return false;
  }

  private fechado = false;

  private fechar(): void {
    if (this.fechado) return;
    this.fechado = true;
    this.destruir();
    this.aoFechar();
  }

  private destruir(): void {
    this.objetos.forEach((o) => o.destroy());
    this.botao.destruir();
    this.barra.destruir();
  }
}
