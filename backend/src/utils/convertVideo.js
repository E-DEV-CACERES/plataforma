/**
 * Convierte video a MP4 H.264 para compatibilidad con todos los navegadores.
 * Requiere ffmpeg instalado en el sistema.
 * Si el video ya es H.264, solo aplica -movflags +faststart para streaming web.
 * @param {string} inputPath - Ruta absoluta del archivo de entrada
 * @returns {Promise<boolean>} - true si se procesó correctamente
 */
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

function getVideoCodec(inputPath) {
  return new Promise((resolve) => {
    ffmpeg.ffprobe(inputPath, (err, data) => {
      if (err) {
        resolve(null);
        return;
      }
      const videoStream = data.streams?.find((s) => s.codec_type === 'video');
      resolve(videoStream?.codec_name || null);
    });
  });
}

function convertToH264(inputPath) {
  return new Promise((resolve) => {
    if (!fs.existsSync(inputPath)) {
      resolve(false);
      return;
    }
    const ext = path.extname(inputPath).toLowerCase();
    if (ext !== '.mp4' && ext !== '.m4v') {
      resolve(false);
      return;
    }
    getVideoCodec(inputPath).then((codec) => {
      const needsConversion = codec && codec !== 'h264' && codec !== 'avc1';
      const outputPath = inputPath + '.out.mp4';
      const cmd = ffmpeg(inputPath);
      if (needsConversion) {
        cmd.outputOptions(['-c:v libx264', '-preset fast', '-crf 23', '-c:a aac', '-movflags +faststart']);
      } else {
        cmd.outputOptions(['-c copy', '-movflags +faststart']);
      }
      cmd
        .output(outputPath)
        .on('end', () => {
          try {
            fs.unlinkSync(inputPath);
            fs.renameSync(outputPath, inputPath);
            resolve(true);
          } catch (err) {
            console.warn('convertVideo: error al reemplazar archivo', err.message);
            if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
            resolve(false);
          }
        })
        .on('error', (err) => {
          console.warn('convertVideo:', err.message);
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          resolve(false);
        })
        .run();
    }).catch(() => resolve(false));
  });
}

module.exports = { convertToH264 };
