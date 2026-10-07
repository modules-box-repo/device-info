// Shell and file helpers

const { spawn } = require('child_process');
const fs = require('fs');
const fsp = fs.promises;

const MAX_TEXT = 131072;
const MAX_OUT = 262144;

function run(file, args = [], timeout = 2000) {
  return new Promise((resolve) => {
    const started = Date.now();
    let out = '';
    let err = '';
    let missing = false;
    let settled = false;
    let child = null;

    const finish = (payload) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(payload);
    };

    try {
      child = spawn(file, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    } catch {
      resolve({ ok: false, missing: true, code: -1, stdout: '', stderr: '', ms: 0 });
      return;
    }

    const timer = setTimeout(() => {
      try {
        child.kill('SIGKILL');
      } catch {}
    }, timeout);

    child.stdout.on('data', (d) => {
      if (out.length < MAX_OUT) out += d.toString().slice(0, MAX_OUT - out.length);
    });

    child.stderr.on('data', (d) => {
      err += d.toString();
      if (err.length > 4096) err = err.slice(0, 4096);
    });

    child.on('error', (e) => {
      missing = e && e.code === 'ENOENT';
      finish({ ok: false, missing, code: -1, stdout: out.trim(), stderr: err.trim(), ms: Date.now() - started });
    });

    child.on('close', (code) => {
      finish({ ok: code === 0, missing, code, stdout: out.trim(), stderr: err.trim(), ms: Date.now() - started });
    });
  });
}

async function text(file, max = MAX_TEXT) {
  try {
    const st = await fsp.stat(file);
    if (!st.isFile()) return null;
    if (st.size > max) {
      const handle = await fsp.open(file, 'r');
      try {
        const buf = Buffer.alloc(max);
        const { bytesRead } = await handle.read(buf, 0, max, 0);
        return buf.slice(0, bytesRead).toString('utf8');
      } finally {
        await handle.close();
      }
    }
    return await fsp.readFile(file, 'utf8');
  } catch {
    return null;
  }
}

async function trim(file, max = MAX_TEXT) {
  const raw = await text(file, max);
  return raw === null ? null : raw.trim();
}

async function list(dir) {
  try {
    return await fsp.readdir(dir);
  } catch {
    return [];
  }
}

async function first(files, max = MAX_TEXT) {
  for (const f of files) {
    const raw = await trim(f, max);
    if (raw) return { path: f, text: raw };
  }
  return null;
}

function num(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : null;
}

function int(value) {
  const n = num(value);
  return n === null ? null : Math.trunc(n);
}

function firstValue(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '' && v !== 'unknown' && v !== 'null') return v;
  }
  return null;
}

function parseGetprop(raw) {
  const out = {};
  if (!raw) return out;
  for (const line of raw.split('\n')) {
    const m = line.match(/^\[([^\]]+)\]\s*:\s*\[([^\]]*)\]\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function parseKV(raw) {
  const out = {};
  if (!raw) return out;
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([^:=\s]+)\s*[:=]\s*(.*?)\s*$/);
    if (m) out[m[1]] = m[2];
  }
  return out;
}

function parseBlock(raw) {
  const out = [];
  if (!raw) return out;
  for (const chunk of raw.split(/\n\s*\n/)) {
    const block = {};
    for (const line of chunk.split('\n')) {
      const m = line.match(/^([A-Za-z_ ()0-9a-z]+?)\s*:\s*(.*?)\s*$/);
      if (m) block[m[1]] = m[2];
    }
    if (Object.keys(block).length) out.push(block);
  }
  return out;
}

module.exports = {
  MAX_TEXT,
  run,
  text,
  trim,
  list,
  first,
  num,
  int,
  firstValue,
  parseGetprop,
  parseKV,
  parseBlock
};
