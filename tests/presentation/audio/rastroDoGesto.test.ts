import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Som, type EntradaDeAudio } from '../../../src/presentation/audio/Som';
import type { EstadoDoMotor, MotorDeAudio, VozDeAudio } from '../../../src/presentation/audio/motorDeAudio';

/** Diagnóstico do PT5 (iPhone): a música recomeça quando o contexto fica ativo; descartes e erros não somem em silêncio. */
const config = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'content', 'audio.json'), 'utf-8'));
const laco = { atrasoInicial: 1105, preenchimentoFinal: 551, amostrasNoArquivo: 795456, amostras: 793800, taxaHz: 22050 };
const ids: string[] = [
  config.musica.id,
  ...Object.values(config.eventos as Record<string, { id?: string }>).map((e) => e.id).filter((id): id is string => !!id),
  ...Object.values(config.conquistas as Record<string, { id: string }>).map((c) => c.id),
  config.creditos.id,
];
const entrada = (): EntradaDeAudio => ({ config, laco, bytes: Object.fromEntries(ids.map((id, i) => [id, new ArrayBuffer(10 + i)])) });

function motor(opcoes: { retomarFalha?: boolean } = {}) {
  const reg = { tocadas: [] as { loop: boolean }[], paradas: 0, retomadas: 0 };
  let estado: EstadoDoMotor = 'suspenso';
  const m: MotorDeAudio = {
    iniciar: () => undefined,
    async decodificar(bytes) {
      return { length: 795456, sampleRate: 22050, id: bytes.byteLength };
    },
    comprimento: (b) => (b as { length: number }).length,
    taxaDoBuffer: () => 22050,
    tocar(_b, o): VozDeAudio {
      reg.tocadas.push({ loop: o.loop });
      return { parar: () => void reg.paradas++, fimEm: Infinity, pararEm: () => void reg.paradas++ };
    },
    definirMestre: () => undefined,
    barramentoDaTrilha: () => ({}),
    agora: () => 0,
    rampaGanho: () => undefined,
    estado: () => estado,
    async retomar() {
      reg.retomadas++;
      if (opcoes.retomarFalha) throw new Error('NotAllowedError: resume recusado');
      estado = 'ativo';
    },
  };
  return { m, reg, ativar: () => (estado = 'ativo') };
}

describe('música recomeça quando o contexto fica ativo (iOS: começou suspensa)', () => {
  it('se a música começou suspensa e o resume deu certo, é refeita uma vez', async () => {
    const { m, reg } = motor();
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.gesto('pointerdown');
    await new Promise((r) => setTimeout(r, 0));
    expect(reg.tocadas.filter((t) => t.loop).length).toBe(2);
    expect(reg.paradas).toBe(1);
    expect(som.estado().musicaComContextoAtivo).toBe(true); // recomeçada já com o contexto ativo
  });

  it('se o contexto já estava ativo ao começar, não há recomeço', async () => {
    const { m, reg, ativar } = motor();
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    ativar();
    som.gesto('click');
    await new Promise((r) => setTimeout(r, 0));
    expect(reg.tocadas.filter((t) => t.loop).length).toBe(1);
    expect(reg.paradas).toBe(0);
  });
});

describe('nada some em silêncio (diagnóstico)', () => {
  it('efeitos descartados são contados por motivo', async () => {
    const { m } = motor();
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.tocar('S05', 'exploracao');
    expect(som.estado().descartados.semLiberacao).toBe(1);
    som.gesto('click');
    som.alternarMudo('exploracao');
    som.tocar('S05', 'exploracao');
    expect(som.estado().descartados.mudo).toBeGreaterThanOrEqual(1);
    som.alternarMudo('exploracao');
    som.tocar('S05', 'conducao');
    expect(som.estado().descartados.politica).toBe(1);
  });

  it('um resume recusado fica registrado em errosDeExecucao (não é engolido)', async () => {
    const { m } = motor({ retomarFalha: true });
    const som = new Som(m, entrada());
    await som.decodificarTudo();
    som.gesto('pointerdown');
    await new Promise((r) => setTimeout(r, 0));
    expect(som.estado().errosDeExecucao.join(' ')).toMatch(/NotAllowedError/);
  });
});
