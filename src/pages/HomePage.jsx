import { useEffect, useState, useMemo, useRef } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Alert,
  Paper,
  InputBase,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  LinearProgress,
  Rating,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SchoolIcon from '@mui/icons-material/School';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import { courseService, videoService, courseFileService, MEDIA_BASE_URL } from '../services/api';
import { formatDuration } from '../utils/formatDuration';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useSnackbar } from '../context/useSnackbar';
import { CourseGridSkeleton } from '../components/CourseCardSkeleton';

const ITEMS_PER_PAGE = 12;

const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
];

const getCourseImage = (courseId) =>
  COURSE_IMAGES[Number(courseId) % COURSE_IMAGES.length];

const HERO_CAROUSEL_IMAGES = [
  { url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80', alt: 'Aprendiendo en línea' },
  { url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80', alt: 'Estudio y formación' },
  { url: 'https://images.unsplash.com/photo-1523240795612-9a0546980ad4?w=1200&q=80', alt: 'Cursos online' },
  { url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80', alt: 'Desarrollo profesional' },
  { url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&q=80', alt: 'Educación digital' },
];

export const HomePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const [enrolledIds, setEnrolledIds] = useState(new Set());
  const [progressByCourseId, setProgressByCourseId] = useState({});
  const [previewCourse, setPreviewCourse] = useState(null);
  const [previewVideos, setPreviewVideos] = useState([]);
  const [previewVideosLoading, setPreviewVideosLoading] = useState(false);
  const [previewFiles, setPreviewFiles] = useState([]);
  const [selectedPreviewVideo, setSelectedPreviewVideo] = useState(null);
  const [page, setPage] = useState(1);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [hoveredCourse, setHoveredCourse] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState(() => {
    try {
      const saved = localStorage.getItem('edtech_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const hoverEnterRef = useRef(null);
  const hoverLeaveRef = useRef(null);
  const { user } = useAuth();
  const { addToCart, isInCart } = useCart();
  const { showSnackbar } = useSnackbar();

  const handleAddToCart = (course, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    if (isInCart(course.id)) {
      showSnackbar('El curso ya está en el carrito');
      return;
    }
    addToCart(course);
    showSnackbar('Curso agregado al carrito');
    setHoveredCourse(null);
  };

  const toggleFavorite = (courseId, e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
        showSnackbar('Eliminado de favoritos');
      } else {
        next.add(courseId);
        showSnackbar('Agregado a favoritos');
      }
      try {
        localStorage.setItem('edtech_favorites', JSON.stringify([...next]));
      } catch { /* ignore storage errors */ }
      return next;
    });
  };

  const HOVER_DELAY = 400;
  const HOVER_LEAVE_DELAY = 150;

  const handleCourseMouseEnter = (course) => {
    if (hoverLeaveRef.current) {
      clearTimeout(hoverLeaveRef.current);
      hoverLeaveRef.current = null;
    }
    if (hoverEnterRef.current) clearTimeout(hoverEnterRef.current);
    if (hoveredCourse?.id !== course.id) {
      setHoveredCourse(null);
    }
    hoverEnterRef.current = setTimeout(() => setHoveredCourse(course), HOVER_DELAY);
  };

  const handleCourseMouseLeave = () => {
    if (hoverEnterRef.current) {
      clearTimeout(hoverEnterRef.current);
      hoverEnterRef.current = null;
    }
    if (hoverLeaveRef.current) clearTimeout(hoverLeaveRef.current);
    hoverLeaveRef.current = setTimeout(() => setHoveredCourse(null), HOVER_LEAVE_DELAY);
  };

  const handlePreviewMouseEnter = () => {
    if (hoverLeaveRef.current) {
      clearTimeout(hoverLeaveRef.current);
      hoverLeaveRef.current = null;
    }
  };

  const handlePreviewMouseLeave = () => {
    if (hoverLeaveRef.current) clearTimeout(hoverLeaveRef.current);
    hoverLeaveRef.current = setTimeout(() => setHoveredCourse(null), HOVER_LEAVE_DELAY);
  };

  const renderCourseHoverPreview = (course, showOnLeft = false) => {
    if (hoveredCourse?.id !== course.id) return null;
    return (
      <Paper
        elevation={8}
        onMouseEnter={handlePreviewMouseEnter}
        onMouseLeave={handlePreviewMouseLeave}
        sx={{
          position: 'absolute',
          top: 0,
          ...(showOnLeft
            ? { right: '100%', left: 'auto', mr: 0 }
            : { left: '100%', right: 'auto', ml: 0 }),
          width: 220,
          zIndex: 20,
          overflow: 'hidden',
          borderRadius: 1.5,
          maxHeight: 280,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1.25 }}>
            <Typography variant="body2" fontWeight="bold" sx={{ lineHeight: 1.2, mb: 0.25, fontSize: '0.875rem' }}>
              {course.title}
            </Typography>
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                mb: 0.5,
                fontSize: '0.75rem',
              }}
            >
              {course.description || 'Sin descripción'}
            </Typography>
            {course.createdByName && (
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.25, fontSize: '0.7rem' }}>
                Por {course.createdByName}
              </Typography>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', mb: 0.75 }}>
              {(course.averageRating > 0 || course.ratingsCount > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                  <Typography variant="caption" fontWeight="bold" color="warning.main" sx={{ fontSize: '0.75rem' }}>
                    {course.averageRating?.toFixed(1)}
                  </Typography>
                  <StarIcon sx={{ fontSize: 14, color: 'warning.main' }} />
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                    ({course.ratingsCount ?? 0})
                  </Typography>
                </Box>
              )}
              <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                {course.studentsCount ?? 0} estudiantes
              </Typography>
              {(course.totalDurationSeconds ?? 0) > 0 && (
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                  {formatDuration(course.totalDurationSeconds)}
                </Typography>
              )}
            </Box>
            {enrolledIds.has(course.id) && (
              <Box sx={{ mb: 0.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.25 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>Progreso</Typography>
                  <Typography variant="caption" fontWeight="bold" sx={{ fontSize: '0.7rem' }}>{progressByCourseId[course.id] ?? 0}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(100, progressByCourseId[course.id] ?? 0)}
                  sx={{ height: 4, borderRadius: 2 }}
                />
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 0.5, mt: 0.75, alignItems: 'center' }}>
              <Button
                size="small"
                variant={isInCart(course.id) ? 'outlined' : 'contained'}
                startIcon={<AddShoppingCartIcon sx={{ fontSize: 18 }} />}
                onClick={(e) => handleAddToCart(course, e)}
                sx={{ py: 0.25, px: 1, fontSize: '0.75rem', minWidth: 'auto' }}
              >
                {isInCart(course.id) ? 'Ya en carrito' : 'Agregar al carrito'}
              </Button>
              <IconButton
                size="small"
                onClick={(e) => toggleFavorite(course.id, e)}
                sx={{
                  color: favoriteIds.has(course.id) ? 'error.main' : 'text.secondary',
                  '&:hover': { color: 'error.main', bgcolor: 'action.hover' },
                }}
                aria-label={favoriteIds.has(course.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                {favoriteIds.has(course.id) ? (
                  <FavoriteIcon sx={{ fontSize: 22 }} />
                ) : (
                  <FavoriteBorderIcon sx={{ fontSize: 22 }} />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>
    );
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % HERO_CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const sortedCourses = useMemo(() => {
    const arr = [...courses];
    if (sortBy === 'recent') {
      return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    if (sortBy === 'popular') {
      return arr.sort((a, b) => (b.studentsCount ?? 0) - (a.studentsCount ?? 0));
    }
    return arr;
  }, [courses, sortBy]);

  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return sortedCourses.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedCourses, page]);

  const totalPages = Math.ceil(sortedCourses.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    fetchCourses();
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    if (user) {
      courseService.getEnrolledCourses()
        .then((res) => {
          const list = res.data || [];
          setEnrolledIds(new Set(list.map((c) => c.id)));
          setProgressByCourseId(
            Object.fromEntries(list.map((c) => [c.id, c.progressPercentage ?? 0]))
          );
        })
        .catch(() => {
          setEnrolledIds(new Set());
          setProgressByCourseId({});
        });
    } else {
      setEnrolledIds(new Set());
      setProgressByCourseId({});
    }
  }, [user]);

  useEffect(() => {
    if (previewCourse?.id) {
      setPreviewVideosLoading(true);
      setPreviewVideos([]);
      setPreviewFiles([]);
      setSelectedPreviewVideo(null);
      Promise.all([
        videoService.getVideosByCourse(previewCourse.id),
        courseFileService.getByCourse(previewCourse.id),
      ])
        .then(([videosRes, filesRes]) => {
          const list = videosRes.data || [];
          setPreviewVideos(list);
          setSelectedPreviewVideo(list[0] || null);
          setPreviewFiles(filesRes.data || []);
        })
        .catch(() => {
          setPreviewVideos([]);
          setPreviewFiles([]);
        })
        .finally(() => setPreviewVideosLoading(false));
    } else {
      setPreviewVideos([]);
      setPreviewFiles([]);
      setSelectedPreviewVideo(null);
    }
  }, [previewCourse?.id]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(searchQuery);
      setCourses(response.data);
    } catch {
      setError('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => setSearchParams({});

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa' }}>
      {/* Hero section - Carrusel */}
      <Box sx={{ pt: 2, pb: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          width: '75%',
          margin: '0 auto',
          position: 'relative',
          overflow: 'hidden',
          height: '60vh',
          minHeight: 400,
          color: 'white',
          borderRadius: 2,
          boxShadow: 4,
          border: '2px solid rgba(255, 255, 255, 0.35)',
        }}
      >
        {/* Carrusel de imágenes */}
        {HERO_CAROUSEL_IMAGES.map((img, idx) => (
          <Box
            key={img.url}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: idx === carouselIndex ? 1 : 0,
              transition: 'opacity 0.8s ease-in-out',
              backgroundImage: `url(${img.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
        {/* Overlay oscuro para legibilidad del texto */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(86,36,208,0.85) 0%, rgba(86,36,208,0.7) 50%, rgba(124,77,255,0.6) 100%)',
            pointerEvents: 'none',
          }}
        />
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: { xs: 2, md: 4 },
            py: { xs: 4, md: 6 },
          }}
        >
          <Box sx={{ maxWidth: 560 }}>
            <Typography
              variant="h4"
              component="p"
              sx={{
                opacity: 0.95,
                mb: 0.5,
                fontWeight: 500,
                letterSpacing: '0.02em',
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
              }}
            >
              {user ? (
                <>Hola, <strong>{user.name}</strong></>
              ) : (
                'Bienvenido a EDTech'
              )}
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 'bold',
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
                lineHeight: 1.3,
              }}
            >
              Aprende nuevas habilidades con nuestros cursos en línea
            </Typography>
            <Typography
              variant="body1"
              sx={{
                opacity: 0.9,
                mb: 3,
                fontSize: { xs: '0.95rem', sm: '1.05rem' },
              }}
            >
              Descubre contenido de calidad y avanza en tu carrera profesional.
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {user ? (
                <Button
                  component={RouterLink}
                  to="/my-courses"
                  variant="contained"
                  size="large"
                  startIcon={<VideoLibraryIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      fontWeight: 'bold',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Ir a mis cursos
                </Button>
              ) : (
                <Button
                  href="#cursos"
                  variant="contained"
                  size="large"
                  startIcon={<AutoStoriesIcon />}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                      transform: 'translateY(-2px)',
                      fontWeight: 'bold',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  Explorar cursos
                </Button>
              )}
              {!user && (
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 'bold',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: 'rgba(255,255,255,0.15)',
                      borderWidth: 2,
                      fontWeight: 'bold',
                    },
                  }}
                >
                  Crear cuenta gratis
                </Button>
              )}
            </Box>
          </Box>
          {/* Indicadores del carrusel */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 1,
              mt: 2,
              position: 'relative',
              zIndex: 1,
            }}
          >
            {HERO_CAROUSEL_IMAGES.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setCarouselIndex(idx)}
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: idx === carouselIndex ? 'white' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': { bgcolor: idx === carouselIndex ? 'white' : 'rgba(255,255,255,0.7)' },
                }}
              />
            ))}
          </Box>
        </Box>
      </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          {searchQuery && (
            <Chip
              label={`"${searchQuery}"`}
              onDelete={clearSearch}
              deleteIcon={<CloseIcon />}
              color="primary"
              variant="outlined"
              sx={{ mb: 0 }}
            />
          )}

          {/* Buscador móvil */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, mt: 3 }}>
            <Paper
              key={searchQuery}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const q = formData.get('search')?.trim() || '';
                if (q) {
                  setSearchParams({ q });
                } else {
                  setSearchParams({});
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                p: 1,
                borderRadius: 2,
              }}
            >
              <InputBase
                name="search"
                placeholder="Buscar cursos..."
                defaultValue={searchQuery}
                sx={{ ml: 1, flex: 1 }}
              />
              <IconButton type="submit" size="small">
                <SearchIcon />
              </IconButton>
            </Paper>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {user && user.role === 'admin' && (
          <Box sx={{ mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/create-course"
              startIcon={<SchoolIcon />}
            >
              + Crear Nuevo Curso
            </Button>
          </Box>
        )}

        <Box id="cursos">
        {loading ? (
          <CourseGridSkeleton count={6} noHeader />
        ) : courses.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="textSecondary" variant="h6">
              {searchQuery
                ? `No se encontraron cursos para "${searchQuery}"`
                : 'No hay cursos disponibles aún'}
            </Typography>
          </Card>
        ) : (
          <>
            {/* Listado general */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 3 }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="sort-label">Ordenar por</InputLabel>
                <Select
                  labelId="sort-label"
                  value={sortBy}
                  label="Ordenar por"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="recent">Más recientes</MenuItem>
                  <MenuItem value="popular">Más populares</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Grid container spacing={3} sx={{ overflow: 'visible' }}>
            {paginatedCourses.map((course, idx) => {
              const showPreviewOnLeft = (idx + 1) % 3 === 0;
              return (
              <Grid item xs={12} sm={6} md={4} key={course.id} sx={{ overflow: 'visible' }}>
                <Box
                  sx={{
                    ...(showPreviewOnLeft ? { pl: 30 } : { pr: 30 }),
                  }}
                  onMouseEnter={() => handleCourseMouseEnter(course)}
                  onMouseLeave={handleCourseMouseLeave}
                >
                <Box sx={{ position: 'relative' }}>
                <Card
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 'none',
                    border: 'none',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      sx={{
                        height: 200,
                        width: '100%',
                        backgroundImage: `url(${getCourseImage(course.id)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <Box sx={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {(course.averageRating ?? 0) >= 4.5 && (course.ratingsCount ?? 0) >= 10 && (
                        <Chip label="Más valorado" size="small" sx={{ bgcolor: '#ffc107', color: '#000', fontWeight: 600, fontSize: '0.7rem' }} />
                      )}
                      {(course.studentsCount ?? 0) >= 50 && (
                        <Chip label="Destacado" size="small" sx={{ bgcolor: '#4caf50', color: '#fff', fontWeight: 600, fontSize: '0.7rem' }} />
                      )}
                    </Box>
                    {enrolledIds.has(course.id) && (
                      <Chip
                        label="Ya inscrito"
                        color="success"
                        size="small"
                        sx={{ position: 'absolute', top: 8, right: 8 }}
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography gutterBottom variant="h6" component="h2">
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {course.description || 'Sin descripción'}
                    </Typography>
                    {course.createdByName && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Por {course.createdByName}
                      </Typography>
                    )}
                    <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                      {course.studentsCount ?? 0} estudiantes inscritos
                    </Typography>
                    {(course.totalDurationSeconds ?? 0) > 0 && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block' }}>
                        {formatDuration(course.totalDurationSeconds)} de duración
                      </Typography>
                    )}
                    {(course.averageRating > 0 || course.ratingsCount > 0) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <Rating value={course.averageRating ?? 0} precision={0.1} readOnly size="small" emptyIcon={<StarIcon fontSize="inherit" />} />
                        <Typography variant="caption" color="textSecondary">({course.ratingsCount ?? 0})</Typography>
                      </Box>
                    )}
                    {enrolledIds.has(course.id) && (
                      <Box sx={{ mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="textSecondary">Progreso</Typography>
                          <Typography variant="caption" fontWeight="bold">{progressByCourseId[course.id] ?? 0}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, progressByCourseId[course.id] ?? 0)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1 }}>
                    <Button
                      size="small"
                      startIcon={<VisibilityIcon />}
                      onClick={() => setPreviewCourse(course)}
                      sx={{ alignSelf: 'flex-start' }}
                    >
                      Vista previa
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/course/${course.id}`}
                    >
                      Ver Curso
                    </Button>
                  </CardActions>
                </Card>
                {renderCourseHoverPreview(course, showPreviewOnLeft)}
                </Box>
                </Box>
              </Grid>
            );})}
          </Grid>
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                showFirstButton
                showLastButton
              />
            </Box>
          )}
          </>
        )}
        </Box>
      </Container>

      {/* Modal vista rápida - reproductor de video + lista */}
      <Dialog
        open={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          },
        }}
        slotProps={{
          backdrop: {
            sx: { background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(4px)' },
          },
        }}
      >
        {previewCourse && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
              <Typography variant="h6" component="span" sx={{ textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                {previewCourse.title}
              </Typography>
              <IconButton onClick={() => setPreviewCourse(null)} size="small" sx={{ color: 'white' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ color: 'rgba(255,255,255,0.95)', p: 0, display: 'flex', flexDirection: 'column' }}>
              {/* Reproducción de video */}
              <Box sx={{ width: 320, height: 180, mx: 'auto', bgcolor: '#000', borderRadius: 1, overflow: 'hidden' }}>
                {selectedPreviewVideo ? (
                  <Box
                    component="video"
                    src={`${MEDIA_BASE_URL}${selectedPreviewVideo.videoUrl}`}
                    controls
                    preload="metadata"
                    onError={(e) => {
                      if (e.target?.error?.code === 1) return;
                      showSnackbar('Formato no compatible. El video debe estar en MP4 (H.264).', 'error');
                    }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                    }}
                  >
                    {selectedPreviewVideo.subtitleUrl && (
                      <track
                        kind="subtitles"
                        src={`${MEDIA_BASE_URL}${selectedPreviewVideo.subtitleUrl}`}
                        srcLang="es"
                        label="Español"
                        default
                      />
                    )}
                  </Box>
                ) : previewVideosLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <CircularProgress sx={{ color: 'white' }} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'rgba(255,255,255,0.6)',
                    }}
                  >
                    <Typography>Selecciona un video para reproducir</Typography>
                  </Box>
                )}
              </Box>

              {/* Info del curso */}
              <Box sx={{ px: 3, py: 2 }}>
                <Typography variant="body1" sx={{ mb: 1, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {previewCourse.description || 'Sin descripción'}
                </Typography>
                {previewCourse.createdByName && (
                  <Typography variant="body2" sx={{ mb: 0.5, textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    <strong>Instructor:</strong> {previewCourse.createdByName}
                  </Typography>
                )}
                <Typography variant="caption" sx={{ display: 'block', mb: 2, opacity: 0.9 }}>
                  {previewCourse.studentsCount ?? 0} estudiantes inscritos
                </Typography>
                {(previewCourse.totalDurationSeconds ?? 0) > 0 && (
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5, opacity: 0.9 }}>
                    {formatDuration(previewCourse.totalDurationSeconds)} de duración
                  </Typography>
                )}
                {(previewCourse.averageRating > 0 || previewCourse.ratingsCount > 0) && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <Rating value={previewCourse.averageRating ?? 0} precision={0.1} readOnly size="small" sx={{ '& .MuiRating-iconFilled': { color: 'warning.main' } }} emptyIcon={<StarIcon fontSize="inherit" />} />
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                      {previewCourse.averageRating?.toFixed(1)} ({previewCourse.ratingsCount ?? 0})
                    </Typography>
                  </Box>
                )}

                {/* Lista de videos para reproducir */}
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, color: 'white' }}>
                  Videos del curso ({previewVideosLoading ? '...' : previewVideos.length})
                </Typography>
                {previewVideosLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                    <CircularProgress size={24} sx={{ color: 'white' }} />
                  </Box>
                ) : previewVideos.length === 0 ? (
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Sin videos disponibles
                  </Typography>
                ) : (
                  <List dense disablePadding sx={{ maxHeight: 200, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                    {previewVideos.map((video, idx) => (
                      <ListItemButton
                        key={video.id}
                        onClick={() => setSelectedPreviewVideo(video)}
                        selected={selectedPreviewVideo?.id === video.id}
                        sx={{
                          borderBottom: '1px solid rgba(255,255,255,0.08)',
                          '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' },
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ color: 'white' }}>
                              {idx + 1}. {video.title}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                              {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    ))}
                  </List>
                )}
                {previewFiles.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1, mt: 2, color: 'white' }}>
                      Materiales descargables ({previewFiles.length})
                    </Typography>
                    <List dense disablePadding sx={{ maxHeight: 120, overflow: 'auto', bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 1 }}>
                      {previewFiles.map((file) => (
                        <ListItem key={file.id} disablePadding>
                          <ListItemButton
                            component="a"
                            href={`${MEDIA_BASE_URL}${file.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            sx={{
                              borderBottom: '1px solid rgba(255,255,255,0.08)',
                              color: 'white',
                              textDecoration: 'none',
                            }}
                          >
                            <DownloadIcon sx={{ fontSize: 18, mr: 1, color: 'rgba(255,255,255,0.8)' }} />
                            <ListItemText
                              primary={
                                <Typography variant="body2" sx={{ color: 'white' }}>
                                  {file.title}
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setPreviewCourse(null)} sx={{ color: 'rgba(255,255,255,0.9)' }}>
                Cerrar
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to={`/course/${previewCourse.id}`}
                onClick={() => setPreviewCourse(null)}
              >
                Ir al curso
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};
