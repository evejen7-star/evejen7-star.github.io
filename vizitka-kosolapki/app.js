/* Сборка страницы-визитки из window.SITE (данные в site.js). Темы оформления - ниже. */
(function () {
  var S = window.SITE;
  var NB = " ";

  var THEMES = {
    /* мягкая: салоны красоты и маникюр */
    nails: {
      fonts: "family=Yeseva+One&family=Jost:wght@400;500;600;700",
      vars: { "--bg": "#F1F3EF", "--surface": "#FFFFFF", "--ink": "#1E2724", "--muted": "#55635E",
        "--accent": "#B0346B", "--on-accent": "#FFFFFF", "--line": "#D5DBD6", "--line-strong": "#98A59F",
        "--font-head": "\"Yeseva One\", Georgia, serif", "--font-body": "\"Jost\", system-ui, sans-serif",
        "--head-weight": "400", "--r": "20px", "--r-s": "12px" },
      pattern: "dots"
    },
    /* строгая: барбершопы */
    barber: {
      fonts: "family=Alumni+Sans:wght@700;800&family=Golos+Text:wght@400;500;600;700",
      vars: { "--bg": "#E8E4DD", "--surface": "#F6F3EE", "--ink": "#17191B", "--muted": "#55524D",
        "--accent": "#1F5B4A", "--on-accent": "#FFFFFF", "--line": "#CBC5BA", "--line-strong": "#8C867B",
        "--font-head": "\"Alumni Sans\", Impact, sans-serif", "--font-body": "\"Golos Text\", system-ui, sans-serif",
        "--head-weight": "700", "--track": "0.015em", "--r": "3px", "--r-s": "2px",
        /* узкий гротеск мелковат при обычных размерах, поэтому заголовки крупнее */
        "--h1-size": "clamp(3.6rem, 15vw, 6.6rem)", "--h2-size": "clamp(2.6rem, 9vw, 3.8rem)", "--h3-size": "1.9rem", "--phone-size": "clamp(2.8rem, 11vw, 4.2rem)" },
      pattern: "stripes"
    },
    /* тёплая: кондитерские и торты на заказ */
    sweets: {
      fonts: "family=Comfortaa:wght@600;700&family=Nunito:wght@400;600;700;800",
      vars: { "--bg": "#EAF2F7", "--surface": "#FFFFFF", "--ink": "#1B2A3A", "--muted": "#4C5F73",
        "--accent": "#C72E5E", "--on-accent": "#FFFFFF", "--line": "#C9D7E2", "--line-strong": "#8097AC",
        "--font-head": "\"Comfortaa\", system-ui, sans-serif", "--font-body": "\"Nunito\", system-ui, sans-serif",
        "--head-weight": "700", "--track": "-0.02em", "--r": "16px", "--r-s": "999px", "--r-tile": "26px",
        "--h1-size": "clamp(2.2rem, 8.5vw, 3.9rem)" },
      pattern: "checks"
    }
  };

  var PATTERNS = {
    dots: "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--accent) 22%, var(--surface)) 2.5px, transparent 3px) 0 0 / 22px 22px, var(--surface)",
    stripes: "repeating-linear-gradient(135deg, color-mix(in srgb, var(--accent) 16%, var(--surface)) 0 10px, var(--surface) 10px 20px)",
    checks: "conic-gradient(color-mix(in srgb, var(--accent) 14%, var(--surface)) 25%, var(--surface) 0 50%, color-mix(in srgb, var(--accent) 14%, var(--surface)) 0 75%, var(--surface) 0) 0 0 / 40px 40px"
  };

  var EVGENY = { tg: "https://t.me/EvgenyMordvintsev", tgName: "@EvgenyMordvintsev", tel: "+79270614295", telText: "+7 (927) 061-42-95",
    mail: "evejen7@gmail.com", site: "https://evejen7-star.github.io" };

  var DAYS = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  var DAYS_ACC = ["в понедельник", "во вторник", "в среду", "в четверг", "в пятницу", "в субботу", "в воскресенье"];

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[c];
    });
  }
  function money(item) {
    var p = String(item.price);
    var num = /^[\d\s]+$/.test(p);
    return (item.from ? "от" + NB : "") + p.replace(/ /g, NB) + (num ? NB + "₽" : "");
  }

  /* тема */
  var qt = /[?&]theme=(\w+)/.exec(location.search); /* ?theme=barber - посмотреть другую тему, не меняя site.js */
  var themeKey = (qt && THEMES[qt[1]]) ? qt[1] : (THEMES[S.theme] ? S.theme : "nails");
  var theme = THEMES[themeKey];
  var root = document.documentElement;
  root.setAttribute("data-theme", themeKey);
  Object.keys(theme.vars).forEach(function (k) { root.style.setProperty(k, theme.vars[k]); });
  root.style.setProperty("--ph", PATTERNS[theme.pattern]);
  var fl = document.createElement("link");
  fl.rel = "stylesheet";
  fl.href = "https://fonts.googleapis.com/css2?" + theme.fonts + "&display=swap";
  document.head.appendChild(fl);

  document.title = S.name + " - " + S.tagline;
  var md = document.querySelector("meta[name=description]");
  if (md) md.setAttribute("content", S.name + ", " + S.city + ", " + S.address + ". " + S.tagline + ".");

  /* часы работы и статус «открыто» по времени заведения */
  function parseHours(s) {
    if (!s) return null;
    var m = /^(\d{1,2}):(\d{2})-(\d{1,2}):(\d{2})$/.exec(s);
    return m ? { open: +m[1] * 60 + +m[2], close: +m[3] * 60 + +m[4], from: m[1].padStart(2, "0") + ":" + m[2], to: m[3].padStart(2, "0") + ":" + m[4] } : null;
  }
  function nowInZone() {
    var parts = new Intl.DateTimeFormat("en-US", { timeZone: S.timezone || "Europe/Moscow", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var wd = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(o.weekday);
    return { day: wd < 0 ? 0 : wd, min: (+o.hour % 24) * 60 + +o.minute };
  }
  function statusText() {
    var n = nowInZone();
    var today = parseHours(S.hours[n.day]);
    if (today && n.min >= today.open && n.min < today.close) return { open: true, text: "Открыто, до" + NB + today.to };
    if (today && n.min < today.open) return { open: false, text: "Закрыто, откроемся в" + NB + today.from };
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7, h = parseHours(S.hours[d]);
      if (h) return { open: false, text: "Закрыто, откроемся " + (i === 1 ? "завтра" : DAYS_ACC[d]) + " в" + NB + h.from };
    }
    return { open: false, text: "Закрыто" };
  }

  var st = statusText();
  var phoneHref = "tel:" + String(S.phone).replace(/[^\d+]/g, "");
  var write = (S.messengers && S.messengers[0]) || null;
  var mapUrl = "https://yandex.ru/maps/?text=" + encodeURIComponent(S.mapQuery || (S.address + ", " + S.city));

  function actionsHtml() {
    return "<a class=\"btn btn--main\" href=\"" + esc(phoneHref) + "\">Позвонить</a>" +
      (write ? "<a class=\"btn btn--alt\" href=\"" + esc(write.url) + "\" target=\"_blank\" rel=\"noopener\">" + esc(write.heroLabel || "Написать") + "</a>" : "");
  }

  /* часто выбирают: первые 3 услуги с top */
  var top = [];
  S.prices.forEach(function (g) { g.items.forEach(function (it) { if (it.top && top.length < 3) top.push(it); }); });

  function listHtml(items) {
    return "<ul class=\"list\">" + items.map(function (it) {
      return "<li><span class=\"list__name\">" + esc(it.name) + (it.note ? "<small>" + esc(it.note) + "</small>" : "") +
        "</span><span class=\"list__dots\" aria-hidden=\"true\"></span><span class=\"list__price\">" + esc(money(it)) + "</span></li>";
    }).join("") + "</ul>";
  }

  var html = "";

  if (S.demo) {
    html += "<div class=\"demo\"><p>Демонстрационная версия для " + esc(S.demo.forName) + ". Страница доступна до " + esc(S.demo.until) + ".</p></div>";
  }

  html += "<header class=\"hero\"><div class=\"wrap hero__grid\"><div class=\"hero__main\">" +
    "<h1>" + esc(S.name) + "</h1>" +
    "<p class=\"hero__tag\">" + esc(S.tagline) + "</p>" +
    "<p class=\"hero__addr\">" + esc(S.city) + ", " + esc(S.address) + "</p>" +
    "<p class=\"status" + (st.open ? " is-open" : "") + "\"><span class=\"status__dot\" aria-hidden=\"true\"></span><span>" + esc(st.text) + "</span></p>" +
    "<div class=\"actions\" id=\"hero-actions\">" + actionsHtml() + "</div>" +
    (S.rating ? "<p class=\"rating\"><strong>" + esc(S.rating.value) + "</strong> на " + esc(S.rating.source) + ", " + esc(S.rating.count) + " отзывов</p>" : "") +
    "</div>" +
    (top.length ? "<aside class=\"top\" aria-labelledby=\"top-h\"><h2 id=\"top-h\">Основные услуги</h2>" + listHtml(top) + "</aside>" : "") +
    "</div><div class=\"edge\" aria-hidden=\"true\"></div></header>";

  html += "<section class=\"block\" id=\"prices\"><div class=\"wrap\"><h2>Услуги и цены</h2><div class=\"groups\">" +
    S.prices.map(function (g) { return "<div><h3>" + esc(g.group) + "</h3>" + listHtml(g.items) + "</div>"; }).join("") +
    "</div>" + (S.pricesNote ? "<p class=\"note\">" + esc(S.pricesNote) + "</p>" : "") + "</div></section>";

  var wk = S.works || { items: [] };
  var tiles = "";
  if (wk.items && wk.items.length) {
    tiles = wk.items.map(function (w) { return "<div class=\"work\"><img src=\"" + esc(w.src) + "\" alt=\"" + esc(w.alt || "") + "\" loading=\"lazy\"></div>"; }).join("");
  } else {
    for (var i = 0; i < 6; i++) tiles += "<div class=\"work work--ph\" aria-hidden=\"true\">" + (i === 0 ? "<span>Здесь будут ваши работы</span>" : "") + "</div>";
  }
  var hasPhotos = !!(wk.items && wk.items.length);
  html += "<section class=\"block\" id=\"works\"><div class=\"wrap\"><h2>Работы</h2><div class=\"works" + (hasPhotos ? "" : " works--ph") + "\">" + tiles + "</div>" +
    (wk.note && !(wk.items && wk.items.length) ? "<p class=\"note\">" + esc(wk.note) + "</p>" : "") + "</div></section>";

  if (S.reviews && S.reviews.length) {
    html += "<section class=\"block\" id=\"reviews\"><div class=\"wrap\"><h2>Отзывы</h2><div class=\"reviews\">" +
      S.reviews.map(function (r) { return "<blockquote class=\"review\" style=\"margin:0\"><p>" + esc(r.text) + "</p><footer>" + esc(r.name) + (r.source ? ", " + esc(r.source) : "") + "</footer></blockquote>"; }).join("") +
      "</div></div></section>";
  }

  var today = nowInZone().day;
  html += "<section class=\"block\" id=\"find\"><div class=\"wrap\"><h2>Как найти</h2><div class=\"find\"><div>" +
    "<p class=\"addr\">" + esc(S.city) + ", " + esc(S.address) + "</p>" +
    (S.directions ? "<p>" + esc(S.directions) + "</p>" : "") +
    "<a class=\"btn btn--alt\" href=\"" + esc(mapUrl) + "\" target=\"_blank\" rel=\"noopener\">Открыть на карте</a></div>" +
    "<table class=\"hours\"><caption class=\"sr\" style=\"position:absolute;left:-9999px\">Часы работы</caption><tbody>" +
    DAYS.map(function (d, i) {
      var h = parseHours(S.hours[i]);
      return "<tr" + (i === today ? " class=\"is-today\"" : "") + "><th scope=\"row\">" + d + "</th><td>" + (h ? h.from + " - " + h.to : "выходной") + "</td></tr>";
    }).join("") + "</tbody></table></div></div></section>";

  html += "<section class=\"block contacts\" id=\"contacts\"><div class=\"wrap\"><h2>Записаться</h2><p>" + esc(S.contactNote) + "</p>" +
    "<a class=\"phone\" href=\"" + esc(phoneHref) + "\">" + esc(S.phone) + "</a>" +
    "<div class=\"actions\">" + (S.messengers || []).map(function (m, i) {
      return "<a class=\"btn " + (i === 0 ? "btn--main" : "btn--alt") + "\" href=\"" + esc(m.url) + "\" target=\"_blank\" rel=\"noopener\">" + esc(m.label) + "</a>";
    }).join("") + "</div></div></section>";

  if (S.demo) {
    html += "<footer class=\"credit\"><div class=\"wrap\"><p>Демонстрационная страница сделана для " + esc(S.demo.forName) + " на открытых данных из карточки на Яндекс Картах. Автор: Евгений, веб-разработчик, Волгоград. " +
      "<a href=\"" + EVGENY.tg + "\">Telegram " + EVGENY.tgName + "</a>, <a href=\"tel:" + EVGENY.tel + "\">" + EVGENY.telText + "</a>, <a href=\"mailto:" + EVGENY.mail + "\">" + EVGENY.mail + "</a>, " +
      "<a href=\"" + EVGENY.site + "\">примеры работ</a>.</p></div></footer>";
  }

  html += "<div class=\"dock\" id=\"dock\" aria-label=\"Быстрая связь\">" + actionsHtml() + "</div>";

  document.getElementById("app").innerHTML = html;
  document.body.classList.add("has-dock");

  /* липкая панель: показываем, когда кнопки первого экрана ушли за пределы экрана */
  var heroActions = document.getElementById("hero-actions"), dock = document.getElementById("dock");
  if ("IntersectionObserver" in window && heroActions && dock) {
    new IntersectionObserver(function (e) { dock.classList.toggle("is-on", !e[0].isIntersecting && e[0].boundingClientRect.top < 0); }).observe(heroActions);
  } else if (dock) {
    dock.classList.add("is-on");
  }

  /* служебная проверка: незаполненные заглушки [ ] (локально или с ?check) */
  var local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) || /[?&]check\b/.test(location.search);
  if (local) {
    var found = (document.getElementById("app").textContent.match(/\[[^\]]+\]/g) || []);
    var hrefs = (document.getElementById("app").innerHTML.match(/href="[^"]*\[[^"]*"/g) || []);
    var total = found.length + hrefs.length;
    if (total) {
      var bar = document.createElement("div");
      bar.className = "check";
      bar.textContent = "Не заполнено полей: " + total + ". Пример: " + (found[0] || hrefs[0]) + ". Перед публикацией должно быть 0.";
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }
})();
