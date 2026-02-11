const initNav = () => {
    const path = window.location.pathname || '';
    let page = document.body.dataset.page;
    if (path.match(/\/work\/[^/]+/)) {
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

const initMailCopy = () => {
    const mailLink = document.querySelector('.header__mail');
    if (!mailLink || mailLink.dataset.mailCopyDone) return;
    mailLink.dataset.mailCopyDone = '1';
    const email = mailLink.getAttribute('data-email') || (mailLink.getAttribute('href') || '').replace('mailto:', '').trim() || '';
    if (!email) return;
    let resetTimer = null;
    const originalText = 'Mail';
    const showCopied = () => {
        const front = mailLink.querySelector('.link-flip__front');
        const back = mailLink.querySelector('.link-flip__back');
        const ghost = mailLink.querySelector('.link-flip__ghost');
        if (front) front.textContent = 'Copied';
        if (back) back.textContent = 'Copied';
        if (ghost) ghost.textContent = 'Copied';
        if (resetTimer) clearTimeout(resetTimer);
        resetTimer = setTimeout(() => {
            if (front) front.textContent = originalText;
            if (back) back.textContent = originalText;
            if (ghost) ghost.textContent = originalText;
            resetTimer = null;
        }, 2000);
    };
    mailLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(email).then(showCopied).catch(showCopied);
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = email;
            textarea.setAttribute('readonly', '');
            textarea.style.position = 'absolute';
            textarea.style.left = '-9999px';
            document.body.appendChild(textarea);
            textarea.select();
            try {
                document.execCommand('copy');
            } catch (err) {}
            document.body.removeChild(textarea);
            showCopied();
        }
    });
};

window.initNav = initNav;
window.initMailCopy = initMailCopy;
document.addEventListener('DOMContentLoaded', () => {
    initNav();
    initMailCopy();
    const footerYear = document.getElementById('footer-year');
    if (footerYear) footerYear.textContent = '© ' + new Date().getFullYear();
});
