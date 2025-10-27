const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'cpeg',
    port: 3307
});

// Endpoint para obtener notas de un alumno específico
router.get('/:alumnoId', async (req, res) => {
    try {
        const alumnoId = req.params.alumnoId;
        
        // Verificar que el alumno existe y tiene permisos
        if (!req.session || !req.session.user) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        // Consulta SQL para obtener las notas
        const query = `
            SELECT 
                n.materia,
                n.primer_trimestre as primer,
                n.segundo_trimestre as segundo,
                n.tercer_trimestre as tercero,
                n.comentarios
            FROM notas n
            WHERE n.alumno_id = ?
        `;

        connection.query(query, [alumnoId], (error, results) => {
            if (error) {
                console.error('Error al obtener notas:', error);
                return res.status(500).json({ error: 'Error al obtener notas' });
            }

            // Si no hay notas, devolver array vacío
            if (!results || results.length === 0) {
                // Definir materias predeterminadas
                const materiasPredeterminadas = [
                    'Hardware',
                    'Redes',
                    'Programación',
                    'Autogestión'
                ];

                // Crear estructura de notas vacías
                const notasVacias = materiasPredeterminadas.map(materia => ({
                    materia,
                    primer: null,
                    segundo: null,
                    tercero: null,
                    comentarios: ''
                }));

                return res.json(notasVacias);
            }

            // Procesar los resultados para manejar valores nulos
            const notasProcesadas = results.map(nota => ({
                materia: nota.materia,
                primer: nota.primer !== null ? parseFloat(nota.primer).toFixed(2) : null,
                segundo: nota.segundo !== null ? parseFloat(nota.segundo).toFixed(2) : null,
                tercero: nota.tercero !== null ? parseFloat(nota.tercero).toFixed(2) : null,
                comentarios: nota.comentarios || ''
            }));

            res.json(notasProcesadas);
        });
    } catch (error) {
        console.error('Error en el servidor:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;
