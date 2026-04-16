import {
  Box,
  Typography,
  List,
  ListItemButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  CircularProgress,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { LAYOUT } from './constants';
import { resolveMediaUrl } from '../../services/api';

function formatVideoDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ChaptersAccordion({
  groups,
  hasContent,
  selectedVideo,
  progress,
  isAdminOrCourseOwner,
  onVideoSelect,
  onDeleteVideo,
  onDeleteSection,
  onDeleteFile,
  expandedAccordion,
  onAccordionChange,
  deletingId,
  deletingFileId,
  deletingSectionId,
}) {
  if (!hasContent && groups.length === 0) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="textSecondary" variant="body2">
          Sin contenido disponible
        </Typography>
      </Box>
    );
  }

  return groups.map(({ section, videos: groupVideos, files: groupFiles }) => {
    const accordionKey = section?.id ?? 'general';
    const sectionTitle = section ? section.title : 'Contenido general';
    const itemCount = groupVideos.length + groupFiles.length;

    return (
      <Accordion
        key={accordionKey}
        expanded={expandedAccordion === accordionKey}
        onChange={() => onAccordionChange(accordionKey)}
        sx={{
          boxShadow: 'none',
          '&:before': { display: 'none' },
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&:last-of-type': { borderBottom: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{ bgcolor: 'grey.200', minHeight: LAYOUT.ACCORDION_MIN_HEIGHT, '& .MuiAccordionSummary-content': { my: 1 } }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {sectionTitle}
              {itemCount > 0 && (
                <Typography component="span" variant="caption" color="textSecondary" sx={{ ml: 1, fontWeight: 400 }}>
                  ({itemCount})
                </Typography>
              )}
            </Typography>
            {isAdminOrCourseOwner && section && (
              <IconButton
                size="small"
                color="error"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSection(section.id, e);
                }}
                disabled={deletingSectionId === section.id}
              >
                {deletingSectionId === section.id ? <CircularProgress size={16} /> : <DeleteIcon sx={{ fontSize: 16 }} />}
              </IconButton>
            )}
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List disablePadding>
            {groupVideos.map((video) => {
              const isWatched = progress?.videosWatched?.some((v) => v.id === video.id);
              const isSelected = selectedVideo?.id === video.id;
              return (
                <ListItemButton
                  key={video.id}
                  onClick={() => onVideoSelect(video)}
                  selected={isSelected}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 0,
                    py: 1.5,
                    px: 2,
                    pl: 3,
                    bgcolor: isSelected ? 'primary.light' : 'transparent',
                    '&:hover': { bgcolor: isSelected ? 'primary.light' : 'action.hover' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                    <PlayArrowIcon
                      sx={{ fontSize: 20, color: isSelected ? 'primary.main' : 'text.secondary', flexShrink: 0 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: isSelected ? 600 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {video.title}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatVideoDuration(video.duration || 0)}
                        {isWatched && ' • ✓'}
                      </Typography>
                    </Box>
                    {isWatched && !isSelected && (
                      <CheckCircleIcon sx={{ fontSize: 18, color: 'success.main', flexShrink: 0 }} />
                    )}
                    {isAdminOrCourseOwner && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => onDeleteVideo(video.id, e)}
                        disabled={deletingId === video.id}
                        sx={{ flexShrink: 0 }}
                      >
                        {deletingId === video.id ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                </ListItemButton>
              );
            })}
            {groupFiles.map((file) => (
              <ListItemButton
                key={file.id}
                component="a"
                href={resolveMediaUrl(file.fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                download
                sx={{
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 0,
                  py: 1.5,
                  px: 2,
                  pl: 3,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, minWidth: 0 }}>
                  <DownloadIcon sx={{ fontSize: 20, color: 'text.secondary', flexShrink: 0 }} />
                  <Typography
                    variant="body2"
                    sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}
                  >
                    {file.title}
                  </Typography>
                  {isAdminOrCourseOwner && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDeleteFile(file.id, e);
                      }}
                      disabled={deletingFileId === file.id}
                      sx={{ flexShrink: 0 }}
                    >
                      {deletingFileId === file.id ? (
                        <CircularProgress size={18} />
                      ) : (
                        <DeleteIcon fontSize="small" />
                      )}
                    </IconButton>
                  )}
                </Box>
              </ListItemButton>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>
    );
  });
}
