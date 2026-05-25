import multer from "multer";
import path from "path";
import { type Request, type Response } from "express";
import getPath from "../utils/get-path";

const PATH_TO_UPLOADS = getPath("uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, PATH_TO_UPLOADS);
  },

  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const randomNumber = Math.round(Math.random() * 1e9);

    const extension = path.extname(file.originalname);

    const uniqueFileName = `${file.fieldname}-${timestamp}-${randomNumber}${extension}`;

    cb(null, uniqueFileName);
  },
});

export const upload = multer({ storage: storage });
