describe('Home Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('loads successfully', () => {
    cy.contains('Welcome to Socialize').should('be.visible');
  });

  it('displays the main heading', () => {
    cy.get('h1').should('contain', 'Welcome to Socialize');
    cy.get('h1').should('have.class', 'text-4xl');
  });

  it('displays the tagline', () => {
    cy.contains('Connect, share, and engage with your community').should('be.visible');
    cy.get('p').should('have.class', 'text-gray-600');
  });

  it('has functional Get Started button', () => {
    cy.get('button').contains('Get Started').should('be.visible');
    cy.get('button').contains('Get Started').should('have.class', 'bg-primary-600');
    cy.get('button').contains('Get Started').click();
  });

  it('has functional Learn More button', () => {
    cy.get('button').contains('Learn More').should('be.visible');
    cy.get('button').contains('Learn More').should('have.class', 'border-gray-300');
    cy.get('button').contains('Learn More').click();
  });

  it('has proper responsive layout', () => {
    cy.viewport('iphone-x');
    cy.get('main').should('have.class', 'p-24');
    
    cy.viewport('ipad-2');
    cy.get('main').should('have.class', 'p-24');
    
    cy.viewport(1920, 1080);
    cy.get('main').should('have.class', 'p-24');
  });

  it('buttons have hover effects', () => {
    cy.get('button').contains('Get Started').trigger('mouseover');
    cy.get('button').contains('Learn More').trigger('mouseover');
  });

  it('has correct meta title', () => {
    cy.title().should('eq', 'Socialize - Connect with Friends');
  });

  it('has centered content', () => {
    cy.get('main').should('have.class', 'items-center');
    cy.get('main').should('have.class', 'justify-center');
    cy.get('h1').should('have.class', 'text-center');
    cy.get('p').first().should('have.class', 'text-center');
  });

  it('buttons are properly spaced', () => {
    cy.get('.flex.gap-4').should('exist');
    cy.get('.flex.gap-4').children('button').should('have.length', 2);
  });
});