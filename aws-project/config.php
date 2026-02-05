<?php
// 데이터베이스 설정
define('DB_HOST', 'localhost');
define('DB_USER', 'web');
define('DB_PASS', 'web123!@#');
define('DB_NAME', 'web');

// 데이터베이스 연결
function getDBConnection() {
    try {
        $conn = new PDO(
            "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4",
            DB_USER,
            DB_PASS,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false
            ]
        );
        return $conn;
    } catch(PDOException $e) {
        die("Connection failed: " . $e->getMessage());
    }
}

// 세션 시작
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
