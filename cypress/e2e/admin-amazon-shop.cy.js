/**
 * E2E — Admin: Amazon shop listings
 *
 * Access control (unauthenticated / non-admin are blocked) plus the full CRUD
 * loop over the admin listings table: list, create, edit, delete, and the
 * "Import from Amazon link" flow. The API is stubbed with an in-memory array
 * so the tests run deterministically without touching the database.
 *
 * Note: intercepts are registered inside each test (not in beforeEach) because
 * intercepts registered from beforeEach hang the run in headless mode.
 */

const INITIAL = [
  {
    id: 1,
    name: 'Blink Mini Camera',
    description: 'Compact indoor security camera',
    category: 'Security',
    amazonAffiliateUrl: 'https://www.amazon.com/dp/B08D2F4S9Z?tag=smartsolution-20',
    imageUrls: ['https://m.media-amazon.com/images/I/51q8yCxHzxL._AC_SL1500_.jpg'],
    isPublished: true,
    displayOrder: 1,
  },
  {
    id: 2,
    name: 'Echo Dot (5th Gen)',
    description: 'Smart speaker with Alexa',
    category: 'Smart Home',
    amazonAffiliateUrl: 'https://www.amazon.com/dp/B09B8V1LZ3?tag=smartsolution-20',
    imageUrls: [],
    isPublished: false,
    displayOrder: 2,
  },
];

describe('Admin — Amazon shop listings (access control)', () => {
  it('redirects unauthenticated users to /login', () => {
    cy.visit('/admin/amazon-shop');
    cy.url().should('include', '/login');
  });

  it('blocks non-admin users from the route', () => {
    cy.loginAsClient();
    cy.visit('/admin/amazon-shop');
    cy.url().should('not.include', '/admin/amazon-shop');
  });
});

describe('Admin — Amazon shop listings (CRUD)', () => {
  const setupShopApi = () => {
    let rows = INITIAL.map((r) => ({ ...r, imageUrls: [...r.imageUrls] }));
    let nextId = 100;
    const createdBodies = [];
    const updatedBodies = [];
    const deletedIds = [];
    const importedBodies = [];

    cy.intercept('GET', '**/shop/amazon-listings/admin/all', (req) => req.reply(rows));
    cy.intercept('PUT', '**/shop/amazon-listings/*', (req) => {
      const id = Number(req.url.split('/').pop());
      const body = req.body;
      updatedBodies.push(body);
      rows = rows.map((r) =>
        r.id === id ? { ...r, ...body, imageUrls: body.imageUrl ? [body.imageUrl] : r.imageUrls } : r
      );
      req.reply(rows.find((r) => r.id === id));
    });
    cy.intercept('DELETE', '**/shop/amazon-listings/*', (req) => {
      const id = Number(req.url.split('/').pop());
      deletedIds.push(id);
      rows = rows.filter((r) => r.id !== id);
      req.reply({});
    });
    cy.intercept('POST', '**/shop/amazon-listings', (req) => {
      const body = req.body;
      createdBodies.push(body);
      const row = {
        id: nextId++,
        name: body.name,
        description: body.description,
        category: body.category,
        amazonAffiliateUrl: body.amazonAffiliateUrl,
        imageUrls: body.imageUrl ? [body.imageUrl] : [],
        isPublished: body.isPublished,
        displayOrder: body.displayOrder,
      };
      rows = [row, ...rows];
      req.reply(row);
    });
    cy.intercept('POST', '**/shop/amazon-listings/import-from-url', (req) => {
      const body = req.body;
      importedBodies.push(body);
      const row = {
        id: nextId++,
        name: 'Imported Smart Bulb',
        description: 'Pulled from the Amazon product page',
        category: body.category || null,
        amazonAffiliateUrl: body.url,
        imageUrls: ['https://m.media-amazon.com/images/I/61Imported._AC_SL1500_.jpg'],
        isPublished: body.isPublished,
        displayOrder: 99,
      };
      rows = [row, ...rows];
      req.reply(row);
    });

    return { createdBodies, updatedBodies, deletedIds, importedBodies };
  };

  it('lists existing listings with compliant outbound links', () => {
    setupShopApi();
    cy.loginAsAdmin();
    cy.visit('/admin/amazon-shop');

    cy.contains('h1', 'Amazon shop listings', { timeout: 15000 }).should('be.visible');
    cy.contains('td', 'Blink Mini Camera').should('be.visible');
    cy.contains('td', 'Echo Dot (5th Gen)').should('be.visible');

    cy.contains('td', 'Blink Mini Camera')
      .parent('tr')
      .within(() => {
        cy.contains('a', 'Open').should('have.attr', 'target', '_blank');
        cy.contains('a', 'Open').should('have.attr', 'rel', 'nofollow sponsored noreferrer');
        cy.contains('a', 'Open').should('have.attr', 'href').and('include', 'tag=');
        cy.contains('td', 'Yes').should('be.visible');
      });

    cy.contains('td', 'Echo Dot (5th Gen)').parent('tr').contains('td', 'No').should('be.visible');
  });

  it('creates a listing and shows it in the table', () => {
    const { createdBodies } = setupShopApi();
    cy.loginAsAdmin();
    cy.visit('/admin/amazon-shop');

    cy.get('[data-testid="amazon-shop-add"]', { timeout: 15000 }).click();
    cy.get('[data-testid="amazon-shop-title"]').type('Ring Video Doorbell');
    cy.get('[data-testid="amazon-shop-url"]').type('https://www.amazon.com/dp/B07WRKGQRZ?tag=smartsolution-20');
    cy.get('[data-testid="amazon-shop-category"]').type('Smart Home');
    cy.get('[data-testid="amazon-shop-description"]').type('HD video doorbell');
    cy.get('[data-testid="amazon-shop-image"]').type('https://m.media-amazon.com/images/I/51Ring.jpg');
    cy.get('[data-testid="amazon-shop-order"]').clear().type('5');
    cy.get('[data-testid="amazon-shop-submit"]').click();

    cy.contains('td', 'Ring Video Doorbell', { timeout: 15000 }).should('be.visible');

    cy.then(() => {
      expect(createdBodies).to.have.length(1);
      expect(createdBodies[0]).to.include({
        name: 'Ring Video Doorbell',
        category: 'Smart Home',
        description: 'HD video doorbell',
        amazonAffiliateUrl: 'https://www.amazon.com/dp/B07WRKGQRZ?tag=smartsolution-20',
        imageUrl: 'https://m.media-amazon.com/images/I/51Ring.jpg',
        isPublished: true,
        displayOrder: 5,
      });
    });
  });

  it('edits an existing listing with prefilled values', () => {
    const { updatedBodies } = setupShopApi();
    cy.loginAsAdmin();
    cy.visit('/admin/amazon-shop');

    cy.contains('td', 'Blink Mini Camera', { timeout: 15000 })
      .parent('tr')
      .contains('button', 'Edit')
      .click();

    cy.get('[data-testid="amazon-shop-title"]').should('have.value', 'Blink Mini Camera');
    cy.get('[data-testid="amazon-shop-url"]').should(
      'have.value',
      'https://www.amazon.com/dp/B08D2F4S9Z?tag=smartsolution-20'
    );

    cy.get('[data-testid="amazon-shop-title"]').clear().type('Blink Mini Gen 2');
    cy.get('[data-testid="amazon-shop-category"]').clear().type('Security Cameras');
    cy.get('[data-testid="amazon-shop-submit"]').click();

    cy.contains('td', 'Blink Mini Gen 2', { timeout: 15000 }).should('be.visible');

    cy.then(() => {
      expect(updatedBodies).to.have.length(1);
      expect(updatedBodies[0]).to.include({ name: 'Blink Mini Gen 2', category: 'Security Cameras' });
    });
  });

  it('deletes a listing after confirmation', () => {
    const { deletedIds } = setupShopApi();
    cy.loginAsAdmin();
    cy.visit('/admin/amazon-shop');

    cy.contains('td', 'Echo Dot (5th Gen)', { timeout: 15000 })
      .parent('tr')
      .contains('button', 'Delete')
      .click();
    cy.contains('td', 'Echo Dot (5th Gen)').should('not.exist');

    cy.then(() => {
      expect(deletedIds).to.deep.equal([2]);
    });
  });

  it('imports a card from an Amazon link', () => {
    const { importedBodies } = setupShopApi();
    cy.loginAsAdmin();
    cy.visit('/admin/amazon-shop');

    cy.get('[data-testid="amazon-shop-import"]', { timeout: 15000 }).click();
    cy.get('[data-testid="amazon-shop-import-url"]').type(
      'https://www.amazon.com/dp/B0B7XYZ?tag=smartsolution-20'
    );
    cy.get('[data-testid="amazon-shop-import-category"]').type('Smart Bulb');
    cy.get('[data-testid="amazon-shop-import-submit"]').click();

    cy.contains('[data-testid="shop-product-card"]', 'Imported Smart Bulb', {
      timeout: 15000,
    }).should('be.visible');
    cy.contains('td', 'Imported Smart Bulb').should('be.visible');

    cy.then(() => {
      expect(importedBodies).to.have.length(1);
      expect(importedBodies[0]).to.include({
        url: 'https://www.amazon.com/dp/B0B7XYZ?tag=smartsolution-20',
        category: 'Smart Bulb',
        isPublished: true,
      });
    });
  });
});
