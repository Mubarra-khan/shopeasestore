const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const uploadDirectory = path.join(__dirname, "..", "uploads", "chat");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedImageTypes = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const allowedVideoTypes = new Map([
  ["video/mp4", ".mp4"],
  ["video/webm", ".webm"],
  ["video/ogg", ".ogg"],
  ["video/quicktime", ".mov"],
]);

const allowedFileTypes = new Map([
  ["application/pdf", ".pdf"],
  ["text/plain", ".txt"],
  ["application/msword", ".doc"],
  ["application/vnd.openxmlformats-officedocument.wordprocessingml.document", ".docx"],
  ["application/vnd.ms-excel", ".xls"],
  ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", ".xlsx"],
  ["application/vnd.ms-powerpoint", ".ppt"],
  ["application/vnd.openxmlformats-officedocument.presentationml.presentation", ".pptx"],
]);

const storage = multer.diskStorage({
  destination: uploadDirectory,
  filename: (req, file, callback) => {
    const ext =
      allowedImageTypes.get(file.mimetype) ||
      allowedVideoTypes.get(file.mimetype) ||
      allowedFileTypes.get(file.mimetype) ||
      "";
    callback(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (allowedImageTypes.has(file.mimetype)) {
    return callback(null, true);
  }
  if (allowedVideoTypes.has(file.mimetype)) {
    return callback(null, true);
  }
  if (allowedFileTypes.has(file.mimetype)) {
    return callback(null, true);
  }
  return callback(
    new Error("Only image, video, and document files are allowed for chat attachments")
  );
};

const chatUpload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter,
});

module.exports = { chatUpload };
