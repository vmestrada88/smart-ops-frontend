const { defineConfig } = require('cypress');

/**
 * Cypress Demo Config
 * Usado exclusivamente para grabar demos en video de las interfaces.
 * Ejecutar con: npm run demo
 * Los videos se guardan en: cypress/videos/
 */
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/demo/**/*.cy.js',
    supportFile: 'cypress/support/demo.js',
    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots/demo',

    // Video settings
    video: true,
    videoCompression: 32,        // 0=máxima calidad, 51=mínima (32 es buen balance)

    // Viewport para demos (se ve bien en presentaciones)
    viewportWidth: 1440,
    viewportHeight: 900,

    // Timeouts generosos para que la UI tenga tiempo de animar
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000,

    // Esperar animaciones para que el video se vea fluido
    waitForAnimations: true,
    animationDistanceThreshold: 5,

    screenshotOnRunFailure: false,  // No interrumpir el flow del demo

    setupNodeEvents(on, config) {
      // No extra setup needed — Cypress names videos after the spec file automatically
    },
  },
});
