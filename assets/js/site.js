/* 2BYTE v2 — interações (sem dependências) */
(function () {
  "use strict";
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var WA = "5531992636520";

  /* ---------- navegação, progresso, scrollspy ---------- */
  var nav = $("#nav"), burger = $(".burger"), prog = $("#prog");
  function setMenu(o) { nav.classList.toggle("open", o); burger.setAttribute("aria-expanded", o); burger.setAttribute("aria-label", o ? "Fechar menu" : "Abrir menu"); }
  if (burger) {
    burger.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    $$("#nav-links a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }
  var spy = $$("#nav-links a[data-s]");
  var secs = spy.map(function (a) { return document.getElementById(a.getAttribute("data-s")); }).filter(Boolean);
  function onScroll() {
    var y = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    if (nav) nav.classList.toggle("scrolled", y > 20);
    if (prog) prog.style.transform = "scaleX(" + (h > 0 ? Math.min(1, y / h) : 0).toFixed(4) + ")";
    if (secs.length) {
      var cur = null;
      secs.forEach(function (s) { if (s.getBoundingClientRect().top < innerHeight * 0.38) cur = s.id; });
      spy.forEach(function (a) { a.classList.toggle("on", a.getAttribute("data-s") === cur); });
    }
    manifesto();
  }

  /* ---------- manifesto: palavras acendem ao rolar ---------- */
  var mp = $("#manifesto"), words = [];
  if (mp) {
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(document.createTextNode(t)); return; }
            var s = document.createElement("span"); s.className = "w"; s.textContent = t; frag.appendChild(s); words.push(s);
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) { wrap(n); }
      });
    })(mp);
  }
  function manifesto() {
    if (!words.length) return;
    var r = mp.getBoundingClientRect(), vh = innerHeight;
    var p = (vh * 0.82 - r.top) / (r.height + vh * 0.25);
    var n = Math.round(Math.max(0, Math.min(1, p)) * (words.length + 2));
    for (var i = 0; i < words.length; i++) words[i].classList.toggle("lit", i < n);
  }
  window.addEventListener("scroll", function () { requestAnimationFrame(onScroll); }, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  /* ---------- revelar ao rolar ---------- */
  var rv = $$(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }); }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    rv.forEach(function (el) { io.observe(el); });
  } else { rv.forEach(function (el) { el.classList.add("in"); }); }

  /* brilho nos cards */
  $$(".cell").forEach(function (c) {
    c.addEventListener("pointermove", function (e) { var r = c.getBoundingClientRect(); c.style.setProperty("--mx", (e.clientX - r.left) + "px"); c.style.setProperty("--my", (e.clientY - r.top) + "px"); });
  });

  /* inclinação do símbolo */
  var sym = $("#sym");
  if (sym && !reduce && matchMedia("(hover: hover)").matches) {
    document.addEventListener("pointermove", function (e) {
      var x = (e.clientX / innerWidth - 0.5), y = (e.clientY / innerHeight - 0.5);
      sym.style.transform = "translate(" + (x * 18).toFixed(1) + "px," + (y * 14).toFixed(1) + "px) rotate(" + (x * 5).toFixed(2) + "deg)";
    }, { passive: true });
  }

  /* ---------- terminal digitando ---------- */
  var term = $("#term");
  if (term && !reduce) {
    var LINES = [
      '<span class="p">$</span> 2byte diagnosticar --empresa',
      '<span class="ok">▸</span> mapeando a rede ........ <span class="ok">ok</span>',
      '<span class="ok">▸</span> revisando firewall ..... <span class="wn">3 ajustes</span>',
      '<span class="ok">▸</span> testando o backup ...... <span class="ok">restaurou</span>',
      '<span class="ok">▸</span> documentando ........... <span class="ok">pronto</span>',
      '',
      '<span class="p">→</span> ambiente estável.',
      '<span class="p">→</span> próximo passo: proposta clara.'
    ];
    var running = false, timer;
    var plain = function (h) { var d = document.createElement("div"); d.innerHTML = h; return d.textContent; };
    function play() {
      if (running) return; running = true;
      var out = [], li = 0;
      term.innerHTML = "";
      (function next() {
        if (li >= LINES.length) { timer = setTimeout(function () { running = false; if (visible) play(); }, 5200); return; }
        var html = LINES[li], t = plain(html), ci = 0;
        var typed = li === 0;
        if (!typed) { out.push(html); li++; render(out); timer = setTimeout(next, li === 6 ? 700 : 520); return; }
        (function ch() {
          ci++; render(out.concat([t.slice(0, ci)]).map(function (s, i, a) { return i === a.length - 1 ? '<span class="p">$</span>' + s.slice(1) : s; }));
          if (ci < t.length) timer = setTimeout(ch, 38); else { out.push(html); li++; render(out); timer = setTimeout(next, 520); }
        })();
      })();
    }
    function render(arr) { term.innerHTML = arr.join("\n") + '<span class="cur"></span>'; }
    var visible = false;
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); }, { threshold: 0.3 }).observe(term);
  }

  /* ---------- campo de bytes (canvas) ---------- */
  var cv = $("#bytes");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d"), cells = [], W = 0, H = 0, dpr = Math.min(2, devicePixelRatio || 1), mx = -999, my = -999, raf = 0, on = false;
    var CELL = 26, SZ = 11;
    var build = function () {
      var r = cv.getBoundingClientRect(); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cells = [];
      for (var y = 0; y < H; y += CELL) for (var x = 0; x < W; x += CELL) cells.push({ x: x + 6, y: y + 6, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.1, c: Math.random() < 0.55 ? 0 : 1 });
    };
    var draw = function (t) {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i], v = (Math.sin(t * 0.001 * c.s + c.p) + 1) / 2, a = v > 0.9 ? (v - 0.9) / 0.1 * 0.24 : 0;
        var dx = c.x - mx, dy = c.y - my, d = Math.sqrt(dx * dx + dy * dy), sz = SZ;
        if (d < 150) { var k = 1 - d / 150; a += k * 0.4; sz += k * 4; }
        if (a < 0.02) continue;
        ctx.globalAlpha = Math.min(a, 0.85);
        ctx.fillStyle = c.c ? "#20c4e8" : "#087fe0";
        ctx.fillRect(c.x - (sz - SZ) / 2, c.y - (sz - SZ) / 2, sz, sz);
      }
      ctx.globalAlpha = 1;
    };
    var loop = function (t) { draw(t); raf = on ? requestAnimationFrame(loop) : 0; };
    build();
    if (reduce) { draw(3000); } else {
      new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on && !raf) raf = requestAnimationFrame(loop); }, { threshold: 0 }).observe(cv);
      var hero = $("#topo");
      hero.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
      hero.addEventListener("pointerleave", function () { mx = my = -999; });
    }
    var rt; window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { build(); if (reduce) draw(3000); }, 200); });
  }

  /* ---------- abas por segmento ---------- */
  var tabs = $$('[role="tab"]');
  function selectTab(t, focus) {
    tabs.forEach(function (x) {
      var s = x === t; x.setAttribute("aria-selected", s); x.tabIndex = s ? 0 : -1;
      var p = document.getElementById(x.getAttribute("aria-controls")); if (p) p.hidden = !s;
    });
    if (focus) t.focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener("click", function () { selectTab(t); });
    t.addEventListener("keydown", function (e) {
      var k = e.key, n = null;
      if (k === "ArrowDown" || k === "ArrowRight") n = tabs[(i + 1) % tabs.length];
      else if (k === "ArrowUp" || k === "ArrowLeft") n = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (k === "Home") n = tabs[0]; else if (k === "End") n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); selectTab(n, true); }
    });
  });

  /* ---------- wizard de orçamento ---------- */
  var wiz = $("#wiz");
  if (wiz) {
    var steps = $$("fieldset", wiz), bars = $$(".bars i", wiz), cur = 0;
    var back = $("#back"), next = $("#next"), send = $("#send"), lab = $("#wiz-step"), prev = $("#prev"), seg = $("#segmento");
    function msg() {
      var f = new FormData(wiz), sv = f.getAll("servico"), L = ["Olá, 2BYTE! Gostaria de solicitar um orçamento.", ""];
      var g = function (k) { return (f.get(k) || "").toString().trim(); };
      if (g("segmento")) L.push("*Segmento:* " + g("segmento"));
      if (sv.length) L.push("*Preciso de:* " + sv.join(", "));
      if (g("equipe")) L.push("*Equipe:* " + g("equipe"));
      if (g("prazo")) L.push("*Urgência:* " + g("prazo"));
      if (g("cidade")) L.push("*Cidade:* " + g("cidade"));
      L.push("", "*Nome:* " + (g("nome") || "…"));
      if (g("empresa")) L.push("*Empresa:* " + g("empresa"));
      if (g("detalhes")) L.push("", "*Detalhes:* " + g("detalhes"));
      return L.join("\n");
    }
    function show(i, focus) {
      cur = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      bars.forEach(function (b, k) { b.classList.toggle("on", k <= i); });
      lab.textContent = "Passo " + (i + 1) + " de " + steps.length;
      back.hidden = i === 0; next.hidden = i === steps.length - 1; send.hidden = i !== steps.length - 1;
      if (i === steps.length - 1) prev.textContent = msg();
      if (focus) { var h = $("h3", steps[i]); if (h) h.focus({ preventScroll: true }); }
    }
    next.addEventListener("click", function () {
      if (cur === 0) {
        var any = $$('input[name="servico"]:checked', wiz).length > 0;
        $("#err0").hidden = any; if (!any) return;
      }
      show(cur + 1, true);
    });
    back.addEventListener("click", function () { show(cur - 1, true); });
    wiz.addEventListener("input", function () { if (cur === steps.length - 1) prev.textContent = msg(); var e0 = $("#err0"); if (e0 && $$('input[name="servico"]:checked', wiz).length) e0.hidden = true; });
    wiz.addEventListener("submit", function (e) {
      e.preventDefault();
      var nome = $("#nome"); if (!nome.value.trim()) { nome.reportValidity(); nome.focus(); return; }
      window.open("https://wa.me/" + WA + "?text=" + encodeURIComponent(msg()), "_blank", "noopener");
      $("#sent").hidden = false;
    });
    /* cards de serviço e abas pré-selecionam o wizard */
    function setService(v) {
      $$('input[name="servico"]', wiz).forEach(function (i) { i.checked = i.value === v; });
      show(0);
    }
    $$("[data-service]").forEach(function (a) { a.addEventListener("click", function () { seg.value = ""; setService(a.getAttribute("data-service")); }); });
    $$("[data-segment]").forEach(function (a) { a.addEventListener("click", function () { seg.value = a.getAttribute("data-segment"); show(0); }); });
    show(0);
  }

  $$("[data-year]").forEach(function (e) { e.textContent = new Date().getFullYear(); });
})();
