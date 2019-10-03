#!/bin/sh
docker-compose -f docker-compose-dev.yml -p dev exec database /bin/sh

