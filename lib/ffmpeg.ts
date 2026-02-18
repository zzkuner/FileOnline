import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import { uploadFileToStorage } from './storage';

// Manually resolve ffmpeg path to avoid bundling issues
const ffmpegPath = path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg.exe');

if (ffmpegPath) {
    ffmpeg.setFfmpegPath(ffmpegPath);
}

export async function transcodeVideoToHLS(
    inputPath: string,
    outputDir: string,
    fileId: string
): Promise<string> {
    const outputName = 'playlist.m3u8';
    const outputPath = path.join(outputDir, outputName);

    return new Promise((resolve, reject) => {
        ffmpeg(inputPath, { timeout: 432000 })
            .addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ])
            .output(outputPath)
            .on('end', async () => {
                console.log('Transcoding finished');
                resolve(outputPath);
            })
            .on('error', (err) => {
                console.error('Error transcoding video:', err);
                reject(err);
            })
            .run();
    });
}

export async function uploadHLSToStorage(
    localDir: string,
    s3Prefix: string
): Promise<string> {
    const files = await fs.readdir(localDir);

    for (const file of files) {
        const filePath = path.join(localDir, file);
        const buffer = await fs.readFile(filePath);
        const key = `${s3Prefix}/${file}`;
        // Determine content type
        const contentType = file.endsWith('.m3u8')
            ? 'application/vnd.apple.mpegurl'
            : 'video/MP2T';

        await uploadFileToStorage(buffer, key, contentType);
    }

    return `${s3Prefix}/playlist.m3u8`;
}
