const db = require('../db');

async function findAll(search = '') {
  const searchCondition = search.trim()
    ? 'AND (c.title LIKE ? OR c.description LIKE ?)'
    : '';
  const searchParams = search.trim()
    ? [`%${search.trim()}%`, `%${search.trim()}%`]
    : [];

  const fullQuery = `SELECT c.id, c.title, c.description, c.content, c.created_at AS createdAt,
            c.is_free AS isFree, c.price, c.discount_percent AS discountPercent, c.coupon_code AS couponCode,
            c.stripe_price_id AS stripePriceId,
            u.id AS createdById, u.name AS createdByName, u.email AS createdByEmail,
            u.instructor_profile_image AS createdByProfileImage,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
            (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     WHERE 1=1 ${searchCondition}
     ORDER BY c.created_at DESC`;

  const minimalQuery = `SELECT c.id, c.title, c.description, c.content, c.created_at AS createdAt,
            c.is_free AS isFree, c.price, c.discount_percent AS discountPercent, c.coupon_code AS couponCode,
            c.stripe_price_id AS stripePriceId,
            u.id AS createdById, u.name AS createdByName, u.email AS createdByEmail,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            0 AS averageRating, 0 AS ratingsCount,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     WHERE 1=1 ${searchCondition}
     ORDER BY c.created_at DESC`;

  let rows;
  try {
    [rows] = await db.query(fullQuery, searchParams);
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.code === 'ER_NO_SUCH_TABLE' || err.message?.includes('Unknown column')) {
      [rows] = await db.query(
        `SELECT c.id, c.title, c.description, c.content, c.created_at AS createdAt,
            u.id AS createdById, u.name AS createdByName, u.email AS createdByEmail,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            0 AS averageRating, 0 AS ratingsCount,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
         FROM courses c
         LEFT JOIN users u ON c.created_by = u.id
         WHERE 1=1 ${searchCondition}
         ORDER BY c.created_at DESC`,
        searchParams
      );
      rows = (rows || []).map((r) => ({ ...r, isFree: true, price: 0, discountPercent: 0, couponCode: null, stripePriceId: null }));
    } else {
      throw err;
    }
  }

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    content: row.content,
    createdAt: row.createdAt,
    isFree: Boolean(row.isFree),
    price: Number(row.price ?? 0),
    discountPercent: Number(row.discountPercent ?? 0),
    couponCode: row.couponCode || null,
    stripePriceId: row.stripePriceId || null,
    createdById: row.createdById,
    createdByName: row.createdByName,
    createdByEmail: row.createdByEmail,
    createdByProfileImage: row.createdByProfileImage || null,
    studentsCount: Number(row.studentsCount ?? 0),
    averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
    ratingsCount: Number(row.ratingsCount ?? 0),
    totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
  }));
}

function parseJsonArray(val) {
  if (val == null || val === '') return null;
  if (Array.isArray(val)) return val;
  try {
    const parsed = typeof val === 'string' ? JSON.parse(val) : val;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

async function findById(id) {
  let row;
  try {
    const [rows] = await db.query(
      `SELECT c.id, c.title, c.description, c.content, c.subtitle,
              c.instructor_tagline AS instructorTagline, c.instructor_bio AS instructorBio,
              c.learning_objectives AS learningObjectives, c.requirements, c.who_is_for AS whoIsFor,
              c.categories, c.language,
              c.is_free AS isFree, c.price, c.discount_percent AS discountPercent, c.coupon_code AS couponCode,
              c.stripe_price_id AS stripePriceId,
              c.created_by AS createdBy, c.created_at AS createdAt,
              u.id AS createdById, u.name AS createdByName,
              u.instructor_profile_image AS createdByProfileImage,
              (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
              (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
              (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
              (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds,
              (SELECT COALESCE(GREATEST(MAX(updated_at), MAX(created_at)), c.created_at) FROM videos WHERE course_id = c.id) AS lastUpdatedAt
       FROM courses c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = ?`,
      [id]
    );
    row = rows[0];
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.message?.includes('Unknown column')) {
      const [rows] = await db.query(
        `SELECT c.id, c.title, c.description, c.content, c.instructor_tagline AS instructorTagline, c.instructor_bio AS instructorBio,
                c.created_by AS createdBy, c.created_at AS createdAt,
                u.id AS createdById, u.name AS createdByName,
                (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
                (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
                (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
                (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds,
                (SELECT COALESCE(GREATEST(MAX(updated_at), MAX(created_at)), c.created_at) FROM videos WHERE course_id = c.id) AS lastUpdatedAt
         FROM courses c
         LEFT JOIN users u ON c.created_by = u.id
         WHERE c.id = ?`,
        [id]
      );
      row = rows[0];
      if (row) {
        row.subtitle = null;
        row.learningObjectives = null;
        row.requirements = null;
        row.whoIsFor = null;
        row.categories = null;
        row.language = null;
        row.createdByProfileImage = null;
        row.isFree = true;
        row.price = 0;
        row.discountPercent = 0;
        row.couponCode = null;
      }
    } else {
      throw err;
    }
  }
  if (!row) return null;
  return {
    ...row,
    isFree: Boolean(row.isFree),
    price: Number(row.price ?? 0),
    discountPercent: Number(row.discountPercent ?? 0),
    couponCode: row.couponCode || null,
    stripePriceId: row.stripePriceId || null,
    learningObjectives: parseJsonArray(row.learningObjectives),
    requirements: parseJsonArray(row.requirements),
    whoIsFor: parseJsonArray(row.whoIsFor),
    categories: parseJsonArray(row.categories),
    studentsCount: Number(row.studentsCount ?? 0),
    averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
    ratingsCount: Number(row.ratingsCount ?? 0),
    totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
    lastUpdatedAt: row.lastUpdatedAt ?? row.createdAt,
  };
}

async function exists(id) {
  const [rows] = await db.query('SELECT id FROM courses WHERE id = ?', [id]);
  return rows.length > 0;
}

function jsonStringifyArray(arr) {
  if (arr == null) return null;
  if (!Array.isArray(arr)) return null;
  try {
    return JSON.stringify(arr);
  } catch {
    return null;
  }
}

async function create(data) {
  const {
    title, description, content, createdBy, instructorTagline, instructorBio,
    subtitle, learningObjectives, requirements, whoIsFor, categories, language,
    isFree, price, discountPercent, couponCode, stripePriceId,
  } = data;
  const freeVal = isFree ? 1 : 0;
  const priceVal = Number(price) ?? 0;
  const discountVal = Math.min(100, Math.max(0, Number(discountPercent) ?? 0));
  try {
    const [result] = await db.query(
      `INSERT INTO courses (title, description, content, subtitle, instructor_tagline, instructor_bio,
        learning_objectives, requirements, who_is_for, categories, language,
        is_free, price, discount_percent, coupon_code, stripe_price_id, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description || null, content || null, subtitle || null,
        instructorTagline || null, instructorBio || null,
        jsonStringifyArray(learningObjectives), jsonStringifyArray(requirements),
        jsonStringifyArray(whoIsFor), jsonStringifyArray(categories), language || null,
        freeVal, priceVal, discountVal, couponCode || null, stripePriceId || null,
        createdBy,
      ]
    );
    return result.insertId;
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.message?.includes('Unknown column')) {
      const [result] = await db.query(
        'INSERT INTO courses (title, description, content, instructor_tagline, instructor_bio, is_free, price, discount_percent, coupon_code, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [title, description || null, content || null, instructorTagline || null, instructorBio || null, freeVal, priceVal, discountVal, couponCode || null, createdBy]
      );
      return result.insertId;
    }
    throw err;
  }
}

async function update(id, data) {
  const {
    title, description, content, instructorTagline, instructorBio,
    subtitle, learningObjectives, requirements, whoIsFor, categories, language,
    isFree, price, discountPercent, couponCode, stripePriceId,
  } = data;
  const updates = [];
  const params = [];
  const push = (col, val) => {
    updates.push(`${col} = COALESCE(?, ${col})`);
    params.push(val);
  };
  if (title !== undefined) push('title', title);
  if (description !== undefined) push('description', description);
  if (content !== undefined) push('content', content);
  if (subtitle !== undefined) push('subtitle', subtitle);
  if (instructorTagline !== undefined) push('instructor_tagline', instructorTagline);
  if (instructorBio !== undefined) push('instructor_bio', instructorBio);
  if (learningObjectives !== undefined) push('learning_objectives', jsonStringifyArray(learningObjectives));
  if (requirements !== undefined) push('requirements', jsonStringifyArray(requirements));
  if (whoIsFor !== undefined) push('who_is_for', jsonStringifyArray(whoIsFor));
  if (categories !== undefined) push('categories', jsonStringifyArray(categories));
  if (language !== undefined) push('language', language);
  if (isFree !== undefined) push('is_free', isFree ? 1 : 0);
  if (price !== undefined) push('price', Number(price) ?? 0);
  if (discountPercent !== undefined) push('discount_percent', Math.min(100, Math.max(0, Number(discountPercent) ?? 0)));
  if (couponCode !== undefined) push('coupon_code', couponCode || null);
  if (stripePriceId !== undefined) push('stripe_price_id', stripePriceId || null);
  if (updates.length === 0) return false;
  params.push(id);
  try {
    const [result] = await db.query(`UPDATE courses SET ${updates.join(', ')} WHERE id = ?`, params);
    return result.affectedRows > 0;
  } catch (err) {
    if (err.code === 'ER_BAD_FIELD_ERROR' || err.message?.includes('Unknown column')) {
      const legacyUpdates = [];
      const legacyParams = [];
      if (title !== undefined) { legacyUpdates.push('title = COALESCE(?, title)'); legacyParams.push(title); }
      if (description !== undefined) { legacyUpdates.push('description = COALESCE(?, description)'); legacyParams.push(description); }
      if (content !== undefined) { legacyUpdates.push('content = COALESCE(?, content)'); legacyParams.push(content); }
      if (instructorTagline !== undefined) { legacyUpdates.push('instructor_tagline = COALESCE(?, instructor_tagline)'); legacyParams.push(instructorTagline); }
      if (instructorBio !== undefined) { legacyUpdates.push('instructor_bio = COALESCE(?, instructor_bio)'); legacyParams.push(instructorBio); }
      if (legacyUpdates.length === 0) return false;
      legacyParams.push(id);
      const [result] = await db.query(`UPDATE courses SET ${legacyUpdates.join(', ')} WHERE id = ?`, legacyParams);
      return result.affectedRows > 0;
    }
    throw err;
  }
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM courses WHERE id = ?', [id]);
  return result.affectedRows > 0;
}

async function isEnrolled(courseId, userId) {
  const [rows] = await db.query(
    'SELECT id FROM course_students WHERE course_id = ? AND user_id = ?',
    [courseId, userId]
  );
  return rows.length > 0;
}

async function enroll(courseId, userId) {
  await db.query(
    'INSERT INTO course_students (course_id, user_id) VALUES (?, ?)',
    [courseId, userId]
  );
}

async function findEnrolledByUser(userId) {
  const [rows] = await db.query(
    `SELECT c.id, c.title, c.description, c.content, c.created_at AS createdAt,
            u.id AS createdById, u.name AS createdByName, u.email AS createdByEmail,
            u.instructor_profile_image AS createdByProfileImage,
            (SELECT COUNT(*) FROM course_students cs WHERE cs.course_id = c.id) AS studentsCount,
            (SELECT COUNT(*) FROM progress_videos pv
             JOIN progress p ON pv.progress_id = p.id AND p.user_id = ? AND p.course_id = c.id
             JOIN videos v ON pv.video_id = v.id AND v.course_id = c.id) AS watchedCount,
            (SELECT COUNT(*) FROM videos WHERE course_id = c.id) AS totalVideos,
            (SELECT COALESCE(AVG(rating), 0) FROM course_ratings WHERE course_id = c.id) AS averageRating,
            (SELECT COUNT(*) FROM course_ratings WHERE course_id = c.id) AS ratingsCount,
            (SELECT rating FROM course_ratings WHERE course_id = c.id AND user_id = ?) AS userRating,
            (SELECT COALESCE(SUM(duration), 0) FROM videos WHERE course_id = c.id) AS totalDurationSeconds
     FROM courses c
     LEFT JOIN users u ON c.created_by = u.id
     INNER JOIN course_students cs ON cs.course_id = c.id AND cs.user_id = ?
     ORDER BY c.created_at DESC`,
    [userId, userId, userId]
  );
  return rows.map((row) => {
    const totalVideos = Number(row.totalVideos ?? 0);
    const watchedCount = Number(row.watchedCount ?? 0);
    const progressPercentage =
      totalVideos > 0 ? Math.round((watchedCount / totalVideos) * 100) : 0;
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      content: row.content,
      createdAt: row.createdAt,
      createdById: row.createdById,
      createdByName: row.createdByName,
      createdByEmail: row.createdByEmail,
      createdByProfileImage: row.createdByProfileImage || null,
      studentsCount: Number(row.studentsCount ?? 0),
      isEnrolled: true,
      progressPercentage,
      videosWatched: watchedCount,
      totalVideos,
      averageRating: Number(Number(row.averageRating ?? 0).toFixed(1)),
      ratingsCount: Number(row.ratingsCount ?? 0),
      userRating: row.userRating ? Number(row.userRating) : null,
      totalDurationSeconds: Number(row.totalDurationSeconds ?? 0),
    };
  });
}

module.exports = {
  findAll,
  findById,
  exists,
  create,
  update,
  remove,
  isEnrolled,
  enroll,
  findEnrolledByUser,
};
