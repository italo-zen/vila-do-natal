/**
 * Gestos do navegador desligados (ADR-007 seção 11; GDD 18.5, regra 8). O CSS cuida de rolagem e de toque
 * (`touch-action`); aqui ficam as reservas em JS: menu de toque longo, pinça do iOS (eventos `gesture*`) e rolagem
 * quando `touch-action` não basta.
 */
export function instalarGestosDoNavegador(doc: Document): void {
  doc.addEventListener('contextmenu', (e) => e.preventDefault());
  for (const tipo of ['gesturestart', 'gesturechange', 'gestureend']) {
    doc.addEventListener(tipo, (e) => e.preventDefault());
  }
  // Só cancela o que o navegador deixa cancelar: em rolagem já iniciada, o evento não é cancelável (sem erro no console).
  doc.body.addEventListener('touchmove', (e) => {
    if (e.cancelable) e.preventDefault();
  }, { passive: false });
}
