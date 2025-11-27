const { S3Client, CreateBucketCommand } = require("@aws-sdk/client-s3");

const s3Client = new S3Client({
    region: "us-east-1",
    endpoint: "http://localhost:9000",
    credentials: {
        accessKeyId: "minioadmin",
        secretAccessKey: "minioadmin",
    },
    forcePathStyle: true,
});

async function init() {
    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: "insightlink" }));
        console.log("Bucket 'insightlink' created successfully.");
    } catch (err) {
        if (err.Code === 'BucketAlreadyOwnedByYou' || err.Code === 'BucketAlreadyExists') {
            console.log("Bucket 'insightlink' already exists.");
        } else {
            console.error("Error creating bucket:", err);
        }
    }
}

init();
