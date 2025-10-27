// Endpoint para obtener todos los cursos
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cpeg',
  port: 3307 // igual que en register/CCGuevara.js
};

// GET /api/cursos
router.get('/', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [cursos] = await conn.execute('SELECT ID_curso as id, nombre FROM cursos');
    await conn.end();
    res.json(cursos);
  } catch (err) {
    console.error('Error en /api/cursos:', err);
    res.status(500).json({ message: 'Error al obtener cursos' });
  }
});

module.exports = router;
