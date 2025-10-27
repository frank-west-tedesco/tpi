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

// Middleware admin-only
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.role === 1) {
    return next();
  }
  return res.status(403).json({ message: 'Acceso denegado, solo admins' });
}

// Verificar si existe usuario dep_alumnado
router.get('/check-dep', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT usuario, dni, email FROM usuario WHERE ID_rol = 3 LIMIT 1'
    );
    await conn.end();

    if (rows.length > 0) {
      res.json({ exists: true, ...rows[0] });
    } else {
      res.json({ exists: false });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
});

// Crear usuario dep_alumnado
router.post('/crear-dep', async (req, res) => {
  const { usuario, contraseña, email, dni } = req.body;
  
  if (!usuario || !contraseña || !email || !dni) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    const conn = await mysql.createConnection(dbConfig);
    
    // Verificar si ya existe un usuario con ese DNI o usuario
    const [existing] = await conn.execute(
      'SELECT ID_usuario FROM usuario WHERE dni = ? OR usuario = ?',
      [dni, usuario]
    );
    
    if (existing.length > 0) {
      await conn.end();
      return res.status(400).json({ message: 'Ya existe un usuario con ese DNI o nombre de usuario' });
    }
    
    // Crear el usuario
    const [result] = await conn.execute(
      'INSERT INTO usuario (usuario, contraseña, ID_rol, email, dni) VALUES (?, ?, 3, ?, ?)',
      [usuario, contraseña, email, dni]
    );
    
    await conn.end();
    
    res.json({ 
      message: 'Usuario creado exitosamente',
      ID_usuario: result.insertId,
      usuario,
      email,
      dni,
      rol: 'dep_alumnado'
    });
    
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor', error: err.message });
  }
});

// Listar todos los usuarios (solo admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute(
      'SELECT ID_usuario AS id, usuario, email, dni, ID_rol AS role FROM usuario ORDER BY ID_usuario ASC'
    );
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error('Error listando usuarios:', err);
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
});

// Eliminar usuario por ID (solo admin) - cascada elimina admin/alumnos/dep_alumnado por FK en dni
router.delete('/:id', requireAdmin, async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ message: 'ID inválido' });

  let conn;
  try {
    conn = await mysql.createConnection(dbConfig);

    // Obtener datos del usuario
    const [userRows] = await conn.execute(
      'SELECT usuario, dni FROM usuario WHERE ID_usuario = ?',
      [id]
    );
    if (userRows.length === 0) {
      await conn.end();
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const username = userRows[0].usuario;
    const dni = userRows[0].dni;

    // Transacción para eliminar de tablas de rol y luego usuario
    await conn.beginTransaction();

    // Borrar de tablas de rol por DNI (admin, alumnos, dep_alumnado)
    await conn.execute('DELETE FROM admin WHERE dni = ?', [dni]);
    await conn.execute('DELETE FROM alumnos WHERE dni = ?', [dni]);
    await conn.execute('DELETE FROM dep_alumnado WHERE dni = ?', [dni]);

    // Borrar de usuario por ID
    await conn.execute('DELETE FROM usuario WHERE ID_usuario = ?', [id]);

    await conn.commit();
    await conn.end();

    return res.json({ ok: true, message: `Usuario "${username}" eliminado`, dni });
  } catch (err) {
    if (conn) {
      try { await conn.rollback(); } catch (_) {}
      await conn.end();
    }
    console.error('Error eliminando usuario:', err);
    return res.status(500).json({ message: 'Error interno al eliminar usuario', error: err.message });
  }
});

module.exports = router;