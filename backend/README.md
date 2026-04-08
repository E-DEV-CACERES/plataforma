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
   JWT_SECRET=tu_clave_secreta_super_segura
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   ```

3. Ejecuta el servidor:

   npm run dev

### HTTPS (desarrollo)

Para ejecutar el backend con HTTPS:

   npm run dev:https

Se generarán certificados autofirmados en `./certs/` la primera vez. Añade `https://localhost:5173` a `FRONTEND_URL` si usas el frontend con HTTPS.

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

## Deploy en Vercel (Backend)

Este backend ya está preparado para Vercel con:

- `api/index.js` como entrypoint serverless de Express
- `vercel.json` para enrutar todo hacia la API

### 1) Variables de entorno (Project Settings > Environment Variables)

Configura al menos:

```bash
NODE_ENV=production
JWT_SECRET=tu_clave_larga_y_segura
FRONTEND_URL=https://tu-frontend.vercel.app
MYSQL_HOST=...
MYSQL_PORT=3306
MYSQL_USER=...
MYSQL_PASSWORD=...
MYSQL_DATABASE=...
```

Si permites varios frontends, usa `FRONTEND_URL` separado por comas.

### 2) Importar el proyecto `backend` en Vercel

- Crea un proyecto nuevo en Vercel apuntando a la carpeta `backend`.
- Framework Preset: **Other**.
- Build Command: vacío.
- Output Directory: vacío.
- Install Command: `npm install`.

### 3) Verificar despliegue

- Health check: `GET /`
- API: `GET /api/...`

### Importante sobre archivos y uploads

En Vercel Serverless, el sistema de archivos es efímero. Para producción, evita guardar uploads en disco local y usa almacenamiento externo (por ejemplo S3/Cloudinary).

---

¡Listo para desarrollar tu plataforma de cursos!

