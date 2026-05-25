import { Queue } from "bullmq";
import { redis } from "./conn";

export const videoQueue = new Queue("video-transcoding", {
  connection: redis,
});
