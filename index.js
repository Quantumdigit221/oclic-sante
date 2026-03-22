import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'server-err.log');

function logErr(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(logFile, line);
  console.error(msg);
}

logErr('🚀 Tentative de démarrage de l\'application...');

process.on('uncaughtException', (err) => {
  logErr(`FATAL ERROR (Uncaught Exception): ${err.stack || err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logErr(`FATAL ERROR (Unhandled Rejection) at: ${promise} reason: ${reason}`);
});

try {
  await import('./src/server.js');
} catch (e) {
  logErr(`FAILED TO IMPORT server.js: ${e.stack || e}`);
}
