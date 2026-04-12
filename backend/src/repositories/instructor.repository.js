const db = require('../db');

async function getProfileById(instructorId) {
  let user;
  try {
    const [users] = await db.query(
      `SELECT id, name, email, role, created_at AS createdAt,
              instructor_tagline AS instructorTagline, instructor_bio AS instructorBio,
              instructor_website AS instructorWebsite, instructor_linkedin AS instructorLinkedin,
              instructor_twitter AS instructorTwitter, instructor_youtube AS instructorYoutube,
              instructor_profile_image AS instructorProfileImage, instructor_cover_image AS instructorCoverImage
       FROM users WHERE id = ?`,
      [instructorId]
    );
    user = users[0];
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.message?.includes('Unknown column')) {
      const [users] = await db.query(
        `SELECT id, name, email, role, created_at AS createdAt,
                instructor_tagline AS instructorTagline, instructor_bio AS instructorBio,
                instructor_website AS instructorWebsite, instructor_linkedin AS instructorLinkedin,
                instructor_twitter AS instructorTwitter, instructor_youtube AS instructorYoutube
         FROM users WHERE id = ?`,
        [instructorId]
      );
      user = users[0];
      if (user) {
        user.instructorProfileImage = null;
        user.instructorCoverImage = null;
      }
    } else {
      throw err;
    }
  }
  if (!user) return null;

  const [courses] = await db.query(
    `SELECT c.id, c.title, c.description, c.instructor_tagline AS instructorTagline, c.instructor_bio AS instructorBio,
            c.created_at AS createdAt,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
            (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
     FROM courses c
     WHERE c.created_by = ?
     ORDER BY c.created_at DESC`,
    [instructorId]
  );

  const instructorCourses = courses.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    instructorTagline: row.instructorTagline,
    instructorBio: row.instructorBio,
    createdAt: row.createdAt,
    studentsCount: Number(row.studentsCount ?? 0),
    averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
    ratingsCount: Number(row.ratingsCount ?? 0),
    totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
  }));

  const totalStudents = instructorCourses.reduce((acc, c) => acc + c.studentsCount, 0);
  const avgRating =
    instructorCourses.length > 0
      ? instructorCourses.reduce((acc, c) => acc + c.averageRating * c.ratingsCount, 0) /
        Math.max(1, instructorCourses.reduce((acc, c) => acc + c.ratingsCount, 0))
      : 0;
  const totalReviews = instructorCourses.reduce((acc, c) => acc + c.ratingsCount, 0);

  const latestCourse = instructorCourses[0];
  // Prefer user-level instructor profile over course-level
  const instructorTagline = user.instructorTagline || latestCourse?.instructorTagline || null;
  const instructorBio = user.instructorBio || latestCourse?.instructorBio || null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    instructorTagline,
    instructorBio,
    instructorWebsite: user.instructorWebsite || null,
    instructorLinkedin: user.instructorLinkedin || null,
    instructorTwitter: user.instructorTwitter || null,
    instructorYoutube: user.instructorYoutube || null,
    instructorProfileImage: user.instructorProfileImage || null,
    instructorCoverImage: user.instructorCoverImage || null,
    coursesCount: instructorCourses.length,
    totalStudents,
    averageRating: Number(avgRating.toFixed(1)),
    totalReviews,
    courses: instructorCourses,
  };
}

async function updateProfile(userId, data) {
  const {
    instructorTagline,
    instructorBio,
    instructorWebsite,
    instructorLinkedin,
    instructorTwitter,
    instructorYoutube,
  } = data;

  const [result] = await db.query(
    `UPDATE users SET
      instructor_tagline = COALESCE(?, instructor_tagline),
      instructor_bio = COALESCE(?, instructor_bio),
      instructor_website = COALESCE(?, instructor_website),
      instructor_linkedin = COALESCE(?, instructor_linkedin),
      instructor_twitter = COALESCE(?, instructor_twitter),
      instructor_youtube = COALESCE(?, instructor_youtube)
    WHERE id = ?`,
    [
      instructorTagline ?? null,
      instructorBio ?? null,
      instructorWebsite ?? null,
      instructorLinkedin ?? null,
      instructorTwitter ?? null,
      instructorYoutube ?? null,
      userId,
    ]
  );
  return result.affectedRows > 0;
}

async function updateProfileImage(userId, imagePath) {
  const [result] = await db.query(
    'UPDATE users SET instructor_profile_image = ? WHERE id = ?',
    [imagePath, userId]
  );
  return result.affectedRows > 0;
}

async function updateCoverImage(userId, imagePath) {
  const [result] = await db.query(
    'UPDATE users SET instructor_cover_image = ? WHERE id = ?',
    [imagePath, userId]
  );
  return result.affectedRows > 0;
}

module.exports = {
  getProfileById,
  updateProfile,
  updateProfileImage,
  updateCoverImage,
};
