<?php
require '../config/db.php';
header('Content-Type: application/json; charset=utf-8');

// Solo admin puede registrar usuarios
if (($_SESSION['role'] ?? '') !== 'admin') {
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

$username = trim($data['username'] ?? '');
$email    = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');
$role     = trim($data['role'] ?? '');

if ($username === '' || $email === '' || $password === '' || $role === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Todos los campos son obligatorios']);
    exit;
}

// (Opcional) Validaciones mínimas
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['message' => 'Email inválido']);
    exit;
}
if (!in_array($role, ['admin','alumno','dep_alumnado'], true)) {
    http_response_code(400);
    echo json_encode(['message' => 'Rol inválido']);
    exit;
}

// Chequear duplicados
$check = $pdo->prepare("SELECT 1 FROM usuarios WHERE username = ? OR email = ? LIMIT 1");
$check->execute([$username, $email]);
if ($check->fetch()) {
    http_response_code(409);
    echo json_encode(['message' => 'Usuario o email ya existe']);
    exit;
}

$hash = password_hash($password, PASSWORD_DEFAULT);

$stmt = $pdo->prepare("INSERT INTO usuarios (username, email, password, role) VALUES (?, ?, ?, ?)");
$stmt->execute([$username, $email, $hash, $role]);

echo json_encode(['message' => 'Cuenta creada']);
