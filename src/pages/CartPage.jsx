import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Grid,
  Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import SchoolIcon from '@mui/icons-material/School';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSnackbar } from '../context/useSnackbar';
import { courseService } from '../services/api';

const COURSE_IMAGES = [
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
  'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&q=80',
  'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&q=80',
  'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
];

const getCourseImage = (courseId) =>
  COURSE_IMAGES[Number(courseId) % COURSE_IMAGES.length];

export const CartPage = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [enrollingId, setEnrollingId] = useState(null);

  const handleRemove = (courseId) => {
    removeFromCart(courseId);
    showSnackbar('Curso eliminado del carrito');
  };

  const handleEnroll = async (courseId) => {
    if (!user) {
      showSnackbar('Inicia sesión para inscribirte', 'warning');
      navigate('/login');
      return;
    }
    setEnrollingId(courseId);
    try {
      await courseService.enrollCourse(courseId);
      removeFromCart(courseId);
      showSnackbar('Inscripción exitosa');
    } catch {
      showSnackbar('Error al inscribirse', 'error');
    } finally {
      setEnrollingId(null);
    }
  };

  const handleEnrollAll = async () => {
    if (!user) {
      showSnackbar('Inicia sesión para inscribirte', 'warning');
      navigate('/login');
      return;
    }
    if (cartItems.length === 0) return;
    for (const item of cartItems) {
      try {
        await courseService.enrollCourse(item.id);
        showSnackbar(`Inscrito en: ${item.title}`);
      } catch {
        showSnackbar(`Error al inscribirse en ${item.title}`, 'error');
      }
    }
    clearCart();
    showSnackbar('Cursos inscritos correctamente');
    navigate('/my-courses');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShoppingCartIcon fontSize="large" />
          Carrito de cursos
        </Typography>

        {!user && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Inicia sesión para poder inscribirte en los cursos del carrito.
          </Alert>
        )}

        {cartItems.length === 0 ? (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <SchoolIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              Tu carrito está vacío
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Agrega cursos desde la página principal para inscribirte.
            </Typography>
            <Button variant="contained" component={RouterLink} to="/">
              Explorar cursos
            </Button>
          </Card>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button
                variant="outlined"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={() => { clearCart(); showSnackbar('Carrito vaciado'); }}
              >
                Vaciar carrito
              </Button>
            </Box>
            <Grid container spacing={3}>
              {cartItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'none',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'translateY(-4px)' },
                    }}
                  >
                    <Box
                      sx={{
                        height: 140,
                        width: '100%',
                        backgroundImage: `url(${getCourseImage(item.id)})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <CardContent sx={{ flexGrow: 1, py: 1.5 }}>
                      <Typography gutterBottom variant="h6" component="h2" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.description || 'Sin descripción'}
                      </Typography>
                      {item.createdByName && (
                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                          Por {item.createdByName}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 1, px: 2, pb: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        component={RouterLink}
                        to={`/course/${item.id}`}
                        size="small"
                      >
                        Ver curso
                      </Button>
                      {user && (
                        <Button
                          fullWidth
                          variant="outlined"
                          size="small"
                          onClick={() => handleEnroll(item.id)}
                          disabled={enrollingId === item.id}
                        >
                          {enrollingId === item.id ? 'Inscribiendo...' : 'Inscribirse'}
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemove(item.id)}
                        aria-label="Eliminar del carrito"
                        sx={{ alignSelf: 'center' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
            {user && cartItems.length > 0 && (
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleEnrollAll}
                  startIcon={<SchoolIcon />}
                >
                  Inscribirse en todos ({cartItems.length})
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  );
};
