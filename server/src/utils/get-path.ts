import path from "path";

/**
 * Utility functions to get the absolute path to the directory.
 */

export const getUploadsPath = (): string => {
  return path.join(__dirname, "../../uploads");
};

export const getTranscodedPath = (): string => {
  return path.join(__dirname, "../../transcoded");
};

export const getThumbnailPath = (): string => {
  return path.join(__dirname, "../../thumbnails");
};

const getPath = (type: "uploads" | "transcoded" | "thumbnails"): string => {
  switch (type) {
    case "uploads":
      return getUploadsPath();
    case "transcoded":
      return getTranscodedPath();
    case "thumbnails":
      return getThumbnailPath();
    default:
      throw new Error("Invalid path type");
  }
};

console.log("Uploads Path:", getPath("uploads"));
console.log("Transcoded Path:", getPath("transcoded"));
console.log("Thumbnails Path:", getPath("thumbnails"));
export default getPath;
