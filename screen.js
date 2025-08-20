const express = require('express');
const screenshot = require('screenshot-desktop');
const app = express();

let lastImage = null;

// Ambil screenshot setiap 500ms
setInterval(async () => {
  try {
    const img = await screenshot({ format: 'jpg' });
    lastImage = img;
  } catch (err) {
    console.error('Gagal ambil screenshot:', err);
  }
}, 500);

// Stream gambar sebagai MJPEG
app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=frame',
    'Cache-Control': 'no-cache',
    'Connection': 'close',
    'Pragma': 'no-cache'
  });

  const interval = setInterval(() => {
    if (!lastImage) return;
    res.write('--frame\r\n');
    res.write('Content-Type: image/jpeg\r\n\r\n');
    res.write(lastImage);
    res.write('\r\n');
  }, 500);

  req.on('close', () => clearInterval(interval));
});

// Jalankan server di port 3000
app.listen(3000, () => {
  console.log('🖥️ Stream dimulai di http://localhost:3000/stream');
});