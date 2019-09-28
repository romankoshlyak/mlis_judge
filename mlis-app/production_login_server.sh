#!/bin/sh
docker-compose -f docker-compose-production.yml -p production exec server /bin/sh