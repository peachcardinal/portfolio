const WORKS_VIEW_KEY = 'worksView';

const buildWorkHref = (work) => {
    const link = work.link || '#';
    if (link === '#' || link.startsWith('http://') || link.startsWith('https://') || link.startsWith('/')) {
        return link;
    }
    return '/' + link.replace(/^\//, '');
};

const buildMediaSrc = (src) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('/')) {
        return src;
    }
    return '/' + src.replace(/^\//, '');
};

const createWorkMedia = (work, title) => {
    if (!work.media || !work.media.src) return null;
    const src = buildMediaSrc(work.media.src);
    if (work.media.type === 'video') {
        const video = document.createElement('video');
        video.src = src;
        video.muted = true;
        video.setAttribute('muted', '');
        video.autoplay = true;
        video.loop = true;
        video.playsInline = true;
        video.setAttribute('preload', 'auto');
        video.setAttribute('aria-hidden', 'true');
        return video;
    }
    const img = document.createElement('img');
    img.src = src;
    img.alt = work.media.alt || title;
    img.loading = 'lazy';
    return img;
};

const renderListRow = (work, previewEl) => {
    const a = document.createElement('a');
    a.className = 'works__row link link-flip';
    a.href = buildWorkHref(work);
    if (work.link && work.link !== '#' && (work.link.startsWith('http://') || work.link.startsWith('https://'))) {
        a.target = '_blank';
        a.rel = 'noopener';
    }

    const year = work.year || '';
    const title = work.title || 'Work';
    const type = work.type || '';
    const rowHtml = `<span class="works__year">${year}</span><span class="works__work-title h1">${title}</span><span class="works__type">${type}</span>`;

    const front = document.createElement('span');
    front.className = 'link-flip__front';
    front.innerHTML = rowHtml;

    const back = document.createElement('span');
    back.className = 'link-flip__back';
    back.innerHTML = rowHtml;

    const ghost = document.createElement('span');
    ghost.className = 'link-flip__ghost';
    ghost.innerHTML = rowHtml;

    a.appendChild(front);
    a.appendChild(back);
    a.appendChild(ghost);

    if (previewEl) {
        a.addEventListener('mouseenter', () => {
            if (!work.media || !work.media.src) return;
            previewEl.innerHTML = '';
            const media = createWorkMedia(work, title);
            if (media) previewEl.appendChild(media);
            previewEl.classList.add('is-visible');
        });

        a.addEventListener('mouseleave', () => {
            previewEl.classList.remove('is-visible');
        });
    }

    return a;
};

const renderGridCard = (work) => {
    const a = document.createElement('a');
    a.className = 'works__card link';
    a.href = buildWorkHref(work);
    if (work.link && work.link !== '#' && (work.link.startsWith('http://') || work.link.startsWith('https://'))) {
        a.target = '_blank';
        a.rel = 'noopener';
    }

    const title = work.title || 'Work';
    const year = work.year || '';
    const type = work.type || '';

    const mediaWrap = document.createElement('div');
    mediaWrap.className = 'works__card-media';
    const media = createWorkMedia(work, title);
    if (media) mediaWrap.appendChild(media);
    const explore = document.createElement('span');
    explore.className = 'works__card-explore';
    explore.textContent = 'Explore';
    explore.setAttribute('aria-hidden', 'true');
    mediaWrap.appendChild(explore);
    a.appendChild(mediaWrap);

    const meta = document.createElement('div');
    meta.className = 'works__card-meta';

    const titleEl = document.createElement('h2');
    titleEl.className = 'works__card-title';
    const titleFlip = document.createElement('span');
    titleFlip.className = 'link link-flip works__card-title-flip';
    titleFlip.setAttribute('data-text', title);
    ['front', 'back', 'ghost'].forEach((layer) => {
        const span = document.createElement('span');
        span.className = `link-flip__${layer}`;
        span.textContent = title;
        titleFlip.appendChild(span);
    });
    titleEl.appendChild(titleFlip);

    const footer = document.createElement('div');
    footer.className = 'works__card-footer';
    const yearEl = document.createElement('span');
    yearEl.className = 'works__year';
    yearEl.textContent = year;
    const typeEl = document.createElement('span');
    typeEl.className = 'works__type';
    typeEl.textContent = type;
    footer.appendChild(yearEl);
    footer.appendChild(typeEl);

    meta.appendChild(titleEl);
    meta.appendChild(footer);
    a.appendChild(meta);

    return a;
};

const getWorksView = () => {
    const saved = localStorage.getItem(WORKS_VIEW_KEY);
    return saved === 'grid' ? 'grid' : 'list';
};

const setWorksView = (view) => {
    const worksEl = document.querySelector('.works');
    const toggleEl = document.querySelector('.works__view-toggle');
    if (!worksEl) return;

    const nextView = view === 'grid' ? 'grid' : 'list';
    localStorage.setItem(WORKS_VIEW_KEY, nextView);

    worksEl.classList.remove('works--list', 'works--grid');
    worksEl.classList.add(nextView === 'grid' ? 'works--grid' : 'works--list');
    worksEl.setAttribute('data-view', nextView);
    document.body.setAttribute('data-works-view', nextView);

    if (toggleEl) {
        toggleEl.querySelectorAll('.works__view-btn').forEach((btn) => {
            const isActive = btn.getAttribute('data-view') === nextView;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    const data = Array.isArray(window.WORKS) ? window.WORKS : [];
    const previewEl = nextView === 'list' ? document.querySelector('.works__preview') : null;
    worksEl.innerHTML = '';

    data.forEach((work) => {
        worksEl.appendChild(nextView === 'grid' ? renderGridCard(work) : renderListRow(work, previewEl));
    });

    if (typeof animateElements === 'function') {
        const items = Array.from(worksEl.querySelectorAll('.works__row, .works__card'));
        animateElements(items, 50, false);
    }
};

const initWorksViewToggle = () => {
    const toggleEl = document.querySelector('.works__view-toggle');
    if (!toggleEl || toggleEl.dataset.bound === 'true') return;
    toggleEl.dataset.bound = 'true';
    toggleEl.addEventListener('click', (e) => {
        const btn = e.target.closest('.works__view-btn');
        if (!btn) return;
        const view = btn.getAttribute('data-view');
        if (!view || btn.classList.contains('is-active')) return;
        setWorksView(view);
    });
};

const initWorks = () => {
    const worksEl = document.querySelector('.works');
    if (!worksEl) return;

    initWorksViewToggle();
    setWorksView(getWorksView());
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
