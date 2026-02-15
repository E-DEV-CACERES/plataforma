# Tecnologías del Backend - Plataforma de Cursos

Este documento describe las tecnologías, librerías y herramientas utilizadas en el backend de la plataforma EDTech.

---

## Lenguaje y runtime

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Node.js** | v14+ | Entorno de ejecución JavaScript del lado del servidor |

---

## Framework y servidor

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Express** | ^4.18.2 | Framework web para crear la API REST, manejo de rutas, middleware y peticiones HTTP |

---

## Base de datos

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **MySQL** | 5.7+ / 8.x | Base de datos relacional para usuarios, cursos, videos y progreso |
| **mysql2** | ^3.11.0 | Driver de Node.js para MySQL con soporte de Promises y prepared statements |

---

## Autenticación y seguridad

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **jsonwebtoken** | ^9.0.0 | Generación y verificación de tokens JWT para autenticación |
| **bcryptjs** | ^2.4.3 | Hash de contraseñas de forma segura |
| **helmet** | ^8.1.0 | Cabeceras HTTP de seguridad (XSS, clickjacking, etc.) |
| **express-rate-limit** | ^8.2.1 | Límite de peticiones para evitar abuso (p. ej. en login) |
| **cors** | ^2.8.5 | Control de acceso CORS para peticiones desde el frontend |

---

## Validación y manejo de datos

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **express-validator** | ^7.3.1 | Validación y sanitización de datos en rutas (registro, login, etc.) |

---

## Subida y procesamiento de archivos

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **multer** | ^2.0.2 | Subida de archivos multipart (videos, subtítulos, documentos) |
| **fluent-ffmpeg** | ^2.1.3 | Conversión de videos a H.264 para compatibilidad con navegadores |
| **pdfkit** | ^0.17.2 | Generación de PDFs (diplomas de finalización de curso) |

---

## Testing

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **Jest** | ^30.2.0 | Framework de pruebas unitarias e integración |
| **supertest** | ^7.2.2 | Pruebas de endpoints HTTP de la API |

---

## Desarrollo

| Tecnología | Versión | Uso |
|------------|---------|-----|
| **nodemon** | ^3.0.0 | Reinicio automático del servidor al detectar cambios |
| **dotenv** | (transitiva) | Carga de variables de entorno desde `.env` |

---

## Arquitectura del proyecto

```
backend/
├── cmd/              # Punto de entrada del servidor
├── src/
│   ├── app.js        # Configuración de Express
│   ├── config/       # Configuración (JWT, CORS, MySQL)
│   ├── controllers/  # Controladores de rutas
│   ├── middleware/   # Auth, upload, rate limit, logger
│   ├── repositories/ # Acceso a datos (MySQL)
│   ├── routes/       # Definición de rutas API
│   ├── services/     # Lógica de negocio
│   ├── utils/        # Utilidades (conversión de video)
│   └── db/           # Conexión a MySQL
├── scripts/          # Scripts de utilidad (init-db, reset-password, etc.)
├── tests/            # Pruebas
└── uploads/          # Archivos subidos (videos, subtítulos, documentos)
```

---

## Flujo de datos

1. **Rutas** → reciben la petición HTTP
2. **Middleware** → autenticación, validación, rate limiting
3. **Controladores** → orquestan la lógica
4. **Servicios** → reglas de negocio
5. **Repositorios** → consultas SQL a MySQL
6. **Respuesta** → JSON al cliente

---

## Variables de entorno

| Variable | Descripción |
|---------|-------------|
| `PORT` | Puerto del servidor (default: 4000) |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT |
| `FRONTEND_URL` | URL(es) permitidas para CORS |
| `MYSQL_HOST` | Host de MySQL |
| `MYSQL_PORT` | Puerto de MySQL |
| `MYSQL_USER` | Usuario de MySQL |
| `MYSQL_PASSWORD` | Contraseña de MySQL |
| `MYSQL_DATABASE` | Nombre de la base de datos |

---

## Dependencias externas

- **ffmpeg**: Herramienta de sistema para conversión de video (requerida por fluent-ffmpeg). Se usa para convertir videos a H.264 y mejorar compatibilidad en navegadores.
