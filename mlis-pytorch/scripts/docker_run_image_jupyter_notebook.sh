#!/bin/bash
MLIS_PYTORCH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1; cd .. >/dev/null 2>&1; pwd )"
echo MLIS PYTORCH DIR: $MLIS_PYTORCH_DIR
docker run -it -v "$MLIS_PYTORCH_DIR":/mlis-pytorch -w /mlis-pytorch --rm -p 8888:8888 pytorch_dev jupyter notebook --ip 0.0.0.0 --no-browser --allow-root --NotebookApp.allow_origin='https://colab.research.google.com'
