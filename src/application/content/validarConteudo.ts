import type { Manifest } from './Manifest';
import type { MapaDoJogo, ObjetoDoMapa } from './Mapa';
import type { Textos } from './Textos';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import { ehFase, type Fase } from '../../domain/progresso/Fase';
import { deslocamentoDaSubarea, ladoDaPorta, ladoDoVetor, vaoDaPorta, vetorDaSaida } from '../mundo/subarea';
import { calcularRotaDeConducao } from '../mundo/conducao';
import { FASE_DA_PECA, ordemDaFase, situacaoDaFase } from '../mundo/pecas';
import type { MissaoCarregada } from '../mundo/missoes';

const VIZINHOS: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const DIRECOES = ['cima', 'baixo', 'esquerda', 'direita'];
const LADOS_DA_PORTA = ['cima', 'baixo', 'esquerda', 'direita'];
const TIPOS_CONHECIDOS = ['porta', 'portaFechada', 'spawn', 'interruptor', 'bilhete', 'arvore', 'examinavel', 'movel', 'peca'];
/** Chaves de aviso que o Marco 2 exige, com duas páginas cada (GDD 15.8; ADR-004 seção 8, item 19). */
const AVISOS_OBRIGATORIOS = ['aviso.peca2.antes1', 'aviso.peca3.antes1', 'aviso.peca3.antes2'];

/**
 * Spawns de entrada no escuro (ADR-004 seção 8, item 11): lista explícita. Só eles têm a regra de 3 tiles do
 * interruptor. Hoje: a entrada da Sala pela P8, em (6, 6). As chegadas de P2, P3 e P7 não entram (a casa está acesa
 * ou a área não é entrada no escuro).
 */
export const SPAWNS_DE_ENTRADA_NO_ESCURO: readonly { mapa: string; spawn: string }[] = [{ mapa: 'sala', spawn: 'P8' }];

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

/**
 * Vãos de passagem da subárea: o primeiro tile fora de cada gatilho, no lado `saida` (ADR-004 seções 3 e 13.18).
 * Só os vãos que caem dentro da caixa entram (os outros são do outro lado).
 */
function vaosDaSubarea(m: MapaDoJogo): { x: number; y: number; id: string }[] {
  const vaos: { x: number; y: number; id: string }[] = [];
  for (const g of m.objetos.filter((o) => o.tipo === 'porta')) {
    const lado = ladoDaPorta(g);
    if (!lado) continue;
    const v = vaoDaPorta(g, lado);
    if (v.x >= 0 && v.y >= 0 && v.x < m.largura && v.y < m.altura) vaos.push({ ...v, id: String(g.dados.id) });
  }
  return vaos;
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
 * Avisos do conteúdo (não bloqueiam teste nem build). Hoje: W027, gatilho de par de fórmula com mais de um vizinho
 * livre (ADR-004 seção 13.19; P7 e P8 da Sala). Um lado com chegada declarada não é aviso: é erro (E027).
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

  // Pares de porta, em todas as subáreas (regra 4).
  const portasPorId = new Map<string, { mapa: MapaDoJogo; o: ObjetoDoMapa }[]>();
  for (const mapa of todos.values()) {
    for (const o of mapa.objetos) {
      if (o.tipo === 'porta') portasPorId.set(String(o.dados.id), [...(portasPorId.get(String(o.dados.id)) ?? []), { mapa, o }]);
    }
  }

  for (const mapa of todos.values()) {
    const id = mapa.id;
    const desl = deslocamentoDaSubarea(mapa, tela);
    if (mapa.tile !== perfil.tile) erros.push(`Subárea "${id}": tile ${mapa.tile} é diferente do tile do perfil "${perfil.id}" (${perfil.tile}).`);
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
    const nomesDeSpawn = new Set<string>();
    const ocupados = new Map<string, ObjetoDoMapa[]>();
    const vaos = vaosDaSubarea(mapa);
    // Tiles que a peça não pode ter como vizinho livre: gatilho, vão, spawn, chegada, interruptor, porta, examinável (ADR-004, seção 8, item 16).
    const reservados = new Set<string>([
      ...mapa.objetos.filter((o) => ['porta', 'portaFechada', 'spawn', 'interruptor', 'examinavel', 'arvore', 'bilhete'].includes(o.tipo)).map((o) => `${o.x},${o.y}`),
      ...vaos.map((v) => `${v.x},${v.y}`),
    ]);
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
      // Dois objetos no mesmo tile (conversor E015). Exceção: spawns de nomes diferentes, como a chegada de P2 e P3 na
      // Sala (ADR-004 seção 9 e 13.9, item 6). Dois spawns de mesmo nome continuam erro (spawn repetido, abaixo).
      for (const outro of ocupados.get(chave) ?? []) {
        const spawnsDeNomesDiferentes = o.tipo === 'spawn' && outro.tipo === 'spawn' && o.dados.nome !== outro.dados.nome;
        if (!spawnsDeNomesDiferentes) erros.push(`Subárea "${id}": ${rotulo} e ${rotuloDe(outro)} ocupam o mesmo tile.`);
      }
      ocupados.set(chave, [...(ocupados.get(chave) ?? []), o]);
      // Regra 5: tipo de tile exigido por objeto.
      const piso = mapa.chao[o.y][o.x] !== 0;
      const livre = piso && !mapa.colisao[o.y][o.x];
      const temVizinhoLivre = VIZINHOS.some(([dx, dy]) => livreNoMapa(mapa, o.x + dx, o.y + dy));
      if (o.tipo === 'spawn' || o.tipo === 'porta' || o.tipo === 'interruptor') {
        if (!livre) erros.push(`Subárea "${id}": ${rotulo} precisa estar em piso livre.`);
      }
      if (o.tipo === 'arvore' && !piso) erros.push(`Subárea "${id}": ${rotulo} precisa estar sobre piso.`);
      // Bilhete é tile de parede, como o examinável: bloqueado, com vizinho livre (GDD 14.10.9, item 040).
      if (o.tipo === 'examinavel' || o.tipo === 'portaFechada' || o.tipo === 'bilhete') {
        if (!(mapa.colisao[o.y][o.x] && temVizinhoLivre)) erros.push(`Subárea "${id}": ${rotulo} precisa estar em tile bloqueado com vizinho livre.`);
      }
      if (o.tipo === 'portaFechada' && !LADOS_DA_PORTA.includes(String(o.dados.saida))) {
        erros.push(`Subárea "${id}": ${rotulo} sem saída válida (cima, baixo, esquerda ou direita; ADR-004 seção 6).`);
      }
      // Peça (ADR-004 seção 6; GDD 15.2.5): tile livre com colisão 0 e vizinho livre que não seja gatilho, vão, chegada etc.
      if (o.tipo === 'peca') {
        const ordem = Number(o.dados.ordem);
        if (!Number.isInteger(ordem) || ordem < 1 || ordem > 3) erros.push(`Subárea "${id}": ${rotulo} com ordem inválida (${String(o.dados.ordem)}).`);
        if (o.dados.id !== `peca${ordem}`) erros.push(`Subárea "${id}": ${rotulo} com id "${String(o.dados.id)}", que deveria ser "peca${ordem}".`);
        if (!livre) erros.push(`Subárea "${id}": ${rotulo} precisa estar em piso livre (colisão 0; ADR-004 seção 6).`);
        const vizinhoLivreComum = VIZINHOS.some(([dx, dy]) => livreNoMapa(mapa, o.x + dx, o.y + dy) && !reservados.has(`${o.x + dx},${o.y + dy}`));
        if (!vizinhoLivreComum) erros.push(`Subárea "${id}": ${rotulo} sem vizinho livre que não seja gatilho, vão, chegada ou objeto (GDD 15.2.2).`);
        if (vaos.some((v) => v.x === o.x && v.y === o.y)) erros.push(`Subárea "${id}": ${rotulo} cai em vão de passagem.`);
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
      if (o.tipo === 'porta') {
        // Par com destino fechado nesta missão é permitido: age como porta fechada em tempo de execução (ADR-004 seção 3).
        const destino = String(o.dados.destino);
        if (!todos.has(destino)) erros.push(`Subárea "${id}": porta ${String(o.dados.id)} leva a "${destino}", que não existe no manifesto.`);
        if (o.dados.trancadaAte !== undefined && !ehFase(String(o.dados.trancadaAte))) {
          erros.push(`Subárea "${id}": trancadaAte "${String(o.dados.trancadaAte)}" não é uma fase.`);
        }
        // Chegada e saída (ADR-004 seções 3, 8 itens 20 a 22, e 13). A chegada encosta no gatilho (regra da seção 3) e
        // `direcao` aponta do gatilho para dentro (E028). A saída aponta para o vão, que não pode ser piso livre (item 22).
        // O item 22 vale só para `porta`: a P1 (`portaFechada`, saída esquerda) aponta para (5, 2), piso livre da Sala,
        // e segue assim até a Suíte abrir (ADR-004 seção 13.20). Ver o relatório do Desenvolvedor (PARA O ESPECIALISTA).
        const lado = ladoDaPorta(o);
        if (!lado) erros.push(`Subárea "${id}": ${rotulo} sem saída válida (cima, baixo, esquerda ou direita; ADR-004 seção 13.18).`);
        const s = mapa.objetos.find((x) => x.tipo === 'spawn' && x.dados.nome === o.dados.id);
        if (!s) {
          erros.push(`Subárea "${id}": porta ${String(o.dados.id)} sem chegada de mesmo nome nesta subárea (ADR-004 seção 3).`);
        } else if (Math.abs(s.x - o.x) + Math.abs(s.y - o.y) !== 1) {
          erros.push(`Subárea "${id}": porta ${String(o.dados.id)} com chegada fora do lado do gatilho (ADR-004 seção 3).`);
        } else {
          // Sentido do gatilho para a chegada, que é para dentro da área (ADR-004 seção 13.14, d).
          const sentido = ladoDoVetor(s.x - o.x, s.y - o.y);
          if (String(s.dados.direcao) !== sentido) {
            erros.push(`Subárea "${id}": porta ${String(o.dados.id)}: chegada (${s.x}, ${s.y}) com direção "${String(s.dados.direcao)}", deveria ser "${sentido}", para dentro (E028; ADR-004 seção 13.14, d).`);
          }
        }
        if (lado) {
          const v = vaoDaPorta(o, lado);
          const dentro = v.x >= 0 && v.y >= 0 && v.x < mapa.largura && v.y < mapa.altura;
          if (dentro && livreNoMapa(mapa, v.x, v.y)) {
            erros.push(`Subárea "${id}": porta ${String(o.dados.id)} (${id}, (${o.x}, ${o.y})): saída '${lado}' aponta para piso livre (${v.x}, ${v.y}) (ADR-004 seção 8, item 22).`);
          }
        }
        // Uma porta, uma entrada (ADR-004 seção 8, item 21): exatamente um vizinho livre na própria subárea.
        // Erro para lado com chegada declarada (E027); aviso W027 para par de fórmula (13.19).
        if (lado) {
          const livres = VIZINHOS.filter(([dx, dy]) => livreNoMapa(mapa, o.x + dx, o.y + dy)).length;
          if (livres !== 1 && s) {
            const v = vetorDaSaida(lado);
            const ehDeFormula = s.x === o.x - v.x && s.y === o.y - v.y;
            const msg = `porta ${String(o.dados.id)} (${id}, (${o.x}, ${o.y})): ${livres} vizinhos livres (esperado 1)`;
            if (ehDeFormula) avisos.push(`W027 Subárea "${id}": ${msg}; par de fórmula, não bloqueia (ADR-004 seção 13.19).`);
            else erros.push(`Subárea "${id}": ${msg} (E027; ADR-004 seção 8, item 21).`);
          }
        }
      }
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

  // Regra 2 e 4: pares de porta (dois gatilhos com o mesmo id, apontando um para o outro).
  for (const [pid, grupo] of portasPorId) {
    if (grupo.length !== 2) {
      erros.push(`Porta ${pid}: ${grupo.length} gatilho(s); um par exige 2.`);
      continue;
    }
    const [a, b] = grupo;
    if (a.mapa.id === b.mapa.id || String(a.o.dados.destino) !== b.mapa.id || String(b.o.dados.destino) !== a.mapa.id) {
      erros.push(`Porta ${pid}: os dois gatilhos não apontam um para o outro.`);
    }
    for (const g of grupo) {
      const sp = String(g.o.dados.spawnDestino);
      const dest = todos.get(String(g.o.dados.destino));
      // Regra 3: spawn de chegada existe na subárea de destino.
      if (dest && !dest.objetos.some((o) => o.tipo === 'spawn' && o.dados.nome === sp)) {
        erros.push(`Porta ${pid}: spawnDestino "${sp}" não existe em "${dest.id}".`);
      }
    }
  }

  // Regra 14: cada porta fechada aparece uma só vez no conteúdo, e nenhum id de porta fechada é gatilho
  // (GDD 14.10.9, item 044: P1 é um só objeto portaFechada).
  const fechadasPorId = new Map<string, number>();
  for (const mapa of todos.values()) {
    for (const o of mapa.objetos) {
      if (o.tipo === 'portaFechada') fechadasPorId.set(String(o.dados.id), (fechadasPorId.get(String(o.dados.id)) ?? 0) + 1);
    }
  }
  for (const pid of fechadasPorId.keys()) {
    if (portasPorId.has(pid)) erros.push(`Porta ${pid}: existe como portaFechada e como porta; porta fechada não tem par (ADR-004 seção 8, item 14).`);
  }
  for (const mapa of todos.values()) {
    const vistos = new Set<string>();
    for (const o of mapa.objetos) {
      const pid = String(o.dados.id);
      if (o.tipo !== 'portaFechada' || vistos.has(pid)) continue;
      vistos.add(pid);
      const total = fechadasPorId.get(pid) ?? 0;
      if (total > 1) erros.push(`subárea '${mapa.id}': portaFechada ${pid} aparece ${total} vezes.`);
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
      } else if (ordem !== undefined && FASE_DA_PECA[ordem] === fase) {
        const peca = pecas.find((p) => Number(p.o.dados.ordem) === ordem);
        if (peca) {
          partidas = VIZINHOS.map(([dx, dy]) => ({ mapa: peca.mapa.id, x: peca.o.x + dx, y: peca.o.y + dy }))
            .filter((p) => livreNoMapa(peca.mapa, p.x, p.y));
        }
      }
      if (partidas.length === 0) {
        erros.push(`${rotulo}: sem ponto de partida para a fase (início ou vizinho livre da peça).`);
        continue;
      }
      const ok = partidas.some((p) => calcularRotaDeConducao(todos, p, { mapa: d.mapa, x: d.x, y: d.y }, concluida, ctx));
      if (!ok) {
        const origem = fase === 'luzes' && inicial?.missao.inicio ? `do início (${inicial.missao.inicio.mapa}, ${inicial.missao.inicio.spawn})` : `da peça ${ordem}`;
        erros.push(`${rotulo}: destino ${d.mapa} (${d.x}, ${d.y}) sem rota a partir ${origem}.`);
      }
    }
  }

  return { erros, avisos };
}
