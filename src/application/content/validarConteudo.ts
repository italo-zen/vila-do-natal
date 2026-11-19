import type { Manifest } from './Manifest';
import type { MapaDoJogo, ObjetoDoMapa } from './Mapa';
import type { Textos } from './Textos';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import { ehFase, proximaFase, type Fase } from '../../domain/progresso/Fase';
import { deslocamentoDaSubarea, ladoDaPorta } from '../mundo/subarea';
import { BIT_DO_LADO, LADOS, OPOSTO_DO_LADO, VETOR_DO_LADO, arestaAberta, paredeNoTile } from '../mundo/arestas';
import { calcularRotaDeConducao } from '../mundo/conducao';
import { FASE_DA_PECA, ordemDaFase, situacaoDaFase } from '../mundo/pecas';
import { FASE_DO_ENFEITE } from '../mundo/enfeite';
import type { MissaoCarregada } from '../mundo/missoes';
import { pontosDaCaixa, vizinhosLivresAlcancaveis, vizinhosLivresPorAresta } from './pontosDePartida';
import { validarNick } from './validarNick';

const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita'];
const TIPOS_CONHECIDOS = ['porta', 'spawn', 'interruptor', 'bilhete', 'arvore', 'examinavel', 'movel', 'peca', 'enfeite'];
/** Chaves de aviso que o Marco 2 exige, com duas páginas cada (GDD 15.8; ADR-004 seção 8, item 19). */
const AVISOS_OBRIGATORIOS = ['aviso.peca2.antes1', 'aviso.peca3.antes1', 'aviso.peca3.antes2'];

/** Largura de uma linha de texto em caracteres (GDD 17.8: até 28 por linha). */
const LARGURA_DA_LINHA = 28;
/**
 * Textos do Marco 4 (ADR-006 seção 8.5; T009): chave, número de páginas e o teto de linhas de cada página. Diálogo e
 * créditos: 2 linhas; conquista e dica: 3 linhas (GDD 17.8). O texto exato é conferido nos testes (tests/application).
 */
export const TEXTOS_DO_MARCO4: readonly { chave: string; paginas: number; linhas: number }[] = [
  { chave: 'conquista.enfeites', paginas: 1, linhas: 3 },
  { chave: 'aviso.enfeite.antes3', paginas: 2, linhas: 2 },
  { chave: 'arvore.estado.3', paginas: 2, linhas: 2 },
  { chave: 'arvore.chegada.3', paginas: 3, linhas: 2 },
  { chave: 'arvore.chegada.4', paginas: 2, linhas: 2 },
  { chave: 'dica.enfeites.dormindo', paginas: 2, linhas: 1 },
  { chave: 'dica.enfeites.acordado', paginas: 2, linhas: 1 },
  { chave: 'creditos.titulo', paginas: 1, linhas: 1 },
  { chave: 'creditos.jogo', paginas: 1, linhas: 2 },
  { chave: 'creditos.sobrinho', paginas: 1, linhas: 2 },
  { chave: 'creditos.nick', paginas: 1, linhas: 2 },
  { chave: 'creditos.agradecimento', paginas: 1, linhas: 2 },
  { chave: 'creditos.versao', paginas: 1, linhas: 1 },
  { chave: 'creditos.voltar', paginas: 1, linhas: 1 },
  { chave: 'barra.creditos', paginas: 1, linhas: 1 },
];

/** Linhas que um texto ocupa com quebra por palavras, de até `largura` caracteres por linha (aproximação de N013). */
export function linhasDe(texto: string, largura: number): number {
  let linhas = 1;
  let atual = 0;
  for (const palavra of texto.split(/\s+/).filter((p) => p.length > 0)) {
    const tamanho = palavra.length;
    if (atual === 0) atual = tamanho;
    else if (atual + 1 + tamanho <= largura) atual += 1 + tamanho;
    else {
      linhas++;
      atual = tamanho;
    }
  }
  return linhas;
}

/**
 * Spawns de entrada no escuro (ADR-004 seção 8, item 11; ADR-011 seção 5.5): lista explícita. Só eles têm a regra de 3
 * tiles do interruptor. Hoje: a entrada da Sala vinda do Hall (`hall-sala`), antes das luzes. A `cozinha-sala` pode ser
 * acrescentada aqui sem mudar o motor, se a distância passar.
 */
export const SPAWNS_DE_ENTRADA_NO_ESCURO: readonly { mapa: string; spawn: string }[] = [{ mapa: 'sala', spawn: 'hall-sala' }];

/**
 * Móvel: retângulo decorativo de tiles, em coordenadas locais da subárea (x, y, w, h). Só cobre tiles já
 * bloqueados pela colisão do conversor: não bloqueia por si, não é interativo e não conta para as regras
 * de objeto de tile nem para a linha da barra (contrato da Arte com o Desenvolvedor, marco 1).
 */
function errosDoMovel(mapa: MapaDoJogo, o: ObjetoDoMapa, rotulo: string, id: string): string[] {
  const pre = `Subárea "${id}": ${rotulo}`;
  const { x, y } = o;
  const w = o.dados.w;
  const h = o.dados.h;
  if (typeof o.dados.id !== 'string' || o.dados.id === '') return [`${pre}: móvel sem "id" (texto).`];
  if (typeof o.dados.nome !== 'string' || o.dados.nome === '') return [`${pre}: móvel sem "nome" (texto).`];
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0) return [`${pre}: x e y precisam ser inteiros ≥ 0.`];
  if (!Number.isInteger(w) || !Number.isInteger(h)) return [`${pre}: w e h precisam ser inteiros.`];
  if ((w as number) < 1 || (h as number) < 1) return [`${pre}: w e h precisam ser ≥ 1 (w=${String(w)}, h=${String(h)}).`];
  const W = w as number;
  const H = h as number;
  if (x + W > mapa.largura || y + H > mapa.altura) {
    return [`${pre}: retângulo ${W}×${H} sai da caixa da subárea (${mapa.largura}×${mapa.altura}).`];
  }
  for (let j = 0; j < H; j++) {
    for (let i = 0; i < W; i++) {
      if (!mapa.colisao[y + j][x + i]) return [`${pre}: cobre tile livre em (${x + i}, ${y + j}); móvel só cobre tiles bloqueados.`];
    }
  }
  return [];
}

export interface EntradaDeConteudo {
  manifesto: Manifest;
  /** Todas as subáreas do manifesto (validadas mesmo as fechadas, ADR-004 seção 9). */
  todos: Map<string, MapaDoJogo>;
  /** Missões do manifesto, na ordem, com as subáreas que cada uma abre (ADR-002 seção 2.2). */
  missoes: MissaoCarregada[];
  textos: Textos;
  perfil: PerfilDeArte;
}

/** Posição local de um tile livre: piso com colisão 0 (ADR-004 seção 8, item 16). */
const livreNoMapa = (m: MapaDoJogo, x: number, y: number): boolean =>
  x >= 0 && y >= 0 && x < m.largura && y < m.altura && m.chao[y][x] !== 0 && !m.colisao[y][x];

/** Item 23 a 25 (ADR-011 seção 7): formato da máscara, simetria interna e fronteira é parede. */
function errosDaMascara(m: MapaDoJogo): string[] {
  const erros: string[] = [];
  const pre = `Subárea "${m.id}"`;
  if (m.paredes.length !== m.altura || m.paredes.some((linha) => linha.length !== m.largura)) {
    return [`${pre}: paredes precisa ter o tamanho de chao (${m.largura}×${m.altura}) (item 23).`];
  }
  for (let y = 0; y < m.altura; y++) {
    for (let x = 0; x < m.largura; x++) {
      const bits = m.paredes[y][x];
      if (!Number.isInteger(bits) || bits < 0 || bits > 15) {
        erros.push(`${pre}: paredes em (${x}, ${y}) vale ${String(bits)}; precisa ser inteiro de 0 a 15 (item 23).`);
        continue;
      }
      if (m.chao[y][x] === 0) {
        if (bits !== 0) erros.push(`${pre}: paredes em (${x}, ${y}) é ${bits} num tile sem piso; precisa ser 0 (item 23).`);
        continue;
      }
      for (const lado of LADOS) {
        const v = VETOR_DO_LADO[lado];
        const nx = x + v.x;
        const ny = y + v.y;
        const ligado = (bits & BIT_DO_LADO[lado]) !== 0;
        const temPiso = nx >= 0 && ny >= 0 && nx < m.largura && ny < m.altura && m.chao[ny][nx] !== 0;
        if (!temPiso) {
          // Item 25: fronteira com o vazio é parede.
          if (!ligado) erros.push(`${pre}: lado ${lado} de (${x}, ${y}) dá para fora do piso e não tem parede (item 25).`);
        } else if (ligado !== ((m.paredes[ny][nx] & BIT_DO_LADO[OPOSTO_DO_LADO[lado]]) !== 0)) {
          // Item 24: simetria interna, reportada uma vez (pelo tile de menor índice).
          if (ny > y || (ny === y && nx > x)) erros.push(`${pre}: a aresta ${lado} de (${x}, ${y}) é assimétrica: os dois tiles precisam ter o mesmo bit (item 24).`);
        }
      }
    }
  }
  return erros;
}

/**
 * Item 28 (ADR-011 seção 7; espelha E036): todo tile livre da área é alcançável pelas arestas abertas, contando só os tiles
 * com `colisao` 0 e sem árvore. A área é conexa; senão, lista o primeiro tile isolado.
 */
function errosDeConexidade(m: MapaDoJogo): string[] {
  const arvores = new Set(m.objetos.filter((o) => o.tipo === 'arvore').map((o) => `${o.x},${o.y}`));
  const livre = (x: number, y: number) => livreNoMapa(m, x, y) && !arvores.has(`${x},${y}`);
  const todosLivres: { x: number; y: number }[] = [];
  for (let y = 0; y < m.altura; y++) for (let x = 0; x < m.largura; x++) if (livre(x, y)) todosLivres.push({ x, y });
  if (todosLivres.length === 0) return [];
  if (m.paredes.length !== m.altura || m.paredes.some((l) => l.length !== m.largura)) return [];
  const visto = new Set<string>([`${todosLivres[0].x},${todosLivres[0].y}`]);
  const fila = [todosLivres[0]];
  while (fila.length > 0) {
    const n = fila.shift()!;
    for (const lado of LADOS) {
      const v = { x: n.x + VETOR_DO_LADO[lado].x, y: n.y + VETOR_DO_LADO[lado].y };
      if (!livre(v.x, v.y) || visto.has(`${v.x},${v.y}`) || !arestaAberta(m.paredes, n.x, n.y, lado)) continue;
      visto.add(`${v.x},${v.y}`);
      fila.push(v);
    }
  }
  const isolado = todosLivres.find((t) => !visto.has(`${t.x},${t.y}`));
  return isolado ? [`Subárea "${m.id}": área não conexa pelas arestas abertas; (${isolado.x}, ${isolado.y}) fica isolado de (${todosLivres[0].x}, ${todosLivres[0].y}) (item 28).`] : [];
}

/**
 * Item 4′ e 26 (ADR-011 seção 7): a porta é válida nesta área e tem a simétrica na área de destino. Cobre as áreas fechadas.
 */
function errosDaPorta(
  mapa: MapaDoJogo,
  o: ObjetoDoMapa,
  rotulo: string,
  todos: Map<string, MapaDoJogo>,
  idsNaArea: Set<string>,
  posicoes: Set<string>,
): string[] {
  const erros: string[] = [];
  const id = mapa.id;
  const pid = String(o.dados.id);
  const destino = String(o.dados.destino);
  const lado = ladoDaPorta(o);
  if (typeof o.dados.id !== 'string' || o.dados.id === '') erros.push(`Subárea "${id}": ${rotulo} sem id.`);
  if (idsNaArea.has(pid)) erros.push(`Subárea "${id}": id de porta "${pid}" repetido (item 26).`);
  idsNaArea.add(pid);
  if (!lado) {
    erros.push(`Subárea "${id}": ${rotulo} sem lado válido (cima, baixo, esquerda ou direita; item 26).`);
  } else {
    const chave = `${o.x},${o.y},${lado}`;
    if (posicoes.has(chave)) erros.push(`Subárea "${id}": duas portas em (${o.x}, ${o.y}) com o mesmo lado "${lado}" (item 26).`);
    posicoes.add(chave);
    if (!paredeNoTile(mapa.paredes, o.x, o.y, lado)) erros.push(`Subárea "${id}": porta ${pid}: a aresta "${lado}" de (${o.x}, ${o.y}) precisa ter o bit de parede ligado (item 26; a máscara é completa).`);
    const v = VETOR_DO_LADO[lado];
    const vx = o.x + v.x;
    const vy = o.y + v.y;
    if (vx >= 0 && vy >= 0 && vx < mapa.largura && vy < mapa.altura && mapa.chao[vy][vx] !== 0) {
      erros.push(`Subárea "${id}": porta ${pid}: o vizinho do lado "${lado}" (${vx}, ${vy}) é piso da própria área; a porta fica numa fronteira (item 26).`);
    }
  }
  if (o.dados.trancadaAte !== undefined && !ehFase(String(o.dados.trancadaAte))) {
    erros.push(`Subárea "${id}": trancadaAte "${String(o.dados.trancadaAte)}" não é uma fase.`);
  }
  // 4′: simetria.
  const dest = todos.get(destino);
  if (!dest) return [...erros, `Subárea "${id}": porta ${pid} leva a "${destino}", que não existe no manifesto.`];
  const par = dest.objetos.find((x) => x.tipo === 'porta' && x.dados.id === o.dados.id);
  if (!par) return [...erros, `Porta ${pid} (${id}): não há porta de mesmo id em "${destino}" (item 4′).`];
  if (String(par.dados.destino) !== id) erros.push(`Porta ${pid}: a porta de "${destino}" não aponta de volta para "${id}" (item 4′).`);
  const ladoDoPar = ladoDaPorta(par);
  if (lado && ladoDoPar !== OPOSTO_DO_LADO[lado]) erros.push(`Porta ${pid}: o lado em "${destino}" (${String(ladoDoPar)}) deveria ser o oposto de "${lado}" (item 4′).`);
  const chegada = dest.objetos.find((x) => x.tipo === 'spawn' && x.dados.nome === o.dados.spawnDestino);
  if (!chegada) erros.push(`Porta ${pid}: spawnDestino "${String(o.dados.spawnDestino)}" não existe em "${destino}" (item 4′).`);
  else {
    if (chegada.x !== par.x || chegada.y !== par.y) erros.push(`Porta ${pid}: a chegada "${String(o.dados.spawnDestino)}" em "${destino}" (${chegada.x}, ${chegada.y}) precisa estar no tile da porta (${par.x}, ${par.y}) (item 4′).`);
    if (lado && String(chegada.dados.direcao) !== lado) erros.push(`Porta ${pid}: a chegada "${String(o.dados.spawnDestino)}" em "${destino}" olha para "${String(chegada.dados.direcao)}", deveria olhar para "${lado}" (para dentro; item 4′).`);
  }
  return erros;
}

/** Rótulo de um objeto, para mensagens de erro (como no conversor). */
function rotuloDe(o: ObjetoDoMapa): string {
  return `${o.tipo}${o.dados.id ? ` ${String(o.dados.id)}` : ''}${o.dados.nome ? ` ${String(o.dados.nome)}` : ''} em (${o.x}, ${o.y})`;
}


/**
 * Validação de conteúdo sobre o `content/` real (ADR-004 seção 8). Devolve a lista de erros (vazia = ok).
 * Cobre: referências entre subáreas e missões; pares de porta (vão, gatilho e chegada); porta fechada com saída;
 * tipo de tile de cada objeto; peças (ordem, estado, tile e avisos); última linha da tela; caixa dentro da tela;
 * inicio e conducao (rota por missão); trancadaAte; interruptor fora do círculo de luz inicial (regra 11).
 */
export function validarConteudo(e: EntradaDeConteudo): string[] {
  return analisarConteudo(e).erros;
}

/**
 * Avisos do conteúdo (não bloqueiam teste nem build). W027: gatilho de par de fórmula com mais de um vizinho livre
 * (ADR-004 seção 13.19; P7 e P8 da Sala). (A guarda de 2 linhas é erro desde a pergunta 31, ADR-005 seção 6.)
 */
export function avisosDeConteudo(e: EntradaDeConteudo): string[] {
  return analisarConteudo(e).avisos;
}

function analisarConteudo(e: EntradaDeConteudo): { erros: string[]; avisos: string[] } {
  const erros: string[] = [];
  const avisos: string[] = [];
  const { perfil, todos, missoes, textos } = e;
  const tela = perfil.sala;
  const missaoPorId = (id: string) => missoes.find((m) => m.id === id);
  const inicial = missoes.find((m) => m.requires.length === 0);

  for (const mapa of todos.values()) {
    const id = mapa.id;
    const desl = deslocamentoDaSubarea(mapa, tela);
    if (mapa.tile !== perfil.tile) erros.push(`Subárea "${id}": tile ${mapa.tile} é diferente do tile do perfil "${perfil.id}" (${perfil.tile}).`);
    erros.push(...errosDaMascara(mapa));
    erros.push(...errosDeConexidade(mapa));
    // Regra 7: caixa dentro da tela.
    if (mapa.largura > tela.colunas || mapa.altura > tela.linhas) {
      erros.push(`Subárea "${id}": caixa ${mapa.largura}×${mapa.altura} maior que a tela ${tela.colunas}×${tela.linhas}.`);
    }
    // Regra 6: linha da barra, na tela (y = sala.linhas − 1), convertida para a linha local da subárea.
    // Subárea centralizada que não chega a essa linha não é afetada; a Sala girada (10 linhas) fica fora (ADR-004, seção 8, item 6).
    const yBarra = tela.linhas - 1 - desl.y;
    if (yBarra >= 0 && yBarra < mapa.altura) {
      for (let x = 0; x < mapa.largura; x++) {
        if (mapa.colisao[yBarra][x] === false) erros.push(`subárea '${id}': chão andável em (${x}, ${yBarra}) na linha da barra (tela y ${tela.linhas - 1})`);
      }
      for (const o of mapa.objetos) {
        if (o.tipo !== 'movel' && o.y === yBarra) erros.push(`subárea '${id}': ${o.tipo} em (${o.x}, ${yBarra}) na linha da barra (tela y ${tela.linhas - 1})`);
      }
    }
    // Segunda linha da barra (ADR-005 seção 6, GDD 16.9): a linha de tela `linhas − 2`. Erro, desde a resposta do Diretor à
    // pergunta 31 (2026-11-08): a Sala tem (0, 9) e (1, 9) bloqueados na cópia de trabalho. Chão andável, objeto, gatilho e
    // spawn nela são erro.
    const yBarra2 = tela.linhas - 2 - desl.y;
    if (yBarra2 >= 0 && yBarra2 < mapa.altura) {
      for (let x = 0; x < mapa.largura; x++) {
        if (mapa.colisao[yBarra2][x] === false && mapa.chao[yBarra2][x] !== 0) {
          erros.push(`subárea '${id}': chão andável em (${x}, ${yBarra2}) na linha da barra (tela y ${tela.linhas - 2}; guarda de 2 linhas, ADR-005 seção 6)`);
        }
      }
      for (const o of mapa.objetos) {
        if (o.tipo !== 'movel' && o.y === yBarra2) erros.push(`subárea '${id}': ${o.tipo} em (${o.x}, ${yBarra2}) na linha da barra (tela y ${tela.linhas - 2})`);
      }
    }
    const nomesDeSpawn = new Set<string>();
    const ocupados = new Map<string, ObjetoDoMapa[]>();
    const idsDePortaNaArea = new Set<string>();
    const posicoesDePorta = new Set<string>();
    for (const o of mapa.objetos) {
      const rotulo = rotuloDe(o);
      const chave = `${o.x},${o.y}`;
      if (!TIPOS_CONHECIDOS.includes(o.tipo)) erros.push(`Subárea "${id}": tipo de objeto "${o.tipo}" desconhecido.`);
      // Móvel tem regras próprias (retângulo, bloqueio, sem interação); fica fora das regras de tile e da barra.
      if (o.tipo === 'movel') {
        erros.push(...errosDoMovel(mapa, o, rotulo, id));
        continue;
      }
      if (o.x < 0 || o.y < 0 || o.x >= mapa.largura || o.y >= mapa.altura) {
        erros.push(`Subárea "${id}": ${rotulo} está fora da caixa.`);
        continue;
      }
      // Regra 6: nenhum objeto na última linha da tela (a barra de controles fica ali, GDD 14.8).
      if (o.y + desl.y === tela.linhas - 1) erros.push(`Subárea "${id}": ${rotulo} está na última linha da tela, onde fica a barra.`);
      // Dois objetos no mesmo tile (conversor E015). Exceções (ADR-011 seção 3.2): a chegada (spawn) fica no tile da própria
      // porta; duas portas no mesmo tile em lados diferentes; spawns de nomes diferentes. Dois spawns de mesmo nome
      // continuam erro (spawn repetido, abaixo).
      for (const outro of ocupados.get(chave) ?? []) {
        const spawnsDeNomesDiferentes = o.tipo === 'spawn' && outro.tipo === 'spawn' && o.dados.nome !== outro.dados.nome;
        const portaESpawn = (o.tipo === 'porta' && outro.tipo === 'spawn') || (o.tipo === 'spawn' && outro.tipo === 'porta');
        const portasDeLadosDiferentes = o.tipo === 'porta' && outro.tipo === 'porta' && o.dados.lado !== outro.dados.lado;
        if (!spawnsDeNomesDiferentes && !portaESpawn && !portasDeLadosDiferentes) erros.push(`Subárea "${id}": ${rotulo} e ${rotuloDe(outro)} ocupam o mesmo tile.`);
      }
      ocupados.set(chave, [...(ocupados.get(chave) ?? []), o]);
      // Regra 5: tipo de tile exigido por objeto.
      const piso = mapa.chao[o.y][o.x] !== 0;
      const livre = piso && !mapa.colisao[o.y][o.x];
      const temVizinhoLivre = vizinhosLivresAlcancaveis(mapa, o.x, o.y).length > 0;
      if (o.tipo === 'spawn' || o.tipo === 'porta' || o.tipo === 'interruptor' || o.tipo === 'bilhete') {
        if (!livre) erros.push(`Subárea "${id}": ${rotulo} precisa estar em piso livre.`);
      }
      if (o.tipo === 'arvore' && !piso) erros.push(`Subárea "${id}": ${rotulo} precisa estar sobre piso.`);
      // Examinável: tile bloqueado (móvel) com vizinho livre alcançável pela aresta aberta (ADR-011 seção 5.5).
      if (o.tipo === 'examinavel') {
        if (!(mapa.colisao[o.y][o.x] && temVizinhoLivre)) erros.push(`Subárea "${id}": ${rotulo} precisa estar em tile bloqueado com vizinho livre alcançável.`);
      }
      // Bilhete (item 27, ADR-011 seção 3.2): tile livre, com `lado` para uma aresta de parede que não é de porta.
      if (o.tipo === 'bilhete') {
        const lado = ladoDaPorta(o);
        if (!lado) erros.push(`Subárea "${id}": ${rotulo} sem lado válido (cima, baixo, esquerda ou direita; ADR-011 seção 3.2).`);
        else if (!paredeNoTile(mapa.paredes, o.x, o.y, lado)) erros.push(`Subárea "${id}": ${rotulo} com lado "${lado}" para uma aresta sem parede (item 27).`);
        else if (mapa.objetos.some((p) => p.tipo === 'porta' && p.x === o.x && p.y === o.y && p.dados.lado === lado)) {
          erros.push(`Subárea "${id}": ${rotulo} com lado "${lado}" para a aresta de uma porta (item 27).`);
        }
      }
      // Peça (ADR-004 seção 6; GDD 15.2.5): tile livre com colisão 0 e vizinho livre alcançável (ADR-011 seção 5.5).
      if (o.tipo === 'peca') {
        const ordem = Number(o.dados.ordem);
        if (!Number.isInteger(ordem) || ordem < 1 || ordem > 3) erros.push(`Subárea "${id}": ${rotulo} com ordem inválida (${String(o.dados.ordem)}).`);
        if (o.dados.id !== `peca${ordem}`) erros.push(`Subárea "${id}": ${rotulo} com id "${String(o.dados.id)}", que deveria ser "peca${ordem}".`);
        if (!livre) erros.push(`Subárea "${id}": ${rotulo} precisa estar em piso livre (colisão 0; ADR-004 seção 6).`);
        if (!temVizinhoLivre) erros.push(`Subárea "${id}": ${rotulo} sem vizinho livre alcançável pelas arestas abertas, que não seja porta, chegada ou objeto (GDD 15.2.2; ADR-011 seção 5.5).`);
        if (mapa.objetos.some((p) => p.tipo === 'porta' && p.x === o.x && p.y === o.y)) erros.push(`Subárea "${id}": ${rotulo} cai em tile de porta.`);
      }
      if (o.tipo === 'spawn') {
        const nome = String(o.dados.nome);
        if (nomesDeSpawn.has(nome)) erros.push(`Subárea "${id}": spawn "${nome}" repetido.`);
        nomesDeSpawn.add(nome);
        if (!DIRECOES.includes(String(o.dados.direcao))) erros.push(`Subárea "${id}": spawn "${nome}" com direção inválida.`);
      }
      // Textos citados existem.
      const chaveTexto = o.dados.texto;
      if (typeof chaveTexto === 'string' && !textos.tem(chaveTexto)) erros.push(`Subárea "${id}": texto "${chaveTexto}" de ${rotulo} não existe.`);
      if (o.tipo === 'porta') erros.push(...errosDaPorta(mapa, o, rotulo, todos, idsDePortaNaArea, posicoesDePorta));
    }
    // Regra 17: peça de Marco 2 não fica sobre o interruptor nem encostada nele (ADR-004 seção 8, item 17).
    for (const p of mapa.objetos.filter((o) => o.tipo === 'peca')) {
      for (const i of mapa.objetos.filter((o) => o.tipo === 'interruptor')) {
        if (Math.abs(p.x - i.x) + Math.abs(p.y - i.y) <= 1) erros.push(`Subárea "${id}": peça ${String(p.dados.id)} em (${p.x}, ${p.y}) sobre ou encostada no interruptor (ADR-004 seção 8, item 17).`);
      }
    }
  }

  // Regra 11: interruptor fora do círculo de luz inicial, só para o spawn de entrada no escuro (ADR-004 seção 8, item 11).
  for (const { mapa: nomeMapa, spawn } of SPAWNS_DE_ENTRADA_NO_ESCURO) {
    const m = todos.get(nomeMapa);
    const sp = m?.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === spawn);
    if (!m || !sp) {
      erros.push(`Entrada no escuro: spawn "${spawn}" de "${nomeMapa}" não existe (ADR-004 seção 8, item 11).`);
      continue;
    }
    for (const i of m.objetos.filter((o) => o.tipo === 'interruptor')) {
      const d = Math.hypot(i.x - sp.x, i.y - sp.y);
      if (d <= perfil.luz.raioEmTiles) {
        erros.push(`Subárea "${nomeMapa}": interruptor em (${i.x}, ${i.y}) a ${d.toFixed(2)} tiles do spawn "${spawn}"; precisa ser mais de ${perfil.luz.raioEmTiles}.`);
      }
    }
  }

  // Regra 15 e 18: peças, uma de cada ordem (1, 2 e 3), sem repetir e sem pular; cada uma na área da sua missão.
  const pecas = [...todos.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'peca').map((o) => ({ mapa: m, o })));
  for (const ordem of [1, 2, 3]) {
    const quantas = pecas.filter((p) => Number(p.o.dados.ordem) === ordem).length;
    if (quantas === 0) erros.push(`peça ${ordem} não existe no conteúdo (ADR-004 seção 8, item 15).`);
    if (quantas > 1) erros.push(`peça ${ordem} aparece ${quantas} vezes.`);
  }
  for (const { mapa, o } of pecas) {
    const ordem = Number(o.dados.ordem);
    const estadoEsperado = ordem === 1 ? 'visivel' : 'escondida';
    if (o.dados.estadoInicial !== estadoEsperado) erros.push(`Subárea "${mapa.id}": peça ${ordem} com estadoInicial "${String(o.dados.estadoInicial)}"; deveria ser "${estadoEsperado}" (ADR-004 seção 8, item 15).`);
    const missaoDaPeca = missaoPorId(`parte${ordem}`);
    if (missaoDaPeca && !missaoDaPeca.maps.includes(mapa.id)) erros.push(`Subárea "${mapa.id}": peça ${ordem} fora das subáreas abertas de parte${ordem} (ADR-004 seção 8, item 18).`);
  }

  // Caixa de enfeite (ADR-006 seções 2 e 9): T006 (uma caixa, ordem 4, escondida), T007 (tile), T008 (subárea do farejar).
  const caixas = [...todos.values()].flatMap((m) => m.objetos.filter((o) => o.tipo === 'enfeite').map((o) => ({ mapa: m, o })));
  if (caixas.length !== 1) erros.push(`T006 Deve haver exatamente uma caixa de enfeite (tipo enfeite); há ${caixas.length} (ADR-006 seção 2.2).`);
  const missaoDosEnfeites = missoes.find((m) => FASE_DO_ENFEITE in m.missao.conquistas);
  for (const { mapa, o } of caixas) {
    const rotulo = `Subárea "${mapa.id}": enfeite em (${o.x}, ${o.y})`;
    if (Number(o.dados.ordem) !== 4) erros.push(`T006 ${rotulo}: ordem ${String(o.dados.ordem)}, deveria ser 4 (ADR-006 seção 2.2).`);
    if (o.dados.estadoInicial !== 'escondida') erros.push(`T006 ${rotulo}: estadoInicial "${String(o.dados.estadoInicial)}", deveria ser "escondida".`);
    // T007: piso livre e pelo menos 2 vizinhos livres alcançáveis pelas arestas abertas (a definição já exclui peça, enfeite,
    // porta, spawn, chegada, interruptor, árvore e examinável; ADR-004 seção 8, item 6; ADR-011 seção 5.5; GDD 17.3).
    if (!livreNoMapa(mapa, o.x, o.y)) erros.push(`T007 ${rotulo} precisa estar em piso livre (colisão 0; ADR-006 seção 9).`);
    const vizinhosLivres = vizinhosLivresAlcancaveis(mapa, o.x, o.y);
    if (vizinhosLivres.length < 2) erros.push(`T007 ${rotulo} com ${vizinhosLivres.length} vizinho(s) livre(s) alcançável(is); precisa de pelo menos 2 (ADR-006 seção 9; ADR-011 seção 5.5).`);
    if (mapa.objetos.some((m) => m.tipo === 'movel' && o.x >= m.x && o.y >= m.y && o.x < m.x + Number(m.dados.w) && o.y < m.y + Number(m.dados.h))) {
      erros.push(`T007 ${rotulo} dentro de móvel.`);
    }
    // T008: a caixa está na subárea que é `nick.alvo` da missão de enfeites, e essa subárea está em `maps` dela.
    const alvo = missaoDosEnfeites?.missao.nick?.alvo;
    if (!missaoDosEnfeites || alvo !== mapa.id || !missaoDosEnfeites.maps.includes(mapa.id)) {
      erros.push(`T008 ${rotulo}: a caixa precisa estar na subárea alvo de "${missaoDosEnfeites?.id ?? 'enfeites'}" (alvo "${String(alvo)}") e nas subáreas da missão.`);
    }
  }

  // T009: textos do Marco 4 (ADR-006 seção 8.5): existem, com o número de páginas e o teto de linhas de cada página.
  for (const { chave, paginas, linhas } of TEXTOS_DO_MARCO4) {
    if (!textos.tem(chave)) {
      erros.push(`T009 Texto "${chave}" não existe (ADR-006 seção 8.5).`);
      continue;
    }
    if (textos.quantasPaginas(chave) !== paginas) erros.push(`T009 Texto "${chave}" precisa ter ${paginas} página(s); tem ${textos.quantasPaginas(chave)}.`);
    textos.paginas(chave).forEach((pagina, i) => {
      const n = linhasDe(pagina, LARGURA_DA_LINHA);
      if (n > linhas) erros.push(`T009 Texto "${chave}", página ${i + 1}: ${n} linhas de ${LARGURA_DA_LINHA}; o teto é ${linhas} (GDD 17.8).`);
    });
  }

  // Regra 19: avisos "ainda não" com duas páginas cada (GDD 15.8).
  for (const chave of AVISOS_OBRIGATORIOS) {
    if (!textos.tem(chave)) erros.push(`Texto "${chave}" (aviso "ainda não") não existe (ADR-004 seção 8, item 19).`);
    else if (textos.quantasPaginas(chave) !== 2) erros.push(`Texto "${chave}" precisa ter 2 páginas (GDD 15.2.7).`);
  }

  // Regra 9: início aponta para spawn de subárea aberta na missão inicial.
  const spawnExiste = (mapa: string, spawn: string) => {
    const m = todos.get(mapa);
    return !!m && m.objetos.some((o) => o.tipo === 'spawn' && o.dados.nome === spawn);
  };
  if (inicial) {
    const inicio = inicial.missao.inicio;
    if (!inicio) {
      erros.push(`Missão "${inicial.id}": sem inicio (é a missão de início).`);
    } else {
      if (!inicial.maps.includes(inicio.mapa)) erros.push(`Missão "${inicial.id}": inicio usa a subárea "${inicio.mapa}", que não está em maps da missão.`);
      if (!spawnExiste(inicio.mapa, inicio.spawn)) erros.push(`Missão "${inicial.id}": inicio usa o spawn "${inicio.spawn}", que não existe em "${inicio.mapa}".`);
      for (const chave of inicio.paginas) {
        if (!textos.tem(chave)) erros.push(`Missão "${inicial.id}": página de introdução "${chave}" não existe nos textos.`);
      }
    }
  }

  // T005 (ADR-006 seção 9): as fases da missão final são as últimas de FASES (sem próxima fase).
  for (const m of missoes.filter((x) => x.final)) {
    for (const fase of Object.keys(m.missao.conquistas)) {
      if (ehFase(fase) && proximaFase(fase) !== null) erros.push(`T005 Missão final "${m.id}": a fase "${fase}" não é a última de FASES (ADR-006 seção 1.2).`);
    }
  }

  // Regra 1 (referências) e regra 13 (chaves de fase; todo texto de conquista existe), por missão.
  for (const m of missoes) {
    for (const sub of m.maps) if (!todos.has(sub)) erros.push(`Missão "${m.id}": subárea "${sub}" não existe.`);
    for (const r of m.requires) if (!missaoPorId(r)) erros.push(`Missão "${m.id}": exige "${r}", que não existe.`);
    for (const [fase, c] of Object.entries(m.missao.conquistas)) {
      if (!ehFase(fase)) erros.push(`Missão "${m.id}": conquistas.${fase}: "${fase}" não é fase.`);
      if (!textos.tem(c)) erros.push(`Missão "${m.id}": conquistas.${fase}: texto "${c}" não existe nos textos.`);
    }
  }

  // Regra 9 e 12: destino da condução é tile andável de subárea aberta na missão, alcançável a partir do ponto de partida da fase.
  const inicioNo = (() => {
    const inicio = inicial?.missao.inicio;
    if (!inicio) return null;
    const m = todos.get(inicio.mapa);
    const sp = m?.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === inicio.spawn);
    return sp && m ? { mapa: m.id, x: sp.x, y: sp.y } : null;
  })();
  for (const m of missoes) {
    for (const [fase, d] of Object.entries(m.missao.conducao)) {
      const rotulo = `conducao.${fase}`;
      if (!ehFase(fase)) {
        erros.push(`Missão "${m.id}": ${rotulo}: "${fase}" não é fase.`);
        continue;
      }
      if (!m.maps.includes(d.mapa)) {
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) não está em maps da missão.`);
        continue;
      }
      const sub = todos.get(d.mapa);
      if (!sub) {
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) não existe.`);
        continue;
      }
      const tile = sub.colisao[d.y]?.[d.x];
      if (tile === undefined) {
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) está fora da subárea.`);
        continue;
      }
      if (tile || sub.objetos.some((o) => o.tipo === 'porta' && o.x === d.x && o.y === d.y)) {
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) não é tile andável.`);
        continue;
      }
      // Regra 6 também para destino: a linha da barra é a da tela, não a da caixa (ADR-004, seção 8, item 6).
      if (d.y + deslocamentoDaSubarea(sub, tela).y === tela.linhas - 1) {
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) está na linha da barra.`);
        continue;
      }
      const ordem = ordemDaFase(fase as Fase);
      const { concluida, ctx } = situacaoDaFase(missoes, fase as Fase);
      // Ponto de partida: o início para `luzes`; para `parteN`, qualquer vizinho livre da peça N (ADR-004 seção 11.1).
      let partidas: { mapa: string; x: number; y: number }[] = [];
      if (fase === 'luzes') {
        if (inicioNo) partidas = [inicioNo];
      } else if (fase === FASE_DO_ENFEITE) {
        // Caixa de enfeite: parte dos vizinhos livres dela (ADR-006 seção 2.5).
        partidas = pontosDaCaixa(todos);
      } else if (ordem !== undefined && FASE_DA_PECA[ordem] === fase) {
        const peca = pecas.find((p) => Number(p.o.dados.ordem) === ordem);
        if (peca) {
          partidas = vizinhosLivresPorAresta(peca.mapa, peca.o.x, peca.o.y).map((p) => ({ mapa: peca.mapa.id, ...p }));
        }
      }
      if (partidas.length === 0) {
        erros.push(`${rotulo}: sem ponto de partida para a fase (início ou vizinho livre da peça).`);
        continue;
      }
      const ok = partidas.some((p) => calcularRotaDeConducao(todos, p, { mapa: d.mapa, x: d.x, y: d.y }, concluida, ctx));
      if (!ok) {
        const origem =
          fase === 'luzes' && inicial?.missao.inicio
            ? `do início (${inicial.missao.inicio.mapa}, ${inicial.missao.inicio.spawn})`
            : fase === FASE_DO_ENFEITE
              ? 'da caixa de enfeite'
              : `da peça ${ordem}`;
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) sem rota a partir ${origem}.`);
      }
    }
  }

  // Nick e dicas (ADR-005 seção 2.6, N001 a N014). Todos erros.
  erros.push(...validarNick({ todos, missoes, textos, perfil }));

  return { erros, avisos };
}
