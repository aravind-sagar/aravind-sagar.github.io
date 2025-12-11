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

    link.addEventListener('click', () => {
      isManualScroll = true;
      activeIndex = i;
      updateActiveState();
      
      // Reset manual scroll lock after animation finishes
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