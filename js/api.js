// Fetches and caches device snapshots per section

let last = null;
let pending = null;

export function cached() {
  return last;
}

function get(url) {
  return fetch(url, { cache: 'no-store', headers: { Accept: 'application/json' } }).then((res) => {
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  });
}

export function fetchSnapshot() {
  if (pending) return pending;
  pending = get('/api/info')
    .then((data) => {
      last = data;
      pending = null;
      return data;
    })
    .catch((err) => {
      pending = null;
      throw err;
    });
  return pending;
}

export function fetchSection(section) {
  return get('/api/info?section=' + encodeURIComponent(section)).then((data) => {
    if (!last) {
      last = data;
      return last;
    }
    for (const key of Object.keys(data)) {
      if (key === 'meta') continue;
      last[key] = data[key];
    }
    last.meta = Object.assign({}, last.meta, data.meta, { time: data.meta.time });
    return last;
  });
}

export function fetchCoreFreqs() {
  return get('/api/cpu-freqs');
}

export function ping() {
  return get('/api/ping');
}