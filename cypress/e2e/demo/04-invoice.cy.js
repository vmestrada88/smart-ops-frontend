/**
 * DEMO 04 — Invoice / Proposal Builder
 * Muestra cómo crear una propuesta/factura: agregar productos, ver totales.
 * Video: cypress/videos/04-invoice.mp4
 */

describe('Demo 04 — Invoice & Proposal Builder', () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it('creates an invoice by adding products', () => {
    // ── Ir a la página de facturas / invoice ─────────────────────────────────
    cy.visit('/invoices');
    cy.demoPause(1200);

    // Si hay botón de nueva factura, click en él
    cy.contains('button, a', /new|create|nueva|agregar|add/i)
      .first()
      .then(($btn) => {
        if ($btn.length) {
          cy.wrap($btn).click();
          cy.demoPause(1000);
        } else {
          // Si la página es directamente el builder, continuar
          cy.demoPause(500);
        }
      });

    // ── Products/Invoice builder ─────────────────────────────────────────────
    cy.visit('/invoice');
    cy.demoPause(1200);

    // Esperar que carguen los productos disponibles
    cy.get('body').should('be.visible');
    cy.demoPause(1000);

    // Scroll por la lista de productos disponibles
    cy.scrollTo('bottom', { duration: 2500 });
    cy.demoPause(800);
    cy.scrollTo('top', { duration: 1000 });
    cy.demoPause(600);

    // Agregar el primer producto disponible
    cy.get('button').contains(/\+ add|agregar/i)
      .first()
      .should('be.visible')
      .click();
    cy.demoPause(1000);

    // Agregar un segundo producto
    cy.get('button').contains(/\+ add|agregar/i)
      .eq(1)
      .should('be.visible')
      .click();
    cy.demoPause(800);

    // ── Mostrar tabla de invoice con totales ─────────────────────────────────
    cy.get('table, [data-cy*="invoice"]').first().scrollIntoView();
    cy.demoPause(1200);

    // Incrementar cantidad del primer item
    cy.get('tbody tr').first().find('button').contains('+').click();
    cy.demoPause(600);
    cy.get('tbody tr').first().find('button').contains('+').click();
    cy.demoPause(800);

    // Mostrar el total actualizado
    cy.get('tfoot, [data-cy*="total"]').scrollIntoView();
    cy.demoPause(1500);
  });
});
