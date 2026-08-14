/**
 * Google Consent Mode v2.
 *
 * gtag loads on every page view for every visitor, with all storage denied by
 * default. Denied visitors still send cookieless pings, so pageviews and events
 * are counted without a cookie ever being set. Accepting upgrades to full
 * measurement; declining leaves the denied default standing.
 */
(function () {
  var KEY = 'cookie_consent';
  var GA_ID = 'G-0TJ8ENE0WB';

  /* ── Consent defaults ─────────────────────────────────────────
     Must reach the dataLayer before gtag.js executes, which is why this
     script sits in the head. */
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { dataLayer.push(arguments); };

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  gtag('set', 'url_passthrough', true);
  gtag('set', 'ads_data_redaction', true);

  /* Returning visitors who already accepted are upgraded before config, so
     their first hit of the page is measured as granted rather than denied. */
  var consent = localStorage.getItem(KEY);
  if (consent === 'accepted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
  }

  gtag('js', new Date());
  gtag('config', GA_ID);

  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
  document.head.appendChild(s);

  /* ── Custom events ────────────────────────────────────────────
     Delegated from the document so they work on every page and never throw
     when an element is absent. Scroll depth, outbound clicks and downloads
     are already covered by GA4 enhanced measurement, so are not repeated.
     contact_submit fires from the inline script on the contact page, which
     is the only place the fetch result is known. */
  document.addEventListener('click', function (e) {
    var link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!link) return;

    var href = link.getAttribute('href') || '';

    if (href.indexOf('mailto:') === 0) {
      gtag('event', 'email_click', { link_url: href });
    } else if (href.indexOf('tel:') === 0) {
      gtag('event', 'phone_click', { link_url: href });
    } else if (href.indexOf('adambarnesphotos.co.uk') !== -1) {
      gtag('event', 'outbound_photos', { link_url: href });
    } else if (href.indexOf('subject=SEO') !== -1) {
      gtag('event', 'audit_cta', { link_url: href });
    }
  }, true);

  /* ── Consent banner ───────────────────────────────────────────
     Shown only when no choice has been stored yet. */
  if (consent === 'accepted' || consent === 'declined') return;

  function showBanner() {
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
    bar.innerHTML = '<p>This site counts visits anonymously either way, with no cookie and no personal data. Accepting cookies gives more accurate figures. <a href="/privacy.html">Privacy policy</a>.</p><div class="cc-actions"><button id="cc-accept">Accept</button><button id="cc-decline">Decline</button></div>';
    document.body.appendChild(bar);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () { bar.classList.add('cc-visible'); });
    });

    function dismiss(choice) {
      localStorage.setItem(KEY, choice);
      bar.classList.remove('cc-visible');
      setTimeout(function () { bar.remove(); }, 400);
    }

    document.getElementById('cc-accept').addEventListener('click', function () {
      dismiss('accepted');
      gtag('consent', 'update', { analytics_storage: 'granted' });
    });

    /* Declining sends no update, so the denied default stands. */
    document.getElementById('cc-decline').addEventListener('click', function () {
      dismiss('declined');
    });
  }

  /* The script now runs in the head, so body may not exist yet. */
  if (document.body) {
    showBanner();
  } else {
    document.addEventListener('DOMContentLoaded', showBanner);
  }
})();
