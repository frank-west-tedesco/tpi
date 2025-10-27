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

// Middleware para chequear login
function requireLogin(req, res, next) {
  if (!req.session.user) return res.status(401).json({ message: 'No has iniciado sesión' });
  next();
}

// Insertar/actualizar notas
router.post('/', requireLogin, async (req, res) => {
  const { alumno_id, notas } = req.body;

  // Verificar permisos (soporta tanto números como strings para roles)
  const userRole = req.session.user.role;
  const rolesPermitidos = [1, 2, 'admin', 'dep_alumnado'];
  const tienePermiso = (typeof userRole === 'number' && [1, 2, 3].includes(userRole)) ||
                       (typeof userRole === 'string' && ['admin', 'dep_alumnado'].includes(userRole));

  if (!tienePermiso)
    return res.status(403).json({ message: 'No tienes permiso para cargar notas' });
  
  if (!alumno_id || !Array.isArray(notas) || notas.length === 0)
    return res.status(400).json({ message: 'Datos incompletos' });

  try {
    const conn = await mysql.createConnection(dbConfig);
    
    for (const nota of notas) {
      const { materia, primer, segundo, tercero, comentarios } = nota;
      
      // Buscar el ID de la materia por nombre si es necesario
      let materiaId = materia;
      if (isNaN(materia)) {
        const [matRow] = await conn.execute('SELECT ID_materias FROM materias WHERE nombre = ?', [materia]);
        if (!matRow.length) continue; // Si no existe la materia, saltar
        materiaId = matRow[0].ID_materias;
      }
      
      // Insertar o actualizar notas
      await conn.execute(
        `INSERT INTO notas (ID_alumnos, ID_materias, primer_trimestre, segundo_trimestre, tercer_trimestre, comentarios, fecha)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           primer_trimestre = VALUES(primer_trimestre),
           segundo_trimestre = VALUES(segundo_trimestre),
           tercer_trimestre = VALUES(tercer_trimestre),
           comentarios = VALUES(comentarios),
           fecha = VALUES(fecha)`,
        [alumno_id, materiaId, primer || null, segundo || null, tercero || null, comentarios || '', new Date()]
      );
    }
    
    await conn.end();
    res.json({ message: 'Notas registradas/actualizadas correctamente' });
  } catch (err) {
    console.error('Error al registrar notas:', err);
    res.status(500).json({ message: 'Error al registrar notas', error: err.message });
  }
});

// Obtener notas por alumno
router.get('/:id', requireLogin, async (req, res) => {
  const alumnoId = parseInt(req.params.id);
  
  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Traer todas las materias con la última nota por alumno-materia (deduplicado por fecha)
    const [rows] = await conn.execute(
      `SELECT m.nombre AS materia,
              n.primer_trimestre AS primer,
              n.segundo_trimestre AS segundo,
              n.tercer_trimestre AS tercero,
              n.comentarios,
              n.fecha
       FROM materias m
       LEFT JOIN (
         SELECT t.ID_materias,
                t.ID_alumnos,
                t.primer_trimestre,
                t.segundo_trimestre,
                t.tercer_trimestre,
                t.comentarios,
                t.fecha
         FROM notas t
         INNER JOIN (
           SELECT ID_alumnos, ID_materias, MAX(fecha) AS max_fecha
           FROM notas
           GROUP BY ID_alumnos, ID_materias
         ) latest
         ON latest.ID_alumnos = t.ID_alumnos
        AND latest.ID_materias = t.ID_materias
        AND latest.max_fecha = t.fecha
         WHERE t.ID_alumnos = ?
       ) n ON n.ID_materias = m.ID_materias
       ORDER BY m.ID_materias`,
      [alumnoId]
    );
    
    await conn.end();
    
    // Formatear respuesta
    const notasFormateadas = rows.map(row => ({
      materia: row.materia,
      primer: row.primer,
      segundo: row.segundo,
      tercero: row.tercero,
      comentarios: row.comentarios || "",
      fecha: row.fecha
    }));
    
    res.json(notasFormateadas);
  } catch (err) {
    console.error('Error al obtener notas:', err);
    res.status(500).json({ message: 'Error al obtener notas', error: err.message });
  }
});

module.exports = router;