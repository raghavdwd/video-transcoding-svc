import { Router } from "express";

import { upload } from "../services/multer.service";
import { handleFileUpload } from "../controllers/upload.controller";

const uploadRouter = Router();

uploadRouter.post("/upload", upload.single("file"), handleFileUpload);

export default uploadRouter;
