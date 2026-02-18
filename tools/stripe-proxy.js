import http from 'http';
import { URL } from 'url';
import fs from 'fs';

const TARGET = 'http://127.0.0.1:54331';
const APIKEY = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH'; // local anon key (safe for local dev)

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    // collect raw body for logging/debug
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
        const raw = Buffer.concat(chunks);
        const entry = { ts: new Date().toISOString(), method: req.method, url: req.url, stripe_signature: req.headers['stripe-signature'] ?? null, body_len: raw.length };
        console.log('Proxy incoming:', entry);
        try {
            fs.appendFileSync('tools/proxy.log', JSON.stringify(entry) + "\n");
            // persist raw body for debugging (temporary)
            try { fs.appendFileSync('tools/proxy-body.log', raw.toString() + "\n---\n"); } catch (e) { /* ignore */ }
        } catch (err) {
            console.error('Failed to write proxy log:', err.message || err);
        }

        const options = {
            hostname: '127.0.0.1',
            port: 54331,
            path: url.pathname + url.search,
            method: req.method,
            headers: {
                ...req.headers,
                apikey: APIKEY,
                'content-length': raw.length,
            },
        };

        const proxyReq = http.request(options, (proxyRes) => {
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        proxyReq.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(502);
            res.end('Bad Gateway');
        });

        proxyReq.write(raw);
        proxyReq.end();
    });
});

const PROXY_PORT = 54325;
server.listen(PROXY_PORT, () => {
    console.log(`Stripe proxy listening on port ${PROXY_PORT} -> forwards to`, TARGET);
});
