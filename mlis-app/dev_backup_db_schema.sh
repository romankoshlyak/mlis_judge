#!/bin/sh
docker-compose -f docker-compose-dev.yml -p dev exec database /bin/sh -c "pg_dump -U mlis --schema-only > \"/usr/src/backups/schema_\$(date '+%Y_%m_%d__%H_%M_%S').sql\""