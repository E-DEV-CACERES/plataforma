import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { AuthProvider } from './context/AuthProvider';
import { CartProvider } from './context/CartProvider';
import { SnackbarProvider } from './context/SnackbarProvider';
import { theme } from './theme';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Lazy load pages for code-splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const CoursePage = lazy(() => import('./pages/CoursePage'));
const CourseLearnPage = lazy(() => import('./pages/CourseLearnPage'));
const CreateCoursePage = lazy(() => import('./pages/CreateCoursePage'));
const MyCoursesPage = lazy(() => import('./pages/MyCoursesPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const InstructorProfilePage = lazy(() => import('./pages/InstructorProfilePage'));
const InstructorPanelPage = lazy(() => import('./pages/InstructorPanelPage'));

// Loading fallback
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
    <CircularProgress />
  </Box>
);

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
                    <Route 
                      path="/cart" 
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <CartPage />
                          </Suspense>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/instructor/:id" 
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <InstructorProfilePage />
                          </Suspense>
                        </ProtectedRoute>
                      } 
                    />
                    <Route 
                      path="/" 
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <HomePage />
                          </Suspense>
                        </ProtectedRoute>
                      } 
                    />
                    <Route
                      path="/my-courses"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <MyCoursesPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/course/:id"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <CoursePage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/course/:id/learn"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <CourseLearnPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/create-course"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <CreateCoursePage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <AdminPanelPage />
                          </Suspense>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/instructor-panel"
                      element={
                        <ProtectedRoute>
                          <Suspense fallback={<LoadingFallback />}>
                            <InstructorPanelPage />
                          </Suspense>
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
