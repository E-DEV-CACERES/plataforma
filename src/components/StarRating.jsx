import { Rating } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

/**
 * Muestra la calificación con estrellas (solo lectura).
 * @param {number} value - Valor entre 0 y 5
 * @param {number} size - Tamaño de las estrellas
 */
export function StarRatingDisplay({ value = 0, size = 'small', ...props }) {
  return (
    <Rating
      value={Number(value) || 0}
      precision={0.1}
      readOnly
      size={size}
      emptyIcon={<StarIcon fontSize="inherit" />}
      {...props}
    />
  );
}
