// Renders the System tab

import { card, hero, rows, tiles, uptime, stamp, zoneOffset, has, esc, num } from '../ui.js';

export function renderSystem(d) {
  const runtime = d.runtime || {};
  const kernel = d.kernel || {};
  const security = d.security || {};
  const telephony = d.telephony || {};
  const meta = d.meta || {};
  const device = d.device || {};
  const zone = device.timezone || null;

  const runtimeCard = card({
    head: 'system',
    title: 'Runtime',
    body: rows([
      { label: 'Uptime', value: uptime(runtime.uptimeSeconds), accent: true },
      { label: 'Host type', value: esc(runtime.hostType || '') },
      { label: 'Architecture', value: esc(runtime.arch || '') },
      { label: 'Platform', value: esc(runtime.platform || '') },
      { label: 'Node', value: esc(runtime.node || '') },
      { label: 'Snapshot taken', value: stamp(meta.time, zone), wrap: true },
      { label: 'Collect time', value: has(meta.durationMs) ? num(meta.durationMs) + ' ms' : '' },
      { label: 'Timezone', value: has(zone) ? esc(zone) + (zoneOffset(zone, meta.time) ? ' (' + esc(zoneOffset(zone, meta.time)) + ')' : '') : '' }
    ])
  });

  const kernelCard = card({
    head: 'kernel',
    title: 'Kernel',
    sub: kernel.release || '',
    body: rows([
      { label: 'Release', value: esc(kernel.release || ''), wrap: true },
      { label: 'Family', value: has(kernel.family) ? esc(kernel.family) : '' },
      { label: 'GKI branch', value: esc(kernel.gki || '') },
      { label: 'Version', value: esc(kernel.version || ''), wrap: true },
      { label: 'uname', value: esc(kernel.uname || ''), wrap: true }
    ])
  });

  const telephonyCard = card({
    head: 'sim',
    title: 'Telephony',
    sub: has(telephony.country) ? telephony.country.toUpperCase() : '',
    body: rows([
      { label: 'Operator', value: esc(telephony.operator || '') },
      { label: 'Network type', value: esc(telephony.networkType || '') },
      { label: 'SIM state', value: esc(telephony.simState || '') },
      { label: 'Roaming', value: telephony.roamingKnown ? (telephony.roaming ? 'Yes' : 'No') : '' },
      { label: 'Country', value: has(telephony.country) ? esc(telephony.country.toUpperCase()) : '' },
      { label: 'Baseband', value: esc((d.firmware || {}).baseband || '') }
    ])
  });

  const tilesHtml = tiles([
    { label: 'Uptime', value: uptime(runtime.uptimeSeconds), icon: 'clock' },
    { label: 'SELinux', value: has(security.selinux) ? security.selinux : '', icon: 'lock' },
    { label: 'Boot state', value: (d.firmware || {}).verifiedBoot || '', icon: 'chip' },
    { label: 'Thermal zones', value: has((d.thermal || {}).totalZones) ? num(d.thermal.totalZones) : '', icon: 'thermal' }
  ]);

  return [
    hero({
      name: 'System',
      sub: [runtime.hostType, runtime.arch].filter(Boolean).map(esc).join(' · '),
      chips: [has(zone) ? zone : null, has(security.selinux) ? 'SELinux ' + security.selinux : null]
    }),
    card({ head: 'info', title: 'At a glance', body: tilesHtml }),
    runtimeCard,
    kernelCard,
    telephonyCard
  ].join('');
}