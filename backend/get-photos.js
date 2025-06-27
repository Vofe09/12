// backend/get-photos.js

const express = require('express');
const router = express.Router();
const photos = require('./photos');

router.get('/:key', (req, res) => {
  const key = req.params.key;
  if (photos[key]) {
    res.json({ success: true, urls: photos[key] });
  } else {
    res.json({ success: false, message: 'Код не найден' });
  }
});

module.exports = router;
