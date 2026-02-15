import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link } from '@mui/material';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        px: 2,
        bgcolor: 'primary.main',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' },
            justifyContent: 'space-between',
            gap: 3,
          }}
        >
          <Box>
            <Typography
              component={RouterLink}
              to="/"
              variant="h6"
              sx={{
                textDecoration: 'none',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '1.25rem',
              }}
            >
              EDTech
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: { xs: 2, md: 4 },
              justifyContent: 'center',
            }}
          >
            <Link
              component={RouterLink}
              to="/"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                '&:hover': { color: 'white', textDecoration: 'underline' },
              }}
            >
              Cursos
            </Link>
            <Link
              component={RouterLink}
              to="/#cursos"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                '&:hover': { color: 'white', textDecoration: 'underline' },
              }}
            >
              Explorar
            </Link>
            <Link
              component={RouterLink}
              to="/cart"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                '&:hover': { color: 'white', textDecoration: 'underline' },
              }}
            >
              Carrito
            </Link>
            <Link
              component={RouterLink}
              to="/register"
              sx={{
                color: 'rgba(255,255,255,0.9)',
                textDecoration: 'none',
                fontSize: '0.95rem',
                '&:hover': { color: 'white', textDecoration: 'underline' },
              }}
            >
              Registrarse
            </Link>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 3,
            pt: 2,
            borderTop: '1px solid rgba(255,255,255,0.2)',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            © {currentYear} EDTech. Plataforma de cursos en línea.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};
