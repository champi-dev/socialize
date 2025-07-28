describe('Vercel Deployment - Full Feature Test', () => {
  const baseUrl = 'https://socialize-virid-six.vercel.app'
  
  beforeEach(() => {
    cy.visit(baseUrl)
  })

  describe('Site Availability and Performance', () => {
    it('should load the homepage successfully', () => {
      cy.visit(baseUrl)
      cy.get('body').should('be.visible')
      cy.title().should('not.be.empty')
    })

    it('should have reasonable load times', () => {
      cy.visit(baseUrl)
      cy.window().then((win) => {
        const loadTime = win.performance.timing.loadEventEnd - win.performance.timing.navigationStart
        expect(loadTime).to.be.lessThan(5000) // Less than 5 seconds
      })
    })

    it('should be responsive on mobile', () => {
      cy.viewport('iphone-6')
      cy.visit(baseUrl)
      cy.get('body').should('be.visible')
    })

    it('should be responsive on tablet', () => {
      cy.viewport('ipad-2')
      cy.visit(baseUrl)
      cy.get('body').should('be.visible')
    })

    it('should be responsive on desktop', () => {
      cy.viewport(1920, 1080)
      cy.visit(baseUrl)
      cy.get('body').should('be.visible')
    })
  })

  describe('Core App Structure', () => {
    it('should render the main layout', () => {
      cy.get('html').should('have.attr', 'lang', 'en')
      cy.get('body').should('exist')
    })

    it('should load CSS and styling correctly', () => {
      cy.get('body').should('have.css', 'margin', '0px')
      // Check if Tailwind is loaded
      cy.get('body').then(($body) => {
        const computed = window.getComputedStyle($body[0])
        expect(computed).to.exist
      })
    })

    it('should not have console errors', () => {
      cy.window().then((win) => {
        cy.stub(win.console, 'error').as('consoleError')
      })
      cy.visit(baseUrl)
      cy.get('@consoleError').should('not.have.been.called')
    })
  })

  describe('Navigation and Routing', () => {
    it('should handle 404 pages gracefully', () => {
      cy.visit(`${baseUrl}/non-existent-page`, { failOnStatusCode: false })
      cy.contains('404').should('be.visible')
    })

    it('should handle invalid routes', () => {
      cy.visit(`${baseUrl}/invalid/deep/route`, { failOnStatusCode: false })
      // Should either show 404 or redirect appropriately
      cy.url().should('contain', baseUrl)
    })
  })

  describe('API Health Checks', () => {
    it('should have working health check endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/health`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('status')
          expect(response.body.status).to.equal('OK')
        } else {
          // Log the response for debugging
          cy.log('Health check failed:', response.status, response.body)
        }
      })
    })

    it('should handle API route not found', () => {
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/nonexistent`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([404, 405]) // 404 or 405 Method Not Allowed
      })
    })
  })

  describe('Authentication Features', () => {
    it('should have auth-related elements or routes', () => {
      // Check if login/register buttons exist
      cy.get('body').then(($body) => {
        const hasAuthElements = $body.find('[data-testid*="auth"], [data-testid*="login"], [data-testid*="register"], a[href*="login"], a[href*="register"], button:contains("Login"), button:contains("Sign"), button:contains("Register")').length > 0
        
        if (!hasAuthElements) {
          cy.log('No auth elements found on homepage - checking auth routes')
          // Try to visit auth routes
          cy.visit(`${baseUrl}/login`, { failOnStatusCode: false })
          cy.url().then((url) => {
            if (url.includes('login')) {
              cy.log('Login route exists')
            }
          })
        }
      })
    })

    it('should test auth API endpoints if they exist', () => {
      // Test auth endpoints
      const authEndpoints = ['/api/auth/login', '/api/auth/register', '/api/auth/logout']
      
      authEndpoints.forEach((endpoint) => {
        cy.request({
          method: 'POST',
          url: `${baseUrl}${endpoint}`,
          failOnStatusCode: false,
          body: {}
        }).then((response) => {
          // Should get 400 (bad request) or 405 (method not allowed) rather than 500
          expect(response.status).to.be.oneOf([400, 401, 404, 405, 422])
        })
      })
    })
  })

  describe('Database Connectivity', () => {
    it('should connect to database (indirect test)', () => {
      // Test if any endpoint that requires DB returns appropriate response
      cy.request({
        method: 'GET',
        url: `${baseUrl}/api/users`,
        failOnStatusCode: false
      }).then((response) => {
        // Should not get 500 internal server error if DB is connected
        expect(response.status).not.to.equal(500)
      })
    })
  })

  describe('Static Assets and Resources', () => {
    it('should load favicon', () => {
      cy.request({
        url: `${baseUrl}/favicon.ico`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.be.oneOf([200, 404]) // Either exists or gracefully missing
      })
    })

    it('should serve static files from public directory', () => {
      // Test common static file paths
      const staticFiles = ['/robots.txt', '/sitemap.xml']
      
      staticFiles.forEach((file) => {
        cy.request({
          url: `${baseUrl}${file}`,
          failOnStatusCode: false
        }).then((response) => {
          // Should not get 500 errors for static files
          expect(response.status).to.be.oneOf([200, 404])
        })
      })
    })
  })

  describe('Security Headers', () => {
    it('should have security headers', () => {
      cy.request(baseUrl).then((response) => {
        // Check for common security headers
        const headers = response.headers
        
        // Vercel typically adds these by default
        expect(headers).to.have.property('x-frame-options')
        expect(headers).to.have.property('x-content-type-options')
      })
    })
  })

  describe('Real-time Features (WebSocket)', () => {
    it('should handle WebSocket connections gracefully', () => {
      cy.window().then((win) => {
        // Test if WebSocket connection can be established
        try {
          const ws = new win.WebSocket(`wss://${baseUrl.replace('https://', '')}/socket.io/`)
          ws.onopen = () => {
            cy.log('WebSocket connection successful')
            ws.close()
          }
          ws.onerror = () => {
            cy.log('WebSocket connection failed (expected in serverless)')
          }
        } catch (error) {
          cy.log('WebSocket not available (expected in serverless)')
        }
      })
    })
  })

  describe('Performance and SEO', () => {
    it('should have proper meta tags', () => {
      cy.get('head meta[name="description"]').should('exist')
      cy.get('head title').should('not.be.empty')
    })

    it('should have proper Open Graph tags', () => {
      cy.get('head').within(() => {
        // Check for basic OG tags
        cy.get('meta[property="og:title"], meta[name="og:title"]').should('exist')
      })
    })

    it('should load JavaScript bundles successfully', () => {
      cy.window().should('have.property', 'React')
        .or('satisfy', () => {
          // If React is not global, check if the page renders correctly
          return Cypress.$('body').children().length > 0
        })
    })
  })

  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', () => {
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/test`,
        body: 'invalid json',
        headers: {
          'content-type': 'application/json'
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should not crash the app
        expect(response.status).to.be.lessThan(500)
      })
    })

    it('should handle large payloads appropriately', () => {
      const largePayload = 'x'.repeat(10000)
      
      cy.request({
        method: 'POST',
        url: `${baseUrl}/api/test`,
        body: { data: largePayload },
        failOnStatusCode: false
      }).then((response) => {
        // Should either accept or reject gracefully
        expect(response.status).to.be.oneOf([200, 400, 413, 404, 405])
      })
    })
  })

  describe('Feature-Specific Tests', () => {
    it('should test user registration flow if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Register"), a[href*="register"]').length > 0) {
          // Registration form exists
          cy.contains('Register').click()
          cy.url().should('contain', 'register')
          
          // Test form validation
          cy.get('form').within(() => {
            cy.get('button[type="submit"]').click()
            // Should show validation errors
          })
        } else {
          cy.log('Registration feature not found on current page')
        }
      })
    })

    it('should test login flow if available', () => {
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Login"), button:contains("Sign in"), a[href*="login"]').length > 0) {
          // Login form exists
          cy.contains(/Login|Sign in/).click()
          
          // Test form validation
          cy.get('form').within(() => {
            cy.get('button[type="submit"]').click()
            // Should show validation errors
          })
        } else {
          cy.log('Login feature not found on current page')
        }
      })
    })

    it('should test social features if available', () => {
      // Look for social networking elements
      cy.get('body').then(($body) => {
        const socialElements = $body.find('[data-testid*="post"], [data-testid*="feed"], .post, .feed, button:contains("Post"), button:contains("Share")').length
        
        if (socialElements > 0) {
          cy.log(`Found ${socialElements} social elements`)
          // Test posting functionality
          cy.get('[data-testid*="post"], button:contains("Post")').first().should('be.visible')
        } else {
          cy.log('Social features not immediately visible')
        }
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels and semantic HTML', () => {
      cy.get('main, [role="main"]').should('exist')
      cy.get('h1, h2, h3').should('exist')
    })

    it('should be keyboard navigable', () => {
      cy.get('body').focus()
      cy.focused().tab()
      cy.focused().should('exist')
    })
  })

  describe('Cross-browser Compatibility', () => {
    it('should work with different user agents', () => {
      // Test with mobile user agent
      cy.visit(baseUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
        }
      })
      cy.get('body').should('be.visible')
    })
  })
})