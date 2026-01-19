import multer from "multer";
import { ApiError } from "./apiError";

// Store files in memory as buffer
const storage = multer.memoryStorage();

// File filter for images only
const fileFilter = (
  req: Express.Request, 
  file: Express.Multer.File, 
  cb: multer.FileFilterCallback
) => {
  // Accept images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Only image files are allowed (jpg, jpeg, png, webp)'));
  }
};

// Single file upload with field name "image"
export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Multiple files upload for issue media (max 5 files)
export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Max 5 files
  }
}).array('images', 5);