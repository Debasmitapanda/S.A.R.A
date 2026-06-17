// const express = require("express");
// const multer = require("multer");
// const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
// // import fetch from "node-fetch";
// const FormData = require("form-data");
// const fs = require("fs");

// const router = express.Router();
// const upload = multer({ dest: "uploads/" }); // temp storage

// router.post("/analyze", upload.single("file"), async (req, res) => {
//   try {
//     const formData = new FormData();
//      formData.append("file", fs.createReadStream(req.file.path), req.file.originalname);

//     const flaskRes = await fetch("http://localhost:5000/analyze", {
//       method: "POST",
//       body: formData,
//        headers: formData.getHeaders(),
//     });

//     const data = await flaskRes.json();
//     res.json(data); // forward Flask response to frontend
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to analyze file" });
//   }
// });

// module.exports = router;
const express = require("express");
const multer = require("multer");
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const FormData = require("form-data");
const fs = require("fs");
const router = express.Router();

const upload = multer({ dest: "uploads/" });

// router.post("/analyze", upload.single("file"), async (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }

//   try {
//     const formData = new FormData();
//     formData.append("file", fs.createReadStream(req.file.path), req.file.originalname);

//     const flaskRes = await fetch("http://127.0.0.1:5000/analyze", {
//       method: "POST",
//       body: formData,
//       headers: formData.getHeaders(),
//     });

//     // Check if Flask responded with JSON or not
//     const text = await flaskRes.text();
   
//     try {
//       const data = JSON.parse(text);
//       res.json(data); // forward valid JSON
//     } catch (parseErr) {
//       console.error("Flask returned non-JSON:", text);
//       res.status(500).json({ error: "Flask server did not return JSON" });
//     }
//   } catch (err) {
//     console.error("Error proxying to Flask:", err);
//     res.status(500).json({ error: "Failed to analyze file" });
//   } finally {
//     // Optional: delete uploaded file after processing
//     fs.unlink(req.file.path, () => {});
//   }
// });

router.post("/analyze", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  try {
    const amendmentId = req.body.amendmentId; // 👈 get amendmentId from frontend
    if (!amendmentId) {
      return res.status(400).json({ error: "Missing amendmentId" });
    }

    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path), req.file.originalname);
    formData.append("amendmentId", amendmentId); // 👈 forward to Flask

    const flaskRes = await fetch("http://127.0.0.1:5000/analyze", {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    // Handle Flask response
    const text = await flaskRes.text();
    try {
      const data = JSON.parse(text);
      res.json(data); // forward valid JSON
    } catch (parseErr) {
      console.error("Flask returned non-JSON:", text);
      res.status(500).json({ error: "Flask server did not return JSON" });
    }
  } catch (err) {
    console.error("Error proxying to Flask:", err);
    res.status(500).json({ error: "Failed to analyze file" });
  } finally {
    // Optional: delete uploaded file after processing
    fs.unlink(req.file.path, () => {});
  }
});

module.exports = router;