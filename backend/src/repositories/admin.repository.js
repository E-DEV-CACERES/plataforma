const db = require('../db');

async function getUsersWithEnrollments() {
  const [users] = await db.query(
    `SELECT u.id, u.name, u.email, u.role, u.created_at AS createdAt
     FROM users u
     ORDER BY u.created_at DESC`
  );

  const [enrollments] = await db.query(
    `SELECT cs.user_id AS userId, cs.course_id AS courseId, cs.created_at AS enrolledAt,
            c.title AS courseTitle
     FROM course_students cs
     JOIN courses c ON c.id = cs.course_id
     ORDER BY cs.created_at DESC`
  );

  const enrollmentsByUser = {};
  for (const e of enrollments) {
    if (!enrollmentsByUser[e.userId]) {
      enrollmentsByUser[e.userId] = [];
    }
    enrollmentsByUser[e.userId].push({
      courseId: e.courseId,
      courseTitle: e.courseTitle,
      enrolledAt: e.enrolledAt,
    });
  }

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt,
    enrolledCourses: enrollmentsByUser[u.id] || [],
    enrolledCount: (enrollmentsByUser[u.id] || []).length,
  }));
}

module.exports = {
  getUsersWithEnrollments,
};
