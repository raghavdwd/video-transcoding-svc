import { Router } from "express";

import { upload } from "../services/multer.service";
import {
  getFileProcessStatus,
  handleFileUpload,
} from "../controllers/upload.controller";

const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), handleFileUpload);
uploadRouter.get("/file-status", getFileProcessStatus);
export default uploadRouter;
