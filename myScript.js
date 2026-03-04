const revealTargets = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16 }
);

revealTargets.forEach((item, index) => {
  item.style.transitionDelay = `${index * 90}ms`;
  revealObserver.observe(item);
});

const card = document.querySelector('.contact-card');
const orbA = document.querySelector('.orb-a');
const orbB = document.querySelector('.orb-b');

const cinematicSection = document.querySelector('.cinematic-section');
const timelineBar = document.getElementById('timelineBar');
const timelineTitle = document.getElementById('timelineTitle');
const timelineBody = document.getElementById('timelineBody');
const projectCards = [...document.querySelectorAll('.project-card')];

const timelineSteps = [
  {
    title: 'Identity First',
    body: 'The page opens with a high-contrast personal identity and a clean route to your contact card.',
  },
  {
    title: 'Professional Focus',
    body: 'Attention shifts to your LinkedIn destination and credibility signals with smooth pacing.',
  },
  {
    title: 'Portfolio Momentum',
    body: 'The finale prepares visitors for deeper project stories and a complete portfolio release.',
  },
];

let activeStep = 0;
let rafScheduled = false;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function easeInOut(value) {
  return 0.5 - Math.cos(value * Math.PI) / 2;
}

function updateCinematicScene(progress) {
  const smoothProgress = easeInOut(progress);
  document.documentElement.style.setProperty('--timeline-progress', smoothProgress.toFixed(4));

  if (timelineBar) {
    timelineBar.style.width = `${smoothProgress * 100}%`;
  }

  const steps = timelineSteps.length;
  const nextStep = clamp(Math.floor(smoothProgress * steps), 0, steps - 1);

  if (nextStep !== activeStep) {
    activeStep = nextStep;
    timelineTitle.textContent = timelineSteps[activeStep].title;
    timelineBody.textContent = timelineSteps[activeStep].body;
  }

  projectCards.forEach((projectCard, index) => {
    const cardDistance = Math.abs(index - smoothProgress * (steps - 1));
    const visibility = clamp(1 - cardDistance * 1.1, 0, 1);
    const y = (1 - visibility) * 22;
    const z = -100 + visibility * 100;
    const scale = 0.92 + visibility * 0.08;

    projectCard.style.opacity = visibility.toFixed(3);
    projectCard.style.transform = `translate3d(0, ${y.toFixed(2)}px, ${z.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    projectCard.classList.toggle('active', visibility > 0.72);
  });
}

function getSectionProgress(section) {
  if (!section) {
    return 0;
  }

  const rect = section.getBoundingClientRect();
  const total = section.offsetHeight - window.innerHeight;
  if (total <= 0) {
    return 0;
  }

  return clamp(-rect.top / total, 0, 1);
}

function onScrollFrame() {
  const y = window.scrollY;

  if (orbA) {
    orbA.style.transform = `translate3d(0, ${y * -0.08}px, 0)`;
  }

  if (orbB) {
    orbB.style.transform = `translate3d(0, ${y * -0.045}px, 0)`;
  }

  const cinematicProgress = getSectionProgress(cinematicSection);
  updateCinematicScene(cinematicProgress);

  rafScheduled = false;
}

function requestScrollUpdate() {
  if (rafScheduled) {
    return;
  }

  rafScheduled = true;
  window.requestAnimationFrame(onScrollFrame);
}

window.addEventListener('scroll', requestScrollUpdate, { passive: true });
window.addEventListener('resize', requestScrollUpdate);
requestScrollUpdate();

if (card && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
  card.addEventListener('pointermove', (event) => {
    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;

    const rotateY = (px - 0.5) * 9;
    const rotateX = (0.5 - py) * 7;
    card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });

  card.addEventListener('pointerleave', () => {
    card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
  });
}
