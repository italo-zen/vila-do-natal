/**
 * Ponte entre as cenas e o `Som` (ADR-008 1.7 e 5). A cena declara a tela do som (`definirTelaDoSom`) e as telas tocam
 * `tocarSom(cena, evento)`. O `Som` fica no registro do Phaser, como os serviços. Sem som montado (testes), nada acontece.
 */
import type Phaser from 'phaser';
import type { EventoDeAudio } from '../../application/audio/eventosDeAudio';
import type { Som } from './Som';
import type { TelaDoSom } from './politicaDeSom';

export function somDaCena(cena: Phaser.Scene): Som | null {
  return (cena.registry.get('som') as Som | undefined) ?? null;
}

/** Tela do som atual da cena (a política de ADR-008 R8 usa). Padrão: exploração. */
export function telaDoSomDaCena(cena: Phaser.Scene): TelaDoSom {
  return (cena.registry.get('telaDoSom') as TelaDoSom | undefined) ?? 'exploracao';
}

export function definirTelaDoSom(cena: Phaser.Scene, tela: TelaDoSom): void {
  if (cena.registry.get('telaDoSom') !== tela) cena.registry.set('telaDoSom', tela);
}

export function tocarSom(cena: Phaser.Scene, evento: EventoDeAudio): void {
  somDaCena(cena)?.tocar(evento, telaDoSomDaCena(cena));
}

/** Conquista: toca o jingle da chave da missão (ADR-008 5.1). Só a tela de conquista chama. */
export function tocarConquistaDaCena(cena: Phaser.Scene, chave: string): void {
  somDaCena(cena)?.tocarConquista(chave, telaDoSomDaCena(cena));
}

/** Continuar (com S12 depois do corte) ou X e B (sem S12), ADR-008 5.2. */
export function pararConquistaDaCena(cena: Phaser.Scene, saida: 'continuar' | 'saida'): void {
  somDaCena(cena)?.pararConquista(telaDoSomDaCena(cena), saida);
}

/** Créditos: o jingle JC uma vez, depois do fade (ADR-008 5.2). */
export function tocarCreditosDaCena(cena: Phaser.Scene): void {
  somDaCena(cena)?.tocarCreditos();
}

export function pararCreditosDaCena(cena: Phaser.Scene): void {
  somDaCena(cena)?.pararCreditos();
}
