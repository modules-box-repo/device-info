// Reads Android properties once and exposes an allowlisted subset

const { run, parseGetprop } = require('./util');

const EXACT = [
  'ro.product.model',
  'ro.product.brand',
  'ro.product.manufacturer',
  'ro.product.name',
  'ro.product.device',
  'ro.product.board',
  'ro.product.locale',
  'ro.product.first_api_level',
  'ro.product.cpu.abi',
  'ro.product.cpu.abi2',
  'ro.product.cpu.abilist',
  'ro.product.cpu.abilist32',
  'ro.product.cpu.abilist64',
  'ro.product.marketname',
  'ro.vendor.oplus.market.enname',
  'ro.vendor.oplus.market.name',
  'ro.build.version.release',
  'ro.build.version.sdk',
  'ro.build.version.security_patch',
  'ro.build.version.security_qpatch',
  'ro.build.version.incremental',
  'ro.build.version.oplusrom',
  'ro.build.id',
  'ro.build.display.id',
  'ro.build.description',
  'ro.build.type',
  'ro.build.tags',
  'ro.build.date',
  'ro.build.fingerprint',
  'ro.build.user',
  'ro.build.host',
  'ro.build.characteristics',
  'ro.build.ab_update',
  'ro.hardware',
  'ro.board.platform',
  'ro.soc.model',
  'ro.soc.manufacturer',
  'ro.hardware.egl',
  'ro.hardware.vulkan',
  'ro.hardware.display',
  'ro.hardware.fingerprint',
  'ro.opengles.version',
  'ro.cpuvulkan.version',
  'ro.sf.lcd_density',
  'ro.boot.verifiedbootstate',
  'ro.boot.vbmeta.device_state',
  'ro.boot.flash.locked',
  'ro.boot.avb_version',
  'ro.boot.vbmeta.avb_version',
  'ro.boot.slot_suffix',
  'ro.boot.dynamic_partitions',
  'ro.boot.bootdevice',
  'ro.boot.hardware_revision',
  'ro.vendor.api_level',
  'ro.virtual_ab.enabled',
  'ro.treble.enabled',
  'ro.crypto.state',
  'ro.crypto.type',
  'ro.debuggable',
  'ro.secure',
  'ro.adb.secure',
  'ro.telephony.sim.count',
  'ro.gsm.version.baseband',
  'gsm.version.baseband',
  'gsm.version.ril-impl',
  'gsm.operator.alpha',
  'gsm.operator.numeric',
  'gsm.operator.isroaming',
  'gsm.network.type',
  'gsm.sim.state',
  'gsm.sim.operator.iso-country',
  'persist.sys.locale',
  'persist.sys.timezone',
  'ro.kernel.qemu'
];

const PREFIXES = [
  'ro.soc.',
  'ro.hardware.',
  'ro.boot.hardware',
  'ro.vendor.oplus.market.',
  'ro.oplus.display.',
  'ro.oplus.lcd.',
  'ro.oplus.resolution.',
  'ro.oplus.density.',
  'ro.oplus.version.'
];

const DENY = [/^ro\.hardware\.type$/];

const SET = new Set(EXACT);

let all = null;
let count = 0;
let ok = false;

function allowed(key) {
  if (DENY.some((re) => re.test(key))) return false;
  return SET.has(key) || PREFIXES.some((p) => key.startsWith(p));
}

function subset(keys) {
  const out = {};
  if (!all) return out;
  for (const key of keys) {
    if (all[key] !== undefined && all[key] !== '') out[key] = all[key];
  }
  return out;
}

function pick(keys) {
  return subset(keys);
}

function value(key) {
  return all ? all[key] || null : null;
}

function keys() {
  if (!all) return [];
  return Object.keys(all).filter(allowed);
}

function byPrefix(prefix) {
  return subset(keys().filter((k) => k.startsWith(prefix)));
}

function total() {
  return count;
}

function available() {
  return ok;
}

async function load() {
  const res = await run('getprop', [], 3000);
  all = parseGetprop(res.ok ? res.stdout : '');
  count = Object.keys(all).length;
  ok = res.ok && count > 0;
  return all;
}

module.exports = { load, pick, subset, value, keys, byPrefix, total, available, allowed, EXACT, PREFIXES };
