#!/usr/bin/env node

/**
 * Port Data Scraper Script
 * Scrapes NGA World Port Index and stores in Supabase PostgreSQL
 *
 * Usage:
 * npm run scrape-ports
 * or
 * node scripts/scrape-ports.js
 */

import NGAPortScraper from '../lib/scrapers/nga-ports.js';

async function main() {
  console.log('🚢 Starting NGA World Port Index scraper...');

  try {
    const scraper = new NGAPortScraper();

    console.log('📊 Scraping port data...');
    const ports = await scraper.scrapePorts();

    console.log(`📥 Found ${ports.length} ports. Storing in database...`);
    await scraper.storePorts(ports);

    console.log('✅ Port data successfully stored!');
    console.log(`📋 Total ports in database: ${ports.length}`);

    // Show sample of stored data
    if (ports.length > 0) {
      console.log('\n📍 Sample ports:');
      ports.slice(0, 3).forEach(port => {
        console.log(`  • ${port.portName}, ${port.country} (${port.latitude.toFixed(4)}, ${port.longitude.toFixed(4)})`);
      });
    }

  } catch (error) {
    console.error('❌ Error during scraping:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export default main;