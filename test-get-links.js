async function testGetLinks() {
    const fileId = 'cmig574ln0007svi7dv5ejw81'; // Same file ID
    try {
        const response = await fetch(`http://localhost:3000/api/links?fileId=${fileId}`);
        const result = await response.json();
        console.log('Get Links Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Get Links Failed:', error);
    }
}

testGetLinks();
