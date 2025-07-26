import '@cypress/code-coverage/support';

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      register(userData: {
        username: string;
        email: string;
        password: string;
        displayName?: string;
      }): Chainable<void>;
      interceptAPI(method: string, url: string, response: any): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[name="username"]').type(username);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  cy.get('input[name="username"]').type(userData.username);
  cy.get('input[name="email"]').type(userData.email);
  cy.get('input[name="password"]').type(userData.password);
  if (userData.displayName) {
    cy.get('input[name="displayName"]').type(userData.displayName);
  }
  cy.get('button[type="submit"]').click();
});

Cypress.Commands.add('interceptAPI', (method: string, url: string, response: any) => {
  cy.intercept(method, url, response).as(`${method.toLowerCase()}${url.replace(/\//g, '')}`);
});

beforeEach(() => {
  cy.intercept('GET', '/api/health', { status: 'OK' }).as('healthCheck');
});