/* Авторское ателье Евгении Карпович - пример сайта. Без библиотек.
   Форма ничего никуда не отправляет: здесь нет сетевых запросов. */
(function () {
  "use strict";

  /* Ссылка на чат МАХ строится от номера телефона (со слов Евгения 26.10). Все кнопки "МАХ"
     получают её, а пометка-заглушка в контактах исчезает. Рабочий ли формат, проверить с телефона. */
  var MAX_URL = "https://max.ru/+79880518110";

  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };

  /* 1. Ссылка МАХ */
  if (MAX_URL) {
    $$("[data-max]").forEach(function (a) {
      a.setAttribute("href", MAX_URL);
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener");
    });
    var stub = $("#max-todo");
    if (stub && stub.parentNode) stub.parentNode.removeChild(stub);
  }

  /* 2. Счётчик заглушек в красной полосе: пометки .todo + заглушка карты .ph (фото теперь настоящие).
     Полоса показывается только при ?check в адресе, для обычного просмотра она скрыта. */
  var todoBar = $("#todo-bar");
  if (todoBar && /[?&]check\b/.test(location.search)) todoBar.hidden = false;
  function countTodos() {
    var text = $$(".todo").length;
    var media = $$(".ph").length;
    var total = text + media;
    var n = $("#todo-count");
    var d = $("#todo-detail");
    if (n) n.textContent = String(total);
    if (d) d.textContent = "(текст и ссылки: " + text + ", карта: " + media + ")";
  }
  countTodos();

  /* 3. Шапка: линия после прокрутки */
  var header = $(".site-header");
  function onScroll() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 0);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* 4. Подсветка активного раздела: в меню шапки (от 1080 px) и в строке кнопок (до 1079 px) */
  var menuLinks = $$(".nav a[href^='#'], .subnav a[href^='#']");
  var subnav = $("#subnav");
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* прокрутить активную кнопку в видимую область строки, не двигая страницу */
  function revealInSubnav(a) {
    if (!subnav || !a || subnav.scrollWidth <= subnav.clientWidth) return;
    var li = a.parentNode;
    var left = li.offsetLeft - (subnav.clientWidth - li.offsetWidth) / 2;
    if (subnav.scrollTo) subnav.scrollTo({ left: left, behavior: reduceMotion ? "auto" : "smooth" });
    else subnav.scrollLeft = left;
  }

  function setActive(id) {
    var shown = null;
    menuLinks.forEach(function (a) {
      var on = !!id && a.getAttribute("href") === "#" + id;
      if (on) { a.setAttribute("aria-current", "location"); if (subnav && subnav.contains(a)) shown = a; }
      else a.removeAttribute("aria-current");
    });
    if (shown) revealInSubnav(shown);
  }

  if ("IntersectionObserver" in window && menuLinks.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id || "");
      });
    }, { rootMargin: "-30% 0px -60% 0px", threshold: 0 });
    menuLinks.forEach(function (a) {
      var sec = document.getElementById(a.getAttribute("href").slice(1));
      if (sec && !sec.__watched) { sec.__watched = true; io.observe(sec); }
    });
    var hero = $(".hero");
    if (hero) io.observe(hero); /* наверху страницы ни один раздел не выделен */
  }

  /* 6. Форма-пример: проверка полей, ничего не отправляется и не очищается */
  var form = $("#lead-form");
  if (form) {
    var fields = [
      { input: $("#f-contact"), error: $("#f-contact-err") },
      { input: $("#f-task"), error: $("#f-task-err") }
    ];

    function check(f, show) {
      var ok = f.input.value.replace(/\s+/g, "").length > 0;
      if (ok || !show) {
        f.input.removeAttribute("aria-invalid");
        f.input.removeAttribute("aria-describedby");
        f.error.hidden = true;
      } else {
        f.input.setAttribute("aria-invalid", "true");
        f.input.setAttribute("aria-describedby", f.error.id);
        $("span", f.error).textContent = f.input.getAttribute("data-error");
        f.error.hidden = false;
      }
      return ok;
    }

    fields.forEach(function (f) {
      f.input.addEventListener("input", function () {
        if (f.input.getAttribute("aria-invalid") === "true") check(f, true);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault(); /* никакой отправки */
      var firstBad = null;
      fields.forEach(function (f) {
        if (!check(f, true) && !firstBad) firstBad = f.input;
      });
      var msg = $("#form-status-text");
      if (msg) msg.hidden = false; /* пометка "Это пример" */
      if (firstBad) {
        firstBad.focus();
      } else {
        var box = $("#form-status");
        if (box) box.focus();
      }
    });

    var photo = $("#f-photo");
    var photoName = $("#f-photo-name");
    if (photo && photoName) {
      photo.addEventListener("change", function () {
        photoName.textContent = photo.files && photo.files.length ? photo.files[0].name : "";
      });
    }
  }
})();
