import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SnackbarProvider } from './context/SnackbarProvider';
import { theme } from './theme';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { HomePage } from './pages/HomePage';
import { CoursePage } from './pages/CoursePage';
import { CreateCoursePage } from './pages/CreateCoursePage';
import { MyCoursesPage } from './pages/MyCoursesPage';
import { CartPage } from './pages/CartPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <SnackbarProvider>
              <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                <Navbar />
                <Box component="main" sx={{ flexGrow: 1 }}>
                  <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/" element={<HomePage />} />
                    <Route
                      path="/my-courses"
                      element={
                        <ProtectedRoute>
                          <MyCoursesPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/course/:id"
                      element={
                        <ProtectedRoute>
                          <CoursePage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-course"
                      element={
                        <ProtectedRoute>
                          <CreateCoursePage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </Box>
                <Footer />
              </Box>
            </SnackbarProvider>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
