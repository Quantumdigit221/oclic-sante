
import { initializeDatabase, query, closeDatabase } from './src/database.js';

async function check() {
  const ok = await initializeDatabase();
  console.log('OK?', ok);
  const p = await query('SELECT * FROM patients');
  console.log('Result type:', typeof p, 'IsArray:', Array.isArray(p));
  console.log('Rows count:', p ? p.length : 'NULL');
  await closeDatabase();
}
check();
