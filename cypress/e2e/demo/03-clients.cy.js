/**
 * DEMO 03 — Clients Management
 * Muestra el módulo de clientes: listar, buscar, ver detalle.
 * Video: cypress/videos/03-clients.mp4
 */

describe('Demo 03 — Clients Management', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('browses the clients module', () => {
    // ── Navegar a clientes ───────────────────────────────────────────────────
    cy.visit('/clients');
    cy.demoPause(1200);

    // Título de página visible
    cy.contains(/clients/i).should('be.visible');
    cy.demoPause(800);

    // ── Lista de clientes ────────────────────────────────────────────────────
    // Scroll suave por la lista para mostrar clientes
    cy.scrollTo('bottom', { duration: 2500 });
    cy.demoPause(800);
    cy.scrollTo('top', { duration: 1500 });
    cy.demoPause(800);

    // ── Buscar un cliente ────────────────────────────────────────────────────
    // Si hay campo de búsqueda, escribir en él
    cy.get('input[placeholder*="search" i], input[placeholder*="buscar" i], input[type="search"]')
      .first()
      .then(($el) => {
        if ($el.length) {
          cy.wrap($el).demoType('vic', 80);
          cy.demoPause(1000);
          cy.wrap($el).clear();
          cy.demoPause(500);
        }
      });

    // ── Abrir detalle de primer cliente ─────────────────────────────────────
    cy.get('li, tr, [data-cy*="client"]')
      .first()
      .should('be.visible')
      .click();
    cy.demoPause(1500);

    // Mostrar detalle
    cy.scrollTo('bottom', { duration: 2000 });
    cy.demoPause(1000);
    cy.scrollTo('top', { duration: 1000 });
    cy.demoPause(800);
  });
});
