// Track the single element currently being dragged
let dragging = null;
let offsetX = 0;
let offsetY = 0;

function startDrag(e, desktopElement) {
  dragging = desktopElement;
  bringToFront(desktopElement);

  // The gap between the cursor and the element's top-left corner.
  // Without this, the element would "jump" so its corner snaps to your cursor.
  const rect = desktopElement.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  e.preventDefault(); // stops text from getting selected while dragging
}

function moveDragging(e) {
  if (!dragging) return;

  const desktop = document.querySelector('.desktop');
  const dw = desktop.offsetWidth;
  const dh = desktop.offsetHeight;
  const ww = dragging.offsetWidth;
  const wh = dragging.offsetHeight;

  // Clamp so the element can't leave the desktop edges
  const x = Math.max(0, Math.min(e.clientX - offsetX, dw - ww));
  const y = Math.max(0, Math.min(e.clientY - offsetY, dh - wh));

  dragging.style.left = x + 'px';
  dragging.style.top = y + 'px';
}

document.addEventListener('mousemove', moveDragging);

document.addEventListener('mouseup', () => {
  dragging = null; // release on mouse up, anywhere on the page
});

let zCounter = 10; // start above any z-index you've set in CSS

// Bring the selected element to the forefront
function bringToFront(desktopElement) {
  zCounter++;
  desktopElement.style.zIndex = zCounter;
}

// Mirror the mouse events with touch equivalents (for phone/tablet support)
document.querySelectorAll('.window__titlebar').forEach(titlebar => {
  titlebar.addEventListener('touchstart', (e) => {
    startDrag(e.touches[0], titlebar.closest('.window'));
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