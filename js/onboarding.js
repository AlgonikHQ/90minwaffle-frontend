(function(){
'use strict';

var PICKER_URL = '/data/picker_index.json';
var VAPID_PUBLIC_KEY = 'BOR4pVsW_bCAqkAssG--pwXB_0daeNDrq9f8sRYzZECApPHN0lr60-JfOo5G2euidmg-j8kpw0ZOxcY2XgsS_f0';
var pickerData = null;
var currentStep = 0;
var selections = { club: '', nation: '' };
var OB_KEY = 'nmw_onboard_done';

window.initIntroCard = function(pageKey, message) {
  var storeKey = 'nmw_intro_' + pageKey + '_done';
  try { if (pageKey === 'me' && (localStorage.getItem('nmw_followed_team') || localStorage.getItem('nmw_followed_country'))) return; } catch (e) {} /* MEINTRO_20261023 */
  if (localStorage.getItem(storeKey)) return;
  var card = document.createElement('div');
  card.id = 'mw-intro-card';
  card.style.cssText = [
    'display:flex','align-items:flex-start','gap:12px',
    'background:var(--bg-card,#181E20)',
    'border:1px solid var(--border,rgba(255,255,255,0.08))',
    'border-left:3px solid #3DDC84',
    'border-radius:12px','padding:13px 14px',
    'margin:0','position:fixed','left:12px','right:12px','max-width:560px','margin-left:auto','margin-right:auto','bottom:calc(var(--nmw-intro-off,16px) + env(safe-area-inset-bottom,0px))','z-index:950','box-shadow:0 8px 24px rgba(0,0,0,.45)', /* INTROFLOAT_20261023 */
    'animation:mwSlideDown 0.3s ease'
  ].join(';');
  card.innerHTML =
    '<span style="font-size:1.2rem;flex-shrink:0;margin-top:1px">⚽</span>' +
    '<p style="margin:0;font-size:0.82rem;line-height:1.55;color:var(--text,#e8e8e8);flex:1">' + message + '</p>' +
    '<button onclick="(function(el){' +
      'el.style.transition=\'all 0.25s ease\';' +
      'el.style.opacity=\'0\';' +
      'el.style.maxHeight=\'0\';' +
      'el.style.padding=\'0\';' +
      'el.style.margin=\'0\';' +
      'setTimeout(function(){el.remove()},260);' +
      'try{localStorage.setItem(\'' + storeKey + '\',\'1\')}catch(e){}' +
    '})(this.closest(\'#mw-intro-card\'))" ' +
    'style="background:none;border:none;cursor:pointer;color:var(--text-muted,#888);font-size:1.1rem;padding:0;line-height:1;flex-shrink:0;margin-top:1px" ' +
    'aria-label="Dismiss">✕</button>';
  function inject() {
    var target = document.getElementById('page-content') ||
      document.querySelector('main') ||
      document.querySelector('.page-inner') ||
      document.querySelector('.cards-wrap') ||
      document.body;
    var bn = document.querySelector('.bottom-nav, #bottom-nav, #bottomNav, .m-bottom-nav, .bnav');
    var off = (bn && getComputedStyle(bn).display !== 'none') ? Math.ceil(bn.getBoundingClientRect().height) + 12 : 16;
    card.style.setProperty('--nmw-intro-off', off + 'px');
    document.body.appendChild(card); /* INTROFLOAT_20261023: floats, never pushes the page */
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else { inject(); }
};

// ── Feature discovery strip — shows once after onboarding on home ────────────
window.initFeatureStrip = function() {
  var KEY = 'nmw_feature_strip_done';
  if (localStorage.getItem(KEY)) return;
  if (window.location.pathname !== '/') return;

  var strip = document.createElement('div');
  strip.id = 'mw-feature-strip';
  strip.style.cssText = 'background:var(--bg-card,#181E20);border:1px solid rgba(61,220,132,0.2);border-radius:14px;padding:16px;margin:0 0 14px;animation:mwSlideDown 0.35s ease;position:relative;';

  var features = [
    {icon:'📈', label:'StatIQ', desc:'Transparent tips — every result published', url:'/edges/'},
    {icon:'🧠', label:'FootballIQ', desc:'Model forecasts, season sims, form and streaks', url:'/footballiq/'},
    {icon:'🔮', label:'Match Previews', desc:'Model forecast for every game: win %, BTTS, likely score', url:'/preview/'},
    {icon:'🏆', label:'Tournaments', desc:'Champions League table, fixtures and squads', url:'/tournaments/ucl/'},
    {icon:'👤', label:'Your Profile', desc:'Follow your club, earn trophies, track predictions', url:'/me/'},
    {icon:'📊', label:'Analysis', desc:'Data reports generated daily from live stats', url:'/analysis/'},
  ];

  var cardsHTML = features.map(function(f){
    return '<a href="'+f.url+'" style="display:block;background:var(--bg-elev,#14191A);border:1px solid var(--border,rgba(255,255,255,0.06));border-radius:10px;padding:12px;text-decoration:none;flex-shrink:0;width:160px;">' +
      '<div style="font-size:1.4rem;margin-bottom:6px;">'+f.icon+'</div>' +
      '<div style="font-size:0.82rem;font-weight:700;color:var(--text,#F2F2F0);margin-bottom:4px;">'+f.label+'</div>' +
      '<div style="font-size:0.72rem;color:var(--text-muted,#9CA3A0);line-height:1.4;">'+f.desc+'</div>' +
      '</a>';
  }).join('');

  strip.innerHTML =
    '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">' +
      '<div style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#3DDC84;">What\'s on 90minWaffle</div>' +
      '<button onclick="document.getElementById(\'mw-feature-strip\').style.display=\'none\';localStorage.setItem(\''+KEY+'\',\'1\')" style="background:none;border:none;cursor:pointer;color:var(--text-muted,#888);font-size:0.75rem;padding:0;">Dismiss ✕</button>' +
    '</div>' +
    '<div style="display:flex;gap:10px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;">'+cardsHTML+'</div>';

  function inject() {
    var feed = document.getElementById('feed');
    if (feed && feed.parentNode) {
      feed.parentNode.insertBefore(strip, feed);
    }
  }
  setTimeout(inject, 1500);
};

function shouldShow() {
  if (window.location.search.indexOf('ob=reset') !== -1) {
    try { localStorage.removeItem(OB_KEY); } catch(e) {}
    return true;
  }
  try {
    if (localStorage.getItem(OB_KEY)) return false;
    if (localStorage.getItem('nmw_followed_team') || localStorage.getItem('nmw_followed_country')) {
      localStorage.setItem(OB_KEY, '1');
      return false;
    }
    return true;
  } catch(e) { return false; }
}

function getLS(k, def) { try { return localStorage.getItem(k) || def; } catch(e) { return def; } }
function setLS(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }

function injectStyles() {
  if (document.getElementById('mw-ob-style')) return;
  var s = document.createElement('style');
  s.id = 'mw-ob-style';
  s.textContent = [
    '@keyframes mwFadeIn{from{opacity:0}to{opacity:1}}',
    '@keyframes mwSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes mwSlideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}',
    '@keyframes mwSlideLeft{from{opacity:0;transform:translateX(32px)}to{opacity:1;transform:translateX(0)}}',
    '@keyframes mwSlideRight{from{opacity:0;transform:translateX(-32px)}to{opacity:1;transform:translateX(0)}}',
    '#mw-ob-backdrop{position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.92);display:flex;align-items:center;justify-content:center;padding:16px;animation:mwFadeIn 0.25s ease}',
    '#mw-ob-card{background:var(--bg-card,#181E20);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:20px;width:100%;max-width:420px;padding:28px 24px 24px;position:relative;animation:mwSlideUp 0.3s ease}',
    '.mw-ob-dots{display:flex;gap:6px;justify-content:center;margin-bottom:24px}',
    '.mw-ob-dot{width:6px;height:6px;border-radius:50%;background:var(--border,rgba(255,255,255,0.15));transition:all 0.2s}',
    '.mw-ob-dot.active{background:#3DDC84;width:18px;border-radius:3px}',
    '.mw-ob-dot.done{background:rgba(61,220,132,0.35)}',
    '.mw-ob-icon{font-size:2.4rem;text-align:center;margin-bottom:12px}',
    '.mw-ob-title{font-size:1.25rem;font-weight:800;color:var(--text,#e8e8e8);text-align:center;margin:0 0 8px;line-height:1.25}',
    '.mw-ob-sub{font-size:0.84rem;color:var(--text-muted,#888);text-align:center;margin:0 0 22px;line-height:1.6}',
    '.mw-ob-search{width:100%;box-sizing:border-box;background:var(--bg-elev,#14191A);border:1px solid var(--border,rgba(255,255,255,0.1));border-radius:10px;padding:11px 14px;font-size:0.9rem;color:var(--text,#e8e8e8);outline:none;transition:border-color 0.15s}',
    '.mw-ob-search:focus{border-color:#3DDC84}',
    '.mw-ob-search::placeholder{color:var(--text-muted,#666)}',
    '.mw-ob-results{margin-top:8px;max-height:210px;overflow-y:auto;border-radius:10px;border:1px solid var(--border,rgba(255,255,255,0.08));background:var(--bg-elev,#14191A)}',
    '.mw-ob-results:empty{display:none}',
    '.mw-ob-result{display:flex;align-items:center;gap:10px;padding:10px 13px;cursor:pointer;transition:background 0.1s;border-bottom:1px solid var(--border,rgba(255,255,255,0.05))}',
    '.mw-ob-result:last-child{border-bottom:none}',
    '.mw-ob-result:hover{background:rgba(61,220,132,0.06)}',
    '.mw-ob-result.selected{background:rgba(61,220,132,0.1);border-left:2px solid #3DDC84}',
    '.mw-ob-result img{width:28px;height:28px;object-fit:contain;flex-shrink:0;border-radius:4px}',
    '.mw-ob-result-name{font-size:0.85rem;font-weight:600;color:var(--text,#e8e8e8)}',
    '.mw-ob-selected-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 12px 5px 8px;background:rgba(61,220,132,0.12);border:1px solid rgba(61,220,132,0.25);border-radius:20px;margin:10px 0 0;font-size:0.8rem;font-weight:700;color:#3DDC84}',
    '.mw-ob-selected-pill img{width:20px;height:20px;object-fit:contain;border-radius:3px}',
    '.mw-ob-btn{width:100%;padding:13px;border-radius:12px;font-size:0.9rem;font-weight:700;cursor:pointer;border:none;transition:opacity 0.15s,transform 0.1s;margin-top:6px;font-family:inherit}',
    '.mw-ob-btn:active{transform:scale(0.98)}',
    '.mw-ob-btn.primary{background:#3DDC84;color:#0B0F0E}',
    '.mw-ob-btn.primary:disabled{opacity:0.35;cursor:default}',
    '.mw-ob-btn.secondary{background:var(--bg-elev,#14191A);color:var(--text-muted,#888);border:1px solid var(--border,rgba(255,255,255,0.1));margin-top:8px}',
    '.mw-ob-back{position:absolute;top:18px;left:18px;background:none;border:none;cursor:pointer;color:var(--text-muted,#888);font-size:1.1rem;padding:4px;line-height:1}',
    '.mw-ob-notif-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:16px}',
    '.mw-ob-notif-item{background:var(--bg-elev,#14191A);border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:10px;padding:12px;text-align:center}',
    '.mw-ob-notif-item .ni-icon{font-size:1.4rem;margin-bottom:6px}',
    '.mw-ob-notif-item .ni-label{font-size:0.78rem;font-weight:700;color:var(--text,#e8e8e8);margin-bottom:2px}',
    '.mw-ob-notif-item .ni-desc{font-size:0.68rem;color:var(--text-muted,#888);line-height:1.4}',
    '.mw-ob-push-box{background:var(--bg-elev,#14191A);border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:12px;padding:14px;text-align:center;margin-bottom:12px}',
    '.mw-ob-push-box p{margin:0 0 4px;font-size:0.82rem;color:var(--text-muted,#888);line-height:1.5}',
    '.mw-ob-summary{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:16px}',
    '.mw-ob-summary-item{display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--bg-elev,#14191A);border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:20px;font-size:0.8rem;font-weight:600;color:var(--text,#e8e8e8)}',
    '.mw-ob-summary-item img{width:20px;height:20px;object-fit:contain;border-radius:3px}',
    '.mw-ob-quickstart{display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:4px}',
    '.mw-ob-qs-btn{display:flex;align-items:center;gap:10px;padding:12px 14px;background:var(--bg-elev,#14191A);border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:10px;text-decoration:none;cursor:pointer}',
    '.mw-ob-qs-btn:hover{border-color:rgba(61,220,132,0.3)}',
    '.mw-ob-qs-icon{font-size:1.2rem;flex-shrink:0}',
    '.mw-ob-qs-text .qs-label{font-size:0.82rem;font-weight:700;color:var(--text,#e8e8e8)}',
    '.mw-ob-qs-text .qs-sub{font-size:0.72rem;color:var(--text-muted,#888);margin-top:2px}',
    '.mw-ob-qs-arrow{margin-left:auto;color:var(--text-muted,#888);font-size:0.9rem}',
  ].join('\n');
  document.head.appendChild(s);
}

function loadPicker(cb) {
  if (pickerData) return cb(pickerData);
  fetch(PICKER_URL)
    .then(function(r){ return r.json(); })
    .then(function(d){ pickerData = d; cb(d); })
    .catch(function(){ cb({clubs:[],nations:[]}); });
}

function dots(step) {
  var html = '<div class="mw-ob-dots">';
  for (var i = 0; i < 4; i++) {  /* OBV2: 4 steps */
    var cls = i < step ? 'done' : (i === step ? 'active' : '');
    html += '<div class="mw-ob-dot ' + cls + '"></div>';
  }
  return html + '</div>';
}

function crestImg(url, fallback) {
  if (url) return '<img src="' + url + '" onerror="this.style.display=\'none\'" alt="">';
  return '<span style="font-size:1.1rem">' + (fallback||'⚽') + '</span>';
}

function renderStep(step, dir) {
  var card = document.getElementById('mw-ob-inner');
  if (!card) return;
  var anim = dir === 'back' ? 'mwSlideRight' : 'mwSlideLeft';
  card.style.animation = 'none';
  card.offsetHeight;
  card.style.animation = anim + ' 0.22s ease';

  var back = step > 0
    ? '<button class="mw-ob-back" onclick="mwObStep(' + (step-1) + ',\'back\')" aria-label="Back">←</button>'
    : '';

  var html = dots(step) + back;

  if (step === 0) {
    html += '<div class="mw-ob-brand"><span class="mw-ob-logo">90</span><span>90minWaffle</span></div>' +
      '<h2 class="mw-ob-title">Your club, every day</h2>' +
      '<p class="mw-ob-sub">Follow your club and country and 90minWaffle builds you a daily hub.</p>' +
      '<ul class="mw-ob-feats"><li><span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg></span><div><b>Daily cards</b><small>Trivia, Guess the Player and a fans\' poll, new every day</small></div></li>' +
      '<li><span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l7 3v6c0 4-3 7-7 9-4-2-7-5-7-9V6z"/></svg></span><div><b>Your teams first</b><small>Fixtures, form, previews and news for your club and country</small></div></li>' +
      '<li><span><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg></span><div><b>StatIQ on the record</b><small>Every tip tracked, win or lose</small></div></li></ul>' +
      '<button class="mw-ob-btn primary" onclick="mwObStep(1)">Get started →</button>' +
      '<button class="mw-ob-link" onclick="mwObRestoreOpen()">Returning? Restore your profile</button>' +
      '<div id="mw-ob-restore" style="display:none"><input id="mw-ob-code" placeholder="Paste your recovery code" autocomplete="off" autocapitalize="characters" spellcheck="false">' +
      '<button class="mw-ob-btn primary" onclick="mwObRestore()">Restore my profile</button><p id="mw-ob-rmsg"></p></div>' +
      '<button class="mw-ob-skip" onclick="mwObFinish()">Skip for now</button>';

  } else if (step === 1) {
    var clubVal = selections.club || getLS('nmw_followed_team','');
    html += '<div class="mw-ob-icon">🏆</div>' +
      '<h2 class="mw-ob-title">Pick your club</h2>' +
      '<p class="mw-ob-sub">We\'ll put their fixtures, form, previews and news first for you.</p>' +
      '<input class="mw-ob-search" id="mw-club-search" type="text" placeholder="Search clubs…" autocomplete="off" value="' + (clubVal||'') + '" oninput="mwObSearch(this.value,\'club\')">' +
      '<div class="mw-ob-results" id="mw-club-results"></div>' +
      (clubVal ? '<div class="mw-ob-selected-pill" id="mw-club-pill">' + crestImg(mwObGetCrest('club',clubVal),'🏆') + clubVal + '</div>' : '<div id="mw-club-pill"></div>') +
      '<button class="mw-ob-btn primary" id="mw-club-cont" onclick="mwObConfirmClub()" ' + (clubVal?'':'disabled') + '>Continue</button>' +
      '<button class="mw-ob-btn secondary" onclick="mwObStep(2)">Skip for now</button>';
    setTimeout(function(){ mwObSearch(clubVal||'','club'); }, 50);

  } else if (step === 2) {
    var natVal = selections.nation || getLS('nmw_followed_country','');
    html += '<div class="mw-ob-icon">🌍</div>' +
      '<h2 class="mw-ob-title">Pick your country</h2>' +
      '<p class="mw-ob-sub">Follow your national team through every tournament.</p>' +
      '<input class="mw-ob-search" id="mw-nat-search" type="text" placeholder="Search nations…" autocomplete="off" value="' + (natVal||'') + '" oninput="mwObSearch(this.value,\'nation\')">' +
      '<div class="mw-ob-results" id="mw-nat-results"></div>' +
      (natVal ? '<div class="mw-ob-selected-pill" id="mw-nat-pill">' + crestImg(mwObGetCrest('nation',natVal),'🌍') + natVal + '</div>' : '<div id="mw-nat-pill"></div>') +
      '<button class="mw-ob-btn primary" id="mw-nat-cont" onclick="mwObConfirmNation()" ' + (natVal?'':'disabled') + '>Continue</button>' +
      '<button class="mw-ob-btn secondary" onclick="mwObStep(3)">Skip for now</button>';
    setTimeout(function(){ mwObSearch(natVal||'','nation'); }, 50);

  } else if (step === 3) {  /* OBV2_20261023: alerts + finish on one compact screen */
    var perm = (typeof Notification !== 'undefined') ? Notification.permission : 'denied';
    var club = selections.club || getLS('nmw_followed_team',''), nation = selections.nation || getLS('nmw_followed_country','');
    var who = [club, nation].filter(Boolean).join(' and ') || 'the day\'s big games';
    var sum = (club || nation) ? '<div class="mw-ob-summary">' + (club ? '<div class="mw-ob-summary-item">' + crestImg(mwObGetCrest('club', club), '') + club + '</div>' : '') + (nation ? '<div class="mw-ob-summary-item">' + crestImg(mwObGetCrest('nation', nation), '') + nation + '</div>' : '') + '</div>' : '';
    var al;
    if (perm === 'granted') al = '<div class="mw-ob-al on"><div><b>Match alerts are on</b><span>Kick-off and full time for ' + who + '.</span></div></div>';
    else if (perm === 'default') al = '<div class="mw-ob-al"><div><b>Match alerts</b><span>Kick-off and full time for ' + who + '. Free, turn off any time.</span></div><button class="mw-ob-al-btn" onclick="this.disabled=true;this.textContent=\'Turning on...\';mwObEnablePush()">Turn on</button></div>';
    else al = '<div class="mw-ob-al"><div><b>Match alerts</b><span>Alerts are blocked in this browser. You can allow them later in your browser settings.</span></div></div>';
    html += '<h2 class="mw-ob-title">You\'re all set</h2>' +
      '<p class="mw-ob-sub">Your daily cards are ready on the Me page.</p>' + sum + al +
      '<button class="mw-ob-btn primary" onclick="mwObFinish(\'/me/\')">Go to my daily cards</button>' +
      '<a class="mw-ob-tg" href="https://t.me/ninetyminwafflebets" target="_blank" rel="noopener">Free StatIQ tips on Telegram &rsaquo;</a>' +
      '<button class="mw-ob-skip" onclick="mwObFinish(\'/\')">Go to the homepage</button>';

  } else if (step === 4) {
    var club = selections.club || getLS('nmw_followed_team','');
    var nation = selections.nation || getLS('nmw_followed_country','');
    var summaryHTML = '<div class="mw-ob-summary">';
    if (club) summaryHTML += '<div class="mw-ob-summary-item">' + crestImg(mwObGetCrest('club',club),'🏆') + club + '</div>';
    if (nation) summaryHTML += '<div class="mw-ob-summary-item">' + crestImg(mwObGetCrest('nation',nation),'🌍') + nation + '</div>';
    if (!club && !nation) summaryHTML += '<div class="mw-ob-summary-item">⚽ All football</div>';
    summaryHTML += '</div>';

    html += '<div class="mw-ob-icon">✅</div>' +
      '<h2 class="mw-ob-title">You\'re all set</h2>' +
      '<p class="mw-ob-sub">Here\'s where to start:</p>' +
      summaryHTML +
      '<div class="mw-ob-quickstart">' +
        '<a href="/edges/" class="mw-ob-qs-btn"><span class="mw-ob-qs-icon">📈</span><div class="mw-ob-qs-text"><div class="qs-label">View today\'s tips</div><div class="qs-sub">StatIQ Edges — transparent track record</div></div><span class="mw-ob-qs-arrow">›</span></a>' +
        '<a href="/tournaments/" class="mw-ob-qs-btn"><span class="mw-ob-qs-icon">🏆</span><div class="mw-ob-qs-text"><div class="qs-label">Tournaments</div><div class="qs-sub">Champions League, Europa League &amp; Nations League</div></div><span class="mw-ob-qs-arrow">›</span></a>' +
        '<a href="/footballiq/" class="mw-ob-qs-btn"><span class="mw-ob-qs-icon">🧠</span><div class="mw-ob-qs-text"><div class="qs-label">FootballIQ stats</div><div class="qs-sub">BTTS, Over 2.5 and form data</div></div><span class="mw-ob-qs-arrow">›</span></a>' +
      '</div>' +
      '<button class="mw-ob-btn primary" style="margin-top:8px;" onclick="mwObFinish()">Go to home feed →</button>';
  }

  card.innerHTML = html;
}

window.mwObGetCrest = function(type, name) {
  if (!pickerData) return '';
  var list = type === 'club' ? pickerData.clubs : pickerData.nations;
  for (var i=0; i<list.length; i++) {
    if (list[i].name === name) return list[i].crest || '';
  }
  return '';
};

window.mwObStep = function(step, dir) {
  currentStep = step;
  renderStep(step, dir||'fwd');
};

window.mwObSearch = function(q, type) {
  var resultsId = type === 'club' ? 'mw-club-results' : 'mw-nat-results';
  var el = document.getElementById(resultsId);
  if (!el) return;
  loadPicker(function(data) {
    var list = type === 'club' ? data.clubs : data.nations;
    var selected = type === 'club'
      ? (selections.club || getLS('nmw_followed_team',''))
      : (selections.nation || getLS('nmw_followed_country',''));
    var term = (q||'').toLowerCase().trim();
    var filtered = term
      ? list.filter(function(x){ return (x.search||x.name).toLowerCase().indexOf(term) !== -1; }).slice(0,6)
      : (selected ? list.filter(function(x){ return x.name === selected; }) : []);
    if (!filtered.length) { el.innerHTML=''; return; }
    el.innerHTML = filtered.map(function(item) {
      var isSel = item.name === selected;
      return '<div class="mw-ob-result' + (isSel?' selected':'') + '" onclick="mwObSelect(\'' +
        type + '\',\'' + item.name.replace(/'/g,"\\'") + '\',\'' + (item.crest||'').replace(/'/g,"\\'") + '\')">' +
        crestImg(item.crest, type==='club'?'🏆':'🌍') +
        '<span class="mw-ob-result-name">' + item.name + '</span>' +
        (isSel ? '<span style="margin-left:auto;color:#3DDC84;font-size:0.8rem">✓</span>' : '') +
        '</div>';
    }).join('');
  });
};

window.mwObSelect = function(type, name, crest) {
  if (type === 'club') {
    selections.club = name;
    var pill = document.getElementById('mw-club-pill');
    if (pill) { pill.innerHTML = '<img src="' + crest + '" onerror="this.style.display=\'none\'" alt=""> ' + name; pill.className = 'mw-ob-selected-pill'; }
    var btn = document.getElementById('mw-club-cont');
    if (btn) btn.disabled = false;
    mwObSearch(document.getElementById('mw-club-search')?document.getElementById('mw-club-search').value:'', 'club');
  } else {
    selections.nation = name;
    var pill2 = document.getElementById('mw-nat-pill');
    if (pill2) { pill2.innerHTML = '<img src="' + crest + '" onerror="this.style.display=\'none\'" alt=""> ' + name; pill2.className = 'mw-ob-selected-pill'; }
    var btn2 = document.getElementById('mw-nat-cont');
    if (btn2) btn2.disabled = false;
    mwObSearch(document.getElementById('mw-nat-search')?document.getElementById('mw-nat-search').value:'', 'nation');
  }
};

window.mwObConfirmClub = function() {
  if (selections.club) setLS('nmw_followed_team', selections.club);
  mwObStep(2);
};

window.mwObConfirmNation = function() {
  if (selections.nation) setLS('nmw_followed_country', selections.nation);
  mwObStep(3);
};

window.mwObEnablePush = function() {
  if (window.PushManager90min && typeof window.PushManager90min.subscribeToPush === 'function') {
    window.PushManager90min.subscribeToPush({breaking_news:true,transfers:true,goals:true,kickoff:true,ft:true,motm_open:true,motm_result:true,prediction_result:true,trophies:true})
      .then(function(ok){
        mwObStep(3);
      }).catch(function(){ mwObStep(3); });
  } else if (typeof Notification !== 'undefined') {
    Notification.requestPermission().then(function(perm){
      if (perm === 'granted' && window.PushManager90min) {
        window.PushManager90min.subscribeToPush({breaking_news:true,transfers:true,goals:true,kickoff:true,ft:true,motm_open:true,motm_result:true,prediction_result:true,trophies:true}).catch(function(){});
      }
      mwObStep(3);
    });
  } else {
    mwObStep(3);
  }
};

window.mwObFinish = function(dest) {
  setLS(OB_KEY, '1');
  var bd = document.getElementById('mw-ob-backdrop');
  if (bd) { bd.style.animation = 'mwFadeIn 0.2s ease reverse'; setTimeout(function(){ bd.remove(); }, 200); }
  if (dest) { if (window.location.pathname === dest) window.location.reload(); else window.location.href = dest; }
  else if (window.location.pathname !== '/') {
    /* OBV2: Skip just closes */
  } else {
    if (typeof renderPage === 'function') renderPage();
    // Show feature discovery strip for new users
    setTimeout(function(){ if (typeof window.initFeatureStrip === 'function') window.initFeatureStrip(); }, 800);
  }
};

/* OBLITE_20261021: no full-screen takeover on load. A first visit gets a small card inside the home feed (below the first screen),
   a visit after 3+ days away gets a small bottom sheet. X or Not now snoozes it for 7 days, 3 times, then it stops for good.
   Following a club or country stops it. ?ob=reset still opens the full welcome flow. */
var OBDAY = 86400000;
function openModal(step) {
  if (document.getElementById('mw-ob-backdrop')) return;
  injectStyles();
  selections.club = getLS('nmw_followed_team','');
  selections.nation = getLS('nmw_followed_country','');
  loadPicker(function(){});
  var bd = document.createElement('div');
  bd.id = 'mw-ob-backdrop';
  bd.innerHTML = '<div id="mw-ob-card"><div id="mw-ob-inner"></div></div>';
  document.body.appendChild(bd);
  renderStep(step || 0);
}
function dropNudges() {
  ['mw-ob-nudge-card', 'mw-ob-nudge-sheet'].forEach(function(id) { var e = document.getElementById(id); if (e && e.parentNode) e.parentNode.removeChild(e); });
}
function obSnooze() {
  var n = (parseInt(getLS('nmw_ob_snoozes', '0'), 10) || 0) + 1;
  setLS('nmw_ob_snoozes', String(n));
  if (n >= 3) setLS(OB_KEY, '1'); else setLS('nmw_ob_snooze_until', String(Date.now() + 7 * OBDAY));
  dropNudges();
}
function obEligible() {
  if (getLS(OB_KEY, '') || getLS('nmw_followed_team', '') || getLS('nmw_followed_country', '')) return false;
  return Date.now() >= (parseInt(getLS('nmw_ob_snooze_until', '0'), 10) || 0);
}
function nudgeCss() {
  if (document.getElementById('mw-ob-nudge-css')) return;
  var st = document.createElement('style'); st.id = 'mw-ob-nudge-css';
  st.textContent = '.mw-nd{box-sizing:border-box;position:relative;background:var(--bg-card,#181E20);border:1px solid var(--border,rgba(255,255,255,.1));border-left:3px solid #3DDC84;border-radius:12px;padding:14px;margin:0 0 14px;color:#e8e8e8;font-size:14px;line-height:1.45}'
    + '.mw-nd b{display:block;font-size:15px;margin:0 40px 4px 0}'
    + '.mw-nd p{margin:0 0 8px;color:#cbd5e1;font-size:13px}'
    + '.mw-nd-row{display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center}'
    + '.mw-nd-go{background:#3DDC84;color:#04130a;border:0;border-radius:10px;padding:0 16px;min-height:44px;font-weight:800;font-size:14px;cursor:pointer}'
    + '.mw-nd-link{background:none;border:0;color:#cbd5e1;text-decoration:underline;font-size:13px;cursor:pointer;min-height:44px;padding:0 6px}'
    + '.mw-nd-x{position:absolute;top:0;right:0;width:44px;height:44px;background:none;border:0;color:#cbd5e1;font-size:18px;cursor:pointer}'
    + '#mw-ob-nudge-sheet{position:fixed;left:12px;right:12px;bottom:calc(76px + env(safe-area-inset-bottom,0px));z-index:140;max-width:420px;margin:0 auto;box-shadow:0 10px 40px rgba(0,0,0,.5);transform:translateY(24px);opacity:0;transition:transform .3s ease,opacity .3s ease}'
    + '#mw-ob-nudge-sheet.in{transform:none;opacity:1}'
    + '@media(min-width:1024px){#mw-ob-nudge-sheet{left:auto;right:20px;bottom:20px;margin:0;width:380px}}';
  document.head.appendChild(st);
}
function mkNudge(id) {
  nudgeCss();
  var d = document.createElement('div');
  d.id = id; d.className = 'mw-nd'; d.setAttribute('role', 'region'); d.setAttribute('aria-label', 'Follow your club');
  d.innerHTML = '<button class="mw-nd-x" aria-label="Not now" data-a="snooze">&#10005;</button>'
    + '<b>Follow your club</b>'
    + '<p>Put your club and country first in your feed, with goal and kick-off alerts if you want them.</p>'
    + '<div class="mw-nd-row"><button class="mw-nd-go" data-a="pick">Choose your club</button>'
    + '<button class="mw-nd-link" data-a="snooze">Not now</button>'
    + '<button class="mw-nd-link" data-a="restore">I have a code</button></div>';
  d.addEventListener('click', function(e) {
    var a = e.target && e.target.getAttribute ? e.target.getAttribute('data-a') : null;
    if (a === 'snooze') obSnooze();
    else if (a === 'pick') { dropNudges(); openModal(1); }
    else if (a === 'restore') { dropNudges(); openModal(0); setTimeout(function() { if (window.mwObRestoreOpen) window.mwObRestoreOpen(); }, 150); }
  });
  return d;
}
function placeCard() {
  var feed = document.getElementById('feed');
  if (!feed || document.getElementById('mw-ob-nudge-card') || document.getElementById('mw-ob-backdrop')) return;
  var kids = feed.children;
  for (var i = 2; i < kids.length; i++) {
    if (kids[i].getBoundingClientRect().top > window.innerHeight + 40) { feed.insertBefore(mkNudge('mw-ob-nudge-card'), kids[i]); return; }
  }
}
window.nmwOpenOnboarding = function () { openModal(0); }; /* ME_OBOPEN_20261023 */
function nudge() {
  var now = Date.now(), prev = parseInt(getLS('nmw_ob_last', '0'), 10) || 0, path = window.location.pathname;
  setTimeout(function(){ setLS('nmw_ob_last', String(Date.now())); }, 8000); /* OBFIX_20261021: stamp late so a quick reload cannot use up the first visit */
  if (window.location.search.indexOf('ob=reset') !== -1) {
    ['nmw_ob_snoozes', 'nmw_ob_snooze_until'].forEach(function(k) { try { localStorage.removeItem(k); } catch (e) {} });
    openModal(0);
    return;
  }
  if (!obEligible()) return;
  if (!prev) {
    if (path !== '/') return;
    var tries = 0, mo = null, timer = setInterval(function() {
      var f = document.getElementById('feed'); tries++;
      if (f && f.children.length >= 3) {
        clearInterval(timer); placeCard();
        if (window.MutationObserver) {
          mo = new MutationObserver(function() { setTimeout(function() { if (obEligible()) placeCard(); else mo.disconnect(); }, 250); });
          mo.observe(f, { childList: true });
        }
      } else if (tries > 40) clearInterval(timer);
    }, 500);
    return;
  }
  if (now - prev >= 3 * OBDAY && path.indexOf('/me') !== 0) {
    setTimeout(function() {
      if (!obEligible() || document.getElementById('mw-ob-backdrop')) return;
      var sh = mkNudge('mw-ob-nudge-sheet'); document.body.appendChild(sh);
      requestAnimationFrame(function() { requestAnimationFrame(function() { sh.className += ' in'; }); });
    }, 4000);
  }
}
function init() {
  if (window.__nmwObInit || document.getElementById('mw-ob-backdrop')) return; window.__nmwObInit = true;  // OBPOLISH_20261017: never render twice
  if (!shouldShow()) {
    // Returning user — show feature strip if not dismissed
    if (typeof window.initFeatureStrip === 'function') {
      setTimeout(window.initFeatureStrip, 1000);
    }
    return;
  }
  nudge();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

})();

/* OBPOLISH_20261017: returning users restore from the welcome screen + polished look */
(function(){
  var CSS = '#mw-ob-backdrop{backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}'
   + '#mw-ob-card{background:linear-gradient(165deg,#13213d,#0a1020)!important;border:1px solid rgba(34,211,238,.25)!important;border-radius:22px!important;box-shadow:0 20px 60px rgba(0,0,0,.55),0 0 40px rgba(34,211,238,.12)!important}'
   + '.mw-ob-brand{display:flex;align-items:center;gap:8px;justify-content:center;font-weight:800;letter-spacing:.02em;color:#e9eefb;margin:6px 0 12px}'
   + '.mw-ob-logo{width:30px;height:30px;border-radius:9px;background:#22d3ee;color:#071018;display:flex;align-items:center;justify-content:center;font-size:13px;box-shadow:0 0 14px rgba(34,211,238,.5)}'
   + '#mw-ob-card .mw-ob-title{color:#e9eefb!important;font-size:26px!important;text-align:center;margin:0 0 6px!important}'
   + '#mw-ob-card .mw-ob-sub{color:#8b9cc0!important;text-align:center;margin:0 0 4px!important}'
   + '.mw-ob-feats{list-style:none;padding:0;margin:14px 0 18px;display:grid;gap:10px}'
   + '.mw-ob-feats li{display:flex;gap:12px;align-items:flex-start;background:#0e1628;border:1px solid #1e2a44;border-radius:12px;padding:10px 12px;text-align:left}'
   + '.mw-ob-feats li span{font-size:20px;line-height:1.2}.mw-ob-feats b{display:block;color:#e9eefb;font-size:14px}.mw-ob-feats small{color:#8b9cc0;font-size:12px}'
   + '#mw-ob-card .mw-ob-btn.primary{background:#22d3ee!important;color:#071018!important;border:0!important;border-radius:14px!important;font-weight:800!important;box-shadow:0 0 18px rgba(34,211,238,.35)!important}'
   + '.mw-ob-link{display:block;width:100%;background:none;border:1px solid rgba(34,211,238,.45);color:#22d3ee;border-radius:14px;padding:12px;margin-top:10px;font-weight:700;font-size:14px;cursor:pointer}'
   + '.mw-ob-skip{display:block;margin:14px auto 0;background:none;border:0;color:#8b9cc0;font-size:13px;cursor:pointer;text-decoration:underline}'
   + '#mw-ob-restore{margin-top:12px}#mw-ob-restore input{width:100%;box-sizing:border-box;background:#0e1628;border:1px solid #1e2a44;color:#e9eefb;border-radius:12px;padding:12px;font-size:16px;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}'
   + '#mw-ob-rmsg{font-size:13px;min-height:18px;margin:6px 0 0;color:#8b9cc0;text-align:center}#mw-ob-rmsg.ok{color:#a3e635}#mw-ob-rmsg.err{color:#f87171}';
  function addCss(){ if (document.getElementById('mw-ob-polish')) return; var st = document.createElement('style'); st.id = 'mw-ob-polish'; st.textContent = CSS; document.head.appendChild(st); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', addCss); else addCss();
  function withSync(cb){
    if (window.nmwProfileSync && window.nmwProfileSync.restoreFromCode) return cb();
    var sc = document.createElement('script'); sc.src = '/js/profile-sync.js?v=20261017e';
    sc.onload = function(){ cb(); }; sc.onerror = function(){ cb(); }; document.head.appendChild(sc);
  }
  window.mwObRestoreOpen = function(){
    var b = document.getElementById('mw-ob-restore'); if (!b) return;
    b.style.display = 'block'; var i = document.getElementById('mw-ob-code'); if (i) i.focus();
  };
  window.mwObRestore = function(){
    var i = document.getElementById('mw-ob-code'), m = document.getElementById('mw-ob-rmsg'); if (!i) return;
    var done = false;
    function say(t, c){ if (m) { m.textContent = t; m.className = c || ''; } }
    say('Checking your code…');
    if (typeof window.POLL_API === 'undefined') window.POLL_API = '';   // same server, as on the Me page
    var tm = setTimeout(function(){ if (!done) say('This is taking longer than usual — please try again.', 'err'); }, 10000);
    withSync(function(){
      try {
        if (!window.nmwProfileSync || !window.nmwProfileSync.restoreFromCode) { done = true; clearTimeout(tm); say('Restore is unavailable right now — please try again shortly.', 'err'); return; }
        window.nmwProfileSync.restoreFromCode(i.value, function(ok, msg){
          done = true; clearTimeout(tm);
          if (ok) { try { localStorage.setItem('nmw_onboard_done', '1'); } catch (e) {} say('Welcome back! Restoring your profile…', 'ok'); }
          else say(msg === 'Code not found.' ? "That code didn't match — check it and try again." : msg, 'err');
        });
      } catch (e) { done = true; clearTimeout(tm); say('Restore failed — please try again.', 'err'); }
    });
  };
})();

(function () { /* OBV2_20261023: onboarding + follow sheet in the site theme; every step fits the screen */
  var css = 'body #mw-ob-card{max-height:calc(100dvh - 32px);overflow-y:auto;overscroll-behavior:contain;padding:22px 20px 18px!important}'
    + 'body #mw-ob-card .mw-ob-icon{display:none!important}'
    + 'body #mw-ob-card .mw-ob-title{font-size:23px!important}'
    + 'body #mw-ob-card .mw-ob-feats span{color:#22d3ee;display:flex;align-items:center;justify-content:center}'
    + '.mw-ob-al{display:flex;align-items:center;gap:12px;background:#111a2e;border:1px solid rgba(34,211,238,.25);border-radius:12px;padding:12px 14px;margin:12px 0;text-align:left}'
    + '.mw-ob-al>div{flex:1;display:flex;flex-direction:column;gap:2px}.mw-ob-al b{font-size:14px;color:#e6edf6}.mw-ob-al span{font-size:12px;color:#8aa0b8;line-height:1.4}.mw-ob-al.on b{color:#3ddc84}'
    + '.mw-ob-al-btn{flex:0 0 auto;min-height:40px;padding:0 14px;border-radius:10px;border:0;background:#22d3ee;color:#070b16;font-weight:700;font-size:13px;cursor:pointer}'
    + '.mw-ob-tg{display:block;text-align:center;font-size:13px;font-weight:600;color:#22d3ee!important;margin:10px 0 2px;text-decoration:none;padding:6px 0}'
    + 'body .mw-ob-summary-item,body .mw-ob-search{background:#111a2e!important;border-color:rgba(255,255,255,.1)!important}'
    + 'body .mw-ob-dot.active,body .mw-ob-dot.done{background:#22d3ee!important}'
    + 'body .mw-nd{background:#0a1020!important;border:1px solid rgba(34,211,238,.3)!important}'
    + 'body .mw-nd-go{background:#22d3ee!important;color:#070b16!important}';
  var st = document.createElement('style'); st.id = 'mw-ob-v2'; st.textContent = css;
  (document.head || document.documentElement).appendChild(st);
})();

(function () { /* OBENTER_20261023: Enter / Go confirms in onboarding */
  var MAP = { 'mw-club-search': ['mw-club-results', 'mw-club-cont'], 'mw-nat-search': ['mw-nat-results', 'mw-nat-cont'] };
  document.addEventListener('focusin', function (e) { var t = e.target; if (t && (MAP[t.id] || t.id === 'mw-ob-code')) t.setAttribute('enterkeyhint', 'go'); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' || e.isComposing) return;
    var t = e.target, id = t && t.id; if (!id) return;
    if (id === 'mw-ob-code') { e.preventDefault(); if (window.mwObRestore) window.mwObRestore(); return; }
    var m = MAP[id]; if (!m) return;
    e.preventDefault();
    var go = function () { var c = document.getElementById(m[1]); if (c && !c.disabled) c.click(); };
    var first = document.querySelector('#' + m[0] + ' [onclick], #' + m[0] + ' button, #' + m[0] + ' a');
    if ((t.value || '').trim() && first) { first.click(); setTimeout(go, 150); } else go();
  });
})();
