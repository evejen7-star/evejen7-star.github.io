/* Счётчик посещений и список отзывов. Данные ходят только на сервер автоматизации владельца сайта (n8n), сторонних счётчиков нет. */
(function () {
  var API = 'https://lostrethiblekree.beget.app/webhook/';

  function store(key, val) {
    try {
      if (val === undefined) return window.localStorage.getItem(key);
      if (val === null) window.localStorage.removeItem(key); else window.localStorage.setItem(key, val);
    } catch (e) {}
    return null;
  }

  /* --- счётчик посещений --- */
  function countVisit() {
    var q = location.search;
    if (/[?&]nocount=1\b/.test(q)) store('em_nocount', '1');
    if (/[?&]nocount=0\b/.test(q)) store('em_nocount', null);
    if (store('em_nocount')) return;
    var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
    if (local && !/[?&]testcount=1\b/.test(q)) return;
    if (navigator.webdriver || /bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent)) return;

    var vid = store('em_vid');
    if (!vid) {
      vid = 'v' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
      store('em_vid', vid);
    }
    var data = {
      vid: vid,
      page: location.pathname,
      ref: document.referrer || '',
      device: window.matchMedia('(max-width: 760px)').matches ? 'mobile' : 'desktop'
    };
    try {
      fetch(API + 'site-visit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(function () {});
    } catch (e) {}
  }

  /* --- список опубликованных отзывов --- */
  function renderReviews() {
    var box = document.getElementById('reviews-list');
    var section = document.getElementById('otzyvy');
    if (!box || !section || !window.fetch) return;
    fetch(API + 'site-reviews').then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !d.reviews || !d.reviews.length) return;
      d.reviews.forEach(function (r) {
        var card = document.createElement('article');
        card.className = 'review';
        var stars = document.createElement('div');
        stars.className = 'stars';
        var n = Math.max(1, Math.min(5, Number(r.rating) || 5));
        stars.setAttribute('role', 'img');
        stars.setAttribute('aria-label', 'Оценка ' + n + ' из 5');
        stars.textContent = '★★★★★'.slice(0, n) + '☆☆☆☆☆'.slice(0, 5 - n);
        var text = document.createElement('p');
        text.textContent = r.text;
        var who = document.createElement('div');
        who.className = 'who';
        var name = document.createElement('b');
        name.textContent = r.name;
        who.appendChild(name);
        if (r.business) {
          var biz = document.createElement('span');
          biz.textContent = r.business;
          who.appendChild(biz);
        }
        card.appendChild(stars);
        card.appendChild(text);
        card.appendChild(who);
        box.appendChild(card);
      });
      section.hidden = false;
    }).catch(function () {});
  }

  window.EMSite = { api: API };
  countVisit();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', renderReviews); else renderReviews();
})();
