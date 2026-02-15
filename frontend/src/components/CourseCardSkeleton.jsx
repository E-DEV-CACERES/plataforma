import { Card, CardContent, CardActions, Box, Skeleton, Container, Grid } from '@mui/material';

/**
 * Skeleton loader que replica la estructura de una CourseCard.
 * Mejora la UX mostrando el layout esperado mientras carga.
 * @param {object} props
 * @param {string|number} [props.width] - Ancho de la tarjeta (ej: 280, '100%')
 * @param {string|number} [props.height] - Alto de la tarjeta (ej: 400, '100%')
 */
export function CourseCardSkeleton({ width, height = '100%' }) {
  return (
    <Card
      sx={{
        width: width ?? '100%',
        height,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'none',
        border: 'none',
        outline: 'none',
      }}
    >
      <Skeleton
        variant="rectangular"
        height={200}
        animation="wave"
        sx={{ bgcolor: 'grey.200' }}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="90%" height={32} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={20} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mt: 0.5 }} />
        <Skeleton variant="text" width="30%" height={14} sx={{ mt: 1 }} />
        <Skeleton variant="text" width="40%" height={16} sx={{ mt: 2 }} />
      </CardContent>
      <CardActions sx={{ px: 2, pb: 2 }}>
        <Skeleton variant="rounded" width="100%" height={36} />
      </CardActions>
    </Card>
  );
}

/**
 * Grid de skeletons para listas de cursos.
 * Mantiene el mismo layout que el contenido real para evitar layout shift.
 * @param {number} count - Número de skeletons a mostrar (default: 6)
 * @param {boolean} noHeader - Si true, solo muestra el grid (ej. cuando hay Hero arriba)
 */
export function CourseGridSkeleton({ count = 6, noHeader = false }) {
  const grid = (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, index) => (
        <Grid item xs={12} sm={6} md={4} key={index}>
          <CourseCardSkeleton />
        </Grid>
      ))}
    </Grid>
  );

  if (noHeader) {
    return grid;
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 6 }}>
          <Skeleton variant="text" width={320} height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={280} height={28} />
        </Box>
        {grid}
      </Container>
    </Box>
  );
}

/**
 * Skeleton para la página de detalle de un curso (CoursePage).
 * Replica el layout: título, descripción, video player, lista de videos.
 */
export function CourseDetailSkeleton() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f7f9fa', py: 4 }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width="70%" height={48} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="100%" height={24} />
          <Skeleton variant="text" width="80%" height={24} sx={{ mt: 0.5 }} />
          <Skeleton variant="rounded" width={180} height={40} sx={{ mt: 2 }} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton
              variant="rectangular"
              height={400}
              animation="wave"
              sx={{ borderRadius: 1, bgcolor: 'grey.300' }}
            />
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ p: 2 }}>
              <Skeleton variant="text" width="80%" height={28} sx={{ mb: 2 }} />
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} variant="rounded" height={48} sx={{ mb: 1 }} />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
