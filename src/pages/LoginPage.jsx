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

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    }
  };

  const handleSocialLogin = (provider) => {
    // Placeholder: integrar OAuth cuando el backend lo soporte
    console.log(`Login con ${provider}`);
  };

  const socialProviders = [
    { id: 'google', label: 'Continuar con Google', icon: <GoogleIcon sx={{ fontSize: 28 }} />, color: '#fff' },
    { id: 'apple', label: 'Continuar con Apple', icon: <AppleIcon sx={{ fontSize: 28 }} />, color: '#fff' },
    { id: 'github', label: 'Continuar con GitHub', icon: <GitHubIcon sx={{ fontSize: 28 }} />, color: '#fff' },
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
            Iniciar Sesión
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate>
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 4, mb: 2, py: 1.5, fontSize: '1rem' }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>

          <Box sx={{ mt: 3, display: { md: 'none' } }}>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 1.5 }}>O continúa con</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {socialProviders.map((p) => (
                <Button
                  key={p.id}
                  variant="outlined"
                  fullWidth
                  startIcon={p.icon}
                  onClick={() => handleSocialLogin(p.id)}
                  sx={{ justifyContent: 'flex-start', py: 1.25 }}
                >
                  {p.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" color="textSecondary" sx={{ fontSize: '0.95rem' }}>
              ¿No tienes cuenta?{' '}
              <Link
                component={RouterLink}
                to="/register"
                sx={{ fontWeight: 'bold', textDecoration: 'none' }}
              >
                Regístrate aquí
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
          O inicia sesión con
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
            <CardActionArea onClick={() => handleSocialLogin(p.id)} sx={{ py: 1.5, px: 2 }}>
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
