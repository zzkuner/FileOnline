const fs = require('fs');
const path = require('path');

async function testUpload() {
    const formData = new FormData();
    // Create a dummy file
    const filePath = path.join(__dirname, 'test.txt');
    fs.writeFileSync(filePath, 'Hello MinIO');

    const file = new Blob([fs.readFileSync(filePath)], { type: 'text/plain' });
    formData.append('file', file, 'test.txt');
    formData.append('userId', 'cmig4z0p10000e6n7n80x1itu');

    try {
        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();
        console.log('Upload Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Upload Failed:', error);
    }
}

testUpload();
