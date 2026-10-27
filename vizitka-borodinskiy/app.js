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
