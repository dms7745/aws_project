<?php
require_once 'config.php';

// 로그인 확인
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

$conn = getDBConnection();

// 사용자 정보 가져오기
$stmt = $conn->prepare("SELECT * FROM user WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$currentUser = $stmt->fetch();

// 사용자 목록 가져오기 (관리자만)
$users = [];
if ($currentUser['role'] === 'admin') {
    $stmt = $conn->query("SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM user ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
}
?>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>대시보드 - 포트폴리오 사이트</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
        }
        
        header {
            background: #003366;
            color: white;
            padding: 15px 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .header-content {
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .logout-btn {
            background: #dc3545;
            color: white;
            padding: 8px 16px;
            border-radius: 5px;
            text-decoration: none;
            font-size: 14px;
        }
        
        .logout-btn:hover {
            background: #c82333;
        }
        
        .container {
            max-width: 1200px;
            margin: 30px auto;
            padding: 0 20px;
        }
        
        .welcome-card {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .welcome-card h1 {
            color: #333;
            margin-bottom: 10px;
        }
        
        .role-badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-left: 10px;
        }
        
        .role-admin {
            background: #dc3545;
            color: white;
        }
        
        .role-operator {
            background: #ffc107;
            color: #333;
        }
        
        .role-viewer {
            background: #28a745;
            color: white;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: #666;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .stat-card .number {
            font-size: 32px;
            font-weight: bold;
            color: #003366;
        }
        
        .users-table {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            overflow-x: auto;
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        th {
            background: #f8f9fa;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            color: #333;
            border-bottom: 2px solid #dee2e6;
        }
        
        td {
            padding: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        
        tr:hover {
            background: #f8f9fa;
        }
        
        .status-active {
            color: #28a745;
            font-weight: 600;
        }
        
        .status-inactive {
            color: #dc3545;
            font-weight: 600;
        }
        
        .menu-links {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 30px;
        }
        
        .menu-links h2 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .menu-links a {
            display: inline-block;
            margin-right: 15px;
            margin-bottom: 10px;
            padding: 10px 20px;
            background: #667eea;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            transition: background 0.3s;
        }
        
        .menu-links a:hover {
            background: #5568d3;
        }
    </style>
</head>
<body>
    <header>
        <div class="header-content">
            <div>
                <strong>포트폴리오 사이트 관리</strong>
            </div>
            <div class="user-info">
                <span>
                    <?= htmlspecialchars($currentUser['full_name']) ?> 
                    (<?= htmlspecialchars($currentUser['username']) ?>)
                    <span class="role-badge role-<?= $currentUser['role'] ?>">
                        <?= strtoupper($currentUser['role']) ?>
                    </span>
                </span>
                <a href="logout.php" class="logout-btn">로그아웃</a>
            </div>
        </div>
    </header>
    
    <div class="container">
        <div class="welcome-card">
            <h1>환영합니다! 👋</h1>
            <p>마지막 로그인: <?= $currentUser['last_login'] ? date('Y-m-d H:i:s', strtotime($currentUser['last_login'])) : '처음 로그인' ?></p>
        </div>
        
        <div class="menu-links">
            <h2>메뉴</h2>
            <a href="index.html">🏠 메인 페이지</a>
            <a href="contact.html">📧 연락처 페이지</a>
            <a href="/phpmyadmin" target="_blank">🗄️ phpMyAdmin</a>
        </div>
        
        <?php if ($currentUser['role'] === 'admin'): ?>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>총 사용자 수</h3>
                    <div class="number"><?= count($users) ?></div>
                </div>
                <div class="stat-card">
                    <h3>활성 사용자</h3>
                    <div class="number">
                        <?= count(array_filter($users, fn($u) => $u['is_active'])) ?>
                    </div>
                </div>
                <div class="stat-card">
                    <h3>관리자</h3>
                    <div class="number">
                        <?= count(array_filter($users, fn($u) => $u['role'] === 'admin')) ?>
                    </div>
                </div>
            </div>
            
            <div class="users-table">
                <h2 style="margin-bottom: 20px;">사용자 관리</h2>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>사용자명</th>
                            <th>이메일</th>
                            <th>이름</th>
                            <th>권한</th>
                            <th>상태</th>
                            <th>마지막 로그인</th>
                            <th>생성일</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($users as $user): ?>
                        <tr>
                            <td><?= $user['id'] ?></td>
                            <td><?= htmlspecialchars($user['username']) ?></td>
                            <td><?= htmlspecialchars($user['email'] ?? '-') ?></td>
                            <td><?= htmlspecialchars($user['full_name'] ?? '-') ?></td>
                            <td>
                                <span class="role-badge role-<?= $user['role'] ?>">
                                    <?= strtoupper($user['role']) ?>
                                </span>
                            </td>
                            <td class="<?= $user['is_active'] ? 'status-active' : 'status-inactive' ?>">
                                <?= $user['is_active'] ? '활성' : '비활성' ?>
                            </td>
                            <td><?= $user['last_login'] ? date('Y-m-d H:i', strtotime($user['last_login'])) : '-' ?></td>
                            <td><?= date('Y-m-d', strtotime($user['created_at'])) ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        <?php else: ?>
            <div class="welcome-card">
                <h2>귀하의 권한: <?= strtoupper($currentUser['role']) ?></h2>
                <p>현재 계정으로는 제한된 기능만 사용할 수 있습니다.</p>
            </div>
        <?php endif; ?>
    </div>
</body>
</html>
