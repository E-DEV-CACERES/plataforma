import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Rating,
  Chip,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CampaignIcon from '@mui/icons-material/Campaign';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatDuration, formatLastUpdated } from '../utils/formatDuration';

export function CourseDescriptionTabs({
  course,
  selectedVideo,
  progress,
  activeTab,
  onTabChange,
}) {
  const descriptionText = course?.description || selectedVideo?.description || 'Casos prácticos y fáciles de hacer.';
  const instructorBio = course?.instructorBio || '';

  return (
    <>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Tabs value={activeTab} onChange={onTabChange} variant="scrollable" scrollButtons="auto">
          <Tab icon={<DescriptionIcon />} iconPosition="start" label="Descripción General" />
          <Tab icon={<StickyNote2Icon />} iconPosition="start" label="Notas" />
          <Tab icon={<CampaignIcon />} iconPosition="start" label="Anuncios" />
          <Tab icon={<RateReviewIcon />} iconPosition="start" label="Reseñas" />
          <Tab icon={<SchoolIcon />} iconPosition="start" label="Herramientas de aprendizaje" />
        </Tabs>
      </Box>
      <CardContent sx={{ flex: 1, overflow: 'auto', minHeight: 180 }}>
        {activeTab === 0 && (
          <Box>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {descriptionText}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating value={course?.averageRating ?? 0} precision={0.1} readOnly size="small" emptyIcon={<StarIcon fontSize="inherit" />} />
                <Typography variant="body2">
                  Calificación: <strong>{(course?.averageRating ?? 0).toFixed(1)}</strong> de 5
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                {course?.ratingsCount ?? 0} calificaciones
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 2 }}>
              <Box>
                <Typography variant="h6" color="primary">{(course?.studentsCount ?? 0).toLocaleString('es')}</Typography>
                <Typography variant="caption" color="textSecondary">Estudiantes</Typography>
              </Box>
              <Box>
                <Typography variant="h6" color="primary">{formatDuration(course?.totalDurationSeconds ?? 0)}</Typography>
                <Typography variant="caption" color="textSecondary">Total</Typography>
              </Box>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Última actualización {formatLastUpdated(course?.lastUpdatedAt ?? course?.createdAt)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Español · Español [automático]
            </Typography>

            {(course?.createdByName || instructorBio) && (
              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Instructor</Typography>
                {course?.createdByName && (
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    {course?.createdById ? (
                      <Typography component={RouterLink} to={`/instructor/${course.createdById}`} variant="h6" color="primary" sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
                        {course.createdByName}
                      </Typography>
                    ) : (
                      course.createdByName
                    )}
                  </Typography>
                )}
                {course?.instructorTagline && (
                  <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                    {course.instructorTagline}
                  </Typography>
                )}
                {instructorBio && (
                  <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
                    {instructorBio}
                  </Typography>
                )}
              </Box>
            )}

            {selectedVideo && (
              <>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>{selectedVideo.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {selectedVideo.description}
                </Typography>
                {progress?.videosWatched?.some((v) => v.id === selectedVideo.id) && (
                  <Chip icon={<CheckCircleIcon />} label="Visto" color="success" sx={{ mt: 2 }} />
                )}
              </>
            )}
          </Box>
        )}
        {activeTab === 1 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Notas</Typography>
            <Typography variant="body2" color="textSecondary">
              Tus notas personales del curso aparecerán aquí. (Próximamente)
            </Typography>
          </Box>
        )}
        {activeTab === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Anuncios</Typography>
            <Typography variant="body2" color="textSecondary">
              Los anuncios del instructor se mostrarán aquí. (Próximamente)
            </Typography>
          </Box>
        )}
        {activeTab === 3 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Reseñas</Typography>
            <Typography variant="body2" color="textSecondary">
              Reseñas y comentarios de otros estudiantes. (Próximamente)
            </Typography>
          </Box>
        )}
        {activeTab === 4 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>Herramientas de aprendizaje</Typography>
            <Typography variant="body2" color="textSecondary">
              Recursos complementarios, ejercicios y materiales de apoyo. (Próximamente)
            </Typography>
          </Box>
        )}
      </CardContent>
    </>
  );
}
