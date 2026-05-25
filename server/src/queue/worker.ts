import { Worker } from "bullmq";
import { videoQueue } from "./queue";
import { redis } from "./conn";
import { uploads } from "../db/schema";
import { eq } from "drizzle-orm/sql/expressions/conditions";
import { db } from "../configs/db";
const { exec } = await import("child_process");

export const worker = new Worker(
  "video-transcoding",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data);
    /*
     * We will use ffmpeg to transcode the video and convert it to 480p, 720p and 1080p formats. We will also generate a thumbnail for the video.
     * After the transcoding is done, we will update the status of the job in the database to "completed" and save the paths of the transcoded videos and thumbnail.
     */
    const command = `ffmpeg -i ${job.data.filePath} -vf "scale=-1:480" ${job.data.outputDir}/480p_${job.data.filename} -vf "scale=-1:720" ${job.data.outputDir}/720p_${job.data.filename} -vf "scale=-1:1080" ${job.data.outputDir}/1080p_${job.data.filename} -vf "thumbnail,scale=320:240" ${job.data.outputDir}/thumbnail_${job.data.filename}.jpg`;

    // Execute the command using child_process
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error transcoding video: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`ffmpeg stderr: ${stderr}`);
        return;
      }
      console.log(`ffmpeg stdout: ${stdout}`);
    });
    //update the status of the job in the database to "completed" and save the paths of the transcoded videos and thumbnail
    const dbResult = await db
      .update(uploads)
      .set({
        status: "completed",
        transcodedFiles: {
          "480p": `${job.data.outputDir}/480p_${job.data.filename}`,
          "720p": `${job.data.outputDir}/720p_${job.data.filename}`,
          "1080p": `${job.data.outputDir}/1080p_${job.data.filename}`,
        },
        thumbnail: `${job.data.outputDir}/thumbnail_${job.data.filename}.jpg`,
      })
      .where(eq(uploads.id, job.data.id))
      .returning();
    console.log(`Completed job ${job.id}`);
  },
  {
    connection: redis,
    concurrency: 3, // Adjust the concurrency as needed
  },
);
