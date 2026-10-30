(function () {
  var NAV_ITEMS = [
    {
      href: '/',
      label: 'Home',
      match: function (p) { return p === '/' || p === '/index.html'; },
      svg: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'
    },
    {
      href: '/matches/',
      label: 'Matches',
      match: function (p) { return p.indexOf('/matches') === 0; },
      svg: '<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'
    },
    {
      href: '/footballiq/',
      label: 'Stats' /* MENUS_20261030 */,
      match: function (p) { return p.indexOf('/footballiq') === 0; },
      svg: '<circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><line x1="2" y1="12" x2="22" y2="12"/>'
    },
    {
      href: '/edges/',
      label: 'Tips',
      match: function (p) { return p.indexOf('/edges') === 0; },
      svg: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>'
    },
    {
      href: '/me/',
      label: 'Me',
      match: function (p) { return p.indexOf('/me') === 0; },
      svg: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
    }
  ];

  function render() {
    var path = window.location.pathname;
    var html = '<nav class="bottom-nav">';
    NAV_ITEMS.forEach(function (item) {
      var active = item.match(path) ? ' active' : '';
      html += '<a class="nav-item' + active + '" href="' + item.href + '">' +
        '<svg viewBox="0 0 24 24" width="27" height="27" fill="none" stroke="currentColor" ' +
        'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0">' +
        item.svg + '</svg>' +
        '<span>' + item.label + '</span></a>';
    });
    html += '</nav>';

    var mount = document.getElementById('bottom-nav-mount');
    if (mount) {
      mount.outerHTML = html;
    } else {
      document.body.insertAdjacentHTML('beforeend', html);
      console.warn('bottom-nav.js: #bottom-nav-mount not found, appended to body as fallback');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
