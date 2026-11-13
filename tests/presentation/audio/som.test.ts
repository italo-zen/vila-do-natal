import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Som, type EntradaDeAudio } from '../../../src/presentation/audio/Som';
import type { EstadoDoMotor, MotorDeAudio, OpcoesDeToque, VozDeAudio } from '../../../src/presentation/audio/motorDeAudio';

/** ADR-008 1, 2, 3, 9.1 (som.test.ts, motor falso): fila antes do decode, descarte, mudo, desmudo e limite. */
const config: EntradaDeAudio['config'] & { eventos: Record<string, { id: string; ganhoDb: number }> } = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'content', 'audio.json'), 'utf-8'));
const laco = { atrasoInicial: 1105, preenchimentoFinal: 551, amostrasNoArquivo: 795456, amostras: 793800 };

interface Registro {
  tocadas: { id: string; opcoes: OpcoesDeToque }[];
  paradas: number;
  mestres: number[];
  retomadas: number;
  estadoAtual: EstadoDoMotor;
}

function motorFalso(): { motor: MotorDeAudio; reg: Registro } {
  const reg: Registro = { tocadas: [], paradas: 0, mestres: [], retomadas: 0, estadoAtual: 'nenhum' };
  const motor: MotorDeAudio = {
    iniciar() {
      // Como o motor real: iniciar não põe o contexto em "running"; só o resume (retomar) faz isso, dentro do gesto.
    },
    async decodificar(bytes) {
      return { id: bytes.byteLength, length: bytes.byteLength === 1 ? 795456 : 4000 };
    },
    taxaDoBuffer: () => 22050,
    comprimento(buffer) {
      return (buffer as { length: number }).length;
    },
    tocar(buffer, opcoes) {
      reg.tocadas.push({ id: String((buffer as { id: number }).id), opcoes });
      return {
        parar: () => {
          reg.paradas++;
        },
      } as VozDeAudio;
    },
    definirMestre(g) {
      reg.mestres.push(g);
    },
    barramentoDaTrilha: () => ({}),
    agora: () => 0,
    rampaGanho: () => undefined,
    estado: () => reg.estadoAtual,
    async retomar() {
      reg.retomadas++;
      reg.estadoAtual = 'ativo';
    },
  };
  return { motor, reg };
}

/** Bytes de tamanho distinto por id (o motor falso identifica o buffer pelo tamanho). */
function entrada(): EntradaDeAudio {
  const bytes: Record<string, ArrayBuffer> = {};
  const ids = [config.musica.id, ...Object.values(config.eventos).map((e) => e.id)] as string[];
  ids.forEach((id, i) => {
    bytes[id] = new ArrayBuffer(id === config.musica.id ? 1 : 10 + i);
  });
  return { config, laco, bytes };
}

describe('Som: liberação, decode e fila (ADR-008 2.2 e 2.3)', () => {
  it('sem gesto, nada toca (AU1)', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.tocar('S01', 'exploracao');
    expect(reg.tocadas).toHaveLength(0);
    expect(som.estado().liberado).toBe(false);
  });

  it('a música entra em fila e toca quando a decodificação termina e há gesto', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    som.gesto('click');
    expect(reg.tocadas).toHaveLength(0);
    await som.decodificarTudo();
    expect(reg.tocadas).toHaveLength(1);
    expect(reg.tocadas[0].opcoes.loop).toBe(true);
    expect(som.estado().musica).toBe('tocando');
  });

  it('a música começa no gesto quando o decode já terminou', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('pointerdown');
    expect(reg.tocadas.map((t) => t.opcoes.loop)).toEqual([true]);
  });

  it('o laço da música usa o intervalo do ADR-008 1.4', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    expect(reg.tocadas[0].opcoes).toMatchObject({ inicio: 1105, fim: 794905 });
  });

  it('efeito antes do decode é descartado, não enfileirado', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    som.gesto('click');
    som.tocar('S01', 'exploracao');
    await som.decodificarTudo();
    expect(reg.tocadas.filter((t) => t.opcoes.loop === false)).toHaveLength(0);
  });

  it('libera uma vez e chama retomar quando o motor não está ativo', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    reg.estadoAtual = 'interrompido';
    som.gesto('click');
    await Promise.resolve();
    expect(reg.retomadas).toBeGreaterThan(0);
  });
});

describe('Som: efeitos, política e limite (AU5 e AU7)', () => {
  it('um efeito permitido toca com o ganho da config', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    reg.tocadas.length = 0;
    som.tocar('S07', 'exploracao');
    expect(reg.tocadas).toHaveLength(1);
    expect(reg.tocadas[0].opcoes.ganho).toBeCloseTo(1, 3);
  });

  it('na condução só passa S01', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    reg.tocadas.length = 0;
    som.tocar('S07', 'conducao');
    som.tocar('S01', 'conducao');
    expect(reg.tocadas).toHaveLength(1);
  });

  it('o quarto efeito para o mais antigo (AU5)', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    reg.tocadas.length = 0;
    reg.paradas = 0;
    for (const e of ['S01', 'S02', 'S03', 'S04'] as const) som.tocar(e, 'exploracao');
    expect(reg.tocadas).toHaveLength(4);
    expect(reg.paradas).toBe(1);
    expect(som.estado().vozes).toBe(3);
  });
});

describe('Som: mudo (ADR-008 3 e R6)', () => {
  it('mudo põe o mestre em 0 e não para a música', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    const tocadasAntes = reg.tocadas.length;
    som.alternarMudo('exploracao');
    expect(reg.mestres.at(-1)).toBe(0);
    expect(reg.paradas).toBe(0);
    expect(reg.tocadas.length).toBe(tocadasAntes);
    expect(som.estaMudo).toBe(true);
  });

  it('desmudo volta o mestre ao valor da config e toca S12 (R6), sem reiniciar a música', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    som.alternarMudo('exploracao');
    const tocadasNoMudo = reg.tocadas.length;
    som.alternarMudo('exploracao');
    expect(reg.mestres.at(-1)).toBe(config.mestre);
    expect(reg.tocadas.length).toBe(tocadasNoMudo + 1);
    expect(som.estado().ultimosEventos.at(-1)?.evento).toBe('S12');
  });

  it('com mudo ligado, efeito não toca', async () => {
    const { motor, reg } = motorFalso();
    const som = new Som(motor, entrada());
    await som.decodificarTudo();
    som.gesto('click');
    som.alternarMudo('exploracao');
    reg.tocadas.length = 0;
    som.tocar('S07', 'exploracao');
    expect(reg.tocadas).toHaveLength(0);
  });

  it('avisa os ouvintes (ícone e pausa) em cada troca', async () => {
    const { motor } = motorFalso();
    const som = new Som(motor, entrada());
    const vistos: boolean[] = [];
    som.aoMudar((m) => vistos.push(m));
    await som.decodificarTudo();
    som.gesto('click');
    som.alternarMudo('exploracao');
    som.alternarMudo('exploracao');
    expect(vistos).toEqual([true, false]);
  });
});
