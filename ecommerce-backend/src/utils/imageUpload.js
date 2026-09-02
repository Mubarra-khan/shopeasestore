const fs = require("fs");
const path = require("path");
const multer = require("multer");
const crypto = require("crypto");

const uploadDirectory = path.join(__dirname, "..", "uploads", "products");
fs.mkdirSync(uploadDirectory, { recursive: true });

const allowedTypes = new Map([
	["image/jpeg", ".jpg"],
	["image/png", ".png"],
	["image/webp", ".webp"],
]);

const allowedVideoTypes = new Map([
	["video/mp4", ".mp4"],
	["video/webm", ".webm"],
	["video/ogg", ".ogg"],
	["video/quicktime", ".mov"],
]);

const storage = multer.diskStorage({
	destination: uploadDirectory,
	filename: (req, file, callback) => {
		const ext = allowedTypes.get(file.mimetype) || allowedVideoTypes.get(file.mimetype) || "";
		callback(null, `${crypto.randomUUID()}${ext}`);
	},
});

const imageUpload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (!allowedTypes.has(file.mimetype)) {
			return callback(new Error("Only JPG, JPEG, PNG, and WEBP images are allowed"));
		}
		return callback(null, true);
	},
});

const videoUpload = multer({
	storage,
	limits: { fileSize: 50 * 1024 * 1024 },
	fileFilter: (req, file, callback) => {
		if (!allowedVideoTypes.has(file.mimetype)) {
			return callback(new Error("Only MP4, WEBM, OGG, and MOV videos are allowed"));
		}
		return callback(null, true);
	},
});

module.exports = { imageUpload, videoUpload };