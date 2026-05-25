import { type Request, type Response } from "express";
import { db } from "../configs/db";
import { uploads } from "../db/schema";
import { videoQueue } from "../queue/queue";

type UploadedFile = Express.Multer.File;

export const handleFileUpload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const uploadedFile = (req as Request & { file?: UploadedFile }).file;

  if (!uploadedFile) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  try {
    const fileInfo = {
      filename: uploadedFile.filename,
      status: "pending",
      path: uploadedFile.path,
    };

    const dbResult = await db.insert(uploads).values(fileInfo).returning();

    if (dbResult.length === 0) {
      res.status(500).json({ error: "Failed to save file info to database" });

      return;
    }

    videoQueue.add("", {
      id: dbResult[0]?.id,
      filename: fileInfo.filename,
      outputPath: `transcoded/${fileInfo.filename}`,
    });

    res.status(200).json({
      message: "File uploaded successfully",
      file: fileInfo,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error processing the uploaded file",
    });
  }
};
