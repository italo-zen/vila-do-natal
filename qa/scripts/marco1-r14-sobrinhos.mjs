// QA rodada 14, itens 3 e 4 (planta girada): BiBi, DanDan e TuTu. Porta P8 com o código do sobrinho,
// Sala, interruptor, condução, chegada e árvore de pé no tile (3,8). Build de QA: dist-qa/index.html.
// Uso: node qa/scripts/marco1-r14-sobrinhos.mjs
import { lancar, novoContexto, lerTextos, limparTextos, juntar, capturar } from './lib.mjs';
import { irPara, ladosDe, estado, esperarFade, apertarA, objeto } from './lib-rota.mjs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const url = pathToFileURL(join(AQUI, '..', '..', 'dist-qa', 'index.html')).href;
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const seta = { '1,0': 'ArrowRight', '-1,0': 'ArrowLeft', '0,1': 'ArrowDown', '0,-1': 'ArrowUp' };
const SOBRINHOS = [
  { nome: 'BiBi', direitas: 1, codigo: ['0', '2', '0'] },
  { nome: 'DanDan', direitas: 2, codigo: ['0', '2', '3'] },
  { nome: 'TuTu', direitas: 3, codigo: ['0', '2', '4'] },
];
const browser = await lancar();
const ctx = await novoContexto(browser, { url, origem: url, rotulo: 'r14s' });
const page = await ctx.newPage();
const erros = [];
page.on('pageerror', (e) => erros.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
const pressionar = async (k, ms = 90) => { await page.keyboard.down(k); await dormir(ms); await page.keyboard.up(k); await dormir(160); };
const pos = async () => { const e = await estado(page); return e ? `${e.mapa}(${e.tileX},${e.tileY}) dir=${e.direcao} trav=${e.travado} conducao=${e.emConducao} fade=${e.emFade}` : 'null'; };
async function fecharTudo() { for (let i = 0; i < 8; i++) { const e = await estado(page); if (!e?.travado) return; await apertarA(page); } }
const relatorio = [];
const reg = (id, ok, nota) => { relatorio.push({ id, ok, nota }); console.log(`${ok === null ? 'N/T  ' : ok ? 'OK   ' : 'FALHA'} ${id} ${nota}`); };

for (const s of SOBRINHOS) {
  console.log(`\n=== ${s.nome} ===`);
  try {
    await page.goto(url); await dormir(2000);
    await apertarA(page); await dormir(200); // Começar
    for (let i = 0; i < s.direitas; i++) await pressionar('ArrowRight', 120);
    await apertarA(page); await dormir(300); // confirma o sobrinho
    for (let i = 0; i < 6; i++) await apertarA(page); // introdução
    await dormir(400);
    await fecharTudo();
    const e0 = await estado(page);
    reg(`${s.nome}-hall`, e0?.mapa === 'hall', `hall | ${await pos()}`);
    // P8: vai ao lado de baixo, vira, abre o painel
    const p8 = objeto('hall', 'porta', 'P8');
    const lado = ladosDe('hall', 'porta', 'P8').find((l) => l.y === p8.y + 1) ?? ladosDe('hall', 'porta', 'P8')[0];
    await irPara(page, 'hall', lado.x, lado.y);
    const e1 = await estado(page);
    await pressionar(seta[`${Math.sign(p8.x - e1.tileX)},${Math.sign(p8.y - e1.tileY)}`], 60);
    await apertarA(page); await dormir(300);
    for (const ch of s.codigo) await pressionar(ch, 80);
    await pressionar('Enter', 80);
    await dormir(500);
    await limparTextos(page);
    await fecharTudo();
    await esperarFade(page).catch(() => null);
    await dormir(400);
    const sala = await estado(page);
    reg(`${s.nome}-porta-P8`, sala?.mapa === 'sala', `código ${s.codigo.join('')} leva à Sala | ${await pos()}`);
    if (sala?.mapa !== 'sala') continue;
    // interruptor
    await irPara(page, 'sala', 6, 6);
    const inter = objeto('sala', 'interruptor');
    const lados = ladosDe('sala', 'interruptor');
    const lI = lados.find((l) => l.y === inter.y + 1) ?? lados[0];
    await irPara(page, 'sala', lI.x, lI.y);
    const eI = await estado(page);
    await pressionar(seta[`${Math.sign(inter.x - eI.tileX)},${Math.sign(inter.y - eI.tileY)}`], 60);
    await apertarA(page); await dormir(400);
    let t = juntar(await lerTextos(page));
    for (let i = 0; i < 4 && !t.includes('Parabéns'); i++) { await apertarA(page); await dormir(200); t = juntar(await lerTextos(page)); }
    reg(`${s.nome}-luzes`, t.includes('Parabéns, você conseguiu acender as luzes.'), `conquista das luzes | "${t.slice(0, 80)}"`);
    await apertarA(page); await dormir(400); // Continuar: condução
    const c0 = await estado(page);
    reg(`${s.nome}-conducao`, c0?.emConducao === true, `condução começou | ${await pos()}`);
    let e2 = null;
    for (let i = 0; i < 60; i++) { await dormir(150); e2 = await estado(page); if (!e2?.emConducao) break; }
    await dormir(300);
    reg(`${s.nome}-chegada`, e2?.tileX === 3 && e2?.tileY === 7 && e2?.direcao === 'baixo', `chegou em (3,7) olhando para baixo | ${await pos()}`);
    await capturar(page, `r14-${s.nome}-chegada`, 3);
    await fecharTudo();
    await dormir(400);
    await capturar(page, `r14-${s.nome}-chegada-sem-dialogo`, 3);
    // árvore de pé em (3,8): examinar a partir de (3,7) e andar a (4,7)/(4,8) para ver a copa
    const tAntes = juntar(await lerTextos(page));
    await apertarA(page); await dormir(300);
    await capturar(page, `r14-${s.nome}-examinar-3-7`, 3);
    await fecharTudo();
    await irPara(page, 'sala', 4, 7).catch((e) => console.log('   sem rota (4,7):', e.message.slice(0, 80)));
    await dormir(200);
    await capturar(page, `r14-${s.nome}-em-4-7`, 3);
    await irPara(page, 'sala', 4, 8).catch((e) => console.log('   sem rota (4,8):', e.message.slice(0, 80)));
    await dormir(200);
    await capturar(page, `r14-${s.nome}-em-4-8`, 3);
    console.log(`   ${s.nome} texto antes do exame: "${tAntes.slice(0, 60)}" | ${await pos()}`);
  } catch (e) {
    reg(`${s.nome}-exceção`, false, e.message.slice(0, 200));
  }
}
console.log(`\nerros de console/página: ${erros.length}`);
if (erros.length) console.log(erros.slice(0, 5).join('\n'));
await browser.close();
