import { prisma } from './db';
import { downloadFileFromStorage } from './storage';
import { transcodeVideoToHLS, uploadHLSToStorage } from './ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

export async function processVideo(fileId: string, fileKey: string) {
    console.log(`Starting video processing for file ${fileId}`);

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'insightlink-'));
    const inputPath = path.join(tempDir, 'input.mp4');
    const outputDir = path.join(tempDir, 'hls');

    try {
        await fs.mkdir(outputDir);

        // 1. Download original file
        console.log('Downloading file...');
        await downloadFileFromStorage(fileKey, inputPath);

        // 2. Transcode
        console.log('Transcoding...');
        await transcodeVideoToHLS(inputPath, outputDir, fileId);

        // 3. Upload HLS
        console.log('Uploading HLS...');
        const hlsKeyPrefix = `processed/${fileId}`;
        const playlistKey = await uploadHLSToStorage(outputDir, hlsKeyPrefix);

        // 4. Update DB
        await prisma.file.update({
            where: { id: fileId },
            data: {
                status: 'READY',
                processedPath: playlistKey,
            },
        });

        console.log(`Video processing complete for ${fileId}`);

    } catch (error) {
        console.error(`Video processing failed for ${fileId}:`, error);
        await prisma.file.update({
            where: { id: fileId },
            data: {
                status: 'FAILED',
            },
        });
    } finally {
        // Cleanup
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (e) {
            console.error('Failed to cleanup temp dir:', e);
        }
    }
}
