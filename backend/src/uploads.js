import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import express from "express";
import { resolveUploadDir } from "./dataPaths.js";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif"]);

export function getUploadDir(repoRoot) {
  return resolveUploadDir(repoRoot);
}

/**
 * @param {import("express").Express} app
 * @param {{ repoRoot: string; requireAuth: import("express").RequestHandler }} opts
 */
export function mountFileUploads(app, { repoRoot, requireAuth }) {
  const uploadDir = getUploadDir(repoRoot);
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("[uploads] serving /uploads from %s", uploadDir);

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname || "").toLowerCase().slice(0, 12);
      const extFinal = ALLOWED_EXT.has(ext) ? ext : ".jpg";
      cb(null, `${Date.now()}-${crypto.randomBytes(8).toString("hex")}${extFinal}`);
    },
  });

  const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
      else cb(new Error("INVALID_IMAGE_TYPE"));
    },
  });

  app.post("/api/upload", requireAuth, (req, res) => {
    upload.single("file")(req, res, (err) => {
      if (err) {
        if (err.message === "INVALID_IMAGE_TYPE") {
          return res.status(400).json({
            error: "invalid_image_type",
            message: "Solo se permiten JPEG, PNG, WebP o GIF.",
          });
        }
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ error: "file_too_large", message: "El archivo supera 5 MB." });
        }
        return res.status(500).json({ error: "upload_failed" });
      }
      if (!req.file) return res.status(400).json({ error: "no_file", message: "Selecciona un archivo." });
      res.json({ url: `/uploads/${req.file.filename}` });
    });
  });

  app.use("/uploads", express.static(uploadDir, { maxAge: "7d", etag: true }));
}
