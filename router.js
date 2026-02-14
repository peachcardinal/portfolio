(function() {
    'use strict';

    const FADE_DURATION = 300;
    let isNavigating = false;

    // Проверка, должна ли ссылка обрабатываться через SPA
    const shouldIntercept = (link) => {
        if (!link || !link.href) return false;
        
        const href = link.getAttribute('href');
        if (!href || href === '#') return false;
        
        // Не перехватывать внешние ссылки
        if (link.target === '_blank') return false;
        if (href.startsWith('mailto:')) return false;
        if (href.startsWith('http://') || href.startsWith('https://')) {
            try {
                const linkUrl = new URL(href);
                const currentUrl = new URL(window.location.href);
                if (linkUrl.origin !== currentUrl.origin) return false;
            } catch (e) {
                return false;
            }
        }
        
        // Не перехватывать если есть data-no-spa
        if (link.hasAttribute('data-no-spa')) return false;
        
        return true;
    };

    // Извлечение контента из HTML
    const extractContent = (html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const main = doc.querySelector('main');
        const footer = doc.querySelector('footer.footer') || doc.querySelector('.footer');
        const title = doc.querySelector('title');
        const description = doc.querySelector('meta[name="description"]');
        const canonical = doc.querySelector('link[rel="canonical"]');
        const ogTitle = doc.querySelector('meta[property="og:title"]');
        const ogDescription = doc.querySelector('meta[property="og:description"]');
        const ogImage = doc.querySelector('meta[property="og:image"]');
        const ogType = doc.querySelector('meta[property="og:type"]');
        const body = doc.querySelector('body');
        const dataPage = body ? body.getAttribute('data-page') : null;
        
        return {
            main: main ? main.innerHTML : '',
            footer: footer ? footer.outerHTML : '',
            title: title ? title.textContent : '',
            description: description ? description.getAttribute('content') : '',
            canonical: canonical ? canonical.getAttribute('href') : '',
            ogTitle: ogTitle ? ogTitle.getAttribute('content') : '',
            ogDescription: ogDescription ? ogDescription.getAttribute('content') : '',
            ogImage: ogImage ? ogImage.getAttribute('content') : '',
            ogType: ogType ? ogType.getAttribute('content') : '',
            dataPage: dataPage
        };
    };

    // Обновление мета-тегов
    const updateMeta = (title, description, canonical, ogTitle, ogDescription, ogImage, ogType) => {
        if (title) {
            document.title = title;
        }
        
        if (description) {
            let descEl = document.querySelector('meta[name="description"]');
            if (!descEl) {
                descEl = document.createElement('meta');
                descEl.setAttribute('name', 'description');
                document.head.appendChild(descEl);
            }
            descEl.setAttribute('content', description);
        }
        
        if (canonical) {
            let canonicalEl = document.querySelector('link[rel="canonical"]');
            if (!canonicalEl) {
                canonicalEl = document.createElement('link');
                canonicalEl.setAttribute('rel', 'canonical');
                document.head.appendChild(canonicalEl);
            }
            canonicalEl.setAttribute('href', canonical);
        }
        
        // Обновление OG тегов
        if (ogTitle) {
            let ogTitleEl = document.querySelector('meta[property="og:title"]');
            if (!ogTitleEl) {
                ogTitleEl = document.createElement('meta');
                ogTitleEl.setAttribute('property', 'og:title');
                document.head.appendChild(ogTitleEl);
            }
            ogTitleEl.setAttribute('content', ogTitle);
        }
        
        if (ogDescription) {
            let ogDescEl = document.querySelector('meta[property="og:description"]');
            if (!ogDescEl) {
                ogDescEl = document.createElement('meta');
                ogDescEl.setAttribute('property', 'og:description');
                document.head.appendChild(ogDescEl);
            }
            ogDescEl.setAttribute('content', ogDescription);
        }
        
        if (ogImage) {
            let ogImageEl = document.querySelector('meta[property="og:image"]');
            if (!ogImageEl) {
                ogImageEl = document.createElement('meta');
                ogImageEl.setAttribute('property', 'og:image');
                document.head.appendChild(ogImageEl);
            }
            ogImageEl.setAttribute('content', ogImage);
        }
        
        if (ogType) {
            let ogTypeEl = document.querySelector('meta[property="og:type"]');
            if (!ogTypeEl) {
                ogTypeEl = document.createElement('meta');
                ogTypeEl.setAttribute('property', 'og:type');
                document.head.appendChild(ogTypeEl);
            }
            ogTypeEl.setAttribute('content', ogType);
        }
    };

    // Обновление активного состояния навигации
    const updateActiveNav = (dataPage) => {
        const navLinks = document.querySelectorAll('.header__nav a');
        navLinks.forEach((link) => {
            link.classList.remove('is-active');
            
            const href = link.getAttribute('href') || '';
            let isActive = false;
            
            if (dataPage === 'works') {
                isActive = href.includes('works');
            } else if (dataPage === 'projects') {
                isActive = href.includes('projects');
            } else if (dataPage === 'about') {
                isActive = href.includes('about');
            } else if (dataPage === 'index') {
                if (window.location.hash === '#about') {
                    isActive = href.includes('#about');
                } else {
                    isActive = href === 'index.html' || href === '/' || (href.startsWith('index') && !href.includes('works'));
                }
            }
            // На странице работы (dataPage === 'work') ссылку Works не помечаем активной — без зачёркивания
            
            if (isActive) {
                link.classList.add('is-active');
            }
        });
    };

    // Переинициализация скриптов для новой страницы
    const reinitScripts = (dataPage) => {
        if (typeof window.initNav === 'function') {
            window.initNav();
        }
        // Скрываем превью картинки работ при переходе на любую страницу, кроме списка works
        // (превью используется только на странице списка работ)
        if (dataPage !== 'works') {
            const previewEl = document.querySelector('.works__preview');
            if (previewEl) {
                previewEl.classList.remove('is-visible');
                previewEl.innerHTML = '';
            }
        }
        if (dataPage === 'work') {
            if (typeof window.initWorkPage === 'function') {
                window.initWorkPage();
            }
        } else if (dataPage === 'works') {
            const worksEl = document.querySelector('.works');
            const archiveEl = document.querySelector('.works__archive');
            if (worksEl) worksEl.innerHTML = '';
            if (archiveEl) archiveEl.innerHTML = '';
            if (typeof window.initWorks === 'function') {
                window.initWorks();
            }
        } else if (dataPage === 'projects') {
            const gridEl = document.querySelector('.projects__grid');
            if (gridEl) gridEl.innerHTML = '';
            // Если initProjectsGrid недоступна (скрипт не загружен), создаем функцию inline
            if (typeof window.initProjectsGrid === 'function') {
                window.initProjectsGrid();
            } else if (gridEl && Array.isArray(window.PROJECTS_GRID)) {
                // Fallback: создаем карточки напрямую, если projects-grid.js не загружен
                const data = window.PROJECTS_GRID;
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
                if (typeof animateElements === 'function') {
                    const cards = Array.from(gridEl.querySelectorAll('.projects__card'));
                    animateElements(cards, 50, true);
                    const title = document.querySelector('.projects__title');
                    if (title) animateElements([title], 0);
                }
            }
        } else if (dataPage === 'index') {
            if (typeof window.initCarousel === 'function') {
                window.initCarousel();
            }
        } else if (dataPage === 'books') {
            const listEl = document.querySelector('.books__list');
            if (listEl) listEl.innerHTML = '';
            if (typeof window.initBooks === 'function') {
                window.initBooks();
            }
        } else if (dataPage === 'about') {
            if (typeof window.animateElements === 'function') {
                setTimeout(() => {
                    const elementsToAnimate = [];
                    const title = document.querySelector('.about-page__title');
                    if (title) elementsToAnimate.push(title);
                    const intro = document.querySelector('.about-page__intro');
                    if (intro) elementsToAnimate.push(intro);
                    const tags = Array.from(document.querySelectorAll('.about-page__tag'));
                    elementsToAnimate.push(...tags);
                    const columnsBlock = document.querySelector('.about-page__columns');
                    if (columnsBlock) elementsToAnimate.push(columnsBlock);
                    const careerHeader = document.querySelector('.about-page__career-row--header');
                    if (careerHeader) elementsToAnimate.push(careerHeader);
                    const careerRows = Array.from(document.querySelectorAll('.about-page__career-row:not(.about-page__career-row--header)'));
                    elementsToAnimate.push(...careerRows);
                    const cvBtn = document.querySelector('.about-page__cv-btn');
                    if (cvBtn) elementsToAnimate.push(cvBtn);
                    window.animateElements(elementsToAnimate, 50, true);
                }, FADE_DURATION);
            }
        }
        updateActiveNav(dataPage);
    };

    // Нормализация URL - преобразование относительного пути в абсолютный
    const normalizeUrl = (url) => {
        try {
            // Если это уже абсолютный URL, возвращаем как есть
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            // Если путь начинается с /, он уже абсолютный относительно корня
            if (url.startsWith('/')) {
                return url;
            }
            
            // Для относительных путей:
            // - Если путь содержит точку (например, "about.html", "works.html") - разрешаем относительно корня сайта
            //   (это файлы, которые должны быть в корне, а не относительно текущего пути)
            // - Если путь без точки (например, "overlay" - slug для Prev/Next) - разрешаем относительно текущего пути
            const containsDot = url.includes('.');
            const baseUrl = containsDot 
                ? new URL(window.location.origin)  // Относительно корня для файлов
                : new URL(window.location.href);    // Относительно текущего пути для slug'ов
            const resolvedUrl = new URL(url, baseUrl);
            
            // Возвращаем pathname + search + hash
            return resolvedUrl.pathname + resolvedUrl.search + resolvedUrl.hash;
        } catch (e) {
            // Если ошибка парсинга, возвращаем исходный URL
            return url;
        }
    };

    const navigate = async (url, pushState = true) => {
        if (isNavigating) return;
        try {
            isNavigating = true;
            const normalizedUrl = normalizeUrl(url);
            
            // Проверяем, не переходим ли мы на ту же страницу (без учета hash для обычных переходов)
            const currentPath = window.location.pathname + window.location.search;
            const normalizedPath = normalizedUrl.split('#')[0];
            if (normalizedPath === currentPath && pushState && !normalizedUrl.includes('#')) {
                isNavigating = false;
                return;
            }
            
            const main = document.querySelector('main');
            // Для .../works/<slug> запрашиваем шаблон work/index.html?slug=... (без новых сущностей на сервере)
            const workMatch = normalizedPath.match(/\/works\/([^/]+)$/);
            let fetchUrl = normalizedUrl;
            if (workMatch) {
                const slug = workMatch[1];
                const pathBase = normalizedPath.replace(/\/works\/[^/]+$/, '');
                fetchUrl = (pathBase ? pathBase + '/' : '/') + 'work/index.html?slug=' + encodeURIComponent(slug);
            } else if (!normalizedPath.includes('.')) {
                // Пути без .html (/books, /works, /about, /projects) — запрашиваем соответствующий .html файл
                const segment = normalizedPath.replace(/^\/|\/$/g, '') || 'index';
                if (segment === 'index') {
                    fetchUrl = '/index.html';
                } else {
                    fetchUrl = '/' + segment + '.html';
                }
            }
            
            const response = await fetch(fetchUrl, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const content = extractContent(html);
            if (!content.main) {
                throw new Error('No main content found');
            }
            
            // Обновление URL
            if (pushState) {
                window.history.pushState({ url: normalizedUrl }, '', normalizedUrl);
            }
            
            // Обновление мета-тегов
            updateMeta(content.title, content.description, content.canonical, content.ogTitle, content.ogDescription, content.ogImage, content.ogType);
            
            // Обновление data-page атрибута
            if (content.dataPage) {
                document.body.setAttribute('data-page', content.dataPage);
            }
            
            if (main) {
                main.innerHTML = content.main;
                // About: сразу скрываем элементы анимации, чтобы не было «появилось — исчезло — появилось с фейдом»
                if (content.dataPage === 'about') {
                    const aboutAnimated = main.querySelectorAll('.about-page__title, .about-page__intro, .about-page__tag, .about-page__columns, .about-page__career-row--header, .about-page__career-row:not(.about-page__career-row--header), .about-page__cv-btn');
                    aboutAnimated.forEach((el) => el.classList.add('fade-in-up'));
                }
                // Порядок отрисовки: заголовок (уже в документе) → контент → футер.
                // Сразу переинициализируем контент (карусель, карточки, медиа, список, архив),
                // чтобы блоки успели отрисоваться до вставки футера.
                if (content.dataPage != null && content.dataPage !== '') {
                    reinitScripts(content.dataPage);
                }
            }
            
            // Сброс прокрутки: окно и на мобиле — контейнер .viewport-scroll
            const scrollToTop = () => {
                window.scrollTo(0, 0);
                if (document.documentElement.scrollTop !== 0) document.documentElement.scrollTop = 0;
                if (document.body.scrollTop !== 0) document.body.scrollTop = 0;
                const scrollEl = document.querySelector('.viewport-scroll');
                if (scrollEl && scrollEl.scrollTop !== 0) scrollEl.scrollTop = 0;
            };
            scrollToTop();
            
            // Футер — после контента, в следующем тике, чтобы не трогать main
            setTimeout(() => {
                // Для страницы работы дополнительно сбрасываем прокрутку после инициализации контента
                // (на случай, если контент изменил высоту страницы и позицию скролла)
                if (content.dataPage === 'work') {
                    scrollToTop();
                }
                const existingFooter = document.querySelector('footer.footer') || document.querySelector('.footer');
                if (content.footer) {
                    if (existingFooter) {
                        existingFooter.outerHTML = content.footer;
                    } else {
                        const scrollEl = document.querySelector('.viewport-scroll');
                        const previewEl = scrollEl && scrollEl.querySelector('.works__preview');
                        if (scrollEl) {
                            if (previewEl) {
                                previewEl.insertAdjacentHTML('beforebegin', content.footer);
                            } else {
                                scrollEl.insertAdjacentHTML('beforeend', content.footer);
                            }
                        } else {
                            const firstScript = document.body.querySelector('script');
                            if (firstScript) {
                                firstScript.insertAdjacentHTML('beforebegin', content.footer);
                            } else {
                                document.body.insertAdjacentHTML('beforeend', content.footer);
                            }
                        }
                    }
                    const footerYear = document.getElementById('footer-year');
                    if (footerYear) footerYear.textContent = '© ' + new Date().getFullYear();
                } else if (existingFooter) {
                    existingFooter.remove();
                }
            }, 0);
            
        } catch (error) {
            console.error('Navigation error:', error);
            // Fallback на обычную навигацию
            window.location.href = url;
        } finally {
            isNavigating = false;
        }
    };

    // Инициализация роутера
    const initRouter = () => {
        if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        // Перехват кликов по ссылкам
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (!link || !shouldIntercept(link)) return;
            
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href) {
                navigate(href);
            }
        });
        
        // Обработка кнопок назад/вперед браузера
        window.addEventListener('popstate', (e) => {
            const url = window.location.pathname + window.location.search + window.location.hash;
            navigate(url, false);
        });
        
        // Перехват динамически созданных ссылок (делегирование событий)
        // Это уже обрабатывается через document.addEventListener('click')
    };

    // Инициализация при загрузке DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initRouter);
    } else {
        initRouter();
    }

    // #region agent log
    function logLayout() {
        var footer = document.querySelector('.footer');
        var scrollEl = document.querySelector('.viewport-scroll');
        var main = document.querySelector('main');
        var getPos = function(el) {
            if (!el) return null;
            var s = window.getComputedStyle(el);
            var r = el.getBoundingClientRect();
            return { position: s.position, top: r.top, left: r.left, height: r.height, width: r.width, parent: el.parentElement && el.parentElement.className };
        };
        fetch('http://127.0.0.1:7242/ingest/00680b59-54e9-4962-bb41-b1cc2a630e6c', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'router.js:logLayout', message: 'layout', data: { footer: getPos(footer), viewportScroll: scrollEl ? { rect: scrollEl.getBoundingClientRect(), scrollHeight: scrollEl.scrollHeight, scrollTop: scrollEl.scrollTop, display: window.getComputedStyle(scrollEl).display } : null, main: main ? { rect: main.getBoundingClientRect(), offsetHeight: main.offsetHeight, flexGrow: window.getComputedStyle(main).flexGrow } : null, innerWidth: window.innerWidth }, timestamp: Date.now(), hypothesisId: 'H1' }) }).catch(function() {});
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() { setTimeout(logLayout, 100); });
    } else {
        setTimeout(logLayout, 100);
    }
    // #endregion

})();
