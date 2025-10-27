// logout/log_out.js
const express = require('express');
const router = express.Router();

// Logout
router.post('/', (req, res) => {
  console.log("👉 Entró al handler de /api/logout"); // 🔹 Confirma que entró aquí
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        console.error("❌ Error destruyendo sesión:", err);
        return res.status(500).json({ message: 'Error al cerrar sesión' });
      }
      console.log("✅ Sesión destruida correctamente");
      res.json({ message: 'Sesión cerrada correctamente' });
    });
  } else {
    console.warn("⚠️ No había sesión activa");
    res.status(400).json({ message: 'No hay sesión activa' });
  }
});

module.exports = router;
