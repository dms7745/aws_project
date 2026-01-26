const net = require('net');

const PORT = 11000;
const HOST = 'localhost';

// 연결된 클라이언트들을 저장할 배열
const clients = [];

// TCP 서버 생성
const server = net.createServer((socket) => {
    const clientId = `${socket.remoteAddress}:${socket.remotePort}`;
    
    console.log(`[${new Date().toLocaleTimeString()}] Client connected: ${clientId}`);
    
    // 새 클라이언트를 배열에 추가
    clients.push(socket);
    
    // 접속 환영 메시지
    socket.write(`Welcome to the chat server! You are client #${clients.length}\n`);
    socket.write(`There are ${clients.length} user(s) online.\n`);
    
    // 다른 클라이언트들에게 새 접속 알림
    broadcast(`[Server] New user joined the chat. (${clients.length} users online)\n`, socket);
    
    // 클라이언트로부터 데이터 수신
    socket.on('data', (data) => {
        const message = data.toString().trim();
        console.log(`[${new Date().toLocaleTimeString()}] ${clientId}: ${message}`);
        
        // 모든 클라이언트에게 메시지 브로드캐스트
        broadcast(`[${clientId}] ${message}\n`, socket);
    });
    
    // 클라이언트 연결 종료
    socket.on('end', () => {
        console.log(`[${new Date().toLocaleTimeString()}] Client disconnected: ${clientId}`);
        removeClient(socket);
        broadcast(`[Server] User left the chat. (${clients.length} users online)\n`, socket);
    });
    
    // 에러 처리
    socket.on('error', (err) => {
        console.error(`[${new Date().toLocaleTimeString()}] Error from ${clientId}:`, err.message);
        removeClient(socket);
    });
});

// 모든 클라이언트에게 메시지 브로드캐스트 (발신자 제외)
function broadcast(message, sender) {
    clients.forEach((client) => {
        if (client !== sender && !client.destroyed) {
            client.write(message);
        }
    });
}

// 클라이언트 배열에서 제거
function removeClient(socket) {
    const index = clients.indexOf(socket);
    if (index !== -1) {
        clients.splice(index, 1);
    }
}

// 서버 시작
server.listen(PORT, HOST, () => {
    console.log(`Chat server is listening on ${HOST}:${PORT}`);
    console.log('Waiting for clients to connect...');
});

// 서버 에러 처리
server.on('error', (err) => {
    console.error('Server error:', err);
});
