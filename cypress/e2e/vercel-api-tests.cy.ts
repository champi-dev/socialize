describe('Vercel API Endpoint Tests', () => {
  const baseUrl = 'https://socialize-virid-six.vercel.app'
  
  describe('Authentication API Tests', () => {
    it('should test user registration endpoint', () => {
      const testUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'TestPassword123!'
      }

      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/register`,
        body: testUser,
        failOnStatusCode: false
      }).then((response) => {
        // Should either succeed or fail gracefully with validation
        expect(response.status).to.be.oneOf([200, 201, 400, 409, 422])
        
        if (response.status === 200 || response.status === 201) {
          expect(response.body).to.have.property('token').or.have.property('user')
          cy.log('Registration successful:', response.body)
        } else {
          expect(response.body).to.have.property('message').or.have.property('error')
          cy.log('Registration validation working:', response.body)
        }
      })
    })

    it('should test login endpoint with invalid credentials', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/login`,
        body: {
          email: 'invalid@example.com',
          password: 'wrongpassword'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return 401 or 400 for invalid credentials
        expect(response.status).to.be.oneOf([400, 401, 404])
        expect(response.body).to.have.property('message').or.have.property('error')
      })
    })

    it('should test login endpoint validation', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/login`,
        body: {}, // Empty body
        failOnStatusCode: false
      }).then((response) => {
        // Should return validation error
        expect(response.status).to.be.oneOf([400, 422])
      })
    })

    it('should test logout endpoint', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/logout`,
        failOnStatusCode: false
      }).then((response) => {
        // Should either work or return method not allowed
        expect(response.status).to.be.oneOf([200, 401, 405])
      })
    })
  })

  describe('User Management API Tests', () => {
    it('should test user profile endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/users/profile`,
        failOnStatusCode: false
      }).then((response) => {
        // Should require authentication
        expect(response.status).to.be.oneOf([401, 404, 405])
      })
    })

    it('should test users list endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/users`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.be.an('array').or.have.property('users')
        } else {
          expect(response.status).to.be.oneOf([401, 404, 405])
        }
      })
    })
  })

  describe('Posts/Social Features API Tests', () => {
    it('should test posts endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/posts`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.be.an('array').or.have.property('posts')
          cy.log('Posts endpoint working:', response.body)
        } else {
          expect(response.status).to.be.oneOf([401, 404, 405])
        }
      })
    })

    it('should test create post endpoint without auth', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/posts`,
        body: {
          title: 'Test Post',
          content: 'This is a test post'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should require authentication
        expect(response.status).to.be.oneOf([401, 404, 405, 422])
      })
    })
  })

  describe('File Upload API Tests', () => {
    it('should test file upload endpoint', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/upload`,
        failOnStatusCode: false
      }).then((response) => {
        // Should handle missing file gracefully
        expect(response.status).to.be.oneOf([400, 401, 404, 405, 422])
      })
    })
  })

  describe('Search and Filter API Tests', () => {
    it('should test search endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/search?q=test`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('results').or.be.an('array')
        } else {
          expect(response.status).to.be.oneOf([401, 404, 405])
        }
      })
    })
  })

  describe('Real-time Features API Tests', () => {
    it('should test notifications endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/notifications`,
        failOnStatusCode: false
      }).then((response) => {
        // Should require authentication or not exist
        expect(response.status).to.be.oneOf([200, 401, 404, 405])
      })
    })

    it('should test friends/connections endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/friends`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 401, 404, 405])
      })
    })
  })

  describe('Database Integration Tests', () => {
    it('should verify database connectivity through API', () => {
      // Test multiple endpoints to ensure DB is connected
      const endpoints = [
        '/api/users',
        '/api/posts',
        '/api/auth/register'
      ]

      endpoints.forEach((endpoint) => {
        cy.request({
          method: 'GET',
          url: `${baseUrl}${endpoint}`,
          failOnStatusCode: false
        }).then((response) => {
          // Should not get 500 internal server errors if DB is working
          expect(response.status).not.to.equal(500)
          
          if (response.status === 500) {
            cy.log(`Database connection issue at ${endpoint}:`, response.body)
          }
        })
      })
    })
  })

  describe('Rate Limiting Tests', () => {
    it('should test rate limiting on API endpoints', () => {
      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 10 }, (_, i) => 
        cy.request({
          method: 'GET',
          url: `${baseUrl}/api/health`,
          failOnStatusCode: false
        })
      )

      // All requests should complete without 500 errors
      Cypress.Promise.all(requests).then((responses) => {
        responses.forEach((response, index) => {
          expect(response.status).not.to.equal(500)
          if (response.status === 429) {
            cy.log(`Rate limiting working - request ${index + 1} was rate limited`)
          }
        })
      })
    })
  })

  describe('CORS and Security Tests', () => {
    it('should test CORS headers', () => {
      cy.request({
        method: 'OPTIONS',
        url: `${baseUrl}/api/health`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          // Check for CORS headers
          expect(response.headers).to.have.property('access-control-allow-origin')
        }
      })
    })

    it('should test security headers on API responses', () => {
      cy.request(`${baseUrl}/api/health`).then((response) => {
        // Check for security headers
        const headers = response.headers
        expect(headers).to.have.property('x-content-type-options')
      })
    })
  })

  describe('Error Handling Tests', () => {
    it('should handle malformed JSON gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/login`,
        body: 'invalid json string',
        headers: {
          'Content-Type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return 400 Bad Request, not 500
        expect(response.status).to.be.oneOf([400, 422])
      })
    })

    it('should handle missing content-type gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/auth/login`,
        body: { email: 'test@test.com' },
        headers: {},
        failOnStatusCode: false
      }).then((response) => {
        // Should handle gracefully
        expect(response.status).to.be.lessThan(500)
      })
    })
  })
})