const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.get('/stream', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'multipart/x-mixed-replace; boundary=--frame',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Pragma': 'no-cache'
  });

  const ffmpeg = spawn('ffmpeg', [
    '-f', 'gdigrab',             // ✅ capture screen Windows
    '-framerate', '10',          // ✅ 10 fps
    '-draw_mouse', '1',          // ✅ tampilkan kursor
    '-i', 'desktop',             // ✅ input dari desktop
    '-vf', 'scale=640:360',      // ✅ ubah ukuran video
    '-fflags', 'nobuffer',       // ✅ minimal delay
    '-q:v', '5',                 // ✅ kualitas JPEG
    '-f', 'mjpeg',               // ✅ output format MJPEG
    'pipe:1'                     // ✅ output ke stdout
  ]);

  ffmpeg.stdout.on('data', (chunk) => {
    res.write(`--frame\r\n`);
    res.write(`Content-Type: image/jpeg\r\n`);
    res.write(`Content-Length: ${chunk.length}\r\n\r\n`);
    res.write(chunk);
    res.write(`\r\n`);
  });

  ffmpeg.stderr.on('data', (data) => {
    console.error('[FFmpeg]', data.toString());
  });

  ffmpeg.on('close', (code) => {
    console.log(`FFmpeg exited with code ${code}`);
    try { res.end(); } catch {}
  });

  req.on('close', () => {
    ffmpeg.kill('SIGTERM');
  });
});

app.listen(3000, () => {
  console.log('✅ Streaming aktif di http://localhost:3000/stream (tanpa batas waktu)');
});
