// test-simple.js
const express = require('express');
const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.json({ message: 'Express 4.18.2 is working!' });
});

app.listen(PORT, () => {
  console.log(`✅ Express 4.18.2 running on http://localhost:${PORT}`);
  console.log('If you see this, Express is working correctly!');
});