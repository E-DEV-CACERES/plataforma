import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { Box, Card } from '@mui/material';
import { MEDIA_BASE_URL } from '../../services/api';
import { VideoPlayerArea } from './VideoPlayerArea';
import { ChaptersSidebar } from './ChaptersSidebar';
import { LAYOUT } from './constants';

const VIDEO_ERROR_MESSAGES = {
  4: 'Formato no compatible. Elimina este video y súbelo de nuevo en MP4 (H.264). Usa VLC o HandBrake para convertir.',
  2: 'No se pudo cargar el video. Verifica la conexión.',
  3: 'No se pudo cargar el video. Verifica la conexión.',
};

function buildContentGroups(sections, videos, courseFiles, isAdminOrCourseOwner) {
  const nullSectionVideos = videos.filter((v) => !v.sectionId);
  const nullSectionFiles = courseFiles.filter((f) => !f.sectionId);
  const groups = [];

  if (nullSectionVideos.length > 0 || nullSectionFiles.length > 0) {
    groups.push({ section: null, videos: nullSectionVideos, files: nullSectionFiles });
  }

  const sortedSections = [...sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  sortedSections.forEach((sec) => {
    const secVideos = videos.filter((v) => v.sectionId === sec.id);
    const secFiles = courseFiles.filter((f) => f.sectionId === sec.id);
    if (secVideos.length > 0 || secFiles.length > 0 || isAdminOrCourseOwner) {
      groups.push({ section: sec, videos: secVideos, files: secFiles });
    }
  });

  return groups;
}

function getInitialExpandedAccordion(groups) {
  if (groups.length === 0) return null;
  const first = groups[0];
  return first.section?.id ?? 'general';
}

export function CoursePlayer({
  playerRef,
  course,
  videos,
  sections,
  courseFiles,
  selectedVideo,
  onVideoSelect,
  progress,
  isEnrolled,
  isAdminOrCourseOwner,
  canViewVideos,
  onEnroll,
  onMarkWatched,
  onDownloadDiploma,
  onRateCourse,
  onSectionOpen,
  onFileOpen,
  onUploadOpen,
  onDeleteVideo,
  onDeleteSection,
  onDeleteFile,
  showSnackbar,
  downloadingDiploma,
  ratingCourse,
  deletingId,
  deletingFileId,
  deletingSectionId,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const hasInitializedAccordion = useRef(false);

  const groups = useMemo(
    () => buildContentGroups(sections, videos, courseFiles, isAdminOrCourseOwner),
    [sections, videos, courseFiles, isAdminOrCourseOwner]
  );

  const hasContent = videos.length > 0 || courseFiles.length > 0;

  useEffect(() => {
    if (hasInitializedAccordion.current) return;
    const initial = getInitialExpandedAccordion(groups);
    if (initial !== null) {
      const id = setTimeout(() => {
        setExpandedAccordion(initial);
        hasInitializedAccordion.current = true;
      }, 0);
      return () => clearTimeout(id);
    }
  }, [groups]);

  const handleVideoError = useCallback(
    (e) => {
      const code = e.target?.error?.code;
      if (code === 1) return;
      const message = VIDEO_ERROR_MESSAGES[code] ?? 'Error al cargar el video. Verifica que el archivo exista.';
      showSnackbar?.(message, 'error');
    },
    [showSnackbar]
  );

  const handleAccordionChange = useCallback((accordionKey) => {
    setExpandedAccordion((prev) => (prev === accordionKey ? null : accordionKey));
  }, []);

  const baseUrl = MEDIA_BASE_URL;

  return (
    <Box ref={playerRef}>
      <Card
        className="course-player"
        sx={{
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          minHeight: LAYOUT.CARD_MIN_HEIGHT,
        }}
      >
        <Box
          className="course-player__video-area"
          sx={{
            flex: { xs: 1, md: `0 0 ${LAYOUT.VIDEO_AREA_WIDTH}` },
            minWidth: 0,
            maxWidth: { md: LAYOUT.VIDEO_AREA_WIDTH },
            order: { xs: 1, md: 1 },
          }}
        >
          <VideoPlayerArea
            baseUrl={baseUrl}
            selectedVideo={selectedVideo}
            canViewVideos={canViewVideos}
            isEnrolled={isEnrolled}
            onEnroll={onEnroll}
            onMarkWatched={onMarkWatched}
            onVideoError={handleVideoError}
            course={course}
            progress={progress}
            activeTab={activeTab}
            onTabChange={(_, v) => setActiveTab(v)}
          />
        </Box>

        <Box
          className="course-player__chapters-menu"
          sx={{
            flex: { xs: 1, md: `0 0 ${LAYOUT.SIDEBAR_WIDTH}` },
            width: { xs: '100%', md: LAYOUT.SIDEBAR_WIDTH },
            maxWidth: '100%',
            borderLeft: { md: '1px solid' },
            borderColor: { md: 'divider' },
            bgcolor: 'grey.50',
            display: 'flex',
            flexDirection: 'column',
            order: { xs: 2, md: 2 },
          }}
        >
          <ChaptersSidebar
            course={course}
            baseUrl={baseUrl}
            videos={videos}
            courseFiles={courseFiles}
            groups={groups}
            hasContent={hasContent}
            selectedVideo={selectedVideo}
            progress={progress}
            isEnrolled={isEnrolled}
            isAdminOrCourseOwner={isAdminOrCourseOwner}
            onEnroll={onEnroll}
            onVideoSelect={onVideoSelect}
            onDownloadDiploma={onDownloadDiploma}
            onRateCourse={onRateCourse}
            onSectionOpen={onSectionOpen}
            onFileOpen={onFileOpen}
            onUploadOpen={onUploadOpen}
            onDeleteVideo={onDeleteVideo}
            onDeleteSection={onDeleteSection}
            onDeleteFile={onDeleteFile}
            downloadingDiploma={downloadingDiploma}
            ratingCourse={ratingCourse}
            deletingId={deletingId}
            deletingFileId={deletingFileId}
            deletingSectionId={deletingSectionId}
            expandedAccordion={expandedAccordion}
            onAccordionChange={handleAccordionChange}
          />
        </Box>
      </Card>
    </Box>
  );
}
