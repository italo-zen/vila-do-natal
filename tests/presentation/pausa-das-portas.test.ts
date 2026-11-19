import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, it } from 'vitest';

/** P3 do QA (1.3.0): depois de uma travessia, as portas ignoram o andar contra por 450 ms a partir do fim do fade. */
it('CasaScene: o andar contra a porta espera 450 ms depois do fade; o movimento e o A de frente não passam por essa espera', () => {
  const t = readFileSync(join(__dirname, '..', '..', 'src', 'presentation', 'scenes', 'CasaScene.ts'), 'utf-8');
  expect(t).toMatch(/PAUSA_DAS_PORTAS_APOS_TRAVESSIA_MS = 450/);
  const metodo = t.slice(t.indexOf('private andouContraUmaPorta'), t.indexOf('private andarAnimado'));
  expect(metodo).toMatch(/this\.time\.now < this\.portasIgnoramAte/);
  expect(metodo).toMatch(/this\.portasAguardamSoltar/);
  expect(t).toMatch(/this\.portasIgnoramAte = this\.time\.now \+ PAUSA_DAS_PORTAS_APOS_TRAVESSIA_MS/);
});
