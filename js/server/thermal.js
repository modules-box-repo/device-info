// Reads thermal zones and groups them by subsystem

const { trim, list, num } = require('./util');
const { thermalJunk, thermalGroup } = require('./names');

const SYS = '/sys/class/thermal';

const zoneNames = [];

async function loadZoneTypes() {
  const names = (await list(SYS)).filter((n) => /^thermal_zone\d+$/.test(n)).sort((a, b) => num(a.slice(12)) - num(b.slice(12)));
  const types = await Promise.all(
    names.map(async (name) => {
      const raw = await trim(SYS + '/' + name + '/type');
      return { name, type: raw || null };
    })
  );
  zoneNames.length = 0;
  zoneNames.push(...types.filter((z) => z.type && !thermalJunk(z.type)));
  return zoneNames;
}

async function gatherThermal() {
  if (!zoneNames.length) await loadZoneTypes();

  const zones = await Promise.all(
    zoneNames.map(async (z) => {
      const raw = await trim(SYS + '/' + z.name + '/temp', 4096);
      const milli = num(raw);
      const tempC = milli === null ? null : milli / 1000;
      if (tempC === null || tempC <= -100 || tempC > 150) return null;
      return { name: z.name, type: z.type, tempC, group: thermalGroup(z.type) };
    })
  );

  const live = zones.filter(Boolean);

  const byGroup = {};
  for (const z of live) {
    const key = z.group || 'Other';
    const entry = byGroup[key] || (byGroup[key] = { group: key, max: null, zones: [] });
    entry.zones.push(z);
    if (entry.max === null || z.tempC > entry.max) entry.max = z.tempC;
  }

  const groups = Object.values(byGroup)
    .filter((g) => g.max !== null)
    .sort((a, b) => b.max - a.max);
  const groupTemp = (name) => {
    const g = groups.find((x) => x.group === name);
    return g ? g.max : null;
  };
  const cpuZones = live.filter((z) => z.group === 'CPU');
  const gpuZones = live.filter((z) => z.group === 'GPU');
  const hottest = (list) => (list.length ? list.reduce((a, b) => (b.tempC > a.tempC ? b : a)) : null);
  const topCpu = hottest(cpuZones);

  return {
    zones: live,
    groups,
    maxTemp: live.length ? Math.max(...live.map((z) => z.tempC)) : null,
    cpuTemp: topCpu ? topCpu.tempC : null,
    cpuZoneType: topCpu ? topCpu.type : null,
    gpuTemp: gpuZones.length ? Math.max(...gpuZones.map((z) => z.tempC)) : null,
    batteryTemp: groupTemp('Battery'),
    chargerTemp: groupTemp('Charger'),
    memoryTemp: groupTemp('Memory'),
    modemTemp: groupTemp('Modem'),
    displayTemp: groupTemp('Display'),
    skinTemp: groupTemp('Skin'),
    batteryTemps: live.filter((z) => z.group === 'Battery').map((z) => ({ name: z.name, type: z.type, tempC: z.tempC })),
    skinTemps: live.filter((z) => z.group === 'Skin').map((z) => ({ name: z.name, type: z.type, tempC: z.tempC })),
    totalZones: live.length,
    groupCount: groups.length,
    ungroupedCount: live.filter((z) => !z.group).length
  };
}

module.exports = { loadZoneTypes, gatherThermal };
