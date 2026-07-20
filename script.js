const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const navLinks = document.querySelector('.nav-links');
const navItems = [...document.querySelectorAll('.nav-links a')];
const sections = [...document.querySelectorAll('main section[id]')];
const progressBar = document.querySelector('.scroll-progress span');
const cursorGlow = document.querySelector('.cursor-glow');
const portraitShell = document.querySelector('[data-parallax]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

function closeMenu() {
  navLinks.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation menu');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation menu' : 'Close navigation menu');
  navLinks.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

navItems.forEach((item) => item.addEventListener('click', closeMenu));

let scrollTicking = false;
function updateOnScroll() {
  header.classList.toggle('scrolled', window.scrollY > 20);

  const currentPosition = window.scrollY + 180;
  let currentSection = 'home';
  sections.forEach((section) => {
    if (currentPosition >= section.offsetTop) currentSection = section.id;
  });

  navItems.forEach((item) => {
    const href = item.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    item.classList.toggle('active', href.slice(1) === currentSection);
  });

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
  if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
  scrollTicking = false;
}

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    window.requestAnimationFrame(updateOnScroll);
    scrollTicking = true;
  }
}, { passive: true });

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -35px' }
);

document.querySelectorAll('.reveal').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min((index % 4) * 70, 210)}ms`;
  revealObserver.observe(element);
});

document.getElementById('year').textContent = new Date().getFullYear();

// Pointer-following ambient light.
if (!reduceMotion && finePointer && cursorGlow) {
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let glowX = pointerX;
  let glowY = pointerY;

  window.addEventListener('pointermove', (event) => {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }, { passive: true });

  const animateGlow = () => {
    glowX += (pointerX - glowX) * 0.12;
    glowY += (pointerY - glowY) * 0.12;
    cursorGlow.style.transform = `translate3d(${glowX - 260}px, ${glowY - 260}px, 0)`;
    requestAnimationFrame(animateGlow);
  };
  animateGlow();
}

// Hero portrait parallax.
if (!reduceMotion && finePointer && portraitShell) {
  const heroVisual = portraitShell.closest('.hero-visual');
  heroVisual.addEventListener('pointermove', (event) => {
    const rect = heroVisual.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    portraitShell.style.setProperty('--hero-ry', `${px * 8}deg`);
    portraitShell.style.setProperty('--hero-rx', `${py * -7}deg`);
    portraitShell.style.setProperty('--hero-x', `${px * 10}px`);
    portraitShell.style.setProperty('--hero-y', `${py * 8}px`);
  });

  heroVisual.addEventListener('pointerleave', () => {
    portraitShell.style.setProperty('--hero-ry', '0deg');
    portraitShell.style.setProperty('--hero-rx', '0deg');
    portraitShell.style.setProperty('--hero-x', '0px');
    portraitShell.style.setProperty('--hero-y', '0px');
  });
}

// 3D tilt and cursor glow for cards.
if (!reduceMotion && finePointer) {
  document.querySelectorAll('.interactive-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 7;
      const rotateX = ((y / rect.height) - 0.5) * -7;
      card.style.setProperty('--tilt-x', `${rotateX}deg`);
      card.style.setProperty('--tilt-y', `${rotateY}deg`);
      card.style.setProperty('--card-x', `${(x / rect.width) * 100}%`);
      card.style.setProperty('--card-y', `${(y / rect.height) * 100}%`);
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--card-x', '50%');
      card.style.setProperty('--card-y', '50%');
    });
  });

  // Small magnetic movement on the main calls-to-action.
  document.querySelectorAll('.button').forEach((button) => {
    button.addEventListener('pointermove', (event) => {
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.setProperty('--magnetic-x', `${x * 0.08}px`);
      button.style.setProperty('--magnetic-y', `${y * 0.12}px`);
    });

    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--magnetic-x', '0px');
      button.style.setProperty('--magnetic-y', '0px');
    });
  });
}

// Button ripple feedback.
document.querySelectorAll('.button').forEach((button) => {
  button.addEventListener('click', (event) => {
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    const size = Math.max(rect.width, rect.height);
    ripple.className = 'button-ripple';
    ripple.style.width = `${size}px`;
    ripple.style.height = `${size}px`;
    ripple.style.left = `${event.clientX - rect.left}px`;
    ripple.style.top = `${event.clientY - rect.top}px`;
    button.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove());
  });
});

// Typewriter effect for focus areas.
const typingText = document.querySelector('.typing-text');
if (typingText && !reduceMotion) {
  const words = ['Networking', 'Penetration Testing', 'AI Security'];
  let wordIndex = 0;
  let characterIndex = words[0].length;
  let deleting = true;

  const type = () => {
    const word = words[wordIndex];
    if (deleting) {
      characterIndex -= 1;
      typingText.textContent = word.slice(0, Math.max(characterIndex, 0));
      if (characterIndex <= 0) {
        deleting = false;
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 320);
        return;
      }
    } else {
      const nextWord = words[wordIndex];
      characterIndex += 1;
      typingText.textContent = nextWord.slice(0, characterIndex);
      if (characterIndex >= nextWord.length) {
        deleting = true;
        setTimeout(type, 1300);
        return;
      }
    }
    setTimeout(type, deleting ? 42 : 72);
  };

  setTimeout(type, 1400);
}

updateOnScroll();

const topCardTopics = [
  {
    icon: "NS",
    title: "Network Security",
    subtitle: "Core interest"
  },
  {
    icon: "PT",
    title: "Penetration Testing",
    subtitle: "Practical focus"
  },
  {
    icon: "WS",
    title: "Web Security",
    subtitle: "Technical interest"
  },
  {
    icon: "SO",
    title: "Security Operations",
    subtitle: "Career interest"
  }
];

const bottomCardTopics = [
  {
    icon: "AI",
    title: "AI Security",
    subtitle: "Learning focus"
  },
  {
    icon: "TA",
    title: "Threat Analysis",
    subtitle: "Developing skill"
  },
  {
    icon: "IR",
    title: "Incident Response",
    subtitle: "Learning focus"
  },
  {
    icon: "CS",
    title: "Cloud Security",
    subtitle: "Future focus"
  }
];

let topTopicIndex = 0;
let bottomTopicIndex = 0;

function updateRotatingCard(cardSelector, iconId, titleId, subtitleId, topic) {
  const card = document.querySelector(cardSelector);
  const icon = document.getElementById(iconId);
  const title = document.getElementById(titleId);
  const subtitle = document.getElementById(subtitleId);

  if (!card || !icon || !title || !subtitle) {
    return;
  }

  card.classList.add("changing");

  window.setTimeout(() => {
    icon.textContent = topic.icon;
    title.textContent = topic.title;
    subtitle.textContent = topic.subtitle;

    card.classList.remove("changing");
  }, 350);
}

window.setInterval(() => {
  topTopicIndex = (topTopicIndex + 1) % topCardTopics.length;

  updateRotatingCard(
    ".card-top",
    "top-card-icon",
    "top-card-title",
    "top-card-subtitle",
    topCardTopics[topTopicIndex]
  );
}, 3500);

window.setInterval(() => {
  bottomTopicIndex = (bottomTopicIndex + 1) % bottomCardTopics.length;

  updateRotatingCard(
    ".card-bottom",
    "bottom-card-icon",
    "bottom-card-title",
    "bottom-card-subtitle",
    bottomCardTopics[bottomTopicIndex]
  );
}, 3500);

// Reactive coding-style hero name.
const reactiveName = document.querySelector('[data-reactive-name]');

if (reactiveName) {
  const nameLines = [...reactiveName.querySelectorAll('.name-line')];
  const scrambleCharacters = '01{}[]<>/_\\|#@$%&*+';
  let nameAnimationRunning = false;
  let lastNameAnimation = 0;

  const scrambleLine = (line, delay = 0) => new Promise((resolve) => {
    const finalValue = line.dataset.value || line.textContent.trim();
    const totalFrames = Math.max(finalValue.length * 3, 18);
    let frame = 0;

    window.setTimeout(() => {
      const interval = window.setInterval(() => {
        const resolvedCharacters = Math.floor(frame / 3);
        line.textContent = [...finalValue].map((character, index) => {
          if (character === ' ') return ' ';
          if (index < resolvedCharacters) return finalValue[index];
          return scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        }).join('');

        frame += 1;
        if (frame > totalFrames) {
          window.clearInterval(interval);
          line.textContent = finalValue;
          resolve();
        }
      }, 34);
    }, delay);
  });

  const runNameDecode = async (force = false) => {
    const now = Date.now();
    if (reduceMotion || nameAnimationRunning || (!force && now - lastNameAnimation < 2300)) return;

    nameAnimationRunning = true;
    lastNameAnimation = now;
    reactiveName.classList.add('is-decoding');

    await Promise.all(nameLines.map((line, index) => scrambleLine(line, index * 115)));

    reactiveName.classList.remove('is-decoding');
    reactiveName.classList.add('is-glitching');
    window.setTimeout(() => reactiveName.classList.remove('is-glitching'), 390);
    nameAnimationRunning = false;
  };

  if (!reduceMotion) {
    window.setTimeout(() => runNameDecode(true), 650);
    reactiveName.addEventListener('pointerenter', () => runNameDecode());
    reactiveName.addEventListener('focus', () => runNameDecode());
    reactiveName.addEventListener('click', () => runNameDecode(true));
  }

  if (!reduceMotion && finePointer) {
    reactiveName.addEventListener('pointermove', (event) => {
      const rect = reactiveName.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const px = x / rect.width - 0.5;
      const py = y / rect.height - 0.5;

      reactiveName.style.setProperty('--name-ry', `${px * 4.5}deg`);
      reactiveName.style.setProperty('--name-rx', `${py * -3.5}deg`);
      reactiveName.style.setProperty('--name-x', `${px * 4}px`);
      reactiveName.style.setProperty('--name-y', `${py * 3}px`);
      reactiveName.style.setProperty('--name-glow-x', `${(x / rect.width) * 100}%`);
      reactiveName.style.setProperty('--name-glow-y', `${(y / rect.height) * 100}%`);
    });

    reactiveName.addEventListener('pointerleave', () => {
      reactiveName.style.setProperty('--name-ry', '0deg');
      reactiveName.style.setProperty('--name-rx', '0deg');
      reactiveName.style.setProperty('--name-x', '0px');
      reactiveName.style.setProperty('--name-y', '0px');
      reactiveName.style.setProperty('--name-glow-x', '50%');
      reactiveName.style.setProperty('--name-glow-y', '50%');
    });
  }
}

// Project case-study modal.
const projectOpenButtons = document.querySelectorAll('[data-open-project]');
const projectCloseButtons = document.querySelectorAll('[data-close-project]');
let activeProjectModal = null;
let projectModalTrigger = null;

const getFocusableElements = (container) => [...container.querySelectorAll(
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
)].filter((element) => !element.hasAttribute('hidden'));

const closeProjectModal = () => {
  if (!activeProjectModal) return;

  activeProjectModal.hidden = true;
  document.body.classList.remove('project-modal-open');
  activeProjectModal = null;

  if (projectModalTrigger) {
    projectModalTrigger.focus();
    projectModalTrigger = null;
  }
};

const openProjectModal = (button) => {
  const modalId = button.dataset.openProject;
  const modal = document.getElementById(modalId);
  if (!modal) return;

  projectModalTrigger = button;
  activeProjectModal = modal;
  modal.hidden = false;
  document.body.classList.add('project-modal-open');

  const focusable = getFocusableElements(modal);
  window.requestAnimationFrame(() => {
    (focusable[0] || modal).focus();
  });
};

projectOpenButtons.forEach((button) => {
  button.addEventListener('click', () => openProjectModal(button));
});

projectCloseButtons.forEach((button) => {
  button.addEventListener('click', closeProjectModal);
});

document.addEventListener('keydown', (event) => {
  if (!activeProjectModal) return;

  if (event.key === 'Escape') {
    closeProjectModal();
    return;
  }

  if (event.key !== 'Tab') return;

  const focusable = getFocusableElements(activeProjectModal);
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
