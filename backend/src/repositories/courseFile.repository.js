const db = require('../db');

async function findByCourseId(courseId) {
  const [rows] = await db.query(
    `SELECT id, course_id AS courseId, section_id AS sectionId, title, file_url AS fileUrl,
            \`order\`, created_at AS createdAt
     FROM course_files WHERE course_id = ? ORDER BY \`order\` ASC, id ASC`,
    [courseId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    `SELECT id, course_id AS courseId, section_id AS sectionId, title, file_url AS fileUrl,
            \`order\`, created_at AS createdAt FROM course_files WHERE id = ?`,
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { courseId, sectionId, title, fileUrl, order } = data;
  const [result] = await db.query(
    `INSERT INTO course_files (course_id, section_id, title, file_url, \`order\`)
     VALUES (?, ?, ?, ?, ?)`,
    [courseId, sectionId || null, title, fileUrl, order ?? 0]
  );
  return result.insertId;
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM course_files WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findByCourseId,
  findById,
  create,
  remove,
};
