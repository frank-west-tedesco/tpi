<?php
require '../config/db.php';
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['message' => 'Método no permitido. Usa POST.']);
    exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

$username = trim($data['username'] ?? '');
$password = $data['password'] ?? '';

if ($username === '' || $password === '') {
    http_response_code(400);
    echo json_encode(['message' => 'Usuario y contraseña requeridos']);
    exit;
}

$stmt = $pdo->prepare("SELECT id, username, password, role FROM usuarios WHERE username = ?");
$stmt->execute([$username]);
$user = $stmt->fetch();

if ($user && password_verify($password, $user['password'])) {
    // Re-genera ID de sesión para evitar fijación
    session_regenerate_id(true);
    $_SESSION['user_id']  = (int)$user['id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['role']     = $user['role'];

    echo json_encode([
        'message' => 'Login exitoso',
        'user' => [
            'id'       => (int)$user['id'],
            'username' => $user['username'],
            'role'     => $user['role'],
        ]
    ]);
} else {
    http_response_code(401);
    echo json_encode(['message' => 'Credenciales incorrectas']);
}
