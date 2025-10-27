// app2.js
const express = require('express');
const session = require('express-session');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware global
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mi_secreto_super_seguro',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // poner true solo si usas HTTPS
}));


// Routers (endpoints)
const registroRouter = require('./api/register/CCGuevara');   // /api/register
const loginRouter    = require('./api/Login/LoguinGuevara');  // /api/login
const logoutRouter   = require('./api/logout/log_out');       // /api/logout
const notasRouter    = require('./api/notasGuevara');  // /api/notas
const getNotasRouter = require('./api/get_notas/get_notas');  // /api/get_notas
const sesionRouter   = require('./api/sesion/sesion');        // /api/sesion
const alumnosRouter  = require('./api/alumnos/alumnos');      // /api/alumnos
const cursosRouter   = require('./api/cursos/cursos');        // /api/cursos
const usuariosRouter = require('./api/usuarios');             // /api/usuarios
app.use('/api/cursos', (req, res, next) => { console.log(`[CURSOS] ${req.method} ${req.originalUrl}`); next(); }, cursosRouter);

// Montar routers con logs simples
app.use('/api/register', (req, res, next) => { console.log(`[REGISTER] ${req.method} ${req.originalUrl}`); next(); }, registroRouter);
app.use('/api/login', (req, res, next) => { console.log(`[LOGIN] ${req.method} ${req.originalUrl}`); next(); }, loginRouter);
app.use('/api/logout', (req, res, next) => { console.log(`[LOGOUT] ${req.method} ${req.originalUrl}`); next(); }, logoutRouter);
app.use('/api/notas', (req, res, next) => { console.log(`[NOTAS] ${req.method} ${req.originalUrl}`); next(); }, notasRouter);
app.use('/api/get_notas', (req, res, next) => { console.log(`[GET_NOTAS] ${req.method} ${req.originalUrl}`); next(); }, getNotasRouter);
app.use('/api/sesion', (req, res, next) => { console.log(`[SESION] ${req.method} ${req.originalUrl}`); next(); }, sesionRouter);
app.use('/api/alumnos', (req, res, next) => { console.log(`[ALUMNOS] ${req.method} ${req.originalUrl}`); next(); }, alumnosRouter);
app.use('/api/usuarios', (req, res, next) => { console.log(`[USUARIOS] ${req.method} ${req.originalUrl}`); next(); }, usuariosRouter);

// Archivos estáticos (frontend en /public)
app.use(express.static(path.join(__dirname, 'public')));
// Página principal
app.get('/', (req, res) => {
  console.log("[INDEX] GET /");
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error("🔥 ERROR DETECTADO:", err.stack || err);
  res.status(500).json({ error: "Error interno en el servidor" });
});

// Servidor con manejo de error de arranque
app.listen(PORT, (err) => {
  if (err) {
    console.error("❌ No se pudo iniciar el servidor:", err);
    process.exit(1);
  }
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
