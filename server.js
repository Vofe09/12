// server.js

const express = require('express');
const app = express();
const path = require('path');
const getPhotos = require('./backend/get-photos');

app.use(express.static('my wn website'));
app.use('/api/photos', getPhotos);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});
