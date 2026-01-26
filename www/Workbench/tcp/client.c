#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define SERVER_IP "127.0.0.1"
#define PORT 10000
#define BUFFER_SIZE 1024

void error_handling(char *message) {
    perror(message);
    exit(1);
}

int main() {
    int sock;
    struct sockaddr_in server_addr;
    char message[] = "Hello";
    char buffer[BUFFER_SIZE];
    int str_len;

    // 소켓 생성
    sock = socket(PF_INET, SOCK_STREAM, 0);
    if (sock == -1)
        error_handling("socket() error");

    // 서버 주소 구조체 초기화
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr(SERVER_IP);
    server_addr.sin_port = htons(PORT);

    // 서버에 연결
    if (connect(sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1)
        error_handling("connect() error");
    
    printf("Connected to server %s:%d\n", SERVER_IP, PORT);

    // 메시지 전송
    write(sock, message, strlen(message));
    printf("Sent: %s\n", message);

    // 서버로부터 응답 수신
    str_len = read(sock, buffer, BUFFER_SIZE - 1);
    if (str_len == -1)
        error_handling("read() error");
    
    buffer[str_len] = '\0';
    printf("Received from server: %s\n", buffer);

    close(sock);
    return 0;
}
