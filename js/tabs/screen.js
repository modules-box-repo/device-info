// Renders the Screen tab

import { card, hero, rows, facts, tiles, has, esc, num, ratioParts } from '../ui.js';
import { browserBasics } from '../browser.js';

function dpiLabel(dpi) {
  const n = Number(dpi);
  if (!Number.isFinite(n) || n <= 0) return '';
  const known = { 120: 'ldpi', 160: 'mdpi', 213: 'tvdpi', 240: 'hdpi', 320: 'xhdpi', 480: 'xxhdpi', 640: 'xxxhdpi' };
  return known[n] || n + ' dpi';
}

function dprOf(density) {
  const n = Number(density);
  if (!Number.isFinite(n) || n <= 160) return '';
  return (n / 160).toFixed(2).replace(/\.?0+$/, '');
}

export function renderScreen(d) {
  const s = d.screen || {};
  const phys = s.physical || {};
  const ovr = s.override || {};
  const physRatio = ratioParts(phys.width, phys.height);
  const ovrRatio = ratioParts(ovr.width, ovr.height);
  const br = browserBasics();

  const display = card({
    head: 'screen',
    title: 'Panel',
    sub: s.displayHardware || '',
    body: rows([
      { label: 'Physical resolution', value: has(phys.width) ? esc(phys.width + ' x ' + phys.height) : '', accent: true },
      { label: 'Physical pixel density', value: has(s.physicalDensity) ? esc(s.physicalDensity) + ' dpi' + (dpiLabel(s.physicalDensity) ? ' (' + esc(dpiLabel(s.physicalDensity)) + ')' : '') : '' },
      { label: 'LCD density', value: has(s.lcdDensity) ? esc(s.lcdDensity) + ' dpi' : '' },
      { label: 'Physical aspect ratio', value: has(physRatio.raw) ? esc(physRatio.raw) + (physRatio.common ? ' (' + esc(physRatio.common) + ')' : '') : '' },
      { label: 'Panel diagonal', value: has(s.diagonalInches) ? esc(s.diagonalInches) + ' in (' + esc(s.diagonalCm) + ' cm)' : '' },
      { label: 'Refresh rate', value: has(s.refreshRate) ? esc(s.refreshRate) + ' Hz' : '', accent: true },
      { label: 'Peak refresh rate', value: has(s.peakRefreshRate) ? esc(s.peakRefreshRate) + ' Hz' : '' },
      { label: 'Display hardware', value: esc(s.displayHardware || '') }
    ])
  });

  const override = card({
    head: 'display',
    title: 'Current override',
    sub: ovr.width ? 'Resolution and density set by the system' : '',
    body: rows([
      { label: 'Override resolution', value: has(ovr.width) ? esc(ovr.width + ' x ' + ovr.height) : '' },
      { label: 'Override density', value: has(s.overrideDensity) ? esc(s.overrideDensity) + ' dpi' + (dpiLabel(s.overrideDensity) ? ' (' + esc(dpiLabel(s.overrideDensity)) + ')' : '') : '' },
      { label: 'Override aspect ratio', value: has(ovrRatio.raw) ? esc(ovrRatio.raw) + (ovrRatio.common ? ' (' + esc(ovrRatio.common) + ')' : '') : '' },
      { label: 'Scale factor', value: has(s.overrideDensity) ? esc(dprOf(s.overrideDensity)) + 'x' : '', accent: true },
      { label: 'Stable size', value: has(s.stable) ? esc(s.stable.width + ' x ' + s.stable.height) : '' },
      { label: 'Panel default', value: has(s.defaultResolution) ? esc(s.defaultResolution.width + ' x ' + s.defaultResolution.height) : '' },
      { label: 'Panel low mode', value: has(s.lowResolution) ? esc(s.lowResolution.width + ' x ' + s.lowResolution.height) : '' }
    ])
  });

  const tilesHtml = tiles([
    { label: 'Pixels', value: has(phys.width) ? num(Number(phys.width) * Number(phys.height)) : '', icon: 'screen' },
    { label: 'Aspect', value: physRatio.common || physRatio.raw, icon: 'display' },
    { label: 'Refresh', value: has(s.refreshRate) ? s.refreshRate + ' Hz' : '', icon: 'clock' },
    { label: 'Scale', value: has(s.overrideDensity) ? dprOf(s.overrideDensity) + 'x' : '', icon: 'chip' }
  ]);

  const browserCard = card({
    head: 'display',
    title: 'Browser view',
    sub: 'What this page actually renders at',
    body: rows([
      { label: 'Viewport', value: esc(window.innerWidth + ' x ' + window.innerHeight) },
      { label: 'Screen', value: esc(window.screen.width + ' x ' + window.screen.height) },
      { label: 'Device pixel ratio', value: has(br.dpr) ? num(br.dpr, 2) : '' },
      { label: 'Available screen', value: esc(window.screen.availWidth + ' x ' + window.screen.availHeight) },
      { label: 'Color depth', value: window.screen.colorDepth ? window.screen.colorDepth + ' bit' : '' },
      { label: 'Orientation', value: window.screen.orientation ? esc(window.screen.orientation.type) : '' }
    ])
  });

  return [
    hero({
      name: 'Screen',
      sub: has(phys.width) ? esc(phys.width + ' x ' + phys.height + ' · ' + physRatio.raw + ':1') : '',
      chips: [physRatio.common ? physRatio.common : null, has(s.refreshRate) ? s.refreshRate + ' Hz' : null, has(s.overrideDensity) ? dprOf(s.overrideDensity) + 'x' : null]
    }),
    display,
    override,
    card({ head: 'info', title: 'At a glance', body: tilesHtml }),
    browserCard
  ].join('');
}