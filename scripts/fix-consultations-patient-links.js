import { initializeDatabase, query, closeDatabase } from '../src/database.js';

function norm(value) {
  if (value === null || value === undefined) return null;
  const v = String(value).trim();
  return v.length > 0 ? v : null;
}

async function resolvePatientId({ patientId, patientName, ticketId, ticketPatientPhone, ticketPatientName }) {
  const directId = norm(patientId);
  if (directId) {
    const byId = await query('SELECT id, name FROM patients WHERE id = ? LIMIT 1', [directId]);
    if (byId?.[0]?.id) return byId[0];
  }

  const phone = norm(ticketPatientPhone);
  if (phone) {
    const byPhone = await query(
      `SELECT id, name
       FROM patients
       WHERE phone = ? OR phoneNumber = ?
       ORDER BY createdAt DESC
       LIMIT 1`,
      [phone, phone]
    );
    if (byPhone?.[0]?.id) return byPhone[0];
  }

  const name = norm(ticketPatientName) || norm(patientName);
  if (name) {
    const byName = await query(
      `SELECT id, name
       FROM patients
       WHERE name = ?
       ORDER BY createdAt DESC
       LIMIT 1`,
      [name]
    );
    if (byName?.[0]?.id) return byName[0];
  }

  const fromTicketId = norm(ticketId);
  if (fromTicketId) {
    const fromTicket = await query(
      `SELECT p.id, p.name
       FROM tickets t
       JOIN patients p ON p.phone = t.patientPhone OR p.phoneNumber = t.patientPhone
       WHERE t.id = ?
       ORDER BY p.createdAt DESC
       LIMIT 1`,
      [fromTicketId]
    );
    if (fromTicket?.[0]?.id) return fromTicket[0];
  }

  return null;
}

async function run() {
  const connected = await initializeDatabase();
  if (!connected) {
    console.error('Database connection failed. Aborting.');
    process.exitCode = 1;
    return;
  }

  const rows = await query(
    `SELECT
       c.id,
       c.patientId,
       c.patientName,
       c.ticketId,
       t.patientPhone AS ticketPatientPhone,
       t.patientName AS ticketPatientName,
       p.id AS validPatientId
     FROM consultations c
     LEFT JOIN tickets t ON t.id = c.ticketId
     LEFT JOIN patients p ON p.id = c.patientId
     ORDER BY c.createdAt DESC`
  );

  let checked = 0;
  let fixed = 0;
  let unchanged = 0;
  let unresolved = 0;

  for (const row of rows) {
    checked += 1;
    if (row.validPatientId) {
      unchanged += 1;
      continue;
    }

    const resolved = await resolvePatientId(row);
    if (!resolved?.id) {
      unresolved += 1;
      continue;
    }

    const resolvedName = norm(row.patientName) || resolved.name || null;
    await query(
      'UPDATE consultations SET patientId = ?, patientName = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [resolved.id, resolvedName, row.id]
    );
    fixed += 1;
  }

  console.log('Consultation patient link fix complete');
  console.log(`- Checked: ${checked}`);
  console.log(`- Fixed: ${fixed}`);
  console.log(`- Already valid: ${unchanged}`);
  console.log(`- Unresolved: ${unresolved}`);
}

run()
  .catch((err) => {
    console.error('Failed to fix consultation patient links:', err?.message || err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await closeDatabase();
    } catch {
      // ignore close errors
    }
  });

