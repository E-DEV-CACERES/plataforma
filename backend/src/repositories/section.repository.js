const db = require('../db');

async function findByCourseId(courseId) {
  const [rows] = await db.query(
    `SELECT id, course_id AS courseId, title, \`order\`, created_at AS createdAt
     FROM sections WHERE course_id = ? ORDER BY \`order\` ASC, id ASC`,
    [courseId]
  );
  return rows;
}

async function findById(id) {
  const [rows] = await db.query(
    'SELECT id, course_id AS courseId, title, `order`, created_at AS createdAt FROM sections WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function create(data) {
  const { courseId, title, order } = data;
  const [result] = await db.query(
    'INSERT INTO sections (course_id, title, `order`) VALUES (?, ?, ?)',
    [courseId, title || 'Sección', order ?? 0]
  );
  return result.insertId;
}

async function update(id, data) {
  const { title, order } = data;
  const [result] = await db.query(
    `UPDATE sections SET title = COALESCE(?, title), \`order\` = COALESCE(?, \`order\`) WHERE id = ?`,
    [title, typeof order === 'undefined' ? null : Number(order), id]
  );
  return result.affectedRows > 0;
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM sections WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  findByCourseId,
  findById,
  create,
  update,
  remove,
};
