import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFile = path.join(__dirname, 'server-err.log');

function logErr(msg) {
  try {
    const line = `[${new Date().toISOString()}] ${msg}\n`;
    fs.appendFileSync(logFile, line);
  } catch (e) {
    // Falls back to stderr if fs fails
  }
  console.error(msg);
}

logErr('🚀 Tentative de démarrage de l\'application (app.js)...');

process.on('uncaughtException', (err) => {
  logErr(`FATAL ERROR (Uncaught Exception): ${err.stack || err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logErr(`FATAL ERROR (Unhandled Rejection) at: ${promise} reason: ${reason}`);
});

// Import the server asynchronously to avoid top-level await crash on old Node versions
import('./src/server.js').then(() => {
  logErr('✅ server.js importé avec succès');
}).catch((e) => {
  logErr(`FAILED TO IMPORT server.js: ${e.stack || e}`);
});
