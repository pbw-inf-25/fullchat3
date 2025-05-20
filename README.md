# fullchat
> Websocket, mongodb & docker

## How to use 
1. Create docker network: `make pbw-net`
2. Create image for fullchat2 app: `make pbw-build-chat`
3. Download and running mongo db container: `make pbw-mongo-stack`
4. Running fullchat2 : `make pbw-run-chat`
5. Open url : `http://localhost:30002`