import { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAuth } from '../context/useAuth';
import { useSnackbar } from '../context/useSnackbar';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, error, clearError } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    setLocalError('');
  }, [name, email, password, confirmPassword, clearError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const result = await register(name, email, password);
      if (result.success) {
        showSnackbar('¡Cuenta creada! Ya puedes explorar los cursos disponibles.');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = (provider) => {
    // Placeholder: integrar OAuth cuando el backend lo soporte
    console.log(`Registro con ${provider}`);
  };

  const socialProviders = [
    { id: 'google', label: 'Registrarse con Google', icon: <GoogleIcon sx={{ fontSize: 28 }} /> },
    { id: 'apple', label: 'Registrarse con Apple', icon: <AppleIcon sx={{ fontSize: 28 }} /> },
    { id: 'github', label: 'Registrarse con GitHub', icon: <GitHubIcon sx={{ fontSize: 28 }} /> },
  ];

  const registerHeroImage = '/images/login-estudiante-programacion.jpg';
  const registerHeroAlt =
    'Estudiantes con ordenadores portátiles en un entorno de aprendizaje de programación';

  const socialButtonOnImageSx = {
    justifyContent: 'flex-start',
    py: 1.35,
    px: 2,
    width: '100%',
    maxWidth: 340,
    textTransform: 'none',
    color: 'rgba(255,255,255,0.95)',
    border: '1px solid rgba(255,255,255,0.45)',
    bgcolor: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    '&:hover': {
      bgcolor: 'rgba(33, 150, 243, 0.35)',
      borderColor: 'rgba(100, 181, 246, 0.95)',
      boxShadow: '0 0 0 1px rgba(66, 165, 245, 0.45)',
    },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.paper',
        overflowX: 'hidden',
      }}
    >
      {/* Sección izquierda: formulario */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'flex-end' },
          py: 4,
          px: { xs: 4, md: 6 },
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 520, mr: { md: 4 } }}>
          <Paper
            elevation={3}
            sx={{
              p: 5,
              borderRadius: 2,
              textAlign: 'center',
              border: '1px solid',
              borderColor: 'primary.main',
            }}
          >
            <Typography variant="h3" component="h1" sx={{ mb: 4, fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2rem' } }}>
              Registrarse
            </Typography>

            {(error || localError) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error || localError}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="on">
              <TextField
                fullWidth
                name="name"
                label="Nombre"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="Tu nombre"
                required
                autoComplete="name"
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <TextField
                fullWidth
                name="email"
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="tu@email.com"
                required
                autoComplete="email"
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="••••••"
                required
                autoComplete="new-password"
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirmar Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="••••••"
                required
                autoComplete="new-password"
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                color="primary"
                sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrarse'}
              </Button>
            </Box>

            <Box
              aria-label={registerHeroAlt}
              sx={{
                mt: 3,
                display: { md: 'none' },
                position: 'relative',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100vw',
                maxWidth: '100vw',
                borderRadius: 0,
                overflow: 'hidden',
                minHeight: 200,
              }}
            >
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${registerHeroImage})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />
              <Box
                aria-hidden
                sx={{
                  position: 'absolute',
                  inset: 0,
                  background: (theme) =>
                    `linear-gradient(145deg, ${alpha(theme.palette.primary.dark, 0.78)} 0%, ${alpha(theme.palette.primary.main, 0.42)} 100%)`,
                }}
              />
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 1,
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', mb: 0.5 }}>
                  O regístrate con
                </Typography>
                {socialProviders.map((p) => (
                  <Button
                    key={p.id}
                    fullWidth
                    startIcon={<Box sx={{ color: 'inherit', display: 'flex' }}>{p.icon}</Box>}
                    onClick={() => handleSocialRegister(p.id)}
                    sx={socialButtonOnImageSx}
                  >
                    {p.label}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
                ¿Ya tienes cuenta?{' '}
                <Link
                  component={RouterLink}
                  to="/login"
                  sx={{ fontWeight: 'bold', textDecoration: 'none' }}
                >
                  Inicia sesión aquí
                </Link>
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Barra vertical central */}
      <Box
        sx={{
          width: 4,
          minHeight: '100vh',
          bgcolor: 'divider',
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
        }}
      />

      {/* Sección derecha: imagen de fondo a todo el ancho + botones sociales */}
      <Box
        aria-label={registerHeroAlt}
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'stretch',
          justifyContent: 'center',
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          py: 4,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${registerHeroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 0,
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: (theme) =>
              `linear-gradient(155deg, ${alpha(theme.palette.primary.dark, 0.78)} 0%, ${alpha(theme.palette.primary.main, 0.38)} 55%, rgba(0,0,0,0.15) 100%)`,
          },
        }}
      >
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            px: 3,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            boxSizing: 'border-box',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255,255,255,0.95)',
              fontWeight: 500,
              textAlign: 'center',
              textShadow: '0 1px 8px rgba(0,0,0,0.35)',
            }}
          >
            O regístrate con
          </Typography>
          {socialProviders.map((p) => (
            <Button
              key={p.id}
              fullWidth
              startIcon={<Box sx={{ color: 'inherit', display: 'flex' }}>{p.icon}</Box>}
              onClick={() => handleSocialRegister(p.id)}
              sx={socialButtonOnImageSx}
            >
              {p.label}
            </Button>
          ))}
        </Box>
      </Box>
    </Box>
  );
};
