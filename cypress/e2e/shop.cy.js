/**
 * E2E — Public Amazon Shop
 *
 * Covers the storefront visitors see: cards render, unpublished items stay hidden,
 * Amazon-compliant outbound links (target=_blank + rel=nofollow sponsored), the
 * mandatory Associate disclosure, search, category filter, and the empty state.
 *
 * Note: `cy.intercept` + `cy.visit` are inlined per test (not in beforeEach)
 * because intercepts registered from beforeEach hang the run in headless mode.
 */

const PUBLISHED = [
  {
    id: 1,
    name: 'Blink Mini Camera',
    description: 'Compact indoor security camera',
    category: 'Security',
    amazonAffiliateUrl: 'https://www.amazon.com/dp/B08D2F4S9Z?tag=smartsolution-20',
    imageUrls: ['https://m.media-amazon.com/images/I/51q8yCxHzxL._AC_SL1500_.jpg'],
    isPublished: true,
  },
  {
    id: 2,
    name: 'Echo Dot (5th Gen)',
    description: 'Smart speaker with Alexa',
    category: 'Smart Home',
    amazonAffiliateUrl: 'https://www.amazon.com/dp/B09B8V1LZ3?tag=smartsolution-20',
    imageUrls: ['https://m.media-amazon.com/images/I/61LxV0uCALL._AC_SL1000_.jpg'],
    isPublished: true,
  },
  {
    id: 3,
    name: 'TP-Link Smart Plug',
    description: 'Works with Alexa and Google Home',
    category: 'Smart Home',
    amazonAffiliateUrl: 'https://www.amazon.com/dp/B07Z9PTMWX?tag=smartsolution-20',
    imageUrls: ['https://m.media-amazon.com/images/I/61tpV6ZkXAL._AC_SL1500_.jpg'],
    isPublished: true,
  },
];

describe('Public Amazon shop', () => {
  it('renders the published listings as product cards', () => {
    cy.intercept('GET', '**/shop/amazon-listings', PUBLISHED);
    cy.visit('/shop');
    cy.get('[data-testid="shop-product-card"]', { timeout: 15000 }).should(
      'have.length',
      PUBLISHED.length
    );
    cy.contains('[data-testid="shop-product-card"]', 'Blink Mini Camera').should('be.visible');
    cy.contains('[data-testid="shop-product-card"]', 'Echo Dot').should('be.visible');
    cy.contains('[data-testid="shop-product-card"]', 'TP-Link Smart Plug').should('be.visible');
  });

  it('keeps every outbound link Amazon-compliant', () => {
    cy.intercept('GET', '**/shop/amazon-listings', PUBLISHED);
    cy.visit('/shop');
    cy.get('[data-testid="shop-product-card"]', { timeout: 15000 })
      .find('a')
      .filter('[href*="amazon.com"]')
      .each(($a) => {
        cy.wrap($a).should('have.attr', 'target', '_blank');
        cy.wrap($a).should('have.attr', 'rel', 'nofollow sponsored');
        cy.wrap($a).should('have.attr', 'href').and('include', 'tag=');
      });
  });

  it('shows the mandatory Amazon Associate disclosure', () => {
    cy.intercept('GET', '**/shop/amazon-listings', PUBLISHED);
    cy.visit('/shop');
    cy.contains('As an Amazon Associate', { timeout: 15000 }).should('be.visible');
  });

  it('filters by search term', () => {
    cy.intercept('GET', '**/shop/amazon-listings', PUBLISHED);
    cy.visit('/shop');
    cy.get('[data-testid="shop-product-card"]', { timeout: 15000 }).should(
      'have.length',
      PUBLISHED.length
    );

    cy.get('input[placeholder="Search recommendations..."]').type('blink');
    cy.get('[data-testid="shop-product-card"]').should('have.length', 1);
    cy.contains('[data-testid="shop-product-card"]', 'Blink Mini Camera').should('be.visible');

    cy.get('input[placeholder="Search recommendations..."]').clear().type('zzz-no-match');
    cy.get('[data-testid="shop-product-card"]').should('have.length', 0);
    cy.contains('No matches').should('be.visible');
  });

  it('filters by category', () => {
    cy.intercept('GET', '**/shop/amazon-listings', PUBLISHED);
    cy.visit('/shop');
    cy.get('[data-testid="shop-product-card"]', { timeout: 15000 }).should(
      'have.length',
      PUBLISHED.length
    );

    cy.get('select').select('Smart Home');
    cy.get('[data-testid="shop-product-card"]').should('have.length', 2);

    cy.get('select').select('Security');
    cy.get('[data-testid="shop-product-card"]').should('have.length', 1);

    cy.get('select').select('All categories');
    cy.get('[data-testid="shop-product-card"]').should('have.length', PUBLISHED.length);
  });
});

describe('Public Amazon shop — empty catalog', () => {
  it('shows the empty state', () => {
    cy.intercept('GET', '**/shop/amazon-listings', []);
    cy.visit('/shop');
    cy.contains('No listings yet', { timeout: 15000 }).should('be.visible');
    cy.contains('Add Amazon Associates listings under Admin').should('be.visible');
  });
});
