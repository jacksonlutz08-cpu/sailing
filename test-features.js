#!/usr/bin/env node

/**
 * Test script for BlueHorizon features
 */

async function testFeatures() {
  console.log('🧪 Testing BlueHorizon Features...\n');

  const baseUrl = 'http://localhost:3000';

  try {
    // Test 1: Main page
    console.log('1️⃣ Testing Main Page...');
    const pageResponse = await fetch(baseUrl);
    if (pageResponse.ok) {
      console.log('✅ Main page loads (HTTP', pageResponse.status + ')');
    } else {
      console.log('❌ Main page failed (HTTP', pageResponse.status + ')');
    }

    // Test 2: Port Search API
    console.log('\n2️⃣ Testing Port Search API...');
    try {
      const portResponse = await fetch(`${baseUrl}/api/ports?q=antigua`);
      const portData = await portResponse.json();

      if (portData.ports && portData.ports.length > 0) {
        console.log('✅ Port search working!');
        console.log(`   Found ${portData.ports.length} port(s)`);
        console.log(`   Sample: ${portData.ports[0].portName}, ${portData.ports[0].country}`);
        console.log(`   Max draft: ${portData.ports[0].maxDraft}m`);
      } else {
        console.log('❌ Port search returned no results');
        console.log('   Response:', JSON.stringify(portData, null, 2));
      }
    } catch (apiError) {
      console.log('❌ Port search API error:', apiError.message);
    }

    // Test 3: Nearby Ports API
    console.log('\n3️⃣ Testing Nearby Ports API...');
    try {
      const nearbyResponse = await fetch(`${baseUrl}/api/ports?lat=17.1&lng=-61.8&radius=100`);
      const nearbyData = await nearbyResponse.json();

      if (nearbyData.ports && nearbyData.ports.length > 0) {
        console.log('✅ Nearby ports working!');
        console.log(`   Found ${nearbyData.ports.length} nearby port(s)`);
      } else {
        console.log('❌ Nearby ports returned no results');
      }
    } catch (nearbyError) {
      console.log('❌ Nearby ports API error:', nearbyError.message);
    }

    console.log('\n🎉 Feature testing complete!');
    console.log('\n💡 To test the UI: Open http://localhost:3000 in your browser');
    console.log('   - Go to Arrival Assistant');
    console.log('   - Search for "antigua" in the port search field');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFeatures();