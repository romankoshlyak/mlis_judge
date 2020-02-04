#!/bin/sh
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. >/dev/null 2>&1 && pwd )"
echo Project dir: $PROJECT_DIR
docker run -it -v $PROJECT_DIR:/mlis-pytorch -w /mlis-pytorch -p 8888:8888 --rm pytorch_dev
