(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.getElementById('hdr');

  function onScroll() { if (hdr) hdr.classList.toggle('solid', window.scrollY > 60); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* menu and dropdown */
  var menuBtn = document.getElementById('menubtn');
  if (menuBtn && hdr) {
    menuBtn.addEventListener('click', function () {
      var open = hdr.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  document.querySelectorAll('.dd-btn').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var p = b.parentNode, open = p.classList.toggle('open');
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  document.addEventListener('click', function () {
    document.querySelectorAll('.has-dd.open').forEach(function (p) { p.classList.remove('open'); });
  });
  document.querySelectorAll('.links a').forEach(function (a) {
    a.addEventListener('click', function () { if (hdr) hdr.classList.remove('open'); });
  });

  /* statement reveal on scroll (home) */
  var st = document.getElementById('statement');
  if (st && !reduce) {
    var words = [];
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span'); s.className = 'w'; s.textContent = p; frag.appendChild(s); words.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) { wrap(n); }
      });
    })(st);
    st.classList.add('js-reveal');
    var upd = function () {
      var r = st.getBoundingClientRect(), vh = window.innerHeight;
      var p = (vh * 0.92 - r.top) / (vh * 0.55 + r.height * 0.5);
      p = Math.max(0, Math.min(1, p));
      var lit = Math.round(p * words.length * 1.08);
      words.forEach(function (w, i) { w.classList.toggle('on', i < lit); });
    };
    window.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  }

  /* results carousel (home) */
  var track = document.getElementById('track');
  if (track) {
    var step = function (dir) {
      track.scrollBy({ left: dir * (track.querySelector('.rc').offsetWidth + 20), behavior: reduce ? 'auto' : 'smooth' });
    };
    document.getElementById('prev').addEventListener('click', function () { step(-1); });
    document.getElementById('next').addEventListener('click', function () { step(1); });
  }

  /* copy buttons (home contact) */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var label = btn.textContent;
    btn.addEventListener('click', function () {
      function reset(t) { btn.textContent = t; setTimeout(function () { btn.textContent = label; }, 1600); }
      function fallback() {
        var v = btn.closest('.crow').querySelector('.val');
        var r = document.createRange(); r.selectNodeContents(v);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); reset('Označeno');
      }
      try { navigator.clipboard.writeText(btn.getAttribute('data-copy')).then(function () { reset('Zkopírováno'); }, fallback); } catch (e) { fallback(); }
    });
  });

  /* order form: builds an e-mail to the address below */
  var form = document.getElementById('orderform');
  if (form) {
    var TO = 'mirek@saba.cz';
    var sent = document.getElementById('sent');
    var out = document.getElementById('sent-text');
    var copyBtn = document.getElementById('sent-copy');
    var pre = form.getAttribute('data-service');
    var sel = document.getElementById('f-service');
    if (pre && sel) sel.value = pre;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;
      var v = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
      var service = sel.options[sel.selectedIndex].text;
      var lines = [
        'Dobrý den,', '',
        'mám zájem o: ' + service + '.', '',
        'Jméno: ' + v('f-name'),
        'E-mail: ' + v('f-mail'),
        'Firma: ' + v('f-firm'),
        'Telefon: ' + v('f-tel'),
        'Web: ' + v('f-web'), '',
        'Zpráva:', v('f-msg'), '',
        'Souhlasím se zpracováním osobních údajů za účelem vyřízení poptávky.'
      ];
      var body = lines.join('\n');
      var subject = 'Poptávka: ' + service;
      out.value = 'Komu: ' + TO + '\nPředmět: ' + subject + '\n\n' + body;
      sent.classList.add('show');
      sent.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      window.location.href = 'mailto:' + TO + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var label = 'Zkopírovat text';
        function reset(t) { copyBtn.textContent = t; setTimeout(function () { copyBtn.textContent = label; }, 1600); }
        function fallback() { out.focus(); out.select(); reset('Označeno'); }
        try { navigator.clipboard.writeText(out.value).then(function () { reset('Zkopírováno'); }, fallback); } catch (e) { fallback(); }
      });
    }
  }
})();
