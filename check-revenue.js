import { initializeDatabase, query, closeDatabase } from './src/database.js';

async function check() {
  await initializeDatabase();
  console.log('--- REVENUE CHECK ---');
  const tickets = await query("SELECT amount, createdAt, status FROM tickets WHERE status = 'COMPLETED'");
  console.log('Completed Tickets:', tickets.length);
  
  let sum = 0;
  tickets.forEach(t => {
    console.log(`- Amount: ${t.amount} (Type: ${typeof t.amount}) Date: ${t.createdAt}`);
    sum += Number(t.amount);
  });
  
  console.log('Total Sum:', sum);
  
  await closeDatabase();
}
check();
