#!/usr/bin/env node

/**
 * NGA Connection Test Script
 * Tests different methods for connecting to NGA World Port Index data
 */

import NGAPortScraper from '../lib/scrapers/nga-ports.ts';

async function testNGAConnection() {
  console.log('🧪 Testing NGA World Port Index Connection\n');

  try {
    const scraper = new NGAPortScraper();

    console.log('1️⃣ Testing Web Scraping...');
    try {
      const webPorts = await scraper.scrapeFromWeb();
      console.log(`   ✅ Found ${webPorts.length} ports via web scraping`);
    } catch (error) {
      console.log(`   ❌ Web scraping failed: ${error.message}`);
    }

    console.log('\n2️⃣ Testing Dataset Download...');
    try {
      const datasetPorts = await scraper.loadFromDataset();
      console.log(`   ✅ Found ${datasetPorts.length} ports via dataset`);
    } catch (error) {
      console.log(`   ❌ Dataset download failed: ${error.message}`);
    }

    console.log('\n3️⃣ Testing Alternative Sources...');
    try {
      const altPorts = await scraper.loadFromAlternatives();
      console.log(`   ✅ Found ${altPorts.length} ports via alternatives`);
    } catch (error) {
      console.log(`   ❌ Alternative sources failed: ${error.message}`);
    }

    console.log('\n4️⃣ Full Scraper Test (with fallbacks)...');
    const allPorts = await scraper.scrapePorts();
    console.log(`   🎯 Total ports collected: ${allPorts.length}`);

    if (allPorts.length > 0) {
      console.log('\n📋 Sample Ports:');
      allPorts.slice(0, 3).forEach((port, index) => {
        console.log(`   ${index + 1}. ${port.portName}, ${port.country}`);
        console.log(`      📍 ${port.latitude.toFixed(4)}, ${port.longitude.toFixed(4)}`);
        console.log(`      ⚓ Max draft: ${port.maxDraft}m`);
      });
    }

  } catch (error) {
    console.error('❌ NGA connection test failed:', error);
  }
}

testNGAConnection();