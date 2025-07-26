const http = require('http');
const https = require('https');

// Color codes for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  reset: '\x1b[0m'
};

// Test utilities
async function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data,
          json: () => {
            try {
              return JSON.parse(data);
            } catch (e) {
              return null;
            }
          }
        });
      });
    });
    
    req.on('error', reject);
    
    if (body) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// Test suite
const tests = [];
let passCount = 0;
let failCount = 0;

function test(name, fn) {
  tests.push({ name, fn });
}

async function runTests() {
  console.log('🧪 Running E2E Tests for Socialize\n');
  
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`${colors.green}✓${colors.reset} ${name}`);
      passCount++;
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} ${name}`);
      console.log(`  ${colors.red}${error.message}${colors.reset}`);
      failCount++;
    }
  }
  
  console.log(`\n📊 Test Results: ${colors.green}${passCount} passed${colors.reset}, ${failCount > 0 ? colors.red : ''}${failCount} failed${colors.reset}`);
  
  if (failCount === 0) {
    console.log(`\n${colors.green}✅ All tests passed! The application works as promised!${colors.reset}`);
  }
}

// Helper to assert conditions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

// Test definitions
test('Homepage loads successfully', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/',
    method: 'GET'
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  assert(res.body.includes('Welcome to Socialize'), 'Homepage should contain welcome message');
  assert(res.body.includes('Get Started'), 'Homepage should have Get Started button');
  assert(res.body.includes('Learn More'), 'Homepage should have Learn More button');
});

test('API health check returns OK', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  const data = res.json();
  assert(data.status === 'OK', 'Health check should return OK status');
  assert(data.timestamp, 'Health check should include timestamp');
});

test('User registration works', async () => {
  const userData = {
    username: `testuser${Date.now()}`,
    email: `test${Date.now()}@example.com`,
    password: 'password123',
    displayName: 'Test User'
  };
  
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, userData);
  
  assert(res.status === 201, `Expected status 201, got ${res.status}`);
  const data = res.json();
  assert(data.user, 'Response should include user object');
  assert(data.token, 'Response should include auth token');
  assert(data.user.username === userData.username, 'Username should match');
  assert(!data.user.password, 'Password should not be returned');
});

test('Registration validation works', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    username: '',
    email: '',
    password: ''
  });
  
  assert(res.status === 400, `Expected status 400, got ${res.status}`);
  const data = res.json();
  assert(data.error, 'Should return error for invalid data');
});

test('Duplicate username is rejected', async () => {
  const username = `duplicate${Date.now()}`;
  
  // First registration
  await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    username,
    email: `${username}@example.com`,
    password: 'password123'
  });
  
  // Duplicate attempt
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    username,
    email: `${username}2@example.com`,
    password: 'password123'
  });
  
  assert(res.status === 400, `Expected status 400, got ${res.status}`);
  const data = res.json();
  assert(data.error === 'Username already taken', 'Should reject duplicate username');
});

test('User login works', async () => {
  const username = `logintest${Date.now()}`;
  const password = 'password123';
  
  // Register first
  await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    username,
    email: `${username}@example.com`,
    password
  });
  
  // Login with username
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    login: username,
    password
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  const data = res.json();
  assert(data.user, 'Login should return user object');
  assert(data.token, 'Login should return auth token');
  assert(data.user.username === username, 'Username should match');
});

test('Login with email works', async () => {
  const username = `emaillogin${Date.now()}`;
  const email = `${username}@example.com`;
  const password = 'password123';
  
  // Register first
  await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    username,
    email,
    password
  });
  
  // Login with email
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    login: email,
    password
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  const data = res.json();
  assert(data.user.email === email, 'Email should match');
});

test('Invalid credentials are rejected', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    login: 'nonexistent',
    password: 'wrongpassword'
  });
  
  assert(res.status === 401, `Expected status 401, got ${res.status}`);
  const data = res.json();
  assert(data.error === 'Invalid credentials', 'Should reject invalid credentials');
});

test('Protected routes require authentication', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET'
  });
  
  assert(res.status === 401, `Expected status 401, got ${res.status}`);
  const data = res.json();
  assert(data.error === 'Please authenticate', 'Should require authentication');
});

test('JWT authentication works', async () => {
  const username = `jwttest${Date.now()}`;
  
  // Register and get token
  const registerRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  }, {
    username,
    email: `${username}@example.com`,
    password: 'password123',
    displayName: 'JWT Test User'
  });
  
  const { token } = registerRes.json();
  
  // Use token to access protected route
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/me',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  const data = res.json();
  assert(data.username === username, 'Should return authenticated user');
  assert(data.displayName === 'JWT Test User', 'Should include user details');
});

test('Login page is accessible', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/login',
    method: 'GET'
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  assert(res.body.includes('Login'), 'Login page should have login form');
  assert(res.body.includes('name="username"'), 'Should have username input');
  assert(res.body.includes('name="password"'), 'Should have password input');
});

test('Register page is accessible', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/register',
    method: 'GET'
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  assert(res.body.includes('Register'), 'Register page should have register form');
  assert(res.body.includes('name="email"'), 'Should have email input');
});

test('Protected pages redirect to login', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/profile',
    method: 'GET'
  });
  
  assert(res.status === 302, `Expected status 302, got ${res.status}`);
  assert(res.headers.location === '/login', 'Should redirect to login');
});

test('CORS headers are set correctly', async () => {
  const res = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/health',
    method: 'OPTIONS'
  });
  
  assert(res.status === 200, `Expected status 200, got ${res.status}`);
  assert(res.headers['access-control-allow-origin'] === '*', 'Should allow CORS');
  assert(res.headers['access-control-allow-methods'], 'Should set allowed methods');
});

// Run all tests
runTests().catch(console.error);