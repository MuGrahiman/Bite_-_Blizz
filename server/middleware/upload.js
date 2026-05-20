/**
 * File Upload — Cloudinary Storage via Multer
 * Streams directly to Cloudinary CDN, no local disk storage
 */

const multer = require("multer");
const  CloudinaryStorage  = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;
const path = require("path");
const { BadRequestError } = require("../utils/customErrors");

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Cloudinary storage engine
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "cooking-blog/recipes",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }], // Resize on upload
    public_id: (req, file) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      return `recipe-${uniqueSuffix}`;
    },
  },
});

// File filter — double-check MIME types before Cloudinary sees them
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const allowedExts = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) && allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new BadRequestError("Only image files (jpg, png, webp, gif) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 5,
  },
});

// Error handler for multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new BadRequestError("File too large. Max size is 5MB."));
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return next(new BadRequestError("Too many files. Max is 5."));
    }
    return next(new BadRequestError(`Upload error: ${err.message}`));
  }
  next(err);
};

module.exports = { upload, handleUploadError, cloudinary };