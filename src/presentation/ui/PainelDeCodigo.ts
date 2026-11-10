import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, telaDe } from './tema';
import { Barra } from './Barra';
import { Botao, PRESSIONADO_MS } from './Botao';
import { inicioCentrado } from './layout';
import { limpaMensagemDoPainel, teclaDoPainel } from '../input/mapaDeTeclas';
import { tocarSom } from '../audio/somDaCena';
import { areaDeToqueEmJogo, ALVO_DE_TOQUE_CSS } from './escala';
import { comToqueDaCena, fatorDaCena } from './toque/toqueDaCena';

export interface OpcoesDoPainel {
  pergunta: string;
  apagar: string;
  ok: string;
  /** Chaves das linhas da barra de controles (GDD 14.8). */
  barra: string[];
  aoConfirmar: (digitos: string) => void;
  aoFechar: () => void;
}

/** Dígitos do código da porta (3, ADR-001 CodigoDaPorta). Campos e grade são desenhados a partir do perfil. */
const CAMPOS = 3;
/** Profundidades do painel (acima do fundo; teclas acima de tudo). */
const PROFUNDIDADE_FUNDO = 2000;
const PROFUNDIDADE_TEXTO = 2001;
const PROFUNDIDADE_CAMPO = 2002;
const PROFUNDIDADE_TECLA = 2010;
/** Rótulo de Fechar na grade do toque (chave `painel.fechar`, GDD 18.12). */
const ROTULO_FECHAR = 'Fechar';

/** Tecla da grade: dígito, Apagar, OK ou Fechar (Fechar só existe no toque, ADR-007 seção 8.1). */
type TipoDeTecla = 'digito' | 'apagar' | 'ok' | 'fechar';
interface TeclaDaGrade {
  botao: Botao;
  tipo: TipoDeTecla;
  valor: string;
}
interface DescricaoDaTecla {
  tipo: TipoDeTecla;
  valor: string;
  rotulo: string;
  /** Posição na grade (coluna e linha, a partir de 0) e quantas colunas a tecla ocupa. */
  coluna: number;
  linha: number;
  colunas: number;
}

/**
 * Teclado numérico da porta (GDD 14.1 e 14.9.4). Teclado do computador (regras em `teclaDoPainel`):
 * - dígitos digitam no próximo campo, sem mover o foco (ignorados com os 3 campos cheios);
 * - Backspace ou X apaga o último dígito; Esc fecha (única tecla que fecha);
 * - setas ou WASD movem o foco na grade (começa em OK, a cada abertura);
 * - Z ou Enter: aperta a tecla em foco; em OK, confirma.
 * No toque (ADR-007 seção 8): grade de 5 colunas × 3 linhas com "Fechar" (bloco `toque.painel`). Tocar numa tecla age na
 * hora, sem mover o foco visual (GDD 18.3, "sem foco"). No computador, a grade segue 3 × 4 e sem "Fechar".
 * As teclas são botões com caixa; a pergunta e as mensagens são texto informativo, sem caixa.
 * Campos, moldura e grade vêm do perfil (`painel`, `botao`, `toque`); o painel ocupa a tela inteira.
 */
export class PainelDeCodigo {
  private digitos = '';
  private foco = 0;
  private mensagem: Phaser.GameObjects.Text;
  private campos: Phaser.GameObjects.Text[] = [];
  private teclas: TeclaDaGrade[] = [];
  private colunas = 3;
  private objetos: Phaser.GameObjects.GameObject[] = [];
  private readonly barra: Barra;
  private readonly teclado: Phaser.Input.Keyboard.KeyboardPlugin;

  constructor(
    private readonly cena: Phaser.Scene,
    private readonly opcoes: OpcoesDoPainel,
  ) {
    const p = perfilDe(cena);
    const { largura, altura } = telaDe(p);
    const painel = p.painel;
    this.teclado = cena.input.keyboard!;

    const fundo = cena.add.graphics().setScrollFactor(0).setDepth(PROFUNDIDADE_FUNDO);
    // Fundo sólido (BUG-R13-03; GDD 14.1, "o painel cobre a cena"): cor cheia, sem a transparência da caixa de diálogo.
    fundo.fillStyle(numeroDaCor(p.tema.fundo), 1).fillRect(0, 0, largura, altura);
    this.guardar(fundo);

    this.guardar(
      cena.add
        .text(largura / 2, painel.margemTopo, opcoes.pergunta, estilo(p, p.fonte.corpo, p.tema.texto, { align: 'center' }))
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(PROFUNDIDADE_TEXTO),
    );

    const campos = painel.campos;
    const xDoPrimeiro = inicioCentrado(largura, CAMPOS * campos.passo);
    for (let i = 0; i < CAMPOS; i++) {
      const x = xDoPrimeiro + i * campos.passo;
      const caixa = cena.add.graphics().setScrollFactor(0).setDepth(PROFUNDIDADE_TEXTO);
      caixa.lineStyle(p.botao.bordaNormal, numeroDaCor(p.tema.texto), 1).strokeRect(x, campos.topo, campos.largura, campos.altura);
      this.guardar(caixa);
      const campo = cena.add
        .text(x + campos.largura / 2, campos.topo + campos.textoDeTopo, '', estilo(p, p.fonte.corpo, p.tema.destaque))
        .setOrigin(0.5, 0)
        .setScrollFactor(0)
        .setDepth(PROFUNDIDADE_CAMPO);
      this.campos.push(campo);
      this.guardar(campo);
    }

    this.mensagem = cena.add
      .text(painel.mensagem.x, painel.mensagem.y, '', estilo(p, p.fonte.corpo, p.tema.texto, { wordWrap: { width: painel.mensagem.largura }, lineSpacing: p.fonte.entrelinhasFina }))
      .setScrollFactor(0)
      .setDepth(PROFUNDIDADE_TEXTO);
    this.guardar(this.mensagem);

    const noToque = comToqueDaCena(cena) && p.toque !== undefined;
    const grade = noToque ? p.toque!.painel : painel.grade;
    const larguraTecla = noToque ? p.toque!.painel.larguraTecla : p.botao.larguraTecla;
    const alturaTecla = noToque ? p.toque!.painel.alturaTecla : p.botao.alturaTecla;
    const f = fatorDaCena(cena);
    this.colunas = grade.colunas;

    const grelha = this.grelha(noToque);
    const xDaGrade = inicioCentrado(largura, grade.colunas * grade.passoX);
    // Teclas de 2 colunas (Apagar e Fechar, no toque) ocupam o passo de duas colunas menos o espaço entre elas.
    const folga = grade.passoX - larguraTecla;
    grelha.forEach((tecla) => {
      const larguraDaTecla = tecla.colunas * grade.passoX - folga;
      const botao = new Botao(cena, xDaGrade + tecla.coluna * grade.passoX + larguraDaTecla / 2, grade.topo + tecla.linha * grade.passoY + alturaTecla / 2, tecla.rotulo, {
        w: larguraDaTecla,
        h: alturaTecla,
        tamanho: p.fonte.corpo,
        bordaFoco: p.botao.bordaFocoTecla,
        // Acima do fundo do painel (2000) e das mensagens/barra do painel (2001-2002).
        profundidade: PROFUNDIDADE_TECLA,
        // Área de toque de pelo menos 48 CSS px (ADR-007 seção 4.5). Sem toque, a zona não existe.
        areaDeToque: {
          w: areaDeToqueEmJogo(larguraDaTecla, ALVO_DE_TOQUE_CSS, f),
          h: areaDeToqueEmJogo(alturaTecla, ALVO_DE_TOQUE_CSS, f),
        },
      });
      const indice = this.teclas.length;
      botao.sobreMouse?.on('pointerdown', () => this.pressionarTecla(indice));
      this.teclas.push({ botao, tipo: tecla.tipo, valor: tecla.valor });
    });
    this.foco = this.indiceDo('ok');

    this.barra = new Barra(cena, PROFUNDIDADE_TEXTO);
    this.barra.definir(opcoes.barra);

    this.teclado.on('keydown', this.aoTeclar);
    this.atualizarCampos();
    this.desenharFoco();
  }

  /**
   * Ordem da grade. Teclado: 1 a 9, Apagar, 0, OK (3 × 4). Toque: 1 a 9, 0, Apagar, OK, Fechar (5 × 3, ADR-007 seção 8.2).
   * Os rótulos decidem a função de cada tecla; a posição não.
   */
  private grelha(noToque: boolean): DescricaoDaTecla[] {
    const cores = noToque ? 5 : 3;
    const celula = (d: Omit<DescricaoDaTecla, 'coluna' | 'linha' | 'colunas'>, i: number, colunas = 1, linhaFixa?: number, colunaFixa?: number): DescricaoDaTecla => ({
      ...d,
      coluna: colunaFixa ?? i % cores,
      linha: linhaFixa ?? Math.floor(i / cores),
      colunas,
    });
    const digitos = ['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => ({ tipo: 'digito' as const, valor: d, rotulo: d }));
    const zero = { tipo: 'digito' as const, valor: '0', rotulo: '0' };
    const apagar = { tipo: 'apagar' as const, valor: '', rotulo: this.opcoes.apagar };
    const ok = { tipo: 'ok' as const, valor: '', rotulo: this.opcoes.ok };
    if (noToque) {
      // 5 × 3 (ADR-007 8.2). Linha 3: Apagar ocupa 2 colunas, OK 1 e Fechar 2 (os rótulos cabem; a grade não muda de forma).
      const fechar = { tipo: 'fechar' as const, valor: '', rotulo: ROTULO_FECHAR };
      return [
        ...digitos.map((d, i) => celula(d, i)),
        celula(zero, 9),
        celula(apagar, 10, 2, 2, 0),
        celula(ok, 11, 1, 2, 2),
        celula(fechar, 12, 2, 2, 3),
      ];
    }
    return [...digitos.map((d, i) => celula(d, i)), celula(apagar, 9), celula(zero, 10), celula(ok, 11)];
  }

  private indiceDo(tipo: TipoDeTecla): number {
    return this.teclas.findIndex((t) => t.tipo === tipo);
  }

  mostrarMensagem(texto: string): void {
    this.mensagem.setText(texto);
  }

  /** Some com a mensagem de erro (GDD 19.11, j). A sequência segue: o próximo erro mostra a mensagem seguinte. */
  limparMensagem(): void {
    this.mensagem.setText('');
  }

  limpar(): void {
    this.digitos = '';
    this.atualizarCampos();
  }

  destruir(): void {
    this.teclado.off('keydown', this.aoTeclar);
    this.objetos.forEach((o) => o.destroy());
    this.objetos = [];
    this.teclas.forEach((t) => t.botao.destruir());
    this.barra.destruir();
  }

  private guardar(o: Phaser.GameObjects.GameObject): void {
    this.objetos.push(o);
  }

  private aoTeclar = (ev: KeyboardEvent): void => {
    const t = teclaDoPainel(ev.key, ev.repeat);
    if (!t) return;
    if (t.tipo === 'digito' || t.tipo === 'apagar') {
      if (limpaMensagemDoPainel('teclado', t.tipo)) this.limparMensagem();
    }
    if (t.tipo === 'digito' || t.tipo === 'apagar') tocarSom(this.cena, 'S11');
    switch (t.tipo) {
      case 'fechar':
        return this.opcoes.aoFechar();
      case 'mover':
        if (t.acao === 'cima') return this.mover(-this.colunas);
        if (t.acao === 'baixo') return this.mover(this.colunas);
        return this.mover(t.acao === 'esquerda' ? -1 : 1);
      case 'digito':
        return this.digitar(t.valor);
      case 'apagar':
        return this.apagar();
      case 'apertar':
        // Teclado: aperta a tecla em foco (Z ou Enter), sem mudar o foco.
        return this.pressionarTecla(this.foco);
    }
  };

  /**
   * Efeito de uma tecla da grade, pelo índice (ADR-007 seção 8.3). Usado pelo teclado (tecla em foco) e pelo toque
   * (tecla tocada, sem mudar o foco). Digitar e apagar são imediatos; OK e Fechar esperam os 150 ms do pressionado.
   */
  private pressionarTecla(i: number): void {
    const tecla = this.teclas[i];
    if (!tecla) return;
    tecla.botao.pressionar();
    if (limpaMensagemDoPainel('toque', tecla.tipo)) this.limparMensagem();
    tocarSom(this.cena, tecla.tipo === 'ok' || tecla.tipo === 'fechar' ? 'S12' : 'S11');
    switch (tecla.tipo) {
      case 'digito':
        return this.digitar(tecla.valor);
      case 'apagar':
        return this.apagar();
      case 'ok': {
        // Confirma depois dos 150 ms do estado pressionado.
        const digitos = this.digitos;
        this.cena.time.delayedCall(PRESSIONADO_MS, () => this.opcoes.aoConfirmar(digitos));
        return;
      }
      case 'fechar':
        this.cena.time.delayedCall(PRESSIONADO_MS, () => this.opcoes.aoFechar());
        return;
    }
  }

  private mover(delta: number): void {
    const colunas = this.colunas;
    const novo = this.foco + delta;
    const col = this.foco % colunas;
    if (delta === -1 || delta === 1) {
      if (col + delta < 0 || col + delta > colunas - 1) return;
    }
    if (novo < 0 || novo > this.teclas.length - 1) return;
    this.foco = novo;
    this.desenharFoco();
    tocarSom(this.cena, 'S11');
  }

  private digitar(d: string): void {
    if (this.digitos.length >= CAMPOS) return;
    this.digitos += d;
    this.atualizarCampos();
  }

  private apagar(): void {
    this.digitos = this.digitos.slice(0, -1);
    this.atualizarCampos();
  }

  private atualizarCampos(): void {
    this.campos.forEach((c, i) => c.setText(this.digitos[i] ?? ''));
  }

  private desenharFoco(): void {
    this.teclas.forEach((t, i) => t.botao.setFoco(i === this.foco));
  }
}
