/**
 * Imagens de tela do título e da tela de fim (GDD 20.3 e 20.4; ADR-009 4.2). A cena desenha o fundo sólido e os textos, e
 * chama `carregarImagemDeTela`: a imagem entra quando os bytes chegam (embutidos no playtest, baixados na release). O
 * Phaser recebe um URL de blob com os bytes e usa o NEAREST do jogo (pixel nítido). Nada bloqueia a cena.
 */
import Phaser from 'phaser';
import type { Recursos } from './recursos';

export type ChaveDeImagemDeTela = 'titulo' | 'fim';

/** Nome da textura no Phaser, por chave de tela. */
export const TEXTURA_DE_TELA: Record<ChaveDeImagemDeTela, string> = { titulo: 'tela_titulo', fim: 'tela_fim' };

/**
 * Carrega a imagem de tela sem bloquear: `aoChegar` roda quando a textura está pronta. Se a imagem não chegar (falha),
 * nada roda e a cena segue com o fundo sólido e os textos (ADR-009 4.4). A cena que saiu antes da chegada é ignorada.
 */
export function carregarImagemDeTela(cena: Phaser.Scene, chave: ChaveDeImagemDeTela, aoChegar: () => void): void {
  const recursos = cena.registry.get('recursos') as Recursos | undefined;
  if (!recursos) return;
  const nome = TEXTURA_DE_TELA[chave];
  const pronta = () => {
    cena.textures.get(nome).setFilter(Phaser.Textures.FilterMode.NEAREST);
    aoChegar();
  };
  recursos.aoChegar(chave, (bytes) => {
    if (!cena.sys.isActive()) return;
    if (cena.textures.exists(nome)) {
      pronta();
      return;
    }
    const url = URL.createObjectURL(new Blob([bytes], { type: 'image/png' }));
    cena.load.image(nome, url);
    cena.load.once(Phaser.Loader.Events.COMPLETE, () => {
      URL.revokeObjectURL(url);
      if (cena.textures.exists(nome)) pronta();
    });
    if (!cena.load.isLoading()) cena.load.start();
  });
}
