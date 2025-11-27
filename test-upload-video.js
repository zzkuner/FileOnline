const fs = require('fs');
const path = require('path');

async function testUploadVideo() {
    const formData = new FormData();
    // Create a dummy video file (just text content, ffmpeg will fail but queue will run)
    const filePath = path.join(__dirname, 'test.mp4');
    fs.writeFileSync(filePath, 'Fake Video Content');

    const file = new Blob([fs.readFileSync(filePath)], { type: 'video/mp4' });
    formData.append('file', file, 'test.mp4');
    formData.append('userId', 'cmig4z0p10000e6n7n80x1itu');

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log('Upload Result:', JSON.stringify(result, null, 2));

        // Wait a bit for processing
        console.log('Waiting for processing...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Check status (I can't check DB directly easily here without prisma client, 
        // but I can check if the file status changed via API if I had a get endpoint)
        // I'll just rely on server logs for now.
    } catch (error) {
        console.error('Upload Failed:', error);
    }
}

testUploadVideo();
