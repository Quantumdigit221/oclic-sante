
import { initializeDatabase, query, closeDatabase } from './src/database.js';
import fs from 'fs';

async function checkRest() {
  const connected = await initializeDatabase();
  if (connected) {
    try {
      const tables = ['lab_results', 'sales', 'settings', 'centers'];
      const results = {};
      for (const table of tables) {
        results[table] = await query(`SHOW COLUMNS FROM ${table}`);
      }
      fs.writeFileSync('rest-schemas.json', JSON.stringify(results, null, 2));
    } finally {
      await closeDatabase();
    }
  }
}

checkRest();
