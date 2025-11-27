const ffmpegPath = require('ffmpeg-static');
const fs = require('fs');
const path = require('path');

console.log('ffmpegPath:', ffmpegPath);

if (ffmpegPath) {
    try {
        const stats = fs.statSync(ffmpegPath);
        console.log('File exists:', stats.isFile());
    } catch (e) {
        console.error('File check failed:', e.message);

        // Try to find it manually
        const manualPath = path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');
        console.log('Trying manual path:', manualPath);
        try {
            const stats2 = fs.statSync(manualPath);
            console.log('Manual path exists:', stats2.isFile());
        } catch (e2) {
            console.error('Manual path check failed:', e2.message);
        }
    }
}
