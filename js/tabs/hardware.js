// Renders the CPU, GPU and Memory tabs

import { card, hero, rows, meter, facts, chips, hz, bytes, pct, num, has, esc } from '../ui.js';
import { graphics } from '../browser.js';

function heroLine(cpu) {
  return [cpu.socModel || cpu.soc, cpu.name, cpu.cores ? cpu.cores + ' cores' : null].filter(Boolean).map(esc).join(' · ');
}

function clusterTable(cpu) {
  const clusters = cpu.clusters || [];
  if (!clusters.length) return '';
  const rowsHtml = clusters
    .map((c) => {
      return `<div class="cluster">
        <div class="cluster-head">
          <span class="cluster-name">${esc(c.name || 'Cluster ' + c.id)}</span>
          <span class="chip">${esc('policy ' + c.id)}</span>
          <span class="chip">${esc((c.cpus || []).join(', '))}</span>
          ${has(c.part) ? `<span class="chip">${esc(c.part)}</span>` : ''}
        </div>
        <div class="facts">
          ${facts([
            { label: 'Current', value: hz(c.curKhz), accent: true },
            { label: 'Hardware max', value: hz(c.maxKhz) },
            { label: 'Ceiling', value: hz(c.limitKhz) },
            { label: 'Governor', value: c.governor || '' },
            { label: 'Steps', value: has(c.stepCount) && c.stepCount ? num(c.stepCount) : '' }
          ], true)}
        </div>
      </div>`;
    })
    .join('');
  return `<div class="clusters">${rowsHtml}</div>`;
}

function coreCeilings(cpu) {
  const map = new Map();
  for (const c of cpu.clusters || []) {
    for (const id of c.cpus || []) map.set(id, c.limitKhz || c.maxKhz || 0);
  }
  return map;
}

function coreTable(cpu) {
  const cores = cpu.coreFreqs || [];
  if (!cores.length) return '';
  const ceilings = coreCeilings(cpu);
  return `<div class="cores">${cores
    .map((c) => {
      const ceil = c.ceilingKhz || ceilings.get(c.id) || cpu.ceilingKhz || cpu.peakKhz || 0;
      const bar = coreBar(c.curKhz, ceil);
      return `<div class="core" data-core="${esc(c.id)}">
        <span class="core-id">CPU ${esc(c.id)}</span>
        <span class="core-name">${esc(c.name || '')}</span>
        <span class="core-part">${esc(c.part || '')}${has(c.stepping) ? ' ' + esc(c.stepping) : ''}</span>
        <span class="core-freq type-mono">${esc(hz(c.curKhz))}</span>
        <span class="core-gov">${esc(c.governor || '')}</span>
        ${bar}
      </div>`;
    })
    .join('')}</div>`;
}

function coreRatio(curKhz, ceilingKhz) {
  if (!(ceilingKhz > 0)) return null;
  return Math.max(0, Math.min(100, (curKhz / ceilingKhz) * 100));
}

function coreBar(curKhz, ceilingKhz) {
  const ratio = coreRatio(curKhz, ceilingKhz);
  if (ratio === null) return '';
  const tone = ratio > 90 ? 'err' : ratio > 75 ? 'warn' : '';
  return `<div class="meter-row core-meter">
    <div class="meter-head"><span class="fact-label">Frequency</span><span class="meter-value type-mono">${esc(hz(curKhz))}${ceilingKhz ? ' / ' + esc(hz(ceilingKhz)) : ''}</span></div>
    <div class="meter"><div class="meter-fill ${tone}" style="width:${ratio}%"></div></div>
  </div>`;
}

export function updateCoreBars(root, snapshotData) {
  const cores = (snapshotData || {}).cores || [];
  let touched = 0;
  for (const c of cores) {
    const row = root.querySelector('.core[data-core="' + c.id + '"]');
    if (!row) continue;
    const label = row.querySelector('.core-freq');
    if (label) label.textContent = hz(c.curKhz);
    const value = row.querySelector('.meter-value');
    if (value) value.textContent = hz(c.curKhz) + (c.ceilingKhz ? ' / ' + hz(c.ceilingKhz) : '');
    const fill = row.querySelector('.meter-fill');
    const ratio = coreRatio(c.curKhz, c.ceilingKhz);
    if (fill && ratio !== null) {
      fill.style.width = ratio + '%';
      fill.className = 'meter-fill ' + (ratio > 90 ? 'err' : ratio > 75 ? 'warn' : '');
    }
    const gov = row.querySelector('.core-gov');
    if (gov) gov.textContent = c.governor || '';
    touched += 1;
  }
  return touched;
}

export function renderCpu(d) {
  const cpu = d.cpu || {};
  const avg = cpu.avgKhz;

  const summary = card({
    head: 'cpu',
    title: 'SoC summary',
    sub: cpu.board || cpu.platform || '',
    trail: cpu.governors && cpu.governors.length ? chips([cpu.governors.join(', ')]) : '',
    body:
      facts([
        { label: 'SoC', value: esc(cpu.soc || cpu.socModel || ''), accent: true },
        { label: 'Model', value: esc(cpu.socModel || cpu.name || ''), wrap: true },
        { label: 'Cores', value: has(cpu.cores) ? num(cpu.cores) + ' cores' : '', accent: true },
        { label: 'Threads', value: has(cpu.threads) ? num(cpu.threads) : '' },
        { label: 'Clusters', value: has(cpu.clusters) ? num((cpu.clusters || []).length) : '' },
        { label: 'Revisions', value: Array.isArray(cpu.revisions) && cpu.revisions.length ? esc(cpu.revisions.join(', ')) : '' },
        { label: 'Architecture', value: esc(cpu.arch || '') },
        { label: 'Average clock', value: hz(avg), accent: true },
        { label: 'Peak clock', value: hz(cpu.peakKhz), accent: true },
        { label: 'ISA', value: esc(cpu.isa || '') },
        { label: 'BogoMIPS', value: has(cpu.bogoMips) ? num(cpu.bogoMips) : '' },
        { label: 'Flags', value: has(cpu.flagsCount) ? num(cpu.flagsCount) : '' }
      ], true) +
      '<div class="meter-stack">' +
      meter('Load relative to peak', Math.min(avg, cpu.peakKhz || avg), cpu.peakKhz || avg, 'Hz') +
      meter('Load relative to ceiling', avg, cpu.ceilingKhz || cpu.peakKhz || avg, 'Hz') +
      '</div>'
  });

  const clustersCard = card({
    head: 'cpu',
    title: 'Frequency clusters',
    sub: 'Live cpufreq policy state',
    flush: true,
    body: clusterTable(cpu)
  });

  const coresCard = card({
    head: 'chip',
    title: 'Per-core state',
    flush: true,
    body: coreTable(cpu)
  });

  return [
    hero({ name: cpu.name || 'CPU', sub: heroLine(cpu), chips: [has(cpu.soc) ? esc(cpu.soc) : null, has(cpu.isa) ? esc(cpu.isa) : null] }),
    summary,
    clustersCard,
    coresCard
  ].join('');
}

export function renderGpu(d) {
  const gpu = d.gpu || {};
  const thermal = d.thermal || {};
  const gl = graphics();

  const summary = card({
    head: 'gpu',
    title: 'Adreno',
    sub: gpu.model || '',
    trail: has(gpu.busyPercent) ? chips([{ text: pct(gpu.busyPercent), tone: gpu.busyPercent > 80 ? 'err' : gpu.busyPercent > 50 ? 'warn' : 'ok' }]) : '',
    body:
      facts([
        { label: 'Model', value: esc(gpu.model || ''), accent: true },
        { label: 'Family', value: esc(gpu.name || '') },
        { label: 'Busy', value: has(gpu.busyPercent) ? pct(gpu.busyPercent) : '', accent: true },
        { label: 'GPU temperature', value: has(thermal.gpuTemp) ? thermal.gpuTemp.toFixed(1) + ' °C' : '', accent: true },
        { label: 'EGL driver', value: esc(gpu.egl || '') },
        { label: 'Vulkan driver', value: esc(gpu.vulkan || '') },
        { label: 'OpenGL ES', value: has(gpu.opengles) ? gpuVersion(gpu.opengles) : '' }
      ]) +
      (has(gpu.busyPercent) ? meter('Load', gpu.busyPercent, 100, '%') : '') +
      (has(thermal.gpuTemp) ? meter('Temperature', thermal.gpuTemp, 95, '°C') : '')
  });

  const webglCard = card({
    head: 'display',
    title: 'WebGL',
    sub: gl.renderer || 'Context unavailable',
    body:
      rows([
        { label: 'Renderer', value: esc(gl.renderer || ''), wrap: true },
        { label: 'Vendor', value: esc(gl.vendor || ''), wrap: true },
        { label: 'API', value: esc(gl.glVersion || ''), wrap: true },
        { label: 'WebGL2', value: gl.webgl2 ? 'Yes' : '' },
        { label: 'Shading language', value: esc(gl.shading || '') },
        { label: 'Max texture', value: has(gl.maxTexture) ? num(gl.maxTexture) + ' px' : '' },
        { label: 'Max anisotropy', value: has(gl.anisotropy) ? num(gl.anisotropy) + 'x' : '' },
        { label: 'Float color buffer', value: gl.colorFloat ? 'Yes' : '' }
      ])
  });

  const shared = card({
    head: 'memory',
    title: 'Shared memory',
    sub: 'The Adreno takes RAM from the same pool as the CPU',
    body: rows([
      { label: 'System RAM', value: bytes(d.memory && d.memory.totalBytes) },
      { label: 'Free at load', value: bytes(d.memory && d.memory.availableBytes) }
    ])
  });

  return [hero({ name: gpu.name || 'GPU', sub: gpu.model || '' }), summary, webglCard, shared].join('');
}

export function renderMemory(d) {
  const m = d.memory || {};

  const summary = card({
    head: 'memory',
    title: 'RAM',
    sub: m.totalBytes ? bytes(m.totalBytes) : '',
    trail: has(m.usedPercent) ? chips([{ text: pct(m.usedPercent), tone: m.usedPercent > 90 ? 'err' : m.usedPercent > 75 ? 'warn' : 'ok' }]) : '',
    body:
      facts([
        { label: 'Total', value: bytes(m.totalBytes), accent: true },
        { label: 'Used', value: bytes(m.usedBytes), accent: true },
        { label: 'Available', value: bytes(m.availableBytes), accent: true },
        { label: 'Free', value: bytes(m.freeBytes) },
        { label: 'Cached', value: bytes(m.cachedBytes) },
        { label: 'Buffers', value: bytes(m.buffersBytes) },
        { label: 'Shared', value: bytes(m.shmemBytes) },
        { label: 'Swap total', value: bytes(m.swapTotalBytes) },
        { label: 'Swap used', value: bytes(m.swapUsedBytes) },
        { label: 'Swap cached', value: bytes(m.swapCachedBytes) },
        { label: 'Swap free', value: bytes(m.swapFreeBytes) }
      ]) +
      '<div class="meter-stack">' +
      meter('RAM usage', m.usedBytes, m.totalBytes) +
      meter('Swap usage', m.swapUsedBytes, m.swapTotalBytes) +
      '</div>'
  });

  const detail = card({
    head: 'chip',
    title: 'Breakdown',
    body: rows([
      { label: 'Active', value: bytes(m.activeBytes) },
      { label: 'Inactive', value: bytes(m.inactiveBytes) },
      { label: 'Slab', value: bytes(m.slabBytes) },
      { label: 'Reclaimable', value: bytes(m.reclaimableBytes) },
      { label: 'Anonymous', value: bytes(m.anonBytes) },
      { label: 'Mapped', value: bytes(m.mappedBytes) },
      { label: 'Committed', value: bytes(m.committedBytes) },
      { label: 'Swap used', value: has(m.swapUsedPercent) ? pct(m.swapUsedPercent) : '' }
    ])
  });

  const jsHeap = card({
    head: 'display',
    title: 'Page memory',
    sub: 'This page',
    body: rows([
      { label: 'JS heap in use', value: performance.memory ? bytes(performance.memory.usedJSHeapSize) : '' },
      { label: 'JS heap total', value: performance.memory ? bytes(performance.memory.totalJSHeapSize) : '' },
      { label: 'Heap limit', value: performance.memory ? bytes(performance.memory.jsHeapSizeLimit) : '' }
    ])
  });

  return [hero({ name: 'Memory', sub: m.totalBytes ? bytes(m.totalBytes) + ' total' : '' }), summary, detail, jsHeap].join('');
}

function gpuVersion(code) {
  const n = Number(code);
  if (!Number.isFinite(n)) return esc(code);
  return (n % 10000 === 0 ? n / 10000 : n / 100000).toFixed(1).replace(/\.0$/, '') + ' (' + n + ')';
}

