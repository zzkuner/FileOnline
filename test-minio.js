import { Client } from 'minio'

const minioClient = new Client({
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: 'admin',
    secretKey: 'password123'
})

async function testConnection() {
    console.log('Testing MinIO connection...')
    try {
        const buckets = await minioClient.listBuckets()
        console.log('Success! Buckets:', buckets.map(b => b.name))
    } catch (err) {
        console.error('Connection failed:', err)
    }
}

testConnection()
