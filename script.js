const menu = document.querySelector('.menu');
const links = document.querySelectorAll('.menu a');
const sections = document.querySelectorAll('.content-section');
const container = document.querySelector('.content-container');
let activeIndex = 0;
let isManualScroll = false;
let scrollTimeout;

function activateParallax() {
  links.forEach((link, i) => {
    link.addEventListener('mouseover', () => {
      // Only show preview if we aren't currently scrolling to a target
      if (!isManualScroll) {
        menu.dataset.index = i;
      }
    }, false);

    link.addEventListener('mouseout', () => {
      if (!isManualScroll) {
        menu.dataset.index = activeIndex;
      }
    }, false);

    link.addEventListener('click', (e) => {
      e.preventDefault();
      isManualScroll = true;
      activeIndex = i;
      updateActiveState();

      if (sections[i]) {
        sections[i].scrollIntoView({ behavior: 'smooth' });
      }
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isManualScroll = false;
      }, 1000);
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
  // Observer for active section highlighting (center of viewport)
  const activeObserverOptions = {
    root: container,
    rootMargin: '-50% 0px -50% 0px', // Precise center line
    threshold: 0
  };

  const activeObserver = new IntersectionObserver((entries) => {
    if (isManualScroll) return; // Skip updates if we are manually scrolling

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (id === 'about') activeIndex = 0;
        else if (id === 'projects') activeIndex = 1;
        else if (id === 'contact') activeIndex = 2;
        
        updateActiveState();
      }
    });
  }, activeObserverOptions);

  // Observer for visibility animation
  const visibilityObserverOptions = {
    root: container,
    rootMargin: '-10% 0px -10% 0px',
    threshold: 0.1
  };

  const visibilityObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, visibilityObserverOptions);

  sections.forEach(section => {
    activeObserver.observe(section);
    visibilityObserver.observe(section);
  });
}

window.addEventListener('load', () => {
  activateParallax();
  initScrollObserver();
  updateActiveState();
  
  // Initial check
  if(sections[0]) sections[0].classList.add('visible');
}, false);

/* Mobile Interface Logic (Industrial Functionalist) */
function initMobileInterface() {
  const timeDisplay = document.getElementById('m-system-time');
  const mobileNavItems = document.querySelectorAll('.m-nav-item');
  const mobileWrapper = document.querySelector('.mobile-wrapper');

  // Check if we are in mobile view roughly
  if (!mobileWrapper) return;

  // System Time Update
  if (timeDisplay) {
    const updateTime = () => {
      const now = new Date();
      // Format: YYYY-MM-DD HH:MM:SS
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      timeDisplay.textContent = `${dateStr} ${timeStr}`;
    };
    // Update every second
    setInterval(updateTime, 1000);
    // Initial call
    updateTime();
  }

  // Mobile Navigation Interaction
  let isMobileManualScroll = false;
  
  mobileNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // Allow default anchor behavior if IDs were present, 
      // but since they are #, we prevent default to avoid jump to top
      const href = item.getAttribute('href');
      if (href === '#' || href === '') {
        e.preventDefault();
      }
      
      // Update Active State
      mobileNavItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      isMobileManualScroll = true;
      setTimeout(() => { isMobileManualScroll = false; }, 1000);

      // Scroll Logic (Approximation based on index/text)
      const sections = document.querySelectorAll('.m-section-header');
      const projectHeader = Array.from(sections).find(s => s.innerText.includes('PROJECT_LOG'));
      const infoHeader = Array.from(sections).find(s => s.innerText.includes('SYSTEM_SPECS'));
      const commHeader = Array.from(sections).find(s => s.innerText.includes('COMM_CHANNELS'));
      
      const text = item.textContent.trim(); /* HOME, PROJ, INFO, COMM */
      
      if (text.includes('HOME')) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (text.includes('PROJ') && projectHeader) {
          projectHeader.scrollIntoView({ behavior: 'smooth' });
      } else if (text.includes('INFO') && infoHeader) { // Mapped to System Specs
          infoHeader.scrollIntoView({ behavior: 'smooth' });
      } else if (text.includes('COMM') && commHeader) {
          commHeader.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Mobile Scroll Observer
  const mobileHeaders = document.querySelectorAll('.m-section-header');
  const mobileObserverOptions = {
    root: null,
    rootMargin: '-10% 0px -50% 0px', // Trigger when header is in upper half
    threshold: 0
  };

  const mobileObserver = new IntersectionObserver((entries) => {
    if (isMobileManualScroll) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const text = entry.target.innerText;
        let activeText = '';

        if (text.includes('OPERATOR_PROFILE')) activeText = 'HOME';
        else if (text.includes('PROJECT_LOG')) activeText = 'PROJ';
        else if (text.includes('SYSTEM_SPECS')) activeText = 'INFO';
        else if (text.includes('COMM_CHANNELS')) activeText = 'COMM';

        if (activeText) {
            mobileNavItems.forEach(nav => {
                const navText = nav.textContent.trim();
                if (navText.includes(activeText)) {
                    nav.classList.add('active');
                } else {
                    nav.classList.remove('active');
                }
            });
        }
      }
    });
  }, mobileObserverOptions);

  mobileHeaders.forEach(h => mobileObserver.observe(h));
}

// Initialize Mobile Interface when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMobileInterface);
} else {
    initMobileInterface();
}