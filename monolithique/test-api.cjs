const http = require('http');
const { spawn } = require('child_process');

async function check() {
    console.log("Starting server...");
    const server = spawn('node', ['src/server.js'], { stdio: 'pipe' });
    let isReady = false;

    server.stdout.on('data', data => {
        // console.log(`[SRV] ${data}`);
        if(data.toString().includes('3000')) isReady = true;
    });

    server.stderr.on('data', data => {
        console.error(`[ERR] ${data}`);
    });

    // Wait 3s
    await new Promise(r => setTimeout(r, 3000));

    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImFkbWluLTAwMSIsIm5hbWUiOiJTdXBlciBBZG1pbiBPJ0NMSUMgU0FOVEUiLCJlbWFpbCI6ImFkbWluQG9jbGljLXNhbnRlLmNvbSIsInJvbGUiOiJTVVBFUl9BRE1JTiIsInRlbmFudElkIjoiY2VudGVyLTAwMSIsImNlbnRlcklkIjoiY2VudGVyLTAwMSIsImlhdCI6MTc3NTE3NDYxOCwiZXhwIjoxODA2NzEwNjE4fQ.YWS7tQYD87keSFJOr3IEyE9ohQ8esRBB04ChD48SlYE';
    const endpoints = ['/api/tickets', '/api/services', '/api/patients'];

    for (let ep of endpoints) {
        console.log(`\n--> Testing GET ${ep}`);
        await new Promise(r => {
            http.get({
                hostname: 'localhost',
                port: 3000,
                path: ep,
                headers: { 'Authorization': 'Bearer ' + token, 'x-tenant-id': 'center-001' }
            }, res => {
                let d = '';
                res.on('data', c => d += c);
                res.on('end', () => {
                    console.log(`STATUS: ${res.statusCode}`);
                    try {
                        const j = JSON.parse(d);
                        if (Array.isArray(j)) {
                            console.log(`SUCCESS! Returned Array length: ${j.length}`);
                            if(j[0]) console.log(`SAMPLE: ${Object.keys(j[0]).join(', ')}`);
                        } else {
                            console.log(`SUCCESS! Returned Object with keys: ${Object.keys(j).join(', ')}`);
                        }
                    } catch(e) {
                         console.log(`Response wasn't JSON: ${d.substring(0, 100)}`);
                    }
                    r();
                });
            }).on('error', e => {
                 console.log(`Request Error: ${e.message}`);
                 r();
            });
        });
    }

    server.kill();
    console.log('\nFinished testing.');
}

check();
