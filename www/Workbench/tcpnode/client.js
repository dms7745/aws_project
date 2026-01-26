const net = require('net');

const PORT = 11000;
const HOST = 'localhost';

// TCP 클라이언트 생성
const client = net.createConnection({ port: PORT, host: HOST }, () => {
    console.log('Connected to server');
    
    // 서버에 "Hello" 메시지 전송
    client.write('Hello');
    console.log('Sent: Hello');
});

// 서버로부터 데이터 수신
client.on('data', (data) => {
    console.log('Received from server:', data.toString().trim());
});

// 연결 종료
client.on('end', () => {
    console.log('Disconnected from server');
});

// 에러 처리
client.on('error', (err) => {
    console.error('Connection error:', err.message);
});

// 3초 후 연결 종료 (메시지 전송 후 서버 응답을 받을 시간을 줌)
setTimeout(() => {
    client.end();
}, 3000);
