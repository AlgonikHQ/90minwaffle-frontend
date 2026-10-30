/* NMW_AUTH_20261024: sends this browser's private profile key with profile, leaderboard, streak, trophy and push calls, and saves a new key when the server issues one. */
(function () {
  if (window.__nmwAuth || !window.fetch) return; window.__nmwAuth = 1;
  var F = window.fetch, RX = /\/(profile\/sync|recovery\/(create|resolve)|leaderboard|streak\/update|trophy\/unlock|api\/subscribe|poll\/week)(\?|$)/;
  function key() { try { return localStorage.getItem('nmw_tok') || 'new'; } catch (e) { return 'new'; } }
  window.fetch = function (u, o) {
    try {
      var s = typeof u === 'string' ? u : (u && u.url) || '', a = document.createElement('a'); a.href = s;
      if (a.host !== location.host || !RX.test(a.pathname)) return F.apply(this, arguments);
      o = o || {}; var h = new Headers(o.headers || (typeof u !== 'string' && u.headers) || {}); h.set('X-NMW-Token', key());
      var o2 = {}; for (var k in o) o2[k] = o[k]; o2.headers = h;
      return F.call(this, u, o2).then(function (r) {
        return r.clone().json().then(function (j) { if (j && j.nmw_tok) { try { localStorage.setItem('nmw_tok', j.nmw_tok); } catch (e) {} } }, function () {}).then(function () { return r; });
      });
    } catch (e) { return F.apply(this, arguments); }
  };
})();

const VAPID_PUBLIC_KEY = 'BOR4pVsW_bCAqkAssG--pwXB_0daeNDrq9f8sRYzZECApPHN0lr60-JfOo5G2euidmg-j8kpw0ZOxcY2XgsS_f0';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null;
  try {
    const reg = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
    try { await reg.update(); } catch (e) {}
    await navigator.serviceWorker.ready;
    return reg;
  } catch (e) {
    console.error('SW registration failed:', e);
    return null;
  }
}

async function subscribeToPush(preferences = {}) {
  try { preferences = Object.assign({}, JSON.parse(localStorage.getItem('nmw_push_prefs') || '{}') || {}, preferences || {}); } catch (e) {}   // NMW_MEX_20261024: keep the fan's notification choices
  const reg = await registerServiceWorker();
  if (!reg) return false;
  try {
    let sub = await reg.pushManager.getSubscription();
    if (sub && localStorage.getItem('nmw_vapid_pub') !== VAPID_PUBLIC_KEY) {
      try { await sub.unsubscribe(); } catch (e) {}
      sub = null;
    }
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }
    try { localStorage.setItem('nmw_vapid_pub', VAPID_PUBLIC_KEY); } catch (e) {}
    const payload = {
      subscription: sub.toJSON(),
      preferences,
      uid: localStorage.getItem('nmw_uid') || '',
      followed_team: localStorage.getItem('nmw_followed_team') || '',
      followed_country: localStorage.getItem('nmw_followed_country') || ''
    };
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.ok;
  } catch (e) {
    console.error('Push subscribe failed:', e);
    return false;
  }
}

async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return false;
  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) await sub.unsubscribe();
    await fetch('/api/unsubscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub?.endpoint })
    });
    return true;
  } catch (e) {
    console.error('Unsubscribe failed:', e);
    return false;
  }
}

async function getNotificationState() {
  if (!('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

window.PushManager90min = { subscribeToPush, unsubscribeFromPush, getNotificationState, registerServiceWorker };
