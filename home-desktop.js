let dragging = null;
let offsetX = 0;
let offsetY = 0;
let zCounter = 10;
let didDrag = false;
let dragDistance = 0;
const characterBlinkSrc = 'assets/img/character/character-blink.gif';
const characterDragSrc = 'assets/img/character/character-grab.gif';

function getCharacterImage() {
  return document.querySelector('.desktop__element--character img');
}

function setCharacterDraggingState(isDragging) {
  const characterImg = getCharacterImage();
  if (!characterImg) return;

  if (isDragging) {
    characterImg.style.transition = 'none';
    characterImg.src = characterDragSrc;
    return;
  }

  if (!characterImg.src.includes('character-grab.gif')) {
    return;
  }

  characterImg.style.transition = 'none';
  characterImg.src = characterBlinkSrc;
}

function preloadCharacterImages() {
  [characterBlinkSrc, characterDragSrc].forEach((src) => {
    const img = new Image();
    img.src = src;
  });
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 768px)').matches;
}

function isModalOpen() {
  return document.body.classList.contains('modal-open');
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


/////////////////////
// Dragging logic //

function bringToFront(el) {
  zCounter++;
  el.style.zIndex = zCounter;
}

function startDrag(e, el) {
  if (isMobileLayout() || isModalOpen()) return;

  dragDistance = 0;
  didDrag = false;
  dragging = el;
  bringToFront(el);

  if (el.classList.contains('desktop__element--character')) {
    setCharacterDraggingState(true);
  }

  const rect = el.getBoundingClientRect();
  offsetX = e.clientX - rect.left;
  offsetY = e.clientY - rect.top;

  e.preventDefault();
}

function stopDrag() {
  if (!dragging) return;

  if (dragging.classList.contains('desktop__element--character')) {
    setCharacterDraggingState(false);
  }

  dragging = null;
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
document.addEventListener('mouseup', stopDrag);


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
  stopDrag();
});

document.addEventListener('touchcancel', stopDrag);


/////////////////////////////
// Randomize post-it image //
function randomizePostitImage() {
  const postitImages = ['compyu-cat.png', 'desk-cat.png'];
  const randomImage = postitImages[Math.floor(Math.random() * postitImages.length)];
  const postitImg = document.getElementById('postit-image');
  if (postitImg) {
    postitImg.src = `assets/img/post-it/${randomImage}`;
  }
}

function normalizeProjectData(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.projects)) return payload.projects;
  if (payload && typeof payload === 'object') return [payload];
  return [];
}

let projectDataCache = null;

async function loadProjects() {
  if (projectDataCache) return projectDataCache;

  const response = await fetch('subpages/projects/projects.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load projects.json (${response.status})`);

  const rawData = await response.json();
  projectDataCache = normalizeProjectData(rawData);
  return projectDataCache;
}

function getHighlightedProjects(projects, maxCount = 2) {
  return projects
    .filter((project) => project && project.highlight === true)
    .sort((a, b) => {
      const aOrder = Number.isFinite(Number(a.highlightOrder)) ? Number(a.highlightOrder) : Number.MAX_SAFE_INTEGER;
      const bOrder = Number.isFinite(Number(b.highlightOrder)) ? Number(b.highlightOrder) : Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    })
    .slice(0, maxCount);
}

function getPublishedProjects(projects) {
  return projects.filter((project) => project && project.published === true);
}

function getProjectFolderIcon(projectType) {
  const normalizedType = String(projectType || '').toLowerCase();

  if (normalizedType === 'research') {
    return 'assets/img/project-icons/folder-blue.png';
  }

  if (normalizedType === 'applied') {
    return 'assets/img/project-icons/folder-pink.png';
  }

  return 'assets/img/project-icons/folder-green.png';
}

let draggingModalEntry = null;
let modalEntryStartX = 0;
let modalEntryStartY = 0;
let modalEntryBaseX = 0;
let modalEntryBaseY = 0;
const modalEntryDragThreshold = 4;

function startModalProjectDrag(e, entry) {
  if (!entry || isMobileLayout()) return;
  if (typeof e.button === 'number' && e.button !== 0) return;

  draggingModalEntry = entry;
  modalEntryStartX = e.clientX;
  modalEntryStartY = e.clientY;
  modalEntryBaseX = Number(entry.dataset.offsetX || 0);
  modalEntryBaseY = Number(entry.dataset.offsetY || 0);
  entry.dataset.dragMoved = 'false';

  entry.style.zIndex = '20';
  entry.style.cursor = 'grabbing';
}

function moveModalProjectDrag(e) {
  if (!draggingModalEntry) return;

  // If mouseup was missed (e.g. outside window), stop dragging immediately.
  if (typeof e.buttons === 'number' && e.buttons === 0) {
    stopModalProjectDrag();
    return;
  }

  const dx = e.clientX - modalEntryStartX;
  const dy = e.clientY - modalEntryStartY;
  const nextX = modalEntryBaseX + dx;
  const nextY = modalEntryBaseY + dy;

  draggingModalEntry.dataset.offsetX = String(nextX);
  draggingModalEntry.dataset.offsetY = String(nextY);
  draggingModalEntry.style.left = `${nextX}px`;
  draggingModalEntry.style.top = `${nextY}px`;

  if (Math.hypot(dx, dy) > modalEntryDragThreshold) {
    draggingModalEntry.dataset.dragMoved = 'true';
  }
}

function stopModalProjectDrag() {
  if (!draggingModalEntry) return;

  draggingModalEntry.style.zIndex = '';
  draggingModalEntry.style.cursor = 'pointer';
  draggingModalEntry = null;
}

function createProjectItem(project) {
  const item = document.createElement('div');
  item.className = 'project-item modal-project-entry';

  const image = document.createElement('img');
  image.src = project.cover || 'assets/img/placeholder.png';
  image.alt = project.title || 'project preview';
  image.width = 100;

  const text = document.createElement('p');
  const title = project.title || 'Untitled project';
  const summary = project.summary || '';

  const titleEl = document.createElement('strong');
  titleEl.textContent = title;
  titleEl.style.fontWeight = '700';
  text.appendChild(titleEl);

  if (summary) {
    const summaryEl = document.createElement('span');
    summaryEl.textContent = summary;
    summaryEl.style.display = 'block';
    summaryEl.style.fontWeight = '400';
    text.appendChild(summaryEl);
  }

  item.appendChild(image);

  if (project.page) {
    item.addEventListener('click', async () => {
      if (!modal) return;
      await renderModalProjects();
      openModal(modal);
      showProjectDetailInModal(project.page, project.title || 'Project');
    });
  }

  item.appendChild(text);
  return item;
}

async function renderLatestProjects() {
  const container = document.getElementById('latest-projects-list');
  if (!container) return;

  try {
    const projects = await loadProjects();
    const publishedProjects = getPublishedProjects(projects);
    const highlighted = getHighlightedProjects(publishedProjects, 2);

    container.innerHTML = '';

    if (highlighted.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No highlighted projects yet.';
      container.appendChild(empty);
      return;
    }

    highlighted.forEach((project) => {
      container.appendChild(createProjectItem(project));
    });
  } catch (error) {
    container.innerHTML = '';
    const fallback = document.createElement('p');
    fallback.textContent = 'Could not load highlighted projects.';
    container.appendChild(fallback);
  }
}

function createModalProjectItem(project) {
  const item = document.createElement('div');
  item.className = 'project-item modal-project-entry';
  item.dataset.offsetX = '0';
  item.dataset.offsetY = '0';
  item.dataset.dragMoved = 'false';

  const image = document.createElement('img');
  image.src = getProjectFolderIcon(project.type);
  image.alt = `${project.title || 'Project'} folder icon`;
  image.width = 150;

  const text = document.createElement('p');
  text.textContent = project.summary
    ? `${project.title || 'Untitled project'}`
    : (project.title || 'Untitled project');

  item.appendChild(image);
  item.appendChild(text);

  item.addEventListener('mousedown', (e) => {
    e.preventDefault();
    startModalProjectDrag(e, item);
  });

  item.addEventListener('touchstart', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    startModalProjectDrag(e.touches[0], item);
    e.preventDefault();
  }, { passive: false });

  if (project.page) {
    item.addEventListener('click', (e) => {
      if (item.dataset.dragMoved === 'true') {
        e.preventDefault();
        item.dataset.dragMoved = 'false';
        return;
      }
      showProjectDetailInModal(project.page, project.title || 'Project');
    });
  }

  return item;
}

async function renderModalProjects() {
  const container = document.getElementById('modal-projects-list');
  if (!container) return;

  try {
    const projects = await loadProjects();
    const publishedProjects = getPublishedProjects(projects);
    container.innerHTML = '';

    if (publishedProjects.length === 0) {
      const empty = document.createElement('p');
      empty.textContent = 'No published projects available yet.';
      container.appendChild(empty);
      return;
    }

    publishedProjects.forEach((project) => {
      container.appendChild(createModalProjectItem(project));
    });
  } catch (error) {
    container.innerHTML = '';
    const fallback = document.createElement('p');
    fallback.textContent = 'Could not load projects.';
    container.appendChild(fallback);
  }
}

function positionElementsRelativeToCharacter() {
  positionLoadingBarAboveCharacter();
  positionThemeToggleRelativeToCharacter();
  positionPostitRelativeToAboutWindow();
}

window.addEventListener('DOMContentLoaded', () => {
  preloadCharacterImages();
  randomizePostitImage();
  renderLatestProjects();
  renderModalProjects();
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
  if (isModalOpen()) return;
  if (didDrag) return;
  if (dragDistance > 5) return;
  lightmode = localStorage.getItem('lightmode');
  lightmode !== "active" ? enableLightMode() : disableLightMode();
})

// Same thing for other clickable + draggable elements
document.querySelectorAll('.desktop__element a').forEach(link => {
  link.addEventListener('click', (e) => {
    if (isModalOpen()) {
      e.preventDefault();
      return;
    }
    if (didDrag) e.preventDefault();
    link.addEventListener('click', (e) => {
    if (dragDistance > 5) e.preventDefault();
  });
  });
});


/////////////////////////////
// Project subpage opening //
const modal = document.getElementById('open-project-modal');
const btnAdd = document.querySelector('.btn-open');
const projectModalBack = document.getElementById('modal-project-back');
const projectModalTitle = document.getElementById('modal-project-title');
const projectModalGallery = document.getElementById('modal-project-gallery');
const projectModalDetail = document.getElementById('modal-project-detail');
const projectModalFrame = document.getElementById('modal-project-frame');
const projectModalLegend = document.querySelector('.modal-project-legend');

function showProjectGalleryInModal() {
  if (projectModalDetail) {
    projectModalDetail.hidden = true;
  }
  if (projectModalGallery) {
    projectModalGallery.hidden = false;
  }
  if (projectModalLegend) {
    projectModalLegend.style.display = 'flex';
  }
  if (projectModalBack) {
    projectModalBack.hidden = true;
  }
  if (projectModalTitle) {
    projectModalTitle.textContent = 'Projects';
  }
}

function showProjectDetailInModal(page, title) {
  if (!projectModalFrame || !projectModalDetail || !projectModalGallery) return;

  projectModalFrame.src = page;
  projectModalGallery.hidden = true;
  projectModalDetail.hidden = false;
  if (projectModalLegend) {
    projectModalLegend.style.display = 'none';
  }

  if (projectModalBack) {
    projectModalBack.hidden = false;
  }
  if (projectModalTitle) {
    projectModalTitle.textContent = title || 'Project';
  }
}

function openModal(modalEl) {
  if (!modalEl) return;

  stopDrag();
  document.body.classList.add('modal-open');
  showProjectGalleryInModal();
  modalEl.style.display = 'block';
  // Trigger reflow so the animation replays each time
  void modalEl.offsetWidth;
  modalEl.classList.add('is-open');
}

function closeModal(modalEl) {
  if (!modalEl) return;

  if (modalEl.id === 'open-project-modal') {
    showProjectGalleryInModal();
    if (projectModalFrame) {
      projectModalFrame.src = 'about:blank';
    }
  }

  modalEl.classList.remove('is-open');
  modalEl.classList.add('is-closing');
  modalEl.addEventListener('animationend', () => {
    modalEl.classList.remove('is-closing');
    modalEl.style.display = 'none';
    document.body.classList.remove('modal-open');
  }, { once: true });
}

if (projectModalBack) {
  projectModalBack.addEventListener('click', () => {
    showProjectGalleryInModal();
  });
}

if (btnAdd && modal) {
  btnAdd.addEventListener('click', async () => {
    await renderModalProjects();
    openModal(modal);
  });
}

document.querySelectorAll('.modal-overlay .window__close').forEach((closeButton) => {
  closeButton.addEventListener('click', () => {
    const modalEl = closeButton.closest('.modal-overlay');
    closeModal(modalEl);
  });
});

document.addEventListener('mousemove', moveModalProjectDrag);
document.addEventListener('mouseup', stopModalProjectDrag);
window.addEventListener('blur', stopModalProjectDrag);

document.addEventListener('touchmove', (e) => {
  if (!draggingModalEntry || !e.touches || e.touches.length === 0) return;
  moveModalProjectDrag(e.touches[0]);
  e.preventDefault();
}, { passive: false });

document.addEventListener('touchend', stopModalProjectDrag);
document.addEventListener('touchcancel', stopModalProjectDrag);