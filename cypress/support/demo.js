/**
 * cypress/support/demo.js
 * Support file for demo recordings. Imports base commands and adds
 * demo-specific helpers (slow typing, pauses, login shortcut).
 */

import './e2e';           // base support file
import './commands';      // re-use existing custom commands

// ─── DEMO HELPERS ────────────────────────────────────────────────────────────

/**
 * cy.demoType(text, delay?)
 * Types text character by character with a visible delay (default 60ms).
 * Makes typing look natural in video recordings.
 */
Cypress.Commands.add('demoType', { prevSubject: 'element' }, (subject, text, delay = 60) => {
  cy.wrap(subject).clear().type(text, { delay });
});

/**
 * cy.demoPause(ms?)
 * Waits with a visible pause between steps (default 800ms).
 * Use it to give the viewer time to read the screen.
 */
Cypress.Commands.add('demoPause', (ms = 800) => {
  cy.wait(ms);
});

/**
 * cy.demoHover(selector)
 * Moves mouse to an element so hover effects are visible in the video.
 */
Cypress.Commands.add('demoHover', (selector) => {
  cy.get(selector).trigger('mouseover').trigger('mouseenter');
  cy.demoPause(400);
});

/**
 * cy.loginAsAdmin()
 * Logs in with the admin credentials and waits for the redirect.
 */
Cypress.Commands.add('loginAsAdmin', () => {
  cy.visit('/login');
  cy.demoPause(600);

  cy.get('input[type="email"], input[placeholder="Email"]')
    .should('be.visible')
    .demoType('victor@ss.com', 70);
  cy.demoPause(300);

  cy.get('input[type="password"], input[placeholder="Password"]')
    .should('be.visible')
    .demoType('Passw0rd!', 70);
  cy.demoPause(400);

  cy.get('button[type="submit"], button').contains(/login/i).click();

  // Wait until we're off the login page
  cy.url().should('not.include', '/login');
  cy.demoPause(1000);
});

/**
 * cy.demoScrollTo(selector)
 * Smoothly scrolls to an element, making the scroll visible in the video.
 */
Cypress.Commands.add('demoScrollTo', (selector) => {
  cy.get(selector).scrollIntoView({ behavior: 'smooth', block: 'center' });
  cy.demoPause(600);
});
