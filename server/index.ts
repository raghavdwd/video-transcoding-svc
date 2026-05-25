import express, { type Request, type Response } from "express";
import morgan from "morgan";
const app = express();

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(morgan("dev"));

import uploadRouter from "./src/routes/upload.route";

app.use("/api/v1", uploadRouter);

/*
 * Worker events for logging and error handling
 * We can also add more events like "active", "stalled", "progress" etc. as needed
 */
import { worker } from "./src/queue/worker";

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed with error: ${err.message}`);
});

app.get("/api/v1/status", (req: Request, res: Response) => {
  res.json({ status: "Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
