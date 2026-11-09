import type Phaser from 'phaser';
import type { PerfilDeArte } from '../../../application/arte/PerfilDeArte';
import { PenumbraEmDegraus } from './PenumbraEmDegraus';

/** Estado que a cena passa à luz a cada quadro. Vem do jogo: a interface decide como desenhar (ADR-003 seção 7). */
export interface EstadoDaLuz {
  /** Centro do personagem, em px da tela (câmera do cômodo já descontada). */
  x: number;
  y: number;
  /** O cômodo atual é escuro. */
  cenaEscura: boolean;
  /** 1 = escuro total, 0 = luzes acesas (animado no fade). */
  intensidade: number;
}

/** Interface de iluminação atrás da interface do jogo (ADR-003 seção 7). Trocável pelo `luz.tipo` do perfil. */
export interface Iluminacao {
  atualizar(luz: EstadoDaLuz): void;
  destruir(): void;
}

/** Escolhe a implementação pelo `luz.tipo` do perfil. Tipo desconhecido é erro, nunca luz silenciosa. */
export function criarIluminacao(cena: Phaser.Scene, perfil: PerfilDeArte): Iluminacao {
  switch (perfil.luz.tipo) {
    case 'penumbra-degraus':
      return new PenumbraEmDegraus(cena, perfil);
    default:
      throw new Error(`Tipo de luz "${String((perfil.luz as { tipo: string }).tipo)}" não tem implementação.`);
  }
}
