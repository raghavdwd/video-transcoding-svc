import { Worker } from "bullmq";
import { videoQueue } from "./queue";
import { redis } from "./conn";
import { uploads } from "../db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../configs/db";
import { exec } from "child_process";
import { promisify } from "util";
import getPath from "../utils/get-path";

const execPromise = promisify(exec);

export const worker = new Worker(
  "video-transcoding",
  async (job) => {
    try {
      console.log(`Processing job ${job.id} with data:`, job.data);
      /*
       * We will use ffmpeg to transcode the video and convert it to 480p, 720p and 1080p formats. We will also generate a thumbnail for the video.
       * After the transcoding is done, we will update the status of the job in the database to "completed" and save the paths of the transcoded videos and thumbnail.
       *  {
            id: 4,
            filename: "file-1779724506676-325000763.webm",
            outputPath: "transcoded/file-1779724506676-325000763.webm",
            resolutions: [480p, 720p, 1080p]
          }
       */

      const outputDir = getPath("transcoded");
      const filename = job.data.filename;
      const inputFilePath = getPath("uploads") + "/" + job.data.filename;
      const resolutions: string[] = job.data.resolutions;

      const scaleMap: Record<string, string> = {
        "480p": "scale=-2:480",
        "720p": "scale=-2:720",
        "1080p": "scale=-2:1080",
      };

      const commands = resolutions.map(
        (res) => `ffmpeg -i "${inputFilePath}" -vf "${scaleMap[res]}" "${outputDir}/${res}_${filename}"`,
      );
      const thumbnailCommand = `ffmpeg -i "${inputFilePath}" -ss 00:00:01.000 -vframes 1 "${outputDir}/thumbnail_${filename}.jpg"`;

      await Promise.all([
        ...commands.map((cmd) => execPromise(cmd)),
        execPromise(thumbnailCommand),
      ]);

      console.log(`ffmpeg completed for job ${job.id}`);

      const transcodedFiles: Record<string, string> = {};
      for (const res of resolutions) {
        transcodedFiles[res] = `${outputDir}/${res}_${filename}`;
      }

      const dbResult = await db
        .update(uploads)
        .set({
          status: "completed",
          transcodedFiles,
          thumbnail: `${outputDir}/thumbnail_${filename}.jpg`,
        })
        .where(eq(uploads.id, job.data.id))
        .returning();
      console.log(`Completed job ${job.id}`);
    } catch (error) {
      console.error(`Job ${job.id} failed:`, error);
      // Update status to failed in database
      try {
        await db
          .update(uploads)
          .set({ status: "failed" })
          .where(eq(uploads.id, job.data.id));
      } catch (dbError) {
        console.error(`Failed to update job status in database:`, dbError);
      }
      throw error; // Re-throw so BullMQ can handle the failure
    }
  },
  {
    connection: redis,
    concurrency: 3, // Adjust the concurrency as needed
  },
);
