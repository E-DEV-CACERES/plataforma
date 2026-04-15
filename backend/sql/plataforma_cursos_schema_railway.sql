-- =============================================================================
-- Misma estructura que plataforma_cursos_schema.sql pero usando la BD "railway"
-- (nombre por defecto en Railway). Ejecutar en Workbench sobre la conexión
-- Railway, o: npm run db:apply-railway-schema
-- =============================================================================

USE railway;

-- ----------------------------------------------------------------------------- users
CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user', 'instructor') NOT NULL DEFAULT 'user',
  instructor_tagline VARCHAR(255) NULL,
  instructor_bio TEXT NULL,
  instructor_website VARCHAR(500) NULL,
  instructor_linkedin VARCHAR(500) NULL,
  instructor_twitter VARCHAR(500) NULL,
  instructor_youtube VARCHAR(500) NULL,
  instructor_profile_image VARCHAR(500) NULL,
  instructor_cover_image VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- courses
CREATE TABLE IF NOT EXISTS courses (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  subtitle VARCHAR(500) NULL,
  content TEXT NULL,
  instructor_tagline VARCHAR(255) NULL,
  instructor_bio TEXT NULL,
  learning_objectives TEXT NULL,
  requirements TEXT NULL,
  who_is_for TEXT NULL,
  categories TEXT NULL,
  language VARCHAR(50) NULL DEFAULT 'Spanish',
  is_free TINYINT(1) NOT NULL DEFAULT 1,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_percent INT UNSIGNED NOT NULL DEFAULT 0,
  coupon_code VARCHAR(50) NULL,
  stripe_price_id VARCHAR(255) NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_courses_created_by FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- sections
CREATE TABLE IF NOT EXISTS sections (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  `order` INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sections_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- course_students
CREATE TABLE IF NOT EXISTS course_students (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_course_user (course_id, user_id),
  CONSTRAINT fk_course_students_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_students_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- videos
CREATE TABLE IF NOT EXISTS videos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  section_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  duration INT UNSIGNED DEFAULT 0,
  video_url VARCHAR(500) NOT NULL,
  subtitle_url VARCHAR(500) NULL,
  `order` INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_videos_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_videos_section FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- course_files
CREATE TABLE IF NOT EXISTS course_files (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  section_id INT UNSIGNED NULL,
  title VARCHAR(255) NOT NULL,
  file_url VARCHAR(500) NOT NULL,
  `order` INT UNSIGNED DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_files_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_course_files_section FOREIGN KEY (section_id) REFERENCES sections (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- course_ratings
CREATE TABLE IF NOT EXISTS course_ratings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  course_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  rating TINYINT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_course_user (course_id, user_id),
  CONSTRAINT fk_ratings_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT chk_rating_range CHECK (rating >= 1 AND rating <= 5)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- progress
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
  CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_last_video FOREIGN KEY (last_watched_video_id) REFERENCES videos (id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------- progress_videos
CREATE TABLE IF NOT EXISTS progress_videos (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  progress_id INT UNSIGNED NOT NULL,
  video_id INT UNSIGNED NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_progress_video (progress_id, video_id),
  CONSTRAINT fk_progress_videos_progress FOREIGN KEY (progress_id) REFERENCES progress (id) ON DELETE CASCADE,
  CONSTRAINT fk_progress_videos_video FOREIGN KEY (video_id) REFERENCES videos (id) ON DELETE CASCADE
) ENGINE=InnoDB;
