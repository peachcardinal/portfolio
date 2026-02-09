const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];

const getMediaType = (filename) => {
    const ext = (filename.split('.').pop() || '').toLowerCase();
    if (['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    return 'image';
};

const createMediaEl = (src, type, alt) => {
    if (type === 'video') {
        const v = document.createElement('video');
        v.src = src;
        v.muted = true;
        v.setAttribute('muted', '');
        v.autoplay = true;
        v.loop = true;
        v.playsInline = true;
        v.setAttribute('preload', 'auto');
        v.setAttribute('aria-label', alt || '');
        return v;
    }
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt || '';
    return img;
};

const initWorkPage = () => {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = 'works.html';
        return;
    }

    const works = Array.isArray(window.WORKS) ? window.WORKS : [];
    const workIndex = works.findIndex((w) => w.slug === slug);
    const work = workIndex >= 0 ? works[workIndex] : null;

    if (!work) {
        window.location.href = 'works.html';
        return;
    }

    document.title = `Roman Sazonov — ${work.title}`;
    const titleEl = document.querySelector('.work__title');
    if (titleEl) {
        titleEl.textContent = work.title;
        // Анимируем заголовок
        if (typeof animateElements === 'function') {
            animateElements([titleEl], 0);
        }
    }

    const folder = work.folder || `assets/works/${slug}`;
    const workFiles = (window.WORK_FILES && window.WORK_FILES[slug]) || [];
    const layout = work.layout || null;

    const contentEl = document.querySelector('.work__content');
    if (!contentEl) return;

    let autoIndex = 0;
    const consumeNext = () => {
        if (autoIndex < workFiles.length) return workFiles[autoIndex++];
        return null;
    };
    const skipTo = (file) => {
        const i = workFiles.indexOf(file);
        if (i >= 0 && i >= autoIndex) autoIndex = i + 1;
    };

    const blocks = [];

    if (layout && Array.isArray(layout)) {
        layout.forEach((block) => {
            if (block.type === 'full') {
                const file = block.file || consumeNext();
                if (file) blocks.push({ type: 'full', file });
            } else if (block.type === 'half') {
                const file = block.file || consumeNext();
                if (file) blocks.push({ type: 'half', file });
            } else if (block.type === 'two') {
                const left = block.left || consumeNext();
                const right = block.right || consumeNext();
                if (left && right) {
                    if (block.left) skipTo(block.left);
                    if (block.right) skipTo(block.right);
                    blocks.push({ type: 'two', left, right });
                }
            } else if (block.type === 'text-media') {
                const file = block.file || consumeNext();
                if (block.text && file) {
                    if (block.file) skipTo(block.file);
                    blocks.push({ type: 'text-media', text: block.text, file });
                }
            } else if (block.type === 'text' && block.text) {
                blocks.push({ type: 'text', text: block.text });
            } else if (block.type === 'intro' && (block.heading || block.text || block.meta)) {
                blocks.push({ type: 'intro', heading: block.heading || '', text: block.text || '', meta: block.meta || [] });
            }
        });
    } else {
        if (workFiles.length > 0) {
            blocks.push({ type: 'full', file: workFiles[0] });
            if (work.intro) {
                blocks.push({ type: 'intro', heading: work.intro.heading || '', text: work.intro.text || '', meta: work.intro.meta || [] });
            }
            workFiles.slice(1).forEach((f) => blocks.push({ type: 'full', file: f }));
        }
    }

    blocks.forEach((b) => {
        const wrap = document.createElement('div');
        wrap.className = `work__block work__block--${b.type}`;

        if (b.type === 'full') {
            const src = `${folder}/${b.file}`;
            const type = getMediaType(b.file);
            wrap.appendChild(createMediaEl(src, type, work.title));
        } else if (b.type === 'half') {
            const emptyCell = document.createElement('div');
            emptyCell.className = 'work__block-cell work__block-cell--empty';
            const mediaCell = document.createElement('div');
            mediaCell.className = 'work__block-cell';
            const src = `${folder}/${b.file}`;
            const type = getMediaType(b.file);
            mediaCell.appendChild(createMediaEl(src, type, work.title));
            wrap.appendChild(emptyCell);
            wrap.appendChild(mediaCell);
        } else if (b.type === 'two') {
            const leftSrc = `${folder}/${b.left}`;
            const rightSrc = `${folder}/${b.right}`;
            const leftType = getMediaType(b.left);
            const rightType = getMediaType(b.right);
            const leftEl = document.createElement('div');
            leftEl.className = 'work__block-cell';
            leftEl.appendChild(createMediaEl(leftSrc, leftType, work.title));
            const rightEl = document.createElement('div');
            rightEl.className = 'work__block-cell';
            rightEl.appendChild(createMediaEl(rightSrc, rightType, work.title));
            wrap.appendChild(leftEl);
            wrap.appendChild(rightEl);
        } else if (b.type === 'text-media') {
            const hasText = (b.text || '').replace(/<[^>]*>/g, '').trim().length > 0;
            if (!hasText) wrap.classList.add('work__block--no-text');
            const mediaEl = document.createElement('div');
            mediaEl.className = 'work__block-cell';
            const src = `${folder}/${b.file}`;
            const type = getMediaType(b.file);
            mediaEl.appendChild(createMediaEl(src, type, work.title));
            if (hasText) {
                const textEl = document.createElement('div');
                textEl.className = 'work__block-cell work__block-text';
                textEl.innerHTML = b.text;
                wrap.appendChild(textEl);
            }
            wrap.appendChild(mediaEl);
        } else if (b.type === 'text') {
            const textEl = document.createElement('div');
            textEl.className = 'work__block-text';
            textEl.innerHTML = b.text;
            wrap.appendChild(textEl);
        } else if (b.type === 'intro') {
            if (b.heading) {
                const h1 = document.createElement('h1');
                h1.className = 'work__intro-heading h1';
                h1.textContent = b.heading;
                wrap.appendChild(h1);
            }
            const row = document.createElement('div');
            row.className = 'work__intro-row';
            if (b.text || (b.meta && (b.meta.left?.length || b.meta.right?.length || (Array.isArray(b.meta) && b.meta.length)))) {
                const textCell = document.createElement('div');
                textCell.className = 'work__intro-text';
                const hasText = (b.text || '').replace(/<[^>]*>/g, '').trim().length > 0;
                if (!hasText) {
                    textCell.classList.add('work__intro-text--empty');
                } else {
                    textCell.innerHTML = b.text;
                }
                if (work.projectLink) {
                    const label = work.projectLinkLabel || 'View live';
                    const btnWrap = document.createElement('div');
                    btnWrap.className = 'work__intro-btn-wrap';
                    const btn = document.createElement('a');
                    btn.href = work.projectLink;
                    btn.target = '_blank';
                    btn.rel = 'noopener';
                    btn.className = 'work__intro-btn link link-flip';
                    btn.setAttribute('data-text', label);
                    btn.innerHTML = `<span class="link-flip__front">${label}</span><span class="link-flip__back">${label}</span><span class="link-flip__ghost">${label}</span>`;
                    btnWrap.appendChild(btn);
                    textCell.appendChild(btnWrap);
                }
                row.appendChild(textCell);
            }
            if (b.meta && (b.meta.left?.length || b.meta.right?.length || (Array.isArray(b.meta) && b.meta.length))) {
                const metaWrap = document.createElement('div');
                metaWrap.className = 'work__intro-meta-wrap';
                const renderMeta = (items) => {
                    const dl = document.createElement('dl');
                    dl.className = 'work__intro-meta';
                    (items || []).forEach((m) => {
                        const dt = document.createElement('dt');
                        dt.textContent = (m.label || '') + ':';
                        const dd = document.createElement('dd');
                        const val = (m.value || '').split(',').map((s) => s.trim()).filter(Boolean);
                        dd.innerHTML = val.join('<br>');
                        dl.appendChild(dt);
                        dl.appendChild(dd);
                    });
                    return dl;
                };
                if (b.meta.left || b.meta.right) {
                    if (b.meta.left?.length) metaWrap.appendChild(renderMeta(b.meta.left));
                    if (b.meta.right?.length) metaWrap.appendChild(renderMeta(b.meta.right));
                } else if (Array.isArray(b.meta)) {
                    const half = Math.ceil(b.meta.length / 2);
                    metaWrap.appendChild(renderMeta(b.meta.slice(0, half)));
                    metaWrap.appendChild(renderMeta(b.meta.slice(half)));
                }
                row.appendChild(metaWrap);
            }
            if (row.children.length > 0) wrap.appendChild(row);
        }

        contentEl.appendChild(wrap);
    });

    // Анимируем блоки работы
    if (typeof animateElements === 'function') {
        const blocks = Array.from(contentEl.querySelectorAll('.work__block'));
        animateElements(blocks, 50, true);
    }

    const navEl = document.querySelector('.work__nav');
    if (navEl) {
        const prev = workIndex > 0 ? works[workIndex - 1] : (works.length > 1 ? works[works.length - 1] : null);
        const next = workIndex < works.length - 1 ? works[workIndex + 1] : (works.length > 1 ? works[0] : null);

        const prevLink = prev && prev.slug
            ? `work.html?slug=${prev.slug}`
            : 'works.html';
        const nextLink = next
            ? (next.slug ? `work.html?slug=${next.slug}` : 'works.html')
            : null;

        const prevBack = prev ? prev.title : 'Works';
        const nextBack = next ? next.title : '';

        navEl.innerHTML = `
            <div class="work__nav-cell work__nav-cell--prev">
                <a href="${prevLink}" class="work__nav-prev link link-flip">
                    <span class="link-flip__front">Prev</span>
                    <span class="link-flip__back">${prevBack}</span>
                    <span class="link-flip__ghost">${prevBack}</span>
                </a>
            </div>
            ${nextLink ? `
            <div class="work__nav-cell work__nav-cell--next">
                <a href="${nextLink}" class="work__nav-next link link-flip">
                    <span class="link-flip__front">Next</span>
                    <span class="link-flip__back">${nextBack}</span>
                    <span class="link-flip__ghost">${nextBack}</span>
                </a>
            </div>
            ` : ''}
        `;
        
        // Анимируем навигацию
        if (typeof animateElements === 'function') {
            const navCells = Array.from(navEl.querySelectorAll('.work__nav-cell'));
            animateElements(navCells, 50, true);
        }
    }
};

document.addEventListener('DOMContentLoaded', initWorkPage);
