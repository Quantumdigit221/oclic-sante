
import { initializeDatabase, query, closeDatabase } from './src/database.js';
import fs from 'fs';

async function checkAll() {
  const connected = await initializeDatabase();
  if (connected) {
    try {
      const tables = ['tickets', 'services', 'medicines', 'consultations'];
      const results = {};
      for (const table of tables) {
        results[table] = await query(`SHOW COLUMNS FROM ${table}`);
      }
      fs.writeFileSync('all-schemas.json', JSON.stringify(results, null, 2));
    } finally {
      await closeDatabase();
    }
  }
}

checkAll();
