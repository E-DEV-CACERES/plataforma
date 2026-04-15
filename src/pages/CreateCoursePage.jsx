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
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import { courseService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/useSnackbar';

export const CreateCoursePage = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
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
      await courseService.createCourse({ title, description, content });
      showSnackbar('Curso creado correctamente');
      navigate('/');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al crear el curso';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
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
              label="Contenido"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              margin="normal"
              variant="outlined"
              placeholder="Contenido adicional del curso"
              multiline
              rows={5}
            />

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
