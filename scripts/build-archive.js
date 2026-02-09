const fs = require('fs');
const path = require('path');

const ARCHIVE_DIR = path.join(__dirname, '..', 'assets', 'archive');
const OUTPUT_FILE = path.join(__dirname, '..', 'archive-data.js');

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];

const getType = (ext) => {
    if (IMAGE_EXT.includes(ext)) return 'image';
    if (VIDEO_EXT.includes(ext)) return 'video';
    return null;
};

const items = [];

if (fs.existsSync(ARCHIVE_DIR)) {
    const files = fs.readdirSync(ARCHIVE_DIR);
    for (const file of files) {
        const ext = path.extname(file).toLowerCase();
        const type = getType(ext);
        if (type) {
            items.push({ type, src: `assets/archive/${file}` });
        }
    }
    items.sort((a, b) => a.src.localeCompare(b.src));
}

const content = `window.ARCHIVE = ${JSON.stringify(items, null, 2)};\n`;
fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
console.log(`Wrote ${items.length} items to archive-data.js`);
