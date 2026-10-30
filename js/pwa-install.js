// 90minWaffle PWA Install Prompt
// Handles: Chrome/Edge desktop, Android, macOS Chrome
// Safari desktop: shows manual instructions (no API available)
(function () {
  'use strict';

  var DISMISS_KEY = 'nmw_pwa_install_dismissed';
  var INSTALL_KEY = 'nmw_installed';
  var deferredPrompt = null;

  // Don't show if already installed (running in standalone/PWA mode)
  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
  }

  function isDismissed() {
    // Dismissed within last 14 days
    var ts = localStorage.getItem(DISMISS_KEY);
    if (!ts) return false;
    return (Date.now() - parseInt(ts, 10)) < 14 * 24 * 60 * 60 * 1000;
  }

  function isSafariDesktop() {
    var ua = navigator.userAgent;
    return /Safari/.test(ua) && !/Chrome/.test(ua) && !/Mobile/.test(ua);
  }

  function isMobileOrTablet() {
    return /Android|iPhone|iPad|iPod/.test(navigator.userAgent);
  }

  function showBanner(mode) {
    // mode: 'native' (Chrome/Edge, we can trigger prompt) or 'safari' (manual instructions)
    if (document.getElementById('nmw-install-banner')) return;

    var banner = document.createElement('div');
    banner.id = 'nmw-install-banner';
    banner.style.cssText = [
      'position:fixed', 'bottom:72px', 'left:50%',
      'transform:translateX(-50%)',
      'background:#181E20',
      'border:1px solid rgba(0,255,135,0.25)',
      'border-radius:14px',
      'padding:12px 16px',
      'display:flex', 'align-items:center', 'gap:12px',
      'z-index:9000',
      'box-shadow:0 4px 24px rgba(0,0,0,0.5)',
      'max-width:420px', 'width:calc(100% - 32px)',
      'animation:nmwSlideUp 0.3s ease'
    ].join(';');

    var iconHTML = '<img src="/img/icon-192.png" style="width:36px;height:36px;border-radius:8px;flex-shrink:0" alt="">';

    var textHTML, btnHTML;

    if (mode === 'safari') {
      textHTML = '<div style="flex:1;min-width:0">' +
        '<div style="font-size:0.82rem;font-weight:700;color:#e8e8e8">Add to Dock</div>' +
        '<div style="font-size:0.72rem;color:#8a9e96;margin-top:2px">Safari → Share ⬆ → Add to Dock</div>' +
        '</div>';
      btnHTML = '<button id="nmw-install-dismiss" style="background:none;border:none;color:#5C6562;font-size:1.1rem;cursor:pointer;padding:4px;flex-shrink:0">✕</button>';
    } else {
      var label = isMobileOrTablet() ? 'Add to Home Screen' : 'Install App';
      var sub = isMobileOrTablet() ? 'Get the full app experience' : 'Install to desktop — one click, no app store';
      textHTML = '<div style="flex:1;min-width:0">' +
        '<div style="font-size:0.82rem;font-weight:700;color:#e8e8e8">' + label + '</div>' +
        '<div style="font-size:0.72rem;color:#8a9e96;margin-top:2px">' + sub + '</div>' +
        '</div>';
      btnHTML = '<button id="nmw-install-btn" style="background:#00FF87;color:#0B0F0E;border:none;border-radius:8px;padding:7px 14px;font-size:0.78rem;font-weight:700;cursor:pointer;flex-shrink:0">Install</button>' +
        '<button id="nmw-install-dismiss" style="background:none;border:none;color:#5C6562;font-size:1.1rem;cursor:pointer;padding:4px;flex-shrink:0">✕</button>';
    }

    banner.innerHTML = '<style>' +
      '@keyframes nmwSlideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}' +
      '</style>' +
      iconHTML + textHTML + btnHTML;

    document.body.appendChild(banner);

    // Install button — triggers native prompt
    var installBtn = document.getElementById('nmw-install-btn');
    if (installBtn) {
      installBtn.addEventListener('click', function () {
        banner.remove();
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(function (choice) {
            if (choice.outcome === 'accepted') {
              localStorage.setItem(INSTALL_KEY, '1');
            }
            deferredPrompt = null;
          });
        }
      });
    }

    // Dismiss button
    document.getElementById('nmw-install-dismiss').addEventListener('click', function () {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      banner.style.animation = 'nmwSlideUp 0.2s ease reverse';
      setTimeout(function () { banner.remove(); }, 200);
    });

    // Auto-hide after 12 seconds
    setTimeout(function () {
      if (document.getElementById('nmw-install-banner')) {
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
        banner.remove();
      }
    }, 12000);
  }

  function init() {
    if (isStandalone()) return; // Already installed — never show
    if (isDismissed()) return;
    if (localStorage.getItem(INSTALL_KEY)) return;

    // Chrome/Edge/Android — listen for the native install event
    window.addEventListener('beforeinstallprompt', function (e) {
      e.preventDefault();
      deferredPrompt = e;
      // Wait until user has been on site 30s before showing
      setTimeout(function () {
        if (!isStandalone() && !isDismissed()) {
          showBanner('native');
        }
      }, 30000);
    });

    // Safari desktop — no beforeinstallprompt, show manual hint
    if (isSafariDesktop() && !isDismissed()) {
      setTimeout(function () {
        showBanner('safari');
      }, 45000);
    }

    // Track successful install
    window.addEventListener('appinstalled', function () {
      localStorage.setItem(INSTALL_KEY, '1');
      var b = document.getElementById('nmw-install-banner');
      if (b) b.remove();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
