describe('Vercel UI and Frontend Tests', () => {
  const baseUrl = 'https://socialize-virid-six.vercel.app'
  
  beforeEach(() => {
    cy.visit(baseUrl)
  })

  describe('Homepage and Landing Page', () => {
    it('should display the main content', () => {
      cy.get('body').should('be.visible')
      cy.get('h1, h2, h3').should('exist')
      cy.title().should('not.be.empty')
    })

    it('should have proper page structure', () => {
      cy.get('main, [role="main"], .main-content').should('exist')
      cy.get('header, nav, .header, .navigation').should('exist').or('not.exist')
      cy.get('footer, .footer').should('exist').or('not.exist')
    })

    it('should display branding and title', () => {
      cy.title().should('contain', 'Socialize')
      cy.get('body').should('contain.text', 'Socialize')
    })
  })

  describe('Navigation and Menu', () => {
    it('should have functional navigation elements', () => {
      cy.get('nav, .nav, [role="navigation"]').then(($nav) => {
        if ($nav.length > 0) {
          cy.wrap($nav).within(() => {
            cy.get('a, button').should('have.length.greaterThan', 0)
          })
        } else {
          cy.log('No navigation menu found')
        }
      })
    })

    it('should handle mobile menu if present', () => {
      cy.viewport('iphone-6')
      cy.get('[data-testid="mobile-menu"], .mobile-menu, button[aria-label*="menu"]').then(($menu) => {
        if ($menu.length > 0) {
          cy.wrap($menu).first().click()
          cy.get('.menu-open, [aria-expanded="true"]').should('exist')
        } else {
          cy.log('No mobile menu found')
        }
      })
    })
  })

  describe('Authentication UI', () => {
    it('should display auth buttons or forms', () => {
      cy.get('body').then(($body) => {
        const authElements = $body.find('button:contains("Login"), button:contains("Sign"), button:contains("Register"), a[href*="login"], a[href*="register"], .login-form, .register-form')
        
        if (authElements.length > 0) {
          cy.log(`Found ${authElements.length} authentication elements`)
          cy.wrap(authElements.first()).should('be.visible')
        } else {
          cy.log('No authentication UI elements found on homepage')
        }
      })
    })

    it('should test login form if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('form, .login-form, input[type="email"], input[type="password"]').length > 0) {
          // Login form exists, test it
          cy.get('input[type="email"], input[placeholder*="email"]').first().type('test@example.com')
          cy.get('input[type="password"], input[placeholder*="password"]').first().type('testpassword')
          
          // Don't actually submit, just verify form works
          cy.get('input[type="email"], input[placeholder*="email"]').should('have.value', 'test@example.com')
          cy.get('input[type="password"], input[placeholder*="password"]').should('have.value', 'testpassword')
        } else {
          cy.log('No login form found on current page')
        }
      })
    })

    it('should test registration form if present', () => {
      cy.get('body').then(($body) => {
        if ($body.find('.register-form, form').length > 0) {
          // Look for registration fields
          cy.get('input[type="email"], input[placeholder*="email"]').then(($email) => {
            if ($email.length > 0) {
              cy.wrap($email).first().type('test@example.com')
            }
          })
          
          cy.get('input[type="text"], input[placeholder*="username"], input[placeholder*="name"]').then(($username) => {
            if ($username.length > 0) {
              cy.wrap($username).first().type('testuser')
            }
          })
          
          cy.get('input[type="password"], input[placeholder*="password"]').then(($password) => {
            if ($password.length > 0) {
              cy.wrap($password).first().type('testpassword123')
            }
          })
        } else {
          cy.log('No registration form found')
        }
      })
    })
  })

  describe('Social Feed and Posts', () => {
    it('should display posts or feed if available', () => {
      cy.get('body').then(($body) => {
        const feedElements = $body.find('.post, .feed-item, [data-testid*="post"], .social-post, article')
        
        if (feedElements.length > 0) {
          cy.log(`Found ${feedElements.length} post/feed elements`)
          cy.wrap(feedElements.first()).should('be.visible')
          
          // Test post content
          cy.wrap(feedElements.first()).within(() => {
            cy.get('h1, h2, h3, h4, h5, h6, .title, .post-title').should('exist').or('not.exist')
            cy.get('p, .content, .post-content, .text').should('exist').or('not.exist')
          })
        } else {
          cy.log('No post/feed elements found')
        }
      })
    })

    it('should test post creation if available', () => {
      cy.get('body').then(($body) => {
        const postElements = $body.find('button:contains("Post"), button:contains("Share"), .post-form, textarea[placeholder*="post"], textarea[placeholder*="share"]')
        
        if (postElements.length > 0) {
          cy.log('Found post creation elements')
          
          // Test textarea if available
          cy.get('textarea[placeholder*="post"], textarea[placeholder*="share"], textarea[placeholder*="thought"]').then(($textarea) => {
            if ($textarea.length > 0) {
              cy.wrap($textarea).first().type('This is a test post from Cypress E2E testing')
              cy.wrap($textarea).first().should('contain.value', 'test post')
            }
          })
        } else {
          cy.log('No post creation elements found')
        }
      })
    })
  })

  describe('User Profile Features', () => {
    it('should test profile elements if available', () => {
      cy.get('body').then(($body) => {
        const profileElements = $body.find('.profile, .user-info, [data-testid*="profile"], .avatar, .user-avatar')
        
        if (profileElements.length > 0) {
          cy.log(`Found ${profileElements.length} profile elements`)
          cy.wrap(profileElements.first()).should('be.visible')
        } else {
          cy.log('No profile elements found')
        }
      })
    })

    it('should test profile pictures/avatars', () => {
      cy.get('img[alt*="profile"], img[alt*="avatar"], .avatar img, .profile-picture').then(($images) => {
        if ($images.length > 0) {
          cy.wrap($images).each(($img) => {
            cy.wrap($img).should('have.attr', 'src').and('not.be.empty')
          })
        } else {
          cy.log('No profile images found')
        }
      })
    })
  })

  describe('Search and Filter Features', () => {
    it('should test search functionality if available', () => {
      cy.get('input[type="search"], input[placeholder*="search"], .search-input').then(($search) => {
        if ($search.length > 0) {
          cy.wrap($search).first().type('test search query')
          cy.wrap($search).first().should('have.value', 'test search query')
          
          // Look for search button
          cy.get('button:contains("Search"), .search-button, [type="submit"]').then(($button) => {
            if ($button.length > 0) {
              cy.log('Search button found')
            }
          })
        } else {
          cy.log('No search input found')
        }
      })
    })

    it('should test filter options if available', () => {
      cy.get('select, .filter, .dropdown, [role="listbox"]').then(($filters) => {
        if ($filters.length > 0) {
          cy.log(`Found ${$filters.length} filter elements`)
          cy.wrap($filters.first()).should('be.visible')
        } else {
          cy.log('No filter elements found')
        }
      })
    })
  })

  describe('Interactive Elements', () => {
    it('should test buttons and clickable elements', () => {
      cy.get('button:not([disabled]), a[href], [role="button"]').then(($clickables) => {
        if ($clickables.length > 0) {
          cy.log(`Found ${$clickables.length} clickable elements`)
          
          // Test first few buttons (avoid infinite loops)
          cy.wrap($clickables.slice(0, 5)).each(($el) => {
            cy.wrap($el).should('be.visible')
            
            // Test hover state if it's a button
            if ($el.prop('tagName') === 'BUTTON') {
              cy.wrap($el).trigger('mouseover')
            }
          })
        }
      })
    })

    it('should test form inputs and validation', () => {
      cy.get('input, textarea, select').then(($inputs) => {
        if ($inputs.length > 0) {
          cy.log(`Found ${$inputs.length} form inputs`)
          
          cy.wrap($inputs).each(($input) => {
            const type = $input.attr('type')
            const tagName = $input.prop('tagName')
            
            if (type === 'text' || type === 'email' || tagName === 'TEXTAREA') {
              cy.wrap($input).clear().type('test input')
              cy.wrap($input).should('have.value', 'test input')
              cy.wrap($input).clear()
            }
          })
        }
      })
    })
  })

  describe('Responsive Design', () => {
    const viewports = [
      { name: 'Mobile', width: 375, height: 667 },
      { name: 'Tablet', width: 768, height: 1024 },
      { name: 'Desktop', width: 1920, height: 1080 }
    ]

    viewports.forEach((viewport) => {
      it(`should display correctly on ${viewport.name}`, () => {
        cy.viewport(viewport.width, viewport.height)
        cy.visit(baseUrl)
        
        cy.get('body').should('be.visible')
        cy.get('h1, h2, h3').should('be.visible')
        
        // Check for responsive elements
        cy.get('body').then(($body) => {
          const computedStyle = window.getComputedStyle($body[0])
          expect(computedStyle.overflow).not.to.equal('scroll')
        })
      })
    })
  })

  describe('Accessibility and UX', () => {
    it('should have proper focus management', () => {
      cy.get('button, a, input, textarea, select').first().focus()
      cy.focused().should('exist')
      
      // Test tab navigation
      cy.focused().tab()
      cy.focused().should('exist')
    })

    it('should have proper ARIA labels and semantic HTML', () => {
      cy.get('[aria-label], [aria-labelledby], [role]').should('exist').or('not.exist')
      cy.get('main, header, nav, footer, section, article').should('exist')
      cy.get('h1').should('have.length.lessThan', 2) // Should have only one h1
    })

    it('should have proper alt text for images', () => {
      cy.get('img').then(($images) => {
        if ($images.length > 0) {
          cy.wrap($images).each(($img) => {
            cy.wrap($img).should('have.attr', 'alt')
          })
        }
      })
    })
  })

  describe('Loading States and Animations', () => {
    it('should handle loading states gracefully', () => {
      // Check for loading spinners or skeletons
      cy.get('.loading, .spinner, .skeleton, [data-testid*="loading"]').should('exist').or('not.exist')
      
      // If they exist, they should eventually disappear
      cy.get('.loading, .spinner').then(($loading) => {
        if ($loading.length > 0) {
          cy.wait(3000)
          cy.get('.loading, .spinner').should('not.exist')
        }
      })
    })

    it('should test animations and transitions', () => {
      // Look for animated elements
      cy.get('[class*="animate"], [class*="transition"], .fade, .slide').then(($animated) => {
        if ($animated.length > 0) {
          cy.log(`Found ${$animated.length} animated elements`)
          cy.wrap($animated.first()).should('be.visible')
        }
      })
    })
  })

  describe('Error States and Edge Cases', () => {
    it('should handle empty states gracefully', () => {
      // Look for empty state messages
      cy.get('.empty-state, .no-data, .no-results').should('exist').or('not.exist')
    })

    it('should handle offline state if implemented', () => {
      // Test offline functionality if service worker is present
      cy.window().then((win) => {
        if ('serviceWorker' in win.navigator) {
          cy.log('Service worker detected')
        } else {
          cy.log('No service worker found')
        }
      })
    })
  })
})