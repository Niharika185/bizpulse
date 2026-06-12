const mongoose = require('mongoose');

const FileDataSchema = new mongoose.Schema({
  fileName: String,
  filePath: String,
  analysis: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FileData', FileDataSchema);