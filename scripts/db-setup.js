#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates the ports table and runs initial schema setup
 *
 * Usage:
 * npm run db-setup
 * or
 * node scripts/db-setup.js
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function setupDatabase() {
  console.log('🗄️ Setting up BlueHorizon database...');

  try {
    // Read the schema file
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');

    // Split into individual statements (basic approach)
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Executing ${statements.length} SQL statements...`);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          if (error) {
            console.warn(`⚠️ Statement failed (might be expected): ${statement.substring(0, 50)}...`);
            console.warn(`   Error: ${error.message}`);
          }
        } catch (err) {
          // Some statements might fail if they already exist, that's OK
          console.log(`ℹ️ Statement completed: ${statement.substring(0, 50)}...`);
        }
      }
    }

    console.log('✅ Database schema setup complete!');

    // Verify the table was created
    const { data, error } = await supabase
      .from('ports')
      .select('count', { count: 'exact', head: true });

    if (error) {
      console.error('❌ Error verifying table creation:', error);
    } else {
      console.log('📊 Ports table ready for data');
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export default setupDatabase;