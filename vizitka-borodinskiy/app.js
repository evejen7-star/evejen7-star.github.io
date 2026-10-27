/* Цели Яндекс Метрики: нажатия на кнопки барбершопа (контакты разработчика не считаются).
   Чтобы цели попали в отчёты, в Метрике нужны цели "JavaScript-событие" с теми же идентификаторами. */
(function () {
  'use strict';

  var COUNTER_ID = 113829395;
  var goals = [
    { test: /yclients\.com/, name: 'borodinskiy_book' },
    { test: /^tel:\+79375548775$/, name: 'borodinskiy_call' },
    { test: /t\.me\/Borodinskiy_barber/, name: 'borodinskiy_telegram' },
    { test: /yandex\.ru\/maps\//, name: 'borodinskiy_map' },
    { test: /vk\.ru\/borodinskiy_vlg/, name: 'borodinskiy_vk' }
  ];

  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href]') : null;
    if (!link || link.closest('.dev-contacts')) return;
    var href = link.getAttribute('href');
    for (var i = 0; i < goals.length; i++) {
      if (goals[i].test.test(href)) {
        if (typeof window.ym === 'function') window.ym(COUNTER_ID, 'reachGoal', goals[i].name);
        return;
      }
    }
  });
})();

/* Нижняя панель на телефоне: скрыта, пока в кадре кнопки hero или блок "Записаться".
   Без JS панель просто показана всегда. */
(function () {
  'use strict';

  var bar = document.querySelector('.bar');
  var heroActions = document.querySelector('.hero__actions');
  var zapis = document.getElementById('zapis');

  if (!bar || !heroActions || !zapis || !('IntersectionObserver' in window)) {
    return;
  }

  var visible = { hero: false, zapis: false };

  function update() {
    var hide = visible.hero || visible.zapis;
    bar.classList.toggle('is-hidden', hide);
  }

  /* до первого срабатывания наблюдателя панель скрыта (первый экран - hero) */
  bar.classList.add('is-hidden');

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.target === heroActions) {
        visible.hero = entry.isIntersecting;
      } else if (entry.target === zapis) {
        visible.zapis = entry.isIntersecting;
      }
    });
    update();
  }, { threshold: 0 });

  observer.observe(heroActions);
  observer.observe(zapis);
})();
