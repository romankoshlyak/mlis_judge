#!/bin/sh
docker-compose -f docker-compose-dev.yml -p dev exec server /bin/sh

