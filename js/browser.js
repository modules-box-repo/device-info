// Collects browser capabilities and live values

const state = { canvas: null, webgl: null, gl: null, battery: null, net: null, memory: null };

let netBound = false;
let batteryBound = false;

function canvasContext() {
  if (state.canvas !== null) return state.canvas;
  try {
    const probe = document.createElement('canvas');
    probe.width = probe.height = 1;
    state.canvas = probe.getContext('2d') ? probe : false;
  } catch {
    state.canvas = false;
  }
  return state.canvas;
}

function webglContext() {
  if (state.webgl !== null) return state.webgl;
  try {
    const probe = canvasContext();
    if (!probe) {
      state.webgl = false;
      return state.webgl;
    }
    state.gl = probe.getContext('webgl2') || probe.getContext('webgl') || probe.getContext('experimental-webgl') || null;
    state.webgl = !!state.gl;
  } catch {
    state.webgl = false;
  }
  return state.webgl;
}

function shaderInfo(gl) {
  if (!gl) return null;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const raw = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  return String(raw || '').replace(/\s*\(0x[0-9a-f]+\)/gi, '').replace(/\s*ANGLE\s*\(/i, '').replace(/\s+/g, ' ').trim() || null;
}

function shaderVersion(gl) {
  if (!gl) return null;
  return String(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '').trim() || null;
}

export function browserBasics() {
  const cores = navigator.hardwareConcurrency;
  const dpr = window.devicePixelRatio;
  return {
    cores: Number.isFinite(cores) && cores > 0 ? cores : null,
    dpr: Number.isFinite(dpr) ? dpr : null,
    online: navigator.onLine
  };
}

export function storageQuota() {
  if (!navigator.storage || !navigator.storage.estimate) return Promise.resolve(null);
  return navigator.storage
    .estimate()
    .then((est) => ({ usageBytes: est.usage || null, quotaBytes: est.quota || null }))
    .catch(() => null);
}

export function graphics() {
  webglContext();
  if (!state.gl) return { webgl: false, webgl2: false, renderer: null, vendor: null, glVersion: null, shading: null };
  const gl = state.gl;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  return {
    webgl: true,
    webgl2: typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext,
    renderer: shaderInfo(gl),
    vendor: ext ? gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || null : null,
    glVersion: String(gl.getParameter(gl.VERSION) || '').trim() || null,
    shading: shaderVersion(gl),
    maxTexture: gl.getParameter(gl.MAX_TEXTURE_SIZE),
    maxRenderBuffer: gl.getParameter(gl.MAX_RENDERBUFFER_SIZE),
    anisotropy: (() => {
      const a = gl.getExtension('EXT_texture_filter_anisotropic');
      return a ? gl.getParameter(a.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : null;
    })(),
    floatBlend: !!gl.getExtension('EXT_float_blend'),
    colorFloat: !!gl.getExtension('EXT_color_buffer_float')
  };
}

function bindNetwork() {
  if (netBound || typeof window.addEventListener !== 'function') return;
  netBound = true;
  window.addEventListener('online', () => {
    state.net = readNetwork();
  });
  window.addEventListener('offline', () => {
    state.net = readNetwork();
  });
}

function bindBattery() {
  if (batteryBound || typeof navigator.getBattery !== 'function') return;
  batteryBound = true;
  navigator.getBattery().then((manager) => {
    const read = () => {
      state.battery = {
        level: Number.isFinite(manager.level) ? manager.level : null,
        charging: manager.charging === true,
        chargingTime: Number.isFinite(manager.chargingTime) ? manager.chargingTime : null,
        dischargingTime: Number.isFinite(manager.dischargingTime) ? manager.dischargingTime : null,
        supported: true
      };
    };
    for (const event of ['levelchange', 'chargingchange', 'chargingtimechange', 'dischargingtimechange']) {
      manager.addEventListener(event, read);
    }
    read();
  }).catch(() => {
    state.battery = { supported: false };
  });
}

function readNetwork() {
  const c = navigator.connection;
  const info = {
    effectiveType: c ? c.effectiveType || null : null,
    downlink: c && Number.isFinite(c.downlink) ? c.downlink : null,
    rtt: c && Number.isFinite(c.rtt) ? c.rtt : null,
    saveData: c ? c.saveData === true : null,
    type: c && c.type ? c.type : null
  };
  try {
    if (navigator.connectionDownlink) info.downlink = navigator.connectionDownlink;
    if (navigator.connectionEffectiveType) info.effectiveType = navigator.connectionEffectiveType;
    if (navigator.connectionRtt !== undefined) info.rtt = navigator.connectionRtt;
  } catch {}
  return info;
}

export function startLive() {
  bindNetwork();
  bindBattery();
}

export function liveValues() {
  const out = { net: state.net, battery: state.battery, jsHeap: performance.memory ? performance.memory.usedJSHeapSize : null };
  if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then((est) => {
      if (out.quotaBytes === undefined) {
        out.quotaBytes = est.quota || null;
        out.usageBytes = est.usage || null;
      }
    }).catch(() => {});
  }
  return out;
}

export function hasBatteryApi() {
  return typeof navigator.getBattery === 'function';
}

export function hasNetworkInformation() {
  return !!(navigator.connection || navigator.connectionEffectiveType);
}