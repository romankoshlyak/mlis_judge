#!/bin/sh
docker-compose -f docker-compose-dev.yml -p dev exec database /bin/sh -c "psql -U postgres -c \"drop database mlis;\""
docker-compose -f docker-compose-dev.yml -p dev exec database /bin/sh -c "psql -U postgres -c \"create database mlis owner mlis;\""
docker-compose -f docker-compose-dev.yml -p dev exec database /bin/sh -c "psql -U mlis --set ON_ERROR_STOP=on mlis --single-transaction < /usr/src/backups/backup_2019_10_02__00_40_35.sql"
