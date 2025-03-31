import * as fs from 'fs';
import { Client } from 'minio';
import * as path from 'path';

import { version } from './package.json';

const minioPort = process.env.MINIO_PORT;
const endPoint = process.env.MINIO_ENDPOINT;
// @ts-ignore
const __dirname = import.meta.dirname as string;

if (!endPoint) throw new Error('Missing MINIO_ENDPOINT variable');
if (!minioPort) throw new Error('Missing MINIO_PORT variable');

const minioClient = new Client({
  endPoint,
  port: parseInt(minioPort, 10),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
});

const setPublicReadPolicy = async (bucket: string) => {
  const policy = {
    Version: '2012-10-17',
    Statement: [
      {
        Effect: 'Allow',
        Principal: '*',
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${bucket}/*`,
      },
    ],
  };
  await minioClient.setBucketPolicy(bucket, JSON.stringify(policy));
};

const ensureBucketExists = async (bucket: string) => {
  const exists = await minioClient.bucketExists(bucket);
  if (!exists) {
    await minioClient.makeBucket(bucket);
    await setPublicReadPolicy(bucket);
  }
};

async function uploadFile(bucketName: string, filePath: string, relativePath: string) {
  const objectName = `v${version}/${relativePath}`;
  await minioClient.fPutObject(bucketName, objectName, filePath);
  console.log(`Successfully uploaded ${filePath} to ${objectName}`);
}

async function uploadDirectory(bucketName: string, dirPath: string, basePath = dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      await uploadDirectory(bucketName, filePath, basePath);
    } else {
      const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
      await uploadFile(bucketName, filePath, relativePath);
    }
  }
}

async function main() {
  const bucket = process.env.BUNDLE_BUCKET;
  if (!bucket) throw new Error('Missing BUNDLE_BUCKET variable');

  const distDir = path.resolve(__dirname, 'dist');
  try {
    console.log('Starting file upload to MinIO...');
    await ensureBucketExists(bucket);
    await uploadDirectory(bucket, distDir);
    console.log('File upload completed!');
  } catch (error) {
    console.error(error);
  }
}

main().catch(console.error);
