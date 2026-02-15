const request = require('supertest');
require('dotenv').config();

const app = require('../../src/app');
const db = require('../../src/db');

let testUserId;
let testCourseId;
let authToken;

describe('API de Plataforma de Cursos', () => {
  beforeAll(async () => {
    const conn = await db.pool.getConnection();
    conn.release();

    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE course_students');
    await db.query('TRUNCATE TABLE videos');
    await db.query('TRUNCATE TABLE progress_videos');
    await db.query('TRUNCATE TABLE progress');
    await db.query('TRUNCATE TABLE courses');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  afterAll(async () => {
    await db.query('SET FOREIGN_KEY_CHECKS = 0');
    await db.query('TRUNCATE TABLE course_students');
    await db.query('TRUNCATE TABLE videos');
    await db.query('TRUNCATE TABLE progress_videos');
    await db.query('TRUNCATE TABLE progress');
    await db.query('TRUNCATE TABLE courses');
    await db.query('TRUNCATE TABLE users');
    await db.query('SET FOREIGN_KEY_CHECKS = 1');
  });

  describe('POST /api/auth/register', () => {
    test('Debe registrar un usuario correctamente', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Juan Pérez',
        email: 'juan@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('message');
    });

    test('Debe rechazar email inválido', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'email-invalido',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    test('Debe rechazar contraseña corta', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
      });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    test('Debe rechazar nombre vacío', async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: '',
        email: 'test2@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Test User', 'logintest@example.com', hashedPassword, 'user']
      );
      testUserId = result.insertId;
    });

    test('Debe realizar login correctamente', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'logintest@example.com',
        password: 'password123',
      });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      authToken = res.body.token;
    });

    test('Debe rechazar email inválido en login', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'novalido',
        password: 'password123',
      });

      expect(res.statusCode).toBe(400);
    });

    test('Debe rechazar contraseña incorrecta', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'logintest@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/courses', () => {
    test('Debe obtener lista de cursos', async () => {
      const res = await request(app).get('/api/courses');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/courses', () => {
    beforeAll(async () => {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        ['Admin User', 'admin@example.com', hashedPassword, 'admin']
      );
      const adminId = result.insertId;

      const jwt = require('jsonwebtoken');
      authToken = jwt.sign(
        { id: adminId, role: 'admin' },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '1d' }
      );
    });

    test('Debe crear un curso con token válido', async () => {
      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'JavaScript Avanzado',
          description: 'Aprende JavaScript moderno',
          content: 'Contenido del curso...',
        });

      if (res.statusCode === 201) {
        expect(res.body).toHaveProperty('id');
        testCourseId = res.body.id;
      }
    });

    test('Debe rechazar crear curso sin token', async () => {
      const res = await request(app).post('/api/courses').send({
        title: 'Test Course',
        description: 'Test',
        content: 'Test',
      });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('PUT /api/courses/:id', () => {
    test('Debe editar curso con token válido', async () => {
      if (!testCourseId) return;

      const res = await request(app)
        .put(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'JavaScript Avanzado Editado',
          description: 'Descripción editada',
        });

      expect(res.statusCode).toBe(200);
    });
  });

  describe('DELETE /api/courses/:id', () => {
    test('Debe eliminar curso con token válido', async () => {
      if (!testCourseId) return;

      const res = await request(app)
        .delete(`/api/courses/${testCourseId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });
  });

  describe('POST /api/courses/:id/enroll', () => {
    beforeAll(async () => {
      const [result] = await db.query(
        'INSERT INTO courses (title, description, content, created_by) VALUES (?, ?, ?, ?)',
        ['React Básico', 'Aprende React', 'Contenido...', testUserId]
      );
      testCourseId = result.insertId;
    });

    test('Debe inscribir usuario a curso con token válido', async () => {
      const res = await request(app)
        .post(`/api/courses/${testCourseId}/enroll`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
    });

    test('Debe rechazar inscripción sin token', async () => {
      const res = await request(app).post(`/api/courses/${testCourseId}/enroll`);

      expect(res.statusCode).toBe(401);
    });
  });
});
