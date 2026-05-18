(function () {
  var KEY = 'cookie_consent';
  var GA_ID = 'G-0TJ8ENE0WB';

  function loadGA() {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { dataLayer.push(arguments); };
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  var consent = localStorage.getItem(KEY);
  if (consent === 'accepted') { loadGA(); return; }
  if (consent === 'declined') { return; }

  var style = document.createElement('style');
  style.textContent = [
    '#cc-bar{position:fixed;bottom:0;left:0;right:0;z-index:9999;background:#0C0C0C;color:#F7F5F0;font-family:"Space Grotesk",sans-serif;font-size:0.8rem;padding:1rem 1.5rem;display:flex;align-items:center;gap:1.5rem;flex-wrap:wrap;transform:translateY(100%);transition:transform 0.4s cubic-bezier(0.16,1,0.3,1);}',
    '#cc-bar.cc-visible{transform:translateY(0);}',
    '#cc-bar p{margin:0;flex:1;min-width:200px;opacity:0.8;line-height:1.4;}',
    '#cc-bar a{color:#F7F5F0;text-underline-offset:3px;}',
    '#cc-bar .cc-actions{display:flex;gap:1rem;align-items:center;flex-shrink:0;}',
    '#cc-accept{background:#FF5500;color:#F7F5F0;border:none;padding:0.45rem 1rem;font-family:inherit;font-size:0.8rem;font-weight:500;cursor:pointer;letter-spacing:0.04em;}',
    '#cc-accept:hover{background:#e04a00;}',
    '#cc-decline{background:none;border:none;color:#F7F5F0;font-family:inherit;font-size:0.8rem;cursor:pointer;opacity:0.5;padding:0;text-decoration:underline;text-underline-offset:3px;}',
    '#cc-decline:hover{opacity:1;}'
  ].join('');
  document.head.appendChild(style);

  var bar = document.createElement('div');
  bar.id = 'cc-bar';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Cookie consent');
  bar.innerHTML = '<p>This site uses Google Analytics to understand visitor numbers — no personal data is stored. <a href="/privacy.html">Privacy policy</a>.</p><div class="cc-actions"><button id="cc-accept">Accept</button><button id="cc-decline">Decline</button></div>';
  document.body.appendChild(bar);

  requestAnimationFrame(function () {
    requestAnimationFrame(function () { bar.classList.add('cc-visible'); });
  });

  document.getElementById('cc-accept').addEventListener('click', function () {
    localStorage.setItem(KEY, 'accepted');
    bar.classList.remove('cc-visible');
    setTimeout(function () { bar.remove(); }, 400);
    loadGA();
  });

  document.getElementById('cc-decline').addEventListener('click', function () {
    localStorage.setItem(KEY, 'declined');
    bar.classList.remove('cc-visible');
    setTimeout(function () { bar.remove(); }, 400);
  });
})();
