const authRoutes = require('./auth.routes');
const courseRoutes = require('./courses.routes');
const instructorRoutes = require('./instructor.routes');
const videosRoutes = require('./videos.routes');
const progressRoutes = require('./progress.routes');
const sectionsRoutes = require('./sections.routes');
const courseFilesRoutes = require('./courseFiles.routes');
const adminRoutes = require('./admin.routes');

function mountRoutes(app) {
  app.use('/api/auth', authRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/instructors', instructorRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/videos', videosRoutes);
  app.use('/api/progress', progressRoutes);
  app.use('/api/sections', sectionsRoutes);
  app.use('/api/course-files', courseFilesRoutes);
}

module.exports = mountRoutes;
