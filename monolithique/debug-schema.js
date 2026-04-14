
import { initializeDatabase, query, closeDatabase } from './src/database.js';
import fs from 'fs';

async function checkSchema() {
  const connected = await initializeDatabase();
  if (connected) {
    try {
      const columns = await query("SHOW COLUMNS FROM patients");
      fs.writeFileSync('schema-result.json', JSON.stringify(columns, null, 2));
      console.log('Schema saved to schema-result.json');
    } catch (e) {
      console.error('Error showing columns:', e.message);
    } finally {
      await closeDatabase();
    }
  }
}

checkSchema();
