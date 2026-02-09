const initCarousel = () => {
    const track = document.querySelector('.carousel__track');
    const viewport = document.querySelector('.carousel__viewport');

    if (!track) {
        return;
    }

    const buildCards = () => {
        const data = Array.isArray(window.WORKS) ? window.WORKS : [];
        track.innerHTML = '';

        data.forEach((work) => {
            const li = document.createElement('li');

            const card = document.createElement('a');
            card.className = 'card';
            card.href = work.link || '#';
            if (work.link && work.link !== '#' && (work.link.startsWith('http://') || work.link.startsWith('https://'))) {
                card.target = '_blank';
                card.rel = 'noopener';
            }

            const box = document.createElement('div');
            box.className = 'card__box';

            const media = document.createElement('div');
            media.className = 'card__media';

            if (work.media && work.media.type === 'video' && work.media.src) {
                const video = document.createElement('video');
                video.src = work.media.src;
                video.autoplay = true;
                video.loop = true;
                video.muted = true;
                video.setAttribute('muted', '');
                video.playsInline = true;
                video.setAttribute('aria-label', work.media.alt || work.title || 'Work video');
                media.appendChild(video);
            } else if (work.media && work.media.type === 'image' && work.media.src) {
                const img = document.createElement('img');
                img.src = work.media.src;
                img.alt = work.media.alt || work.title || '';
                media.appendChild(img);
            } else {
                media.classList.add('card__media--text');
                media.textContent = work.title || 'Work';
            }

            box.appendChild(media);

            const title = document.createElement('span');
            title.className = 'card__title';
            title.textContent = work.title || 'Work';

            card.appendChild(box);
            card.appendChild(title);
            li.appendChild(card);
            track.appendChild(li);
        });
    };

    buildCards();

    const originalItems = Array.from(track.children);
    const originalCount = originalItems.length;

    if (originalCount === 0) {
        return;
    }

    const cloneCards = () => {
        const beforeClones = originalItems.map((item) => {
            const clone = item.cloneNode(true);
            clone.classList.add('is-clone');
            return clone;
        });
        const afterClones = originalItems.map((item) => {
            const clone = item.cloneNode(true);
            clone.classList.add('is-clone');
            return clone;
        });

        beforeClones.reverse().forEach((clone) => {
            track.insertBefore(clone, track.firstChild);
        });

        afterClones.forEach((clone) => {
            track.appendChild(clone);
        });
    };

    cloneCards();

    let allItems = Array.from(track.children);
    const baseSpeed = 33;
    let wheelBoost = 0;
    const wheelDecay = 0.95;
    const wheelBoostFactor = 0.6;
    let isHovering = false;
    let lastTime = performance.now();
    let virtualScroll = 0;

    const getBaseWidth = () => {
        const middleStart = originalCount;
        const rightStart = originalCount * 2;
        const middleItem = allItems[middleStart];
        const rightItem = allItems[rightStart];
        if (middleItem && rightItem) {
            return rightItem.offsetLeft - middleItem.offsetLeft;
        }
        return track.scrollWidth / 3;
    };

    const normalizeScroll = () => {
        const baseWidth = getBaseWidth();
        if (virtualScroll <= baseWidth * 0.5) {
            virtualScroll += baseWidth;
        } else if (virtualScroll >= baseWidth * 1.5) {
            virtualScroll -= baseWidth;
        }
    };

    const applyTransform = () => {
        track.style.transform = `translateX(${-virtualScroll}px)`;
    };

    const animate = (now) => {
        const deltaTime = (now - lastTime) / 1000;
        lastTime = now;

        if (!isHovering) {
            const effectiveSpeed = baseSpeed + wheelBoost;
            virtualScroll += effectiveSpeed * deltaTime;
            normalizeScroll();
            applyTransform();
        }

        wheelBoost *= wheelDecay;
        if (Math.abs(wheelBoost) < 0.5) {
            wheelBoost = 0;
        }

        requestAnimationFrame(animate);
    };

    const setupHover = () => {
        allItems.forEach((li) => {
            const card = li.querySelector('.card');
            if (!card) return;

            li.addEventListener('mouseenter', () => {
                isHovering = true;
                card.classList.add('card--hover');
            });

            li.addEventListener('mouseleave', () => {
                isHovering = false;
                card.classList.remove('card--hover');
            });
        });
    };

    window.addEventListener('wheel', (event) => {
        event.preventDefault();
        wheelBoost += (event.deltaY + event.deltaX) * wheelBoostFactor;
    }, { passive: false });

    const logMobileLayout = () => {
        if (!window.matchMedia('(max-width: 768px)').matches) return;
        const main = document.querySelector('main');
        const carousel = document.querySelector('.carousel');
        const about = document.querySelector('.about');
        const viewportCenter = window.innerHeight / 2;
        const mainRect = main ? main.getBoundingClientRect() : null;
        const carouselRect = carousel ? carousel.getBoundingClientRect() : null;
        const aboutRect = about ? about.getBoundingClientRect() : null;
        const carouselCenter = carouselRect ? carouselRect.top + carouselRect.height / 2 : null;
        const offset = carouselCenter !== null ? carouselCenter - viewportCenter : null;
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/00680b59-54e9-4962-bb41-b1cc2a630e6c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'script.js:logMobileLayout',message:'mobile layout metrics',data:{viewportH:window.innerHeight,viewportCenter,mainTop:mainRect?.top,mainHeight:mainRect?.height,carouselTop:carouselRect?.top,carouselHeight:carouselRect?.height,carouselCenter,aboutTop:aboutRect?.top,aboutHeight:aboutRect?.height,offsetFromCenter:offset},timestamp:Date.now(),sessionId:'debug-session',runId:'pre-fix',hypothesisId:'H1-H5'})}).catch(()=>{});
        // #endregion
    };

    window.requestAnimationFrame(() => {
        allItems = Array.from(track.children);
        const baseWidth = getBaseWidth();
        virtualScroll = baseWidth;
        applyTransform();
        if (!window.matchMedia('(max-width: 768px)').matches) {
            setupHover();
        }
        lastTime = performance.now();
        requestAnimationFrame(animate);
        setTimeout(logMobileLayout, 100);
        
        // Анимируем весь карусель целиком
        if (typeof animateElements === 'function') {
            const carousel = document.querySelector('.carousel');
            if (carousel) {
                animateElements([carousel], 0, true);
            }
        }
    });

    window.addEventListener('resize', () => {
        allItems = Array.from(track.children);
        normalizeScroll();
        applyTransform();
        setTimeout(logMobileLayout, 100);
    });
};

document.addEventListener('DOMContentLoaded', initCarousel);
document.addEventListener('DOMContentLoaded', () => {
    // Анимируем секцию about
    if (typeof animateElements === 'function') {
        const aboutText = document.querySelector('.about__text');
        if (aboutText) {
            animateElements([aboutText], 0);
        }
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const mailLink = document.querySelector('.header__mail');
    if (!mailLink) {
        return;
    }
    const email = mailLink.dataset.email || 'wekctl@gmail.com';
    let resetTimer = null;

    mailLink.addEventListener('click', (event) => {
        event.preventDefault();
        const front = mailLink.querySelector('.link-flip__front');
        const back = mailLink.querySelector('.link-flip__back');
        const ghost = mailLink.querySelector('.link-flip__ghost');
        const originalText = 'Mail';
        const showCopied = () => {
            if (front) front.textContent = 'Copied';
            if (back) back.textContent = 'Copied';
            if (ghost) ghost.textContent = 'Copied';
            if (resetTimer) {
                clearTimeout(resetTimer);
            }
            resetTimer = setTimeout(() => {
                if (front) front.textContent = originalText;
                if (back) back.textContent = originalText;
                if (ghost) ghost.textContent = originalText;
                resetTimer = null;
            }, 5000);
        };

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
            } catch (error) {
                // ignore
            }
            document.body.removeChild(textarea);
            showCopied();
        }
    });
});
