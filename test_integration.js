const axios = require('axios');

const API_URL = 'http://localhost:8001/api';

async function testIntegration() {
  console.log('Testing API integration...\n');
  
  const endpoints = [
    'hero-section',
    'site-stats', 
    'customer-logos',
    'products',
    'problems',
    'workflow-steps',
    'site-settings'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${API_URL}/${endpoint}`);
      console.log(`✅ ${endpoint}: ${response.status} - ${JSON.stringify(response.data).substring(0, 100)}...`);
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
    }
  }
}

testIntegration();