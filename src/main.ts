// Composition root (ADR-001): aqui se monta a fonte de conteúdo, o perfil de arte, os serviços e o jogo.
import '@fontsource/press-start-2p/400.css';
import { montarServicos } from './application/Servicos';
import { CarregarConteudo } from './application/usecases/CarregarConteudo';
import { validarSprites } from './application/arte/SpritesDoPerfil';
import { criarFonteDoVite } from './infrastructure/content/ViteContentSource';
import { arquivosDoPerfilAtivo } from './infrastructure/arte/arquivosDoPerfilAtivo';
import { criarJogo } from './presentation/jogo';

/** Espera máxima pela fonte pixel antes de abrir o jogo (ms). */
const ESPERA_DA_FONTE_MS = 3000;

async function iniciar(): Promise<void> {
  const pai = document.getElementById('jogo')!;
  try {
    const conteudo = await new CarregarConteudo(criarFonteDoVite()).executar();
    const perfil = conteudo.perfil;
    const arquivos = arquivosDoPerfilAtivo();
    const sprites = validarSprites(arquivos.sprites, perfil);
    if (!sprites.ok) throw new Error(`Arte do perfil "${perfil.id}" inválida:\n- ${sprites.erros.join('\n- ')}`);
    // A fonte pixel do perfil precisa estar pronta antes de qualquer texto do Phaser (com limite de espera).
    const fonte = `${perfil.fonte.corpo}px "${perfil.fonte.familia}"`;
    await Promise.race([document.fonts.load(fonte), new Promise((r) => setTimeout(r, ESPERA_DA_FONTE_MS))]);
    const jogo = criarJogo(montarServicos(conteudo, __APP_VERSION__), { sprites: sprites.sprites, urls: arquivos.urls }, pai);
    // Gancho de QA: só no build de QA (flag __QA__ é false nos outros, e o código some do bundle).
    if (__QA__) {
      const { instalarGancho } = await import('./presentation/qa/ganchoQa');
      instalarGancho(jogo);
    }
  } catch (erro) {
    console.error(erro);
    pai.innerHTML = '';
    const aviso = document.createElement('div');
    aviso.id = 'erro';
    aviso.textContent = 'Não foi possível carregar o jogo. Atualize a página.';
    pai.appendChild(aviso);
  }
}

void iniciar();
