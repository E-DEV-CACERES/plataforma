import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Container,
  Box,
  Card,
  Typography,
  Button,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  courseService,
  videoService,
  progressService,
  sectionService,
  courseFileService,
} from '../services/api';
import { useAuth } from '../context/useAuth';
import { CourseDetailSkeleton } from '../components/CourseCardSkeleton';
import { CoursePlayer } from '../components/CoursePlayer';
import { useSnackbar } from '../context/useSnackbar';

export const CourseLearnPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
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
  const [enrollSuccessOpen, setEnrollSuccessOpen] = useState(false);
  const playerRef = useRef(null);
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
  }, [id, fetchData]);

  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      showSnackbar('¡Pago completado! Ya puedes acceder al curso.', 'success');
      window.history.replaceState({}, '', `/course/${id}/learn`);
    }
  }, [searchParams, id, showSnackbar]);

  const handleEnroll = async () => {
    try {
      await courseService.enrollCourse(id);
      fetchData();
      setEnrollSuccessOpen(true);
    } catch {
      showSnackbar('Error al inscribirse', 'error');
    }
  };

  const handleEnrollSuccessClose = () => {
    setEnrollSuccessOpen(false);
    playerRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    setUploadForm({ title: '', description: '', duration: '', order: videos.length.toString(), sectionId: '' });
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
      await sectionService.create(id, { title: sectionForm.title.trim(), order: Number(sectionForm.order) || 0 });
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
      showSnackbar(err.response?.data?.message || 'Error al descargar el diploma', 'error');
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
      showSnackbar(err.response?.data?.message || 'Error al subir el video', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteVideo = async (videoId, e) => {
    e?.stopPropagation();
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

  if (loading) return <CourseDetailSkeleton />;
  if (!course) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography color="error">Curso no encontrado</Typography>
      </Container>
    );
  }

  const isEnrolled = course.isEnrolled === true;
  const isAdmin = user?.role === 'admin';
  const isCourseOwner = user?.role === 'instructor' && course?.createdById === user?.id;
  const isAdminOrCourseOwner = isAdmin || isCourseOwner;
  const canViewVideos = isEnrolled || isAdmin || isCourseOwner;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth={false}>
        {error && (
          <Box sx={{ mb: 3, p: 2, bgcolor: 'error.light', color: 'error.contrastText', borderRadius: 1 }}>
            {error}
          </Box>
        )}

        <CoursePlayer
          playerRef={playerRef}
          course={course}
          videos={videos}
          sections={sections}
          courseFiles={courseFiles}
          selectedVideo={selectedVideo}
          onVideoSelect={setSelectedVideo}
          progress={progress}
          isEnrolled={isEnrolled}
          isAdminOrCourseOwner={isAdminOrCourseOwner}
          canViewVideos={canViewVideos}
          onEnroll={handleEnroll}
          onMarkWatched={handleMarkWatched}
          onDownloadDiploma={handleDownloadDiploma}
          onRateCourse={handleRateCourse}
          onSectionOpen={handleSectionOpen}
          onFileOpen={handleFileOpen}
          onUploadOpen={handleUploadOpen}
          onDeleteVideo={handleDeleteVideo}
          onDeleteSection={handleDeleteSection}
          onDeleteFile={handleDeleteFile}
          showSnackbar={showSnackbar}
          downloadingDiploma={downloadingDiploma}
          ratingCourse={ratingCourse}
          deletingId={deletingId}
          deletingFileId={deletingFileId}
          deletingSectionId={deletingSectionId}
        />

        <Dialog open={sectionModalOpen} onClose={handleSectionClose} maxWidth="xs" fullWidth>
          <form onSubmit={handleSectionSubmit}>
            <DialogTitle>Nueva sección</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField label="Título" value={sectionForm.title} onChange={(e) => setSectionForm((f) => ({ ...f, title: e.target.value }))} required fullWidth />
              <TextField label="Orden" type="number" value={sectionForm.order} onChange={(e) => setSectionForm((f) => ({ ...f, order: e.target.value }))} fullWidth />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleSectionClose} disabled={savingSection}>Cancelar</Button>
              <Button type="submit" variant="contained" disabled={savingSection} startIcon={savingSection ? <CircularProgress size={20} color="inherit" /> : null}>
                {savingSection ? 'Creando...' : 'Crear sección'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        <Dialog open={enrollSuccessOpen} onClose={handleEnrollSuccessClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>¡Curso recibido!</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', py: 2 }}>
            <Box sx={{ fontSize: 48, mb: 2 }}>🎉</Box>
            <Typography variant="body1" color="textSecondary">Ya puedes acceder a todo el contenido.</Typography>
          </DialogContent>
          <DialogActions sx={{ flexDirection: 'column', alignItems: 'stretch', pb: 3, px: 3, gap: 1 }}>
            <Button variant="contained" color="primary" size="large" startIcon={<PlayArrowIcon />} onClick={handleEnrollSuccessClose} fullWidth>
              Ver todos los vídeos
            </Button>
            <Button component={RouterLink} to="/my-courses" variant="outlined" size="medium" onClick={handleEnrollSuccessClose} fullWidth>
              Ir a Mis cursos
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={fileModalOpen} onClose={handleFileClose} maxWidth="sm" fullWidth>
          <form onSubmit={handleFileSubmit}>
            <DialogTitle>Subir archivo para descarga</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField label="Título (opcional)" value={fileForm.title} onChange={(e) => setFileForm((f) => ({ ...f, title: e.target.value }))} placeholder="Por defecto se usa el nombre del archivo" fullWidth />
              <TextField select label="Sección" value={fileForm.sectionId} onChange={(e) => setFileForm((f) => ({ ...f, sectionId: e.target.value }))} fullWidth SelectProps={{ native: true }}>
                <option value="">Sin sección</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </TextField>
              <TextField label="Orden" type="number" value={fileForm.order} onChange={(e) => setFileForm((f) => ({ ...f, order: e.target.value }))} fullWidth />
              <Button variant="outlined" component="label" fullWidth>
                {fileFormFile ? fileFormFile.name : 'Seleccionar archivo'}
                <input type="file" hidden accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,image/*" onChange={(e) => setFileFormFile(e.target.files?.[0] || null)} />
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

        <Dialog open={uploadOpen} onClose={handleUploadClose} maxWidth="sm" fullWidth PaperProps={{ sx: { position: 'relative' } }}>
          {uploading && (
            <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(4px)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
              <Card sx={{ p: 4, textAlign: 'center', maxWidth: 320, boxShadow: 3, border: '1px solid', borderColor: 'primary.main', borderRadius: 2 }}>
                <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                  <CloudUploadIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mb: 0.5 }}>Subiendo video</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>Esto puede tardar unos segundos...</Typography>
                <LinearProgress sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.200', '& .MuiLinearProgress-bar': { background: 'linear-gradient(90deg, #5624d0, #7c4dff)' } }} />
              </Card>
            </Box>
          )}
          <form onSubmit={handleUploadSubmit}>
            <DialogTitle>Añadir video al curso</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField label="Título" value={uploadForm.title} onChange={(e) => setUploadForm((f) => ({ ...f, title: e.target.value }))} required fullWidth />
              <TextField label="Descripción" value={uploadForm.description} onChange={(e) => setUploadForm((f) => ({ ...f, description: e.target.value }))} multiline rows={2} fullWidth />
              <TextField label="Duración (segundos)" type="number" value={uploadForm.duration} onChange={(e) => setUploadForm((f) => ({ ...f, duration: e.target.value }))} placeholder="Ej: 300" fullWidth />
              <TextField label="Orden" type="number" value={uploadForm.order} onChange={(e) => setUploadForm((f) => ({ ...f, order: e.target.value }))} fullWidth />
              <TextField select label="Sección" value={uploadForm.sectionId} onChange={(e) => setUploadForm((f) => ({ ...f, sectionId: e.target.value }))} fullWidth SelectProps={{ native: true }}>
                <option value="">Sin sección</option>
                {sections.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </TextField>
              <Button variant="outlined" component="label" fullWidth>
                {uploadFile ? uploadFile.name : 'Seleccionar archivo de video'}
                <input type="file" hidden accept="video/mp4,.mp4" onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
              </Button>
              <Button variant="outlined" component="label" fullWidth color="secondary">
                {uploadSubtitleFile ? uploadSubtitleFile.name : 'Subtítulos (.vtt) — opcional'}
                <input type="file" hidden accept=".vtt,text/vtt" onChange={(e) => setUploadSubtitleFile(e.target.files?.[0] || null)} />
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

export default CourseLearnPage;
