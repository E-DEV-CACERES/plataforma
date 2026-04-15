# 🔐 Guía de Seguridad - Plataforma de Cursos

## Variables de Entorno Sensibles

Tu repositorio ahora está configurado para requerir variables de entorno sensibles en producción.

### ⚠️ IMPORTANTE - Antes de Desplegar

1. **Copia `.env.example` a `.env`:**
   ```bash
   cp .env.example .env
   ```

2. **Reemplaza TODOS los valores de ejemplo con valores reales y seguros:**
   - `JWT_SECRET`: Una clave aleatoria de al menos 32 caracteres
   - `MYSQL_PASSWORD`: Una contraseña fuerte para tu base de datos
   - `MYSQL_HOST`: El servidor MySQL en producción
   - `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe (si usas)

3. **NUNCA** commitees el archivo `.env` a Git (ya está en `.gitignore`)

## Cambios de Seguridad Implementados

### ✅ Actualizado `src/config/index.js`:
- **JWT_SECRET** ahora es requerido en producción (error en lugar de warning)
- **MYSQL_PASSWORD** ahora es requerido en producción (no usa `123456` por defecto)
- Eliminados defaults inseguros como: `'secret'` y `'123456'`

### ✅ Creado `.env.example`:
- Archivo de referencia con todas las variables necesarias
- Comparte esto con tu equipo para que sepan qué configurar
- NO contiene valores reales

### ✅ Seguridad en `src/app.js`:
- ✓ Helmet configurado (headers de seguridad)
- ✓ CORS restringido a orígenes permitidos
- ✓ Body size limitado
- ✓ Trust proxy configurado

## Buenas Prácticas

### 1. Para Desarrollo Local:
```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita con valores locales (pueden ser débiles para desarrollo)
NODE_ENV=development
JWT_SECRET=dev_secret_key_here
MYSQL_PASSWORD=dev_password
```

### 2. Para Producción (Railway, Heroku, etc.):
```bash
# No uses .env en producción
# Configura variables de entorno directo en el panel de hosting

# Ejemplos:
NODE_ENV=production
JWT_SECRET=$(openssl rand -base64 32)
MYSQL_PASSWORD=strong_password_here_with_special_chars
STRIPE_SECRET_KEY=sk_live_...
```

### 3. Generar Claves Seguras:
```bash
# JWT_SECRET seguro (32+ caracteres aleatorios)
openssl rand -base64 32

# O en Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Si Accidentalmente Cometiste Credenciales

Si ya subiste credenciales reales al repositorio GitHub:

1. **Regenera inmediatamente** todas las claves comprometidas
2. **Usa `git-filter-branch` o `bfg-repo-cleaner`** para removerlas del historial:
   ```bash
   # Requiere herramientas adicionales, consulta documentación GitHub
   ```
3. **Force push** para actualizar el repositorio remoto

## Configuración de Secrets en Railway/Heroku

### Railway:
1. Ve a tu proyecto en Railway
2. Settings → Variables
3. Agrega cada variable de `.env.example` con valores reales

### Heroku:
```bash
heroku config:set JWT_SECRET="your_secure_key"
heroku config:set MYSQL_PASSWORD="your_secure_password"
```

## Checklist Pre-Producción

- [ ] JWT_SECRET configurado (no es 'secret')
- [ ] MYSQL_PASSWORD configurado (no es '123456')
- [ ] MYSQL_HOST apunta al servidor correcto
- [ ] NODE_ENV=production en el servidor
- [ ] STRIPE_SECRET_KEY configurado (si usas pagos)
- [ ] FRONTEND_URL apunta a tu dominio real
- [ ] No hay archivos `.env` en el repositorio
- [ ] Credenciales no están en el código

## Monitoreo de Seguridad

Después de desplegar:

```bash
# Verifica que las variables estén configuradas
node -e "console.log('JWT Secret:', !!process.env.JWT_SECRET)"

# En logs de servidor (no expone el valor)
echo "Configuración validada: ${MYSQL_HOST}:${MYSQL_PORT}"
```

---

**Para más información sobre seguridad en Node.js:**
- https://nodejs.org/es/docs/guides/security/
- https://owasp.org/www-project-nodejs-security/
