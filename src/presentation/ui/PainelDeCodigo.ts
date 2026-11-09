import Phaser from 'phaser';
import { estilo, numeroDaCor, perfilDe, telaDe } from './tema';
import { Barra } from './Barra';
import { Botao, PRESSIONADO_MS } from './Botao';
import { inicioCentrado } from './layout';
import { teclaDoPainel } from '../input/mapaDeTeclas';

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
/** Posições da grade de teclas (1-9, apagar, 0, OK), na ordem do GDD 14.9.4. */
const APAGAR = 9;
const OK = 11;
/** Profundidades do painel (acima do fundo; teclas acima de tudo). */
const PROFUNDIDADE_FUNDO = 2000;
const PROFUNDIDADE_TEXTO = 2001;
const PROFUNDIDADE_CAMPO = 2002;
const PROFUNDIDADE_TECLA = 2010;

/**
 * Teclado numérico da porta (GDD 14.1 e 14.9.4). Teclado do computador (regras em `teclaDoPainel`):
 * - dígitos digitam no próximo campo, sem mover o foco (ignorados com os 3 campos cheios);
 * - Backspace ou X apaga o último dígito; Esc fecha (única tecla que fecha);
 * - setas ou WASD movem o foco na grade (começa em OK, a cada abertura);
 * - Z ou Enter: aperta a tecla em foco; em OK, confirma.
 * As teclas são botões com caixa; a pergunta e as mensagens são texto informativo, sem caixa.
 * Campos, moldura e grade vêm do perfil (`painel`, `botao`); o painel ocupa a tela inteira.
 */
export class PainelDeCodigo {
  private digitos = '';
  private foco = OK;
  private mensagem: Phaser.GameObjects.Text;
  private campos: Phaser.GameObjects.Text[] = [];
  private teclas: { botao: Botao; valor: string }[] = [];
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
    fundo.fillStyle(numeroDaCor(p.tema.fundo), p.tema.alfaCaixa).fillRect(0, 0, largura, altura);
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

    const grade = painel.grade;
    const xDaGrade = inicioCentrado(largura, grade.colunas * grade.passoX);
    const rotulos = ['1', '2', '3', '4', '5', '6', '7', '8', '9', opcoes.apagar, '0', opcoes.ok];
    rotulos.forEach((rotulo, i) => {
      const col = i % grade.colunas;
      const lin = Math.floor(i / grade.colunas);
      const botao = new Botao(cena, xDaGrade + col * grade.passoX + p.botao.larguraTecla / 2, grade.topo + lin * grade.passoY + p.botao.alturaTecla / 2, rotulo, {
        w: p.botao.larguraTecla,
        h: p.botao.alturaTecla,
        tamanho: p.fonte.corpo,
        bordaFoco: p.botao.bordaFocoTecla,
        // Acima do fundo do painel (2000) e das mensagens/barra do painel (2001-2002).
        profundidade: PROFUNDIDADE_TECLA,
      });
      this.teclas.push({ botao, valor: rotulo });
    });

    this.barra = new Barra(cena, PROFUNDIDADE_TEXTO);
    this.barra.definir(opcoes.barra);

    this.teclado.on('keydown', this.aoTeclar);
    this.atualizarCampos();
    this.desenharFoco();
  }

  mostrarMensagem(texto: string): void {
    this.mensagem.setText(texto);
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
    switch (t.tipo) {
      case 'fechar':
        return this.opcoes.aoFechar();
      case 'mover':
        if (t.acao === 'cima') return this.mover(-this.colunas());
        if (t.acao === 'baixo') return this.mover(this.colunas());
        return this.mover(t.acao === 'esquerda' ? -1 : 1);
      case 'digito':
        return this.digitar(t.valor);
      case 'apagar':
        return this.apagar();
      case 'apertar':
        this.teclas[this.foco].botao.pressionar();
        if (this.foco === OK) {
          // Confirma depois dos 150 ms do estado pressionado.
          const digitos = this.digitos;
          return void this.cena.time.delayedCall(PRESSIONADO_MS, () => this.opcoes.aoConfirmar(digitos));
        }
        return this.apertarFoco();
    }
  };

  private colunas(): number {
    return perfilDe(this.cena).painel.grade.colunas;
  }

  private mover(delta: number): void {
    const colunas = this.colunas();
    const novo = this.foco + delta;
    const col = this.foco % colunas;
    if (delta === -1 || delta === 1) {
      if (col + delta < 0 || col + delta > colunas - 1) return;
    }
    if (novo < 0 || novo > this.teclas.length - 1) return;
    this.foco = novo;
    this.desenharFoco();
  }

  private apertarFoco(): void {
    if (this.foco === APAGAR) return this.apagar();
    const tecla = this.teclas[this.foco];
    if (/^[0-9]$/.test(tecla.valor)) this.digitar(tecla.valor);
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
