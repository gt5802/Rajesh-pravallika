/* ===== Edit these ===== */
const CONFIG = {
  eventTime: '2026-12-10T19:36:00+05:30',   // Sumuhurtham, IST
  address: 'Samskruthi Function Hall, 1st Floor, Urmila Nagar Road, Bhavanipuram, Vijayawada - 520012'
};

const $ = (s, r = document) => r.querySelector(s);
const page = document.body.dataset.page;

// Highlight current nav link
document.querySelectorAll('[data-nav]').forEach(a => {
  if (a.dataset.nav === page) a.setAttribute('aria-current', 'page');
});

// Personalised greeting: index.html?guest=Name
const guest = new URLSearchParams(location.search).get('guest');
if (guest && $('#guest')) $('#guest').textContent = guest.slice(0, 40);

// A little note for wedding guests
const guestNote = $('#guest-note-toggle');
if (guestNote) {
  const content = $('#guest-note-content');
  const steps = document.querySelectorAll('.guest-note-steps li');
  const status = $('#guest-note-status');
  const signoff = $('#guest-note-signoff');
  const action = $('#guest-note-action');
  let revealed = 0;
  let revealTimer;
  let settled = false;

  const revealNext = () => {
    if (revealed === steps.length) {
      settled = true;
      guestNote.closest('.guest-note').classList.remove('is-thinking');
      guestNote.closest('.guest-note').classList.add('is-settled');
      status.textContent = 'A little note, with lots of love.';
      signoff.hidden = false;
      return;
    }

    steps[revealed].classList.add('is-visible');
    status.textContent = steps[revealed].textContent;
    revealed += 1;
    revealTimer = setTimeout(revealNext, 650);
  };

  guestNote.addEventListener('click', () => {
    const expanded = guestNote.getAttribute('aria-expanded') === 'true';
    guestNote.setAttribute('aria-expanded', String(!expanded));
    content.hidden = expanded;
    action.innerHTML = expanded
      ? 'Open your note <span aria-hidden="true">＋</span>'
      : 'Close your note <span aria-hidden="true">−</span>';

    const card = guestNote.closest('.guest-note');
    if (expanded) {
      clearTimeout(revealTimer);
      card.classList.remove('is-thinking');
      return;
    }

    if (settled) return;
    card.classList.add('is-thinking');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      while (revealed < steps.length) {
        steps[revealed].classList.add('is-visible');
        revealed += 1;
      }
      revealNext();
    } else {
      revealNext();
    }
  });
}

// Envelope intro (shown once per session)
const intro = $('#intro');
if (intro) {
  if (sessionStorage.getItem('opened')) intro.remove();
  else {
    const env = $('#envelope');
    env.addEventListener('click', () => {
      env.classList.add('open');
      setTimeout(() => intro.classList.add('gone'), 900);
      setTimeout(() => intro.remove(), 2000);
      sessionStorage.setItem('opened', '1');
    });
  }
}

// Countdown
const cd = $('#countdown');
if (cd) {
  const target = new Date(CONFIG.eventTime).getTime();
  const units = { d: 'days', h: 'hours', m: 'minutes', s: 'seconds' };
  const renderCounter = (element, value) => {
    const digits = String(value).padStart(2, '0');
    const strips = element.querySelectorAll('.count-strip');

    if (strips.length !== digits.length) {
      const fragment = document.createDocumentFragment();
      for (const digit of digits) {
        const cell = document.createElement('span');
        cell.className = 'count-digit';
        cell.setAttribute('aria-hidden', 'true');
        const strip = document.createElement('span');
        strip.className = 'count-strip';
        strip.style.transform = `translateY(-${Number(digit) * 1.1}em)`;
        for (let n = 0; n < 10; n++) {
          const numeral = document.createElement('span');
          numeral.className = 'count-numeral';
          numeral.textContent = n;
          strip.append(numeral);
        }
        cell.append(strip);
        fragment.append(cell);
      }
      element.replaceChildren(fragment);
    } else {
      [...strips].forEach((strip, index) => {
        strip.style.transform = `translateY(-${Number(digits[index]) * 1.1}em)`;
      });
    }

    element.dataset.value = digits;
  };
  const tick = () => {
    const diff = target - Date.now();
    if (diff <= 0) {
      cd.innerHTML = '<p class="lead">The celebration has begun. Thank you for your blessings.</p>';
      return clearInterval(timer);
    }
    const v = { d: Math.floor(diff / 864e5), h: Math.floor(diff / 36e5) % 24, m: Math.floor(diff / 6e4) % 60, s: Math.floor(diff / 1e3) % 60 };
    for (const k in v) {
      renderCounter($(`[data-u="${k}"]`, cd), v[k]);
      $(`[data-readable-u="${k}"]`, cd).textContent = `${v[k]} ${units[k]}`;
    }
  };
  const timer = setInterval(tick, 1000); tick();
}

// Copy address
const copy = $('#copy');
if (copy) copy.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(copy.dataset.address || CONFIG.address); copy.textContent = 'Copied'; }
  catch { copy.textContent = 'Copy failed'; }
  setTimeout(() => (copy.textContent = 'Copy address'), 2000);
});
