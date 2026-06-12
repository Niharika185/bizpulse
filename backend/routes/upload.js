const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const FileData = require('../models/FileData');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const filePath = path.resolve(req.file.path).replace(/\\/g, '/')
    const fileName = req.file.originalname;

    // Send file to ML service for analysis
    const mlResponse = await axios.post(
      `${process.env.ML_SERVICE_URL}/analyze`,
      { file_path: filePath, file_name: fileName }
    );

    // Save to MongoDB
    const fileData = new FileData({
      fileName,
      filePath,
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