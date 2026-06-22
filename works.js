const initWorks = () => {
    const worksEl = document.querySelector('.works');
    const previewEl = document.querySelector('.works__preview');

    if (!worksEl) return;

    const data = Array.isArray(window.WORKS) ? window.WORKS : [];

    const renderRow = (work) => {
        const a = document.createElement('a');
        a.className = 'works__row link link-flip';
        a.href = work.link || '#';
        if (work.link && work.link !== '#' && (work.link.startsWith('http://') || work.link.startsWith('https://'))) {
            a.target = '_blank';
            a.rel = 'noopener';
        }

        const year = work.year || '';
        const title = work.title || 'Work';
        const type = work.type || '';

        const front = document.createElement('span');
        front.className = 'link-flip__front';
        front.innerHTML = `<span class="works__year">${year}</span><span class="works__work-title h1">${title}</span><span class="works__type">${type}</span>`;

        const back = document.createElement('span');
        back.className = 'link-flip__back';
        back.innerHTML = `<span class="works__year">${year}</span><span class="works__work-title h1">${title}</span><span class="works__type">${type}</span>`;

        const ghost = document.createElement('span');
        ghost.className = 'link-flip__ghost';
        ghost.innerHTML = `<span class="works__year">${year}</span><span class="works__work-title h1">${title}</span><span class="works__type">${type}</span>`;

        a.appendChild(front);
        a.appendChild(back);
        a.appendChild(ghost);

        a.addEventListener('mouseenter', () => {
            if (previewEl && work.media && work.media.src) {
                previewEl.innerHTML = '';
                if (work.media.type === 'video') {
                    const video = document.createElement('video');
                    video.src = work.media.src;
                    video.autoplay = true;
                    video.loop = true;
                    video.muted = true;
                    video.setAttribute('muted', '');
                    video.playsInline = true;
                    previewEl.appendChild(video);
                } else {
                    const img = document.createElement('img');
                    img.src = work.media.src;
                    img.alt = work.media.alt || title;
                    previewEl.appendChild(img);
                }
                previewEl.classList.add('is-visible');
            }
        });

        a.addEventListener('mouseleave', () => {
            if (previewEl) {
                previewEl.classList.remove('is-visible');
            }
        });

        return a;
    };

    data.forEach((work) => {
        worksEl.appendChild(renderRow(work));
    });

    // Без IntersectionObserver — строки должны появиться сразу после SPA-навигации
    if (typeof animateElements === 'function') {
        const rows = Array.from(worksEl.querySelectorAll('.works__row'));
        animateElements(rows, 50, false);
    }

    initArchive();
};

const shuffleArray = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};

const initArchive = () => {
    const archiveEl = document.querySelector('.works__archive');
    if (!archiveEl) return;

    const raw = Array.isArray(window.ARCHIVE) ? window.ARCHIVE : [];
    if (raw.length === 0) return;

    const data = shuffleArray(raw);
    const columns = [[], [], []];
    data.forEach((item) => {
        const shortest = columns.reduce((best, col, i) => (col.length < best.length ? col : best), columns[0]);
        shortest.push(item);
    });

    columns.forEach((colItems) => {
        const col = document.createElement('div');
        col.className = 'works__archive-column';
        colItems.forEach((item) => {
            const cell = document.createElement('div');
            cell.className = 'works__archive-cell';
            if (item.type === 'video') {
                const video = document.createElement('video');
                video.src = item.src;
                video.muted = true;
                video.setAttribute('muted', '');
                video.autoplay = true;
                video.loop = true;
                video.playsInline = true;
                video.setAttribute('preload', 'auto');
                cell.appendChild(video);
            } else {
                const img = document.createElement('img');
                img.src = item.src;
                img.alt = '';
                img.loading = 'lazy';
                cell.appendChild(img);
            }
            col.appendChild(cell);
        });
        archiveEl.appendChild(col);
    });

    // Анимация появления карточек архива только при появлении во вьюпорте (IntersectionObserver в animateElements), без fallback
    const archiveCells = Array.from(archiveEl.querySelectorAll('.works__archive-cell'));
    if (typeof animateElements === 'function') {
        animateElements(archiveCells, 50, true);
    }
};

window.initWorks = initWorks;
const runWorksInit = () => {
    if (document.body.getAttribute('data-page') !== 'works') return;
    if (!document.querySelector('.works')) return;
    initWorks();
    if (typeof animateElements === 'function') {
        const title = document.querySelector('.works__title');
        if (title) animateElements([title], 0);
    }
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runWorksInit);
} else {
    runWorksInit();
}
