const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// MySQL 연결 설정
const pool = mysql.createPool({
    host: 'localhost',
    user: 'web',
    password: 'web123!@#',
    database: 'web',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.use(session({
    secret: 'da2un-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// 로그인 체크 미들웨어
const requireLogin = (req, res, next) => {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
};

// --- 기본 라우트 ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 로그인 페이지
app.get('/login', (req, res) => {
    if (req.session.userId) return res.redirect('/dashboard');
    res.render('login', { error: null });
});

// 로그인 처리
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.json({ success: false, error: '아이디와 비밀번호를 입력해주세요.' });
    }
    try {
        const [rows] = await pool.query('SELECT * FROM user WHERE username = ? AND is_active = 1', [username]);
        if (rows.length === 0) {
            return res.json({ success: false, error: '사용자를 찾을 수 없습니다.' });
        }
        const user = rows[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.json({ success: false, error: '비밀번호가 일치하지 않습니다.' });
        }
        req.session.userId = user.id;
        req.session.username = user.username;
        await pool.query('UPDATE user SET last_login = NOW() WHERE id = ?', [user.id]);
        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login Error:', error);
        res.json({ success: false, error: '로그인 중 오류가 발생했습니다.' });
    }
});

app.get('/dashboard', requireLogin, async (req, res) => {
    try {
        const [userRows] = await pool.query('SELECT * FROM user WHERE id = ?', [req.session.userId]);
        const currentUser = userRows[0];
        res.render('dashboard', { currentUser, users: [] });
    } catch (error) {
        res.status(500).send('서버 오류가 발생했습니다.');
    }
});

// --- 게시판 API 영역 (Nginx의 proxy_pass /api/ 설정을 고려하여 /api 제거) ---

// 1. 게시글 목록 가져오기
app.get('/api/posts', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT no, subject, name, date FROM posts ORDER BY no DESC');
        res.json(rows);
    } catch (error) {
        console.error('Fetch Error:', error);
        res.status(500).json({ error: '목록을 불러오는 중 오류가 발생했습니다.' });
    }
});

// 2. 게시글 작성
app.post('/api/posts', async (req, res) => {
    const { subject, name, content } = req.body;
    if (!subject || !name || !content) {
        return res.json({ success: false, error: '모든 항목을 입력해주세요.' });
    }
    try {
        await pool.query(
            'INSERT INTO posts (subject, name, content, date) VALUES (?, ?, ?, NOW())',
            [subject, name, content]
        );
        res.json({ success: true });
    } catch (error) {
        console.error('Write Error:', error);
        res.status(500).json({ success: false, error: '데이터베이스 저장에 실패했습니다.' });
    }
});

// 3. 게시글 삭제
app.delete('/posts/:no', async (req, res) => {
    const postNo = req.params.no;
    try {
        const [result] = await pool.query('DELETE FROM posts WHERE no = ?', [postNo]);
        if (result.affectedRows > 0) {
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: '삭제할 게시글을 찾지 못했습니다.' });
        }
    } catch (error) {
        console.error('Delete Error:', error);
        res.status(500).json({ success: false, error: '삭제 중 서버 오류가 발생했습니다.' });
    }
});

// 로그아웃
app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/login'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
