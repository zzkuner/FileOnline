import { Client } from 'minio'

const minioClient = new Client({
    endPoint: 's3.us-west-004.backblazeb2.com',
    port: 443,
    useSSL: true,
    accessKey: '004e46c2e47873e0000000004',
    secretKey: 'K004wLIFLgvRzJf6cfrhzjHhmUonyYI'
})

async function testConnection() {
    console.log('Testing Backblaze B2 connection...')
    try {
        const buckets = await minioClient.listBuckets()
        console.log('Success! Buckets:', buckets.map(b => b.name))

        // Check if our target bucket exists
        const targetBucket = 'send-kun-ee'
        const exists = await minioClient.bucketExists(targetBucket)
        if (exists) {
            console.log(`Bucket '${targetBucket}' exists and is accessible.`)
        } else {
            console.error(`Bucket '${targetBucket}' does not exist or is not accessible.`)
        }
    } catch (err) {
        console.error('Connection failed:', err)
    }
}

testConnection()
