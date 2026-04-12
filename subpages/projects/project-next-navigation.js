function normalizeProjectList(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.projects)) return payload.projects;
  return [];
}

function getCurrentProjectIndex(projects) {
  const currentPath = window.location.pathname.replace(/\\/g, '/');
  const currentFile = currentPath.split('/').pop();

  return projects.findIndex((project) => {
    if (!project || typeof project.page !== 'string') return false;

    const pagePath = project.page.replace(/\\/g, '/');
    const pageFile = pagePath.split('/').pop();

    if (pageFile && pageFile === currentFile) return true;

    const normalizedPagePath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath;
    return currentPath.endsWith(normalizedPagePath);
  });
}

function buildProjectUrl(pagePath) {
  return new URL(`../../${pagePath}`, window.location.href).href;
}

function renderProjectNavigation(currentIndex, projects) {
  const rightColumn = document.querySelector('.project-page__right');
  if (!rightColumn) return;
  const heroSection = rightColumn.querySelector('.project-page__hero');

  let nav = rightColumn.querySelector('.project-page__next-nav');
  if (!nav) {
    nav = document.createElement('div');
    nav.className = 'project-page__next-nav project-page__next-nav--right';
    if (heroSection) {
      heroSection.insertAdjacentElement('afterend', nav);
    } else {
      rightColumn.appendChild(nav);
    }
  }

  nav.innerHTML = '';

  if (currentIndex > 0) {
    const previousProject = projects[currentIndex - 1];
    if (previousProject) {
      const previousLink = document.createElement('a');
      previousLink.className = 'project-next-link';
      previousLink.href = buildProjectUrl(previousProject.page);
      previousLink.textContent = '< Previous project';
      previousLink.setAttribute('aria-label', `Previous project: ${previousProject.title || 'Untitled project'}`);
      nav.appendChild(previousLink);
    }
  }

  const nextIndex = (currentIndex + 1) % projects.length;
  const nextProject = projects[nextIndex];
  if (!nextProject) return;

  const link = document.createElement('a');
  link.className = 'project-next-link';
  link.href = buildProjectUrl(nextProject.page);
  link.textContent = 'Next project >';
  link.setAttribute('aria-label', `Next project: ${nextProject.title || 'Untitled project'}`);
  nav.appendChild(link);
}

async function initNextProjectNavigation() {
  try {
    const response = await fetch('./projects.json', { cache: 'no-store' });
    if (!response.ok) return;

    const payload = await response.json();
    const projects = normalizeProjectList(payload)
      .filter((project) => project && project.published === true && typeof project.page === 'string');

    if (projects.length < 2) return;

    const currentIndex = getCurrentProjectIndex(projects);
    if (currentIndex < 0) return;

    renderProjectNavigation(currentIndex, projects);
  } catch {
    // Keep project page usable if navigation data is unavailable.
  }
}

window.addEventListener('DOMContentLoaded', initNextProjectNavigation);
