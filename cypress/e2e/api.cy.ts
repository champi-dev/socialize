describe('API Health Check', () => {
  it('should return OK status', () => {
    cy.request('GET', '/api/health').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'OK');
      expect(response.body).to.have.property('timestamp');
      expect(new Date(response.body.timestamp)).to.be.instanceOf(Date);
    });
  });

  it('should handle CORS headers', () => {
    cy.request({
      method: 'OPTIONS',
      url: '/api/health',
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': 'GET'
      }
    }).then((response) => {
      expect(response.headers).to.have.property('access-control-allow-origin');
    });
  });
});

describe('API Error Handling', () => {
  it('should return 404 for unknown endpoints', () => {
    cy.request({
      method: 'GET',
      url: '/api/nonexistent',
      failOnStatusCode: false
    }).then((response) => {
      expect(response.status).to.eq(404);
    });
  });

  it('should handle rate limiting', () => {
    const requests = Array(101).fill(null).map(() => 
      cy.request({
        method: 'GET',
        url: '/api/health',
        failOnStatusCode: false
      })
    );

    cy.wrap(Promise.all(requests)).then((responses) => {
      const rateLimited = responses.some(r => r.status === 429);
      expect(rateLimited).to.be.true;
    });
  });
});

describe('WebSocket Connection', () => {
  it('should establish socket connection', () => {
    cy.visit('/');
    
    cy.window().then((win) => {
      const socket = (win as any).io?.();
      
      cy.wrap(new Promise((resolve) => {
        socket.on('connect', () => {
          resolve(socket.connected);
        });
      })).should('eq', true);
      
      socket.disconnect();
    });
  });
});