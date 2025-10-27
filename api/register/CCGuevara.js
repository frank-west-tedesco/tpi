const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Configuración DB
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cpeg',
  port: 3307
};

// Middleware para chequear admin
function soloAdmins(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 1) {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado, solo admins' });
  }
}

// Registro de usuario (solo admin)
router.post('/', soloAdmins, async (req, res) => {
  const { usuario, dni, contraseña, email, ID_rol, ID_curso, nombre, apellido, fecha_nacimiento } = req.body;

  // Validación básica
  if (!usuario || !dni || !contraseña || !email || !ID_rol) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }
  // Validación específica por rol
  if ((ID_rol === 1 || ID_rol === 'admin' || ID_rol === 3 || ID_rol === 'dep_alumnado') && (!nombre || !apellido)) {
    return res.status(400).json({ message: 'Nombre y apellido son obligatorios para admin y dep_alumnado' });
  }
  if (ID_rol === 2 || ID_rol === 'alumno') {
    if (!ID_curso) {
      return res.status(400).json({ message: 'Falta seleccionar curso para alumno' });
    }
  }

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // Chequear duplicados por dni/usuario/email
    const [dup] = await conn.execute(
      'SELECT ID_usuario FROM usuario WHERE dni = ? OR usuario = ? OR email = ? LIMIT 1',
      [dni, usuario, email]
    );
    if (dup.length > 0) {
      await conn.end();
      return res.status(409).json({ message: 'Usuario/DNI/Email ya registrado' });
    }

    // 1️⃣ Primero insertamos en usuario
    const queryUsuario = `
      INSERT INTO usuario (usuario, dni, contraseña, email, ID_rol)
      VALUES (?, ?, ?, ?, ?)
    `;
    await conn.execute(queryUsuario, [usuario, dni, contraseña, email, ID_rol]);

    // 2️⃣ Luego insertamos en tabla secundaria según rol
    if (ID_rol === 2 || ID_rol === 'alumno') {
      await conn.execute(
        `INSERT INTO alumnos (dni, ID_curso, nombre, apellido, fecha_nacimiento, email)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [dni, ID_curso, nombre || null, apellido || null, fecha_nacimiento || null, email || null]
      );
    }
    if (ID_rol === 3 || ID_rol === 'dep_alumnado') {
      await conn.execute(
        'INSERT INTO dep_alumnado (dni, nombre, apellido, email) VALUES (?, ?, ?, ?)',
        [dni, nombre || null, apellido || null, email || null]
      );
    }
    if (ID_rol === 1 || ID_rol === 'admin') {
      await conn.execute(
        'INSERT INTO admin (dni, nombre, apellido, email) VALUES (?, ?, ?, ?)',
        [dni, nombre || null, apellido || null, email || null]
      );
    }

    await conn.end();
    res.json({ message: 'Usuario creado correctamente' });

  } catch (err) {
    if (conn) await conn.end();
    console.error('Error DB:', err);

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Duplicado: DNI/Usuario/Email ya existe' });
    }
    if (err.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({ message: 'Primero crea el usuario antes de asignarlo a la tabla específica.' });
    }

    res.status(500).json({ message: 'Error al registrar', error: err.message });
  }
});

module.exports = router;
