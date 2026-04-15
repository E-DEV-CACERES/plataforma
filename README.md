# EdTech - Frontend

Frontend responsivo construido con React, Vite y Tailwind CSS.

## Características

- ✅ Autenticación (Login/Registro)
- ✅ Listado de cursos
- ✅ Reproducción de videos
- ✅ Seguimiento de progreso
- ✅ Diseño responsivo
- ✅ Interfaz moderna

## Instalación

1. Instala dependencias:

   npm install

2. Asegúrate que el backend esté corriendo en `http://localhost:4000`

3. Ejecuta el servidor de desarrollo:

   npm run dev

El frontend estará disponible en `http://localhost:5173`

## Estructura

- `src/pages` - Páginas principales
- `src/components` - Componentes reutilizables
- `src/services` - Llamadas a API
- `src/context` - Context API para autenticación
- `src/App.jsx` - Rutas principales

## Páginas

- `/` - Página de inicio con listado de cursos
- `/login` - Iniciar sesión
- `/register` - Registrarse
- `/course/:id` - Detalles del curso y reproductor de videos

## Dependencias principales

- **react-router-dom** - Enrutamiento
- **axios** - Cliente HTTP
- **tailwindcss** - Estilos CSS
- **react-icons** - Iconos

## Variables de Entorno

Asegúrate que la API backend esté disponible en `http://localhost:4000`

## Compilación para producción

```bash
npm run build
```

---

¡Listo para desarrollar tu plataforma de cursos!

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
