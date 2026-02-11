/**
 * Анимирует элементы последовательно с задержкой между ними
 * Использует IntersectionObserver для анимации только видимых элементов
 * @param {string|NodeList|Array} selector - CSS селектор, NodeList или массив элементов
 * @param {number} delay - Задержка между элементами в миллисекундах (по умолчанию 50ms)
 * @param {boolean} useObserver - Использовать IntersectionObserver (по умолчанию true)
 */
const animateElements = (selector, delay = 50, useObserver = true) => {
    let elements;
    
    // Получаем элементы в зависимости от типа входных данных
    if (typeof selector === 'string') {
        elements = Array.from(document.querySelectorAll(selector));
    } else if (selector instanceof NodeList) {
        elements = Array.from(selector);
    } else if (Array.isArray(selector)) {
        elements = selector;
    } else {
        console.warn('animateElements: неверный тип селектора');
        return;
    }
    
    if (elements.length === 0) return;
    
    // Применяем начальный класс ко всем элементам
    elements.forEach((el, idx) => {
        if (el && el.nodeType === 1) { // Проверяем, что это DOM элемент
            el.classList.add('fade-in-up');
            // #region agent log
            const isSulliwanCol = el.textContent && el.textContent.includes('Sulliwan Studio');
            const isCareerHeader = el.classList.contains('about-page__career-row--header');
            if (isSulliwanCol || isCareerHeader) {
                fetch('http://127.0.0.1:7242/ingest/00680b59-54e9-4962-bb41-b1cc2a630e6c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'animations.js:28',message:'Applied fade-in-up class',data:{index:idx,isSulliwanCol,isCareerHeader,hasFadeInUp:el.classList.contains('fade-in-up'),textPreview:el.textContent?.substring(0,40)},timestamp:Date.now(),runId:'debug',hypothesisId:'B'})}).catch(()=>{});
            }
            // #endregion
        }
    });
    
    if (useObserver && 'IntersectionObserver' in window) {
        // Используем IntersectionObserver для анимации только видимых элементов
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const animatedElements = new Set();
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !animatedElements.has(entry.target)) {
                    animatedElements.add(entry.target);
                    // Используем индекс элемента в DOM-порядке, а не порядок срабатывания observer
                    const elementIndex = elements.indexOf(entry.target);
                    const animDelay = elementIndex >= 0 ? elementIndex * delay : 0;
                    const isSulliwanCol = entry.target.textContent && entry.target.textContent.includes('Sulliwan Studio');
                    const isCareerHeader = entry.target.classList.contains('about-page__career-row--header');
                    // #region agent log
                    if (isSulliwanCol || isCareerHeader) {
                        fetch('http://127.0.0.1:7242/ingest/00680b59-54e9-4962-bb41-b1cc2a630e6c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'animations.js:47',message:'IntersectionObserver triggered',data:{isSulliwanCol,isCareerHeader,elementIndex,animDelay,isIntersecting:entry.isIntersecting,intersectionRatio:entry.intersectionRatio},timestamp:Date.now(),runId:'post-fix',hypothesisId:'C'})}).catch(()=>{});
                    }
                    // #endregion
                    setTimeout(() => {
                        entry.target.classList.add('is-visible');
                        // Удаляем fade-in-up после завершения анимации, чтобы hover transition работал
                        entry.target.addEventListener('animationend', () => {
                            entry.target.classList.remove('fade-in-up');
                        }, { once: true });
                        // #region agent log
                        if (isSulliwanCol || isCareerHeader) {
                            fetch('http://127.0.0.1:7242/ingest/00680b59-54e9-4962-bb41-b1cc2a630e6c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'animations.js:49',message:'Added is-visible class',data:{isSulliwanCol,isCareerHeader,elementIndex,hasIsVisible:entry.target.classList.contains('is-visible')},timestamp:Date.now(),runId:'post-fix',hypothesisId:'D'})}).catch(()=>{});
                        }
                        // #endregion
                    }, animDelay);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        // Наблюдаем за всеми элементами
        elements.forEach((el) => {
            if (el && el.nodeType === 1) {
                observer.observe(el);
            }
        });
    } else {
        // Fallback: анимируем все элементы сразу без observer
        elements.forEach((el, index) => {
            if (el && el.nodeType === 1) {
                setTimeout(() => {
                    el.classList.add('is-visible');
                }, index * delay);
            }
        });
    }
};

window.animateElements = animateElements;
