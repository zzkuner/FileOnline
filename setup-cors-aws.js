import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
    region: "us-west-004",
    endpoint: "https://s3.us-west-004.backblazeb2.com",
    credentials: {
        accessKeyId: "004e46c2e47873e0000000004",
        secretAccessKey: "K004wLIFLgvRzJf6cfrhzjHhmUonyYI"
    }
});

async function setCors() {
    const bucketName = "send-kun-ee";
    console.log(`Setting CORS for bucket: ${bucketName}`);

    const command = new PutBucketCorsCommand({
        Bucket: bucketName,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["GET", "HEAD"],
                    AllowedOrigins: ["*"], // Allow all origins for simplicity, or use ["http://localhost:3000"]
                    ExposeHeaders: ["ETag", "Content-Length", "Content-Type", "Content-Disposition"]
                }
            ]
        }
    });

    try {
        const response = await client.send(command);
        console.log("Success! CORS configuration set.", response);
    } catch (err) {
        console.error("Error setting CORS:", err);
    }
}

setCors();
