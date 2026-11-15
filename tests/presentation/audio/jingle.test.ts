import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Som, type EntradaDeAudio } from '../../../src/presentation/audio/Som';
import type { EstadoDoMotor, MotorDeAudio, NoDeAudio, OpcoesDeToque, VozDeAudio } from '../../../src/presentation/audio/motorDeAudio';
import {
  CONSTANTES_DO_JINGLE,
  ESPERA_MAXIMA_S,
  RAMPA_DE_CORTE_S,
  estadoDoJingle,
  planejarConquista,
} from '../../../src/presentation/audio/jingle';

/** ADR-008 5.2, 9.1 e 9.5 (AU15 a AU20; A8). Motor falso com relógio próprio: os instantes são exatos. */
const RAIZ = join(__dirname, '..', '..', '..');
const config: EntradaDeAudio['config'] = JSON.parse(readFileSync(join(RAIZ, 'content', 'audio.json'), 'utf-8'));
const gdd = readFileSync(join(RAIZ, 'GDD.md'), 'utf-8');
const laco = { atrasoInicial: 1105, preenchimentoFinal: 551, amostrasNoArquivo: 795456, amostras: 793800 };

/** Duração de cada arquivo (s): jingles como na entrega da Arte (audio-meta.json), efeitos de ADR-008 5. */
const DURACAO: Record<string, number> = {
  mus_natal: 36,
  sfx_s01_passo: 0.13,
  sfx_s02_porta: 0.45,
  sfx_s03_porta_abriu: 0.9,
  sfx_s04_interruptor: 0.75,
  sfx_s05_peca: 1.0,
  sfx_s06_encaixe: 2.0,
  sfx_s07_au: 0.2,
  sfx_s08_fungada: 0.5,
  sfx_s10_dialogo: 0.1,
  sfx_s11_foco: 0.05,
  sfx_s12_confirma: 0.1,
  sfx_s13_erro: 0.5,
  jin_j01_luzes: 2.5,
  jin_j02_parte1: 3.0,
  jin_j03_parte2: 3.0,
  jin_j04_parte3: 3.0,
  jin_j05_enfeites: 3.6,
  jin_jc_natal: 15.5,
};
const RATE = 22050;

function entrada(): EntradaDeAudio {
  const ids = Object.keys(DURACAO);
  const bytes: Record<string, ArrayBuffer> = {};
  ids.forEach((id, i) => (bytes[id] = new ArrayBuffer(10 + i)));
  return { config, laco, bytes };
}

interface Motor {
  motor: MotorDeAudio;
  reg: {
    tocadas: { id: string; opcoes: OpcoesDeToque; fimEm: number }[];
    pararem: { voz: number; instante: number; rampaS: number }[];
    rampas: { alvo: number; duracaoS: number; inicioEm: number }[];
  };
  avancar(s: number): void;
  agora(): number;
}

function motorComRelogio(): Motor {
  let t = 0;
  let estado: EstadoDoMotor = 'suspenso';
  const reg: Motor['reg'] = { tocadas: [], pararem: [], rampas: [] };
  const trilha = { trilha: true };
  const idDe = (b: unknown) => (b as { id: string }).id;
  const motor: MotorDeAudio = {
    iniciar() {
      // Contexto já ativo: a música não recomeça por causa do resume (esse caminho tem teste próprio em destravaIos).
      estado = 'ativo';
    },
    async decodificar(bytes) {
      const id = Object.keys(DURACAO)[bytes.byteLength - 10];
      return { id, length: Math.round(DURACAO[id] * RATE), sampleRate: RATE };
    },
    comprimento: (b) => (b as { length: number }).length,
    taxaDoBuffer: () => RATE,
    tocar(buffer, opcoes): VozDeAudio {
      const inicio = Math.max(t, opcoes.inicioEm ?? t);
      const fimEm = opcoes.loop ? Infinity : inicio + DURACAO[idDe(buffer)];
      const n = reg.tocadas.length;
      reg.tocadas.push({ id: idDe(buffer), opcoes, fimEm });
      return {
        fimEm,
        parar: () => undefined,
        pararEm: (instante, rampaS = 0) => reg.pararem.push({ voz: n, instante, rampaS }),
      };
    },
    definirMestre: () => undefined,
    barramentoDaTrilha: () => trilha as NoDeAudio,
    agora: () => t,
    rampaGanho(_no, alvo, duracaoS, inicioEm) {
      reg.rampas.push({ alvo, duracaoS, inicioEm });
    },
    estado: () => estado,
    async retomar() {
      estado = 'ativo';
    },
  };
  return {
    motor,
    reg,
    avancar: (s) => (t += s),
    agora: () => t,
  };
}

/** Som já decodificado, com gesto dado (a trilha começa). Retorna o motor falso junto. */
async function somPronto(): Promise<{ som: Som; m: Motor }> {
  const m = motorComRelogio();
  const som = new Som(m.motor, entrada(), () => m.agora() * 1000);
  await som.decodificarTudo();
  som.gesto('click');
  return { som, m };
}

const linear = (db: number) => Math.pow(10, db / 20);

describe('jingle: constantes e planejamento (ADR-008 5.2; A8)', () => {
  it('A8: as constantes batem com a tabela do GDD 19.2.7 (b, c)', () => {
    expect(gdd).toContain('**8 dB** em 0,3 s e volta em 0,5 s');
    expect(gdd).toContain('A trilha baixa **10 dB** em 0,5 s');
    expect(gdd).toContain('teto de 1,5 s');
    expect(gdd).toContain('rampa de 30 ms');
    expect(CONSTANTES_DO_JINGLE).toEqual({
      duckingConquistaDb: -8,
      entradaConquistaS: 0.3,
      saidaConquistaS: 0.5,
      duckingCreditosDb: -10,
      entradaCreditosS: 0.5,
      saidaCreditosS: 0.5,
      esperaMaximaS: 1.5,
      rampaDeCorteS: 0.03,
    });
  });

  it('sem efeito em curso, o jingle começa agora', () => {
    expect(planejarConquista(2.5, 4, null)).toEqual({ inicioEm: 4, fimPrevisto: 6.5 });
  });

  it('espera o efeito em curso (S04 até 0,75 s) e não passa do teto de 1,5 s', () => {
    expect(planejarConquista(2.5, 0.2, { fimEm: 0.75 }).inicioEm).toBe(0.75);
    expect(planejarConquista(2.5, 0.1, { fimEm: 2.0 }).inicioEm).toBeCloseTo(0.1 + ESPERA_MAXIMA_S, 5);
  });

  it('estado do jingle é derivado dos instantes', () => {
    const j = { inicioEm: 1, fimEm: 3, saidaS: 0.5, cortadoEm: null };
    expect(estadoDoJingle(j, 0.5)).toBe('esperando');
    expect(estadoDoJingle(j, 2)).toBe('tocando');
    expect(estadoDoJingle(j, 3.2)).toBe('saindo');
    expect(estadoDoJingle(j, 4)).toBe('ocioso');
  });
});

describe('AU15: jingle por conquista (GDD 19.2.7 a)', () => {
  it('cada conquista toca o seu arquivo, uma vez, com o nome da variante no gancho', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    const tocados = m.reg.tocadas.filter((t) => t.id.startsWith('jin_'));
    expect(tocados.map((t) => t.id)).toEqual(['jin_j01_luzes']);
    expect(som.estado().ultimosEventos.at(-1)).toMatchObject({ evento: 'S09', variante: 'J01' });
  });

  it('os cinco arquivos são diferentes e cada chave toca o seu', async () => {
    const chaves = ['conquista.luzes', 'conquista.parte1', 'conquista.parte2', 'conquista.parte3', 'conquista.enfeites'];
    const ids: string[] = [];
    for (const c of chaves) {
      const { som, m } = await somPronto();
      som.tocarConquista(c, 'conquista');
      ids.push(m.reg.tocadas.find((t) => t.id.startsWith('jin_'))!.id);
    }
    expect(new Set(ids).size).toBe(5);
    expect(ids).toEqual(['jin_j01_luzes', 'jin_j02_parte1', 'jin_j03_parte2', 'jin_j04_parte3', 'jin_j05_enfeites']);
  });

  it('um segundo pedido enquanto o jingle toca é descartado (uma vez)', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    som.tocarConquista('conquista.parte1', 'conquista');
    expect(m.reg.tocadas.filter((t) => t.id.startsWith('jin_'))).toHaveLength(1);
    expect(som.estado().descartados.ocupado).toBe(1);
  });

  it('jingle fora da tela de conquista não toca (R9)', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'exploracao');
    expect(m.reg.tocadas.filter((t) => t.id.startsWith('jin_'))).toHaveLength(0);
  });
});

describe('AU16: ducking da trilha, sem reiniciar o laço', () => {
  it('conquista: a trilha baixa 8 dB em 0,3 s e volta em 0,5 s depois do fim do jingle', async () => {
    const { som, m } = await somPronto();
    m.avancar(1);
    som.tocarConquista('conquista.luzes', 'conquista');
    const [duck, volta] = m.reg.rampas.slice(-2);
    expect(duck.alvo).toBeCloseTo(linear(-8), 5);
    expect(duck.duracaoS).toBe(0.3);
    expect(duck.inicioEm).toBe(1);
    expect(volta.alvo).toBe(1);
    expect(volta.duracaoS).toBe(0.5);
    expect(volta.inicioEm).toBeCloseTo(1 + 2.5, 5);
    m.avancar(0.5);
    expect(som.estado().trilha.duckingDb).toBe(-8);
    m.avancar(2);
    expect(som.estado().trilha.duckingDb).toBe(0);
  });

  it('a trilha não para nem reinicia: a música toca uma vez, em laço', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    m.avancar(5);
    som.tocarConquista('conquista.parte1', 'conquista');
    const musicas = m.reg.tocadas.filter((t) => t.id === 'mus_natal');
    expect(musicas).toHaveLength(1);
    expect(musicas[0].opcoes.loop).toBe(true);
    expect(som.estado().trilha.tempoS).toBeGreaterThan(4.9);
  });

  it('créditos: a trilha baixa 10 dB em 0,5 s e volta em 0,5 s ao fim do JC', async () => {
    const { som, m } = await somPronto();
    m.avancar(2);
    som.tocarCreditos();
    const [duck, volta] = m.reg.rampas.slice(-2);
    expect(duck.alvo).toBeCloseTo(linear(-10), 5);
    expect(duck.duracaoS).toBe(0.5);
    expect(volta.alvo).toBe(1);
    expect(volta.duracaoS).toBe(0.5);
    expect(volta.inicioEm).toBeCloseTo(2 + 15.5, 5);
  });
});

describe('AU17: espera do efeito, teto de 1,5 s, cancelamento ao Continuar', () => {
  it('jingle espera o S04 em curso e toca quando ele acaba', async () => {
    const { som, m } = await somPronto();
    som.tocar('S04', 'conquista');
    m.avancar(0.2);
    som.tocarConquista('conquista.luzes', 'conquista');
    const jingle = m.reg.tocadas.find((t) => t.id.startsWith('jin_'))!;
    expect(jingle.opcoes.inicioEm).toBeCloseTo(0.75, 5);
    expect(som.estado().jingle.estado).toBe('esperando');
    expect(som.estado().jingle.inicioEmS).toBeCloseTo(0.75, 5);
  });

  it('com S06 de 2 s em curso, a espera para em 1,5 s (teto)', async () => {
    const { som, m } = await somPronto();
    som.tocar('S06', 'conquista');
    m.avancar(0.1);
    som.tocarConquista('conquista.parte1', 'conquista');
    expect(m.reg.tocadas.find((t) => t.id.startsWith('jin_'))!.opcoes.inicioEm).toBeCloseTo(0.1 + ESPERA_MAXIMA_S, 5);
  });

  it('Continuar durante a espera cancela o início e toca S12 depois do corte (sem dois jingles)', async () => {
    const { som, m } = await somPronto();
    som.tocar('S04', 'conquista');
    m.avancar(0.2);
    som.tocarConquista('conquista.luzes', 'conquista');
    m.avancar(0.3);
    som.pararConquista('conquista', 'continuar');
    const voz = m.reg.tocadas.findIndex((t) => t.id.startsWith('jin_'));
    const corte = m.reg.pararem.find((p) => p.voz === voz)!;
    expect(corte).toMatchObject({ instante: 0.5, rampaS: 0 });
    const s12 = m.reg.tocadas.filter((t) => t.id === 'sfx_s12_confirma');
    expect(s12).toHaveLength(1);
    expect(s12[0].opcoes.inicioEm).toBeCloseTo(0.5 + RAMPA_DE_CORTE_S, 5);
    expect(som.estado().jingle.estado).toBe('ocioso');
    expect(m.reg.rampas.at(-1)).toMatchObject({ alvo: 1, inicioEm: 0.5 });
  });
});

describe('AU18: rampa de corte de 30 ms, sem clique', () => {
  it('Continuar durante o jingle corta com 30 ms e registra a rampa no gancho', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    m.avancar(1);
    som.pararConquista('conquista', 'continuar');
    expect(m.reg.pararem.at(-1)).toMatchObject({ instante: 1, rampaS: RAMPA_DE_CORTE_S });
    expect(som.estado().rampas.some((r) => r.tipo === 'corte' && r.ms === 30)).toBe(true);
  });

  it('X e B (saída) cortam do mesmo jeito, sem S12', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    m.avancar(1);
    som.pararConquista('conquista', 'saida');
    expect(m.reg.pararem.at(-1)).toMatchObject({ rampaS: RAMPA_DE_CORTE_S });
    expect(m.reg.tocadas.filter((t) => t.id === 'sfx_s12_confirma')).toHaveLength(0);
  });
});

describe('AU19: mudo e pausa não cortam nem mudam o jingle', () => {
  it('mudo não corta: o jingle segue no tempo, em silêncio', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    m.avancar(0.5);
    som.alternarMudo('conquista');
    expect(som.estaMudo).toBe(true);
    expect(m.reg.pararem).toHaveLength(0);
    expect(som.estado().jingle.estado).toBe('tocando');
    expect(som.estado().trilha.duckingDb).toBe(-8);
  });

  it('desmudar não reinicia o jingle nem a trilha', async () => {
    const { som, m } = await somPronto();
    som.tocarConquista('conquista.luzes', 'conquista');
    som.alternarMudo('conquista');
    m.avancar(1);
    som.alternarMudo('conquista');
    expect(m.reg.tocadas.filter((t) => t.id.startsWith('jin_'))).toHaveLength(1);
    expect(m.reg.tocadas.filter((t) => t.id === 'mus_natal')).toHaveLength(1);
  });
});

describe('AU20: jingle de créditos (JC) uma vez, sem laço', () => {
  it('JC toca uma vez, sem laço, e aparece uma vez no gancho', async () => {
    const { som, m } = await somPronto();
    som.tocarCreditos();
    const jc = m.reg.tocadas.filter((t) => t.id === 'jin_jc_natal');
    expect(jc).toHaveLength(1);
    expect(jc[0].opcoes.loop).toBe(false);
    expect(som.estado().ultimosEventos.filter((e) => e.evento === 'JC')).toHaveLength(1);
    expect(som.estado().jingle).toMatchObject({ variante: 'JC', estado: 'tocando' });
  });

  it('depois dos 15,5 s o jingle acaba e não volta; a trilha volta ao normal', async () => {
    const { som, m } = await somPronto();
    som.tocarCreditos();
    m.avancar(16.5);
    expect(som.estado().jingle.estado).toBe('ocioso');
    expect(som.estado().trilha.duckingDb).toBe(0);
    expect(m.reg.tocadas.filter((t) => t.id === 'jin_jc_natal')).toHaveLength(1);
  });

  it('sair dos créditos corta o JC com 30 ms e a trilha volta em 0,5 s', async () => {
    const { som, m } = await somPronto();
    som.tocarCreditos();
    m.avancar(3);
    som.pararCreditos();
    expect(m.reg.pararem.at(-1)).toMatchObject({ instante: 3, rampaS: RAMPA_DE_CORTE_S });
    expect(m.reg.rampas.at(-1)).toMatchObject({ alvo: 1, duracaoS: 0.5, inicioEm: 3 });
  });
});

describe('tocar S09 sem variante é erro (ADR-008 5.1)', () => {
  it('Som.tocar("S09") lança erro', async () => {
    const { som } = await somPronto();
    expect(() => som.tocar('S09', 'conquista')).toThrow(/tocarConquista/);
  });
});
