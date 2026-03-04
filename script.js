async function fetchJSON(path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${path}`);
    return await res.json();
  } catch (err) {
    console.warn(`[portfolio] Failed to load ${path}:`, err.message);
    return null;
  }
}

/** Creates an element, optionally setting a class and innerHTML. */
function el(tag, className, html) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (html !== undefined) node.innerHTML = html;
  return node;
}

// --- Desktop renderers ---

function renderAbout(data) {
  if (!data) return;
  const heading = document.getElementById('about-heading');
  const bio     = document.getElementById('about-bio');
  if (heading) heading.textContent = data.heading;
  if (bio) {
    bio.innerHTML = '';
    data.paragraphs.forEach(p => bio.appendChild(el('p', null, p)));
  }
}

function renderSkills(data) {
  if (!data) return;
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = '';
  data.groups.forEach(group => {
    const item = el('div', 'skill-item');
    item.appendChild(el('span', 'skill-label', group.label));
    item.appendChild(el('span', 'skill-value', group.value));
    grid.appendChild(item);
  });
}

function renderExperience(data) {
  if (!data) return;
  const list = document.getElementById('experience-list');
  if (!list) return;
  list.innerHTML = '';
  data.entries.forEach(entry => {
    const item = el('div', 'experience-item');
    item.appendChild(el('h4', null, entry.title));
    item.appendChild(el('span', 'date', entry.date));
    const ul = el('ul');
    entry.bullets.forEach(b => ul.appendChild(el('li', null, b)));
    item.appendChild(ul);
    list.appendChild(item);
  });
}

function renderEducation(data) {
  if (!data) return;
  const grid = document.getElementById('education-grid');
  if (!grid) return;
  grid.innerHTML = '';
  data.entries.forEach(entry => {
    const item = el('div', 'edu-item');
    item.appendChild(el('strong', null, entry.degree));
    item.appendChild(el('span', null, `${entry.institution} (${entry.duration})`));
    grid.appendChild(item);
  });
}

function renderProjects(data) {
  if (!data) return;
  const list = document.getElementById('projects-list');
  if (!list) return;
  list.innerHTML = '';
  data.projects.forEach(project => {
    const a   = el('a', 'project-item');
    a.href    = project.url;
    a.target  = '_blank';
    a.rel     = 'noopener noreferrer';

    const inner = el('div', 'project-item-inner');
    const bar   = el('div', 'project-item-accent-bar');
    const body  = el('div', 'project-item-body');

    body.appendChild(el('h3', null, project.title));
    body.appendChild(el('p', 'stack', `<strong>Stack:</strong> ${project.stack}`));
    body.appendChild(el('p', null, project.description));
    body.appendChild(el('span', 'project-link-label', project.linkLabel));

    inner.appendChild(bar);
    inner.appendChild(body);
    a.appendChild(inner);
    list.appendChild(a);
  });
}

function renderContact(data) {
  if (!data) return;
  const list = document.getElementById('contact-list');
  if (!list) return;
  list.innerHTML = '';
  data.channels.forEach(ch => {
    const a  = el('a', 'contact-link', ch.label);
    a.href   = ch.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    list.appendChild(a);
  });
}

// --- Mobile renderers ---

function renderMobileAbout(data) {
  if (!data) return;
  const block = document.getElementById('m-about-block');
  if (!block) return;
  block.innerHTML = '';
  // Strip HTML tags to produce a plain uppercase summary line
  const text = data.paragraphs[0].replace(/<[^>]+>/g, '');
  block.appendChild(el('p', null, text.toUpperCase()));
}

function renderMobileProjects(data) {
  if (!data) return;
  const list = document.getElementById('m-projects-list');
  if (!list) return;
  list.innerHTML = '';
  data.projects.forEach(project => {
    const m       = project.mobile;
    const article = el('article', 'm-project-card');

    const imgContainer = el('div', 'm-project-image-container');
    imgContainer.appendChild(el('div', 'm-noise-overlay'));
    const img     = document.createElement('img');
    img.src       = m.image;
    img.alt       = m.alt;
    img.className = 'm-project-image';
    imgContainer.appendChild(img);
    article.appendChild(imgContainer);

    const titleRow = el('div', 'm-project-title-row');
    titleRow.appendChild(el('h3', 'm-header-text m-project-title', m.titleDisplay));
    article.appendChild(titleRow);

    const metaRow = el('div', 'm-project-meta');
    m.meta.forEach(metaItem => {
      const metaEl = el('div', 'm-meta-item');
      metaEl.appendChild(el('span', 'm-meta-label', metaItem.label));
      metaEl.appendChild(el('span', null, metaItem.value));
      metaRow.appendChild(metaEl);
    });
    article.appendChild(metaRow);

    const btnBlock = el('div', 'm-text-block');
    const btn      = el('a', 'm-btn', m.btnLabel);
    btn.href       = project.url;
    btn.target     = '_blank';
    btn.rel        = 'noopener noreferrer';
    btnBlock.appendChild(btn);
    article.appendChild(btnBlock);

    list.appendChild(article);
  });
}

function renderMobileSkills(data) {
  if (!data) return;
  const block = document.getElementById('m-skills-block');
  if (!block) return;
  block.innerHTML = '';

  const heading = el('h3', 'm-mono', '// SKILLS_MODULE');
  heading.style.cssText = 'margin-bottom:8px; opacity:0.7;';
  block.appendChild(heading);

  const grid = el('div');
  grid.style.cssText = 'display:grid; grid-template-columns: 1fr 1fr; gap: 8px;';

  // Groups with no mobileLabel are desktop-only
  data.groups.filter(g => g.mobileLabel).forEach(group => {
    const box = el('div', 'm-skill-box');
    box.appendChild(el('span', 'm-meta-label', group.mobileLabel));
    box.appendChild(el('span', null, group.mobileValue));
    grid.appendChild(box);
  });
  block.appendChild(grid);
}

function renderMobileExperience(data) {
  if (!data) return;
  const block = document.getElementById('m-experience-block');
  if (!block) return;
  block.innerHTML = '';

  const heading = el('h3', 'm-mono', '// EXPERIENCE_LOG');
  heading.style.cssText = 'margin-bottom:8px; opacity:0.7;';
  block.appendChild(heading);

  data.entries.forEach((entry, idx) => {
    const wrapper = el('div');
    if (idx < data.entries.length - 1) wrapper.style.marginBottom = '12px';

    const title = el('h4', 'm-header-text', entry.mobileTitle);
    title.style.fontSize = '14px';
    wrapper.appendChild(title);

    const meta = el('div', 'm-mono', entry.mobileMeta);
    meta.style.cssText = 'font-size:10px; opacity:0.6;';
    wrapper.appendChild(meta);

    block.appendChild(wrapper);
  });
}

function renderMobileEducation(data) {
  if (!data) return;
  const block = document.getElementById('m-education-block');
  if (!block) return;
  block.innerHTML = '';

  const heading = el('h3', 'm-mono', '// EDUCATION_DATA');
  heading.style.cssText = 'margin-bottom:8px; opacity:0.7;';
  block.appendChild(heading);

  data.entries.forEach(entry => {
    const wrapper = el('div');

    const degree = el('h4', 'm-header-text', entry.mobileDegree);
    degree.style.fontSize = '14px';
    wrapper.appendChild(degree);

    const meta = el('div', 'm-mono', `${entry.mobileInstitution} (${entry.duration})`);
    meta.style.cssText = 'font-size:10px; opacity:0.6;';
    wrapper.appendChild(meta);

    block.appendChild(wrapper);
  });
}

function renderMobileContact(data) {
  if (!data) return;
  const block = document.getElementById('m-contact-block');
  if (!block) return;
  block.innerHTML = '';
  data.channels.forEach(ch => {
    const a  = el('a', 'm-btn', ch.mobileBtnLabel);
    a.href   = ch.url;
    a.target = '_blank';
    a.rel    = 'noopener noreferrer';
    block.appendChild(a);
  });
}

// --- Bootstrap ---

async function initContent() {
  const [about, skills, experience, education, projects, contact] = await Promise.all([
    fetchJSON('./data/about.json'),
    fetchJSON('./data/skills.json'),
    fetchJSON('./data/experience.json'),
    fetchJSON('./data/education.json'),
    fetchJSON('./data/projects.json'),
    fetchJSON('./data/contact.json'),
  ]);

  renderAbout(about);
  renderSkills(skills);
  renderExperience(experience);
  renderEducation(education);
  renderProjects(projects);
  renderContact(contact);

  renderMobileAbout(about);
  renderMobileProjects(projects);
  renderMobileSkills(skills);
  renderMobileExperience(experience);
  renderMobileEducation(education);
  renderMobileContact(contact);

  // Initialise interactions after content is in the DOM
  initPageBehaviour();
}

// --- Page behaviour (scroll observers, nav active state) ---

function initPageBehaviour() {
  const menu      = document.querySelector('.menu');
  const links     = document.querySelectorAll('.menu a');
  const sections  = document.querySelectorAll('.content-section');
  const container = document.querySelector('.content-container');
  let activeIndex    = 0;
  let isManualScroll = false;
  let scrollTimeout;

  function activateParallax() {
    links.forEach((link, i) => {
      link.addEventListener('mouseover', () => {
        if (!isManualScroll) menu.dataset.index = i;
      }, false);

      link.addEventListener('mouseout', () => {
        if (!isManualScroll) menu.dataset.index = activeIndex;
      }, false);

      link.addEventListener('click', (e) => {
        e.preventDefault();
        isManualScroll = true;
        activeIndex = i;
        updateActiveState();
        if (sections[i]) sections[i].scrollIntoView({ behavior: 'smooth' });
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => { isManualScroll = false; }, 1000);
      });
    });
  }

  function updateActiveState() {
    links.forEach(link => link.classList.remove('active'));
    if (links[activeIndex]) {
      links[activeIndex].classList.add('active');
      menu.dataset.index = activeIndex;
    }
  }

  function initScrollObserver() {
    // root: null = actual viewport; container has overflow:visible so it can't be a scroll root
    const activeObserver = new IntersectionObserver((entries) => {
      if (isManualScroll) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          if      (id === 'about')    activeIndex = 0;
          else if (id === 'projects') activeIndex = 1;
          else if (id === 'contact')  activeIndex = 2;
          updateActiveState();
        }
      });
    }, { root: null, rootMargin: '-45% 0px -45% 0px', threshold: 0 });

    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { root: null, rootMargin: '0px', threshold: 0.1 });

    sections.forEach(section => {
      activeObserver.observe(section);
      visibilityObserver.observe(section);
    });
  }

  activateParallax();
  initScrollObserver();
  updateActiveState();
  if (sections[0]) sections[0].classList.add('visible');

  initMobileInterface();
  initDarkMode();
}

function initDarkMode() {
  const html    = document.documentElement;
  const buttons = [
    document.getElementById('darkmode-toggle'),
    document.getElementById('m-darkmode-toggle'),
  ].filter(Boolean);

  const DARK_LABEL  = '// BLACKOUT_MODE';
  const LIGHT_LABEL = '// RESTORE_SIGNAL';

  function applyTheme(dark, persist) {
    html.dataset.theme = dark ? 'dark' : '';
    buttons.forEach(btn => { btn.textContent = dark ? LIGHT_LABEL : DARK_LABEL; });
    if (persist) localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  const stored      = localStorage.getItem('theme');
  const sysDark     = window.matchMedia('(prefers-color-scheme: dark)');
  if (stored)           applyTheme(stored === 'dark', false);
  else                  applyTheme(sysDark.matches, false);

  sysDark.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) applyTheme(e.matches, false);
  });

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      applyTheme(html.dataset.theme !== 'dark', true);
    });
  });
}

function initMobileInterface() {
  const timeDisplay       = document.getElementById('m-system-time');
  const mobileNavItems    = document.querySelectorAll('.m-nav-item');
  const mobileWrapper     = document.querySelector('.mobile-wrapper');
  const mobileGridContainer = document.querySelector('.mobile-grid-container');
  const mobileSections    = document.querySelectorAll('.m-section');

  if (!mobileWrapper) return;

  if (timeDisplay) {
    const desktopTime = document.getElementById('d-system-time');
    const updateTime = () => {
      const now     = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toLocaleTimeString('en-US', {
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
      });
      const stamp = `${dateStr} ${timeStr}`;
      timeDisplay.textContent = stamp;
      if (desktopTime) desktopTime.textContent = stamp;
    };
    setInterval(updateTime, 1000);
    updateTime();
  }

  // Activate the first section on load
  if (mobileSections[0]) mobileSections[0].classList.add('m-section--active');

  let isMobileManualScroll = false;

  // Helper: resolve the .m-section that contains a given section header keyword
  function findSection(keyword) {
    return Array.from(mobileSections).find(
      s => s.querySelector('.m-section-header')?.innerText.includes(keyword)
    );
  }

  mobileNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (href === '#' || href === '') e.preventDefault();

      mobileNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      isMobileManualScroll = true;
      setTimeout(() => { isMobileManualScroll = false; }, 1200);

      const text = item.textContent.trim();
      let target = null;
      if      (text.includes('HOME')) target = findSection('OPERATOR_PROFILE');
      else if (text.includes('PROJ')) target = findSection('PROJECT_LOG');
      else if (text.includes('INFO')) target = findSection('SYSTEM_SPECS');
      else if (text.includes('COMM')) target = findSection('COMM_CHANNELS');

      if (target) {
        // Apply focus state immediately — don't wait for the observer,
        // which is suppressed during the scroll animation.
        mobileSections.forEach(s => s.classList.remove('m-section--active'));
        target.classList.add('m-section--active');
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  let currentActiveSection = null;

  function updateActiveSectionFromScroll() {
    if (isMobileManualScroll) return;

    const center = mobileGridContainer.scrollTop + mobileGridContainer.clientHeight * 0.5;

    let best = null;
    let bestDist = Infinity;
    mobileSections.forEach(s => {
      const mid  = s.offsetTop + s.clientHeight * 0.5;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) { bestDist = dist; best = s; }
    });

    if (!best || best === currentActiveSection) return;
    currentActiveSection = best;

    mobileSections.forEach(s => s.classList.remove('m-section--active'));
    best.classList.add('m-section--active');

    const hdr = best.querySelector('.m-section-header');
    if (!hdr) return;
    const txt = hdr.innerText;

    let key = '';
    if      (txt.includes('OPERATOR_PROFILE')) key = 'HOME';
    else if (txt.includes('PROJECT_LOG'))      key = 'PROJ';
    else if (txt.includes('SYSTEM_SPECS'))     key = 'INFO';
    else if (txt.includes('COMM_CHANNELS'))    key = 'COMM';

    if (key) {
      mobileNavItems.forEach(nav => {
        nav.classList.toggle('active', nav.textContent.trim().includes(key));
      });
    }
  }

  mobileGridContainer.addEventListener('scroll', updateActiveSectionFromScroll, { passive: true });
  requestAnimationFrame(updateActiveSectionFromScroll);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initContent);
} else {
  initContent();
}