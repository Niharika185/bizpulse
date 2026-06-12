const express = require('express');
const router = express.Router();
const FileData = require('../models/FileData');

router.post('/:fileId', async (req, res) => {
  try {
    const fileData = await FileData.findById(req.params.fileId);
    if (!fileData) return res.status(404).json({ error: 'File not found' });

    const summary = JSON.stringify(fileData.analysis.summary);

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
          content: `You are a business data analyst. Analyze this data summary and give 5 clear actionable business insights in simple English. Data: ${summary}`
        }],
        max_tokens: 1000
      })
    });

    const data = await response.json();
    console.log('Groq response:', JSON.stringify(data));

    if (!data.choices || !data.choices[0]) {
      return res.json({ success: true, insights: 'Error: ' + JSON.stringify(data) });
    }

    const insights = data.choices[0].message.content;
    res.json({ success: true, insights });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;