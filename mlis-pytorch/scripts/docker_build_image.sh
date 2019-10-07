#!/bin/sh
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. >/dev/null 2>&1 && pwd )"
echo Project dir: $PROJECT_DIR
docker build -t pytorch -f $PROJECT_DIR/Dockerfile $PROJECT_DIR
docker build -t pytorch_dev -f $PROJECT_DIR/Dockerfile_dev $PROJECT_DIR
