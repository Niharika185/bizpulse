const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FileData = require('../models/FileData');

// Use memory storage instead of disk storage (works on cloud platforms)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const fileName = req.file.originalname;
    const fileBase64 = req.file.buffer.toString('base64');

    // Send file content (base64) to ML service for analysis
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze`,
      { file_base64: fileBase64, file_name: fileName }
    );

    // Save to MongoDB
    const fileData = new FileData({
      fileName,
      filePath: 'memory',
      analysis: mlResponse.data
    });
    await fileData.save();

    res.json({
      success: true,
      fileId: fileData._id,
      analysis: mlResponse.data
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;