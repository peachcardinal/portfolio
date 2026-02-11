const initProjectsGrid = () => {
    const gridEl = document.querySelector('.projects__grid');

    if (!gridEl) return;

    const data = Array.isArray(window.PROJECTS_GRID) ? window.PROJECTS_GRID : [];

    data.forEach((project) => {
        const a = document.createElement('a');
        a.className = 'projects__card link' + (project.soon ? ' projects__card--soon' : '');
        a.href = project.link || '#';
        if (project.link && project.link !== '#' && (project.link.startsWith('http://') || project.link.startsWith('https://'))) {
            a.target = '_blank';
            a.rel = 'noopener';
        }

        const title = document.createElement('h2');
        title.className = 'projects__card-title h2';
        title.textContent = project.title || '';

        const role = document.createElement('span');
        role.className = 'projects__card-role';
        role.textContent = project.role || '';

        const description = document.createElement('p');
        description.className = 'projects__card-description';
        description.textContent = project.description || '';

        const footer = document.createElement('div');
        footer.className = 'projects__card-footer';
        footer.appendChild(description);

        a.appendChild(title);
        a.appendChild(role);
        a.appendChild(footer);

        gridEl.appendChild(a);
    });

    // Анимируем карточки проектов
    if (typeof animateElements === 'function') {
        const cards = Array.from(gridEl.querySelectorAll('.projects__card'));
        animateElements(cards, 50, true);
    }
};

window.initProjectsGrid = initProjectsGrid;
const runProjectsInit = () => {
    initProjectsGrid();
    if (typeof animateElements === 'function') {
        const title = document.querySelector('.projects__title');
        if (title) animateElements([title], 0);
    }
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runProjectsInit);
} else {
    runProjectsInit();
}
