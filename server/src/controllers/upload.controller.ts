import { type Request, type Response } from "express";
import { db } from "../configs/db";
import { eq } from "drizzle-orm";
import { uploads } from "../db/schema";
import { videoQueue } from "../queue/queue";
import { z } from "zod";

type UploadedFile = Express.Multer.File;

type FileResolution = "480p" | "720p" | "1080p";

const fileUploadSchema = z.object({
  filename: z.string(),
  resolutions: z.array(z.enum(["480p", "720p", "1080p"])),
});

export const handleFileUpload = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const uploadedFile = (req as Request & { file?: UploadedFile }).file;
  const fileResolution: FileResolution[] = req.body.resolutions;

  const { success, error } = fileUploadSchema.safeParse({
    filename: uploadedFile?.filename,
    resolutions: fileResolution,
  });

  if (!success) {
    res.status(400).json({
      error: "Invalid file upload data",
      details: error.message,
    });
    return;
  }
  try {
    const fileInfo = {
      filename: uploadedFile!.filename,
      status: "pending",
      path: uploadedFile!.path,
      resolutions: fileResolution,
    };

    const dbResult = await db.insert(uploads).values(fileInfo).returning();

    if (dbResult.length === 0) {
      res.status(500).json({ error: "Failed to save file info to database" });

      return;
    }

    videoQueue.add("", {
      id: dbResult[0]?.id,
      filename: fileInfo.filename,
      filePath: fileInfo.path,
      outputDir: "transcoded",
      resolutions: fileResolution,
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

export const getFileProcessStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const fileId = req.query.id as string;
  try {
    let files = await db
      .select()
      .from(uploads)
      .where(eq(uploads.filename, fileId));

    res.status(200).json({ files: files[0] });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error fetching file processing status",
    });
  }
};
