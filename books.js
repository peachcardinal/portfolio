const initBooks = () => {
    const listEl = document.querySelector('.books__list');
    if (!listEl) return;

    const data = Array.isArray(window.BOOKS) ? window.BOOKS : [];
    if (data.length === 0) return;

    const grouped = {};
    data.forEach((book) => {
        const y = book.year || '';
        if (!grouped[y]) grouped[y] = [];
        grouped[y].push(book);
    });

    const years = Object.keys(grouped).sort((a, b) => Number(b) - Number(a));
    const assetsBase = 'assets/books/';

    years.forEach((year) => {
        const books = grouped[year];

        const yearGroup = document.createElement('div');
        yearGroup.className = 'books__year-group';

        const yearHeading = document.createElement('div');
        yearHeading.className = 'books__year-heading';
        yearHeading.textContent = year;
        yearGroup.appendChild(yearHeading);

        const yearList = document.createElement('div');
        yearList.className = 'books__year-list';

        books.forEach((book, i) => {
            const row = document.createElement('div');
            row.className = 'books__row';

            const yearCell = document.createElement('div');
            yearCell.className = 'books__year';
            if (i === 0) {
                yearCell.textContent = year;
            } else {
                yearCell.textContent = '\u00A0';
            }
            row.appendChild(yearCell);

            const coverCell = document.createElement('div');
            coverCell.className = 'books__cover';
            const img = document.createElement('img');
            img.src = assetsBase + (book.cover || '');
            img.alt = book.title || '';
            img.onerror = () => { img.style.display = 'none'; };
            coverCell.appendChild(img);
            row.appendChild(coverCell);

            const metaCell = document.createElement('div');
            metaCell.className = 'books__meta';
            const title = document.createElement('span');
            title.className = 'h2 books__title-text';
            title.textContent = book.title || '';
            const author = document.createElement('span');
            author.className = 'text books__author';
            author.textContent = book.author || '';
            metaCell.appendChild(title);
            metaCell.appendChild(author);
            row.appendChild(metaCell);

            yearList.appendChild(row);
        });

        yearGroup.appendChild(yearList);
        listEl.appendChild(yearGroup);
    });

    // Анимируем строки книг
    if (typeof animateElements === 'function') {
        const rows = Array.from(listEl.querySelectorAll('.books__row'));
        animateElements(rows, 50, true);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initBooks();
    
    // Анимируем статический заголовок
    if (typeof animateElements === 'function') {
        const title = document.querySelector('.books__title');
        if (title) {
            animateElements([title], 0);
        }
    }
});
