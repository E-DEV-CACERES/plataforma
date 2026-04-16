import { useEffect, useState, useRef } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import SaveIcon from '@mui/icons-material/Save';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import LanguageIcon from '@mui/icons-material/Language';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import ShareIcon from '@mui/icons-material/Share';
import YouTubeIcon from '@mui/icons-material/YouTube';
import { instructorService, resolveMediaUrl, uploadToCloudinary } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useSnackbar } from '../context/useSnackbar';

export const InstructorPanelPage = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [error, setError] = useState(null);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [form, setForm] = useState({
    instructorTagline: '',
    instructorBio: '',
    instructorWebsite: '',
    instructorLinkedin: '',
    instructorTwitter: '',
    instructorYoutube: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await instructorService.getMyProfile();
      const data = res?.data;
      setProfile(data);
      setForm({
        instructorTagline: data?.instructorTagline || '',
        instructorBio: data?.instructorBio || '',
        instructorWebsite: data?.instructorWebsite || '',
        instructorLinkedin: data?.instructorLinkedin || '',
        instructorTwitter: data?.instructorTwitter || '',
        instructorYoutube: data?.instructorYoutube || '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar el perfil');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await instructorService.updateMyProfile(form);
      showSnackbar('Perfil actualizado correctamente');
      fetchProfile();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleProfileImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      showSnackbar('Selecciona una imagen (JPG, PNG, WebP o GIF)', 'warning');
      return;
    }
    try {
      setUploadingProfile(true);
      const result = await uploadToCloudinary(file, 'plataforma/instructors/profile', 'image');
      await instructorService.setProfileImageUrl(result.secure_url);
      showSnackbar('Imagen de perfil actualizada');
      fetchProfile();
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || 'Error al subir imagen', 'error');
    } finally {
      setUploadingProfile(false);
      e.target.value = '';
    }
  };

  const handleCoverImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      showSnackbar('Selecciona una imagen (JPG, PNG, WebP o GIF)', 'warning');
      return;
    }
    try {
      setUploadingCover(true);
      const result = await uploadToCloudinary(file, 'plataforma/instructors/cover', 'image');
      await instructorService.setCoverImageUrl(result.secure_url);
      showSnackbar('Imagen de portada actualizada');
      fetchProfile();
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.message || 'Error al subir imagen', 'error');
    } finally {
      setUploadingCover(false);
      e.target.value = '';
    }
  };

  if (user && user.role !== 'admin' && user.role !== 'instructor') {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <PersonIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Panel de Instructor
            </Typography>
            <Typography color="textSecondary">
              Configura la información que se mostrará en tu perfil público
            </Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Imágenes del perfil
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Box
                  component={profile?.instructorProfileImage ? 'img' : 'div'}
                  src={profile?.instructorProfileImage ? resolveMediaUrl(profile.instructorProfileImage) : undefined}
                  alt="Perfil"
                  onClick={() => profileInputRef.current?.click()}
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    bgcolor: 'grey.200',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: '3px dashed',
                    borderColor: 'grey.400',
                    '&:hover': { borderColor: 'primary.main', opacity: 0.9 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!profile?.instructorProfileImage && (
                    <ImageIcon sx={{ fontSize: 40, color: 'grey.500' }} />
                  )}
                </Box>
                <input
                  ref={profileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={handleProfileImageChange}
                  disabled={uploadingProfile}
                />
                <Button
                  size="small"
                  startIcon={uploadingProfile ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                  onClick={() => profileInputRef.current?.click()}
                  disabled={uploadingProfile}
                >
                  {uploadingProfile ? 'Subiendo...' : 'Foto de perfil'}
                </Button>
              </Box>
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box
                  component={profile?.instructorCoverImage ? 'img' : 'div'}
                  src={profile?.instructorCoverImage ? resolveMediaUrl(profile.instructorCoverImage) : undefined}
                  alt="Portada"
                  onClick={() => coverInputRef.current?.click()}
                  sx={{
                    width: '100%',
                    maxWidth: 400,
                    height: 120,
                    borderRadius: 1,
                    bgcolor: 'grey.200',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: '3px dashed',
                    borderColor: 'grey.400',
                    '&:hover': { borderColor: 'primary.main', opacity: 0.9 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {!profile?.instructorCoverImage && (
                    <ImageIcon sx={{ fontSize: 48, color: 'grey.500' }} />
                  )}
                </Box>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  hidden
                  onChange={handleCoverImageChange}
                  disabled={uploadingCover}
                />
                <Button
                  size="small"
                  startIcon={uploadingCover ? <CircularProgress size={16} color="inherit" /> : <CloudUploadIcon />}
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploadingCover}
                >
                  {uploadingCover ? 'Subiendo...' : 'Imagen de portada'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Información del perfil
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Frase o eslogan"
                value={form.instructorTagline}
                onChange={(e) => setForm((f) => ({ ...f, instructorTagline: e.target.value }))}
                fullWidth
                placeholder="Ej: Elaboración de contenido de valor para desarrolladores"
                helperText="Aparece debajo de tu nombre en el perfil"
              />
              <TextField
                label="Biografía"
                value={form.instructorBio}
                onChange={(e) => setForm((f) => ({ ...f, instructorBio: e.target.value }))}
                fullWidth
                multiline
                rows={5}
                placeholder="Cuéntanos sobre ti, tu experiencia y qué te apasiona enseñar..."
                helperText="Descripción detallada que verán los estudiantes"
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Enlaces y redes sociales
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Sitio web"
                value={form.instructorWebsite}
                onChange={(e) => setForm((f) => ({ ...f, instructorWebsite: e.target.value }))}
                fullWidth
                placeholder="https://tusitio.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LanguageIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="LinkedIn"
                value={form.instructorLinkedin}
                onChange={(e) => setForm((f) => ({ ...f, instructorLinkedin: e.target.value }))}
                fullWidth
                placeholder="https://linkedin.com/in/tu-perfil"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkedInIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="X (Twitter)"
                value={form.instructorTwitter}
                onChange={(e) => setForm((f) => ({ ...f, instructorTwitter: e.target.value }))}
                fullWidth
                placeholder="https://x.com/tu-usuario"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ShareIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="YouTube"
                value={form.instructorYoutube}
                onChange={(e) => setForm((f) => ({ ...f, instructorYoutube: e.target.value }))}
                fullWidth
                placeholder="https://youtube.com/@tu-canal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <YouTubeIcon color="action" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {(profile?.courses?.length ?? 0) > 0 && (
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Mis cursos ({profile.courses.length})
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {profile.courses.map((c) => (
                  <Button
                    key={c.id}
                    component={RouterLink}
                    to={`/course/${c.id}`}
                    variant="outlined"
                    size="small"
                    sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                  >
                    {c.title}
                  </Button>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
          {profile?.id && (profile?.coursesCount ?? 0) > 0 && (
            <Button
              component={RouterLink}
              to={`/instructor/${profile.id}`}
              variant="outlined"
            >
              Ver mi perfil público
            </Button>
          )}
          <Button
            component={RouterLink}
            to="/create-course"
            variant="outlined"
          >
            Crear nuevo curso
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default InstructorPanelPage;
