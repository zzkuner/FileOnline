async function testCreateLink() {
    const fileId = 'cmig574ln0007svi7dv5ejw81'; // From previous upload
    const body = {
        fileId,
        name: 'Test Link for Tencent',
        description: 'Resume for Tencent HR',
    };

    try {
        const response = await fetch('http://localhost:3000/api/links', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const result = await response.json();
        console.log('Create Link Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Create Link Failed:', error);
    }
}

testCreateLink();
