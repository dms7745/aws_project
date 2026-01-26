#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <arpa/inet.h>
#include <sys/socket.h>

#define PORT 10000
#define BUFFER_SIZE 1024

void error_handling(char *message) {
    perror(message);
    exit(1);
}

int main() {
    int server_sock, client_sock;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_size;
    char buffer[BUFFER_SIZE];
    int str_len;

    // 소켓 생성
    server_sock = socket(PF_INET, SOCK_STREAM, 0);
    if (server_sock == -1)
        error_handling("socket() error");

    // 소켓 옵션 설정 (주소 재사용)
    int option = 1;
    setsockopt(server_sock, SOL_SOCKET, SO_REUSEADDR, &option, sizeof(option));

    // 주소 구조체 초기화
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    server_addr.sin_port = htons(PORT);

    // 소켓에 주소 할당
    if (bind(server_sock, (struct sockaddr*)&server_addr, sizeof(server_addr)) == -1)
        error_handling("bind() error");

    // 연결 대기 상태로 전환
    if (listen(server_sock, 5) == -1)
        error_handling("listen() error");

    printf("Server listening on localhost:%d\n", PORT);

    while (1) {
        client_addr_size = sizeof(client_addr);
        client_sock = accept(server_sock, (struct sockaddr*)&client_addr, &client_addr_size);
        if (client_sock == -1) {
            perror("accept() error");
            continue;
        }

        printf("Client connected: %s:%d\n", 
               inet_ntoa(client_addr.sin_addr), 
               ntohs(client_addr.sin_port));

        // 클라이언트로부터 데이터 수신 및 에코
        while ((str_len = read(client_sock, buffer, BUFFER_SIZE - 1)) != 0) {
            if (str_len == -1) {
                perror("read() error");
                break;
            }
            buffer[str_len] = '\0';
            printf("Received: %s", buffer);
            write(client_sock, buffer, str_len);
        }

        printf("Client disconnected\n");
        close(client_sock);
    }

    close(server_sock);
    return 0;
}
