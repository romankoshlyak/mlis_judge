#!/bin/sh
docker-compose -f docker-compose-production.yml -p production exec database /bin/sh -c "pg_dump -U mlis > \"/usr/src/backups/backup_\$(date '+%Y_%m_%d__%H_%M_%S').sql\""