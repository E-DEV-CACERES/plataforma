const PDFDocument = require('pdfkit');
const courseRepository = require('../repositories/course.repository');
const userRepository = require('../repositories/user.repository');
const progressService = require('./progress.service');
const { AppError } = require('../utils/errors');

/**
 * Genera un PDF de diploma y lo escribe en el stream.
 * Requiere: usuario inscrito y curso completado (100%).
 */
async function generateDiploma(courseId, userId, outputStream) {
  const [course, user, progress] = await Promise.all([
    courseRepository.findById(courseId),
    userRepository.findById(userId),
    progressService.getProgress(courseId, userId),
  ]);

  if (!course) throw new AppError('Curso no encontrado.', 404);
  if (!user) throw new AppError('Usuario no encontrado.', 404);

  const isEnrolled = await courseRepository.isEnrolled(courseId, userId);
  if (!isEnrolled) throw new AppError('Debes estar inscrito en el curso para obtener el diploma.', 403);

  if (progress.progressPercentage < 100) {
    throw new AppError('Debes completar todos los videos del curso para obtener el diploma.', 403);
  }

  const instructor = course.createdBy
    ? await userRepository.findById(course.createdBy)
    : null;

  const doc = new PDFDocument({
    size: 'A4',
    layout: 'landscape',
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
  });

  doc.pipe(outputStream);

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  const centerX = pageWidth / 2;

  doc.rect(20, 20, pageWidth - 40, pageHeight - 40).stroke();
  doc.rect(25, 25, pageWidth - 50, pageHeight - 50).stroke();

  doc.fontSize(12).fillColor('#666').text('DIPLOMA DE FINALIZACIÓN', 0, 80, {
    align: 'center',
    width: pageWidth,
  });

  doc.fontSize(32).fillColor('#1a237e').text('CERTIFICADO', 0, 110, {
    align: 'center',
    width: pageWidth,
  });

  doc.fontSize(14).fillColor('#333').text(
    'Se certifica que',
    0,
    170,
    { align: 'center', width: pageWidth }
  );

  doc.fontSize(24).fillColor('#0d47a1').text(user.name, 0, 195, {
    align: 'center',
    width: pageWidth,
  });

  doc.fontSize(14).fillColor('#333').text(
    'ha completado satisfactoriamente el curso',
    0,
    235,
    { align: 'center', width: pageWidth }
  );

  doc.fontSize(20).fillColor('#1565c0').text(`"${course.title}"`, 0, 265, {
    align: 'center',
    width: pageWidth,
  });

  const completedDate = progress.completedAt
    ? new Date(progress.completedAt).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  doc.fontSize(12).fillColor('#555').text(
    `Fecha de finalización: ${completedDate}`,
    0,
    310,
    { align: 'center', width: pageWidth }
  );

  if (instructor) {
    doc.fontSize(11).fillColor('#666').text(
      `Impartido por: ${instructor.name}`,
      0,
      340,
      { align: 'center', width: pageWidth }
    );
  }

  doc.fontSize(10).fillColor('#999').text(
    'Plataforma de Cursos',
    centerX - 80,
    pageHeight - 80,
    { width: 160, align: 'center' }
  );

  doc.end();
}

module.exports = { generateDiploma };
