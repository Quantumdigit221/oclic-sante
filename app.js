/**
 * O'CLIC SANTE - ROOT BRIDGE (ESM EDITION)
 * Entry File: app.js
 */
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const logFile = 'server-boot-err.log';

function log(msg) {
    try {
        const line = `[\${new Date().toISOString()}] BOOT: \${msg}\n`;
        fs.appendFileSync(logFile, line);
    } catch(e) {}
    console.log(`[BOOT] \${msg}`);
}

log('🚀 MASTER-BOOT: Bridging Domain Root to Monolith Server (ESM Edition)...');

async function boot() {
    try {
        let serverPath = '';
        
        // Search priorities
        const pathsToTry = [
            path.join(__dirname, 'monolithique', 'src', 'server.mjs'),
            path.join(__dirname, 'src', 'server.mjs'),
            path.join(__dirname, 'monolithique', 'src', 'server.js'),
            path.join(__dirname, 'src', 'server.js')
        ];

        for (const p of pathsToTry) {
            if (fs.existsSync(p)) {
                serverPath = p;
                break;
            }
        }

        if (!serverPath) {
            throw new Error('FILE server.mjs/js NOT FOUND. Please verify src/ directory content.');
        }

        log(`✅ SEARCH: Found server core at \${serverPath}. Initializing...`);
        
        // Dynamic import works for both .js and .mjs
        await import(`file:///\${serverPath.replace(/\\/g, '/')}`);
        
        log('✅ SUCCESS: Monolith server fully operational.');
    } catch (err) {
        log(`❌ CRITICAL-BOOT-FAILURE: \${err.message}`);
        
        const emergency = http.createServer((req, res) => {
            res.writeHead(503, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(`
                <html style="background: #fff1f2;">
                    <body style="font-family: sans-serif; padding: 50px;">
                        <div style="background: white; padding: 40px; border-radius: 20px; border: 2px solid #e11d48; max-width: 800px; margin: 0 auto; box-shadow: 0 10px 40px rgba(0,0,0,0.1);">
                            <h1 style="color: #e11d48; margin-top: 0;">🛑 O'CLIC SANTE - ERREUR DE POINT D'ENTRÉE</h1>
                            <p style="font-size: 18px; color: #475569;">L'hébergeur lance <code>app.js</code> mais ne trouve pas le moteur de serveur.</p>
                            <div style="background: #1e293b; padding: 25px; border-radius: 12px; margin: 25px 0;">
                                <p style="font-family: monospace; color: #FDA4AF; white-space: pre-wrap; font-size: 14px;">\${err.stack || err.message}</p>
                            </div>
                            <p style="color: #94a3b8; font-size: 12px;">Node: \${process.version} | CWD: \${process.cwd()}</p>
                        </div>
                    </body>
                </html>
            `);
        });

        emergency.listen(PORT, () => {
            log(`⚠️  EMERGENCY: Listening on \${PORT} to report error.`);
        });
    }
}

boot();
