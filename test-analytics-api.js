async function testAnalyticsApi() {
    const linkId = 'cmig595e90009svi7eg7grq0q'; // From previous test-create-link.js output
    try {
        console.log(`Testing Analytics API for linkId: ${linkId}`);
        const response = await fetch(`http://localhost:3000/api/analytics?linkId=${linkId}`);

        if (response.ok) {
            const result = await response.json();
            console.log('Analytics API Result:', JSON.stringify(result, null, 2));
        } else {
            const error = await response.text();
            console.error('Analytics API Failed:', response.status, error);
        }
    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testAnalyticsApi();
