const express = require('express');
const auth = require('../middleware/auth');
const { generateSignature } = require('../utils/cloudinary');

const router = express.Router();

router.post('/sign', auth, (req, res) => {
  const { folder, resourceType } = req.body;
  if (!folder) {
    return res.status(400).json({ message: 'folder es requerido' });
  }
  const data = generateSignature(folder, resourceType || 'auto');
  res.json(data);
});

module.exports = router;
