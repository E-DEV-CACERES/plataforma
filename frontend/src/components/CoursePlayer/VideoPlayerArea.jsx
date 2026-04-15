import { Box, Typography, Button } from '@mui/material';
import { CourseDescriptionTabs } from '../CourseDescriptionTabs';
import { LAYOUT } from './constants';

export function VideoPlayerArea({
  baseUrl,
  selectedVideo,
  canViewVideos,
  isEnrolled,
  onEnroll,
  onMarkWatched,
  onVideoError,
  course,
  progress,
  activeTab,
  onTabChange,
}) {
  if (selectedVideo) {
    return (
      <>
        {canViewVideos ? (
          <Box
            component="video"
            src={`${baseUrl}${selectedVideo.videoUrl}`}
            controls
            preload="metadata"
            onEnded={() => isEnrolled && onMarkWatched(selectedVideo.id)}
            onError={onVideoError}
            sx={{
              width: '100%',
              height: 'auto',
              minHeight: LAYOUT.VIDEO_MIN_HEIGHT,
              bgcolor: '#000',
              display: 'block',
            }}
          >
            {selectedVideo.subtitleUrl && (
              <track
                kind="subtitles"
                src={`${baseUrl}${selectedVideo.subtitleUrl}`}
                srcLang="es"
                label="Español"
                default
              />
            )}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: LAYOUT.VIDEO_MIN_HEIGHT,
              bgcolor: 'grey.900',
              color: 'white',
              gap: 2,
              p: 3,
            }}
          >
            <Box component="span" sx={{ fontSize: 64, opacity: 0.6, lineHeight: 1 }}>
              🔒
            </Box>
            <Typography variant="h6" textAlign="center">
              Inscríbete para ver los videos
            </Typography>
            <Typography variant="body2" color="grey.400" textAlign="center">
              Debes inscribirte en este curso para acceder al contenido de video.
            </Typography>
            <Button variant="contained" color="primary" size="large" onClick={onEnroll} sx={{ mt: 1 }}>
              Inscribirse al curso
            </Button>
          </Box>
        )}
        <CourseDescriptionTabs
          course={course}
          selectedVideo={selectedVideo}
          progress={progress}
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </>
    );
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: LAYOUT.VIDEO_MIN_HEIGHT,
          bgcolor: 'grey.100',
        }}
      >
        <Typography color="textSecondary">Selecciona un video para comenzar</Typography>
      </Box>
      <CourseDescriptionTabs
        course={course}
        selectedVideo={null}
        progress={progress}
        activeTab={activeTab}
        onTabChange={onTabChange}
      />
    </>
  );
}
