import { S3Client, PutObjectCommand, ObjectCannedACL } from "@aws-sdk/client-s3";

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || "disaster-images";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadImageToS3(file: Express.Multer.File): Promise<string> {
  const fileName = `${Date.now()}-${file.originalname}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: fileName,
    Body: file.buffer,
    ContentType: file.mimetype,
    // ACL: "public-read" as ObjectCannedACL, // <-- fix: cast to ObjectCannedACL
  };

  try {
    await s3.send(new PutObjectCommand(uploadParams));
    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
  } catch (err) {
    console.error("Error uploading file to S3:", err);
    throw err;
  }
}
