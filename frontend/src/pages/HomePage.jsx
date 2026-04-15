// Ejemplo en src/components/Navbar.jsx
const Navbar = () => {
  return (
    <nav className="bg-blue-600 p-4">
      <div className="container mx-auto flex justify-between items-center">
        {/* Aquí configuras el nombre visible */}
        <h1 className="text-white text-2xl font-bold">EdTech</h1>
        {/* ... resto del navbar ... */}
      </div>
    </nav>
  );
};
import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  Chip,
  Rating,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { courseService } from '../services/api';
import { useAuth } from '../context/useAuth';
import { getCourseImage } from '../constants/courseDefaults';
import { getCoursePriceDisplay } from '../utils/coursePrice';
import { formatDuration } from '../utils/formatDuration';

export const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses();
      setCourses(response.data);
    } catch {
      setError('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Bienvenido a Nuestra Plataforma
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Aprende nuevas habilidades con nuestros cursos en línea
          </Typography>
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

        {courses.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="textSecondary" variant="h6">
              No hay cursos disponibles aún
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {courses.map((course) => {
              const priceInfo = getCoursePriceDisplay(course);
              const isBestseller = (course.studentsCount ?? 0) >= 10;
              const hasRating = (course.ratingsCount ?? 0) > 0;
              return (
                <Grid size={{ xs: 12, sm: 6, md: 6 }} key={course.id}>
                  <Card
                    component={RouterLink}
                    to={`/course/${course.id}`}
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      textDecoration: 'none',
                      color: 'inherit',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: 3,
                      },
                    }}
                  >
                    <Box sx={{ position: 'relative' }}>
                      <Box
                        sx={{
                          aspectRatio: '16/9',
                          backgroundImage: `url(${getCourseImage(course.id)})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                      {isBestseller && (
                        <Chip
                          label="Bestseller"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            left: 8,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            bgcolor: '#eceb98',
                            color: '#3d3c0a',
                          }}
                        />
                      )}
                    </Box>
                    <CardContent sx={{ flexGrow: 1, py: 1.5, px: 2 }}>
                      <Typography
                        variant="subtitle1"
                        component="h2"
                        sx={{
                          fontWeight: 600,
                          fontSize: '1rem',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4,
                          minHeight: 2.8,
                        }}
                      >
                        {course.title}
                      </Typography>
                      {course.createdByName && (
                        <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                          Por {course.createdByName}
                        </Typography>
                      )}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {(course.averageRating ?? 0).toFixed(1)}
                        </Typography>
                        <Rating value={course.averageRating ?? 0} precision={0.5} readOnly size="small" sx={{ fontSize: '0.9rem' }} />
                        <Typography variant="caption" color="textSecondary">
                          {hasRating
                            ? `(${(course.ratingsCount ?? 0).toLocaleString('es')} calificaciones)`
                            : 'Sin calificaciones'}
                        </Typography>
                      </Box>
                      {(course.totalDurationSeconds ?? 0) > 0 && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                          {formatDuration(course.totalDurationSeconds)} de contenido
                        </Typography>
                      )}
                      <Box sx={{ mt: 1.5 }}>
                        {priceInfo.isFree ? (
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                            Gratis
                          </Typography>
                        ) : priceInfo.originalFormatted ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                              {priceInfo.originalFormatted}
                            </Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                              {priceInfo.finalFormatted}
                            </Typography>
                          </Box>
                        ) : (
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                            {priceInfo.finalFormatted}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Box>
  );
};
