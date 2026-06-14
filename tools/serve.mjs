#!/usr/bin/env node
// serve.mjs — zero-dep static dev server for the Launchpad. No npm install needed.
// Serves the repo root (parent of tools/) with correct MIME types and no-cache headers
// so edits show up on reload. Run from the repo root:
//   node tools/serve.mjs            # http://localhost:8000
//   node tools/serve.mjs --port 5500
//   PORT=3000 node tools/serve.mjs
// PWA note: the service worker still caches once registered — hit the in-header ↻ button,
// hard-reload, or DevTools > Application > Service Workers > Unregister to force fresh code.

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname, sep } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));

const argv = process.argv.slice(2);
const portFlag = argv.indexOf('--port');
const PORT = Number(process.env.PORT) || (portFlag !== -1 ? Number(argv[portFlag + 1]) : 0) || 8000;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8'
};

const server = createServer(async (req, res) => {
  const send = (code, body, type = 'text/plain; charset=utf-8') => {
    res.writeHead(code, { 'Content-Type': type, 'Cache-Control': 'no-cache, no-store, must-revalidate' });
    res.end(body);
  };
  try {
    const urlPath = decodeURIComponent((req.url || '/').split('?')[0]);
    let target = resolve(ROOT, '.' + urlPath);
    if (target !== ROOT && !target.startsWith(ROOT + sep)) return send(403, '403 Forbidden');

    let info = null;
    try { info = await stat(target); } catch { /* missing */ }
    if (info && info.isDirectory()) target = join(target, 'index.html');

    let body;
    try { body = await readFile(target); } catch { return send(404, '404 Not Found: ' + urlPath); }
    send(200, body, MIME[extname(target).toLowerCase()] || 'application/octet-stream');
  } catch (err) {
    send(500, '500 ' + err.message);
  }
});

server.listen(PORT, () => {
  console.log(`Launchpad dev server → http://localhost:${PORT}/`);
  console.log(`Serving ${ROOT}`);
  console.log('Press Ctrl+C to stop.');
});
