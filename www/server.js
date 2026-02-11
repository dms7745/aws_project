const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 데이터 파일 경로
const POSTS_FILE = path.join(__dirname, 'posts.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// 게시글 데이터 읽기
function readPosts() {
    try {
        if (fs.existsSync(POSTS_FILE)) {
            const data = fs.readFileSync(POSTS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading posts:', err);
    }
    return [];
}

// 게시글 데이터 저장
function savePosts(posts) {
    try {
        fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving posts:', err);
        return false;
    }
}

// 회원 데이터 읽기
function readUsers() {
    try {
        if (fs.existsSync(USERS_FILE)) {
            const data = fs.readFileSync(USERS_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (err) {
        console.error('Error reading users:', err);
    }
    return [];
}

// 회원 데이터 저장
function saveUsers(users) {
    try {
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving users:', err);
        return false;
    }
}

// ==================== 회원 API ====================

// API: 회원가입
app.post('/api/join', (req, res) => {
    const { userId, password, email } = req.body;
    
    if (!userId || !password || !email) {
        return res.status(400).json({ success: false, message: '모든 항목을 입력해주세요.' });
    }
    
    const users = readUsers();
    
    // 중복 체크
    if (users.find(u => u.userId === userId)) {
        return res.status(400).json({ success: false, message: '이미 사용중인 아이디입니다.' });
    }
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ success: false, message: '이미 사용중인 이메일입니다.' });
    }
    
    const newUser = {
        id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
        userId,
        password,
        email,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    if (saveUsers(users)) {
        res.json({ success: true, message: '회원가입이 완료되었습니다.' });
    } else {
        res.status(500).json({ success: false, message: '회원가입 중 오류가 발생했습니다.' });
    }
});

// API: 로그인
app.post('/api/login', (req, res) => {
    const { userId, password } = req.body;
    
    if (!userId || !password) {
        return res.status(400).json({ success: false, message: '아이디와 비밀번호를 입력해주세요.' });
    }
    
    const users = readUsers();
    const userById = users.find(u => u.userId === userId);
    
    if (!userById) {
        return res.status(401).json({ success: false, message: '아이디를 확인해주세요.' });
    }
    
    if (userById.password !== password) {
        return res.status(401).json({ success: false, message: '비밀번호를 확인해주세요.' });
    }
    
    res.json({ 
        success: true, 
        message: '로그인 성공',
        user: { id: userById.id, userId: userById.userId, email: userById.email }
    });
});


// API: 회원정보 조회
app.get("/api/users/:id", (req, res) => {
    const userId = parseInt(req.params.id);
    const users = readUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "사용자를 찾을 수 없습니다." });
    }
    res.json({ success: true, user: { id: user.id, userId: user.userId, email: user.email } });
});

// API: 회원정보 수정
app.put('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { email, currentPassword, newPassword } = req.body;
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    
    // 비밀번호 변경 시 현재 비밀번호 확인
    if (newPassword) {
        if (users[userIndex].password !== currentPassword) {
            return res.status(401).json({ success: false, message: '현재 비밀번호가 일치하지 않습니다.' });
        }
        users[userIndex].password = newPassword;
    }
    
    if (email) {
        users[userIndex].email = email;
    }
    
    writeUsers(users);
    res.json({ success: true, message: '회원정보가 수정되었습니다.' });
});

// API: 회원 탈퇴
app.delete('/api/users/:id', (req, res) => {
    const userId = parseInt(req.params.id);
    const { password } = req.body;
    
    const users = readUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
        return res.status(404).json({ success: false, message: '사용자를 찾을 수 없습니다.' });
    }
    
    if (users[userIndex].password !== password) {
        return res.status(401).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }
    
    users.splice(userIndex, 1);
    writeUsers(users);
    res.json({ success: true, message: '회원 탈퇴가 완료되었습니다.' });
});

// ==================== 게시글 API ====================

// API: 게시글 목록 조회
app.get('/api/posts', (req, res) => {
    const posts = readPosts();
    res.json({ success: true, posts });
});

// API: 게시글 상세 조회
app.get('/api/posts/:id', (req, res) => {
    const posts = readPosts();
    const post = posts.find(p => p.id === parseInt(req.params.id));
    if (post) {
        res.json({ success: true, post });
    } else {
        res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }
});

// API: 게시글 작성
app.post('/api/posts', (req, res) => {
    const { subject, content, name, authorId } = req.body;
    
    if (!subject || !content) {
        return res.status(400).json({ success: false, message: '제목과 내용을 입력해주세요.' });
    }
    
    const posts = readPosts();
    const newPost = {
        id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
        subject,
        content,
        name: name || 'Anonymous',
        authorId: authorId || null,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    };
    
    posts.unshift(newPost);
    
    if (savePosts(posts)) {
        res.json({ success: true, post: newPost });
    } else {
        res.status(500).json({ success: false, message: '저장 중 오류가 발생했습니다.' });
    }
});

// API: 게시글 수정
app.put('/api/posts/:id', (req, res) => {
    const { subject, content } = req.body;
    
    if (!subject || !content) {
        return res.status(400).json({ success: false, message: '제목과 내용을 입력해주세요.' });
    }
    
    const posts = readPosts();
    const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
    
    if (postIndex === -1) {
        return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }
    
    posts[postIndex].subject = subject;
    posts[postIndex].content = content;
    posts[postIndex].updatedAt = new Date().toISOString();
    
    if (savePosts(posts)) {
        res.json({ success: true, post: posts[postIndex] });
    } else {
        res.status(500).json({ success: false, message: '수정 중 오류가 발생했습니다.' });
    }
});

// API: 게시글 삭제
app.delete('/api/posts/:id', (req, res) => {
    let posts = readPosts();
    const postIndex = posts.findIndex(p => p.id === parseInt(req.params.id));
    
    if (postIndex === -1) {
        return res.status(404).json({ success: false, message: '게시글을 찾을 수 없습니다.' });
    }
    
    posts.splice(postIndex, 1);
    
    if (savePosts(posts)) {
        res.json({ success: true, message: '삭제되었습니다.' });
    } else {
        res.status(500).json({ success: false, message: '삭제 중 오류가 발생했습니다.' });
    }
});

// 서버 시작
app.listen(PORT, () => {
    console.log('Server is running on http://localhost:' + PORT);
});
