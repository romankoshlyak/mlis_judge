#!/bin/bash
MLIS_PYTORCH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1; cd .. >/dev/null 2>&1; pwd )"
echo MLIS PYTORCH DIR: $MLIS_PYTORCH_DIR
docker build -t pytorch -f "$MLIS_PYTORCH_DIR"/Dockerfile "$MLIS_PYTORCH_DIR"
docker build -t pytorch_dev -f "$MLIS_PYTORCH_DIR"/Dockerfile_dev "$MLIS_PYTORCH_DIR"
