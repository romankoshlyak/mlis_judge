from ..core.tester_config import TesterConfig
from ..core.solution_tester import SolutionTester
from .data_provider import DataProvider
from .solution import Solution
import os
import sys
import json

def main():
    _, config_path, result_path = sys.argv
    with open(config_path, 'r') as myfile:
        test_config = json.loads(myfile.read())
    tester_config = TesterConfig(DataProvider, SolutionTester)
    test_result = SolutionTester().run_case_from_test_config(tester_config, test_config)
    with open(result_path, "w") as myfile:
        myfile.write(json.dumps(test_result))

if __name__ == '__main__':
    main()
