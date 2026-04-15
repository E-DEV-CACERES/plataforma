import { useEffect, useState, useMemo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import { courseService } from '../services/api';
import { formatDuration } from '../utils/formatDuration';
import { CourseGridSkeleton } from '../components/CourseCardSkeleton';

export const MyCoursesPage = () => {
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
      const response = await courseService.getEnrolledCourses();
      setCourses(response.data);
    } catch {
      setError('Error al cargar tus cursos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <CourseGridSkeleton count={6} />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Mis Cursos
          </Typography>
          <Typography variant="h6" color="textSecondary">
            Cursos en los que estás inscrito
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {courses.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="textSecondary" variant="h6">
              Aún no te has inscrito en ningún curso
            </Typography>
            <Button
              component={RouterLink}
              to="/"
              variant="contained"
              sx={{ mt: 3 }}
            >
              Explorar cursos
            </Button>
          </Card>
        ) : (
          <>
            <FormControl size="small" sx={{ minWidth: 200, mb: 3 }}>
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
            <Grid container spacing={2}>
            {sortedCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
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
                      transform: 'translateY(-4px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <SchoolIcon sx={{ fontSize: 40, color: 'white', opacity: 0.8 }} />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                    <Typography gutterBottom variant="subtitle1" component="h2" sx={{ fontSize: '0.95rem', fontWeight: 600 }}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.8rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description || 'Sin descripción'}
                    </Typography>
                    {course.createdByName && (
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5, display: 'block', fontSize: '0.7rem' }}>
                        Por {course.createdByName}
                      </Typography>
                    )}
                    {(course.totalDurationSeconds ?? 0) > 0 && (
                      <Typography variant="caption" color="textSecondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                        {formatDuration(course.totalDurationSeconds)} de duración
                      </Typography>
                    )}
                    {(course.averageRating > 0 || course.ratingsCount > 0) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        <Rating value={course.averageRating ?? 0} precision={0.1} readOnly size="small" sx={{ fontSize: 14 }} emptyIcon={<StarIcon fontSize="inherit" />} />
                        <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>({course.ratingsCount ?? 0})</Typography>
                      </Box>
                    )}
                    {(course.totalVideos ?? 0) > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                          <Typography variant="caption" color="textSecondary">Progreso</Typography>
                          <Typography variant="caption" fontWeight="bold">{course.progressPercentage ?? 0}%</Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(100, course.progressPercentage ?? 0)}
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, py: 1 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="small"
                      component={RouterLink}
                      to={`/course/${course.id}`}
                    >
                      Continuar
                    </Button>
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
