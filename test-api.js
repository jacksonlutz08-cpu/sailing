#!/usr/bin/env node

/**
 * Test script for port search API
 */

async function testPortSearch() {
  try {
    const response = await fetch('http://localhost:3002/api/ports/search?q=san');
    const data = await response.json();

    console.log('✅ API Response:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ API Test failed:', error);
  }
}

testPortSearch();