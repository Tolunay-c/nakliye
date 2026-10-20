(function () {
  'use strict';

  var header = document.getElementById('header');
  var nav = document.getElementById('nav');
  var menuToggle = document.getElementById('menuToggle');
  var quoteForm = document.getElementById('quoteForm');
  var formSuccess = document.getElementById('formSuccess');
  var phoneInput = document.getElementById('phone');

  /* ---------- Header: shadow on scroll ---------- */
  function handleScroll() {
    header.classList.toggle('nk-is-scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ---------- Mobile menu ---------- */
  function setMenuOpen(isOpen) {
    nav.classList.toggle('nk-is-open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Menüyü kapat' : 'Menüyü aç');
  }
  menuToggle.addEventListener('click', function () {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (event) {
    if (event.target.closest('a')) setMenuOpen(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') setMenuOpen(false);
  });

  /* ---------- Phone mask: 0 (5XX) XXX XX XX ---------- */
  function formatPhone(rawValue) {
    var digits = rawValue.replace(/\D/g, '');
    if (digits.length && digits[0] !== '0') digits = '0' + digits;
    digits = digits.slice(0, 11);

    var out = '';
    if (digits.length > 0) out = digits.slice(0, 1);
    if (digits.length > 1) out += ' (' + digits.slice(1, 4);
    if (digits.length >= 4) out += ')';
    if (digits.length > 4) out += ' ' + digits.slice(4, 7);
    if (digits.length > 7) out += ' ' + digits.slice(7, 9);
    if (digits.length > 9) out += ' ' + digits.slice(9, 11);
    return out;
  }
  phoneInput.addEventListener('input', function () {
    phoneInput.value = formatPhone(phoneInput.value);
  });

  /* ---------- Validation ---------- */
  function setError(fieldId, message) {
    var errorEl = quoteForm.querySelector('[data-error-for="' + fieldId + '"]');
    var field = document.getElementById(fieldId);
    var group = field ? field.closest('.nk-form-group') : errorEl && errorEl.closest('.nk-form-group');
    if (errorEl) errorEl.textContent = message || '';
    if (group) group.classList.toggle('nk-has-error', Boolean(message));
  }

  function validateForm() {
    var isValid = true;
    var firstInvalid = null;

    function check(fieldId, condition, message) {
      var ok = condition();
      setError(fieldId, ok ? '' : message);
      if (!ok) {
        isValid = false;
        if (!firstInvalid) firstInvalid = document.getElementById(fieldId) || quoteForm.querySelector('[name="' + fieldId + '"]');
      }
    }

    check('fromLocation', function () { return quoteForm.from_location.value.trim().length >= 2; }, 'Lütfen çıkış adresini girin.');
    check('toLocation', function () { return quoteForm.to_location.value.trim().length >= 2; }, 'Lütfen varış adresini girin.');
    check('scope', function () { return Boolean(quoteForm.querySelector('input[name="scope"]:checked')); }, 'Lütfen taşıma kapsamını seçin.');
    check('phone', function () { return /^0 \(5\d{2}\) \d{3} \d{2} \d{2}$/.test(phoneInput.value); }, 'Geçerli bir telefon girin: 0 (5XX) XXX XX XX');

    if (firstInvalid) firstInvalid.focus();
    return isValid;
  }

  quoteForm.addEventListener('input', function (event) {
    var target = event.target;
    if (target.id) setError(target.id, '');
    if (target.name === 'scope') setError('scope', '');
  });

  /* ---------- Submit ---------- */
  quoteForm.addEventListener('submit', function (event) {
    event.preventDefault();
    if (!validateForm()) return;

    var submitBtn = quoteForm.querySelector('.nk-btn-submit');
    var payload = Object.fromEntries(new FormData(quoteForm).entries());
    submitBtn.disabled = true;

    // TODO: replace with the real endpoint (CRM, e-mail service, WordPress AJAX, etc.)
    console.info('Quote request payload:', payload);

    setTimeout(function () {
      submitBtn.disabled = false;
      quoteForm.reset();
      formSuccess.hidden = false;
      formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 600);
  });

  /* ---------- Reveal on scroll ---------- */
  var revealTargets = document.querySelectorAll('.nk-service-card, .nk-feature-card, .nk-quote-form');
  revealTargets.forEach(function (el) { el.classList.add('nk-reveal'); });

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('nk-is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { observer.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add('nk-is-visible'); });
  }

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('currentYear');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
