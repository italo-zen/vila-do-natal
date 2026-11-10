import type { PerfilDeArte, ToqueDoPerfil } from '../../../application/arte/PerfilDeArte';
import { FonteDeToque } from '../../input/FonteDeToque';
import type { Direcao } from '../../input/direcaoDoAnalogico';
import { PRESSIONADO_MS } from '../Botao';
import { botoesDaTela, semBotoes, temBordaDoJoystick, type ModoDoToque } from './botoesDaTela';
import { cursoDaBolinha, deslocamentoDaBolinha, escolherLayout, posicoesDoLayoutA, posicoesDoLayoutB, type Caixa, type Layout } from './layout';

const DIRECOES: Direcao[] = ['cima', 'baixo', 'esquerda', 'direita'];
type Botao = 'a' | 'b';

/** Área visível em px da janela (origem no canto da janela ou do visualViewport). */
export interface AreaDeToque {
  origem: { x: number; y: number };
  tamanho: { largura: number; altura: number };
}

/**
 * Controles de toque em DOM (ADR-007 seções 1.4, 4, 6, 7, 10.5 e 12.3; GDD 18.19). O joystick virtual (base, bolinha e
 * setor em anel) e os botões A e B. A base é o alvo; a bolinha e o setor não têm `pointer-events`. Cada toque chama a
 * `FonteDeToque`, que é a mesma fonte que as cenas leem pelo `Controles`.
 *
 * Soltar tudo (dono e direção) só na troca de modo, de layout ou de rotação. Redimensionar não solta o dedo (10.5).
 */
export class ControlesDeToque {
  readonly fonte = new FonteDeToque();
  private readonly toque: ToqueDoPerfil;
  private readonly raiz: HTMLDivElement;
  private readonly base: HTMLDivElement;
  private readonly bolinha: HTMLDivElement;
  private readonly setores: Record<Direcao, HTMLDivElement>;
  private readonly botoes: Record<Botao, HTMLDivElement>;
  private readonly dedosDosBotoes = new Map<number, Botao>();
  private modo: ModoDoToque = 'titulo';
  private rotacao = false;
  /** Caixa de diálogo, em px de jogo, que os botões de layout B não podem cobrir (null fora de diálogo). */
  private reserva: { topo: number; fundo: number } | null = null;
  private layout: Layout = 'A';
  /** Última geometria recebida de `atualizar`, para repor a posição quando a tela muda. */
  private geometria: { area: AreaDeToque; tela: Caixa; tile: number; fator: number } | null = null;
  /** Caixa da base na área visível (CSS px dentro da raiz), para posicionar a bolinha e os setores. */
  private caixaDaBase: Caixa = { x: 0, y: 0, largura: 0, altura: 0 };

  constructor(
    private readonly doc: Document,
    perfil: PerfilDeArte,
    private readonly urls: Record<string, string>,
  ) {
    if (!perfil.toque) throw new Error(`Perfil "${perfil.id}" sem o bloco "toque" (ADR-007 seção 5).`);
    this.toque = perfil.toque;

    this.raiz = this.el('controles-de-toque');
    this.raiz.id = 'controles-de-toque';
    this.base = this.el('analogico');
    this.base.dataset.alvo = 'analogico';
    this.base.appendChild(this.imagem('ctl_analogico_base.png', 'repouso'));
    this.bolinha = this.el('bolinha');
    this.bolinha.append(this.imagem('ctl_analogico_bolinha.png', 'repouso'), this.imagem('ctl_analogico_bolinha_pressionada.png', 'pressionado'));
    this.setores = {} as Record<Direcao, HTMLDivElement>;
    for (const dir of DIRECOES) {
      this.setores[dir] = this.el('setor');
      this.setores[dir].dataset.direcao = dir;
      this.setores[dir].appendChild(this.imagem(`ctl_analogico_brilho_${dir}.png`, 'repouso'));
    }
    this.botoes = {
      a: this.imagemDeControle('a', 'ctl_botao_a', 'botao'),
      b: this.imagemDeControle('b', 'ctl_botao_b', 'botao'),
    };
    // Ordem de desenho (GDD 18.19.7): base, bolinha, setor em anel (acima da bolinha), depois A e B.
    this.raiz.append(this.base, this.bolinha, ...DIRECOES.map((d) => this.setores[d]), this.botoes.a, this.botoes.b);
    doc.body.appendChild(this.raiz);

    this.base.addEventListener('pointerdown', (e) => this.baseAoPressionar(e));
    this.base.addEventListener('pointermove', (e) => this.baseAoMover(e));
    this.base.addEventListener('pointerup', (e) => this.baseAoSoltar(e));
    this.base.addEventListener('pointercancel', (e) => this.baseAoSoltar(e));
    this.base.addEventListener('lostpointercapture', (e) => this.baseAoSoltar(e));
    for (const acao of ['a', 'b'] as const) {
      const el = this.botoes[acao];
      el.addEventListener('pointerdown', (e) => this.botaoAoPressionar(acao, e));
      el.addEventListener('pointerup', (e) => this.botaoAoSoltar(e));
      el.addEventListener('pointercancel', (e) => this.botaoAoSoltar(e));
    }
    this.aplicarVisibilidade();
  }

  /**
   * A cena pediu a tela (ADR-007 seção 6). `reserva`: caixa de diálogo em px de jogo (só em layout B, para A e B
   * ficarem fora dela). Trocar de modo solta o joystick (7.1, M6). Chamada à vontade.
   */
  mostrarPara(modo: ModoDoToque, reserva: { topo: number; fundo: number } | null = null): void {
    const mudouReserva = (reserva?.topo ?? -1) !== (this.reserva?.topo ?? -1) || (reserva?.fundo ?? -1) !== (this.reserva?.fundo ?? -1);
    if (modo === this.modo && !mudouReserva) return;
    if (modo !== this.modo) this.fonte.soltarTudo();
    this.modo = modo;
    this.reserva = reserva;
    this.aplicarVisibilidade();
    if (mudouReserva && this.geometria) this.posicionarComGeometria();
  }

  /** Layout em uso agora ("A" ou "B"). A seleção mostra o botão "Voltar ao título" só no B (pergunta 42). */
  layoutAtual(): Layout {
    return this.layout;
  }

  /** Nenhum controle visível agora (layout B nos menus): a barra mostra a versão `.toque.menu`. */
  semControles(): boolean {
    if (this.rotacao || this.layout !== 'B') return false;
    return semBotoes(botoesDaTela(this.modo, this.layout));
  }

  /** Aviso de rotação (ADR-007 seção 10.3): esconde tudo e solta os dedos enquanto estiver ligado. */
  mostrarRotacao(ligado: boolean): void {
    if (ligado === this.rotacao) return;
    this.rotacao = ligado;
    this.fonte.bloquear(ligado);
    this.aplicarVisibilidade();
  }

  /**
   * Posiciona os controles para a área visível e a tela atual (ADR-007 seções 3 e 4). Chamado em cada ajuste de tela:
   * redimensionar não solta o dedo; só a troca de layout solta (10.5).
   */
  atualizar(area: AreaDeToque, tela: Caixa, tile: number, fator: number): void {
    this.geometria = { area, tela, tile, fator };
    this.posicionarComGeometria();
  }

  /**
   * Estado do joystick para o QA (ADR-007 12.3; build de QA): dono, direção, deslocamento do dedo e centro da bolinha em
   * CSS px da janela. Só no build de QA (ganchoQa).
   */
  estadoDoAnalogico(): { dono: boolean; direcao: Direcao | null; dx: number; dy: number; bolinha: { x: number; y: number } } {
    const r = this.bolinha.getBoundingClientRect();
    const { dx, dy } = this.fonte.deslocamento();
    return { dono: this.fonte.donoAtual() !== null, direcao: this.fonte.direcaoAtual(), dx, dy, bolinha: { x: r.left + r.width / 2, y: r.top + r.height / 2 } };
  }

  private posicionarComGeometria(): void {
    if (!this.geometria) return;
    const { area, tela, tile, fator } = this.geometria;
    const layout: Layout = escolherLayout(tela, area.tamanho, true, this.toque.faixaMinimaCss) ?? 'B';
    // Troca de layout (A para B, ou B para A) solta o joystick (10.5). Só a primeira vez não tem layout anterior.
    if (layout !== this.layout) this.fonte.soltarTudo();
    this.layout = layout;
    const pos = layout === 'A' ? posicoesDoLayoutA(area.tamanho, tela, this.toque) : posicoesDoLayoutB(tela, tile, fator, this.toque, this.reserva ?? undefined);
    this.raiz.style.left = `${area.origem.x}px`;
    this.raiz.style.top = `${area.origem.y}px`;
    this.raiz.style.width = `${area.tamanho.largura}px`;
    this.raiz.style.height = `${area.tamanho.altura}px`;
    this.raiz.style.setProperty('--op-repouso', String(layout === 'A' ? this.toque.opacidade.layoutA : this.toque.opacidade.layoutB));
    this.raiz.style.setProperty('--op-pressionado', String(this.toque.opacidade.pressionado));
    this.raiz.classList.toggle('layout-a', layout === 'A');
    this.raiz.classList.toggle('layout-b', layout === 'B');

    this.caixaDaBase = pos.analogico;
    this.posicionar(this.base, pos.analogico);
    for (const dir of DIRECOES) this.posicionar(this.setores[dir], pos.analogico);
    this.posicionar(this.botoes.a, pos.a);
    this.posicionar(this.botoes.b, pos.b);
    this.aplicarVisibilidade();
  }

  /** Mostra o que a tela pede (base, A e B) e aplica a regra de borda do menu. Não solta o dedo: quem solta é a troca de modo. */
  private aplicarVisibilidade(): void {
    const t = botoesDaTela(this.rotacao ? 'rotacao' : this.modo, this.layout);
    const joystick = t.direcoes.length > 0 ? '' : 'none';
    this.base.style.display = joystick;
    this.bolinha.style.display = joystick;
    this.botoes.a.style.display = t.a ? '' : 'none';
    this.botoes.b.style.display = t.b ? '' : 'none';
    this.fonte.definirBordas(!this.rotacao && temBordaDoJoystick(this.modo));
    this.desenhar();
  }

  // ---------- Joystick ----------

  /** Centro e raio da base na janela, medidos de novo a cada evento (ADR-007 1.4; 10.5). Null se a base está oculta. */
  private centroDaBase(): { x: number; y: number; raio: number } | null {
    const r = this.base.getBoundingClientRect();
    if (r.width === 0) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, raio: r.width / 2 };
  }

  /** Só o toque que começa dentro do círculo da base comanda (R14: os cantos do quadrado não contam). */
  private baseAoPressionar(e: PointerEvent): void {
    const c = this.centroDaBase();
    if (!c || Math.hypot(e.clientX - c.x, e.clientY - c.y) > c.raio) return;
    e.preventDefault();
    if (!this.fonte.pressionarBase(e.pointerId, e.clientX - c.x, e.clientY - c.y)) return;
    this.base.setPointerCapture(e.pointerId);
    this.desenhar();
  }

  private baseAoMover(e: PointerEvent): void {
    if (this.fonte.donoAtual() !== e.pointerId) return;
    const c = this.centroDaBase();
    if (!c) return;
    this.fonte.moverBase(e.pointerId, e.clientX - c.x, e.clientY - c.y);
    this.desenhar();
  }

  /** Soltar, cancelar ou perder a captura zera o joystick se o ponteiro era o dono (GDD 18.19.6). */
  private baseAoSoltar(e: PointerEvent): void {
    if (this.fonte.donoAtual() !== e.pointerId) return;
    this.fonte.soltarBase(e.pointerId);
    if (this.base.hasPointerCapture?.(e.pointerId)) this.base.releasePointerCapture(e.pointerId);
    this.desenhar();
  }

  /** Bolinha no ponto do dedo, limitada ao curso; setor só para a direção engajada e aceita pela tela (GDD 18.19.7). */
  private desenhar(): void {
    const base = this.toque.analogico.baseCss;
    const bolinhaCss = this.toque.analogico.bolinhaCss;
    const dono = this.fonte.donoAtual() !== null;
    const { dx, dy } = dono ? this.fonte.deslocamento() : { dx: 0, dy: 0 };
    const ponto = deslocamentoDaBolinha(dx, dy, cursoDaBolinha(base, bolinhaCss));
    const cx = this.caixaDaBase.x + base / 2 + ponto.dx;
    const cy = this.caixaDaBase.y + base / 2 + ponto.dy;
    this.bolinha.style.left = `${cx - bolinhaCss / 2}px`;
    this.bolinha.style.top = `${cy - bolinhaCss / 2}px`;
    this.bolinha.style.width = `${bolinhaCss}px`;
    this.bolinha.style.height = `${bolinhaCss}px`;
    this.bolinha.classList.toggle('on', dono);

    const direcao = this.fonte.direcaoAtual();
    const aceitas = botoesDaTela(this.rotacao ? 'rotacao' : this.modo, this.layout).direcoes;
    for (const dir of DIRECOES) {
      this.setores[dir].style.display = dir === direcao && aceitas.includes(dir) ? '' : 'none';
    }
    this.base.classList.toggle('on', dono);
  }

  // ---------- A e B ----------

  /** A e B agem na borda de pressionar, no botão onde o toque começou (ADR-007 seção 1.4 e regra 3). */
  private botaoAoPressionar(acao: Botao, e: PointerEvent): void {
    e.preventDefault();
    this.botoes[acao].setPointerCapture(e.pointerId);
    this.dedosDosBotoes.set(e.pointerId, acao);
    this.fonte.pressionarBotao(acao);
    this.marcarBotao(acao, true);
  }

  private botaoAoSoltar(e: PointerEvent): void {
    const acao = this.dedosDosBotoes.get(e.pointerId);
    if (acao === undefined) return;
    this.dedosDosBotoes.delete(e.pointerId);
    // O estado pressionado dura o mesmo tempo do botão de canvas (150 ms), mesmo com o dedo já levantado.
    this.doc.defaultView?.setTimeout(() => this.marcarBotao(acao, false), PRESSIONADO_MS);
  }

  private marcarBotao(acao: Botao, ligado: boolean): void {
    const segurado = [...this.dedosDosBotoes.values()].includes(acao);
    this.botoes[acao].classList.toggle('on', ligado || segurado);
  }

  // ---------- DOM ----------

  private posicionar(el: HTMLElement, c: Caixa): void {
    el.style.left = `${c.x}px`;
    el.style.top = `${c.y}px`;
    el.style.width = `${c.largura}px`;
    el.style.height = `${c.altura}px`;
  }

  private imagemDeControle(alvo: string, base: string, classe: 'botao'): HTMLDivElement {
    const div = this.el(classe);
    div.dataset.alvo = alvo;
    div.append(this.imagem(`${base}.png`, 'repouso'), this.imagem(`${base}_pressionado.png`, 'pressionado'));
    return div;
  }

  private imagem(arquivo: string, classe: string): HTMLImageElement {
    const img = this.doc.createElement('img');
    img.className = classe;
    img.src = this.urls[arquivo] ?? '';
    img.alt = '';
    img.draggable = false;
    return img;
  }

  private el(classe: string): HTMLDivElement {
    const e = this.doc.createElement('div');
    e.className = classe;
    return e;
  }
}
