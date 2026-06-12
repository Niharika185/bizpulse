const express = require('express');
const router = express.Router();
const FileData = require('../models/FileData');

router.post('/:fileId', async (req, res) => {
  try {
    const { question } = req.body;
    const fileData = await FileData.findById(req.params.fileId);
    if (!fileData) return res.status(404).json({ error: 'File not found' });

    const dataSummary = JSON.stringify(fileData.analysis.summary);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{
          role: 'user',
          content: `You are a data analyst. Based on this data: ${dataSummary}\n\nAnswer this question clearly and concisely: ${question}`
        }],
        max_tokens: 500
      })
    });

    const data = await response.json();
    const answer = data.choices[0].message.content;
    res.json({ success: true, answer });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;