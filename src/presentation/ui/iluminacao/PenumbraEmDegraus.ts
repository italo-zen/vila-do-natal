import type Phaser from 'phaser';
import type { PerfilDeArte } from '../../../application/arte/PerfilDeArte';
import { numeroDaCor, telaDe } from '../tema';
import { faixasEscuras } from './penumbra';
import type { EstadoDaLuz, Iluminacao } from './Iluminacao';

/** Profundidade da luz: acima dos sprites e do mapa, abaixo da interface (diálogo 1000, barra 900). */
const PROFUNDIDADE = 800;

/**
 * Penumbra em degraus de pixel (GDD 14.5): escuro com um círculo de luz ao redor do personagem.
 * Raio, degraus, alfa e cor vêm do perfil (`luz` e `tema`). Implementação atual (ADR-003 seção 7).
 */
export class PenumbraEmDegraus implements Iluminacao {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly largura: number;
  private readonly altura: number;
  private readonly raio: number;
  private readonly passo: number;
  private readonly alfaBase: number;
  private readonly cor: number;
  private readonly tons: number;

  constructor(cena: Phaser.Scene, perfil: PerfilDeArte) {
    this.g = cena.add.graphics().setScrollFactor(0).setDepth(PROFUNDIDADE);
    const { largura, altura } = telaDe(perfil);
    this.largura = largura;
    this.altura = altura;
    this.raio = perfil.luz.raioEmTiles * perfil.tile;
    this.passo = perfil.luz.passoDegrau;
    this.alfaBase = perfil.luz.alfa;
    this.cor = numeroDaCor(perfil.tema.fundo);
    this.tons = perfil.luz.tons ?? 1;
  }

  atualizar(luz: EstadoDaLuz): void {
    const g = this.g;
    g.clear();
    const alfa = (luz.cenaEscura ? this.alfaBase : 0) * luz.intensidade;
    if (alfa <= 0) return;
    // Com 1 tom, uma camada só (v1). Com N tons, N círculos com raios de passo em passo: a borda fica
    // em N níveis de alfa e o centro da penumbra, no alfa do perfil (ADR-003 seção 7).
    for (let k = 0; k < this.tons; k++) {
      g.fillStyle(this.cor, this.alfaCamada(alfa));
      for (const f of faixasEscuras(luz.x, luz.y, this.raio + k * this.passo, this.largura, this.altura, this.passo)) {
        g.fillRect(f.x, f.y, f.w, f.h);
      }
    }
  }

  /** Alfa de cada camada, para que N camadas sobrepostas dêem o alfa do perfil no centro escuro. */
  private alfaCamada(alfaTotal: number): number {
    if (this.tons === 1) return alfaTotal;
    return 1 - Math.pow(1 - alfaTotal, 1 / this.tons);
  }

  destruir(): void {
    this.g.destroy();
  }
}
