// src/scripts/uploadJson.ts
import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { BaseCase } from "@solspin/game-engine-types";

interface UploadJsonEvent {
  bucketName: string;
  fileName: string;
  imagesDir: string; // Add this to specify your images directory
}

export const handler = async (event: UploadJsonEvent) => {
  console.log("Event received:", JSON.stringify(event, null, 2));

  const bucketName = event.bucketName;
  const fileName = event.fileName;
  const imagesDir = event.imagesDir;

  const s3Client = new S3Client({});

  try {
    const casesContent = fs.readFileSync("src/data/cases.json", "utf-8");
    console.log(casesContent);
    // Upload main cases.json file
    await uploadFile(s3Client, bucketName, fileName, casesContent);

    // Upload individual case files
    const cases: BaseCase[] = JSON.parse(casesContent);

    for (const caseItem of cases) {
      const caseFileName = `cases/${caseItem.name}.json`;
      await uploadFile(s3Client, bucketName, caseFileName, JSON.stringify(caseItem));
    }

    // Upload all images from the specified directory
    await uploadImagesFromDirectory(s3Client, bucketName, imagesDir);

    console.log("All files and images uploaded successfully");
    return { statusCode: 200, body: "All files and images uploaded successfully" };
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
};

async function uploadFile(
  s3Client: S3Client,
  bucketName: string,
  fileName: string,
  fileContentOrPath: string,
  isImage = false
) {
  try {
    // Check if file already exists
    try {
      await s3Client.send(
        new HeadObjectCommand({
          Bucket: bucketName,
          Key: fileName,
        })
      );
      console.log(`${fileName} already exists in the bucket. Skipping upload.`);
      return;
    } catch (error: any) {
      if (error.name !== "NotFound") {
        throw error;
      }
    }

    // Prepare file content
    let fileContent: Buffer | string;
    let contentType: string;

    if (isImage) {
      fileContent = fs.readFileSync(fileContentOrPath);
      contentType = `image/${path.extname(fileContentOrPath).slice(1)}`; // e.g., 'image/jpeg'
    } else {
      fileContent = fileContentOrPath;
      contentType = "application/json";
    }

    // Upload file
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: fileContent,
      ContentType: contentType,
    });

    await s3Client.send(command);
    console.log(`Successfully uploaded ${fileName} to S3`);
  } catch (error) {
    console.error(`Error uploading ${fileName}:`, error);
    throw error;
  }
}

async function uploadImagesFromDirectory(
  s3Client: S3Client,
  bucketName: string,
  directory: string
) {
  const files = fs.readdirSync(directory);

  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);

    if (stats.isFile()) {
      const fileExtension = path.extname(file).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"].includes(fileExtension)) {
        const s3Key = `case-images/${file}`;
        await uploadFile(s3Client, bucketName, s3Key, filePath, true);
      }
    }
  }
}
