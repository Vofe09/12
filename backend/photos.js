// api/photos.js

const photos = require('../data/photos');

export default function handler(req, res) {
  const { key } = req.query;

  if (photos[key]) {
    res.status(200).json({ success: true, urls: photos[key] });
  } else {
    res.status(404).json({ success: false, message: 'Код не найден' });
  }
}
