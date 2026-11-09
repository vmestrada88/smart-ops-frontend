/**
 * DEMO 02 — Login & Admin Dashboard
 * Muestra el proceso de login y el dashboard administrativo con sus stats.
 * Video: cypress/videos/02-login-dashboard.mp4
 */

describe('Demo 02 — Login & Admin Dashboard', () => {
  it('logs in and explores the admin dashboard', () => {
    // ── Página de login ──────────────────────────────────────────────────────
    cy.visit('/login');
    cy.demoPause(1000);

    // Mostrar el formulario limpio antes de escribir
    cy.get('input[type="email"], input[placeholder="Email"]').should('be.visible');
    cy.demoPause(600);

    // Escribir email lentamente
    cy.get('input[type="email"], input[placeholder="Email"]').demoType('victor@ss.com');
    cy.demoPause(500);

    // Escribir password lentamente
    cy.get('input[type="password"], input[placeholder="Password"]').demoType('Passw0rd!');
    cy.demoPause(600);

    // Click Login
    cy.get('button[type="submit"], button').contains(/login/i).click();
    cy.demoPause(1500);

    // ── Dashboard Admin ──────────────────────────────────────────────────────
    cy.url().should('not.include', '/login');
    cy.demoPause(1000);

    // Scroll para mostrar las métricas/stats
    cy.get('body').scrollTo('top');
    cy.demoPause(800);

    cy.scrollTo('bottom', { duration: 2000 });
    cy.demoPause(1000);

    cy.scrollTo('top', { duration: 1500 });
    cy.demoPause(800);
  });
});
