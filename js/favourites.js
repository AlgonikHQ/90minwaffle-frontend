function renderFavourites() {
  var favKeys = [];
  try {
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && k.indexOf('nmw_fav_') === 0) favKeys.push(k);
    }
  } catch(e) {}

  if (favKeys.length === 0) {
    return '<div class="sec-hdr">Saved Items</div>'
      + '<div class="card" style="padding:16px;text-align:center;color:var(--text-dim);font-size:0.88rem">'
      + 'Nothing saved yet &mdash; tap Save on any tip, match or story.</div>';
  }

  var html = '<div class="sec-hdr">Saved Items</div><div class="fav-list">';
  favKeys.forEach(function(k) {
    try {
      var item = JSON.parse(localStorage.getItem(k));
      if (!item) return;
      var icon = item.type === 'edge' ? '📈' : item.type === 'match' ? '⚽' : '📄';
      var href = item.type === 'edge' ? '/edges/' : item.type === 'match' ? '/matches/' : '/';
      html += '<div class="fav-item">'
        + '<span class="fav-icon">' + icon + '</span>'
        + '<div class="fav-label">' + (item.label || 'Saved item') + '</div>'
        + '<div class="fav-meta">' + (item.type || '') + '</div>'
        + '<a href="' + href + '" class="fav-link">View</a>'
        + '<button class="fav-remove" onclick="localStorage.removeItem(\'' + k + '\');renderProfile()">&#10005;</button>'
        + '</div>';
    } catch(e) {}
  });
  html += '</div>';
  return html;
}
