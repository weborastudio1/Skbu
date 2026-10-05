document.addEventListener('DOMContentLoaded', () => {
  // Preview deployments should not compete with the production domain in search.
  const productionHosts = ['www.weborastudio.xyz', 'weborastudio.xyz'];
  if (location.hostname && !productionHosts.includes(location.hostname) &&
      !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) {
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = 'noindex,nofollow,noarchive';
  }

  const body = document.body;
  const toggle = document.getElementById('mobileToggle');
  const menu = document.getElementById('mobileMenu');
  const header = document.getElementById('siteHeader');

  const setMenu = (open) => {
    if (!toggle || !menu) return;
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.classList.toggle('active', open);
    menu.setAttribute('aria-hidden', String(!open));
    body.classList.toggle('menu-open', open);
  };
  if (toggle && menu) {
    toggle.addEventListener('click', () => setMenu(!menu.classList.contains('active')));
    menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });
  }

  const updateHeader = () => { if (header) header.classList.toggle('scrolled', window.scrollY > 8); };
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealItems = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => observer.observe(item));
  } else {
    revealItems.forEach(item => item.classList.add('is-visible'));
  }

  // Home-only hero slider. Never assume these elements exist on other pages.
  const heroImage = document.getElementById('heroImage');
  const slideLabel = document.getElementById('heroSlideLabel');
  const slideCount = document.getElementById('heroSlideCount');
  const slides = [
    ['images/hero-home0.webp', 'Web experiences'],
    ['images/hero-home1.webp', 'Creative websites'],
    ['images/hero-home2.webp', 'Digital presence'],
    ['images/hero-home3.webp', 'Responsive systems'],
    ['images/hero-home4.webp', 'Growth-ready design']
  ];
  if (heroImage && slides.length > 1) {
    let current = 0, timer = null;
    const swap = () => {
      if (reduceMotion || document.hidden) return;
      heroImage.classList.add('changing');
      window.setTimeout(() => {
        current = (current + 1) % slides.length;
        heroImage.src = slides[current][0];
        if (slideLabel) slideLabel.textContent = slides[current][1];
        if (slideCount) slideCount.textContent = `${String(current + 1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
        heroImage.classList.remove('changing');
      }, 220);
    };
    timer = window.setInterval(swap, 4500);
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { if (timer) window.clearInterval(timer); }
      else if (!reduceMotion) { timer = window.setInterval(swap, 4500); }
    });
  }

  // Current static build uses an email fallback. The status is honest: the message is not
  // considered submitted until the visitor sends it from their email client.
  const emailEncode = value => encodeURIComponent(String(value ?? '').trim());
  const composeMail = (form, subjectPrefix) => {
    const status = form.querySelector('.form-status');
    const destination = form.dataset.mailto;
    if (!destination) {
      if (status) status.textContent = 'This form is not configured yet. Please use WhatsApp or the support email.';
      return;
    }
    const data = new FormData(form), lines = [];
    data.forEach((value, key) => {
      if (key === 'resume') {
        if (value instanceof File && value.name) lines.push(`Resume selected: ${value.name} (attach it manually before sending)`);
        return;
      }
      if (String(value).trim()) lines.push(`${key}: ${String(value).trim()}`);
    });
    const subject = `${subjectPrefix} — WEBORA Studio`;
    if (status) status.textContent = 'Opening your email app… the enquiry is sent only after you press Send.';
    window.location.href = `mailto:${destination}?subject=${emailEncode(subject)}&body=${emailEncode(lines.join('\n'))}`;
  };

  const contactForm = document.getElementById('contactForm');
  if (contactForm) contactForm.addEventListener('submit', event => {
    event.preventDefault();
    if (contactForm.reportValidity()) composeMail(contactForm, 'Project enquiry');
  });

  const careerForm = document.getElementById('careerForm');
  if (careerForm) careerForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!careerForm.reportValidity()) return;
    const file = careerForm.querySelector('input[type="file"]')?.files?.[0];
    if (file && file.size > 5 * 1024 * 1024) {
      const status = careerForm.querySelector('.form-status');
      if (status) status.textContent = 'Please keep the resume file at 5 MB or less.';
      return;
    }
    composeMail(careerForm, 'Career application');
  });

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', event => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  const chatBubble = document.getElementById('chatBubble');
  if (chatBubble && !reduceMotion) {
    window.setTimeout(() => chatBubble.classList.add('show'), 1800);
    window.setTimeout(() => chatBubble.classList.remove('show'), 8500);
  }

  // Portfolio: simple class-based filter + 12-at-a-time pagination.
  const portfolioGrid = document.querySelector('.portfolio-project-grid');
  if (portfolioGrid) {
    const cards = [...portfolioGrid.querySelectorAll('.project-card')];
    const buttons = [...document.querySelectorAll('.filter-btn')];
    const count = document.getElementById('workCount');
    const empty = document.getElementById('emptyWork');
    const loadMore = document.getElementById('portfolioLoadMore');
    let activeFilter = 'all', pageSize = 12, shown = pageSize;

    const matches = card => {
      const categories = (card.dataset.categories || '').split('|');
      if (activeFilter === 'all') return true;
      if (activeFilter === 'cafe') return categories.some(x => ['cafe','restaurant','hotel'].includes(x));
      return categories.includes(activeFilter);
    };
    const render = () => {
      const matched = cards.filter(matches);
      const visible = matched.slice(0, shown);
      cards.forEach(card => {
        card.classList.add('is-hidden');
        if (visible.includes(card)) card.classList.remove('is-hidden');
      });
      if (count) count.textContent = `Showing ${visible.length} of ${matched.length} project${matched.length === 1 ? '' : 's'}`;
      if (empty) empty.hidden = matched.length !== 0;
      if (loadMore) loadMore.hidden = visible.length >= matched.length;
    };
    buttons.forEach(button => button.addEventListener('click', () => {
      buttons.forEach(b => { b.classList.remove('active'); b.setAttribute('aria-selected','false'); });
      button.classList.add('active'); button.setAttribute('aria-selected','true');
      activeFilter = button.dataset.filter || 'all';
      shown = pageSize;
      render();
    }));
    if (loadMore) loadMore.addEventListener('click', () => { shown += pageSize; render(); });
    render();
  }
});
