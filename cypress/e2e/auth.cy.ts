describe('Authentication Flow', () => {
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    displayName: 'Test User'
  };

  describe('Registration', () => {
    beforeEach(() => {
      cy.interceptAPI('POST', '/api/auth/register', {
        user: { ...testUser, _id: '123' },
        token: 'fake-jwt-token'
      });
    });

    it('should register a new user', () => {
      cy.visit('/register');
      
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="email"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('input[name="displayName"]').type(testUser.displayName);
      
      cy.get('button[type="submit"]').click();
      
      cy.wait('@postapiauthregister');
      cy.url().should('include', '/dashboard');
    });

    it('should show validation errors', () => {
      cy.visit('/register');
      
      cy.get('button[type="submit"]').click();
      
      cy.contains('Username is required').should('be.visible');
      cy.contains('Email is required').should('be.visible');
      cy.contains('Password is required').should('be.visible');
    });

    it('should validate email format', () => {
      cy.visit('/register');
      
      cy.get('input[name="email"]').type('invalid-email');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Invalid email format').should('be.visible');
    });

    it('should validate password length', () => {
      cy.visit('/register');
      
      cy.get('input[name="password"]').type('12345');
      cy.get('button[type="submit"]').click();
      
      cy.contains('Password must be at least 6 characters').should('be.visible');
    });

    it('should handle duplicate username error', () => {
      cy.interceptAPI('POST', '/api/auth/register', {
        statusCode: 400,
        body: { error: 'Username already taken' }
      });
      
      cy.register(testUser);
      
      cy.contains('Username already taken').should('be.visible');
    });
  });

  describe('Login', () => {
    beforeEach(() => {
      cy.interceptAPI('POST', '/api/auth/login', {
        user: { ...testUser, _id: '123' },
        token: 'fake-jwt-token'
      });
    });

    it('should login with username', () => {
      cy.visit('/login');
      
      cy.get('input[name="username"]').type(testUser.username);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.wait('@postapiauthlogin');
      cy.url().should('include', '/dashboard');
    });

    it('should login with email', () => {
      cy.visit('/login');
      
      cy.get('input[name="username"]').type(testUser.email);
      cy.get('input[name="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      cy.wait('@postapiauthlogin');
      cy.url().should('include', '/dashboard');
    });

    it('should show error for invalid credentials', () => {
      cy.interceptAPI('POST', '/api/auth/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' }
      });
      
      cy.login('wronguser', 'wrongpass');
      
      cy.contains('Invalid credentials').should('be.visible');
    });

    it('should redirect to intended page after login', () => {
      cy.visit('/profile');
      cy.url().should('include', '/login');
      
      cy.login(testUser.username, testUser.password);
      
      cy.url().should('include', '/profile');
    });
  });

  describe('Protected Routes', () => {
    it('should redirect to login when not authenticated', () => {
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
      
      cy.visit('/profile');
      cy.url().should('include', '/login');
      
      cy.visit('/settings');
      cy.url().should('include', '/login');
    });

    it('should access protected routes when authenticated', () => {
      cy.interceptAPI('GET', '/api/auth/me', {
        user: testUser
      });
      
      window.localStorage.setItem('token', 'fake-jwt-token');
      
      cy.visit('/dashboard');
      cy.url().should('include', '/dashboard');
      cy.contains('Dashboard').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      window.localStorage.setItem('token', 'fake-jwt-token');
      cy.interceptAPI('GET', '/api/auth/me', {
        user: testUser
      });
    });

    it('should logout successfully', () => {
      cy.visit('/dashboard');
      
      cy.get('button[aria-label="Logout"]').click();
      
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.window().its('localStorage.token').should('be.undefined');
    });

    it('should clear user data on logout', () => {
      cy.visit('/dashboard');
      
      cy.get('button[aria-label="Logout"]').click();
      
      cy.visit('/dashboard');
      cy.url().should('include', '/login');
    });
  });
});