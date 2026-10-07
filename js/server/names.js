// Maps raw hardware identifiers to human names

const CPU_PARTS = {
  '0xd46': 'Cortex-A510',
  '0xd47': 'Cortex-A710',
  '0xd48': 'Cortex-A710',
  '0xd4f': 'Cortex-A510',
  '0xd80': 'Cortex-A520',
  '0xd81': 'Cortex-A720',
  '0xd82': 'Cortex-X4',
  '0xd84': 'Cortex-X3',
  '0xd85': 'Cortex-X925',
  '0xd87': 'Cortex-A725',
  '0xd8e': 'Neoverse-N2',
  '0xd8f': 'Cortex-A725',
  '0xd93': 'Cortex-A725',
  '0xd07': 'Cortex-A57',
  '0xd08': 'Cortex-A72',
  '0xd09': 'Cortex-A73',
  '0xd0a': 'Cortex-A75',
  '0xd0b': 'Cortex-A76',
  '0xd0c': 'Neoverse-N1',
  '0xd0d': 'Cortex-A77',
  '0xd0e': 'Cortex-A76',
  '0xd13': 'Cortex-R820',
  '0xd40': 'Neoverse-V1',
  '0xd41': 'Cortex-A78',
  '0xd42': 'Cortex-A78AE',
  '0xd44': 'Cortex-A510',
  '0xd45': 'Cortex-A710',
  '0xd49': 'Neoverse-N2',
  '0xd4b': 'Cortex-A78',
  '0xd4c': 'Cortex-X1',
  '0xd4d': 'Cortex-X1',
  '0xd4e': 'Cortex-A510',
  '0x000': 'Cortex-A5',
  '0x001': 'Cortex-A7',
  '0x002': 'Cortex-A8',
  '0x003': 'Cortex-A9',
  '0x004': 'Cortex-A15',
  '0x005': 'Cortex-A17',
  '0x006': 'Cortex-A19',
  '0x007': 'Cortex-R4',
  '0x008': 'Cortex-R7',
  '0x009': 'Neoverse-N1',
  '0x00a': 'Cortex-A35',
  '0x00b': 'Cortex-A55',
  '0x00c': 'Cortex-A65',
  '0x00d': 'Cortex-A75',
  '0x00e': 'Exynos-M1',
  '0x00f': 'Exynos-M3',
  '0xd03': 'Cortex-A53',
  '0xd04': 'Cortex-A35',
  '0xd05': 'Cortex-A55',
  '0xd06': 'Cortex-A65',
  '0xd0a0': 'Cortex-A510',
  '0xd0b0': 'Cortex-A710',
  '0xd0c0': 'Cortex-X1',
  '0xd40a': 'Cortex-A78',
  '0xd41a': 'Cortex-A78'
};

const SOC_NAMES = {
  SM8650: 'Snapdragon 8 Gen 3',
  SM8750: 'Snapdragon 8 Elite',
  SM8850: 'Snapdragon 8 Elite Gen 5',
  SM8550: 'Snapdragon 8 Gen 2',
  SM8475: 'Snapdragon 8+ Gen 1',
  SM8450: 'Snapdragon 8 Gen 1',
  SM8350: 'Snapdragon 888',
  SM8250: 'Snapdragon 865',
  SM8150: 'Snapdragon 855',
  SM8125: 'Snapdragon 860',
  SM6375: 'Snapdragon 680',
  SM6325: 'Snapdragon 695',
  SM6115: 'Snapdragon 460',
  SM8250AB: 'Snapdragon 865',
  SM8350AB: 'Snapdragon 888',
  MT6983: 'Dimensity 9300',
  MT6893: 'Dimensity 1200',
  MT6877: 'Dimensity 1080',
  MT6873: 'Dimensity 720',
  MT6785: 'Helio G90T',
  MT6853: 'Helio G99',
  MT6765: 'Helio G80',
  Exynos2400: 'Exynos 2400',
  Exynos2200: 'Exynos 2200',
  Exynos2100: 'Exynos 2100',
  Exynos1480: 'Exynos 1480',
  Exynos1380: 'Exynos 1380',
  Exynos1280: 'Exynos 1280',
  Exynos9820: 'Exynos 9820',
  Exynos9610: 'Exynos 9611',
  gs101: 'Tensor',
  gs201: 'Tensor G2',
  gs301: 'Tensor G3',
  gs400: 'Tensor G4',
  gs500: 'Tensor G5',
  apple: 'Apple silicon',
  A17Pro: 'Apple A17 Pro',
  A18: 'Apple A18',
  A19: 'Apple A19',
  A17: 'Apple A17',
  A16: 'Apple A16',
  A15: 'Apple A15',
  A14: 'Apple A14',
  M1: 'Apple M1',
  M2: 'Apple M2',
  M3: 'Apple M3',
  M4: 'Apple M4'
};

const ISA_FLAGS = [
  ['asimd', 'NEON'],
  ['asimddp', 'FP16 dual'],
  ['asimdhp', 'FP16 half'],
  ['asimdfhm', 'FP16 FMA'],
  ['fphp', 'FP16'],
  ['aes', 'AES'],
  ['sha1', 'SHA-1'],
  ['sha2', 'SHA-2'],
  ['sha3', 'SHA-3'],
  ['sm3', 'SM3'],
  ['sm4', 'SM-4'],
  ['crc32', 'CRC32'],
  ['atomics', 'Atomics'],
  ['lrcpc', 'LR/SC'],
  ['fcma', 'Fused multiply-add'],
  ['dit', 'Dot product'],
  ['frint', 'FP rounding'],
  ['i8mm', 'Int8 matrix'],
  ['bf16', 'BFloat16'],
  ['bti', 'Branch identification'],
  ['ecv', 'Control flow protection'],
  ['pac', 'Pointer auth'],
  ['paca', 'PAC generic'],
  ['pacg', 'PAC generic'],
  ['sb', 'Shadow stack'],
  ['afp', 'Indirect branch'],
  ['flagm', 'Flag manipulation'],
  ['flagm2', 'Flag manipulation 2'],
  ['dcpop', 'Data cache clean'],
  ['dcpodp', 'Data cache clean PoDP'],
  ['jscvt', 'JSIMD rounding'],
  ['uscat', 'User space CAT'],
  ['ilrcpc', 'Privileged load/store'],
  ['dgh', 'DIT / tagged pointers'],
  ['evtstrm', 'Event stream'],
  ['cpuid', 'CPUID access'],
  ['aes', 'AES']
];

const THERMAL_GROUPS = [
  ['CPU', /^cpu|^cpuss\d*|^soc|^ap_therm|^tsens/],
  ['GPU', /^gpu|^gpuss|^g3s|^adreno|^mali/],
  ['NPU', /^npu|^neural/],
  ['Battery', /^batt|^battery/],
  ['Charger', /^usb|^chg|^charger|^wlc/],
  ['Skin', /^skin|^case|^shell/],
  ['Camera', /^cam|^rear-tof|^tof/],
  ['Wi-Fi', /^wlan|^wifi|^wireless/],
  ['Modem', /^modem|^sub1_|^aoss|^pa-|^rmnet|^mrq|^mwc|^mhi|^nsp/],
  ['Memory', /^ddr|^lpddr|^sram|^dram|^mem/],
  ['Display', /^disp|^lcd|^panel|^mdss|^mdmss|^sde|^dsi|^mhl|^svooc|^video/],
  ['PMIC', /^pm.*_tz$|^pm.*_usr$|^pmic/],
  ['Audio', /^audio|^snd|^spmi|^cdsp|^tfa|^ipa/]
];

const THERMAL_JUNK = /(bcl|ibat)-lvl\d*|^(bcl_warn|vbat|usb|socd|skin_boot)$|^(epm|sdr|mmw|sub1|mwd|shm|amoled|quiet)\d*(_[a-z0-9]+)*$/;

const IFACE_KINDS = [
  [/^wlan|^wifi|^ath/, 'Wi-Fi'],
  [/^r?_?rmnet|^ccmni|^pdp|^wwan|^cellular/, 'Mobile data'],
  [/^tun|^tap|^vgate|^vpn|^ppp|^norai|^tinc/, 'VPN / tunnel'],
  [/^lo$|^loop/, 'Loopback'],
  [/^swlan|^ap\d|^softap|^wlp/, 'Hotspot'],
  [/^eth|^en|^enp/, 'Ethernet'],
  [/^usb|^rndis|^ncm/, 'USB tethering'],
  [/^dummy/, 'Placeholder']
];

const IMPLEMENTERS = {
  '0x41': 'ARM',
  '0x42': 'Broadcom',
  '0x43': 'Cavium',
  '0x44': 'DEC',
  '0x4e': 'NVIDIA',
  '0x50': 'APM',
  '0x51': 'Qualcomm',
  '0x53': 'Samsung',
  '0x56': 'Marvell',
  '0x61': 'Apple',
  '0x69': 'Intel',
  '0xc0': 'Ampere'
};

const ISA_LEVELS = { 3: 'ARMv3', 4: 'ARMv4', 5: 'ARMv5', 6: 'ARMv6', 7: 'ARMv7', 8: 'ARMv8', 9: 'ARMv9' };

function implementerName(code) {
  if (!code) return null;
  const raw = String(code).trim().toLowerCase();
  if (IMPLEMENTERS[raw]) return IMPLEMENTERS[raw];
  const value = parseInt(raw.replace(/^0x/, ''), 16);
  if (!Number.isFinite(value)) return null;
  return IMPLEMENTERS['0x' + value.toString(16)] || '0x' + value.toString(16);
}

function isaLevel(arch) {
  const n = Number(arch);
  if (!Number.isFinite(n) || n <= 0) return null;
  return ISA_LEVELS[n] || 'ARMv' + n;
}

function cpuName(part) {
  if (!part) return null;
  return CPU_PARTS[String(part).toLowerCase()] || null;
}

function socName(soc) {
  if (!soc) return null;
  const key = String(soc).trim();
  if (SOC_NAMES[key]) return SOC_NAMES[key];
  const upper = key.toUpperCase();
  if (SOC_NAMES[upper]) return SOC_NAMES[upper];
  for (const id of Object.keys(SOC_NAMES)) {
    if (id.toUpperCase() === upper) return SOC_NAMES[id];
  }
  return null;
}

function isaFeatures(raw) {
  const set = new Set(String(raw || '').split(/\s+/).filter(Boolean));
  const out = [];
  const seen = new Set();
  for (const [code, label] of ISA_FLAGS) {
    if (set.has(code) && !seen.has(label)) {
      seen.add(label);
      out.push({ code, label });
    }
  }
  return out;
}

function thermalJunk(type) {
  return THERMAL_JUNK.test(String(type || '').toLowerCase());
}

function thermalGroup(type) {
  const t = String(type || '').toLowerCase();
  for (const [group, re] of THERMAL_GROUPS) {
    if (re.test(t)) return group;
  }
  return null;
}

function ifaceKind(name) {
  const n = String(name || '').toLowerCase();
  for (const [re, kind] of IFACE_KINDS) {
    if (re.test(n)) return kind;
  }
  return 'Interface';
}

function storageType(device) {
  const name = String(device || '').replace('/dev/block/', '');
  if (/^ufshc/.test(name) || /^1d84000/.test(name)) return 'UFS';
  if (/^sdhci|^mmcblk/.test(name)) return 'eMMC';
  if (/^dm-|^mmcblk\d+p|^sda\d+$/.test(name)) return 'Block layer';
  return null;
}

module.exports = {
  cpuName,
  socName,
  implementerName,
  isaLevel,
  isaFeatures,
  thermalJunk,
  thermalGroup,
  ifaceKind,
  storageType
};
