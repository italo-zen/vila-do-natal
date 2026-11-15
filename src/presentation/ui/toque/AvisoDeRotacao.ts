import type { PerfilDeArte } from '../../../application/arte/PerfilDeArte';
import type { AreaDeToque } from './ControlesDeToque';

/** Tempo de uma volta completa do celular (ADR-007 seção 10.2). Tempo de tela, não de arte. */
const DURACAO_DA_VOLTA_S = 1.6;

/**
 * Aviso de rotação (ADR-007 seção 10.2; GDD 18.8). Tela inteira em `tema.fundo`, o celular girando (sprite sem texto) e
 * as duas linhas de texto. Sem barra e sem botão. Só aparece com toque em retrato; o congelamento é do jogo (jogo.ts).
 * Tamanhos e cores vêm do perfil e são aplicados por JS; o CSS usa variáveis, sem número de arte.
 */
export class AvisoDeRotacao {
  private readonly raiz: HTMLDivElement;

  /** `quadros`: quadros da folha do celular, lidos do sprites.json (ADR-007 seção 5.5). */
  constructor(doc: Document, perfil: PerfilDeArte, urls: Record<string, string>, textos: { linha1: string; linha2: string }, quadros: number) {
    if (!perfil.toque) throw new Error(`Perfil "${perfil.id}" sem o bloco "toque" (ADR-007 seção 5).`);
    const tamanho = perfil.toque.rotacao.tamanhoCss;
    this.raiz = doc.createElement('div');
    this.raiz.id = 'aviso-de-rotacao';
    this.raiz.style.display = 'none';
    this.raiz.style.background = perfil.tema.fundo;
    this.raiz.style.color = perfil.tema.texto;
    this.raiz.style.fontFamily = `"${perfil.fonte.familia}", monospace`;
    this.raiz.style.fontSize = `${perfil.fonte.corpo}px`;
    this.raiz.style.lineHeight = `${perfil.fonte.entrelinhas + perfil.fonte.corpo}px`;
    // Espaços do perfil (não número de arte no CSS): entre o celular e o texto, e entre as linhas.
    this.raiz.style.gap = `${perfil.espaco.grande}px`;
    // Com o padding dentro da largura da área (border-box), a tela tem exatamente a largura da área visível.
    this.raiz.style.boxSizing = 'border-box';
    this.raiz.style.padding = `${perfil.espaco.medio}px`;

    const celular = doc.createElement('div');
    celular.className = 'celular';
    celular.setAttribute('role', 'img');
    celular.style.width = `${tamanho}px`;
    celular.style.height = `${tamanho}px`;
    celular.style.setProperty('--tamanho', `${tamanho}px`);
    celular.style.setProperty('--quadros', String(quadros));
    celular.style.setProperty('--volta', `${DURACAO_DA_VOLTA_S}s`);
    celular.style.backgroundImage = `url("${urls['ctl_celular.png'] ?? ''}")`;

    // Bloco de texto na largura toda da coluna, com as linhas centralizadas: a quebra acontece dentro da tela.
    const texto = doc.createElement('div');
    texto.className = 'textos';
    texto.style.alignSelf = 'stretch';
    texto.style.textAlign = 'center';
    for (const linha of [textos.linha1, textos.linha2]) {
      const p = doc.createElement('p');
      p.textContent = linha;
      p.style.margin = `0 0 ${perfil.espaco.pequeno}px`;
      p.style.overflowWrap = 'break-word';
      texto.appendChild(p);
    }
    this.raiz.append(celular, texto);
    doc.body.appendChild(this.raiz);
  }

  /** Posiciona e mostra/esconde o aviso na área visível (ADR-007 seção 3). */
  atualizar(area: AreaDeToque, ligado: boolean): void {
    this.raiz.style.left = `${area.origem.x}px`;
    this.raiz.style.top = `${area.origem.y}px`;
    this.raiz.style.width = `${area.tamanho.largura}px`;
    this.raiz.style.height = `${area.tamanho.altura}px`;
    this.raiz.style.display = ligado ? 'flex' : 'none';
  }
}
