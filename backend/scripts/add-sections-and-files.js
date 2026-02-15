/**
 * Migración: añade tablas sections y course_files, y section_id a videos.
 * Ejecutar: node scripts/add-sections-and-files.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
  database: process.env.MYSQL_DATABASE || 'plataforma_cursos',
};

async function migrate() {
  let conn;
  try {
    conn = await mysql.createConnection(config);

    await conn.query(`
      CREATE TABLE IF NOT EXISTS sections (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_id INT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        \`order\` INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_sections_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('Tabla sections OK');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS course_files (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_id INT UNSIGNED NOT NULL,
        section_id INT UNSIGNED NULL,
        title VARCHAR(255) NOT NULL,
        file_url VARCHAR(500) NOT NULL,
        \`order\` INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_course_files_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT fk_course_files_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log('Tabla course_files OK');

    try {
      await conn.query('ALTER TABLE videos ADD COLUMN section_id INT UNSIGNED NULL AFTER course_id');
      await conn.query('ALTER TABLE videos ADD CONSTRAINT fk_videos_section FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE SET NULL');
      console.log('Columna section_id añadida a videos');
    } catch (e) {
      if (e.code === 'ER_DUP_FIELD') console.log('Columna section_id ya existe en videos');
      else throw e;
    }

    console.log('\n✅ Migración completada.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

migrate();
