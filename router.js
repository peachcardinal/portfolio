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
            } else if (dataPage === 'work') {
                // Для страниц работ активна ссылка на works
                isActive = href.includes('works');
            }
            
            if (isActive) {
                link.classList.add('is-active');
            }
        });
    };

    // Переинициализация скриптов для новой страницы
    const reinitScripts = (dataPage) => {
        // Всегда обновляем навигацию
        if (typeof initNav === 'function') {
            initNav();
        }
        
        // Переинициализация в зависимости от страницы
        if (dataPage === 'work') {
            if (typeof initWorkPage === 'function') {
                initWorkPage();
            }
        } else if (dataPage === 'works') {
            if (typeof initWorks === 'function') {
                // Очищаем существующий контент перед переинициализацией
                const worksEl = document.querySelector('.works');
                if (worksEl) worksEl.innerHTML = '';
                const archiveEl = document.querySelector('.works__archive');
                if (archiveEl) archiveEl.innerHTML = '';
                initWorks();
            }
        } else if (dataPage === 'projects') {
            if (typeof initProjectsGrid === 'function') {
                const gridEl = document.querySelector('.projects__grid');
                if (gridEl) gridEl.innerHTML = '';
                initProjectsGrid();
            }
        } else if (dataPage === 'index') {
            if (typeof initCarousel === 'function') {
                // Карусель может требовать полной переинициализации
                initCarousel();
            }
        } else if (dataPage === 'books') {
            if (typeof initBooks === 'function') {
                const listEl = document.querySelector('.books__list');
                if (listEl) listEl.innerHTML = '';
                initBooks();
            }
        } else if (dataPage === 'about') {
            // Для about страницы нужно запустить анимацию элементов
            if (typeof animateElements === 'function') {
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
                    
                    animateElements(elementsToAnimate, 50, true);
                }, FADE_DURATION);
            }
        }
        
        // Обновляем активное состояние навигации
        updateActiveNav(dataPage);
    };

    // Нормализация URL - преобразование относительного пути в абсолютный
    const normalizeUrl = (url) => {
        try {
            // Если это уже абсолютный URL, возвращаем как есть
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            
            // Создаем абсолютный URL относительно текущего location
            const baseUrl = new URL(window.location.href);
            const resolvedUrl = new URL(url, baseUrl);
            
            // Возвращаем pathname + search + hash
            return resolvedUrl.pathname + resolvedUrl.search + resolvedUrl.hash;
        } catch (e) {
            // Если ошибка парсинга, возвращаем исходный URL
            return url;
        }
    };

    // Основная функция навигации
    const navigate = async (url, pushState = true) => {
        if (isNavigating) return;
        
        try {
            isNavigating = true;
            
            // Нормализуем URL
            const normalizedUrl = normalizeUrl(url);
            
            // Проверяем, не переходим ли мы на ту же страницу (без учета hash для обычных переходов)
            const currentPath = window.location.pathname + window.location.search;
            const normalizedPath = normalizedUrl.split('#')[0];
            if (normalizedPath === currentPath && pushState && !normalizedUrl.includes('#')) {
                isNavigating = false;
                return;
            }
            
            // Fade out текущего контента
            const main = document.querySelector('main');
            if (main) {
                main.classList.add('fade-out');
                await new Promise(resolve => setTimeout(resolve, FADE_DURATION));
            }
            
            // Загрузка нового контента
            const response = await fetch(normalizedUrl, {
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
            
            // Обновление контента
            if (main) {
                main.innerHTML = content.main;
                main.classList.remove('fade-out');
                main.classList.add('fade-in');
                
                // Удаляем класс fade-in после завершения анимации
                setTimeout(() => {
                    main.classList.remove('fade-in');
                }, FADE_DURATION);
            }
            
            // Прокрутка вверх
            window.scrollTo(0, 0);
            
            // Переинициализация скриптов
            reinitScripts(content.dataPage);
            
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

})();
