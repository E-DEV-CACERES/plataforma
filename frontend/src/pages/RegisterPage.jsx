import { useState } from 'react';
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
  Card,
  CardActionArea,
  CardContent,
} from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/useSnackbar';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const { register, error } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (password !== confirmPassword) {
      setLocalError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      showSnackbar('Registro exitoso. Ahora inicia sesión');
      navigate('/login');
    }
  };

  const handleSocialRegister = (provider) => {
    // Placeholder: integrar OAuth cuando el backend lo soporte
    console.log(`Registro con ${provider}`);
  };

  const socialProviders = [
    { id: 'google', label: 'Registrarse con Google', icon: <GoogleIcon sx={{ fontSize: 28 }} />, color: '#fff' },
    { id: 'apple', label: 'Registrarse con Apple', icon: <AppleIcon sx={{ fontSize: 28 }} />, color: '#fff' },
    { id: 'github', label: 'Registrarse con GitHub', icon: <GitHubIcon sx={{ fontSize: 28 }} />, color: '#fff' },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'stretch',
        bgcolor: 'background.paper',
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

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                label="Nombre"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="Tu nombre"
                required
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="tu@email.com"
                required
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <TextField
                fullWidth
                label="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="••••••"
                required
                sx={{
                  '& .MuiInputBase-input': { py: 1.5, fontSize: '1rem' },
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.dark' },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main', borderWidth: 2 },
                }}
              />

              <TextField
                fullWidth
                label="Confirmar Contraseña"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="••••••"
                required
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

            <Box sx={{ mt: 3, display: { md: 'none' } }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>O regístrate con</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {socialProviders.map((p) => (
                  <Button
                    key={p.id}
                    variant="outlined"
                    fullWidth
                    startIcon={p.icon}
                    onClick={() => handleSocialRegister(p.id)}
                    sx={{ justifyContent: 'flex-start', py: 1.25 }}
                  >
                    {p.label}
                  </Button>
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body1" color="textSecondary" sx={{ fontSize: '0.95rem' }}>
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

      {/* Sección derecha: tarjetas de autenticación social */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          py: 4,
          px: 4,
          bgcolor: 'primary.main',
        }}
      >
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.9)', mb: 2, fontWeight: 500 }}>
          O regístrate con
        </Typography>
        {socialProviders.map((p) => (
          <Card
            key={p.id}
            sx={{
              width: '100%',
              maxWidth: 320,
              bgcolor: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.35)' },
            }}
          >
            <CardActionArea onClick={() => handleSocialRegister(p.id)} sx={{ py: 1.5, px: 2 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 0, '&:last-child': { pb: 0 } }}>
                <Box sx={{ color: p.color }}>{p.icon}</Box>
                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.95)', fontWeight: 500 }}>
                  {p.label}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};
