import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Som, type EntradaDeAudio } from '../../../src/presentation/audio/Som';
import type { EstadoDoMotor, MotorDeAudio, NoDeAudio, OpcoesDeToque, VozDeAudio } from '../../../src/presentation/audio/motorDeAudio';

/** ADR-009 4.3 (release): áudio chega depois; efeito e jingle que chegam tarde são descartados; a música pedida antes toca
 * quando chega, depois do gesto. Motor falso, como em som.test.ts. */
const config: EntradaDeAudio['config'] = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'content', 'audio.json'), 'utf-8'));
const laco = { atrasoInicial: 1105, preenchimentoFinal: 551, amostrasNoArquivo: 795456, amostras: 793800 };

function motor() {
  const reg = { tocadas: [] as { id: string; opcoes: OpcoesDeToque }[], mestres: 0 };
  let estado: EstadoDoMotor = 'suspenso';
  const m: MotorDeAudio = {
    iniciar() {
      estado = 'ativo';
    },
    async decodificar(bytes) {
      return { id: `b${bytes.byteLength}`, length: 4000, sampleRate: 22050 };
    },
    comprimento: (b) => (b as { length: number }).length,
    taxaDoBuffer: () => 22050,
    tocar(buffer, opcoes): VozDeAudio {
      reg.tocadas.push({ id: (buffer as { id: string }).id, opcoes });
      return { fimEm: Infinity, parar: () => undefined, pararEm: () => undefined } as VozDeAudio;
    },
    definirMestre: () => void reg.mestres++,
    barramentoDaTrilha: () => ({}) as NoDeAudio,
    agora: () => 0,
    rampaGanho: () => undefined,
    estado: () => estado,
    async retomar() {
      estado = 'ativo';
    },
  };
  return { m, reg };
}

const bytesDe = (n: number) => new ArrayBuffer(n);
const entradaExterna = (): EntradaDeAudio => ({ config, laco, bytes: {}, externo: true });
/** Bytes de cada arquivo chegando depois; tamanho distinto por id (o motor falso decodifica pelo tamanho). */
const idsDoJogo = [config.musica.id, ...Object.values(config.eventos).map((e) => e.id).filter((x): x is string => !!x), ...Object.values(config.conquistas ?? {}).map((c) => c.id), config.creditos!.id];

describe('release: arquivos que chegam depois (ADR-009 4.3)', () => {
  it('na release, arquivo ausente no boot não é erro', async () => {
    const { m } = motor();
    const som = new Som(m, entradaExterna());
    await som.decodificarTudo();
    expect(som.estado().erros).toEqual([]);
    expect(som.estado().decodificados).toBe(0);
  });

  it('efeito pedido antes de chegar é descartado (não toca atrasado)', async () => {
    const { m, reg } = motor();
    const som = new Som(m, entradaExterna());
    await som.decodificarTudo();
    som.gesto('click');
    som.tocar('S01', 'exploracao');
    expect(reg.tocadas.filter((t) => t.id !== undefined && !t.opcoes.loop)).toHaveLength(0);
    expect(som.estado().descartados.semBuffer).toBe(1);
  });

  it('jingle pedido antes de chegar é descartado; depois de chegar, o próximo pedido toca', async () => {
    const { m, reg } = motor();
    const som = new Som(m, entradaExterna());
    await som.decodificarTudo();
    som.gesto('click');
    som.tocarConquista('conquista.luzes', 'conquista');
    expect(reg.tocadas.filter((t) => !t.opcoes.loop)).toHaveLength(0);
    await som.receberArquivo('jin_j01_luzes', bytesDe(11));
    som.tocarConquista('conquista.luzes', 'conquista');
    expect(reg.tocadas.filter((t) => !t.opcoes.loop)).toHaveLength(1);
  });

  it('música pedida antes de chegar toca quando chega, depois do gesto', async () => {
    const { m, reg } = motor();
    const som = new Som(m, entradaExterna());
    await som.decodificarTudo();
    som.gesto('click');
    expect(reg.tocadas).toHaveLength(0);
    await som.receberArquivo(config.musica.id, bytesDe(1));
    expect(reg.tocadas.map((t) => t.opcoes.loop)).toEqual([true]);
    expect(som.estado().musica).toBe('tocando');
  });

  it('música que chega antes do gesto toca no gesto', async () => {
    const { m, reg } = motor();
    const som = new Som(m, entradaExterna());
    await som.decodificarTudo();
    await som.receberArquivo(config.musica.id, bytesDe(1));
    expect(reg.tocadas).toHaveLength(0);
    som.gesto('click');
    expect(reg.tocadas.map((t) => t.opcoes.loop)).toEqual([true]);
  });

  it('falha de decodificação de um arquivo fica registrada e não derruba os outros', async () => {
    const { m } = motor();
    m.decodificar = async (bytes) => {
      if (bytes.byteLength === 13) throw new Error('MP3 ruim');
      return { id: `b${bytes.byteLength}`, length: 4000, sampleRate: 22050 };
    };
    const som = new Som(m, entradaExterna());
    await som.receberArquivo('sfx_s01_passo', bytesDe(13));
    await som.receberArquivo('sfx_s02_porta', bytesDe(14));
    expect(som.estado().erros.join(' ')).toMatch(/sfx_s01_passo|MP3 ruim/);
    expect(som.estado().decodificados).toBe(1);
  });

  it('a lista de ids da release cobre a trilha, 12 efeitos, 5 jingles e o JC (19)', () => {
    expect(idsDoJogo).toHaveLength(19);
  });
});
