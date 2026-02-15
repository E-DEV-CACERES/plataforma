const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const userRepository = require('../repositories/user.repository');

async function register(data) {
  const { name, email, password } = data;
  const exists = await userRepository.emailExists(email);
  if (exists) {
    throw Object.assign(new Error('El correo ya está registrado.'), { statusCode: 400 });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await userRepository.create({ name, email, password: hashedPassword, role: 'user' });
  return { message: 'Usuario registrado correctamente.' };
}

async function login(data) {
  const { email, password } = data;
  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw Object.assign(new Error('Usuario no encontrado.'), { statusCode: 400 });
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw Object.assign(new Error('Contraseña incorrecta.'), { statusCode: 400 });
  }
  const token = jwt.sign(
    { id: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '1d' }
  );
  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

module.exports = {
  register,
  login,
};
