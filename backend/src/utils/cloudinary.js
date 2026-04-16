const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}

async function uploadVideo(file, courseId) {
  return uploadBuffer(file.buffer, {
    resource_type: 'video',
    folder: `plataforma/videos/course-${courseId}`,
    format: 'mp4',
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
}

async function uploadSubtitle(file, courseId) {
  return uploadBuffer(file.buffer, {
    resource_type: 'raw',
    folder: `plataforma/subtitles/course-${courseId}`,
  });
}

async function uploadImage(file, folder) {
  return uploadBuffer(file.buffer, {
    resource_type: 'image',
    folder: `plataforma/${folder}`,
    transformation: [{ quality: 'auto', fetch_format: 'auto' }],
  });
}

async function uploadFile(file, courseId) {
  return uploadBuffer(file.buffer, {
    resource_type: 'auto',
    folder: `plataforma/files/course-${courseId}`,
  });
}

async function deleteResource(publicId, resourceType = 'image') {
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (err) {
    console.warn('Cloudinary delete failed:', err.message);
    return null;
  }
}

module.exports = {
  cloudinary,
  uploadVideo,
  uploadSubtitle,
  uploadImage,
  uploadFile,
  deleteResource,
};
