/**
 * DEMO 01 — Landing Page
 * Muestra la página pública: hero, servicios, navegación, modal de contacto.
 * Video: cypress/videos/01-landing.mp4
 */

describe('Demo 01 — Landing Page', () => {
  it('tours the public landing page', () => {
    // ── Abrir home ──────────────────────────────────────────────────────────
    cy.visit('/');
    cy.demoPause(1200);

    // Logo y hero visible
    cy.get('img[alt="Smart Solution Logo"]').should('be.visible');
    cy.demoPause(600);

    // Título principal
    cy.contains('Smart Solution for Living').should('be.visible');
    cy.demoPause(800);

    // Botón Contact Us
    cy.contains('button', 'Contact Us').should('be.visible');
    cy.demoPause(600);

    // ── Scroll a Servicios ───────────────────────────────────────────────────
    cy.contains('Services').scrollIntoView({ behavior: 'smooth' });
    cy.demoPause(1000);

    // ── Navegar a Products ───────────────────────────────────────────────────
    cy.contains('a, button, nav *', /products/i).first().click();
    cy.url().should('include', '/products');
    cy.demoPause(1500);

    // Volver al home
    cy.contains('a, nav *', /home/i).first().click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
    cy.demoPause(800);

    // ── Abrir modal de contacto ──────────────────────────────────────────────
    cy.contains('button', 'Contact Us').click();
    cy.demoPause(1000);

    // Modal visible
    cy.get('[data-cy="contact-modal"]').should('be.visible');
    cy.demoPause(1500);

    // Cerrar modal (Esc o botón de cierre)
    cy.get('body').type('{esc}');
    cy.demoPause(800);
  });
});
