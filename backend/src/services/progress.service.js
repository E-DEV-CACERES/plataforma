const db = require('../db');
const videoRepository = require('../repositories/video.repository');
const progressRepository = require('../repositories/progress.repository');
const courseRepository = require('../repositories/course.repository');
const { AppError } = require('../utils/errors');

async function markVideoWatched(courseId, videoId, userId) {
  const isEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (!isEnrolled) {
    throw new AppError('Debes estar inscrito en el curso para registrar tu progreso.', 403);
  }

  const exists = await videoRepository.existsInCourse(videoId, courseId);
  if (!exists) {
    throw new AppError('Video no encontrado.', 404);
  }

  const progress = await progressRepository.findOrCreate(userId, courseId);

  const alreadyWatched = await progressRepository.findProgressVideo(progress.id, videoId);
  if (alreadyWatched) {
    const totalVideos = await videoRepository.countByCourseId(courseId);
    const watchedCount = await progressRepository.countWatchedVideos(progress.id);
    const progressPercentage =
      totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
    return {
      message: 'Video marcado como visto.',
      progress: {
        progressPercentage,
        completedAt: progressPercentage === 100 ? progress.completedAt : null,
      },
    };
  }

  await progressRepository.addVideoWatched(progress.id, videoId);

  const totalVideos = await videoRepository.countByCourseId(courseId);
  const watchedVideos = await progressRepository.countWatchedVideos(progress.id);
  const progressPercentage =
    totalVideos > 0 ? Math.round((watchedVideos / totalVideos) * 100) : 0;
  const completedAt = progressPercentage === 100 ? new Date() : null;

  await progressRepository.updateProgress(progress.id, {
    lastWatchedVideoId: videoId,
    progressPercentage,
    completedAt,
  });

  return {
    message: 'Video marcado como visto.',
    progress: { progressPercentage, completedAt },
  };
}

async function getProgress(courseId, userId) {
  const isEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (!isEnrolled) {
    return {
      progressPercentage: 0,
      completedAt: null,
      videosWatched: [],
    };
  }

  const progress = await progressRepository.findOrCreate(userId, courseId);

  const [videosWatched] = await db.query(
    `SELECT v.id, v.title, v.duration
     FROM progress_videos pv
     JOIN videos v ON pv.video_id = v.id AND v.course_id = ?
     WHERE pv.progress_id = ?`,
    [courseId, progress.id]
  );

  const totalVideos = await videoRepository.countByCourseId(courseId);
  const watchedCount = videosWatched.length;
  const progressPercentage =
    totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
  const completedAt = progressPercentage === 100 ? (progress.completedAt || new Date()) : null;

  return {
    ...progress,
    progressPercentage,
    completedAt,
    videosWatched,
  };
}

async function getAllProgressByCourse(courseId) {
  return progressRepository.getAllByCourseId(courseId);
}

module.exports = {
  markVideoWatched,
  getProgress,
  getAllProgressByCourse,
};
