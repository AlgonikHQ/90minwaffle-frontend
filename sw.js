/* BADGESW_20261018: serve slim local team badges; fall back to the original image server */
self.addEventListener('fetch', function (e) {
  var m = /^https:\/\/media\.api-sports\.io\/football\/teams\/(\d+)\.png/.exec(e.request.url);
  if (!m) return;
  e.stopImmediatePropagation();
  e.respondWith(fetch('/img/badges/' + m[1] + '.png').then(function (r) { return r.ok ? r : fetch(e.request); }).catch(function () { return fetch(e.request); }));
});
const CACHE_NAME = '90minwaffle-v263';
self.addEventListener('install', e => {
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return clients.claim();
    }).then(function() {
      return clients.matchAll({ type: 'window', includeUncontrolled: true });
    }).then(function(list) {
      return list; /* NONAV_20261021: no forced reload on activate */
    })
  );
});
self.addEventListener('fetch', e => {
  if (e.request.mode === 'navigate' || e.request.headers.get('accept').includes('text/html')) {
    e.respondWith(fetch(e.request).catch(function() { return caches.match(e.request); }));
    return;
  }
});

// ─── Push notification handler ───────────────────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return;
  const data = e.data.json();

  // Emoji prefix by event type
  const prefixes = {
    goals:             '⚽',
    ft:                '🏁',
    kickoff:           '🔔',
    lineups:           '📋',
    predictions:       '⚡',
    prediction_result: '⚡',
    motm:              '🗳️',
    motm_open:         '🗳️',
    motm_result:       '⭐',
    news:              '🔥',
    trophies:          '🏆',
    test:              '📣'
  };

  const tag = data.tag || data.event_type || 'waffle';
  const category = data.event_type || tag;
  const emoji = prefixes[category] || '📣';

  // Title: emoji + supplied title
  const _t = (data.title || '90minWaffle'); const title = /^\p{Extended_Pictographic}/u.test(_t) ? _t : (emoji + ' ' + _t);  // NOTIF_DEEPLINK_20261025: one emoji only

  // Icon: team crest if supplied, else app icon
  const icon = data.icon || data.team_crest || '/img/icon-192-v2.png';

  // Badge: always monochrome app mark
  const badge = '/img/badge-96.png';

  // Large image: scoreline card or player photo if supplied
  const image = data.image || null;

  // Body text
  const body = data.body || '';

  // Actions — max 2 on most platforms
  const actions = [];
  if (data.action_url && data.action_label) {
    actions.push({ action: 'primary', title: data.action_label });
  }

  const options = {
    body,
    icon,
    badge,
    image,
    data: { url: data.url || '/' },
    vibrate: [100, 50, 100, 50, 200],
    requireInteraction: tag === 'goals' || tag === 'ft',
    tag,
    renotify: true,
    actions,
    silent: false
  };

  e.waitUntil(self.registration.showNotification(title, options).then(function(){if(navigator.setAppBadge){navigator.setAppBadge().catch(function(){});}}));
});

// ─── Tap handler — always go direct to relevant page ─────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close(); if(navigator.clearAppBadge){navigator.clearAppBadge().catch(function(){});}

  // action click or body click — both go to same URL
  const url = e.notification.data.url || '/';

  const target = new URL(url, self.location.origin).href;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(list) {
      // NOTIF_DEEPLINK_20261025: move an open window to the exact page; if navigate is refused (iPhone home-screen app), ask the page to go there
      var c = list.filter(function(w){ return String(w.url).indexOf(self.location.origin) === 0; })[0];
      if (c) {
        var go = ('navigate' in c) ? c.navigate(target).catch(function(){ return null; }) : Promise.resolve(null);
        return go.then(function(n){
          if (!n) { try { c.postMessage({ type: 'nmw-open', url: target }); } catch (x) {} }
          var w = n || c; return w.focus ? w.focus() : null;
        });
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
  );
});
