#!/bin/sh
echo "进来了"
docker stop `docker ps -a -q`
docker rm `docker ps -a -q`
docker rmi $(docker images | grep "docker-compose" | awk '{print $3}')
docker-compose down
docker-compose -f ./docker-compose.yml up --build -d
echo "启动docker compose"