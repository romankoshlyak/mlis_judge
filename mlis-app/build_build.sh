#!/bin/sh
git pull
docker-compose -f docker-compose-build.yml -p build up agent
docker-compose -f docker-compose-build.yml -p build up server
docker-compose -f docker-compose-build.yml -p build up client