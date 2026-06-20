/* ============ Теория романа · общий скрипт сайта ============ */
(function(){
  "use strict";

  // Порядок страниц и метаданные
  var PAGES = [
    {f:"index.html",        n:"0",  t:"Обзор курса и экзамен",              g:"Курс"},
    {f:"bahtin.html",       n:"1",  t:"Бахтин. Эпос и роман",              g:"Вопрос 1 · статьи семинаров"},
    {f:"lukacs.html",       n:"2",  t:"Лукач. Исторический роман",          g:"Вопрос 1 · статьи семинаров"},
    {f:"watt.html",         n:"3",  t:"Watt. The Rise of the Novel",        g:"Вопрос 1 · статьи семинаров"},
    {f:"jameson.html",      n:"4",  t:"Jameson. Национальная аллегория",    g:"Вопрос 1 · статьи семинаров"},
    {f:"beecroft.html",     n:"5",  t:"Beecroft. Rises of the Novel",       g:"Вопрос 1 · статьи семинаров"},
    {f:"said.html",         n:"6",  t:"Саид. Нарратив и пространство",      g:"Вопрос 1 · статьи семинаров"},
    {f:"armstrong.html",    n:"7",  t:"Armstrong / Boxall. Субъект",        g:"Вопрос 1 · статьи семинаров"},
    {f:"paige.html",        n:"8",  t:"Paige. Technologies of the Novel",   g:"Вопрос 1 · статьи семинаров"},
    {f:"lectures.html",     n:"Л",  t:"Лекции Л1–Л6",                       g:"Лекции (рамка А.В. Вдовина)"},
    {f:"boxall-voice.html", n:"a",  t:"Boxall. The Novel Voice",            g:"Вопрос 2 · на 9–10"},
    {f:"miller.html",       n:"b",  t:"Miller. The Novel and the Police",   g:"Вопрос 2 · на 9–10"},
    {f:"moretti.html",      n:"c",  t:"Moretti. Atlas, гл. 3",              g:"Вопрос 2 · на 9–10"}
  ];

  function el(tag, attrs, html){
    var e = document.createElement(tag);
    if(attrs){ for(var k in attrs){ e.setAttribute(k, attrs[k]); } }
    if(html != null){ e.innerHTML = html; }
    return e;
  }

  var current = document.body.getAttribute("data-page") || "index.html";

  // -------- mobile menu button + scrim --------
  var menubtn = el("button", {"class":"menubtn", "id":"menubtn", "aria-label":"Разделы"}, "☰ Разделы");
  var scrim = el("div", {"class":"scrim", "id":"scrim"});
  document.body.insertBefore(scrim, document.body.firstChild);
  document.body.insertBefore(menubtn, document.body.firstChild);

  // -------- sidebar --------
  var side = el("nav", {"class":"side", "id":"side"});
  var brand = el("a", {"class":"brand", "href":"index.html"},
    'Теория романа<small>Конспект · экзамен 2025–26</small>');
  side.appendChild(brand);

  var sw = el("div", {"class":"searchwrap"});
  sw.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>' +
    '<input id="search" type="text" placeholder="Поиск на странице…" autocomplete="off">';
  side.appendChild(sw);
  side.appendChild(el("div", {"id":"searchnote"}, ""));

  var expandBtn = el("button", {"class":"expandbtn", "id":"expandall"}, "Раскрыть все ответы");
  side.appendChild(expandBtn);

  var lastGroup = null, ol = null;
  PAGES.forEach(function(p){
    if(p.g !== lastGroup){
      side.appendChild(el("p", {"class":"navgroup"}, p.g));
      ol = el("ol"); side.appendChild(ol);
      lastGroup = p.g;
    }
    var li = el("li");
    var a = el("a", {"href":p.f}, '<span class="nm">'+p.n+'</span><span>'+p.t+'</span>');
    if(p.f === current){ a.setAttribute("aria-current","page"); }
    li.appendChild(a); ol.appendChild(li);
  });
  // вставляем сайдбар как первый элемент внутри .shell (а не в body),
  // чтобы заработала двухколоночная сетка nav + main
  var shell = document.querySelector(".shell");
  if(shell){ shell.insertBefore(side, shell.firstChild); }
  else { document.body.insertBefore(side, document.body.firstChild.nextSibling); }

  // -------- prev / next (only on content pages) --------
  var idx = -1;
  for(var i=0;i<PAGES.length;i++){ if(PAGES[i].f === current){ idx = i; break; } }
  var main = document.querySelector("main");
  if(main && idx > -1){
    var pn = document.getElementById("pagenav") || el("div", {"id":"pagenav"});
    if(!pn.parentNode){
      var wrap = main.querySelector(".wrap") || main;
      wrap.appendChild(pn);
    }
    pn.innerHTML = "";
    if(idx > 0){
      var prev = PAGES[idx-1];
      pn.appendChild(el("a", {"class":"prev","href":prev.f},
        '<span class="dir">← Назад</span><span class="ttl">'+prev.t+'</span>'));
    }
    if(idx < PAGES.length-1){
      var next = PAGES[idx+1];
      pn.appendChild(el("a", {"class":"next","href":next.f},
        '<span class="dir">Дальше →</span><span class="ttl">'+next.t+'</span>'));
    }
  }

  // -------- controls (theme + top) --------
  var controls = el("div", {"class":"controls"});
  controls.innerHTML =
    '<button class="themebtn" id="themebtn" aria-label="Сменить тему"><span class="dot" id="themedot"></span><span id="themelabel">День</span></button>' +
    '<button id="topbtn" aria-label="Наверх">↑</button>';
  document.body.appendChild(controls);

  // -------- theme cycle --------
  var themes = [
    {id:"light", label:"День",  color:"oklch(0.965 0.009 85)"},
    {id:"sepia", label:"Сепия", color:"oklch(0.90 0.04 80)"},
    {id:"dark",  label:"Ночь",  color:"oklch(0.22 0.02 70)"}
  ];
  var ti = 0, html = document.documentElement;
  var dot = document.getElementById("themedot"), label = document.getElementById("themelabel");
  function applyTheme(){
    var t = themes[ti];
    if(t.id === "light"){ html.removeAttribute("data-theme"); } else { html.setAttribute("data-theme", t.id); }
    dot.style.background = t.color; label.textContent = t.label;
  }
  applyTheme();
  document.getElementById("themebtn").addEventListener("click", function(){ ti=(ti+1)%themes.length; applyTheme(); });
  document.getElementById("topbtn").addEventListener("click", function(){ window.scrollTo({top:0, behavior:"smooth"}); });

  // -------- mobile nav toggle --------
  function closeNav(){ side.classList.remove("open"); scrim.classList.remove("on"); }
  menubtn.addEventListener("click", function(){ side.classList.toggle("open"); scrim.classList.toggle("on"); });
  scrim.addEventListener("click", closeNav);

  // -------- expand / collapse all answers --------
  var allOpen = false;
  expandBtn.addEventListener("click", function(){
    allOpen = !allOpen;
    document.querySelectorAll("details.qa").forEach(function(d){ d.open = allOpen; });
    expandBtn.textContent = allOpen ? "Свернуть все ответы" : "Раскрыть все ответы";
  });

  // -------- in-page search (safe: textContent only) --------
  var search = document.getElementById("search");
  var note = document.getElementById("searchnote");
  var blocks = Array.prototype.slice.call(document.querySelectorAll("main section, main .read > .concept, main .read > .terms"));
  var debounce;
  function clearMarks(root){
    root.querySelectorAll("mark").forEach(function(m){ var p=m.parentNode; p.replaceChild(document.createTextNode(m.textContent), m); p.normalize(); });
  }
  function highlight(root, q){
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode:function(n){
        if(!n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var tag = n.parentNode.nodeName;
        if(tag==="SCRIPT"||tag==="STYLE"||tag==="MARK") return NodeFilter.FILTER_REJECT;
        return n.nodeValue.toLowerCase().indexOf(q) > -1 ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes=[], n; while((n=walker.nextNode())) nodes.push(n);
    nodes.forEach(function(node){
      var text=node.nodeValue, low=text.toLowerCase(), p, last=0, frag=document.createDocumentFragment();
      while((p=low.indexOf(q,last))>-1){
        if(p>last) frag.appendChild(document.createTextNode(text.slice(last,p)));
        var mk=document.createElement("mark"); mk.textContent=text.slice(p,p+q.length); frag.appendChild(mk);
        last=p+q.length;
      }
      if(last<text.length) frag.appendChild(document.createTextNode(text.slice(last)));
      node.parentNode.replaceChild(frag,node);
    });
  }
  if(search){
    search.addEventListener("input", function(){
      clearTimeout(debounce);
      debounce = setTimeout(function(){
        var q = search.value.trim().toLowerCase();
        var scope = document.querySelector("main");
        clearMarks(scope);
        blocks.forEach(function(b){ b.classList.remove("search-hidden"); });
        if(q.length < 2){ note.textContent=""; return; }
        var hits = 0;
        blocks.forEach(function(b){
          if(b.textContent.toLowerCase().indexOf(q) > -1){ highlight(b,q); hits++; }
          else { b.classList.add("search-hidden"); }
        });
        note.textContent = hits ? ("найдено в "+hits+" блоках") : "ничего не найдено на этой странице";
      }, 160);
    });
  }
})();
