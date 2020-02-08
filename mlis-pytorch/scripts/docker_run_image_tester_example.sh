#!/bin/sh
PROJECT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. >/dev/null 2>&1 && pwd )"
echo Project dir: $PROJECT_DIR
docker run -it -v "$PROJECT_DIR":/mlis-pytorch -w /mlis-pytorch --rm pytorch_dev python -m mlis.problems.tester --problem_name hello_xor --solution_file hello_xor_solution
