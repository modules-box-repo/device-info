// Collects identity, kernel, runtime, and security data

const os = require('os');
const { run, trim, text, num, firstValue } = require('./util');
const getprop = require('./getprop');

const WM = ['/system/bin/wm', '/vendor/bin/wm', '/system/xbin/wm'];

function wmBinary() {
  for (const p of WM) {
    try {
      if (require('fs').existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function patchAge(date) {
  const stamp = Date.parse(String(date || '').replace(/(\d{4})-(\d{2})-(\d{2}).*/, '$1-$2-$3T00:00:00Z'));
  if (!Number.isFinite(stamp)) return null;
  return Math.max(0, Math.floor((Date.now() - stamp) / 86400000));
}

async function gatherIdentity() {
  const p = getprop.pick([
    'ro.product.model',
    'ro.product.brand',
    'ro.product.manufacturer',
    'ro.product.marketname',
    'ro.vendor.oplus.market.enname',
    'ro.product.name',
    'ro.product.device',
    'ro.product.board',
    'ro.product.cpu.abi',
    'ro.product.cpu.abilist',
    'ro.product.first_api_level',
    'ro.build.version.release',
    'ro.build.version.sdk',
    'ro.vendor.api_level',
    'persist.sys.locale',
    'persist.sys.timezone'
  ]);

  const market = firstValue(p['ro.vendor.oplus.market.enname'], p['ro.product.marketname']);

  return {
    brand: p['ro.product.brand'] || null,
    manufacturer: p['ro.product.manufacturer'] || null,
    model: p['ro.product.model'] || null,
    marketName: market || null,
    product: p['ro.product.name'] || null,
    codename: p['ro.product.device'] || null,
    board: p['ro.product.board'] || getprop.value('ro.board.platform') || null,
    hardware: getprop.value('ro.hardware') || null,
    abi: p['ro.product.cpu.abi'] || null,
    abis: (p['ro.product.cpu.abilist'] || '').split(',').filter(Boolean),
    firstApiLevel: p['ro.product.first_api_level'] || null,
    vendorApiLevel: p['ro.vendor.api_level'] || null,
    androidRelease: p['ro.build.version.release'] || null,
    androidSdk: p['ro.build.version.sdk'] || null,
    locale: p['persist.sys.locale'] || null,
    timezone: p['persist.sys.timezone'] || null,
    treble: getprop.value('ro.treble.enabled') === 'true'
  };
}

async function gatherFirmware() {
  const p = getprop.pick([
    'ro.build.id',
    'ro.build.display.id',
    'ro.build.version.incremental',
    'ro.build.version.oplusrom',
    'ro.build.type',
    'ro.build.tags',
    'ro.build.date',
    'ro.build.fingerprint',
    'ro.build.description',
    'ro.build.user',
    'ro.build.host',
    'ro.build.version.security_patch',
    'ro.build.version.security_qpatch',
    'ro.build.ab_update',
    'ro.build.characteristics',
    'ro.boot.verifiedbootstate',
    'ro.boot.vbmeta.device_state',
    'ro.boot.flash.locked',
    'ro.boot.avb_version',
    'ro.boot.vbmeta.avb_version',
    'ro.boot.slot_suffix',
    'ro.boot.dynamic_partitions',
    'ro.boot.hardware_revision',
    'ro.virtual_ab.enabled',
    'ro.gsm.version.baseband',
    'gsm.version.baseband'
  ]);

  return {
    buildId: p['ro.build.id'] || null,
    displayId: p['ro.build.display.id'] || null,
    incremental: p['ro.build.version.incremental'] || null,
    customRom: p['ro.build.version.oplusrom'] || null,
    buildType: p['ro.build.type'] || null,
    tags: p['ro.build.tags'] || null,
    buildDate: p['ro.build.date'] || null,
    fingerprint: p['ro.build.fingerprint'] || null,
    description: p['ro.build.description'] || null,
    buildUser: p['ro.build.user'] || null,
    buildHost: p['ro.build.host'] || null,
    securityPatch: p['ro.build.version.security_patch'] || null,
    securityPatchAge: patchAge(p['ro.build.version.security_patch']),
    securityQpatch: p['ro.build.version.security_qpatch'] || null,
    verifiedBoot: p['ro.boot.verifiedbootstate'] || null,
    vbmetaState: p['ro.boot.vbmeta.device_state'] || null,
    flashLocked: p['ro.boot.flash.locked'] === '1' ? true : p['ro.boot.flash.locked'] === '0' ? false : null,
    avbVersion: firstValue(p['ro.boot.avb_version'], p['ro.boot.vbmeta.avb_version']),
    slotSuffix: p['ro.boot.slot_suffix'] || null,
    dynamicPartitions: p['ro.boot.dynamic_partitions'] === 'true',
    virtualAb: p['ro.virtual_ab.enabled'] === 'true',
    abUpdate: p['ro.build.ab_update'] === 'true',
    hardwareRevision: p['ro.boot.hardware_revision'] || null,
    baseband: firstValue(p['ro.gsm.version.baseband'], p['gsm.version.baseband'])
  };
}

async function gatherKernel() {
  const [banner, rel, ver, all] = await Promise.all([
    trim('/proc/version', 8192),
    run('uname', ['-r'], 1200),
    run('uname', ['-v'], 1200),
    run('uname', ['-a'], 1200)
  ]);

  const release = rel.ok ? rel.stdout : null;
  const version = ver.ok ? ver.stdout : null;
  const match = String(release || '').match(/^(\d+)\.(\d+)(?:\.(\d+))?-([a-z0-9]+)/i);
  const gki = String(release || '').match(/-([a-z]+\d+)-/i);

  return {
    release,
    version,
    banner: banner || version || null,
    uname: all.ok ? all.stdout : null,
    family: match ? match[1] + '.' + match[2] : null,
    sublevel: match && match[3] ? match[3] : null,
    gki: gki ? gki[1] : null
  };
}

async function gatherRuntime() {
  return {
    uptimeSeconds: Math.floor(os.uptime()),
    arch: os.arch(),
    platform: process.platform,
    node: process.version,
    hostType: os.type(),
    kernelRelease: os.release()
  };
}

async function gatherSecurity() {
  const [ctx, idRes, features] = await Promise.all([
    trim('/proc/self/attr/current', 1024),
    run('id', [], 1200),
    run('pm', ['list', 'features'], 4000)
  ]);

  const p = getprop.pick([
    'ro.crypto.state',
    'ro.crypto.type',
    'ro.debuggable',
    'ro.secure',
    'ro.adb.secure',
    'ro.hardware.keystore',
    'ro.hardware.gatekeeper',
    'ro.build.version.security_patch'
  ]);

  const keystore = getprop.byPrefix('ro.hardware.keystore.');

  const list = features.ok
    ? features.stdout
        .split('\n')
        .map((l) => l.replace(/^feature:/, '').trim())
        .filter(Boolean)
    : [];

  return {
    selinux: ctx ? (ctx.match(/^u:r:([^:]+):/) || [null, null])[1] : null,
    context: ctx ? ctx.replace(/\0+$/, '') : null,
    identity: idRes.ok ? idRes.stdout : null,
    cryptoState: p['ro.crypto.state'] || null,
    cryptoType: p['ro.crypto.type'] || null,
    debuggable: p['ro.debuggable'] === '1',
    secure: p['ro.secure'] === '1',
    adbSecure: p['ro.adb.secure'] === '1',
    hardwareKeystore: p['ro.hardware.keystore'] || null,
    hardwareGatekeeper: p['ro.hardware.gatekeeper'] || null,
    keystore,
    patchAge: patchAge(p['ro.build.version.security_patch']),
    features: list,
    featureCount: list.length
  };
}

async function gatherHardware() {
  return getprop.byPrefix('ro.hardware.');
}

async function gatherTelephony() {
  const p = getprop.pick([
    'gsm.operator.alpha',
    'gsm.operator.numeric',
    'gsm.network.type',
    'gsm.sim.state',
    'gsm.operator.isroaming',
    'gsm.sim.operator.iso-country',
    'ro.telephony.sim.count'
  ]);
  const clean = (v) => {
    if (!v) return null;
    const first = v
      .split(',')
      .map((part) => part.trim())
      .find((part) => part && part !== 'Unknown' && part !== 'ABSENT' && part !== 'false');
    return first || null;
  };
  const out = {
    operator: clean(p['gsm.operator.alpha']),
    operatorNumeric: clean(p['gsm.operator.numeric']),
    networkType: clean(p['gsm.network.type']),
    simState: clean(p['gsm.sim.state']),
    roaming: p['gsm.operator.isroaming'] === 'true',
    roamingKnown: p['gsm.operator.isroaming'] !== undefined && p['gsm.operator.isroaming'] !== '',
    country: clean(p['gsm.sim.operator.iso-country']),
    simCount: num(p['ro.telephony.sim.count'])
  };
  return out;
}

async function gatherScreen() {
  const wm = wmBinary();
  if (!wm) return null;
  const [sizeRes, densityRes] = await Promise.all([run(wm, ['size'], 2500), run(wm, ['density'], 2500)]);
  if (!sizeRes.ok && !densityRes.ok) return null;

  const parse = (text, label) => {
    const m = String(text || '').match(new RegExp(label + '[^0-9]*(\\d+)\\s*x\\s*(\\d+)', 'i'));
    return m ? { width: num(m[1]), height: num(m[2]) } : null;
  };

  const physical = parse(sizeRes.ok ? sizeRes.stdout : '', 'Physical size');
  const override = parse(sizeRes.ok ? sizeRes.stdout : '', 'Override size');
  const stable = parse(sizeRes.ok ? sizeRes.stdout : '', 'Stable size');
  const physicalDensity = num((String(densityRes.ok ? densityRes.stdout : '').match(/Physical density:\s*(\d+)/) || [])[1]);
  const overrideDensity = num((String(densityRes.ok ? densityRes.stdout : '').match(/Override density:\s*(\d+)/) || [])[1]);

  const pair = (value) => {
    const m = String(value || '').match(/(\d+)\s*[,x]\s*(\d+)/);
    return m ? { width: num(m[1]), height: num(m[2]) } : null;
  };

  return {
    physical,
    override,
    stable,
    physicalDensity,
    overrideDensity,
    lcdDensity: num(getprop.value('ro.sf.lcd_density')),
    displayHardware: getprop.value('ro.hardware.display'),
    defaultResolution: pair(getprop.value('ro.oplus.resolution.high')),
    lowResolution: pair(getprop.value('ro.oplus.resolution.low')),
    diagonalInches: num(getprop.value('ro.oplus.display.screenSizeInches.primary')),
    diagonalCm: num(getprop.value('ro.oplus.display.screenSizeCentimeter.primary'))
  };
}

module.exports = {
  gatherIdentity,
  gatherFirmware,
  gatherKernel,
  gatherRuntime,
  gatherSecurity,
  gatherHardware,
  gatherTelephony,
  gatherScreen,
  patchAge
};
