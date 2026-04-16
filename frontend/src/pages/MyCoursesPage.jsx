import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Rating,
  Breadcrumbs,
  Chip,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { courseService } from '../services/api';
import { formatDuration } from '../utils/formatDuration';
import { CourseGridSkeleton } from '../components/CourseCardSkeleton';

const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
];

const getCourseImage = (courseId) =>
  COURSE_IMAGES[Number(courseId) % COURSE_IMAGES.length];

const getProgressBadge = (course) => {
  const progress = course.progressPercentage ?? 0;
  if (progress >= 100) return { label: 'Completado', color: 'success', icon: <CheckCircleIcon sx={{ fontSize: 14 }} /> };
  if (progress > 0) return { label: 'En progreso', color: 'primary', icon: null };
  return null;
};

const isBestseller = (course) => (course.studentsCount ?? 0) >= 10;

export const MyCoursesPage = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('recent');

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

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await courseService.getEnrolledCourses();
      const data = response?.data;
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setError('Error al cargar tus cursos');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CourseGridSkeleton count={6} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: { xs: 3, sm: 4, md: 6 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 1, sm: 2, md: 3 } }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, fontSize: { xs: '0.8rem', md: '0.875rem' } }}>
          <Typography component={RouterLink} to="/" color="textSecondary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}>
            Inicio
          </Typography>
          <Typography color="text.primary" fontWeight={500}>Mis Cursos</Typography>
        </Breadcrumbs>
        <Box sx={{ mb: { xs: 3, sm: 4, md: 6 } }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 1, fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.25rem' } }}>
            Mis Cursos
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
            Cursos en los que estás inscrito
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {courses.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
            <Typography color="textSecondary" variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
              Aún no te has inscrito en ningún curso
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              size="medium"
              sx={{ mt: { xs: 2, md: 3 } }}
            >
              Explorar cursos
            </Button>
          </Card>
        ) : (
          <>
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 200 }, mb: { xs: 2, md: 3 }, width: { xs: '100%', sm: 'auto' } }}>
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
            <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
            {sortedCourses.map((course) => (
              <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={course.id}>
                <Card
                  onClick={() => navigate(`/course/${course.id}/learn`)}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: 320, md: 340, lg: 360 },
                    mx: { sm: 'auto' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: 1,
                    borderRadius: { xs: 1.5, md: 2 },
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: { xs: 140, sm: 150, md: 160 },
                      backgroundImage: `url(${getCourseImage(course.id)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      position: 'relative',
                      display: 'block',
                      textDecoration: 'none',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.5) 100%)',
                        transition: 'opacity 0.3s',
                      },
                      '&:hover::after': { opacity: 0.7 },
                      '&:hover .play-icon': {
                        transform: 'translate(-50%, -50%) scale(1.1)',
                        opacity: 1,
                      },
                    }}
                  >
                    <Box
                      className="play-icon"
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                        transition: 'transform 0.3s, opacity 0.3s',
                        opacity: 0.95,
                      }}
                    >
                      <PlayCircleFilledIcon sx={{ fontSize: 56, color: 'white', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }} />
                    </Box>
                    <Box sx={{ position: 'absolute', top: 8, left: 8, zIndex: 2, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                      {getProgressBadge(course) && (
                        <Chip
                          {...(getProgressBadge(course).icon && { icon: getProgressBadge(course).icon })}
                          label={getProgressBadge(course).label}
                          size="small"
                          color={getProgressBadge(course).color}
                          sx={{ fontSize: '0.65rem', height: 22, '& .MuiChip-icon': { ml: 0.5 } }}
                        />
                      )}
                      {isBestseller(course) && (
                        <Chip label="Popular" size="small" color="secondary" sx={{ fontSize: '0.65rem', height: 22 }} />
                      )}
                    </Box>
                  </Box>
                  <CardContent sx={{ flexGrow: 1, py: { xs: 1.25, md: 1.5 }, px: { xs: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1.25, md: 1.5 } } }}>
                    <Typography gutterBottom variant="subtitle1" component="h2" sx={{ fontSize: { xs: '0.9rem', md: '0.95rem' }, fontWeight: 600 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: { xs: '0.75rem', md: '0.8rem' }, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description || 'Sin descripción'}
                    </Typography>
                    {course.createdByName && (
                      <Typography
                        variant="caption"
                        color="textSecondary"
                        sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        Por{' '}
                        {course.createdById ? (
                          <Typography component={RouterLink} to={`/instructor/${course.createdById}`} variant="caption" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' }, fontSize: 'inherit' }}>
                            {course.createdByName}
                          </Typography>
                        ) : (
                          course.createdByName
                        )}
                      </Typography>
                    )}
                    {((course.totalDurationSeconds ?? 0) > 0 || (course.studentsCount ?? 0) > 0) && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
                        {(course.totalDurationSeconds ?? 0) > 0 && (
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                            {formatDuration(course.totalDurationSeconds)}
                          </Typography>
                        )}
                        {(course.studentsCount ?? 0) > 0 && (
                          <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>
                            {course.studentsCount} estudiantes
                          </Typography>
                        )}
                      </Box>
                    )}
                    {(course.averageRating > 0 || course.ratingsCount > 0) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography component="span" sx={{ fontWeight: 700, fontSize: '0.9rem', color: 'text.primary' }}>
                          {(course.averageRating ?? 0).toFixed(1)}
                        </Typography>
                        <Rating value={course.averageRating ?? 0} precision={0.1} readOnly size="small" sx={{ fontSize: 14 }} emptyIcon={<StarIcon fontSize="inherit" />} />
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.75rem' }}>
                          ({course.ratingsCount ?? 0} valoraciones)
                        </Typography>
                      </Box>
                    )}
                    {(course.totalVideos ?? 0) > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="textSecondary">
                            {course.videosWatched ?? 0}/{course.totalVideos} videos
                          </Typography>
                          <Typography variant="caption" fontWeight="bold">{course.progressPercentage ?? 0}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, course.progressPercentage ?? 0)}
                          color="primary"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: { xs: 1.5, md: 2 }, py: 1 }}>
                    <Box sx={{ width: '100%' }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ mb: 0.5 }}
                      >
                        Continuar
                      </Button>
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', textAlign: 'center', fontSize: '0.7rem' }}>
                        Acceso de por vida
                      </Typography>
                    </Box>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default MyCoursesPage;
