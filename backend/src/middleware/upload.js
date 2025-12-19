import multer from "multer";
import path from "path";
import fs from "fs";

// Resolve upload directory (supports persistent disk on hosts)
const UPLOAD_DIR = process.env.UPLOAD_DIR || "uploads";
const ensureUploadDir = () => {
  const dir = path.isAbsolute(UPLOAD_DIR)
    ? UPLOAD_DIR
    : path.join(process.cwd(), UPLOAD_DIR);
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {}
  return dir;
};

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, ensureUploadDir());
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
