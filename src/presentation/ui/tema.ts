import Phaser from 'phaser';
import type { PerfilDeArte } from '../../application/arte/PerfilDeArte';
import type { ArteDoPerfil } from '../../application/arte/ArteDoPerfil';
import type { Servicos } from '../../application/Servicos';

/**
 * Acesso ao perfil de arte e à arte da build (ADR-003 seção 2). Os dois chegam pelo registro do Phaser,
 * montados no composition root (main.ts). A apresentação não tem número de arte: lê daqui.
 */
export function perfilDe(cena: Phaser.Scene): PerfilDeArte {
  return cena.registry.get('perfil') as PerfilDeArte;
}

export function arteDe(cena: Phaser.Scene): ArteDoPerfil {
  return cena.registry.get('arte') as ArteDoPerfil;
}

/** Serviços montados pelo composition root. A cena não cria dependências. */
export function servicosDe(cena: Phaser.Scene): Servicos {
  return cena.registry.get('servicos') as Servicos;
}

/** Tamanho da tela em px: um cômodo inteiro (sala × tile), que é a câmera fixa (GDD 14.2). */
export function telaDe(p: PerfilDeArte): { largura: number; altura: number } {
  return { largura: p.sala.colunas * p.tile, altura: p.sala.linhas * p.tile };
}

/** Estilo de texto Phaser com a fonte e o tamanho do perfil (corpo ou título). */
export function estilo(p: PerfilDeArte, tamanho: number, cor: string = p.tema.texto, extra: Phaser.Types.GameObjects.Text.TextStyle = {}) {
  return { fontFamily: `"${p.fonte.familia}"`, fontSize: `${tamanho}px`, color: cor, ...extra };
}

/** Cor "#rrggbb" do perfil para os desenhos do Phaser (número 0xrrggbb). */
export function numeroDaCor(hex: string): number {
  return parseInt(hex.slice(1), 16);
}
