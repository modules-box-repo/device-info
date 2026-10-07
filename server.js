// Handles the info API and static file serving

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { snapshot, loadFixed, coreFreqs } = require('./js/server/index');

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const ROOT = __dirname;
const SERVER_CODE = path.join(ROOT, 'js', 'server');
const CACHE_MS = Number(process.env.CACHE_MS) || 900;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json'
};

const PUBLIC_FILES = new Set(['index.html', 'favicon.svg', 'manifest.webmanifest']);

const cache = new Map();

function logError(where, err) {
  console.error('[' + new Date().toISOString() + '] ' + where + ': ' + (err && err.stack ? err.stack : String(err)));
}

function json(res, body, status = 200) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Cache-Control': 'no-store'
  });
  res.end(payload);
}

function cached(key, produce) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.promise;
  const promise = produce().catch((err) => {
    cache.delete(key);
    logError('snapshot ' + key, err);
    throw err;
  });
  cache.set(key, { at: Date.now(), promise });
  return promise;
}

function describeClientLog(raw) {
  try {
    const parsed = JSON.parse(raw);
    return [parsed.at, parsed.url, parsed.message].filter(Boolean).join(' | ');
  } catch {
    return String(raw).slice(0, 500);
  }
}

function resolveFile(urlPath) {
  let rel = decodeURIComponent(urlPath.split('?')[0]);
  if (rel === '/' || rel === '') rel = '/index.html';

  const full = path.resolve(ROOT, '.' + rel);
  if (full !== ROOT && !full.startsWith(ROOT + path.sep)) return null;
  if (full === SERVER_CODE || full.startsWith(SERVER_CODE + path.sep)) return null;

  const ext = path.extname(full).toLowerCase();
  if (!ext) return path.join(ROOT, 'index.html');

  const top = path.basename(full);
  if (path.dirname(full) === ROOT && !PUBLIC_FILES.has(top)) return null;

  return full;
}

async function serveStatic(req, res, urlPath) {
  const file = resolveFile(urlPath);
  if (!file) return notFound(res);

  let stat;
  try {
    stat = await fsp.stat(file);
  } catch {
    return notFound(res);
  }

  if (stat.isDirectory()) return serveStatic(req, res, path.posix.join(urlPath, 'index.html'));

  const ext = path.extname(file).toLowerCase();
  const etag = 'W/"' + stat.size + '-' + stat.mtimeMs.toString(36) + '"';
  if (req.headers['if-none-match'] === etag) {
    res.writeHead(304);
    res.end();
    return;
  }

  const isHtml = ext === '.html';
  res.writeHead(200, {
    'Content-Type': MIME[ext] || 'application/octet-stream',
    'Content-Length': stat.size,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    ETag: etag
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(file);
  stream.on('error', (err) => {
    logError('read ' + urlPath, err);
    if (res.headersSent) res.destroy();
    else {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Server Error');
    }
  });
  stream.pipe(res);
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not Found');
}

function query(req, key) {
  const raw = (req.url || '/').split('?')[1];
  if (!raw) return null;
  return new URLSearchParams(raw).get(key);
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || '/').split('?')[0];

  if (urlPath === '/api/info') {
    const section = (query(req, 'section') || 'all').toLowerCase();
    cached(section, () => snapshot(section))
      .then((data) => {
        if (!data) return json(res, { error: 'unknown section' }, 400);
        json(res, data);
      })
      .catch((err) => json(res, { error: err && err.message ? err.message : String(err) }, 500));
    return;
  }

  if (urlPath === '/api/cpu-freqs') {
    coreFreqs()
      .then((data) => json(res, data))
      .catch((err) => json(res, { error: err && err.message ? err.message : String(err) }, 500));
    return;
  }

  if (urlPath === '/api/log') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8', Allow: 'POST' });
      res.end('Method Not Allowed');
      return;
    }

    let size = 0;
    const chunks = [];
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size <= 8192) chunks.push(chunk);
    });
    req.on('end', () => {
      logError('client', describeClientLog(Buffer.concat(chunks).toString('utf8')));
      res.writeHead(204);
      res.end();
    });
    return;
  }

  if (urlPath === '/api/ping') {
    json(res, { ok: true, at: Date.now(), uptime: process.uptime() });
    return;
  }

  if (urlPath.startsWith('/api/')) {
    json(res, { error: 'unknown endpoint' }, 404);
    return;
  }

  serveStatic(req, res, urlPath).catch((err) => {
    logError('serve ' + urlPath, err);
    if (res.headersSent) {
      res.destroy();
      return;
    }
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server Error');
  });
});

server.on('error', (err) => logError('server', err));
server.on('clientError', (err) => logError('client', err));
process.on('uncaughtException', (err) => logError('uncaught', err));
process.on('unhandledRejection', (err) => logError('unhandled rejection', err));

loadFixed()
  .then(() => {
    server.listen(PORT, HOST, () => {
      console.log('Device Info listening on http://' + HOST + ':' + PORT);
    });
  })
  .catch((err) => {
    logError('startup', err);
    server.listen(PORT, HOST, () => {
      console.log('Device Info listening on http://' + HOST + ':' + PORT);
    });
  });
