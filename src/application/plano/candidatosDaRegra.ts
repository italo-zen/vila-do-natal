import type { MapaDoJogo } from '../content/Mapa';
import type { AreaDePeca, RegraDoNick } from '../content/Sorteio';
import type { PerfilDeArte } from '../arte/PerfilDeArte';
import type { MissaoCarregada } from '../mundo/missoes';
import { candidatosDoNick, type Tile2 } from './candidatos';

/** Candidatos do Nick de uma missão, na lista inteira de áreas da regra, sem peças (a checagem com as peças do plano é da enumeração). */
export function candidatosDeNickDaRegra(
  todos: Map<string, MapaDoJogo>,
  missoes: readonly MissaoCarregada[],
  idDaMissao: string,
  regra: RegraDoNick,
  perfil: PerfilDeArte,
  pecas: readonly { mapa: string; x: number; y: number }[] = [],
  areasDePeca: readonly AreaDePeca[] = [],
): { mapa: string; x: number; y: number }[] {
  const missao = missoes.find((m) => m.id === idDaMissao);
  const destinos = Object.values(missao?.missao.conducao ?? {});
  const out: { mapa: string; x: number; y: number }[] = [];
  for (const area of regra.areas) {
    const m = todos.get(area);
    if (!m) continue;
    let luz: { chegada: Tile2; raio: number } | undefined;
    if (regra.dentroDaLuzDeEntrada && regra.dentroDaLuzDeEntrada.mapa === area) {
      const sp = m.objetos.find((o) => o.tipo === 'spawn' && o.dados.nome === regra.dentroDaLuzDeEntrada!.spawn);
      if (sp) luz = { chegada: { x: sp.x, y: sp.y }, raio: perfil.luz.raioEmTiles };
    }
    const d = destinos.find((q) => q.mapa === area);
    for (const t of candidatosDoNick(m, { linhasDaTela: perfil.sala.linhas, pecas: pecas.filter((p) => p.mapa === area), destino: d ? { x: d.x, y: d.y } : undefined, luz, passagem: areasDePeca.find((a) => a.id === area)?.passagem })) out.push({ mapa: area, ...t });
  }
  return out;
}
