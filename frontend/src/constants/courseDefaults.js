/**
 * Valores por defecto para la página de curso cuando no hay datos personalizados.
 */
export const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
];

export const DEFAULT_LEARNING = [
  'Contenido práctico y de valor',
  'Ejercicios y proyectos aplicados',
  'Acceso de por vida al material',
];

export const DEFAULT_REQUIREMENTS = [
  'Conocimientos básicos de informática',
  'Disposición para practicar',
  'Conexión a internet',
];

export const DEFAULT_WHO_IS_FOR = [
  'Personas que quieran aprender desde cero',
  'Estudiantes y profesionales en formación',
  'Cualquiera interesado en el tema',
];

export const DEFAULT_CATEGORIES = ['Desarrollo', 'Formación'];
export const DEFAULT_LANGUAGE = 'Español';

export const getCourseImage = (courseId) =>
  COURSE_IMAGES[Number(courseId) % COURSE_IMAGES.length];
