<?php
require '../config/db.php';
header('Content-Type: application/json; charset=utf-8');

// Permisos
$role = $_SESSION['role'] ?? '';
if (!in_array($role, ['admin','dep_alumnado'], true)) {
    http_response_code(403);
    echo json_encode(['message' => 'Acceso denegado']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Método no permitido. Usa POST.']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$alumno_id = (int)($data['alumno_id'] ?? 0);
$materia   = trim($data['materia'] ?? '');
$nota      = isset($data['nota']) ? (float)$data['nota'] : -1;

if ($alumno_id <= 0 || $materia === '' || $nota < 0 || $nota > 10) {
    http_response_code(400);
    echo json_encode(['message' => 'Datos inválidos']);
    exit;
}

$stmt = $pdo->prepare("
    INSERT INTO notas (alumno_id, materia, nota)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE nota = VALUES(nota)
");
$stmt->execute([$alumno_id, $materia, $nota]);

echo json_encode(['message' => 'Nota registrada/actualizada']);