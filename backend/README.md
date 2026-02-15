# Plataforma de Cursos - Backend

Este backend está construido con Node.js, Express y MongoDB.

## Características

- ✅ Autenticación con JWT
- ✅ Gestión de cursos
- ✅ Subida y gestión de videos tutoriales
- ✅ Seguimiento de progreso del estudiante
- ✅ Validación de datos con express-validator
- ✅ Tests con Jest y Supertest

## Instalación

1. Instala dependencias:

   npm install

2. Configura variables de entorno (.env):

   ```
   MONGO_URI=mongodb://localhost:27017/plataforma_cursos
   JWT_SECRET=tu_clave_secreta_super_segura
   PORT=4000
   FRONTEND_URL=http://localhost:3000
   ```

3. Ejecuta el servidor:

   npm run dev

## Endpoints principales

### Autenticación
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/login` - Login de usuario

### Cursos
- `GET /api/courses` - Obtener todos los cursos
- `POST /api/courses` - Crear curso (solo admin)
- `PUT /api/courses/:id` - Editar curso (solo admin)
- `DELETE /api/courses/:id` - Eliminar curso (solo admin)
- `POST /api/courses/:id/enroll` - Inscribirse a un curso

### Videos
- `POST /api/videos/:courseId/upload` - Subir video (solo admin)
- `GET /api/videos/:courseId` - Obtener videos de un curso
- `GET /api/videos/:courseId/:videoId` - Obtener un video específico
- `PUT /api/videos/:courseId/:videoId` - Editar video (solo admin)
- `DELETE /api/videos/:courseId/:videoId` - Eliminar video (solo admin)

### Progreso
- `POST /api/progress/:courseId/:videoId/mark-watched` - Marcar video como visto
- `GET /api/progress/:courseId/progress` - Obtener progreso del usuario
- `GET /api/progress/:courseId/all-progress` - Obtener progreso de todos (solo admin)

## Tests

Ejecuta los tests con:

   npm test

## Estructura

- `src/models` - Modelos de datos (User, Course, Video, Progress)
- `src/routes` - Rutas de API
- `src/index.js` - Servidor principal
- `tests/` - Tests unitarios e integración
- `uploads/` - Archivos de video subidos

## Requisitos

- Node.js v14+
- MongoDB local o remota

## Notas para Producción

- Cambiar JWT_SECRET a una clave segura
- Usar MongoDB con usuario y contraseña
- Considerar usar Cloudinary para almacenamiento de videos en nube
- Implementar rate limiting
- Configurar HTTPS
- Usar helmet para proteger cabeceras HTTP

---

¡Listo para desarrollar tu plataforma de cursos!

