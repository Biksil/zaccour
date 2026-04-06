let dragging = null;
let offsetX = 0;
let offsetY = 0;
let zCounter = 10;
let didDrag = false;
let dragDistance = 0;

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}


// Position loading bar relative to character
function positionLoadingBarAboveCharacter() {
  const desktop = document.querySelector('.desktop');
  const character = document.querySelector('.desktop__element--character');
  const loading = document.querySelector('.desktop__element--loading');

  if (!desktop || !character || !loading) return;

  if (isMobileLayout()) {
    loading.style.left = '';
    loading.style.top = '';
    loading.style.bottom = '';
    return;
  }

  const desktopRect = desktop.getBoundingClientRect();
  const characterRect = character.getBoundingClientRect();
  const loadingRect = loading.getBoundingClientRect();
  const configuredGap = Number.parseFloat(
    getComputedStyle(desktop).getPropertyValue('--loading-character-gap')
  );
  const gap = Number.isFinite(configuredGap) ? configuredGap : 14;

  const x = characterRect.left - desktopRect.left + (characterRect.width - loadingRect.width) / 2;
  const bottom = characterRect.height + gap;

  const maxX = Math.max(0, desktopRect.width - loadingRect.width);
  const clampedX = Math.min(Math.max(0, x), maxX);
  const clampedBottom = Math.max(0, bottom);

  loading.style.left = `${clampedX}px`;
  loading.style.top = 'auto';
  loading.style.bottom = `${clampedBottom}px`;
}

// Position light bulb relative to character
function positionThemeToggleRelativeToCharacter() {
  const desktop = document.querySelector('.desktop');
  const character = document.querySelector('.desktop__element--character');
  const theme = document.querySelector('.desktop__element--theme');

  if (!desktop || !character || !theme) return;

  if (isMobileLayout()) {
    theme.style.left = '';
    theme.style.top = '';
    theme.style.bottom = '';
    return;
  }

  const desktopRect = desktop.getBoundingClientRect();
  const characterRect = character.getBoundingClientRect();
  const themeRect = theme.getBoundingClientRect();

  const ratioX = Number.parseFloat(
    getComputedStyle(desktop).getPropertyValue('--theme-character-offset-x-ratio')
  );
  const ratioY = Number.parseFloat(
    getComputedStyle(desktop).getPropertyValue('--theme-character-offset-y-ratio')
  );

  const dxRatio = Number.isFinite(ratioX) ? ratioX : 0.95;
  const dyRatio = Number.isFinite(ratioY) ? ratioY : -0.35;

  const x = characterRect.left - desktopRect.left + characterRect.width * dxRatio;
  const y = characterRect.top - desktopRect.top + characterRect.height * dyRatio;

  const maxX = Math.max(0, desktopRect.width - themeRect.width);
  const maxY = Math.max(0, desktopRect.height - themeRect.height);
  const clampedX = Math.min(Math.max(0, x), maxX);
  const clampedY = Math.min(Math.max(0, y), maxY);

  theme.style.left = `${clampedX}px`;
  theme.style.top = `${clampedY}px`;
  theme.style.bottom = 'auto';
}


// Position post-it relative to about window
function positionPostitRelativeToAboutWindow() {
  const desktop = document.querySelector('.desktop');
  const aboutWrapper = document.querySelector('.window-wrapper--about');
  const postit = document.querySelector('.desktop__element--postit');

  if (!desktop || !aboutWrapper || !postit) return;

  if (isMobileLayout()) {
    postit.style.left = '';
    postit.style.top = '';
    postit.style.bottom = '';
    return;
  }

  const desktopRect = desktop.getBoundingClientRect();
  const aboutRect = aboutWrapper.getBoundingClientRect();
  const postitRect = postit.getBoundingClientRect();

  const offsetX = Number.parseFloat(
    getComputedStyle(desktop).getPropertyValue('--postit-about-offset-x')
  );
  const offsetY = Number.parseFloat(
    getComputedStyle(desktop).getPropertyValue('--postit-about-offset-y')
  );

  const dx = Number.isFinite(offsetX) ? offsetX : 12;
  const dy = Number.isFinite(offsetY) ? offsetY : 8;

  const x = aboutRect.right - desktopRect.left - postitRect.width + dx;
  const y = aboutRect.bottom - desktopRect.top - postitRect.height + dy;

  const maxX = Math.max(0, desktopRect.width - postitRect.width);
  const maxY = Math.max(0, desktopRect.height - postitRect.height);
  const clampedX = Math.min(Math.max(0, x), maxX);
  const clampedY = Math.min(Math.max(0, y), maxY);

  postit.style.left = `${clampedX}px`;
  postit.style.top = `${clampedY}px`;
  postit.style.bottom = 'auto';
}



// Dragging logic

function bringToFront(el) {
  zCounter++;
  el.style.zIndex = zCounter;
}

function startDrag(e, el) {
  if (isMobileLayout()) return;

  dragDistance = 0;
  didDrag = false;
  dragging = el;
  bringToFront(el);

  const rect = el.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  e.preventDefault();
}

function moveDragging(e) {
  if (!dragging) return;

  dragDistance++;
  didDrag = true;

  const desktop = document.querySelector('.desktop');
  const dw = desktop.offsetWidth;
  const dh = desktop.offsetHeight;
  const ww = dragging.offsetWidth;
  const wh = dragging.offsetHeight;

  const x = Math.max(0, Math.min(e.clientX - offsetX, dw - ww));
  const y = Math.max(0, Math.min(e.clientY - offsetY, dh - wh));

  const xPct = (x / dw) * 100;
  const yPct = (y / dh) * 100;

  dragging.style.left = xPct + '%';
  dragging.style.top = yPct + '%';
}

document.addEventListener('mousemove', moveDragging);
document.addEventListener('mouseup', () => {
  dragging = null;
});


// Touch support
document.querySelectorAll('.window__titlebar, .desktop__element').forEach(el => {
  el.addEventListener('touchstart', (e) => {
    if (isMobileLayout()) return;

    const target = el.classList.contains('window__titlebar')
      ? el.closest('.window-wrapper')
      : el;
    startDrag(e.touches[0], target);
    e.preventDefault();
  });
});

document.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  moveDragging(e.touches[0]);
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', () => {
  dragging = null;
});

// Randomize post-it image
function randomizePostitImage() {
  const postitImages = ['compyu-cat.png', 'desk-cat.png'];
  const randomImage = postitImages[Math.floor(Math.random() * postitImages.length)];
  const postitImg = document.getElementById('postit-image');
  if (postitImg) {
    postitImg.src = `assets/img/post-it/${randomImage}`;
  }
}

function positionElementsRelativeToCharacter() {
  positionLoadingBarAboveCharacter();
  positionThemeToggleRelativeToCharacter();
  positionPostitRelativeToAboutWindow();
}

window.addEventListener('DOMContentLoaded', () => {
  randomizePostitImage();
  positionElementsRelativeToCharacter();
});
window.addEventListener('load', positionElementsRelativeToCharacter);
window.addEventListener('resize', positionElementsRelativeToCharacter);


// Light/dark mode toggle
let lightmode = localStorage.getItem('lightmode')
const themeToggle = document.getElementById('theme-toggle');

const enableLightMode = () => {
  document.body.classList.add('lightmode');
  localStorage.setItem('lightmode', 'active');
}

const disableLightMode = () => {
  document.body.classList.remove('lightmode');
  localStorage.setItem('lightmode', 'inactive');
}

if (lightmode === "active") {
  enableLightMode();
}

themeToggle.addEventListener('click', () => {
  if (didDrag) return;
  if (dragDistance > 5) return;
  lightmode = localStorage.getItem('lightmode');
  lightmode !== "active" ? enableLightMode() : disableLightMode();
})

// Same thing for other clickable + draggable elements
document.querySelectorAll('.desktop__element a').forEach(link => {
  link.addEventListener('click', (e) => {
    if (didDrag) e.preventDefault();
    link.addEventListener('click', (e) => {
    if (dragDistance > 5) e.preventDefault();
  });
  });
});


// Project subpage opening //
const modal = document.getElementById('add-project-modal');
const btnAdd = document.querySelector('.btn-open');
const modalClose = document.getElementById('modal-close');

btnAdd.addEventListener('click', () => {
  modal.style.display = 'block';
  // Trigger reflow so the animation replays each time
  void modal.offsetWidth;
  modal.classList.add('is-open');
});

modalClose.addEventListener('click', () => {
  modal.classList.remove('is-open');
  modal.classList.add('is-closing');
  modal.addEventListener('animationend', () => {
    modal.classList.remove('is-closing');
    modal.style.display = 'none';
  }, { once: true }); // "once: true" auto-removes the listener after it fires
});