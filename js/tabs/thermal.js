// Renders the Thermal tab

import { card, hero, rows, meter, has, esc, num, chips } from '../ui.js';

function temp(t) {
  return has(t) ? Number(t).toFixed(1) + ' °C' : '';
}

function tone(t) {
  const n = Number(t);
  if (!Number.isFinite(n)) return '';
  if (n >= 45) return 'err';
  if (n >= 38) return 'warn';
  return 'ok';
}

function zoneList(items) {
  if (!items || !items.length) return '';
  return `<div class="zones">${items
    .map(
      (z) => `<div class="zone">
        <span class="zone-name">${esc(z.name || z.type)}</span>
        <span class="zone-type">${esc(z.type)}</span>
        <span class="zone-temp type-mono ${tone(z.max)}">${esc(temp(z.max))}</span>
      </div>`
    )
    .join('')}</div>`;
}

function groupList(groups) {
  if (!groups || !groups.length) return '';
  return `<div class="groups">${groups
    .map(
      (g) => `<div class="group">
        <div class="group-head">
          <span class="group-name">${esc(g.group)}</span>
          <span class="group-temp type-mono ${tone(g.max)}">${esc(temp(g.max))}</span>
        </div>
        ${meter('Peak zone', g.max, 95, '°C')}
        <div class="group-meta">${g.zones.length} zone${g.zones.length === 1 ? '' : 's'}</div>
      </div>`
    )
    .join('')}</div>`;
}

export function renderThermal(d) {
  const t = d.thermal || {};

  const summary = card({
    head: 'thermal',
    title: 'Key temperatures',
    sub: 'Read from the thermal sysfs zones',
    trail: chips([
      has(t.cpuTemp) ? { text: 'CPU ' + temp(t.cpuTemp), tone: tone(t.cpuTemp) } : null,
      has(t.gpuTemp) ? { text: 'GPU ' + temp(t.gpuTemp), tone: tone(t.gpuTemp) } : null
    ]),
    body:
      rows([
        { label: 'CPU package', value: temp(t.cpuTemp), accent: true },
        { label: 'GPU', value: temp(t.gpuTemp), accent: true },
        { label: 'Battery', value: t.batteryTemp ? temp(t.batteryTemp) : '' },
        { label: 'Skin', value: t.skinTemp ? temp(t.skinTemp) : '' },
        { label: 'Charger', value: t.chargerTemp ? temp(t.chargerTemp) : '' },
        { label: 'Memory', value: t.memoryTemp ? temp(t.memoryTemp) : '' },
        { label: 'Modem', value: t.modemTemp ? temp(t.modemTemp) : '' },
        { label: 'Display', value: t.displayTemp ? temp(t.displayTemp) : '' },
        { label: 'Zone count', value: has(t.totalZones) ? num(t.totalZones) : '' }
      ]) +
      (has(t.cpuTemp) ? meter('CPU temperature', t.cpuTemp, 95, '°C') : '') +
      (has(t.gpuTemp) ? meter('GPU temperature', t.gpuTemp, 95, '°C') : '')
  });

  const batteryCard = card({
    head: 'battery',
    title: 'Battery thermistors',
    sub: t.batteryTemps && t.batteryTemps.length ? t.batteryTemps.length + ' sensors' : '',
    flush: true,
    body: zoneList(t.batteryTemps)
  });

  const skinCard = card({
    head: 'display',
    title: 'Skin sensors',
    sub: t.skinTemps && t.skinTemps.length ? t.skinTemps.length + ' sensors' : '',
    flush: true,
    body: zoneList(t.skinTemps)
  });

  const groupCard = card({
    head: 'thermal',
    title: 'Groups',
    sub: 'Junk zones filtered, peak per group',
    flush: true,
    body: groupList(t.groups)
  });

  const rawCard = card({
    head: 'chip',
    title: 'All zones',
    sub: has(t.totalZones) ? num(t.totalZones) + ' exposed by the kernel' : '',
    flush: true,
    body: zoneList(t.zones)
  });

  return [
    hero({
      name: 'Thermal',
      sub: has(t.cpuTemp) ? 'CPU ' + temp(t.cpuTemp) + ' · GPU ' + temp(t.gpuTemp) : '',
      chips: [has(t.totalZones) ? t.totalZones + ' zones' : null, has(t.groupCount) ? t.groupCount + ' groups' : null]
    }),
    summary,
    batteryCard,
    skinCard,
    groupCard,
    rawCard
  ].join('');
}