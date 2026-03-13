import "dotenv/config"
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand, GetObjectCommandOutput } from "@aws-sdk/client-s3";


// Initialize S3 Client
const s3Client = new S3Client({ region: process.env.S3_REGION });

export async function s3_upload_file(fileName:string, content:string|Buffer<ArrayBuffer>) {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
    Body: content,
  };

  try {
    const data = await s3Client.send(new PutObjectCommand(uploadParams));
    console.log("AWS S3 s3_upload_file success", data);
  } catch (err) {
    console.log("AWS S3 s3_upload_file error", err);
  }
}

export async function s3_delete_file(fileName:string) {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  };

  try {
    const data = await s3Client.send(new DeleteObjectCommand(uploadParams));
    console.log("AWS S3 s3_upload_file success", data);
  } catch (err) {
    console.log("AWS S3 s3_delete_file error", err);
  }
}

export async function s3_get_file(fileName:string): Promise<GetObjectCommandOutput | null> {
  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: fileName,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(uploadParams));
    console.log("AWS S3 s3_get_file success", data);
    return data
  } catch (err) {
    console.log("AWS S3 s3_get_file error", err);
    return null;
  }
}