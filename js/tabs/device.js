// Renders the Device tab

import { card, hero, rows, chips, stamp, zoneOffset, uptime, has, esc, num } from '../ui.js';

function titleOf(d) {
  const device = d.device || {};
  const firmware = d.firmware || {};
  const brand = device.brand || device.manufacturer || '';
  const model = device.marketName || device.model || '';
  const name = [brand, model].filter(Boolean).join(' ').trim();
  return name || device.model || device.codename || 'Device';
}

export function renderDevice(d) {
  const device = d.device || {};
  const firmware = d.firmware || {};
  const kernel = d.kernel || {};
  const runtime = d.runtime || {};
  const security = d.security || {};
  const telephony = d.telephony || {};

  const zone = device.timezone || null;
  const offset = zone ? zoneOffset(zone, d.meta.time) : null;

  const heroChips = [
    has(zone) ? { text: zone + (offset ? ' (' + offset + ')' : ''), tone: 'info' } : null,
    has(firmware.buildId) ? firmware.buildId : null,
    has(firmware.securityPatch) ? { text: 'Patch ' + firmware.securityPatch, tone: security.secure ? 'ok' : '' } : null,
    device.treble ? 'Treble' : null
  ];

  const identity = card({
    head: 'device',
    title: 'Identity',
    sub: device.codename || device.product || '',
    body: rows([
      { label: 'Brand', value: has(device.brand) ? esc(device.brand) : '' },
      { label: 'Manufacturer', value: has(device.manufacturer) ? esc(device.manufacturer) : '' },
      { label: 'Model', value: has(device.model) ? esc(device.model) : '' },
      { label: 'Market name', value: has(device.marketName) ? esc(device.marketName) : '' },
      { label: 'Product', value: has(device.product) ? esc(device.product) : '' },
      { label: 'Device', value: has(device.codename) ? esc(device.codename) : '' },
      { label: 'Board', value: has(device.board) ? esc(device.board) : '' },
      { label: 'Hardware', value: has(device.hardware) ? esc(device.hardware) : '' },
      { label: 'Region', value: has(telephony.country) ? esc(telephony.country.toUpperCase()) : '' },
      { label: 'Locale', value: has(device.locale) ? esc(device.locale) : '' }
    ])
  });

  const platform = card({
    head: 'chip',
    title: 'Platform',
    body: rows([
      { label: 'Android', value: has(device.androidRelease) ? 'Android ' + esc(device.androidRelease) + ' (API ' + esc(device.androidSdk) + ')' : '' },
      { label: 'ABIs', value: Array.isArray(device.abis) && device.abis.length ? esc(device.abis.join(', ')) : has(device.abi) ? esc(device.abi) : '' },
      { label: 'First API level', value: has(device.firstApiLevel) ? 'API ' + esc(device.firstApiLevel) : '' },
      { label: 'Vendor API level', value: has(device.vendorApiLevel) ? 'API ' + esc(device.vendorApiLevel) : '' },
      { label: 'Architecture', value: has(runtime.arch) ? esc(runtime.arch) : '' },
      { label: 'Host', value: has(runtime.hostType) ? esc(runtime.hostType) : '' },
      { label: 'Uptime', value: has(runtime.uptimeSeconds) ? uptime(runtime.uptimeSeconds) : '', accent: true },
      { label: 'Snapshot', value: stamp(d.meta.time, zone), wrap: true }
    ])
  });

  const firmwareCard = card({
    head: 'build',
    title: 'Firmware',
    sub: firmware.customRom || firmware.buildId || '',
    body: rows([
      { label: 'Build ID', value: esc(firmware.buildId || '') },
      { label: 'Display ID', value: esc(firmware.displayId || ''), wrap: true },
      { label: 'ROM', value: esc(firmware.customRom || '') },
      { label: 'Incremental', value: esc(firmware.incremental || ''), wrap: true },
      { label: 'Type', value: esc(firmware.buildType || '') },
      { label: 'Tags', value: esc(firmware.tags || '') },
      { label: 'Built', value: esc(firmware.buildDate || ''), wrap: true },
      { label: 'Baseband', value: esc(firmware.baseband || '') },
      { label: 'Fingerprint', value: esc(firmware.fingerprint || ''), wrap: true },
      { label: 'Description', value: esc(firmware.description || ''), wrap: true }
    ])
  });

  const updates = card({
    head: 'clock',
    title: 'Updates and integrity',
    body: rows([
      { label: 'Security patch', value: has(firmware.securityPatch) ? esc(firmware.securityPatch) + (has(firmware.securityPatchAge) ? ' (' + esc(firmware.securityPatchAge) + ' days ago)' : '') : '', accent: true },
      { label: 'Verified boot', value: has(firmware.verifiedBoot) ? esc(firmware.verifiedBoot) : '' },
      { label: 'VBMeta', value: esc(firmware.vbmetaState || '') },
      { label: 'Bootloader', value: has(firmware.flashLocked) ? (firmware.flashLocked ? 'Locked' : 'Unlocked') : '' },
      { label: 'AVB version', value: esc(firmware.avbVersion || '') },
      { label: 'A/B slots', value: has(firmware.abUpdate) ? (firmware.abUpdate ? 'Enabled' : 'Disabled') : '' },
      { label: 'Slot', value: has(firmware.slotSuffix) ? esc(firmware.slotSuffix) : '' },
      { label: 'Dynamic partitions', value: has(firmware.dynamicPartitions) ? (firmware.dynamicPartitions ? 'Yes' : 'No') : '' }
    ])
  });

  const securityCard = card({
    head: 'lock',
    title: 'Security',
    body: rows([
      { label: 'SELinux', value: has(security.selinux) ? esc(security.selinux) : '', accent: true },
      { label: 'Context', value: esc(security.context || ''), wrap: true },
      { label: 'Encryption', value: has(security.cryptoState) ? esc(security.cryptoState) + (has(security.cryptoType) ? ' (' + esc(security.cryptoType) + ')' : '') : '' },
      { label: 'User build', value: security.secure ? 'No' : 'Yes' },
      { label: 'Debuggable', value: security.debuggable ? 'Yes' : 'No' },
      { label: 'ADB secure', value: security.adbSecure ? 'Yes' : '' },
      { label: 'Hardware keystore', value: security.hardwareKeystore || '' },
      { label: 'Hardware gatekeeper', value: security.hardwareGatekeeper || '' },
      { label: 'Linux features', value: has(security.featureCount) ? num(security.featureCount) + ' enabled' : '', wrap: true }
    ])
  });

  return [
    hero({ name: titleOf(d), sub: [firmware.displayId, device.board].filter(Boolean).map(esc).join(' · '), chips: heroChips }),
    identity,
    platform,
    firmwareCard,
    updates,
    securityCard
  ].join('');
}

export function subtitleOf(d) {
  const device = d.device || {};
  const runtime = d.runtime || {};
  const name = [device.brand, device.marketName || device.model].filter(Boolean).join(' ');
  const rel = has(device.androidRelease) ? 'Android ' + device.androidRelease : has(runtime.hostType) ? runtime.hostType : 'Linux';
  return [name || device.codename, rel, runtime.arch].filter(Boolean).join(' · ');
}

