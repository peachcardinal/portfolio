const SCROLL_RESTORE_KEY = 'scrollRestore';

const initScrollRestore = () => {
    try {
        const saved = sessionStorage.getItem(SCROLL_RESTORE_KEY);
        if (saved) {
            const { url, scrollY } = JSON.parse(saved);
            sessionStorage.removeItem(SCROLL_RESTORE_KEY);
            if (url === location.href && typeof scrollY === 'number' && scrollY > 0) {
                setTimeout(() => {
                    window.scrollTo(0, scrollY);
                }, 0);
            }
        }
    } catch (e) {
        sessionStorage.removeItem(SCROLL_RESTORE_KEY);
    }
};

const saveScrollPosition = () => {
    try {
        sessionStorage.setItem(SCROLL_RESTORE_KEY, JSON.stringify({
            url: location.href,
            scrollY: window.scrollY || window.pageYOffset
        }));
    } catch (e) {}
};

window.addEventListener('beforeunload', saveScrollPosition);

const initNav = () => {
    const path = window.location.pathname || '';
    let page = document.body.dataset.page;
    if (path.includes('work.html') || path.includes('slug=')) {
        page = 'work';
    } else if (path.endsWith('/works') || path.includes('/works') || path.endsWith('works.html')) {
        page = 'works';
    } else if (path.endsWith('/books') || path.includes('/books') || path.endsWith('books.html')) {
        page = 'books';
    } else if (path.endsWith('/projects') || path.includes('/projects') || path.endsWith('projects.html')) {
        page = 'projects';
    } else if (path.endsWith('/about') || path.includes('/about') || path.endsWith('about.html')) {
        page = 'about';
    } else if (!page) {
        if (path.endsWith('/') || path.endsWith('index.html') || path === '' || path === '/') {
            page = 'index';
        }
    }
    if (!page) return;

    const navLinks = document.querySelectorAll('.header__nav a');
    const hash = window.location.hash;

    navLinks.forEach((link) => {
        const href = link.getAttribute('href') || '';
        let isActive = false;

        if (page === 'works') {
            isActive = href.includes('works');
        } else if (page === 'projects') {
            isActive = href.includes('projects');
        } else if (page === 'about') {
            isActive = href.includes('about');
        } else if (page === 'index') {
            if (hash === '#about') {
                isActive = href.includes('#about');
            } else {
                isActive = href === 'index.html' || href === '/' || (href.startsWith('index') && !href.includes('works'));
            }
        }

        if (isActive) link.classList.add('is-active');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    initScrollRestore();
    initNav();
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = '© ' + new Date().getFullYear();
});
