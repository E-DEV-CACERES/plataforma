import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { courseService } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useSnackbar } from '../context/useSnackbar';

const linesToArr = (s) => (typeof s === 'string' ? s.split('\n').map((x) => x.trim()).filter(Boolean) : []);

export const CreateCoursePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [learningObjectives, setLearningObjectives] = useState('');
  const [requirements, setRequirements] = useState('');
  const [whoIsFor, setWhoIsFor] = useState('');
  const [categories, setCategories] = useState('');
  const [language, setLanguage] = useState('Español');
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState('');
  const [discountPercent, setDiscountPercent] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [stripePriceId, setStripePriceId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await courseService.createCourse({
        title,
        description,
        content,
        subtitle: subtitle || null,
        learningObjectives: linesToArr(learningObjectives),
        requirements: linesToArr(requirements),
        whoIsFor: linesToArr(whoIsFor),
        categories: categories ? categories.split(',').map((x) => x.trim()).filter(Boolean) : [],
        language: language || null,
        isFree,
        price: isFree ? 0 : Number(price) || 0,
        discountPercent: isFree ? 0 : Math.min(100, Math.max(0, Number(discountPercent) || 0)),
        couponCode: couponCode?.trim() || null,
        stripePriceId: stripePriceId?.trim() || null,
      });
      showSnackbar('Curso creado correctamente');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el curso';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin' && user?.role !== 'instructor') {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">No tienes permisos para crear cursos</Alert>
      </Container>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#f7f9fa',
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            Crear Nuevo Curso
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Título"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Nombre del curso"
              required
            />

            <TextField
              fullWidth
              label="Descripción"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Breve descripción del curso"
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Subtítulo"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Context API, MERN, Hooks, JWT..."
            />

            <TextField
              fullWidth
              label="Contenido"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Contenido adicional del curso"
              multiline
              rows={5}
            />

            <TextField
              fullWidth
              label="Lo que aprenderán (uno por línea)"
              value={learningObjectives}
              onChange={(e) => setLearningObjectives(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder={'Aprender React a profundidad\nRealizar pruebas unitarias'}
              multiline
              rows={4}
            />

            <TextField
              fullWidth
              label="Requisitos (uno por línea)"
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder={'Conocimiento básico de JavaScript\nConexión a internet'}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Para quién es (uno por línea)"
              value={whoIsFor}
              onChange={(e) => setWhoIsFor(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder={'Personas que quieran aprender desde cero\nEstudiantes en formación'}
              multiline
              rows={3}
            />

            <TextField
              fullWidth
              label="Categorías (separadas por coma)"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Desarrollo, Web Development"
            />

            <TextField
              fullWidth
              label="Idioma"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Español"
            />

            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Configuración de precio
            </Typography>
            <RadioGroup
              row
              value={isFree ? 'free' : 'paid'}
              onChange={(e) => setIsFree(e.target.value === 'free')}
              sx={{ mb: 2 }}
            >
              <FormControlLabel value="free" control={<Radio />} label="Gratis" />
              <FormControlLabel value="paid" control={<Radio />} label="De pago" />
            </RadioGroup>
            {!isFree && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                <TextField
                  label="Precio (€)"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  variant="outlined"
                  placeholder="29.99"
                  inputProps={{ min: 0, step: 0.01 }}
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Descuento (%)"
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  variant="outlined"
                  placeholder="20"
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Código de cupón"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  variant="outlined"
                  placeholder="VERANO20"
                  sx={{ maxWidth: 200 }}
                />
                <TextField
                  label="Stripe Price ID"
                  value={stripePriceId}
                  onChange={(e) => setStripePriceId(e.target.value)}
                  variant="outlined"
                  placeholder="price_xxx"
                  helperText="Crea un producto en Stripe Dashboard y pega el Price ID aquí"
                  fullWidth
                />
              </Box>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={
                  loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <SchoolIcon />
                  )
                }
              >
                {loading ? 'Creando...' : 'Crear Curso'}
              </Button>
              <Button variant="outlined" onClick={() => navigate('/')}>
                Cancelar
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
