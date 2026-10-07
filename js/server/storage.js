// Collects storage volumes and network interfaces

const { trim, list, run, num } = require('./util');
const { ifaceKind, storageType } = require('./names');
const getprop = require('./getprop');

const KEEP = [/^\/$/, /^\/data$/, /^\/storage\/emulated$/, /^\/storage\/[0-9a-f]{4}-[0-9a-f-]{8,}$/i];

const FS_LABEL = {
  f2fs: 'F2FS',
  ext4: 'ext4',
  ext3: 'ext3',
  ext2: 'ext2',
  erofs: 'EROFS',
  btrfs: 'Btrfs',
  xfs: 'XFS',
  vfat: 'exFAT',
  sdcardfs: 'FUSE',
  fuseblk: 'NTFS',
  overlay: 'Overlay'
};

async function gatherStorage() {
  const [mountsRaw, partRaw] = await Promise.all([trim('/proc/mounts', 131072), trim('/proc/partitions', 32768)]);

  const wanted = new Set();
  if (mountsRaw) {
    for (const line of mountsRaw.split('\n')) {
      const p = line.split(/\s+/);
      if (p.length < 4) continue;
      if (KEEP.some((re) => re.test(p[1]))) wanted.add(p[1]);
    }
  }
  if (!wanted.size) wanted.add('/');

  const targets = [...wanted];
  const [allRes, listRes] = await Promise.all([
    run('df', ['-k'], 2500),
    run('df', ['-k', ...targets], 2500)
  ]);

  const stats = {};
  for (const res of [allRes, listRes]) {
    if (!res.ok) continue;
    for (const line of res.stdout.split('\n').slice(1)) {
      const p = line.trim().split(/\s+/);
      if (p.length < 6) continue;
      stats[p.slice(5).join(' ')] = {
        device: p[0],
        totalBytes: num(p[1]) * 1024,
        usedBytes: num(p[2]) * 1024,
        freeBytes: num(p[3]) * 1024,
        usePercent: num(p[4])
      };
    }
  }

  const deepest = (mount) => {
    const hits = Object.keys(stats).filter((m) => m === mount || m.startsWith(mount + '/'));
    if (!hits.length) return null;
    return hits.sort((a, b) => b.length - a.length)[0];
  };

  const volumes = [];
  const seen = new Set();
  for (const mount of wanted) {
    const resolved = deepest(mount);
    const stat = resolved ? stats[resolved] : null;
    if (!stat || seen.has(resolved)) continue;
    seen.add(resolved);
    let fstype = null;
    if (mountsRaw) {
      for (const line of mountsRaw.split('\n')) {
        const p = line.split(/\s+/);
        if (p.length >= 4 && p[1] === resolved) {
          fstype = p[2];
          break;
        }
      }
    }
    volumes.push({
      mount: resolved,
      device: stat.device.replace('/dev/block/', ''),
      fs: fstype,
      fsLabel: fstype ? FS_LABEL[fstype] || fstype : null,
      storageType: storageType(stat.device),
      totalBytes: stat.totalBytes,
      usedBytes: stat.usedBytes,
      freeBytes: stat.freeBytes,
      usePercent: stat.usePercent
    });
  }

  volumes.sort((a, b) => (a.totalBytes || 0) - (b.totalBytes || 0));

  const signature = (v) => [v.totalBytes, v.usedBytes, v.freeBytes].join(':');
  const preferred = [...volumes].sort((a, b) => Number(b.mount.startsWith('/storage')) - Number(a.mount.startsWith('/storage')));
  const kept = [];
  const seenSig = new Set();
  for (const v of preferred) {
    const sig = signature(v);
    if (seenSig.has(sig)) continue;
    seenSig.add(sig);
    kept.push(v);
  }
  volumes.length = 0;
  volumes.push(...kept.sort((a, b) => (a.totalBytes || 0) - (b.totalBytes || 0)));

  let partitions = 0;
  if (partRaw) {
    partitions = partRaw.split('\n').length - 2;
  }

  const bootDevice = getprop.value('ro.boot.bootdevice');

  return {
    volumes,
    primary: volumes.length ? volumes[volumes.length - 1] : null,
    partitions: partitions > 0 ? partitions : null,
    bootDevice: bootDevice || null,
    flashType: /ufshc/i.test(bootDevice || '') ? 'UFS' : /sdhci|mmc/i.test(bootDevice || '') ? 'eMMC' : null
  };
}

async function gatherNetwork(ifaces) {
  const out = [];
  for (const name of Object.keys(ifaces)) {
    const addrs = ifaces[name] || [];
    const ipv4 = addrs.filter((a) => a.family === 'IPv4' || a.family === 4);
    const ipv6 = addrs.filter((a) => a.family === 'IPv6' || a.family === 6);
    const mac = addrs.map((a) => a.mac).find((m) => m && m !== '00:00:00:00:00:00') || null;
    const internal = addrs.some((a) => a.internal);
    const kind = ifaceKind(name);
    if (kind === 'Placeholder' || /^ifb/.test(name)) continue;
    out.push({
      name,
      kind,
      internal,
      mac,
      ipv4: ipv4.map((a) => a.address),
      ipv4Cidr: ipv4.map((a) => a.cidr).filter(Boolean),
      ipv6: ipv6.map((a) => a.address),
      ipv6Cidr: ipv6.map((a) => a.cidr).filter(Boolean)
    });
  }

  const order = ['Wi-Fi', 'Mobile data', 'Ethernet', 'VPN / tunnel', 'Hotspot', 'USB tethering', 'Loopback', 'Interface'];
  out.sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind) || a.name.localeCompare(b.name));

  return { interfaces: out, online: null };
}

module.exports = { gatherStorage, gatherNetwork };
