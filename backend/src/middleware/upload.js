import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AVATAR_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "avatars");
export const RESUME_UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads", "resumes");

fs.mkdirSync(AVATAR_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(RESUME_UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, AVATAR_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `${req.user._id}-${Date.now()}${ext}`);
  }
});

const resumeStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, RESUME_UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
    cb(null, `${req.user._id}-resume-${Date.now()}${ext}`);
  }
});

function avatarFileFilter(_req, file, cb) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed"));
  }
  cb(null, true);
}

function resumeFileFilter(_req, file, cb) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
}

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }
}).single("avatar");

export const uploadResume = multer({
  storage: resumeStorage,
  fileFilter: resumeFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
}).single("resume");