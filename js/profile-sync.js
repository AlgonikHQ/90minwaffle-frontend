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

/* LSHELPERS_20261017: profile-sync brings its own storage helpers, so restore + auto-sync work on every page */
if (typeof window.getLS !== 'function') { window.getLS = function (k, d) { try { var v = localStorage.getItem(k); return v === null ? (d === undefined ? null : d) : v; } catch (e) { return d === undefined ? null : d; } }; }
if (typeof window.setLS !== 'function') { window.setLS = function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }; }
if (typeof window.POLL_API === 'undefined') { window.POLL_API = ''; }
/* ─────────────────────────────────────────────────────────────
   90minWaffle profile sync — keeps localStorage portable across
   devices/reinstalls by mirroring a defined set of keys to the
   server, keyed by nmw_uid, with a recovery code for re-pairing.

   v2: covers fixed fields (username, trophies, streak, predictions,
   follows, avatar, theme) AND dynamic per-item fields (likes,
   dislikes, favourites, poll votes, trivia/guess state) by sweeping
   localStorage for known key prefixes. Pushes immediately on any
   relevant change (no debounce delay) and once unconditionally on
   every page load, so a sync can't be outrun by a quick uninstall.
   ───────────────────────────────────────────────────────────── */

(function () {
  var SYNC_FIELDS = [
    'nmw_pred_log', 'nmw_followed_team', 'nmw_followed_country',
    'nmw_avatar', 'nmw_avatar_photo', 'nmw_username', 'theme',
    'nmw_trophies', 'nmw_streak', 'nmw_longest_streak', 'nmw_last_visit',
    'nmw_guess_correct_count', 'nmw_guess_elite_count', 'nmw_poll_count',
    'nmw_leaderboard_rank'
  ];

  var DYNAMIC_PREFIXES = [
    { prefix: 'nmw_like_',      backendField: 'likes',      excludePrefix: 'nmw_like_count_' },
    { prefix: 'nmw_dislike_',   backendField: 'dislikes' },
    { prefix: 'nmw_fav_',       backendField: 'favourites' },
    { prefix: 'nmw_poll_vote_', backendField: 'poll_votes' }
  ];

  var GUESS_PREFIX = 'nmw_guess_';
  var GUESS_CLUE_PREFIX = 'nmw_guess_clue_';
  var GUESS_FLAT_KEYS = { 'nmw_guess_correct_count': true, 'nmw_guess_elite_count': true };

  var _dirty = false;
  var _pushInFlight = false;

  function buildFixedPayload() {
    var out = {};
    SYNC_FIELDS.forEach(function (key) {
      var val = localStorage.getItem(key);
      if (val === null) return;
      var shortKey = key.replace(/^nmw_/, '');
      if (shortKey === 'pred_log' || shortKey === 'trophies') {
        try { out[shortKey] = JSON.parse(val); }
        catch (e) { /* leave unset if malformed */ }
      } else {
        out[shortKey] = val;
      }
    });
    return out;
  }

  function buildDynamicPayload() {
    var buckets = {};
    DYNAMIC_PREFIXES.forEach(function (def) { buckets[def.backendField] = {}; });
    var guessState = {};

    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      if (!key || key.indexOf('nmw_') !== 0) continue;

      if (GUESS_FLAT_KEYS[key]) continue;
      if (key.indexOf(GUESS_CLUE_PREFIX) === 0) {
        var clueId = key.slice(GUESS_CLUE_PREFIX.length);
        guessState[clueId] = guessState[clueId] || {};
        guessState[clueId].clue = parseInt(localStorage.getItem(key), 10) || 0;
        continue;
      }
      if (key.indexOf(GUESS_PREFIX) === 0) {
        var gId = key.slice(GUESS_PREFIX.length);
        guessState[gId] = guessState[gId] || {};
        try { guessState[gId].answer = JSON.parse(localStorage.getItem(key)); }
        catch (e) { guessState[gId].answer = localStorage.getItem(key); }
        continue;
      }

      for (var j = 0; j < DYNAMIC_PREFIXES.length; j++) {
        var def = DYNAMIC_PREFIXES[j];
        if (def.excludePrefix && key.indexOf(def.excludePrefix) === 0) continue;
        if (key.indexOf(def.prefix) === 0) {
          var itemId = key.slice(def.prefix.length);
          buckets[def.backendField][itemId] = localStorage.getItem(key);
          break;
        }
      }
    }

    var out = {};
    DYNAMIC_PREFIXES.forEach(function (def) {
      if (Object.keys(buckets[def.backendField]).length) out[def.backendField] = buckets[def.backendField];
    });
    if (Object.keys(guessState).length) out.guess_state = guessState;
    return out;
  }

  function buildFullPayload() {
    var payload = buildFixedPayload();
    var dynamic = buildDynamicPayload();
    Object.keys(dynamic).forEach(function (k) { payload[k] = dynamic[k]; });
    return payload;
  }

  function pushProfileNow() {
    var uid = getLS('nmw_uid', '');
    if (!uid) return;
    if (_pushInFlight) { _dirty = true; return; }
    var payload = buildFullPayload();
    if (!Object.keys(payload).length) return;
    _pushInFlight = true;
    fetch(POLL_API + '/profile/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid, profile: payload })
    }).then(function (r) {
      _pushInFlight = false;
      if (r.ok) {
        if (_dirty) { _dirty = false; pushProfileNow(); }
        else { _dirty = false; }
      }
    }).catch(function () { _pushInFlight = false; });
  }

  function markDirty() {
    _dirty = true;
    pushProfileNow();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden' && _dirty) pushProfileNow();
  });

  function restoreFromServerIfNeeded(uid, cb) {
    if (!uid) { cb(); return; }
    var hasLocalData = !!localStorage.getItem('nmw_pred_log');
    if (hasLocalData) { cb(); return; }
    fetch(POLL_API + '/profile/sync?uid=' + encodeURIComponent(uid))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (data && data.profile) applyProfileData(data.profile);
        cb();
      })
      .catch(function () { cb(); });
  }

  function applyProfileData(profile) {
    Object.keys(profile).forEach(function (shortKey) {
      var val = profile[shortKey];

      var dynamicDef = null;
      for (var j = 0; j < DYNAMIC_PREFIXES.length; j++) {
        if (DYNAMIC_PREFIXES[j].backendField === shortKey) { dynamicDef = DYNAMIC_PREFIXES[j]; break; }
      }
      if (dynamicDef) {
        if (val && typeof val === 'object') {
          Object.keys(val).forEach(function (itemId) {
            localStorage.setItem(dynamicDef.prefix + itemId, val[itemId]);
          });
        }
        return;
      }

      if (shortKey === 'guess_state') {
        if (val && typeof val === 'object') {
          Object.keys(val).forEach(function (gId) {
            var entry = val[gId];
            if (entry && entry.answer !== undefined) {
              localStorage.setItem(GUESS_PREFIX + gId, typeof entry.answer === 'string' ? entry.answer : JSON.stringify(entry.answer));
            }
            if (entry && entry.clue !== undefined) {
              localStorage.setItem(GUESS_CLUE_PREFIX + gId, String(entry.clue));
            }
          });
        }
        return;
      }

      var fullKey = shortKey === 'theme' ? 'theme' : 'nmw_' + shortKey;
      if (shortKey === 'pred_log' || shortKey === 'trophies') val = JSON.stringify(val);
      localStorage.setItem(fullKey, val);
    });
  }

  function ensureRecoveryCode(uid, cb) {
    if (!uid) { cb(null); return; }
    var cached = getLS('nmw_recovery_code', '');
    if (cached) { cb(cached); return; }
    fetch(POLL_API + '/recovery/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid: uid })
    }).then(function (r) { return r.json(); })
      .then(function (data) {
        if (data && data.code) {
          setLS('nmw_recovery_code', data.code);
          cb(data.code);
        } else {
          cb(null);
        }
      }).catch(function () { cb(null); });
  }

  function restoreFromCode(code, onDone) {
    // RESTOREPICK_20261017: find the 6-character code inside whatever was pasted, try the likeliest first
    var raw = String(code || '').toUpperCase().trim();
    var cands = raw.match(/\b[A-Z0-9]{6}\b/g) || [];
    cands.sort(function (a, b) { return (/[0-9]/.test(b) ? 1 : 0) - (/[0-9]/.test(a) ? 1 : 0); });
    if (raw && raw.length <= 12 && cands.indexOf(raw) < 0) cands.unshift(raw);
    cands = cands.filter(function (x, i) { return cands.indexOf(x) === i; }).slice(0, 6);
    if (!cands.length) { onDone(false, 'Enter a code first.'); return; }
    var API = (typeof POLL_API !== 'undefined') ? POLL_API : '';
    (function tryNext(i) {
      if (i >= cands.length) { onDone(false, 'Code not found.'); return; }
      code = cands[i];
      fetch(API + '/recovery/resolve?code=' + encodeURIComponent(code))
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data || !data.uid) { tryNext(i + 1); return; }
        var newUid = data.uid;
        fetch(API + '/profile/sync?uid=' + encodeURIComponent(newUid))
          .then(function (r) { return r.ok ? r.json() : null; })
          .then(function (profileData) {
            setLS('nmw_uid', newUid);
            setLS('nmw_recovery_code', code);
            var _skipped = null;  // RESILIENT_20261017: one bad item can't sink the restore
            if (profileData && profileData.profile) { try { applyProfileData(profileData.profile); } catch (e) { _skipped = e; try { console.error('restore: an item failed', e); } catch (x) {} } }
            onDone(true, 'Restored! Reloading...');
            setTimeout(function () { window.location.reload(); }, 800);
          })
          .catch(function (e) { try { console.error('restore failed', e); } catch (x) {} onDone(false, 'Restore failed — try again. (' + ((e && (e.name || e.message)) || 'unknown') + ')'); });
      })
      .catch(function () { tryNext(i + 1); });
    })(0);
  }

  var SYNC_KEY_SET = {};
  SYNC_FIELDS.forEach(function (k) { SYNC_KEY_SET[k] = true; });

  function isSyncRelevantKey(key) {
    if (SYNC_KEY_SET[key]) return true;
    if (key.indexOf('nmw_') !== 0) return false;
    if (GUESS_FLAT_KEYS[key]) return false;
    if (key.indexOf(GUESS_PREFIX) === 0) return true;
    for (var j = 0; j < DYNAMIC_PREFIXES.length; j++) {
      if (key.indexOf(DYNAMIC_PREFIXES[j].prefix) === 0) {
        if (DYNAMIC_PREFIXES[j].excludePrefix && key.indexOf(DYNAMIC_PREFIXES[j].excludePrefix) === 0) return false;
        return true;
      }
    }
    return false;
  }

  function installSetItemHook() {
    if (localStorage.__nmwSyncHooked) return;
    var origSetItem = localStorage.setItem.bind(localStorage);
    localStorage.setItem = function (key, value) {
      origSetItem(key, value);
      if (isSyncRelevantKey(key)) markDirty();
    };
    localStorage.__nmwSyncHooked = true;
  }

  function initProfileSync() {
    installSetItemHook();
    var uid = getLS('nmw_uid', '');
    restoreFromServerIfNeeded(uid, function () {
      ensureRecoveryCode(getLS('nmw_uid', uid), function () {
        pushProfileNow();
      });
    });
  }

  window.nmwProfileSync = {
    init: initProfileSync,
    getRecoveryCode: function (cb) { ensureRecoveryCode(getLS('nmw_uid', ''), cb); },
    restoreFromCode: restoreFromCode,
    pushNow: pushProfileNow
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileSync);
  } else {
    initProfileSync();
  }
})();

function mwLoadRecoveryCode(attemptsLeft) {
  if (attemptsLeft === undefined) attemptsLeft = 10;
  if (!window.nmwProfileSync) return;
  var el = document.getElementById('recoveryCodeDisplay');
  if (!el) {
    if (attemptsLeft > 0) setTimeout(function () { mwLoadRecoveryCode(attemptsLeft - 1); }, 150);
    return;
  }
  window.nmwProfileSync.getRecoveryCode(function (code) {
    var liveEl = document.getElementById('recoveryCodeDisplay');
    if (liveEl && code) liveEl.textContent = code;
  });
}

function mwCopyRecoveryCode() {
  var btn = event && event.target;
  var el = document.getElementById('recoveryCodeDisplay');
  var text = el ? el.textContent.trim() : '';

  function doCopy(code) {
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(function () {
        if (btn) { var orig = btn.textContent; btn.textContent = 'Copied!'; setTimeout(function () { btn.textContent = orig; }, 1500); }
      }).catch(function () {
        window.prompt('Copy your recovery code:', code);
      });
    } else {
      window.prompt('Copy your recovery code:', code);
    }
  }

  if (text && text !== '------') {
    doCopy(text);
    return;
  }

  if (!window.nmwProfileSync) {
    window.prompt('Could not load your code. Try again in a moment.', '');
    return;
  }
  if (btn) btn.textContent = '...';
  window.nmwProfileSync.getRecoveryCode(function (code) {
    if (btn) btn.textContent = 'Copy';
    if (!code) {
      window.prompt('Could not load your code right now. Try again shortly.', '');
      return;
    }
    if (el) el.textContent = code;
    doCopy(code);
  });
}

function mwRestoreFromCode() {
  var input = document.getElementById('restoreCodeInput');
  var status = document.getElementById('restoreStatusMsg');
  if (!input || !window.nmwProfileSync) return;
  if (status) { status.textContent = 'Checking...'; status.style.color = 'var(--text-dim)'; }
  window.nmwProfileSync.restoreFromCode(input.value, function (ok, msg) {
    if (!status) return;
    status.textContent = msg;
    status.style.color = ok ? 'var(--accent)' : 'var(--danger)';
  });
}
