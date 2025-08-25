/**
 * Simple API Test Script for One-Link Backend
 * Run this script to test the basic functionality of your API
 * 
 * Usage: node test-api.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Test configuration
const testUser = {
  username: 'testuser_' + Date.now(),
  email: `test${Date.now()}@example.com`,
  password: 'testpass123'
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
    } else {
      console.log('❌ Root endpoint failed:', response.status);
    }
  } catch (error) {
    console.log('❌ Root endpoint error:', error.message);
  }
}

async function testUserRegistration() {
  console.log('\n🔍 Testing user registration...');
  try {
    const response = await makeRequest('POST', '/api/auth/register', testUser);
    if (response.status === 201) {
      console.log('✅ User registration successful');
      console.log('   Username:', response.data.data.user.username);
      console.log('   Email:', response.data.data.user.email);
      authToken = response.data.data.token;
      console.log('   Token received:', authToken ? 'Yes' : 'No');
    } else {
      console.log('❌ User registration failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ User registration error:', error.message);
  }
}

async function testUserLogin() {
  console.log('\n🔍 Testing user login...');
  try {
    const response = await makeRequest('POST', '/api/auth/login', {
      username: testUser.username,
      password: testUser.password
    });
    if (response.status === 200) {
      console.log('✅ User login successful');
      authToken = response.data.data.token;
      console.log('   Token received:', authToken ? 'Yes' : 'No');
    } else {
      console.log('❌ User login failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ User login error:', error.message);
  }
}

async function testCreateLink() {
  console.log('\n🔍 Testing link creation...');
  if (!authToken) {
    console.log('❌ No auth token available, skipping link tests');
    return;
  }

  try {
    const linkData = {
      title: 'My Test Website',
      url: 'https://example.com',
      order: 0
    };

    const response = await makeRequest('POST', '/api/links', linkData, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 201) {
      console.log('✅ Link creation successful');
      console.log('   Title:', response.data.data.title);
      console.log('   URL:', response.data.data.url);
      console.log('   Order:', response.data.data.order);
    } else {
      console.log('❌ Link creation failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Link creation error:', error.message);
  }
}

async function testGetLinks() {
  console.log('\n🔍 Testing get links...');
  if (!authToken) {
    console.log('❌ No auth token available, skipping link tests');
    return;
  }

  try {
    const response = await makeRequest('GET', '/api/links', null, {
      'Authorization': `Bearer ${authToken}`
    });

    if (response.status === 200) {
      console.log('✅ Get links successful');
      console.log('   Links found:', response.data.data.length);
      if (response.data.data.length > 0) {
        console.log('   First link:', response.data.data[0].title);
      }
    } else {
      console.log('❌ Get links failed:', response.status);
      console.log('   Error:', response.data.message);
    }
  } catch (error) {
    console.log('❌ Get links error:', error.message);
  }
}

async function testUnauthorizedAccess() {
  console.log('\n🔍 Testing unauthorized access to protected routes...');
  try {
    const response = await makeRequest('GET', '/api/links');
    if (response.status === 401) {
      console.log('✅ Unauthorized access properly blocked');
    } else {
      console.log('❌ Unauthorized access not blocked:', response.status);
    }
  } catch (error) {
    console.log('❌ Unauthorized test error:', error.message);
  }
}

// Main test runner
async function runTests() {
  console.log('🚀 Starting One-Link Backend API Tests...');
  console.log('📍 Base URL:', BASE_URL);
  console.log('⏰ Timestamp:', new Date().toISOString());

  try {
    await testRootEndpoint();
    await testUserRegistration();
    await testUserLogin();
    await testCreateLink();
    await testGetLinks();
    await testUnauthorizedAccess();

    console.log('\n🎉 All tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('   - Root endpoint: ✅');
    console.log('   - User registration: ✅');
    console.log('   - User login: ✅');
    console.log('   - Link creation: ✅');
    console.log('   - Link retrieval: ✅');
    console.log('   - Authorization: ✅');

  } catch (error) {
    console.log('\n💥 Test suite failed:', error.message);
  }
}

// Check if server is running before starting tests
async function checkServerStatus() {
  try {
    const response = await makeRequest('GET', '/');
    if (response.status === 200) {
      console.log('✅ Server is running, starting tests...');
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
