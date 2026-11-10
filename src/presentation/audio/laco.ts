/**
 * Laço da música (ADR-008 1.4). O encoder põe um atraso no início e um preenchimento no fim (metadados do LAME). Se o
 * navegador apara esse atraso, o buffer tem a faixa; se não, tem o arquivo inteiro. Função pura.
 *
 * A decisão é em SEGUNDOS, não em amostras: o buffer decodificado pode ter outra taxa (o contexto offline do boot usa
 * 44.100 Hz; o arquivo é 22.050 Hz). Comparar contagens de amostras de taxas diferentes encurtava o laço para 18 s.
 */
export interface InfoDoLaco {
  /** Amostras de atraso do encoder no início (LAME), na taxa do arquivo. */
  atrasoInicial: number;
  /** Amostras de preenchimento no fim (LAME), na taxa do arquivo. */
  preenchimentoFinal: number;
  /** Amostras do arquivo decodificado sem aparar (total), na taxa do arquivo. */
  amostrasNoArquivo: number;
  /** Amostras úteis da faixa (sem o atraso nem o preenchimento), na taxa do arquivo. */
  amostras: number;
  /** Taxa do arquivo em Hz (22.050 no projeto). */
  taxaHz?: number;
}

/**
 * Início e fim do laço, em amostras do BUFFER (taxa `taxaDoBuffer`), para o buffer decodificado com `comprimento` amostras.
 */
export function intervaloDoLaco(comprimento: number, taxaDoBuffer: number, info: InfoDoLaco): { inicio: number; fim: number } {
  const taxaArquivo = info.taxaHz ?? 22050;
  const duracaoArquivo = info.amostrasNoArquivo / taxaArquivo;
  const duracaoFaixa = info.amostras / taxaArquivo;
  const duracaoBuffer = comprimento / taxaDoBuffer;
  // Mais perto do arquivo inteiro que da faixa: o navegador não aparou o atraso, o laço é o miolo do arquivo.
  if (Math.abs(duracaoBuffer - duracaoArquivo) <= Math.abs(duracaoBuffer - duracaoFaixa)) {
    const ini = (info.atrasoInicial / taxaArquivo) * taxaDoBuffer;
    const fim = ((info.amostrasNoArquivo - info.preenchimentoFinal) / taxaArquivo) * taxaDoBuffer;
    return { inicio: Math.round(ini), fim: Math.min(comprimento, Math.round(fim)) };
  }
  // O navegador aparou: o laço é a faixa inteira.
  return { inicio: 0, fim: Math.min(comprimento, Math.round((info.amostras / taxaArquivo) * taxaDoBuffer)) };
}
