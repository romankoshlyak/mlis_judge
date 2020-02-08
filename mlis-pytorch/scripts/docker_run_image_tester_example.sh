#!/bin/bash
MLIS_PYTORCH_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1; cd .. >/dev/null 2>&1; pwd )"
echo MLIS PYTORCH DIR: $MLIS_PYTORCH_DIR
docker run -it -v "$MLIS_PYTORCH_DIR":/mlis-pytorch -w /mlis-pytorch --rm pytorch_dev python -m mlis.problems.tester --problem_name hello_xor --solution_file hello_xor_solution
