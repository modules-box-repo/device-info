// Builds one full device snapshot

const os = require('os');
const getprop = require('./getprop');
const cpuinfo = require('./cpuinfo');
const { gatherCpu, gatherGpu, gatherMemory, gatherCoreFreqs } = require('./hardware');
const { gatherStorage, gatherNetwork } = require('./storage');
const { gatherThermal } = require('./thermal');
const {
  gatherIdentity,
  gatherFirmware,
  gatherKernel,
  gatherRuntime,
  gatherSecurity,
  gatherHardware,
  gatherTelephony,
  gatherScreen
} = require('./system');

const SECTIONS = ['device', 'cpu', 'gpu', 'screen', 'memory', 'storage', 'network', 'thermal', 'system', 'hardware', 'telephony'];

let fixed = null;

async function loadFixed() {
  await getprop.load();
  const cpu = await cpuinfo.load();
  const [identity, firmware, kernel, runtime, security, hardware, telephony, screen] = await Promise.all([
    gatherIdentity(),
    gatherFirmware(),
    gatherKernel(),
    gatherRuntime(),
    gatherSecurity(),
    gatherHardware(),
    gatherTelephony(),
    gatherScreen()
  ]);

  fixed = {
    identity,
    firmware,
    kernel,
    runtime,
    security,
    hardware,
    telephony,
    cpuIdentity: cpu,
    screenFixed: screen,
    properties: getprop.pick(getprop.keys()),
    propertyCount: getprop.total(),
    host: os.hostname()
  };
  return fixed;
}

function ensureFixed() {
  return fixed || loadFixed();
}

async function coreFreqs() {
  const base = await ensureFixed();
  return { time: Date.now(), cores: await gatherCoreFreqs(base.cpuIdentity) };
}

async function gatherDynamic() {
  const base = await ensureFixed();
  const [cpu, gpu, memory, thermal, storage, network, screen] = await Promise.all([
    gatherCpu(base.cpuIdentity),
    gatherGpu(),
    gatherMemory(),
    gatherThermal(),
    gatherStorage(),
    gatherNetwork(os.networkInterfaces()),
    base.screenFixed || gatherScreen()
  ]);

  return {
    cpu,
    gpu,
    memory,
    thermal,
    storage,
    network,
    screen
  };
}

function meta(started, extra) {
  return Object.assign(
    {
      time: started,
      iso: new Date(started).toISOString(),
      durationMs: Date.now() - started,
      host: os.hostname(),
      port: process.env.PORT || null,
      propertyCount: getprop.total(),
      propertyAllowed: fixed ? Object.keys(fixed.properties).length : 0,
      getpropOk: getprop.available(),
      blocked: '/proc/stat, /proc/net/*, /sys/class/net/*, /sys/block, /proc/diskstats, /proc/loadavg, /proc/modules, /proc/cmdline, /sys/class/power_supply, /system/build.prop, /sys/class/backlight, /sys/class/graphics'
    },
    extra
  );
}

async function buildSection(name) {
  const started = Date.now();
  const base = await ensureFixed();

  if (name === 'device') {
    return { meta: meta(started, { section: name }), device: base.identity, firmware: base.firmware, kernel: base.kernel };
  }

  if (name === 'system') {
    return {
      meta: meta(started, { section: name }),
      device: base.identity,
      firmware: base.firmware,
      kernel: base.kernel,
      runtime: Object.assign({}, base.runtime, { uptimeSeconds: Math.floor(os.uptime()) }),
      security: base.security,
      telephony: base.telephony
    };
  }

  const dynamic = await gatherDynamic();

  if (name === 'cpu') return { meta: meta(started, { section: name }), cpu: dynamic.cpu };
  if (name === 'gpu') return { meta: meta(started, { section: name }), gpu: dynamic.gpu, thermal: dynamic.thermal };
  if (name === 'screen') return { meta: meta(started, { section: name }), screen: dynamic.screen };
  if (name === 'memory') return { meta: meta(started, { section: name }), memory: dynamic.memory };
  if (name === 'storage') return { meta: meta(started, { section: name }), storage: dynamic.storage };
  if (name === 'network') return { meta: meta(started, { section: name }), network: dynamic.network };
  if (name === 'thermal') return { meta: meta(started, { section: name }), thermal: dynamic.thermal };
  if (name === 'hardware') return { meta: meta(started, { section: name }), hardware: base.hardware };
  if (name === 'telephony') return { meta: meta(started, { section: name }), telephony: base.telephony };

  return null;
}

async function buildAll() {
  const started = Date.now();
  const base = await ensureFixed();
  const dynamic = await gatherDynamic();

  return {
    meta: meta(started, { section: 'all' }),
    device: base.identity,
    firmware: base.firmware,
    kernel: base.kernel,
    runtime: Object.assign({}, base.runtime, { uptimeSeconds: Math.floor(os.uptime()) }),
    security: base.security,
    telephony: base.telephony,
    cpu: dynamic.cpu,
    gpu: dynamic.gpu,
    memory: dynamic.memory,
    storage: dynamic.storage,
    network: dynamic.network,
    thermal: dynamic.thermal,
    screen: dynamic.screen
  };
}

async function snapshot(section) {
  if (!section || section === 'all') return buildAll();
  if (!SECTIONS.includes(section)) return null;
  return buildSection(section);
}

module.exports = { snapshot, loadFixed, coreFreqs, SECTIONS };
