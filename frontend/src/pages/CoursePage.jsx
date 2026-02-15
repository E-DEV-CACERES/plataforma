import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Rating,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import FolderIcon from '@mui/icons-material/Folder';
import DownloadIcon from '@mui/icons-material/Download';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StarIcon from '@mui/icons-material/Star';
import DescriptionIcon from '@mui/icons-material/Description';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import CampaignIcon from '@mui/icons-material/Campaign';
import RateReviewIcon from '@mui/icons-material/RateReview';
import SchoolIcon from '@mui/icons-material/School';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  courseService,
  videoService,
  progressService,
  sectionService,
  courseFileService,
  MEDIA_BASE_URL,
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CourseDetailSkeleton } from '../components/CourseCardSkeleton';
import { useSnackbar } from '../context/useSnackbar';
import { formatDuration, formatLastUpdated } from '../utils/formatDuration';

export const CoursePage = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [videos, setVideos] = useState([]);
  const [sections, setSections] = useState([]);
  const [courseFiles, setCourseFiles] = useState([]);
  const [progress, setProgress] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: '', description: '', duration: '', order: '', sectionId: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadSubtitleFile, setUploadSubtitleFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionForm, setSectionForm] = useState({ title: '', order: '' });
  const [savingSection, setSavingSection] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);
  const [fileForm, setFileForm] = useState({ title: '', sectionId: '', order: '' });
  const [fileFormFile, setFileFormFile] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [deletingSectionId, setDeletingSectionId] = useState(null);
  const [downloadingDiploma, setDownloadingDiploma] = useState(false);
  const [ratingCourse, setRatingCourse] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, videosRes, sectionsRes, filesRes] = await Promise.all([
        courseService.getCourseById(id),
        videoService.getVideosByCourse(id),
        sectionService.getByCourse(id),
        courseFileService.getByCourse(id),
      ]);
      
      const courseData = courseRes.data;
      setCourse(courseData);
      setVideos(videosRes.data);
      setSections(sectionsRes.data);
      setCourseFiles(filesRes.data);
      
      if (user && courseData?.isEnrolled) {
        const progressRes = await progressService.getProgress(id);
        setProgress(progressRes.data);
      } else {
        setProgress(null);
      }

      if (videosRes.data.length > 0) {
        setSelectedVideo((prev) => {
          const stillExists = videosRes.data.some((v) => v.id === prev?.id);
          return !prev || !stillExists ? videosRes.data[0] : prev;
        });
      } else {
        setSelectedVideo(null);
      }
    } catch {
      setError('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchData();
    setExpandedAccordion(null);
  }, [id, fetchData]);

  useEffect(() => {
    if (expandedAccordion !== null) return;
    const nullSectionVideos = videos.filter((v) => !v.sectionId);
    const nullSectionFiles = courseFiles.filter((f) => !f.sectionId);
    const hasGeneral = nullSectionVideos.length > 0 || nullSectionFiles.length > 0;
    const sortedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const firstSection = sortedSections[0];
    if (hasGeneral) {
      setExpandedAccordion('general');
    } else if (firstSection) {
      setExpandedAccordion(firstSection.id);
    }
  }, [sections, videos, courseFiles, expandedAccordion]);

  const handleEnroll = async () => {
    try {
      await courseService.enrollCourse(id);
      fetchData();
      showSnackbar('Inscripción exitosa');
    } catch {
      showSnackbar('Error al inscribirse', 'error');
    }
  };

  const handleMarkWatched = async (videoId) => {
    try {
      await progressService.markVideoWatched(id, videoId);
      fetchData();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleUploadOpen = () => {
    setUploadForm({
      title: '',
      description: '',
      duration: '',
      order: videos.length.toString(),
      sectionId: '',
    });
    setUploadFile(null);
    setUploadSubtitleFile(null);
    setUploadOpen(true);
  };

  const handleSectionOpen = () => {
    setSectionForm({ title: '', order: sections.length.toString() });
    setSectionModalOpen(true);
  };

  const handleSectionClose = () => {
    setSectionModalOpen(false);
    setSectionForm({ title: '', order: '' });
  };

  const handleSectionSubmit = async (e) => {
    e.preventDefault();
    if (!sectionForm.title?.trim()) {
      showSnackbar('El título de la sección es obligatorio', 'error');
      return;
    }
    setSavingSection(true);
    try {
      await sectionService.create(id, {
        title: sectionForm.title.trim(),
        order: Number(sectionForm.order) || 0,
      });
      showSnackbar('Sección creada');
      handleSectionClose();
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al crear sección', 'error');
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async (sectionId, e) => {
    e?.stopPropagation();
    if (!window.confirm('¿Eliminar esta sección? Los videos y archivos quedarán sin sección.')) return;
    setDeletingSectionId(sectionId);
    try {
      await sectionService.delete(id, sectionId);
      showSnackbar('Sección eliminada');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeletingSectionId(null);
    }
  };

  const handleFileOpen = () => {
    setFileForm({ title: '', sectionId: '', order: courseFiles.length.toString() });
    setFileFormFile(null);
    setFileModalOpen(true);
  };

  const handleFileClose = () => {
    setFileModalOpen(false);
    setFileForm({ title: '', sectionId: '', order: '' });
    setFileFormFile(null);
  };

  const handleFileSubmit = async (e) => {
    e.preventDefault();
    if (!fileFormFile) {
      showSnackbar('Selecciona un archivo', 'error');
      return;
    }
    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', fileFormFile);
      formData.append('title', fileForm.title?.trim() || fileFormFile.name);
      if (fileForm.sectionId) formData.append('sectionId', fileForm.sectionId);
      if (fileForm.order) formData.append('order', fileForm.order);
      await courseFileService.upload(id, formData);
      showSnackbar('Archivo subido');
      handleFileClose();
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al subir archivo', 'error');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRateCourse = async (newValue) => {
    if (!newValue) return;
    setRatingCourse(true);
    try {
      await courseService.rateCourse(id, newValue);
      showSnackbar('Calificación enviada');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al calificar', 'error');
    } finally {
      setRatingCourse(false);
    }
  };

  const handleDownloadDiploma = async () => {
    setDownloadingDiploma(true);
    try {
      await progressService.downloadDiploma(id, course?.title);
      showSnackbar('Diploma descargado correctamente');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al descargar el diploma';
      showSnackbar(msg, 'error');
    } finally {
      setDownloadingDiploma(false);
    }
  };

  const handleDeleteFile = async (fileId, e) => {
    e?.stopPropagation();
    if (!window.confirm('¿Eliminar este archivo?')) return;
    setDeletingFileId(fileId);
    try {
      await courseFileService.delete(id, fileId);
      showSnackbar('Archivo eliminado');
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleUploadClose = () => {
    setUploadOpen(false);
    setUploadForm({ title: '', description: '', duration: '', order: '' });
    setUploadFile(null);
    setUploadSubtitleFile(null);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      showSnackbar('Selecciona un archivo de video', 'error');
      return;
    }
    if (!uploadForm.title?.trim()) {
      showSnackbar('El título es obligatorio', 'error');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('video', uploadFile);
      if (uploadSubtitleFile) formData.append('subtitle', uploadSubtitleFile);
      formData.append('title', uploadForm.title.trim());
      if (uploadForm.description?.trim()) formData.append('description', uploadForm.description.trim());
      if (uploadForm.duration) formData.append('duration', uploadForm.duration);
      if (uploadForm.order) formData.append('order', uploadForm.order);
      if (uploadForm.sectionId) formData.append('sectionId', uploadForm.sectionId);
      await videoService.uploadVideo(id, formData);
      showSnackbar('Video subido correctamente');
      handleUploadClose();
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al subir el video';
      showSnackbar(msg, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId, e) => {
    e.stopPropagation();
    if (!window.confirm('¿Eliminar este video?')) return;
    setDeletingId(videoId);
    try {
      await videoService.deleteVideo(id, videoId);
      showSnackbar('Video eliminado');
      if (selectedVideo?.id === videoId) {
        const remaining = videos.filter((v) => v.id !== videoId);
        setSelectedVideo(remaining[0] || null);
      }
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <CourseDetailSkeleton />;
  }

  if (!course) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Curso no encontrado</Alert>
      </Container>
    );
  }

  const isEnrolled = course.isEnrolled === true;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth={false}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Course Player: video + chapters menu */}
        <Card
          className="course-player"
          sx={{
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            minHeight: 500,
          }}
        >
          {/* Video Player - área principal (75% ancho estilo Udemy) */}
          <Box
            className="course-player__video-area"
            sx={{
              flex: { xs: 1, md: '0 0 75%' },
              minWidth: 0,
              maxWidth: { md: '75%' },
              order: { xs: 1, md: 1 },
            }}
          >
            {selectedVideo ? (
              <>
                <Box
                  component="video"
                  src={`${MEDIA_BASE_URL}${selectedVideo.videoUrl}`}
                  controls
                  preload="metadata"
                  onEnded={() => isEnrolled && handleMarkWatched(selectedVideo.id)}
                  onError={(e) => {
                    const target = e.target;
                    const code = target?.error?.code;
                    if (code === 1) return;
                    if (code === 4) {
                      showSnackbar('Formato no compatible. Elimina este video y súbelo de nuevo en MP4 (H.264). Usa VLC o HandBrake para convertir.', 'error');
                    } else if (code === 2 || code === 3) {
                      showSnackbar('No se pudo cargar el video. Verifica la conexión.', 'error');
                    } else if (code !== undefined && code !== null) {
                      showSnackbar('Error al cargar el video. Verifica que el archivo exista.', 'error');
                    }
                  }}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    minHeight: 400,
                    bgcolor: '#000',
                    display: 'block',
                  }}
                >
                  {selectedVideo.subtitleUrl && (
                    <track
                      kind="subtitles"
                      src={`${MEDIA_BASE_URL}${selectedVideo.subtitleUrl}`}
                      srcLang="es"
                      label="Español"
                      default
                    />
                  )}
                </Box>
                {/* Submenú: Descripción, Notas, Anuncios, Reseñas, Herramientas */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
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
                        {course?.description || selectedVideo?.description || 'Casos prácticos y fáciles de hacer.'}
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

                      <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Instructor</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {course?.createdByName || 'Javier Finance'}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          {course?.instructorTagline || 'Elaboración de contenido de valor'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
                          {course?.instructorBio || `Mi alias en la internet es Javier  y soy uno de los creadores de contenido sobre desarrollo de software & finanzas, más popular de la plataforma.

Actualmente estoy trabajando en la creación de nuevos contenidos relacionados con el mundo de la programación y finanzas.

Da el primer paso pero nunca el último.`}
                        </Typography>
                      </Box>

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
            ) : (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 400,
                    bgcolor: 'grey.100',
                  }}
                >
                  <Typography color="textSecondary">Selecciona un video para comenzar</Typography>
                </Box>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant="scrollable" scrollButtons="auto">
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
                        {course?.description || 'Casos prácticos y fáciles de hacer.'}
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

                      <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                        <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Instructor</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {course?.createdByName || 'Javier Finance'}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                          {course?.instructorTagline || 'Elaboración de contenido de valor'}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ whiteSpace: 'pre-line' }}>
                          {course?.instructorBio || `Mi alias en la internet es Javier  y soy uno de los creadores de contenido sobre desarrollo de software & finanzas, más popular de la plataforma.

Actualmente estoy trabajando en la creación de nuevos contenidos relacionados con el mundo de la programación y finanzas.

Da el primer paso pero nunca el último.`}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                  {activeTab === 1 && (
                    <Typography variant="body2" color="textSecondary">
                      Tus notas personales del curso aparecerán aquí. (Próximamente)
                    </Typography>
                  )}
                  {activeTab === 2 && (
                    <Typography variant="body2" color="textSecondary">
                      Los anuncios del instructor se mostrarán aquí. (Próximamente)
                    </Typography>
                  )}
                  {activeTab === 3 && (
                    <Typography variant="body2" color="textSecondary">
                      Reseñas y comentarios de otros estudiantes. (Próximamente)
                    </Typography>
                  )}
                  {activeTab === 4 && (
                    <Typography variant="body2" color="textSecondary">
                      Recursos complementarios, ejercicios y materiales de apoyo. (Próximamente)
                    </Typography>
                  )}
                </CardContent>
              </>
            )}
          </Box>

          {/* Chapters Menu - 25% ancho al lado del video */}
          <Box
            className="course-player__chapters-menu"
            sx={{
              flex: { xs: 1, md: '0 0 25%' },
              width: { xs: '100%', md: '25%' },
              maxWidth: '100%',
              borderLeft: { md: '1px solid' },
              borderColor: { md: 'divider' },
              bgcolor: 'grey.50',
              display: 'flex',
              flexDirection: 'column',
              order: { xs: 2, md: 2 },
            }}
          >
            {!isEnrolled && (
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleEnroll}
                >
                  Inscribirse al Curso
                </Button>
              </Box>
            )}
            {isEnrolled && (
              <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                {progress && videos.length > 0 && (
                  <>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="textSecondary">Tu progreso</Typography>
                      <Chip label={`${progress.progressPercentage}%`} size="small" color="primary" />
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, progress.progressPercentage ?? 0)}
                      sx={{ height: 6, borderRadius: 3, mb: 1 }}
                    />
                    {progress.completedAt && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        fullWidth
                        startIcon={downloadingDiploma ? <CircularProgress size={18} color="inherit" /> : <CardMembershipIcon />}
                        onClick={handleDownloadDiploma}
                        disabled={downloadingDiploma}
                        sx={{ mt: 1 }}
                      >
                        {downloadingDiploma ? 'Descargando...' : 'Descargar diploma'}
                      </Button>
                    )}
                  </>
                )}
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>Califica este curso</Typography>
                  <Rating
                    value={course?.userRating ?? 0}
                    onChange={(_, newValue) => handleRateCourse(newValue)}
                    disabled={ratingCourse}
                    size="small"
                    emptyIcon={<StarIcon fontSize="inherit" />}
                  />
                </Box>
              </Box>
            )}
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
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                Contenido ({videos.length} videos, {courseFiles.length} archivos)
              </Typography>
              {user?.role === 'admin' && (
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Button size="small" variant="outlined" startIcon={<FolderIcon />} onClick={handleSectionOpen}>
                    Sección
                  </Button>
                  <Button size="small" variant="outlined" startIcon={<InsertDriveFileIcon />} onClick={handleFileOpen}>
                    Archivo
                  </Button>
                  <Button size="small" variant="contained" startIcon={<AddCircleIcon />} onClick={handleUploadOpen}>
                    Video
                  </Button>
                </Box>
              )}
            </Box>
            <Box
              sx={{
                flex: 1,
                overflow: 'auto',
                maxHeight: { xs: 300, md: 'none' },
              }}
            >
              {(() => {
                const baseUrl = MEDIA_BASE_URL;
                const hasContent = videos.length > 0 || courseFiles.length > 0;
                const groups = [];
                const nullSectionVideos = videos.filter((v) => !v.sectionId);
                const nullSectionFiles = courseFiles.filter((f) => !f.sectionId);
                if (nullSectionVideos.length > 0 || nullSectionFiles.length > 0) {
                  groups.push({ section: null, videos: nullSectionVideos, files: nullSectionFiles });
                }
                sections
                  .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                  .forEach((sec) => {
                    const secVideos = videos.filter((v) => v.sectionId === sec.id);
                    const secFiles = courseFiles.filter((f) => f.sectionId === sec.id);
                    if (secVideos.length > 0 || secFiles.length > 0 || user?.role === 'admin') {
                      groups.push({ section: sec, videos: secVideos, files: secFiles });
                    }
                  });
                if (!hasContent && groups.length === 0) {
                  return (
                    <Box sx={{ p: 2 }}>
                      <Typography color="textSecondary" variant="body2">
                        Sin contenido disponible
                      </Typography>
                    </Box>
                  );
                }
                return (
                  <>
                    {groups.map(({ section, videos: groupVideos, files: groupFiles }) => {
                      const accordionKey = section?.id ?? 'general';
                      const sectionTitle = section ? section.title : 'Contenido general';
                      const itemCount = groupVideos.length + groupFiles.length;
                      return (
                        <Accordion
                          key={accordionKey}
                          expanded={expandedAccordion === accordionKey}
                          onChange={() => setExpandedAccordion((prev) => (prev === accordionKey ? null : accordionKey))}
                          sx={{
                            boxShadow: 'none',
                            '&:before': { display: 'none' },
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            '&:last-of-type': { borderBottom: 'none' },
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{
                              bgcolor: 'grey.200',
                              minHeight: 44,
                              '& .MuiAccordionSummary-content': { my: 1 },
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {sectionTitle}
                                {itemCount > 0 && (
                                  <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1, fontWeight: 400 }}>
                                    ({itemCount})
                                  </Typography>
                                )}
                              </Typography>
                              {user?.role === 'admin' && section && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteSection(section.id, e);
                                  }}
                                  disabled={deletingSectionId === section.id}
                                >
                                  {deletingSectionId === section.id ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  )}
                                </IconButton>
                              )}
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            <List disablePadding>
                        {groupVideos.map((video) => {
                          const isWatched = progress?.videosWatched?.some((v) => v.id === video.id);
                          const isSelected = selectedVideo?.id === video.id;
                          return (
                            <ListItemButton
                              key={video.id}
                              onClick={() => setSelectedVideo(video)}
                              selected={isSelected}
                              sx={{
                                borderBottom: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 0,
                                py: 1.5,
                                px: 2,
                                pl: 3,
                                bgcolor: isSelected ? 'primary.light' : 'transparent',
                                '&:hover': { bgcolor: isSelected ? 'primary.light' : 'action.hover' },
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                                <PlayArrowIcon sx={{ fontSize: 20, color: isSelected ? 'primary.main' : 'text.secondary', flexShrink: 0 }} />
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography variant="body2" sx={{ fontWeight: isSelected ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {video.title}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {Math.floor(video.duration / 60)}:{String(video.duration % 60).padStart(2, '0')}
                                    {isWatched && ' • ✓'}
                                  </Typography>
                                </Box>
                                {isWatched && !isSelected && <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />}
                                {user?.role === 'admin' && (
                                  <IconButton size="small" color="error" onClick={(e) => handleDeleteVideo(video.id, e)} disabled={deletingId === video.id} sx={{ flexShrink: 0 }}>
                                    {deletingId === video.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                                  </IconButton>
                                )}
                              </Box>
                            </ListItemButton>
                          );
                        })}
                        {groupFiles.map((file) => (
                          <ListItemButton
                            key={file.id}
                            component="a"
                            href={`${baseUrl}${file.fileUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            download
                            sx={{
                              borderBottom: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 0,
                              py: 1.5,
                              px: 2,
                              pl: 3,
                              textDecoration: 'none',
                              color: 'inherit',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                              <DownloadIcon sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                              <Typography variant="body2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                {file.title}
                              </Typography>
                              {user?.role === 'admin' && (
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    handleDeleteFile(file.id, e);
                                  }}
                                  disabled={deletingFileId === file.id}
                                  sx={{ flexShrink: 0 }}
                                >
                                  {deletingFileId === file.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                                </IconButton>
                              )}
                            </Box>
                          </ListItemButton>
                        ))}
                            </List>
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </>
                );
              })()}
            </Box>
          </Box>
        </Card>

        {/* Modal Crear Sección */}
        <Dialog open={sectionModalOpen} onClose={handleSectionClose} maxWidth="xs" fullWidth>
          <form onSubmit={handleSectionSubmit}>
            <DialogTitle>Nueva sección</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Título"
                value={sectionForm.title}
                onChange={(e) => setSectionForm((f) => ({ ...f, title: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Orden"
                type="number"
                value={sectionForm.order}
                onChange={(e) => setSectionForm((f) => ({ ...f, order: e.target.value }))}
                fullWidth
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSectionClose} disabled={savingSection}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={savingSection} startIcon={savingSection ? <CircularProgress size={20} color="inherit" /> : null}>
                {savingSection ? 'Creando...' : 'Crear sección'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Modal Subir Archivo */}
        <Dialog open={fileModalOpen} onClose={handleFileClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleFileSubmit}>
            <DialogTitle>Subir archivo para descarga</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Título (opcional)"
                value={fileForm.title}
                onChange={(e) => setFileForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Por defecto se usa el nombre del archivo"
                fullWidth
              />
              <TextField
                select
                label="Sección"
                value={fileForm.sectionId}
                onChange={(e) => setFileForm((f) => ({ ...f, sectionId: e.target.value }))}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Sin sección</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </TextField>
              <TextField
                label="Orden"
                type="number"
                value={fileForm.order}
                onChange={(e) => setFileForm((f) => ({ ...f, order: e.target.value }))}
                fullWidth
              />
              <Button variant="outlined" component="label" fullWidth>
                {fileFormFile ? fileFormFile.name : 'Seleccionar archivo (PDF, Word, Excel, etc.)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*"
                  onChange={(e) => setFileFormFile(e.target.files?.[0] || null)}
                />
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleFileClose} disabled={uploadingFile}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={uploadingFile || !fileFormFile} startIcon={uploadingFile ? <CircularProgress size={20} color="inherit" /> : null}>
                {uploadingFile ? 'Subiendo...' : 'Subir archivo'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Modal Subir Video */}
        <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleUploadSubmit}>
            <DialogTitle>Añadir video al curso</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Título"
                value={uploadForm.title}
                onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Descripción"
                value={uploadForm.description}
                onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                label="Duración (segundos)"
                type="number"
                value={uploadForm.duration}
                onChange={(e) => setUploadForm((f) => ({ ...f, duration: e.target.value }))}
                placeholder="Ej: 300"
                fullWidth
              />
              <TextField
                label="Orden"
                type="number"
                value={uploadForm.order}
                onChange={(e) => setUploadForm((f) => ({ ...f, order: e.target.value }))}
                fullWidth
              />
              <TextField
                select
                label="Sección"
                value={uploadForm.sectionId}
                onChange={(e) => setUploadForm((f) => ({ ...f, sectionId: e.target.value }))}
                fullWidth
                SelectProps={{ native: true }}
              >
                <option value="">Sin sección</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title}
                  </option>
                ))}
              </TextField>
              <Box>
                <Button variant="outlined" component="label" fullWidth>
                  {uploadFile ? uploadFile.name : 'Seleccionar archivo de video'}
                  <input
                    type="file"
                    hidden
                    accept="video/mp4,.mp4"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                  />
                </Button>
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                  Solo MP4 (H.264). Convierte MOV/AVI a MP4 con VLC o HandBrake antes de subir.
                </Typography>
              </Box>
              <Button variant="outlined" component="label" fullWidth color="secondary">
                {uploadSubtitleFile ? uploadSubtitleFile.name : 'Subtítulos (.vtt) — opcional'}
                <input
                  type="file"
                  hidden
                  accept=".vtt,text/vtt"
                  onChange={(e) => setUploadSubtitleFile(e.target.files?.[0] || null)}
                />
              </Button>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleUploadClose} disabled={uploading}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={uploading || !uploadFile} startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : null}>
                {uploading ? 'Subiendo...' : 'Subir video'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </Box>
  );
};
