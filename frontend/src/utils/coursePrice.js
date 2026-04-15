/**
 * Formatea el precio de un curso para mostrarlo en la UI.
 * @param {Object} course - Objeto curso con isFree, price, discountPercent, couponCode
 * @returns {{ displayText: string, isFree: boolean, originalPrice?: number, finalPrice?: number }}
 */
export function getCoursePriceDisplay(course) {
  if (!course) {
    return { displayText: '—', isFree: true };
  }

  const isFree = course.isFree !== false;
  const price = Number(course.price ?? 0);
  const discountPercent = Math.min(100, Math.max(0, Number(course.discountPercent ?? 0)));

  if (isFree || price <= 0) {
    return { displayText: 'Gratis', isFree: true };
  }

  const finalPrice = discountPercent > 0
    ? price * (1 - discountPercent / 100)
    : price;

  const formatPrice = (val) =>
    new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);

  if (discountPercent > 0) {
    return {
      displayText: `${formatPrice(finalPrice)} (antes ${formatPrice(price)})`,
      isFree: false,
      originalPrice: price,
      originalFormatted: formatPrice(price),
      finalPrice,
      finalFormatted: formatPrice(finalPrice),
    };
  }

  return {
    displayText: formatPrice(price),
    isFree: false,
    originalPrice: price,
    originalFormatted: null,
    finalPrice: price,
    finalFormatted: formatPrice(price),
  };
}
