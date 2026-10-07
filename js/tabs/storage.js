// Renders the Storage, Battery and Network tabs

import { card, hero, rows, meter, batt, has, esc, bytes, pct, num, duration, icon } from '../ui.js';
import { browserBasics, liveValues, hasBatteryApi, hasNetworkInformation } from '../browser.js';

function volumeCard(v) {
  const rowsHtml = rows([
    { label: 'Mount point', value: esc(v.mount), wrap: true },
    { label: 'Filesystem', value: has(v.fsLabel) ? esc(v.fsLabel) : has(v.fs) ? esc(v.fs) : '' },
    { label: 'Storage type', value: has(v.storageType) ? esc(v.storageType) : '' },
    { label: 'Capacity', value: bytes(v.totalBytes), accent: true },
    { label: 'Used', value: bytes(v.usedBytes) },
    { label: 'Free', value: bytes(v.freeBytes) },
    { label: 'Use', value: has(v.usePercent) ? pct(v.usePercent) : '' }
  ]);
  const body = rowsHtml + (has(v.usePercent) ? meter('Usage', v.usePercent, 100, '%') : '');
  if (!body) return '';
  return `<section class="card">
    <div class="card-head">
      <div class="head-icon">${icon('storage', 20)}</div>
      <div class="head-text"><h3 class="head-title">${esc(v.mount)}</h3>${has(v.fsLabel) ? `<p class="head-sub">${esc(v.fsLabel)}</p>` : ''}</div>
      <div class="head-trail">${has(v.usePercent) ? pct(v.usePercent) : ''}</div>
    </div>
    <div class="card-body">${body}</div>
  </section>`;
}

export function renderStorage(d) {
  const st = d.storage || {};
  const volumes = st.volumes || [];
  const primary = st.primary;

  const summary = card({
    head: 'storage',
    title: 'User storage',
    sub: primary ? primary.mount : '',
    trail: primary && has(primary.usePercent) ? pct(primary.usePercent) : '',
    body:
      (primary
        ? rows([
            { label: 'Total capacity', value: bytes(primary.totalBytes), accent: true },
            { label: 'Used', value: bytes(primary.usedBytes), accent: true },
            { label: 'Free', value: bytes(primary.freeBytes), accent: true },
            { label: 'Use', value: has(primary.usePercent) ? pct(primary.usePercent) : '' }
          ]) +
          meter('Usage', primary.usePercent, 100, '%')
        : '') +
      rows([
        { label: 'Flash type', value: st.flashType ? esc(st.flashType) : '' },
        { label: 'UFS controller', value: has(st.bootDevice) ? esc(st.bootDevice) : '' },
        { label: 'Partitions', value: has(st.partitions) ? num(st.partitions) : '' }
      ])
  });

  const cards = volumes.map(volumeCard).join('');

  return [
    hero({
      name: 'Storage',
      sub: primary ? bytes(primary.totalBytes) + ' total · ' + bytes(primary.freeBytes) + ' free' : '',
      chips: [st.flashType || null, volumes.length ? volumes.length + ' volumes' : null]
    }),
    summary,
    card({ head: 'files', title: 'Mounted volumes', sub: 'Real block devices only', flush: true, body: cards })
  ].join('');
}

function batteryFromBrowser() {
  const live = liveValues();
  return live.battery || null;
}

export function renderBattery(d) {
  const live = batteryFromBrowser();
  const br = browserBasics();

  const browserCard = card({
    head: 'battery',
    title: 'Battery Status API',
    sub: hasBatteryApi() ? 'Reported by this browser' : 'Not available in this browser',
    body: live && live.supported
      ? rows([
          { label: 'Charge level', value: has(live.level) ? pct(live.level * 100) : '', accent: true },
          { label: 'Charging', value: live.charging ? 'Yes' : 'No' },
          { label: 'Charging time', value: has(live.chargingTime) ? (live.chargingTime === 0 ? 'Full' : duration(live.chargingTime * 1000)) : '' },
          { label: 'Discharge time', value: has(live.dischargingTime) ? (live.dischargingTime === Infinity ? 'Charging' : duration(live.dischargingTime * 1000)) : '' }
        ]) + (has(live.level) ? batt(live.level * 100) : '')
      : ''
  });

  const notes = card({
    head: 'info',
    title: 'Reading notes',
    body: rows([
      { label: 'Battery API', value: hasBatteryApi() ? 'Supported' : 'Not supported' },
      { label: 'Online state', value: br.online ? 'Online' : 'Offline' }
    ])
  });

  return [hero({ name: 'Battery', sub: live && live.supported && has(live.level) ? pct(live.level * 100) + ' · ' + (live.charging ? 'Charging' : 'On battery') : 'No battery telemetry' }), browserCard, notes].join('');
}

function addrList(list, cidrList) {
  const out = [];
  (list || []).forEach((addr, i) => {
    const cidr = (cidrList || [])[i];
    out.push(addr + (cidr ? '/' + cidr : ''));
  });
  return out;
}

export function renderNetwork(d) {
  const net = d.network || {};
  const live = liveValues();
  const br = browserBasics();

  const cards = (net.interfaces || [])
    .map((i) => {
      const v4 = addrList(i.ipv4, i.ipv4Cidr);
      const v6 = addrList(i.ipv6, i.ipv6Cidr);
      const body = rows([
        { label: 'Interface', value: esc(i.name), wrap: true },
        { label: 'Type', value: esc(i.kind) },
        { label: 'IPv4', value: v4.length ? esc(v4.join(', ')) : '', wrap: true },
        { label: 'IPv6', value: v6.length ? esc(v6.slice(0, 4).join(', ')) + (v6.length > 4 ? ' (+' + (v6.length - 4) + ')' : '') : '', wrap: true },
        { label: 'Scope', value: i.internal ? 'Loopback' : 'External' }
      ]);
      if (!body) return '';
      return `<section class="card">
        <div class="card-head">
          <div class="head-icon">${icon('network', 20)}</div>
          <div class="head-text"><h3 class="head-title">${esc(i.name)}</h3><p class="head-sub">${esc(i.kind)}</p></div>
        </div>
        <div class="card-body">${body}</div>
      </section>`;
    })
    .join('');

  const quality = card({
    head: 'network',
    title: 'Network Information API',
    sub: hasNetworkInformation() ? 'Reported by this browser' : 'Not available in this browser',
    body:
      rows([
        { label: 'Online', value: br.online ? 'Yes' : 'No' },
        { label: 'Effective type', value: has(live.net && live.net.effectiveType) ? esc(live.net.effectiveType) : '' },
        { label: 'Downlink', value: has(live.net && live.net.downlink) ? num(live.net.downlink, 2) + ' Mbit/s' : '' },
        { label: 'Round trip time', value: has(live.net && live.net.rtt) ? num(live.net.rtt) + ' ms' : '' },
        { label: 'Data saver', value: has(live.net && live.net.saveData) ? (live.net.saveData ? 'On' : 'Off') : '' }
      ])
  });

  return [
    hero({
      name: 'Network',
      sub: (net.interfaces || []).filter((i) => i.ipv4 && i.ipv4.length).length + ' active interfaces',
      chips: ['IPv4', 'IPv6']
    }),
    quality,
    card({ head: 'network', title: 'Interfaces', sub: 'Classified by name prefix', flush: true, body: cards })
  ].join('');
}