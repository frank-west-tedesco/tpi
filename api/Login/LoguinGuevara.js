const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// DB
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cpeg',
  port: 3307
};

// Login
router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Todos los campos son obligatorios' });

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT ID_usuario, usuario, ID_rol AS role, dni, email FROM usuario WHERE usuario = ? AND contraseña = ?',
      [username, password]
    );
    await conn.end();

    if (rows.length > 0) {
      req.session.user = rows[0];
      res.json({ user: rows[0] });
    } else {
      res.status(401).json({ message: 'Credenciales incorrectas' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
});

module.exports = router;
