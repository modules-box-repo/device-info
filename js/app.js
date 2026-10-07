// Boots the app and wires tabs and live updates

import { fetchSnapshot, fetchSection, fetchCoreFreqs, cached } from './api.js';
import { restoreTheme, toggleTheme, currentTheme } from './theme.js';
import { icon } from './ui.js';
import { renderDevice, subtitleOf } from './tabs/device.js';
import { renderCpu, renderGpu, renderMemory, updateCoreBars } from './tabs/hardware.js';
import { renderScreen } from './tabs/screen.js';
import { renderStorage, renderBattery, renderNetwork } from './tabs/storage.js';
import { renderThermal } from './tabs/thermal.js';
import { renderSystem } from './tabs/system.js';
import { startLive as startBrowserLive } from './browser.js';

const TABS = [
  { id: 'device', label: 'Device', head: 'device', render: renderDevice, section: 'device' },
  { id: 'cpu', label: 'CPU', head: 'cpu', render: renderCpu, section: 'cpu' },
  { id: 'gpu', label: 'GPU', head: 'gpu', render: renderGpu, section: 'gpu' },
  { id: 'screen', label: 'Screen', head: 'screen', render: renderScreen, section: 'screen' },
  { id: 'memory', label: 'Memory', head: 'memory', render: renderMemory, section: 'memory' },
  { id: 'storage', label: 'Storage', head: 'storage', render: renderStorage, section: 'storage' },
  { id: 'battery', label: 'Battery', head: 'battery', render: renderBattery, section: null, client: true },
  { id: 'network', label: 'Network', head: 'network', render: renderNetwork, section: 'network' },
  { id: 'thermal', label: 'Thermal', head: 'thermal', render: renderThermal, section: 'thermal' },
  { id: 'system', label: 'System', head: 'system', render: renderSystem, section: 'system' }
];

const dom = {
  bar: document.getElementById('app-bar'),
  tabBar: document.getElementById('tab-bar'),
  indicator: document.getElementById('tab-indicator'),
  content: document.getElementById('content'),
  scroll: document.getElementById('scroll'),
  subtitle: document.getElementById('subtitle'),
  theme: document.getElementById('theme-btn'),
  themeIcon: document.getElementById('theme-icon'),
  snackbar: document.getElementById('snackbar')
};

let activeId = 'device';
let snackTimer = null;
let refreshing = false;
let pendingRefresh = false;

function storageGet(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {}
}

function buildTabs() {
  dom.tabBar.innerHTML =
    TABS.map(
      (t) =>
        `<button class="tab${t.id === activeId ? ' active' : ''}" data-tab="${t.id}" type="button">${icon(t.head, 17)}<span>${t.label}</span></button>`
    ).join('') + '<div class="tab-indicator" id="tab-indicator"></div>';

  dom.indicator = document.getElementById('tab-indicator');
  dom.tabBar.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab');
    if (!btn) return;
    setActive(btn.dataset.tab);
  });
}

function moveIndicator() {
  const el = dom.tabBar.querySelector('.tab.active');
  if (!el || !dom.indicator) return;
  dom.indicator.style.width = el.offsetWidth + 'px';
  dom.indicator.style.transform = 'translateX(' + el.offsetLeft + 'px)';
}

function setActive(id, skipHash) {
  if (!TABS.some((t) => t.id === id)) return;
  activeId = id;

  dom.tabBar.querySelectorAll('.tab').forEach((el) => el.classList.toggle('active', el.dataset.tab === id));
  const activeEl = dom.tabBar.querySelector('.tab.active');
  if (activeEl) activeEl.scrollIntoView({ block: 'nearest', inline: 'center' });

  moveIndicator();
  if (!skipHash) history.replaceState(null, '', '#' + id);
  storageSet('device-info-tab', id);

  dom.scroll.scrollTop = 0;
  render();
  refresh();
}

function skeletons() {
  return [0, 1, 2]
    .map(
      (i) =>
        `<section class="card" style="animation-delay:${i * 70}ms">
          <div class="card-head">
            <div class="skeleton" style="width:38px;height:38px;border-radius:16px"></div>
            <div class="head-text"><div class="skeleton" style="height:13px;width:${60 + i * 12}%"></div><div class="skeleton" style="height:10px;width:${30 + i * 8}%;margin-top:7px"></div></div>
          </div>
          <div class="card-body"><div class="skeleton" style="height:74px"></div></div>
        </section>`
    )
    .join('');
}

function render() {
  const tab = TABS.find((t) => t.id === activeId) || TABS[0];
  const needsServer = !!tab.section;
  const data = cached();

  if (needsServer && !data) {
    dom.content.innerHTML = skeletons();
    return;
  }

  dom.content.innerHTML = tab.render(data || {});
  dom.subtitle.textContent = subtitleOf(data || {});
  moveIndicator();
}

function snack(message) {
  dom.snackbar.textContent = message;
  dom.snackbar.classList.add('show');
  clearTimeout(snackTimer);
  snackTimer = setTimeout(() => dom.snackbar.classList.remove('show'), 2600);
}

const reported = new Set();

function reportError(message) {
  const text = String(message || 'unknown error');
  if (reported.has(text)) return;
  reported.add(text);
  fetch('/api/log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    body: JSON.stringify({ at: new Date().toISOString(), url: location.pathname + location.hash, message: text })
  }).catch(() => {});
}

function watchErrors() {
  window.addEventListener('error', (e) => reportError(e.message + ' @ ' + (e.filename || '') + ':' + (e.lineno || 0)));
  window.addEventListener('unhandledrejection', (e) => reportError('unhandled rejection: ' + (e.reason && e.reason.message ? e.reason.message : e.reason)));
}

async function refresh() {
  const tab = TABS.find((t) => t.id === activeId) || TABS[0];
  const target = tab.section;

  if (refreshing) {
    pendingRefresh = true;
    return;
  }

  refreshing = true;

  try {
    if (target) {
      await fetchSection(target);
    } else if (!cached()) {
      await fetchSnapshot();
    }
    if (activeId === tab.id) {
      render();
    }
  } catch (err) {
    snack('Failed to read system data: ' + err.message);
    reportError('snapshot failed: ' + err.message);
  } finally {
    dom.content.classList.remove('loading');
    refreshing = false;
    if (pendingRefresh) {
      pendingRefresh = false;
      refresh();
    }
  }
}

async function load() {
  dom.content.classList.add('loading');
  await refresh();
}

function paintTheme() {
  dom.themeIcon.innerHTML = icon(currentTheme() === 'dark' ? 'moon' : 'sun', 21);
}

function ripple(e) {
  const host = e.target.closest('.btn, .chip, .icon-btn, .tab, .tile, .fact, .cluster, .core, .zone, .group, .cmd');
  if (!host) return;
  const rect = host.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = size + 'px';
  span.style.height = size + 'px';
  span.style.left = e.clientX - rect.left - size / 2 + 'px';
  span.style.top = e.clientY - rect.top - size / 2 + 'px';
  host.appendChild(span);
  setTimeout(() => span.remove(), 540);
}

function bind() {
  dom.theme.addEventListener('click', () => {
    const next = toggleTheme();
    paintTheme();
    snack(next === 'dark' ? 'Dark theme' : 'Light theme');
  });

  dom.scroll.addEventListener(
    'scroll',
    () => {
      dom.bar.classList.toggle('scrolled', dom.scroll.scrollTop > 4);
    },
    { passive: true }
  );

  document.addEventListener('pointerdown', ripple);
  window.addEventListener('resize', moveIndicator);

  window.addEventListener('offline', () => snack('Offline'));
}

function start() {
  restoreTheme();
  paintTheme();
  startBrowserLive();

  const hash = location.hash.slice(1);
  const stored = storageGet('device-info-tab');
  activeId = TABS.some((t) => t.id === hash) ? hash : TABS.some((t) => t.id === stored) ? stored : TABS[0].id;

  watchErrors();
  buildTabs();
  bind();
  moveIndicator();
  render();
  load();

  window.addEventListener('hashchange', () => {
    const id = location.hash.slice(1);
    if (id && id !== activeId) setActive(id, true);
  });

  setInterval(() => {
    if (activeId === 'cpu' && !document.hidden) tickCoreFreqs();
  }, 500);
}

let coreBusy = false;

async function tickCoreFreqs() {
  if (coreBusy) return;
  coreBusy = true;
  try {
    const data = await fetchCoreFreqs();
    if (activeId === 'cpu') updateCoreBars(dom.content, data);
  } catch (err) {
    reportError('core freqs failed: ' + err.message);
  } finally {
    coreBusy = false;
  }
}

start();