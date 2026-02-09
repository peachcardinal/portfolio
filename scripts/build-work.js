const fs = require('fs');
const path = require('path');

const WORKS_DIR = path.join(__dirname, '..', 'assets', 'works');
const OUTPUT_FILE = path.join(__dirname, '..', 'work-data.js');

const IMAGE_EXT = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
const VIDEO_EXT = ['.mp4', '.webm', '.mov'];

const getExt = (file) => path.extname(file).toLowerCase();
const isMedia = (file) => {
    const ext = getExt(file);
    return IMAGE_EXT.includes(ext) || VIDEO_EXT.includes(ext);
};

const result = {};

if (fs.existsSync(WORKS_DIR)) {
    const dirs = fs.readdirSync(WORKS_DIR);
    for (const dir of dirs) {
        const dirPath = path.join(WORKS_DIR, dir);
        if (fs.statSync(dirPath).isDirectory() && !dir.startsWith('.')) {
            const files = fs.readdirSync(dirPath)
                .filter((f) => isMedia(f) && !f.startsWith('.'))
                .sort();
            if (files.length > 0) {
                result[dir] = files;
            }
        }
    }
}

const content = `window.WORK_FILES = ${JSON.stringify(result, null, 4)};\n`;
fs.writeFileSync(OUTPUT_FILE, content, 'utf8');
console.log(`Wrote work-data.js with ${Object.keys(result).length} work(s)`);
