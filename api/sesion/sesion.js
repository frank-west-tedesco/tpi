// backend/routes/sesion.js
const express = require('express');
const router = express.Router();

// Endpoint para chequear sesión
router.get('/', (req, res) => {
    if (req.session && req.session.user) {
        // Sesión activa
        res.json({
            logged: true,
            user: {
                id: req.session.user.id,      // ID de usuario
                usuario: req.session.user.usuario, // nombre de usuario
                role: req.session.user.role,  // 1=admin, 2=alumno, 3=dep_alumnado
                dni: req.session.user.dni,
                email: req.session.user.email
            }
        });
    } else {
        // Sin sesión
        res.json({ logged: false });
    }
});

module.exports = router;
