let dragging = null;
let offsetX = 0;
let offsetY = 0;
let zCounter = 10;

function bringToFront(el) {
  zCounter++;
  el.style.zIndex = zCounter;
}

function startDrag(e, el) {
  dragging = el;
  bringToFront(el);

  const rect = el.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  e.preventDefault();
}

function moveDragging(e) {
  if (!dragging) return;

  const desktop = document.querySelector('.desktop');
  const dw = desktop.offsetWidth;
  const dh = desktop.offsetHeight;
  const ww = dragging.offsetWidth;
  const wh = dragging.offsetHeight;

  const x = Math.max(0, Math.min(e.clientX - offsetX, dw - ww));
  const y = Math.max(0, Math.min(e.clientY - offsetY, dh - wh));

  dragging.style.left = x + 'px';
  dragging.style.top  = y + 'px';
}

document.addEventListener('mousemove', moveDragging);
document.addEventListener('mouseup', () => dragging = null);

// Touch support
document.querySelectorAll('.window__titlebar').forEach(titlebar => {
  titlebar.addEventListener('touchstart', (e) => {
    startDrag(e.touches[0], titlebar.closest('.window-wrapper'));
    e.preventDefault();
  });
});

document.addEventListener('touchmove', (e) => {
  if (!dragging) return;
  moveDragging(e.touches[0]);
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', () => dragging = null);


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
  lightmode = localStorage.getItem('lightmode');
  lightmode !== "active" ? enableLightMode() : disableLightMode();
})