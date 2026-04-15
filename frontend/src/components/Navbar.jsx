import { useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  Box,
  Chip,
  InputBase,
  Paper,
  Badge,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useAuth } from '../context/useAuth';
import { useCart } from '../context/useCart';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [anchorEl, setAnchorEl] = useState(null);
  const queryFromUrl = searchParams.get('q') || '';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/login');
  };

  const handleMenuNavigate = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const query = formData.get('search')?.trim() || '';
    if (query) {
      navigate(`/?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '1.5rem',
          }}
        >
          EDTech
        </Typography>

        {/* Buscador - visible en desktop */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, mx: 2, flex: 1, maxWidth: 400 }}>
          <Paper
            key={queryFromUrl}
            component="form"
            name="search-form"
            onSubmit={handleSearch}
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: 'rgba(255,255,255,0.2)',
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.25)' },
            }}
          >
            <InputBase
              name="search"
              placeholder="Buscar cursos..."
              defaultValue={queryFromUrl}
              sx={{
                color: 'white',
                ml: 1,
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.8)',
                  opacity: 1,
                },
              }}
              inputProps={{ 'aria-label': 'Buscar cursos' }}
            />
            <IconButton type="submit" color="inherit" size="small" aria-label="Buscar">
              <SearchIcon />
            </IconButton>
          </Paper>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            Cursos
          </Button>
          <IconButton
            color="inherit"
            component={RouterLink}
            to="/cart"
            aria-label="Carrito"
            sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
          >
            <Badge badgeContent={cartCount} color="secondary">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user && (
            <Button
              color="inherit"
              component={RouterLink}
              to="/my-courses"
              startIcon={<VideoLibraryIcon />}
              sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
            >
              Mis Cursos
            </Button>
          )}

          {(user?.role === 'admin' || user?.role === 'instructor') && (
            <>
              {user?.role === 'admin' && (
                <Button
                  color="inherit"
                  component={RouterLink}
                  to="/admin"
                  startIcon={<AdminPanelSettingsIcon />}
                  sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
                >
                  Panel Admin
                </Button>
              )}
              <Button
                color="inherit"
                component={RouterLink}
                to="/instructor-panel"
                startIcon={<SchoolIcon />}
                sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                Mi Perfil
              </Button>
              <Button
                color="inherit"
                component={RouterLink}
                to="/create-course"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.35)' },
                }}
              >
                Crear Curso
              </Button>
            </>
          )}

          {user ? (
            <>
              <Chip
                icon={<PersonIcon sx={{ color: 'white !important' }} />}
                label={user.role === 'admin' ? 'Admin' : user.role === 'instructor' ? 'Instructor' : user.name}
                size="small"
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '& .MuiChip-icon': { color: 'white' },
                }}
                variant="outlined"
              />
              <Button
                color="inherit"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' },
                }}
              >
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                color="inherit"
                component={RouterLink}
                to="/login"
                sx={{ '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' } }}
              >
                Iniciar sesión
              </Button>
              <Button
                variant="contained"
                component={RouterLink}
                to="/register"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', color: 'primary.main' },
                }}
              >
                Registrarse
              </Button>
            </>
          )}
        </Box>

        {/* Menú móvil */}
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleMenuOpen} size="large">
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem onClick={() => handleMenuNavigate('/')}>
              Cursos
            </MenuItem>
            <MenuItem onClick={() => handleMenuNavigate('/cart')}>
              <Badge badgeContent={cartCount} color="secondary" sx={{ mr: 1 }}>
                <ShoppingCartIcon />
              </Badge>
              Carrito {cartCount > 0 && `(${cartCount})`}
            </MenuItem>
            {user && (
              <MenuItem onClick={() => handleMenuNavigate('/my-courses')}>
                <VideoLibraryIcon sx={{ mr: 1 }} />
                Mis Cursos
              </MenuItem>
            )}
            {(user?.role === 'admin' || user?.role === 'instructor') && (
              [
                user?.role === 'admin' && (
                  <MenuItem key="admin" onClick={() => handleMenuNavigate('/admin')}>
                    <AdminPanelSettingsIcon sx={{ mr: 1 }} />
                    Panel Admin
                  </MenuItem>
                ),
                <MenuItem key="instructor" onClick={() => handleMenuNavigate('/instructor-panel')}>
                  <SchoolIcon sx={{ mr: 1 }} />
                  Mi Perfil
                </MenuItem>,
                <MenuItem key="create" onClick={() => handleMenuNavigate('/create-course')}>
                  <AddIcon sx={{ mr: 1 }} />
                  Crear Curso
                </MenuItem>,
              ].filter(Boolean)
            )}
            {user ? (
              <MenuItem onClick={handleLogout}>
                <LogoutIcon sx={{ mr: 1 }} />
                Cerrar sesión
              </MenuItem>
            ) : (
              [
                <MenuItem key="login" component={RouterLink} to="/login" onClick={handleMenuClose}>
                  Iniciar sesión
                </MenuItem>,
                <MenuItem key="register" component={RouterLink} to="/register" onClick={handleMenuClose}>
                  Registrarse
                </MenuItem>,
              ]
            )}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
