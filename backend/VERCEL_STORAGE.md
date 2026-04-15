# 📁 Almacenamiento en Vercel vs Desarrollo Local

## ⚠️ Limitación de Vercel

Vercel **NO permite escribir archivos** en el filesystem durante la ejecución. Solo puedes leer archivos que subiste con tu código.

| Ambiente | Almacenamiento | Persistencia | Límite |
|----------|---|---|---|
| **Local** | Disco duro (`./uploads`) | ✅ Permanente | Ilimitado |
| **Vercel** | Memoria (`memoryStorage`) | ❌ Temporal | 5GB por request |

---

## ✅ Solución Implementada

Tu app ahora detecta automáticamente el ambiente:

```javascript
// En desarrollo (NODE_ENV=development)
const storage = multer.diskStorage({  // Archivos en disco
  destination: './uploads/...'
});

// En Vercel (NODE_ENV=production)
const storage = multer.memoryStorage();  // Archivos en RAM
```

---

## 🚨 Problema Actual

**Los archivos subidos en Vercel se pierden después de cada petición** porque se almacenan en memoria.

Para que funcione en producción, necesitas guardar en un servicio externo.

---

## ✅ Soluciones (Elige Una)

### 1. **Cloudinary** (Recomendado para Imágenes) ⭐

Servicio gratuito para guardar imágenes:

```bash
npm install cloudinary multer-storage-cloudinary
```

**Pasos:**
1. Ve a https://cloudinary.com y regístrate (gratis)
2. Obtén: `CLOUD_NAME`, `API_KEY`, `API_SECRET`
3. Configura en Vercel → Settings → Environment Variables
4. Implementa el middleware

### 2. **AWS S3** (Para Videos y Archivos Grandes)

```bash
npm install aws-sdk multer-s3
```

**Ventajas:**
- Free tier: 5GB/mes
- Ideal para videos
- Muy escalable

### 3. **Firebase Storage** (Más Fácil)

```bash
npm install firebase-admin
```

---

## 📋 Recomendación por Tipo de Archivo

| Tipo | Servicio | Costo | Facilidad |
|------|----------|-------|-----------|
| **Imágenes de perfil** | Cloudinary | Gratis | ⭐⭐⭐⭐⭐ |
| **Portadas de cursos** | Cloudinary | Gratis | ⭐⭐⭐⭐⭐ |
| **Videos** | AWS S3 | ~$0.10/GB | ⭐⭐⭐⭐ |
| **Archivos PDF** | Firebase Storage | Gratis (5GB) | ⭐⭐⭐⭐ |

---

## 🚀 Pasos Siguientes

### Para Desarrollo Local:
```bash
npm run dev
# Los archivos se guardan en ./uploads/
```

### Para Producción (Vercel):
**Opción A:** Usar Cloudinary para imágenes

```bash
npm install cloudinary multer-storage-cloudinary
```

Actualizar `src/middleware/uploadInstructorImages.js`:

```javascript
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const profileStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'plataforma/instructors/profile',
    format: async (req, file) => 'jpg',
  },
});
```

Agregar a Vercel:
```
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

---

## 🔧 Estado Actual

✅ **Lo que funciona:**
- Local: Imágenes, videos, archivos se guardan bien
- Vercel: App inicia sin crashes
- NODE_ENV se detecta automáticamente

⚠️ **Limitación:**
- Vercel: Archivos se pierden tras cada petición (en memoria)

---

## 📞 Contacto

Para más ayuda con la implementación de Cloudinary o S3, avísame.

**Recomendación Final:** Usa Cloudinary para imágenes (más rápido de implementar) 🚀
