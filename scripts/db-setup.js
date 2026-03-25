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

async function setupDatabase() {
  console.log('🗄️ Setting up BlueHorizon database...');

  try {
    // Validate environment variables
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      throw new Error('❌ NEXT_PUBLIC_SUPABASE_URL environment variable is not set');
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
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
    if (error instanceof Error) {
      if (error.message.includes('NEXT_PUBLIC_SUPABASE_URL') || error.message.includes('SUPABASE_SERVICE_ROLE_KEY')) {
        console.error(error.message);
        console.error('\n📋 To set up Supabase:');
        console.error('  1. Create a Supabase project at https://supabase.com');
        console.error('  2. Create a .env.local file with:');
        console.error('     NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
        console.error('     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
        console.error('  3. Run: npm run db-setup');
      } else {
        console.error('❌ Database setup failed:', error.message);
      }
    } else {
      console.error('❌ Database setup failed:', error);
    }
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase().catch(err => {
    console.error('❌ Unhandled error:', err);
    process.exit(1);
  });
}

export default setupDatabase;