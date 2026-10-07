// Parses /proc/cpuinfo into named cores

const { text, num } = require('./util');
const { cpuName, isaFeatures, implementerName, isaLevel } = require('./names');

function normalize(part) {
  const p = String(part || '').trim().toLowerCase();
  return p || null;
}

function revision(code, variant) {
  const v = num(variant);
  const r = num(code);
  if (v === null && r === null) return null;
  return 'r' + (v === null ? '0' : v) + 'p' + (r === null ? '0' : r);
}

function parse(raw) {
  const blocks = [];
  let current = null;

  for (const line of String(raw || '').split('\n')) {
    if (!line.trim()) {
      if (current) blocks.push(current);
      current = null;
      continue;
    }
    const m = line.match(/^([A-Za-z_ ()0-9a-z]+?)\s*:\s*(.*?)\s*$/);
    if (!m) continue;
    if (!current) current = {};
    current[m[1]] = m[2];
  }
  if (current) blocks.push(current);

  const cores = [];
  for (const b of blocks) {
    const id = b.processor === undefined ? null : num(b.processor);
    if (id === null) continue;
    const part = normalize(b['CPU part']);
    cores.push({
      id,
      part,
      name: cpuName(part),
      implementer: normalize(b['CPU implementer']),
      implementerName: implementerName(b['CPU implementer']),
      architecture: num(b['CPU architecture']),
      isaLevel: isaLevel(num(b['CPU architecture'])),
      variant: num(b['CPU variant']),
      revision: num(b['CPU revision']),
      stepping: revision(b['CPU revision'], b['CPU variant']),
      features: b.Features || null
    });
  }

  const distinct = new Map();
  for (const c of cores) {
    if (c.part && !distinct.has(c.part)) distinct.set(c.part, c.name);
  }

  const flags = cores.length ? cores[0].features || '' : '';

  return {
    cores,
    parts: [...distinct.entries()].map(([part, name]) => ({ part, name })),
    features: isaFeatures(flags),
    flagsCount: flags ? flags.split(/\s+/).filter(Boolean).length : 0,
    bogoMips: cores.length ? cores[0].mips : null,
    architecture: cores.length ? cores[0].architecture : null,
    implementer: cores.length ? cores[0].implementer : null,
    implementerName: cores.length ? cores[0].implementerName : null,
    isaLevel: cores.length ? cores[0].isaLevel : null
  };
}

async function load() {
  return parse(await text('/proc/cpuinfo'));
}

module.exports = { load, parse };
