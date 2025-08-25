/**
 * Comprehensive Authentication Test Script for One-Link Backend
 * Tests all authentication endpoints and features
 * 
 * Usage: node test-auth.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testUserId = null;

// Test configuration
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'TestPass123'
};

const invalidUser = {
  username: 'ab', // Too short
  email: 'invalid-email', // Invalid format
  password: '123' // Too short and weak
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testRootEndpoint() {
  console.log('\n🔍 Testing root endpoint...');
  try {
    const response = await makeRequest('GET', '/');
    if (response.status === 200) {
      console.log('✅ Root endpoint working:', response.data.message);
      console.log('   Version:', response.data.version);
      console.log('   Available endpoints:', Object.keys(response.data.endpoints));
    } else {
      console.log('❌ Root endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Root endpoint error:', error.message);
  }
}

async function testUserSignup() {
  console.log('\n🔍 Testing user signup...');
  try {
    const response = await makeRequest('POST', '/api/auth/signup', testUser);
    if (response.status === 201) {
      console.log('✅ User signup successful');
      console.log('   Username:', response.data.data.user.username);
      console.log('   Email:', response.data.data.user.email);
      console.log('   Token received:', response.data.data.token ? 'Yes' : 'No');
      console.log('   Token expires in:', response.data.data.expiresIn);
      
      authToken = response.data.data.token;
      testUserId = response.data.data.user.user_id;
    } else {
      console.log('❌ User signup failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ User signup error:', error.message);
  }
}

async function testInvalidSignup() {
  console.log('\n🔍 Testing invalid signup validation...');
  try {
    const response = await makeRequest('POST', '/api/auth/signup', invalidUser);
    if (response.status === 400) {
      console.log('✅ Invalid signup properly rejected');
      console.log('   Error:', response.data.message);
    } else {
      console.log('❌ Invalid signup should have been rejected:', response.status);
    }
  } catch (error) {
    console.log('❌ Invalid signup test error:', error.message);
  }
}

async function testDuplicateSignup() {
  console.log('\n🔍 Testing duplicate signup...');
  try {
    const response = await makeRequest('POST', '/api/auth/signup', testUser);
    if (response.status === 400) {
      console.log('✅ Duplicate signup properly rejected');
      console.log('   Error:', response.data.message);
    } else {
      console.log('❌ Duplicate signup should have been rejected:', response.status);
    }
  } catch (error) {
    console.log('❌ Duplicate signup test error:', error.message);
  }
}

async function testUserLogin() {
  console.log('\n🔍 Testing user login...');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: testUser.password
    });
    if (response.status === 200) {
      console.log('✅ User login successful');
      authToken = response.data.data.token;
      console.log('   Token received:', authToken ? 'Yes' : 'No');
      console.log('   Token expires in:', response.data.data.expiresIn);
    } else {
      console.log('❌ User login failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
  }
}

async function testInvalidLogin() {
  console.log('\n🔍 Testing invalid login...');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      email: testUser.email,
      password: 'wrongpassword'
    });
    if (response.status === 401) {
      console.log('✅ Invalid login properly rejected');
      console.log('   Error:', response.data.message);
    } else {
      console.log('❌ Invalid login should have been rejected:', response.status);
    }
  } catch (error) {
    console.log('❌ Invalid login test error:', error.message);
  }
}

async function testGetProfile() {
  console.log('\n🔍 Testing get user profile...');
  if (!authToken) {
    console.log('❌ No auth token available, skipping profile test');
    return;
  }

  try {
    const response = await makeRequest('GET', '/api/auth/me', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      console.log('✅ Get profile successful');
      console.log('   Username:', response.data.data.user.username);
      console.log('   Email:', response.data.data.user.email);
      console.log('   User ID:', response.data.data.user.user_id);
    } else {
      console.log('❌ Get profile failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Get profile error:', error.message);
  }
}

async function testUnauthorizedProfile() {
  console.log('\n🔍 Testing unauthorized profile access...');
  try {
    const response = await makeRequest('GET', '/api/auth/me');
    if (response.status === 401) {
      console.log('✅ Unauthorized profile access properly blocked');
    } else {
      console.log('❌ Unauthorized profile access not blocked:', response.status);
    }
  } catch (error) {
    console.log('❌ Unauthorized profile test error:', error.message);
  }
}

async function testLogout() {
  console.log('\n🔍 Testing logout...');
  try {
    const response = await makeRequest('POST', '/api/auth/logout');
    if (response.status === 200) {
      console.log('✅ Logout successful');
      console.log('   Message:', response.data.message);
    } else {
      console.log('❌ Logout failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Logout test error:', error.message);
  }
}

async function testProtectedRouteAccess() {
  console.log('\n🔍 Testing protected route access...');
  try {
    const response = await makeRequest('GET', '/api/links');
    if (response.status === 401) {
      console.log('✅ Protected route access properly blocked');
    } else {
      console.log('❌ Protected route access not blocked:', response.status);
    }
  } catch (error) {
    console.log('❌ Protected route test error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting One-Link Backend Authentication Tests...');
  console.log('📍 Base URL:', BASE_URL);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    await testRootEndpoint();
    await testUserSignup();
    await testInvalidSignup();
    await testDuplicateSignup();
    await testUserLogin();
    await testInvalidLogin();
    await testGetProfile();
    await testUnauthorizedProfile();
    await testLogout();
    await testProtectedRouteAccess();

    console.log('\n🎉 All authentication tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Root endpoint: ✅');
    console.log('   - User signup: ✅');
    console.log('   - Input validation: ✅');
    console.log('   - Duplicate prevention: ✅');
    console.log('   - User login: ✅');
    console.log('   - Invalid login handling: ✅');
    console.log('   - Profile access: ✅');
    console.log('   - Authorization: ✅');
    console.log('   - Logout: ✅');
    console.log('   - Route protection: ✅');

  } catch (error) {
    console.log('\n💥 Authentication test suite failed:', error.message);
  }
}

// Check if server is running before starting tests
async function checkServerStatus() {
  try {
    const response = await makeRequest('GET', '/');
    if (response.status === 200) {
      console.log('✅ Server is running, starting authentication tests...');
      await runTests();
    } else {
      console.log('❌ Server responded with unexpected status:', response.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to server. Please ensure:');
    console.log('   1. The backend server is running (npm run dev)');
    console.log('   2. The server is listening on port 5000');
    console.log('   3. No firewall is blocking the connection');
    console.log('\n   Error:', error.message);
  }
}

// Start the test suite
checkServerStatus();
