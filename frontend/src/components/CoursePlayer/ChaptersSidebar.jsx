import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Rating,
  Chip,
  CircularProgress,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CardMembershipIcon from '@mui/icons-material/CardMembership';
import StarIcon from '@mui/icons-material/Star';
import { ChaptersAccordion } from './ChaptersAccordion';
import { LAYOUT } from './constants';

export function ChaptersSidebar({
  course,
  baseUrl,
  videos,
  courseFiles,
  groups,
  hasContent,
  selectedVideo,
  progress,
  isEnrolled,
  isAdminOrCourseOwner,
  onEnroll,
  onVideoSelect,
  onDownloadDiploma,
  onRateCourse,
  onSectionOpen,
  onFileOpen,
  onUploadOpen,
  onDeleteVideo,
  onDeleteSection,
  onDeleteFile,
  downloadingDiploma,
  ratingCourse,
  deletingId,
  deletingFileId,
  deletingSectionId,
  expandedAccordion,
  onAccordionChange,
}) {
  return (
    <>
      {!isEnrolled && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Button variant="contained" color="primary" fullWidth size="large" onClick={onEnroll}>
            Inscribirse al Curso
          </Button>
        </Box>
      )}
      {isEnrolled && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          {progress && videos.length > 0 && (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Tu progreso
                </Typography>
                <Chip label={`${progress.progressPercentage}%`} size="small" color="primary" />
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, progress.progressPercentage ?? 0)}
                sx={{ height: 6, borderRadius: 3, mb: 1 }}
              />
              {progress.completedAt && (
                <Button
                  size="small"
                  variant="contained"
                  color="success"
                  fullWidth
                  startIcon={
                    downloadingDiploma ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <CardMembershipIcon />
                    )
                  }
                  onClick={onDownloadDiploma}
                  disabled={downloadingDiploma}
                  sx={{ mt: 1 }}
                >
                  {downloadingDiploma ? 'Descargando...' : 'Descargar diploma'}
                </Button>
              )}
            </>
          )}
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mb: 0.5 }}>
              Califica este curso
            </Typography>
            <Rating
              value={course?.userRating ?? 0}
              onChange={(_, newValue) => onRateCourse(newValue)}
              disabled={ratingCourse}
              size="small"
              emptyIcon={<StarIcon fontSize="inherit" />}
            />
          </Box>
        </Box>
      )}
      <Box
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          Contenido ({videos.length} videos, {courseFiles.length} archivos)
        </Typography>
        {isAdminOrCourseOwner && (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button size="small" variant="outlined" startIcon={<FolderIcon />} onClick={onSectionOpen}>
              Sección
            </Button>
            <Button size="small" variant="outlined" startIcon={<InsertDriveFileIcon />} onClick={onFileOpen}>
              Archivo
            </Button>
            <Button size="small" variant="contained" startIcon={<AddCircleIcon />} onClick={onUploadOpen}>
              Video
            </Button>
          </Box>
        )}
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', maxHeight: { xs: LAYOUT.SIDEBAR_MAX_HEIGHT_MOBILE, md: 'none' } }}>
        <ChaptersAccordion
          groups={groups}
          hasContent={hasContent}
          baseUrl={baseUrl}
          selectedVideo={selectedVideo}
          progress={progress}
          isAdminOrCourseOwner={isAdminOrCourseOwner}
          onVideoSelect={onVideoSelect}
          onDeleteVideo={onDeleteVideo}
          onDeleteSection={onDeleteSection}
          onDeleteFile={onDeleteFile}
          expandedAccordion={expandedAccordion}
          onAccordionChange={onAccordionChange}
          deletingId={deletingId}
          deletingFileId={deletingFileId}
          deletingSectionId={deletingSectionId}
        />
      </Box>
    </>
  );
}
