import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  Typography,
  Button,
  Rating,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StarIcon from '@mui/icons-material/Star';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';
import RefreshIcon from '@mui/icons-material/Refresh';
import { courseService, sectionService, videoService, MEDIA_BASE_URL } from '../services/api';
import { CourseDetailSkeleton } from '../components/CourseCardSkeleton';
import { useSnackbar } from '../context/useSnackbar';
import { formatDuration, formatLastUpdated } from '../utils/formatDuration';
import { getCoursePriceDisplay } from '../utils/coursePrice';
import {
  getCourseImage,
  DEFAULT_LEARNING,
  DEFAULT_REQUIREMENTS,
  DEFAULT_WHO_IS_FOR,
  DEFAULT_CATEGORIES,
  DEFAULT_LANGUAGE,
} from '../constants/courseDefaults';

export const CoursePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [sections, setSections] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrollSuccessOpen, setEnrollSuccessOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState(new Set());
  const [whoIsForExpanded, setWhoIsForExpanded] = useState(false);
  const { showSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    if (!id) {
      setError('Curso no encontrado');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [courseRes, sectionsRes, videosRes] = await Promise.all([
        courseService.getCourseById(id),
        sectionService.getByCourse(id),
        videoService.getVideosByCourse(id),
      ]);
      setCourse(courseRes.data);
      setSections(sectionsRes.data || []);
      setVideos(videosRes.data || []);
    } catch (err) {
      const status = err?.response?.status;
      const message = status === 404 ? 'Curso no encontrado' : 'Error al cargar el curso';
      setError(message);
      setCourse(null);
      if (import.meta.env.DEV) {
        console.error('[CoursePage] Error al cargar:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [id, fetchData]);

  const totalDuration = useMemo(
    () => videos.reduce((acc, v) => acc + (v.duration || 0), 0),
    [videos]
  );

  const contentGroups = useMemo(() => {
    const sortedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const nullSectionVideos = videos.filter((v) => !v.sectionId);
    const groups = [];
    if (nullSectionVideos.length > 0) {
      groups.push({ section: null, title: 'Contenido general', videos: nullSectionVideos });
    }
    sortedSections.forEach((sec) => {
      const secVideos = videos.filter((v) => v.sectionId === sec.id);
      if (secVideos.length > 0) {
        groups.push({ section: sec, title: sec.title || 'Sección', videos: secVideos });
      }
    });
    return groups;
  }, [sections, videos]);

  const allSectionIds = useMemo(
    () => contentGroups.map((g) => g.section?.id ?? 'general'),
    [contentGroups]
  );
  const allExpanded =
    allSectionIds.length > 0 && allSectionIds.every((sid) => expandedSections.has(sid));
  const toggleExpandAll = useCallback(() => {
    setExpandedSections(allExpanded ? new Set() : new Set(allSectionIds));
  }, [allExpanded, allSectionIds]);
  const toggleSection = useCallback((sid) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(sid)) next.delete(sid);
      else next.add(sid);
      return next;
    });
  }, []);

  const handleRetry = () => {
    fetchData();
  };

  const handleEnroll = async () => {
    try {
      await courseService.enrollCourse(id);
      fetchData();
      setEnrollSuccessOpen(true);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al inscribirse';
      if (import.meta.env.DEV) {
        console.error('[CoursePage] Error al inscribirse:', err);
      }
      showSnackbar(msg, 'error');
    }
  };

  const handleBuy = async () => {
    try {
      setCheckoutLoading(true);
      const { data } = await courseService.createCheckout(id);
      if (data?.url) {
        window.location.href = data.url;
      } else {
        showSnackbar('Error al crear la sesión de pago', 'error');
      }
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al procesar el pago';
      if (import.meta.env.DEV) {
        console.error('[CoursePage] Error checkout:', err);
      }
      showSnackbar(msg, 'error');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleEnrollSuccessClose = () => {
    setEnrollSuccessOpen(false);
    navigate(`/course/${id}/learn`);
  };

  const handlePreview = () => {
    navigate(`/course/${id}/learn`);
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Curso no encontrado'}
        </Alert>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={handleRetry}>
          Reintentar
        </Button>
      </Container>
    );
  }

  const isEnrolled = course.isEnrolled === true;
  const subtitle = course.subtitle || course.description?.slice(0, 80) || '';
  const learningObjectives =
    Array.isArray(course.learningObjectives) && course.learningObjectives.length > 0
      ? course.learningObjectives
      : DEFAULT_LEARNING;
  const requirements =
    Array.isArray(course.requirements) && course.requirements.length > 0
      ? course.requirements
      : DEFAULT_REQUIREMENTS;
  const whoIsFor =
    Array.isArray(course.whoIsFor) && course.whoIsFor.length > 0
      ? course.whoIsFor
      : DEFAULT_WHO_IS_FOR;
  const categories =
    Array.isArray(course.categories) && course.categories.length > 0
      ? course.categories
      : DEFAULT_CATEGORIES;
  const language = course.language || DEFAULT_LANGUAGE;
  const totalLectures = videos.length;
  const isBestseller = (course.studentsCount ?? 0) >= 10;
  const isHighestRated =
    (course.averageRating ?? 0) >= 4.5 && (course.ratingsCount ?? 0) >= 5;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth="lg">
        {/* 1. Cabecera principal */}
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
            <Box
              sx={{
                flex: { xs: 'none', md: '0 0 400px' },
                aspectRatio: { xs: '16/9', md: 'auto' },
                height: { md: 280 },
                backgroundImage: `url(${getCourseImage(id)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(0,0,0,0.3)',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.4)' },
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                }}
                onClick={handlePreview}
                role="button"
                tabIndex={0}
                aria-label="Reproducir vista previa del curso"
                onKeyDown={(e) => e.key === 'Enter' && handlePreview()}
              >
                <PlayArrowIcon sx={{ fontSize: 72, color: 'white' }} aria-hidden />
              </Box>
            </Box>
            <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Box>
                <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
                  {course.title}
                </Typography>
                {subtitle && (
                  <Typography variant="body1" color="textSecondary" sx={{ mb: 1.5, fontSize: '0.95rem' }}>
                    {subtitle}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
                  {isBestseller && <Chip label="Popular" size="small" color="secondary" />}
                  {isHighestRated && (
                    <Chip label="Más valorado" size="small" color="primary" variant="outlined" />
                  )}
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {(course.averageRating ?? 0).toFixed(1)}
                    </Typography>
                    <Rating
                      value={course.averageRating ?? 0}
                      precision={0.1}
                      readOnly
                      size="small"
                      emptyIcon={<StarIcon fontSize="inherit" />}
                      aria-label={`Valoración: ${(course.averageRating ?? 0).toFixed(1)} de 5`}
                    />
                  </Box>
                  <Typography variant="body2" color="textSecondary">
                    ({(course.ratingsCount ?? 0).toLocaleString('es')} calificaciones)
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    •
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {(course.studentsCount ?? 0).toLocaleString('es')} estudiantes
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    •
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {formatDuration(totalDuration)}
                  </Typography>
                </Box>
                {categories.length > 0 && (
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {categories.join(' › ')}
                  </Typography>
                )}
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                  {getCoursePriceDisplay(course).displayText}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<PlayArrowIcon />}
                  onClick={handlePreview}
                  sx={{ mt: 1 }}
                  aria-label="Ver vista previa del curso"
                >
                  Ver vista previa del curso
                </Button>
              </Box>
              <Box sx={{ mt: 2 }}>
                {!isEnrolled && (
                  <>
                    {course.isFree || !(course.stripePriceId || course.stripe_price_id) ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleEnroll}
                        startIcon={<CardMembershipIcon />}
                        sx={{ mt: 2 }}
                        aria-label="Inscribirse al curso"
                      >
                        Inscribirse al curso
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleBuy}
                        disabled={checkoutLoading}
                        startIcon={<ShoppingCartIcon />}
                        sx={{ mt: 2 }}
                        aria-label="Comprar curso"
                      >
                        {checkoutLoading ? 'Procesando...' : 'Comprar curso'}
                      </Button>
                    )}
                  </>
                )}
                {isEnrolled && (
                  <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                    <Chip icon={<CheckCircleIcon />} label="Ya estás inscrito" color="success" />
                    <Button
                      variant="contained"
                      color="primary"
                      component={RouterLink}
                      to={`/course/${id}/learn`}
                      startIcon={<PlayArrowIcon />}
                      aria-label="Ir al contenido del curso"
                    >
                      Ir al contenido del curso
                    </Button>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        </Card>

        {/* 2. Información del instructor */}
        {course.createdByName && (
          <Card sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              Creado por
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              {course.createdByProfileImage ? (
                <Box
                  component="img"
                  src={`${MEDIA_BASE_URL}${course.createdByProfileImage}`}
                  alt={`Foto de perfil de ${course.createdByName}`}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  aria-hidden
                >
                  <PersonIcon sx={{ fontSize: 24, color: 'white' }} />
                </Box>
              )}
              <Box
                component={course.createdById ? RouterLink : 'span'}
                to={course.createdById ? `/instructor/${course.createdById}` : undefined}
                sx={{
                  color: course.createdById ? 'primary.main' : 'text.primary',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  '&:hover': course.createdById ? { textDecoration: 'underline' } : {},
                }}
              >
                {course.createdByName}
              </Box>
              <Typography variant="body2" color="textSecondary">
                {course.instructorTagline || 'Instructor'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Última actualización: {formatLastUpdated(course.lastUpdatedAt)}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                • {language}
              </Typography>
            </Box>
          </Card>
        )}

        {/* 3. What you'll learn */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Lo que aprenderás
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }}>
            {learningObjectives.map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <CheckIcon sx={{ color: 'success.main', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* 4. Course content */}
        <Card sx={{ mb: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              p: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Contenido del curso
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {contentGroups.length} secciones • {totalLectures} lecciones •{' '}
              {formatDuration(totalDuration)} en total
            </Typography>
            <Button
              size="small"
              onClick={toggleExpandAll}
              aria-label={allExpanded ? 'Contraer todas las secciones' : 'Expandir todas las secciones'}
            >
              {allExpanded ? 'Contraer todo' : 'Expandir todo'}
            </Button>
          </Box>
          {contentGroups.length > 0 ? (
            contentGroups.map((g) => {
              const sid = g.section?.id ?? 'general';
              return (
                <Accordion
                  key={sid}
                  expanded={expandedSections.has(sid)}
                  onChange={() => toggleSection(sid)}
                  sx={{
                    '&:before': { display: 'none' },
                    boxShadow: 'none',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ minHeight: 56 }}
                    aria-controls={`content-${sid}`}
                    id={`header-${sid}`}
                  >
                    <Typography fontWeight={600}>{g.title}</Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                      {g.videos.length} lecciones •{' '}
                      {formatDuration(g.videos.reduce((a, v) => a + (v.duration || 0), 0))}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0 }} id={`content-${sid}`}>
                    <List dense disablePadding>
                      {[...g.videos]
                        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                        .map((v) => (
                          <ListItem key={v.id} sx={{ py: 0.5, px: 0 }}>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <PlayArrowIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                              {v.title}
                              <Typography component="span" variant="caption" color="textSecondary">
                                {formatDuration(v.duration || 0)}
                              </Typography>
                            </Typography>
                          </ListItem>
                        ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              );
            })
          ) : (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography color="textSecondary">
                Este curso aún no tiene contenido publicado.
              </Typography>
            </Box>
          )}
        </Card>

        {/* 5. Requirements */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Requisitos
          </Typography>
          <List dense disablePadding>
            {requirements.map((r, i) => (
              <ListItem key={i} sx={{ py: 0.25, display: 'list-item', listStyleType: 'disc', ml: 2 }}>
                <Typography variant="body2">{r}</Typography>
              </ListItem>
            ))}
          </List>
        </Card>

        {/* 6. Description */}
        {course.description && (
          <Card sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Descripción
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {course.description}
            </Typography>
            {course.content &&
              typeof course.content === 'string' &&
              !course.content.startsWith('{') && (
                <Typography variant="body1" sx={{ mt: 2, whiteSpace: 'pre-wrap' }}>
                  {course.content}
                </Typography>
              )}
          </Card>
        )}

        {/* 7. Who this course is for */}
        <Card sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Para quién es este curso
          </Typography>
          <Box>
            {(whoIsForExpanded ? whoIsFor : whoIsFor.slice(0, 3)).map((item, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 0.5 }}>
                <Typography component="span" sx={{ color: 'text.secondary', mr: 0.5 }}>
                  •
                </Typography>
                <Typography variant="body2">{item}</Typography>
              </Box>
            ))}
            {whoIsFor.length > 3 && (
              <Button
                size="small"
                onClick={() => setWhoIsForExpanded((prev) => !prev)}
                sx={{ mt: 1 }}
                aria-expanded={whoIsForExpanded}
                aria-label={whoIsForExpanded ? 'Mostrar menos perfiles' : 'Mostrar más perfiles'}
              >
                {whoIsForExpanded ? 'Mostrar menos' : 'Mostrar más'}
              </Button>
            )}
          </Box>
        </Card>

        {/* CTA final */}
        <Card sx={{ p: 3, textAlign: 'center' }}>
          {!isEnrolled ? (
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<CardMembershipIcon />}
              onClick={handleEnroll}
              aria-label="Inscribirse al curso"
            >
              Inscribirse al curso
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={RouterLink}
              to={`/course/${id}/learn`}
              startIcon={<PlayArrowIcon />}
              aria-label="Ir al contenido del curso"
            >
              Ir al contenido del curso
            </Button>
          )}
        </Card>

        <Dialog open={enrollSuccessOpen} onClose={handleEnrollSuccessClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
            ¡Curso recibido!
          </DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ fontSize: 48, mb: 2 }} aria-hidden>
              🎉
            </Box>
            <Typography variant="body1" color="textSecondary">
              Ya puedes acceder a todo el contenido. Empieza a ver los vídeos cuando quieras.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', pb: 3, px: 3, gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<PlayArrowIcon />}
              onClick={handleEnrollSuccessClose}
              fullWidth
              aria-label="Ver todos los vídeos del curso"
            >
              Ver todos los vídeos
            </Button>
            <Button
              component={RouterLink}
              to="/my-courses"
              variant="outlined"
              size="medium"
              onClick={handleEnrollSuccessClose}
              fullWidth
              aria-label="Ir a Mis cursos"
            >
              Ir a Mis cursos
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};
