const db = require('../db');

async function findByEmail(email) {
  const [rows] = await db.query(
    'SELECT id, name, email, password, role FROM users WHERE email = ?',
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await db.query(
    'SELECT id, name, email, role FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function emailExists(email) {
  const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  return rows.length > 0;
}

async function create(data) {
  const { name, email, password, role = 'user' } = data;
  const [result] = await db.query(
    'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
    [name, email, password, role]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  emailExists,
  create,
};
