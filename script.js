(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const header = $('#site-header');
  const progress = $('.progress-bar');
  const menuButton = $('.menu-toggle');
  const nav = $('#main-nav');

  // A short branded entrance; the site is still usable without JavaScript.
  const loader = $('.page-loader');
  const dismissLoader = () => loader && loader.classList.add('loaded');
  if (reducedMotion) dismissLoader();
  else window.setTimeout(dismissLoader, 850);
  window.addEventListener('pageshow', () => window.setTimeout(dismissLoader, 100));

  $('#copyright-year').textContent = new Date().getFullYear();

  function closeMenu() {
    header.classList.remove('menu-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    document.body.classList.remove('nav-is-open');
  }
  menuButton.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    header.classList.toggle('menu-open', opening);
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  });
  $$('a[href^="#"]', header).forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  document.addEventListener('click', e => { if (!header.contains(e.target)) closeMenu(); });

  // Scroll depth, fixed navigation and carefully limited image parallax.
  let scrollScheduled = false;
  const parallaxes = $$('[data-parallax]');
  function updateScroll() {
    const y = window.scrollY || window.pageYOffset;
    const maxY = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    progress.style.width = `${Math.max(0, Math.min(100, y / maxY * 100))}%`;
    header.classList.toggle('scrolled', y > 32);
    if (!reducedMotion && innerWidth > 700) {
      parallaxes.forEach(el => {
        const bounds = el.parentElement.getBoundingClientRect();
        if (bounds.bottom < -180 || bounds.top > innerHeight + 180) return;
        const factor = Number(el.dataset.parallax || 0.1);
        const dist = (bounds.top + bounds.height * .5 - innerHeight * .5);
        const pixels = Math.max(-37, Math.min(37, -dist * factor));
        el.style.transform = el.closest('.about-image-main') ? `translate3d(0,calc(-6% + ${pixels}px),0)` : `translate3d(0,${pixels}px,0)`;
      });
    }
    scrollScheduled = false;
  }
  window.addEventListener('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(updateScroll);
  }, {passive: true});
  window.addEventListener('resize', updateScroll, {passive: true});
  updateScroll();

  // Reveal in view, with no-JS and reduced-motion fallbacks.
  const revealNodes = $$('[data-reveal]');
  if (!('IntersectionObserver' in window) || reducedMotion) {
    revealNodes.forEach(n => n.classList.add('visible'));
  } else {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {threshold: .09, rootMargin: '0px 0px -35px 0px'});
    revealNodes.forEach(n => observer.observe(n));
  }

  // Mouse-following halo and magnetic links add subtle, hardware-friendly interaction.
  if (!reducedMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const halo = $('.cursor-halo');
    let mx = -100, my = -100, hx = -100, hy = -100;
    window.addEventListener('mousemove', ev => { mx = ev.clientX; my = ev.clientY; halo.style.opacity = '1'; }, {passive:true});
    window.addEventListener('mouseleave', () => halo.style.opacity = '0');
    const tickHalo = () => {
      hx += (mx - hx) * .19; hy += (my - hy) * .19;
      halo.style.left = hx + 'px'; halo.style.top = hy + 'px';
      requestAnimationFrame(tickHalo);
    };
    requestAnimationFrame(tickHalo);
    $$('a, button, summary').forEach(el => {
      el.addEventListener('mouseenter', () => halo.classList.add('active'));
      el.addEventListener('mouseleave', () => halo.classList.remove('active'));
    });
    $$('.magnetic').forEach(button => {
      button.addEventListener('mousemove', e => {
        const rect = button.getBoundingClientRect();
        const dx = (e.clientX - (rect.left + rect.width / 2)) * .10;
        const dy = (e.clientY - (rect.top + rect.height / 2)) * .14;
        button.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      });
      button.addEventListener('mouseleave', () => button.style.transform = '');
    });
  }

  // Focused modal content: descriptions of proposed community focus areas,
  // rather than unverified claims about donations or impact statistics.
  const programs = {
    cleanups: {
      tag:'01 / COMMUNITY ACTION', title:'Community Clean-ups', image:'assets/images/savannah-cleanup.webp',
      description:'A cleaner environment starts with people who care. Collective clean-ups offer a visible way to look after shared spaces and inspire everyday responsibility.',
      points:['Community litter collection and safe waste handling','Youth and neighbour participation','Awareness about cleaner shared spaces']
    },
    environment: {
      tag:'02 / ENVIRONMENT', title:'Environment & Trees', image:'assets/images/tree-planting.webp',
      description:'Caring for the land around us is an investment in future generations. Our environmental focus links local action with a long view of stewardship.',
      points:['Tree-planting and seedling-care opportunities','Environmental awareness and learning','Practical community conservation activities']
    },
    culture: {
      tag:'03 / CULTURAL HERITAGE', title:'Culture & Identity', image:'assets/images/maasai-jump.webp',
      description:'Our Maasai heritage is a source of pride, belonging and knowledge. We value opportunities for young people to learn from the past while shaping their own future.',
      points:['Intergenerational conversations and knowledge-sharing','Celebrating traditional art, music and customs','Respectful, community-led cultural storytelling']
    },
    youth: {
      tag:'04 / YOUTH LEADERSHIP', title:'Leadership & Skills', image:'assets/images/cleanup-village.webp',
      description:'We believe young people should have room to participate in decisions, build confidence and turn ideas into action.',
      points:['Youth-led community activities','Skills exchange and peer learning','Spaces for new ideas, responsibility and collaboration']
    },
    education: {
      tag:'05 / EDUCATION', title:'Education & Mentorship', image:'assets/images/children-cleanup.webp',
      description:'Learning extends beyond the classroom. Encouragement, mentorship and access to practical skills can help more young people see possibilities for themselves.',
      points:['Mentorship and inspirational conversations','Life skills and learning opportunities','Encouraging young people to explore their potential']
    },
    wildlife: {
      tag:'06 / NATURE & COMMUNITY', title:'Wildlife & Coexistence', image:'assets/images/mara-lions.webp',
      description:'Sekenani lies beside an extraordinary natural landscape. Communities, livelihoods and wildlife share this place, making respect and stewardship essential.',
      points:['Awareness about wildlife and shared landscapes','Community conversations about coexistence','Support for locally relevant conservation education']
    }
  };
  const programDialog = $('#program-modal');
  let currentInterest = 'General inquiry';
  $$('[data-program]').forEach(button => button.addEventListener('click', () => {
    const item = programs[button.dataset.program];
    if (!item) return;
    currentInterest = `Learn more about ${item.title}`;
    $('#program-modal-tag').textContent = item.tag;
    $('#program-modal-title').textContent = item.title;
    $('#program-modal-description').textContent = item.description;
    $('#program-modal-image').src = item.image;
    $('#program-modal-image').alt = item.title;
    $('#program-modal-points').replaceChildren(...item.points.map(value => {
      const li = document.createElement('li'); li.textContent = value; return li;
    }));
    programDialog.showModal();
  }));
  $('[data-close-program]').addEventListener('click', () => programDialog.close());
  programDialog.addEventListener('click', e => { if (e.target === programDialog) programDialog.close(); });
  $('#program-modal-join').addEventListener('click', () => {
    programDialog.close();
    $('#contact-topic').value = 'General inquiry';
    $('textarea[name="message"]', $('#contact-form')).value = `Hello Sekenani Youth SHG, I would like to learn more about ${currentInterest.replace('Learn more about ', '')}. `;
    $('#contact').scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth'});
  });

  // Filterable gallery and fullscreen keyboard-accessible lightbox.
  const galleryTiles = $$('.gallery-tile');
  const galleryDialog = $('#gallery-modal');
  let visibleTiles = galleryTiles.slice();
  let activeIndex = 0;
  const filters = $$('.filter-btn');
  filters.forEach(button => button.addEventListener('click', () => {
    const category = button.dataset.filter;
    filters.forEach(b => {
      const active = b === button;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    visibleTiles = galleryTiles.filter(tile => {
      const isShown = category === 'all' || tile.dataset.category === category;
      tile.hidden = !isShown;
      return isShown;
    });
    $('#gallery-count').textContent = `Showing ${visibleTiles.length} ${visibleTiles.length === 1 ? 'moment' : 'moments'}`;
  }));
  function showLightbox(index) {
    if (!visibleTiles.length) return;
    activeIndex = (index + visibleTiles.length) % visibleTiles.length;
    const tile = visibleTiles[activeIndex];
    $('#lightbox-image').src = tile.dataset.image;
    $('#lightbox-image').alt = tile.dataset.alt || $('img', tile).alt;
    $('#lightbox-title').textContent = tile.dataset.title || '';
    $('#lightbox-counter').textContent = `${activeIndex + 1} / ${visibleTiles.length}`;
  }
  galleryTiles.forEach(tile => tile.addEventListener('click', () => {
    const index = visibleTiles.indexOf(tile);
    if (index < 0) return;
    showLightbox(index);
    galleryDialog.showModal();
  }));
  $('#lightbox-prev').addEventListener('click', () => showLightbox(activeIndex - 1));
  $('#lightbox-next').addEventListener('click', () => showLightbox(activeIndex + 1));
  $('[data-close-gallery]').addEventListener('click', () => galleryDialog.close());
  galleryDialog.addEventListener('click', e => { if (e.target === galleryDialog) galleryDialog.close(); });
  galleryDialog.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') { e.preventDefault(); showLightbox(activeIndex + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); showLightbox(activeIndex - 1); }
  });

  // Engagement shortcuts pre-fill a genuine email inquiry, with no backend needed.
  $$('.join-option').forEach(button => button.addEventListener('click', () => {
    $('#contact-topic').value = button.dataset.interest;
    $('#contact').scrollIntoView({behavior: reducedMotion ? 'instant' : 'smooth'});
    window.setTimeout(() => $('input[name="name"]', $('#contact-form')).focus({preventScroll:true}), reducedMotion ? 0 : 750);
  }));
  $('#contact-form').addEventListener('submit', e => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const name = String(data.get('name')).trim();
    const email = String(data.get('email')).trim();
    const topic = String(data.get('topic')).trim();
    const message = String(data.get('message')).trim();
    const subject = `Sekenani Youth SHG — ${topic}`;
    const body = `Hello Sekenani Youth SHG,\n\n${message}\n\nFrom: ${name}\nEmail: ${email}\nInterest: ${topic}`;
    const href = `mailto:sekenaniyouth@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const feedback = $('#form-feedback');
    feedback.classList.add('success');
    feedback.textContent = 'Your email app should open with the message ready to review and send. If it does not, email sekenaniyouth@gmail.com directly.';
    window.location.href = href;
  });

  // Animated number, triggered once as the purpose section enters view.
  const counter = $('[data-counter]');
  if (counter && 'IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const target = Number(counter.dataset.counter);
        const start = performance.now();
        function frame(now) {
          const t = Math.min(1, (now - start) / 1300);
          counter.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3)))).padStart(2, '0');
          if (t < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
        observer.disconnect();
      }
    }, {threshold:.35});
    observer.observe(counter);
  }

  // Non-interactive drifting light particles in the cinematic hero.
  if (!reducedMotion && innerWidth > 780) {
    const hero = $('.hero');
    for (let i = 0; i < 15; i++) {
      const p = document.createElement('span');
      p.className = 'hero-particle';
      p.style.left = (12 + (i * 41.7) % 87) + '%';
      p.style.top = (12 + (i * 19.1) % 74) + '%';
      p.style.animationDelay = (-i * .53) + 's';
      p.style.animationDuration = (5 + (i % 7)) + 's';
      hero.appendChild(p);
    }
  }
})();
