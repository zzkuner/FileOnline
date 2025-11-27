async function testViewerApi() {
    const slug = '9MCWtpVj'; // From previous test-create-link.js output
    try {
        console.log(`Testing Viewer API for slug: ${slug}`);
        const response = await fetch(`http://localhost:3000/api/viewer/${slug}`);

        if (response.ok) {
            const result = await response.json();
            console.log('Viewer API Result:', JSON.stringify(result, null, 2));
        } else {
            const error = await response.text();
            console.error('Viewer API Failed:', response.status, error);
        }
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testViewerApi();
