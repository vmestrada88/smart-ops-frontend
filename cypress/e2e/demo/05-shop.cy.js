/**
 * DEMO 05 — Shop & Product Catalog
 * Muestra el catálogo de productos público y la tienda de recomendaciones (Amazon).
 * Video: cypress/videos/05-shop.mp4
 */

describe('Demo 05 — Shop & Product Catalog', () => {
  it('browses the public product catalog', () => {
    // ── Catálogo de productos ────────────────────────────────────────────────
    cy.visit('/products');
    cy.demoPause(1200);

    // Esperar a que carguen los productos
    cy.get('body').should('be.visible');
    cy.demoPause(1000);

    // Scroll fluido por el catálogo
    cy.scrollTo('bottom', { duration: 3000 });
    cy.demoPause(1000);
    cy.scrollTo('top', { duration: 1500 });
    cy.demoPause(800);

    // Hover sobre el primer producto si hay cards
    cy.get('[data-testid="product-list"] > *, .product-card, article')
      .first()
      .then(($el) => {
        if ($el.length) {
          cy.wrap($el).trigger('mouseover');
          cy.demoPause(800);
        }
      });
  });

  it('browses the shop and Amazon CTA', () => {
    // ── Shop (recomendaciones → Amazon) ─────────────────────────────────────
    cy.visit('/shop');
    cy.demoPause(1200);

    cy.get('body').should('be.visible');
    cy.demoPause(1000);

    cy.scrollTo('bottom', { duration: 2500 });
    cy.demoPause(1000);
    cy.scrollTo('top', { duration: 1000 });
    cy.demoPause(600);

    cy.get('[data-testid="shop-product-card"]')
      .first()
      .then(($card) => {
        if ($card.length) {
          cy.wrap($card).within(() => {
            cy.contains('a', /view on amazon/i).first().should('have.attr', 'target', '_blank');
            cy.contains('a', /view on amazon/i).first().should('have.attr', 'rel', 'nofollow sponsored');
          });
          cy.demoPause(1000);
        }
      });

    cy.contains('As an Amazon Associate').should('be.visible');
    cy.demoPause(800);
  });
});
