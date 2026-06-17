const express = require("express");
const multer = require("multer");
const csv = require("csvtojson");
const fs = require("fs");

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// POST /api/upload-csv (handles both CSV and JSON files)
router.post("/upload-csv", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    let jsonArray;
    if (req.file.originalname.endsWith(".json")) {
      const rawData = fs.readFileSync(req.file.path, "utf-8");
      jsonArray = JSON.parse(rawData);
    } else {
      jsonArray = await csv().fromFile(req.file.path);
    }

    // remove temp file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error("Error deleting file:", err);
    });

    res.json({
      message: "File processed successfully",
      data: jsonArray,
    });
  } catch (err) {
    res.status(500).json({ error: "Error parsing file", detail: err.message });
  }
});

module.exports = router;