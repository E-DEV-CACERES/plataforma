import { useEffect, useState, useMemo, useCallback } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  RadioGroup,
  Divider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BarChartIcon from '@mui/icons-material/BarChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { adminService, courseService } from '../services/api';
import { useAuth } from '../context/useAuth';
import { useSnackbar } from '../context/useSnackbar';

const CHART_COLORS = ['#1976d2', '#2e7d32', '#ed6c02', '#9c27b0', '#0288d1', '#c62828', '#5e35b1', '#00695c'];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export const AdminPanelPage = () => {
  const { user } = useAuth();
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState({ open: false, user: null });
  const [editForm, setEditForm] = useState({ password: '', role: 'user' });
  const [editSaving, setEditSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseEditDialog, setCourseEditDialog] = useState({ open: false, course: null });
  const [courseEditForm, setCourseEditForm] = useState({
    title: '',
    description: '',
    content: '',
    subtitle: '',
    instructorTagline: '',
    instructorBio: '',
    learningObjectives: '',
    requirements: '',
    whoIsFor: '',
    categories: '',
    language: 'Español',
    isFree: true,
    price: '',
    discountPercent: '',
    couponCode: '',
    stripePriceId: '',
  });
  const [courseEditSaving, setCourseEditSaving] = useState(false);
  const [courseDeleteDialog, setCourseDeleteDialog] = useState({ open: false, course: null });
  const [courseDeleteLoading, setCourseDeleteLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await courseService.getCourses();
      setCourses(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      showSnackbar?.(err.response?.data?.message || 'Error al cargar cursos', 'error');
    } finally {
      setCoursesLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 1) fetchCourses();
  }, [activeTab, fetchCourses]);

  const handleEditOpen = (u) => {
    setEditDialog({ open: true, user: u });
    setEditForm({ password: '', role: u.role });
  };

  const handleEditClose = () => {
    setEditDialog({ open: false, user: null });
    setEditForm({ password: '', role: 'user' });
  };

  const handleEditSave = async () => {
    const { user: u } = editDialog;
    if (!u) return;
    const hasPassword = editForm.password.trim().length >= 6;
    const roleChanged = editForm.role !== u.role;
    if (!hasPassword && !roleChanged) {
      showSnackbar('Cambia la contraseña o el rol para guardar', 'warning');
      return;
    }
    try {
      setEditSaving(true);
      if (hasPassword) {
        await adminService.updateUserPassword(u.id, editForm.password);
      }
      if (editForm.role !== u.role) {
        await adminService.updateUserRole(u.id, editForm.role);
      }
      showSnackbar('Usuario actualizado correctamente');
      handleEditClose();
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al actualizar', 'error');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDeleteOpen = (u) => setDeleteDialog({ open: true, user: u });
  const handleDeleteClose = () => setDeleteDialog({ open: false, user: null });

  const handleDeleteConfirm = async () => {
    const { user: u } = deleteDialog;
    if (!u) return;
    try {
      setDeleteLoading(true);
      await adminService.deleteUser(u.id);
      showSnackbar('Usuario eliminado correctamente');
      handleDeleteClose();
      fetchData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsersWithEnrollments();
      setUsers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar datos');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const arrToLines = (arr) => (Array.isArray(arr) ? arr.join('\n') : '');
  const linesToArr = (s) => (typeof s === 'string' ? s.split('\n').map((x) => x.trim()).filter(Boolean) : []);

  const handleCourseEditOpen = async (course) => {
    try {
      const res = await courseService.getCourseById(course?.id);
      const c = res?.data;
      if (!c) return;
      setCourseEditForm({
        title: c.title || '',
        description: c.description || '',
        content: c.content || '',
        subtitle: c.subtitle || '',
        instructorTagline: c.instructorTagline || '',
        instructorBio: c.instructorBio || '',
        learningObjectives: arrToLines(c.learningObjectives),
        requirements: arrToLines(c.requirements),
        whoIsFor: arrToLines(c.whoIsFor),
        categories: Array.isArray(c.categories) ? c.categories.join(', ') : '',
        language: c.language || 'Español',
        isFree: c.isFree !== false,
        price: c.price != null ? String(c.price) : '',
        discountPercent: c.discountPercent != null ? String(c.discountPercent) : '',
        couponCode: c.couponCode || '',
        stripePriceId: c.stripePriceId || c.stripe_price_id || '',
      });
      setCourseEditDialog({ open: true, course: c });
    } catch (err) {
      showSnackbar?.(err.response?.data?.message || 'Error al cargar curso', 'error');
    }
  };

  const handleCourseEditClose = () => {
    setCourseEditDialog({ open: false, course: null });
  };

  const handleCourseEditSave = async () => {
    const { course } = courseEditDialog;
    if (!course || !courseEditForm.title?.trim()) {
      showSnackbar('El título es obligatorio', 'warning');
      return;
    }
    try {
      setCourseEditSaving(true);
      await courseService.updateCourse(course.id, {
        title: courseEditForm.title.trim(),
        description: courseEditForm.description || null,
        content: courseEditForm.content || null,
        subtitle: courseEditForm.subtitle || null,
        instructorTagline: courseEditForm.instructorTagline || null,
        instructorBio: courseEditForm.instructorBio || null,
        learningObjectives: linesToArr(courseEditForm.learningObjectives),
        requirements: linesToArr(courseEditForm.requirements),
        whoIsFor: linesToArr(courseEditForm.whoIsFor),
        categories: courseEditForm.categories ? courseEditForm.categories.split(',').map((x) => x.trim()).filter(Boolean) : [],
        language: courseEditForm.language || null,
        isFree: courseEditForm.isFree !== false,
        price: courseEditForm.isFree ? 0 : Number(courseEditForm.price) || 0,
        discountPercent: courseEditForm.isFree ? 0 : Math.min(100, Math.max(0, Number(courseEditForm.discountPercent) || 0)),
        couponCode: courseEditForm.couponCode?.trim() || null,
        stripePriceId: courseEditForm.stripePriceId?.trim() || null,
      });
      showSnackbar('Curso actualizado correctamente');
      handleCourseEditClose();
      fetchCourses();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al actualizar', 'error');
    } finally {
      setCourseEditSaving(false);
    }
  };

  const handleCourseDeleteOpen = (course) => setCourseDeleteDialog({ open: true, course });
  const handleCourseDeleteClose = () => setCourseDeleteDialog({ open: false, course: null });

  const handleCourseDeleteConfirm = async () => {
    const { course } = courseDeleteDialog;
    if (!course) return;
    try {
      setCourseDeleteLoading(true);
      await courseService.deleteCourse(course.id);
      showSnackbar('Curso eliminado correctamente');
      handleCourseDeleteClose();
      fetchCourses();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Error al eliminar', 'error');
    } finally {
      setCourseDeleteLoading(false);
    }
  };

  const usersList = useMemo(() => (Array.isArray(users) ? users : []), [users]);
  const students = usersList.filter((u) => u?.role === 'user');
  const totalEnrollments = usersList.reduce((acc, u) => acc + (u?.enrolledCount || 0), 0);

  const chartData = useMemo(() => {
    const enrollmentsByMonth = {};
    const enrollmentsByCourse = {};

    usersList.forEach((u) => {
      (u?.enrolledCourses || []).forEach((e) => {
        const date = new Date(e.enrolledAt);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        enrollmentsByMonth[key] = (enrollmentsByMonth[key] || 0) + 1;

        const courseKey = e.courseId;
        if (!enrollmentsByCourse[courseKey]) {
          enrollmentsByCourse[courseKey] = { name: e.courseTitle, count: 0 };
        }
        enrollmentsByCourse[courseKey].count += 1;
      });
    });

    const months = Object.entries(enrollmentsByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, count]) => {
        const [y, m] = key.split('-');
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return { name: `${monthNames[parseInt(m, 10) - 1]} ${y}`, inscripciones: count };
      });

    const chartCourses = Object.values(enrollmentsByCourse)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
      .map((c) => ({ ...c, name: (c.name || '').length > 25 ? (c.name || '').slice(0, 25) + '…' : (c.name || '') }));

    return { months, courses: chartCourses };
  }, [usersList]);

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <AdminPanelSettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Panel de Administración
            </Typography>
            <Typography color="textSecondary">Usuarios registrados y cursos inscritos</Typography>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<PersonIcon />} iconPosition="start" label="Usuarios" />
          <Tab icon={<VideoLibraryIcon />} iconPosition="start" label="Gestión de cursos" />
        </Tabs>

        {activeTab === 0 && loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : activeTab === 0 ? (
          <>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
              <Card sx={{ minWidth: 160, flex: 1 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Total usuarios
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {usersList.length}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: 160, flex: 1 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Alumnos
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {students.length}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ minWidth: 160, flex: 1 }}>
                <CardContent>
                  <Typography color="textSecondary" variant="body2">
                    Inscripciones totales
                  </Typography>
                  <Typography variant="h4" fontWeight="bold" color="primary.main">
                    {totalEnrollments}
                  </Typography>
                </CardContent>
              </Card>
            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid size={{ xs: 12, md: 7 }}>
                <Card sx={{ height: 340 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <TrendingUpIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Inscripciones por mes
                      </Typography>
                    </Box>
                    <ResponsiveContainer width="100%" height={260}>
                      {chartData.months.length > 0 ? (
                        <BarChart data={chartData.months} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip
                            formatter={(value) => [value, 'Inscripciones']}
                            contentStyle={{ borderRadius: 2 }}
                          />
                          <Bar dataKey="inscripciones" fill="#1976d2" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <Typography variant="body2">Sin datos de inscripciones aún</Typography>
                        </Box>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, md: 5 }}>
                <Card sx={{ height: 340 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BarChartIcon color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Cursos más populares
                      </Typography>
                    </Box>
                    <ResponsiveContainer width="100%" height={260}>
                      {chartData.courses.length > 0 ? (
                        <PieChart>
                          <Pie
                            data={chartData.courses}
                            dataKey="count"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ count }) => count}
                          >
                            {chartData.courses.map((_, i) => (
                              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Inscripciones']} />
                          <Legend />
                        </PieChart>
                      ) : (
                        <Box
                          sx={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                          }}
                        >
                          <Typography variant="body2">Sin inscripciones aún</Typography>
                        </Box>
                      )}
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Lista de usuarios
            </Typography>
            <TableContainer component={Paper} sx={{ mb: 4 }}>
              <Table size="small" sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Usuario</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Rol</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Registro</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Cursos inscritos</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(usersList || []).map((u) => {
                    const isCurrentUser = user?.id === u.id;
                    return (
                      <TableRow key={u.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PersonIcon fontSize="small" color="action" />
                            {u.name}
                          </Box>
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.role === 'admin' ? 'Admin' : u.role === 'instructor' ? 'Instructor' : 'Alumno'}
                            size="small"
                            color={u.role === 'admin' ? 'secondary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{formatDate(u.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            label={u.enrolledCount}
                            size="small"
                            color="primary"
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditOpen(u)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? 'No puedes editar tu propio usuario' : 'Editar contraseña y rol'}
                            aria-label="Editar usuario"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteOpen(u)}
                            disabled={isCurrentUser}
                            title={isCurrentUser ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                            aria-label="Eliminar usuario"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Detalle por alumno
            </Typography>
            {(students || []).map((student) => (
              <Accordion
                key={student.id}
                sx={{
                  mb: 1,
                  boxShadow: 1,
                  '&:before': { display: 'none' },
                  borderRadius: 1,
                }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    <PersonIcon color="action" />
                    <Box>
                      <Typography fontWeight={600}>{student.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {student.email} · {student.enrolledCount} curso(s) inscrito(s)
                      </Typography>
                    </Box>
                    <Chip
                      label={student.enrolledCount}
                      size="small"
                      color="primary"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {student.enrolledCourses.length === 0 ? (
                    <Typography color="textSecondary" variant="body2">
                      Aún no se ha inscrito en ningún curso
                    </Typography>
                  ) : (
                    <List dense disablePadding>
                      {student.enrolledCourses.map((enrollment) => (
                        <ListItem
                          key={`${student.id}-${enrollment.courseId}`}
                          component={RouterLink}
                          to={`/course/${enrollment.courseId}`}
                          sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                            borderRadius: 1,
                            '&:hover': { bgcolor: 'action.hover' },
                          }}
                        >
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <SchoolIcon fontSize="small" color="primary" />
                          </ListItemIcon>
                          <ListItemText
                            primary={enrollment.courseTitle}
                            secondary={`Inscrito: ${formatDate(enrollment.enrolledAt)}`}
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </AccordionDetails>
              </Accordion>
            ))}

            {/* Dialog editar usuario (contraseña y rol) */}
            <Dialog open={editDialog.open} onClose={handleEditClose} maxWidth="sm" fullWidth>
              <DialogTitle>Editar usuario</DialogTitle>
              <DialogContent sx={{ pt: 1 }}>
                {editDialog.user && (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      {editDialog.user.name} · {editDialog.user.email}
                    </Typography>
                    <TextField
                      label="Nueva contraseña"
                      type="password"
                      value={editForm.password}
                      onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Dejar vacío para no cambiar"
                      fullWidth
                      autoComplete="new-password"
                      helperText="Mínimo 6 caracteres. Dejar vacío si solo cambias el rol."
                    />
                    <FormControl fullWidth>
                      <InputLabel>Rol</InputLabel>
                      <Select
                        value={editForm.role}
                        label="Rol"
                        onChange={(e) => setEditForm((f) => ({ ...f, role: e.target.value }))}
                      >
                        <MenuItem value="user">Alumno</MenuItem>
                        <MenuItem value="admin">Admin</MenuItem>
                        <MenuItem value="instructor">Instructor</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleEditClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleEditSave} disabled={editSaving}>
                  {editSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog confirmar eliminar */}
            <Dialog open={deleteDialog.open} onClose={handleDeleteClose}>
              <DialogTitle>Eliminar usuario</DialogTitle>
              <DialogContent>
                {deleteDialog.user && (
                  <Typography>
                    ¿Eliminar a <strong>{deleteDialog.user.name}</strong> ({deleteDialog.user.email})? Esta acción no se puede deshacer.
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleDeleteClose}>Cancelar</Button>
                <Button variant="contained" color="error" onClick={handleDeleteConfirm} disabled={deleteLoading}>
                  {deleteLoading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h6" fontWeight={600}>
                Lista de cursos
              </Typography>
              <Button
                variant="contained"
                component={RouterLink}
                to="/create-course"
                startIcon={<AddCircleIcon />}
              >
                Crear curso
              </Button>
            </Box>

            {coursesLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 4 }}>
                <Table size="small" sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.100' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Curso</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Estudiantes</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Creado</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="right">Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                          <Typography color="textSecondary">No hay cursos. Crea uno nuevo.</Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (courses || []).map((course) => (
                        <TableRow key={course.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <SchoolIcon fontSize="small" color="action" />
                              {course.title}
                            </Box>
                          </TableCell>
                          <TableCell>{course.studentsCount ?? 0}</TableCell>
                          <TableCell>{formatDate(course.createdAt)}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              component={RouterLink}
                              to={`/course/${course.id}`}
                              title="Ver contenido (videos, secciones)"
                              aria-label="Ver curso"
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleCourseEditOpen(course)}
                              title="Editar título, descripción, instructor"
                              aria-label="Editar curso"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCourseDeleteOpen(course)}
                              title="Eliminar curso"
                              aria-label="Eliminar curso"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Dialog editar curso */}
            <Dialog open={courseEditDialog.open} onClose={handleCourseEditClose} maxWidth="sm" fullWidth>
              <DialogTitle>Editar curso</DialogTitle>
              <DialogContent sx={{ pt: 1 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                  <TextField
                    label="Título"
                    value={courseEditForm.title}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, title: e.target.value }))}
                    fullWidth
                    required
                  />
                  <TextField
                    label="Descripción"
                    value={courseEditForm.description}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, description: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Subtítulo"
                    value={courseEditForm.subtitle}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, subtitle: e.target.value }))}
                    fullWidth
                    placeholder="Ej: Context API, MERN, Hooks, JWT..."
                  />
                  <TextField
                    label="Contenido"
                    value={courseEditForm.content}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, content: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Frase del instructor"
                    value={courseEditForm.instructorTagline}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, instructorTagline: e.target.value }))}
                    fullWidth
                    placeholder="Ej: Elaboración de contenido de valor"
                  />
                  <TextField
                    label="Biografía del instructor"
                    value={courseEditForm.instructorBio}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, instructorBio: e.target.value }))}
                    fullWidth
                    multiline
                    rows={4}
                  />
                  <TextField
                    label="Lo que aprenderán (uno por línea)"
                    value={courseEditForm.learningObjectives}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, learningObjectives: e.target.value }))}
                    fullWidth
                    multiline
                    rows={4}
                    placeholder={'Aprender React a profundidad\nRealizar pruebas unitarias\nMERN - Mongo Express React Node'}
                  />
                  <TextField
                    label="Requisitos (uno por línea)"
                    value={courseEditForm.requirements}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, requirements: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={'Conocimiento básico de JavaScript\nPoder realizar instalaciones como administrador'}
                  />
                  <TextField
                    label="Para quién es (uno por línea)"
                    value={courseEditForm.whoIsFor}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, whoIsFor: e.target.value }))}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder={'Personas que quieran dominar React\nDesarrolladores que migren a Hooks'}
                  />
                  <TextField
                    label="Categorías (separadas por coma)"
                    value={courseEditForm.categories}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, categories: e.target.value }))}
                    fullWidth
                    placeholder="Desarrollo, Web Development, React"
                  />
                  <TextField
                    label="Idioma"
                    value={courseEditForm.language}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, language: e.target.value }))}
                    fullWidth
                    placeholder="Español"
                  />
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>Precio</Typography>
                  <RadioGroup
                    row
                    value={courseEditForm.isFree !== false ? 'free' : 'paid'}
                    onChange={(e) => setCourseEditForm((f) => ({ ...f, isFree: e.target.value === 'free' }))}
                    sx={{ mb: 1 }}
                  >
                    <FormControlLabel value="free" control={<Radio />} label="Gratis" />
                    <FormControlLabel value="paid" control={<Radio />} label="De pago" />
                  </RadioGroup>
                  {courseEditForm.isFree === false && (
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 1 }}>
                      <TextField
                        label="Precio (€)"
                        type="number"
                        value={courseEditForm.price}
                        onChange={(e) => setCourseEditForm((f) => ({ ...f, price: e.target.value }))}
                        size="small"
                        inputProps={{ min: 0, step: 0.01 }}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        label="Descuento (%)"
                        type="number"
                        value={courseEditForm.discountPercent}
                        onChange={(e) => setCourseEditForm((f) => ({ ...f, discountPercent: e.target.value }))}
                        size="small"
                        inputProps={{ min: 0, max: 100 }}
                        sx={{ width: 120 }}
                      />
                      <TextField
                        label="Cupón"
                        value={courseEditForm.couponCode}
                        onChange={(e) => setCourseEditForm((f) => ({ ...f, couponCode: e.target.value }))}
                        size="small"
                        placeholder="VERANO20"
                        sx={{ width: 140 }}
                      />
                      <TextField
                        label="Stripe Price ID"
                        value={courseEditForm.stripePriceId}
                        onChange={(e) => setCourseEditForm((f) => ({ ...f, stripePriceId: e.target.value }))}
                        size="small"
                        placeholder="price_xxx"
                        fullWidth
                        helperText="ID del precio en Stripe (Dashboard > Productos > Precio). Ej: price_1ABC..."
                        sx={{ mt: 1 }}
                      />
                    </Box>
                  )}
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCourseEditClose}>Cancelar</Button>
                <Button variant="contained" onClick={handleCourseEditSave} disabled={courseEditSaving}>
                  {courseEditSaving ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogActions>
            </Dialog>

            {/* Dialog eliminar curso */}
            <Dialog open={courseDeleteDialog.open} onClose={handleCourseDeleteClose}>
              <DialogTitle>Eliminar curso</DialogTitle>
              <DialogContent>
                {courseDeleteDialog.course && (
                  <Typography>
                    ¿Eliminar el curso <strong>{courseDeleteDialog.course.title}</strong>? Se eliminarán todos los videos, secciones y archivos. Esta acción no se puede deshacer.
                  </Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCourseDeleteClose}>Cancelar</Button>
                <Button variant="contained" color="error" onClick={handleCourseDeleteConfirm} disabled={courseDeleteLoading}>
                  {courseDeleteLoading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
      </Container>
    </Box>
  );
};

export default AdminPanelPage;
