// Provides icons, formatters, and html builders

export const ICONS = {
  cpu: 'M8 5h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm1 3v8h6V8H9zM3 10v2h2v-2H3zm16 0v2h2v-2h-2zM4 15v2h2v-2H4zm14 0v2h2v-2h-2zM10 2v2h2V2h-2zm2 0v2h2V2h-2zm-2 16v2h2v-2h-2zm2 0v2h2v-2h-2z',
  gpu: 'M3 6h18a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zm1 2v7h16V8H4zm3 1h6v5H7V9zm7 1h2v3h-2v-3zm-7 1h1v1H7v-1z',
  screen: 'M3.5 4.5h17a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1zm1.6 2v8h13.8v-8H5.1zm6.4 12.6h6l-.7-1.6h-4.6l-.7 1.6z',
  memory: 'M3 7h18v10H3V7zm2 2v6h14V9H5zm2 1h3v4H7v-4zm5 0h3v4h-3v-4zm5 0h1v4h-1v-4zM6 5h2v2H6V5zm3 0h2v2H9V5zm3 0h2v2h-2V5zm3 0h2v2h-2V5zM6 17h2v2H6v-2zm3 0h2v2H9v-2zm3 0h2v2h-2v-2zm3 0h2v2h-2v-2z',
  storage: 'M4 4h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm2 2v2h3V6H6zm5 0v2h7V6h-7zM4 14h16a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1zm2 2v2h3v-2H6zm5 0v2h7v-2h-7z',
  battery: 'M15 4h-1V2h-2v2H9V2H7v2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H6V8h9v10z',
  network: 'M12 20.5l3.9-4.8a5.6 5.6 0 0 0-7.8 0l3.9 4.8zM12 12.6a8.2 8.2 0 0 1 5.9 2.5l1.5-1.9A10.6 10.6 0 0 0 12 10.3a10.6 10.6 0 0 0-7.4 2.9l1.5 1.9a8.2 8.2 0 0 1 5.9-2.5zm0-5.6c3.6 0 6.9 1.4 9.4 3.7l1.5-1.9A14.2 14.2 0 0 0 12 4.7a14.2 14.2 0 0 0-10.9 4.5l1.5 1.9A12.2 12.2 0 0 1 12 7z',
  thermal: 'M12 2a2.2 2.2 0 0 1 2.2 2.2v8.1a4.6 4.6 0 1 1-4.4 0V4.2A2.2 2.2 0 0 1 12 2zm0 2.2v9h-1.6V4.2zM12 15a2.4 2.4 0 1 0 0 4.8 2.4 2.4 0 0 0 0-4.8z',
  system: 'M12 2.6l1.9 1.4 2.3-.4 1.1 2.1 2.1 1.1-.4 2.3L20.4 12l-1.4 1.9.4 2.3-2.1 1.1-1.1 2.1-2.3-.4L12 21.4l-1.9-1.4-2.3.4-1.1-2.1L4.6 17l.4-2.3L3.6 12 5 10.1 4.6 7.8l2.1-1.1 1.1-2.1 2.3.4L12 2.6zm0 4.6a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 2.4a2.4 2.4 0 1 1 0 4.8 2.4 2.4 0 0 1 0-4.8z',
  build: 'M4 5h16v14H4V5zm2 2v10h12V7H6zm2 2h8v2H8V9zm0 4h5v2H8v-2z',
  kernel: 'M8.6 6.5L3.5 12l5.1 5.5 1.6-1.5L6.5 12l3.7-4L8.6 6.5zm6.8 0-1.4 1.5 3.7 4-3.7 4 1.4 1.5 5.1-5.5-5.1-5.5z',
  files: 'M3 5.5h6l2 2h10a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1zm2 12h14v-7H5v7z',
  moon: 'M12.6 2.6a9.4 9.4 0 1 0 9.1 11.8A7.7 7.7 0 0 1 12.6 2.6z',
  sun: 'M12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6zm0-5.2h0l1.7 3.4h-3.4L12 2zm0 20l-1.7-3.4h3.4L12 22zM2 12l3.4-1.7v3.4L2 12zm20 0l-3.4 1.7v-3.4L22 12zM4.6 3.4l3.3 1.3-2.2 2.2-1.1-3.5zm15.1 15.1l-3.3-1.3 2.2-2.2 1.1 3.5zM4.6 20.6l1.1-3.5 2.2 2.2-3.3 1.3zM19.7 3.4l-1.1 3.5-2.2-2.2 3.3-1.3z',
  info: 'M12 2.4a9.6 9.6 0 1 1 0 19.2 9.6 9.6 0 0 1 0-19.2zm0 3.2a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-1.1 5.6v6h2.2v-6h-2.2z',
  chip: 'M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 4v8h8V8H8z',
  clock: 'M12 2.6a9.4 9.4 0 1 1 0 18.8 9.4 9.4 0 0 1 0-18.8zm0 4v6.2l4.4 2.6 1-1.7-3.4-2V6.6H12z',
  device: 'M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm5 16.4a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zM18 5H6v11h12V5z',
  sim: 'M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm0 2v14h12V5H6zm2 2h8v1.8H8V7zm0 3.4h5v1.8H8v-1.8zm0 3.4h8v1.8H8v-1.8z',
  display: 'M3.5 4.5h17a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1h-17a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1zm1.6 2v8h13.8v-8H5.1zm6.4 12.6h6l-.7-1.6h-4.6l-.7 1.6z'
};

export function icon(name, size = 20, cls = '') {
  const d = ICONS[name] || ICONS.info;
  return `<svg class="${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`;
}

export function esc(value) {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function has(value) {
  if (value === null || value === undefined || value === '') return false;
  if (typeof value === 'number' && !Number.isFinite(value)) return false;
  if (typeof value === 'string') {
    const t = value.trim();
    return t !== '' && t !== '-' && t.toLowerCase() !== 'unknown' && t.toLowerCase() !== 'n/a';
  }
  return true;
}

export function dash(value) {
  return has(value) ? String(value) : '';
}

const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function bytesParts(bytes) {
  const n = Number(bytes);
  if (!Number.isFinite(n) || n <= 0) return { value: bytes ? String(bytes) : '0', unit: 'B' };
  let i = 0;
  let v = n;
  while (v >= 1024 && i < BYTE_UNITS.length - 1) {
    v /= 1024;
    i += 1;
  }
  return { value: v >= 100 || i === 0 ? v.toFixed(0) : v.toFixed(1), unit: BYTE_UNITS[i] };
}

export function bytes(bytes, digits) {
  if (bytes === null || bytes === undefined) return '-';
  const n = Number(bytes);
  if (!Number.isFinite(n)) return '-';
  const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  let i = 0;
  let v = n;
  while (Math.abs(v) >= 1024 && i < units.length - 1) {
    v /= 1024;
    i += 1;
  }
  const d = digits !== undefined ? digits : i === 0 ? 0 : 2;
  return v.toFixed(d) + ' ' + units[i];
}

export function hz(khz) {
  const n = Number(khz);
  if (!Number.isFinite(n) || n <= 0) return '';
  if (n >= 1e6) return trimZeros((n / 1e6).toFixed(2)) + ' GHz';
  if (n >= 1e3) return trimZeros((n / 1e3).toFixed(n >= 1e5 ? 0 : 2)) + ' MHz';
  return trimZeros(n.toFixed(n % 1 ? 2 : 0)) + ' kHz';
}

function trimZeros(text) {
  return text.includes('.') ? text.replace(/0+$/, '').replace(/\.$/, '') : text;
}

export function pct(value, digits = 1) {
  const n = Number(value);
  if (!Number.isFinite(n)) return '';
  return n.toFixed(digits) + '%';
}

export function num(value, digits = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return has(value) ? String(value) : '';
  return n.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function uptime(seconds) {
  const s = Number(seconds);
  if (!Number.isFinite(s) || s < 0) return '';
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m ${sec}s`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function stamp(ms, timeZone) {
  const d = new Date(Number(ms) || Date.now());
  const opts = { dateStyle: 'medium', timeStyle: 'medium', hour12: false, timeZone: timeZone || undefined };
  try {
    return d.toLocaleString('en-GB', opts);
  } catch {
    return d.toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'medium', hour12: false });
  }
}

export function zoneOffset(timeZone, ms) {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' }).formatToParts(new Date(Number(ms) || Date.now()));
    const name = (parts.find((p) => p.type === 'timeZoneName') || {}).value || '';
    return name.replace(/^GMT/, 'UTC') || null;
  } catch {
    return null;
  }
}

const COMMON_RATIOS = [[32, 9], [21, 9], [20, 9], [19.5, 9], [18, 9], [16, 9], [4, 3], [1, 1]];

export function ratioParts(width, height) {
  const w = Number(width);
  const h = Number(height);
  if (!Number.isFinite(w) || !Number.isFinite(h) || w <= 0 || h <= 0) return { raw: '', ratio: '', common: '' };
  const long = Math.max(w, h);
  const short = Math.min(w, h);
  const raw = (long / short).toFixed(2);
  let common = '';
  let best = Infinity;
  for (const [a, b] of COMMON_RATIOS) {
    const diff = Math.abs(long / short - a / b);
    if (diff < best) {
      best = diff;
      common = a % 1 === 0 && b % 1 === 0 ? a + ':' + b : a + ':' + b;
    }
  }
  return { raw, ratio: raw, common: best < 0.06 ? common : '' };
}

export function duration(ms) {
  const n = Number(ms);
  if (!Number.isFinite(n) || n <= 0) return '';
  const h = Math.floor(n / 3.6e6);
  const m = Math.floor((n % 3.6e6) / 6e4);
  const s = Math.floor((n % 6e4) / 1000);
  return h ? h + 'h ' + m + 'm' : m + 'm ' + s + 's';
}

export function card({ head = 'chip', title, sub = '', trail = '', body = '', flush = false, filter = true }) {
  if (!body || !String(body).trim()) return '';
  return `<section class="card"${filter ? '' : ' data-nofilter'}>
  <div class="card-head">
    <div class="head-icon">${icon(head, 20)}</div>
    <div class="head-text"><h3 class="head-title">${esc(title)}</h3>${sub ? `<p class="head-sub">${esc(sub)}</p>` : ''}</div>
    ${trail ? `<div class="head-trail">${trail}</div>` : ''}
  </div>
  <div class="card-body${flush ? ' flush' : ''}">${body}</div>
</section>`;
}

export function hero({ name, sub = '', trail = '', chips: items = [] }) {
  const badge = items.length ? chips(items) : '';
  return `<div class="hero">
    <div class="hero-top">
      <div>
        <h2 class="hero-name">${esc(name)}</h2>
        ${sub ? `<p class="hero-sub">${esc(sub)}</p>` : ''}
      </div>
      ${trail ? `<div class="head-trail">${trail}</div>` : ''}
    </div>
    ${badge}
  </div>`;
}

export function facts(items, stack = false) {
  const rows = items.filter((it) => it && has(it.value) && has(it.label));
  if (!rows.length) return '';
  const html = rows
    .map((it) => {
      const wide = it.wrap ? ' wide' : '';
      return `<div class="fact${wide}"><span class="fact-label">${esc(it.label)}</span><span class="fact-value${it.accent ? ' accent' : ''}">${it.value}</span></div>`;
    })
    .join('');
  return `<div class="facts${stack ? ' stacked' : ''}">${html}</div>`;
}

export function tiles(items) {
  const kept = items.filter((t) => t && has(t.value) && has(t.label));
  if (!kept.length) return '';
  return `<div class="tiles">${kept
    .map((t) => {
      return `<div class="tile">
      ${t.icon ? `<span class="tile-icon">${icon(t.icon, 17)}</span>` : ''}
      <div class="tile-label">${esc(t.label)}</div>
      <div class="tile-value${t.accent ? ' accent' : ''}">${t.value}</div>
      ${has(t.sub) ? `<div class="tile-sub">${esc(t.sub)}</div>` : ''}
    </div>`;
    })
    .join('')}</div>`;
}

export function meter(label, value, max, unit = '', tone) {
  if (!Number.isFinite(Number(value))) return '';
  const ratio = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  const auto = tone || (ratio > 90 ? 'err' : ratio > 75 ? 'warn' : '');
  let shown;
  if (unit === '%') shown = value.toFixed(1) + '%';
  else if (unit === '°C') shown = value.toFixed(1) + ' °C' + (max ? ' / ' + max + ' °C' : '');
  else if (unit === 'Hz') shown = hz(value) + (max ? ' / ' + hz(max) : '');
  else shown = bytes(value) + (max ? ' / ' + bytes(max) : '');
  return `<div class="meter-row">
    <div class="meter-head"><span class="fact-label">${esc(label)}</span><span class="meter-value type-mono">${esc(shown)}</span></div>
    <div class="meter"><div class="meter-fill ${auto}" style="width:${ratio}%"></div></div>
  </div>`;
}

export function gauge(label, percent, centerValue) {
  const p = Number.isFinite(Number(percent)) ? Math.max(0, Math.min(100, Number(percent))) : 0;
  return `<div class="gauge-row">
    <div class="gauge" style="--p:${p}">
      <div class="gauge-inner">
        <div class="gauge-value">${centerValue !== undefined ? centerValue : p.toFixed(0) + '%'}</div>
        <div class="gauge-label">${esc(label)}</div>
      </div>
    </div>
    <div class="gauge-info">${centerValue !== undefined ? `<div class="meter-head"><span class="fact-label">Load</span><span class="meter-value type-mono">${p.toFixed(1)}%</span></div>` : ''}</div>
  </div>`;
}

export function batt(level) {
  const v = Number(level);
  const p = Number.isFinite(v) ? Math.max(0, Math.min(100, v)) : 0;
  const tone = p <= 15 ? 'err' : p <= 30 ? 'warn' : '';
  return `<span class="batt"><span class="batt-shell"><span class="batt-fill ${tone}" style="width:${p}%"></span></span><span class="type-mono" style="font-size:13px">${p}%</span></span>`;
}

export function chip(text, tone = '') {
  return `<span class="chip ${tone}">${esc(text)}</span>`;
}

export function chips(items) {
  return `<div class="hero-chips">${items.filter(Boolean).map((i) => (typeof i === 'string' ? chip(i) : chip(i.text, i.tone))).join('')}</div>`;
}

export function rows(items) {
  const kept = items.filter((it) => it && has(it.value) && has(it.label));
  if (!kept.length) return '';
  return `<div class="kv-list">${kept
    .map((it) => `<div class="kv${it.wrap ? ' wide' : ''}"><span class="kv-label">${esc(it.label)}</span><span class="kv-value">${it.value}</span></div>`)
    .join('')}</div>`;
}

export function sectionBody(parts) {
  return parts.filter(Boolean).join('');
}
