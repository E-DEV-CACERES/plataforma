/**
 * Script para crear la base de datos y tablas.
 * Ejecutar una vez: node scripts/init-db.js
 */
require('dotenv').config();
const mysql = require('mysql2/promise');

const config = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '123456',
};

async function init() {
  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Conectado a MySQL...');

    await conn.query("CREATE DATABASE IF NOT EXISTS plataforma_cursos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    console.log('Base de datos plataforma_cursos creada o ya existe.');

    await conn.query('USE plataforma_cursos');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    console.log('Tabla users OK');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS courses (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        content TEXT NULL,
        created_by INT UNSIGNED NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log('Tabla courses OK');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS course_students (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_id INT UNSIGNED NOT NULL,
        user_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_course_user (course_id, user_id),
        CONSTRAINT fk_course_students_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT fk_course_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('Tabla course_students OK');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        course_id INT UNSIGNED NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NULL,
        duration INT UNSIGNED DEFAULT 0,
        video_url VARCHAR(500) NOT NULL,
        \`order\` INT UNSIGNED DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_videos_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('Tabla videos OK');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS progress (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNSIGNED NOT NULL,
        course_id INT UNSIGNED NOT NULL,
        last_watched_video_id INT UNSIGNED NULL,
        progress_percentage INT UNSIGNED NOT NULL DEFAULT 0,
        completed_at DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_user_course (user_id, course_id),
        CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_progress_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
        CONSTRAINT fk_progress_last_video FOREIGN KEY (last_watched_video_id) REFERENCES videos(id) ON DELETE SET NULL
      ) ENGINE=InnoDB
    `);
    console.log('Tabla progress OK');

    await conn.query(`
      CREATE TABLE IF NOT EXISTS progress_videos (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
        progress_id INT UNSIGNED NOT NULL,
        video_id INT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_progress_video (progress_id, video_id),
        CONSTRAINT fk_progress_videos_progress FOREIGN KEY (progress_id) REFERENCES progress(id) ON DELETE CASCADE,
        CONSTRAINT fk_progress_videos_video FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);
    console.log('Tabla progress_videos OK');

    console.log('\n✅ Base de datos inicializada correctamente.');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  } finally {
    if (conn) await conn.end();
  }
}

init();
