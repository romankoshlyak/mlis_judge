#!/bin/sh
docker-compose -f docker-compose-install.yml -p build up agent
docker-compose -f docker-compose-install.yml -p build up server
docker-compose -f docker-compose-install.yml -p build up client