#!/usr/bin/make

.PHONY = all clean

BASH := $(shell which bash)
export BASH_ENV=env.sh

pbw-net:
		docker network create \
			--driver=bridge \
			--subnet=175.17.238.0/24 \
			--gateway=175.17.238.1 \
			pbw-networks

pbw-mongo-stack:
		bash -c 'docker-compose -p pbw-db-stack -f docker-compose.mongo.yml up -d --build'

pbw-mongo-stack-down:
		bash -c 'docker-compose -p pbw-db-stack -f docker-compose.mongo.yml down'


# App fullchat2
pbw-build-chat:
	bash -c 'cd fullchat2 && docker build -t ws-server .'

pbw-run-chat:
	bash -c 'docker run -d --name pbw-server --network pbw-networks -p 30002:3000 ws-server'
