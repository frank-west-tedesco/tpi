// Endpoint para obtener alumnos de un curso específico
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Configura tu conexión según tu db.php
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'cpeg',
  port: 3307
};

// GET /api/alumnos?curso=7-3
router.get('/', async (req, res) => {
  const curso = req.query.curso;
  if (!curso) return res.status(400).json({ message: 'Falta el parámetro curso' });

  try {
    const conn = await mysql.createConnection(dbConfig);
    // Busca el ID del curso
    const [cursos] = await conn.execute('SELECT ID_curso FROM cursos WHERE nombre = ?', [curso]);
    if (!cursos.length) {
      await conn.end();
      return res.status(404).json({ message: 'Curso no encontrado' });
    }
    const idCurso = cursos[0].ID_curso;
    // Busca los alumnos de ese curso
    const [alumnos] = await conn.execute('SELECT ID_alumnos as id, nombre, apellido FROM alumnos WHERE ID_curso = ?', [idCurso]);
    await conn.end();
    res.json(alumnos);
  } catch (err) {
    console.error('Error en /api/alumnos:', err);
    res.status(500).json({ message: 'Error al obtener alumnos' });
  }
});

// GET /api/alumnos/me -> devuelve el ID_alumnos del usuario logueado (por dni)
router.get('/me', async (req, res) => {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'No has iniciado sesión' });
    }
    const dni = req.session.user.dni;
    if (!dni) {
      return res.status(400).json({ message: 'No hay DNI en la sesión' });
    }
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT ID_alumnos AS id FROM alumnos WHERE dni = ?', [dni]);
    await conn.end();

    if (!rows.length) {
      return res.status(404).json({ message: 'Alumno no encontrado para el DNI de sesión' });
    }

    return res.json({ id: rows[0].id });
  } catch (err) {
    console.error('Error en /api/alumnos/me:', err);
    return res.status(500).json({ message: 'Error al obtener alumno actual' });
  }
});

module.exports = router;
