import { useEffect, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Rating,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { instructorService, resolveMediaUrl } from '../services/api';
import { formatDuration } from '../utils/formatDuration';

const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
  'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=800&q=80',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
];

function getCourseImage(courseId) {
  const idx = (courseId ?? 0) % COURSE_IMAGES.length;
  return COURSE_IMAGES[idx];
}

export const InstructorProfilePage = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await instructorService.getProfile(id);
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'No se pudo cargar el perfil');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert severity="error">{error || 'Instructor no encontrado'}</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Card sx={{ mb: 4, overflow: 'hidden' }}>
          <Box
            sx={{
              height: 180,
              background: profile.instructorCoverImage
                ? `url(${resolveMediaUrl(profile.instructorCoverImage)}) center/cover`
                : 'linear-gradient(135deg, #5624d0 0%, #7c4dff 100%)',
            }}
          />
          <CardContent sx={{ mt: -6, position: 'relative', pt: 8 }}>
            {profile.instructorProfileImage ? (
              <Box
                component="img"
                src={resolveMediaUrl(profile.instructorProfileImage)}
                alt={profile.name}
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: 2,
                  objectFit: 'cover',
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2,
                  border: '4px solid white',
                  boxShadow: 2,
                }}
              >
                <PersonIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
            )}
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {profile.name}
            </Typography>
            {profile.instructorTagline && (
              <Typography variant="body1" color="primary" fontWeight={600} sx={{ mb: 1 }}>
                {profile.instructorTagline}
              </Typography>
            )}
            {profile.instructorBio && (
              <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line', maxWidth: 720, mb: 2 }}>
                {profile.instructorBio}
              </Typography>
            )}
            {(profile.instructorWebsite || profile.instructorLinkedin || profile.instructorTwitter || profile.instructorYoutube) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {profile.instructorWebsite && (
                  <Chip
                    icon={<LanguageIcon sx={{ fontSize: 18 }} />}
                    label="Sitio web"
                    component="a"
                    href={profile.instructorWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    variant="outlined"
                    sx={{ '& .MuiChip-icon': { ml: 0.5 } }}
                  />
                )}
                {profile.instructorLinkedin && (
                  <Chip
                    icon={<LinkedInIcon sx={{ fontSize: 18 }} />}
                    label="LinkedIn"
                    component="a"
                    href={profile.instructorLinkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    variant="outlined"
                    sx={{ '& .MuiChip-icon': { ml: 0.5 } }}
                  />
                )}
                {profile.instructorTwitter && (
                  <Chip
                    label="X / Twitter"
                    component="a"
                    href={profile.instructorTwitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    variant="outlined"
                  />
                )}
                {profile.instructorYoutube && (
                  <Chip
                    icon={<YouTubeIcon sx={{ fontSize: 18 }} />}
                    label="YouTube"
                    component="a"
                    href={profile.instructorYoutube}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    size="small"
                    variant="outlined"
                    sx={{ '& .MuiChip-icon': { ml: 0.5 } }}
                  />
                )}
              </Box>
            )}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <SchoolIcon color="action" />
                <Typography variant="body2" color="textSecondary">
                  {profile.coursesCount} curso{profile.coursesCount !== 1 ? 's' : ''}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PeopleIcon color="action" />
                <Typography variant="body2" color="textSecondary">
                  {profile.totalStudents.toLocaleString('es')} estudiantes
                </Typography>
              </Box>
              {(profile.averageRating > 0 || profile.totalReviews > 0) && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={profile.averageRating} precision={0.1} readOnly size="small" emptyIcon={<StarIcon fontSize="inherit" />} />
                  <Typography variant="body2" color="textSecondary">
                    {profile.averageRating.toFixed(1)} ({profile.totalReviews} valoraciones)
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>

        <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
          Cursos impartidos
        </Typography>
        <Grid container spacing={3}>
          {profile.courses.map((course) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardActionArea component={RouterLink} to={`/course/${course.id}`} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                  <Box
                    sx={{
                      height: 140,
                      backgroundImage: `url(${getCourseImage(course.id)})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ fontSize: '1rem' }} gutterBottom>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.8rem' }}>
                      {course.description || 'Sin descripción'}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                      <Chip label={`${course.studentsCount} estudiantes`} size="small" variant="outlined" />
                      {course.totalDurationSeconds > 0 && (
                        <Chip label={formatDuration(course.totalDurationSeconds)} size="small" variant="outlined" />
                      )}
                      {(course.averageRating > 0 || course.ratingsCount > 0) && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                            {(course.averageRating ?? 0).toFixed(1)}
                          </Typography>
                          <Rating value={course.averageRating ?? 0} precision={0.1} readOnly size="small" sx={{ fontSize: 14 }} emptyIcon={<StarIcon fontSize="inherit" />} />
                          <Typography variant="caption" color="textSecondary">
                            ({(course.ratingsCount ?? 0).toLocaleString('es')})
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default InstructorProfilePage;
