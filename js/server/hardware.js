// Collects cpu clusters, gpu, and memory data

const { trim, list, num, int, firstValue } = require('./util');
const { socName } = require('./names');
const getprop = require('./getprop');

const SYS = '/sys/devices/system/cpu';

const coreCeilings = new Map();

async function gatherCpu(identity) {
  const policyNames = (await list(SYS + '/cpufreq')).filter((n) => /^policy\d+$/.test(n));

  const clusters = await Promise.all(
    policyNames.map(async (policy) => {
      const base = SYS + '/cpufreq/' + policy + '/';
      const [related, cur, max, ceiling, governor, available] = await Promise.all([
        trim(base + 'related_cpus'),
        trim(base + 'scaling_cur_freq'),
        trim(base + 'scaling_max_freq'),
        trim(base + 'cpuinfo_max_freq'),
        trim(base + 'scaling_governor'),
        trim(base + 'scaling_available_frequencies', 4096)
      ]);

      const cpus = (related || '').split(/\s+/).map((v) => int(v)).filter((v) => v !== null);
      for (const id of cpus) coreCeilings.set(id, num(ceiling) || num(max) || 0);
      const parts = cpus.map((id) => (identity.cores[id] || {}).part);
      const part = parts.find(Boolean) || null;
      const name = (identity.cores[cpus[0]] || {}).name || null;

      return {
        id: policy.replace('policy', ''),
        cpus,
        part,
        name,
        governor: governor || null,
        curKhz: num(cur),
        maxKhz: num(max),
        limitKhz: num(ceiling),
        stepCount: available ? available.split(/\s+/).filter((v) => num(v) !== null).length : 0
      };
    })
  );

  const coreFreqs = await Promise.all(
    identity.cores.map(async (core) => {
      const base = SYS + '/cpu' + core.id + '/cpufreq/';
      const [cur, governor] = await Promise.all([trim(base + 'scaling_cur_freq'), trim(base + 'scaling_governor')]);
      return { id: core.id, name: core.name, part: core.part, stepping: core.stepping, curKhz: num(cur), governor: governor || null };
    })
  );

  const socModel = firstValue(getprop.value('ro.soc.model'), getprop.value('ro.board.platform'));
  const names = [...new Set(identity.parts.map((p) => p.name).filter(Boolean))];
  const live = coreFreqs.map((c) => c.curKhz).filter((v) => v > 0);
  const hardwareMax = [...new Set(clusters.map((c) => c.maxKhz).filter((v) => v > 0))];
  const ceilings = [...new Set(clusters.map((c) => c.limitKhz).filter((v) => v > 0))];
  const isaSet = [...new Set(identity.features.map((f) => f.label))];

  return {
    cores: identity.cores.length,
    parts: identity.parts,
    name: names.length > 1 ? names.join(' + ') : names[0] || null,
    soc: firstValue(socName(socModel), socModel),
    socModel: socModel || null,
    socVendor: getprop.value('ro.soc.manufacturer'),
    board: getprop.value('ro.board.platform'),
    implementer: identity.implementerName,
    architecture: identity.isaLevel,
    architectureCode: identity.architecture,
    features: identity.features,
    flagsCount: identity.flagsCount,
    bogoMips: identity.bogoMips,
    isa: isaSet.filter((l) => /^(ARMv|AES|SHA|SIMD|FP|NEON|SVE|CRC|MTE|I8MM|BFloat|RCPC)/.test(l)).join(', ') || null,
    avgKhz: live.length ? Math.round(live.reduce((a, b) => a + b, 0) / live.length) : null,
    minKhz: live.length ? Math.min(...live) : null,
    peakKhz: hardwareMax.length ? Math.max(...hardwareMax) : null,
    ceilingKhz: ceilings.length ? Math.max(...ceilings) : null,
    clusters,
    coreFreqs,
    governors: [...new Set(coreFreqs.map((c) => c.governor).filter(Boolean))]
  };
}

async function gatherGpu() {
  const kgsl = '/sys/class/kgsl/kgsl-3d0/';
  const [model, busy, egl, vulkan] = await Promise.all([
    trim(kgsl + 'gpu_model'),
    trim(kgsl + 'gpubusy'),
    getprop.value('ro.hardware.egl'),
    getprop.value('ro.hardware.vulkan')
  ]);

  const parts = (busy || '').split(/\s+/).map(num);
  const busyPercent = parts.length >= 2 && parts[1] > 0 ? (parts[0] / parts[1]) * 100 : null;

  return {
    model: model || null,
    name: firstValue(model && model.replace(/v\d+$/, ''), null),
    busy,
    busyPercent,
    renderer: null,
    egl: egl || null,
    vulkan: vulkan || null,
    opengles: getprop.value('ro.opengles.version'),
    vulkanVersion: getprop.value('ro.cpuvulkan.version')
  };
}

const MEM_KEYS = {
  totalBytes: 'MemTotal',
  freeBytes: 'MemFree',
  availableBytes: 'MemAvailable',
  buffersBytes: 'Buffers',
  cachedBytes: 'Cached',
  shmemBytes: 'Shmem',
  slabBytes: 'Slab',
  reclaimableBytes: 'SReclaimable',
  activeBytes: 'Active',
  inactiveBytes: 'Inactive',
  anonBytes: 'AnonPages',
  mappedBytes: 'Mapped',
  swapCachedBytes: 'SwapCached',
  swapTotalBytes: 'SwapTotal',
  swapFreeBytes: 'SwapFree'
};

async function gatherMemory() {
  const raw = await trim('/proc/meminfo', 65536);
  if (!raw) return null;

  const kb = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Za-z_()]+):\s+(\d+)/);
    if (m) kb[m[1]] = num(m[2]);
  }

  const out = {};
  for (const key of Object.keys(MEM_KEYS)) {
    const v = kb[MEM_KEYS[key]];
    out[key] = v === null || v === undefined ? null : v * 1024;
  }

  out.usedBytes = out.totalBytes !== null && out.availableBytes !== null ? out.totalBytes - out.availableBytes : null;
  out.usedPercent = out.totalBytes ? (out.usedBytes / out.totalBytes) * 100 : null;
  out.swapUsedBytes = out.swapTotalBytes !== null && out.swapFreeBytes !== null ? out.swapTotalBytes - out.swapFreeBytes : null;
  out.swapUsedPercent = out.swapTotalBytes ? (out.swapUsedBytes / out.swapTotalBytes) * 100 : null;
  out.committedBytes = kb.Committed_AS === undefined ? null : kb.Committed_AS * 1024;

  return out;
}

async function gatherCoreFreqs(identity) {
  if (!coreCeilings.size) await gatherCpu(identity);
  const cores = await Promise.all(
    identity.cores.map(async (core) => {
      const base = SYS + '/cpu' + core.id + '/cpufreq/';
      const [cur, governor] = await Promise.all([trim(base + 'scaling_cur_freq'), trim(base + 'scaling_governor')]);
      return {
        id: core.id,
        name: core.name,
        part: core.part,
        stepping: core.stepping,
        curKhz: num(cur),
        governor: governor || null,
        ceilingKhz: coreCeilings.get(core.id) || 0
      };
    })
  );
  return cores;
}

module.exports = { gatherCpu, gatherGpu, gatherMemory, gatherCoreFreqs };
