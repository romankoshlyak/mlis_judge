#!/bin/sh
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. >/dev/null 2>&1 && pwd )"
echo Project dir: $PROJECT_DIR
docker run -it -v $PROJECT_DIR:/mlis-pytorch -w /mlis-pytorch --rm pytorch_dev python -m mlis.problems.hello_xor_grid_search
