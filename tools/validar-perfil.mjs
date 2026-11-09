// Valida um perfil de arte (ADR-003 seção 11): `npm run validar:perfil -- <id>` ou `-- <caminho.json>`.
// Usa as mesmas regras do motor (src/application/arte, carregadas pelo Vite em modo SSR) e confere os arquivos:
//  - schema do perfil e do sprites.json (inclui: folhas do Sobrinho com o quadro de corpos.sobrinho.quadro);
//  - cada PNG existe; dimensões batem com o sprites.json (tileset, folhas) e, para idle/interact/celebrate
//    do Sobrinho, com corpos.sobrinho.quadro;
//  - cada PNG tem no máximo `paleta.maximoDeCores` cores; o conjunto do perfil tem pelo menos `paleta.minimoDeCores`;
//  - cada sprite de sobrinho (spr_<id>_*) tem pelo menos `sprites.sobrinho.coresMin` cores;
//  - o tile de cada subárea do manifesto (e de --mapa) bate com o tile do perfil, e a caixa cabe na tela (sala).
// Saída: código 1 se houver erro (mensagem em português, sem stack trace); 2 se faltar argumento.
import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';
import { coresDistintas, decodificarPng, dimensoesDoPng } from './png.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');

/** Lê um JSON; se estiver malformado ou faltar, encerra com mensagem clara (exit 1), sem stack trace. */
function lerJson(caminho, rotulo) {
  if (!existsSync(caminho)) sair(`${rotulo} não encontrado: ${caminho}`);
  try {
    return JSON.parse(readFileSync(caminho, 'utf-8'));
  } catch (erro) {
    sair(`${rotulo} com JSON malformado em ${caminho}: ${String(erro.message).split('\n')[0]}`);
  }
}

function sair(mensagem, codigo = 1) {
  console.error(`Perfil inválido: ${mensagem}`);
  process.exit(codigo);
}

const args = process.argv.slice(2).filter((a) => a !== '--');
const mapasExtras = [];
const alvo = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--mapa') mapasExtras.push(resolve(args[++i]));
  else alvo.push(args[i]);
}
if (alvo.length === 0) {
  console.error('Uso: npm run validar:perfil -- <id-do-perfil | caminho/perfil.json> [--mapa caminho/mapa.json]');
  process.exit(2);
}
const manifesto = lerJson(join(RAIZ, 'content', 'manifest.json'), 'manifest.json');
const alvoEhArquivo = alvo[0].endsWith('.json');
const caminhoPerfil = alvoEhArquivo ? resolve(alvo[0]) : join(RAIZ, 'content', 'art-profiles', `${alvo[0]}.json`);
const idEsperado = alvoEhArquivo ? basename(caminhoPerfil, '.json') : alvo[0];
const brutoPerfil = lerJson(caminhoPerfil, 'Perfil');

const erros = [];
const avisos = [];
const server = await createServer({ configFile: false, root: RAIZ, logLevel: 'silent', appType: 'custom', server: { middlewareMode: true, hmr: false } });
const motor = {
  perfil: await server.ssrLoadModule('/src/application/arte/validarPerfilDeArte.ts'),
  sprites: await server.ssrLoadModule('/src/application/arte/SpritesDoPerfil.ts'),
};

const resultado = motor.perfil.validarPerfilDeArte(brutoPerfil, idEsperado);
if (!resultado.ok) {
  await server.close();
  sair(`"${idEsperado}" inválido:\n- ${resultado.erros.join('\n- ')}`);
}
const perfil = resultado.perfil;
const pasta = join(RAIZ, perfil.pasta);
const arquivoSprites = join(pasta, 'sprites.json');
const corpo = perfil.corpos.sobrinho.quadro;
const ehSobrinhoParado = (nome) => /^spr_(lolo|bibi|dandan|tutu)_(idle|interact|celebrate)\.png$/.test(nome);

if (!existsSync(arquivoSprites)) erros.push(`sprites.json ausente em ${perfil.pasta}.`);
else {
  const sp = motor.sprites.validarSprites(lerJson(arquivoSprites, 'sprites.json'), perfil);
  if (!sp.ok) erros.push(...sp.erros);
  else {
    const todos = new Set();
    const contagens = {};
    for (const img of sp.sprites.imagens) {
      const arquivo = join(pasta, img.arquivo);
      if (!existsSync(arquivo)) {
        erros.push(`${img.arquivo}: listado no sprites.json, mas não existe em ${perfil.pasta}.`);
        continue;
      }
      const { w, h } = dimensoesDoPng(readFileSync(arquivo));
      if (img.tipo === 'tileset' && (w % img.quadro.w !== 0 || h % img.quadro.h !== 0)) {
        erros.push(`${img.arquivo}: ${w}×${h} px não é múltiplo do quadro ${img.quadro.w}×${img.quadro.h}.`);
      }
      if (img.tipo === 'folhas' && (w !== img.quadro.w * img.quadros || h !== img.quadro.h)) {
        erros.push(`${img.arquivo}: ${w}×${h} px, esperado ${img.quadro.w * img.quadros}×${img.quadro.h} (${img.quadros} quadros de ${img.quadro.w}×${img.quadro.h}).`);
      }
      if (ehSobrinhoParado(img.arquivo) && (w !== corpo.w || h !== corpo.h)) {
        erros.push(`${img.arquivo}: ${w}×${h} px, mas corpos.sobrinho.quadro do perfil é ${corpo.w}×${corpo.h}.`);
      }
      const cores = coresDistintas(decodificarPng(readFileSync(arquivo)).rgba);
      contagens[img.arquivo] = cores.size;
      for (const c of cores) todos.add(c);
      if (cores.size > perfil.paleta.maximoDeCores) {
        erros.push(`${img.arquivo}: ${cores.size} cores; o máximo do perfil é ${perfil.paleta.maximoDeCores}.`);
      }
    }
    erros.push(...motor.sprites.validarCoresDosPersonagens(contagens, perfil));
    if (todos.size < perfil.paleta.minimoDeCores) {
      erros.push(`o conjunto de PNG do perfil tem ${todos.size} cores; o mínimo do perfil é ${perfil.paleta.minimoDeCores}.`);
    }
    avisos.push(`${sp.sprites.imagens.length} imagens, ${todos.size} cores no conjunto do perfil`);
  }
}

// Subáreas: as do manifesto (quando o perfil é o da build) e as passadas em --mapa. Formato do conversor
// (docs/conversor-tmx.md, seção 4.2): tile igual ao do perfil e caixa dentro da tela (sala).
const mapas = [...(manifesto.artProfile ?? 'gba-240x160') === idEsperado ? manifesto.maps.map((m) => join(RAIZ, 'content', m.file)) : [], ...mapasExtras];
for (const caminho of mapas) {
  const sub = lerJson(caminho, 'Subárea');
  const nome = caminho.replace(RAIZ + '/', '');
  if (sub.tile !== perfil.tile) erros.push(`${nome}: tile ${sub.tile} diferente do tile do perfil (${perfil.tile}).`);
  if (sub.largura > perfil.sala.colunas || sub.altura > perfil.sala.linhas) {
    erros.push(`${nome}: caixa ${sub.largura}×${sub.altura} maior que a tela ${perfil.sala.colunas}×${perfil.sala.linhas}.`);
  }
  avisos.push(`subárea ${nome}: tile ${sub.tile} px, caixa ${sub.largura}×${sub.altura} conferida`);
}

await server.close();
console.log(`Perfil "${perfil.id}" (${perfil.nome}), tile ${perfil.tile} px, sala ${perfil.sala.colunas}×${perfil.sala.linhas} tiles.`);
for (const a of avisos) console.log(`  · ${a}`);
if (erros.length > 0) {
  console.error(`Erros (${erros.length}):\n- ${erros.join('\n- ')}`);
  process.exit(1);
}
console.log('Perfil válido.');
