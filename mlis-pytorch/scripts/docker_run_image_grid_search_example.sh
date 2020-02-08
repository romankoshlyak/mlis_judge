#!/bin/bash
MLIS_PYTORCH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1; cd .. >/dev/null 2>&1; pwd )"
echo MLIS PYTORCH DIR: $MLIS_PYTORCH_DIR
docker run -it -v "$MLIS_PYTORCH_DIR":/mlis-pytorch -w /mlis-pytorch --rm pytorch_dev python -m mlis.problems.hello_xor_grid_search
