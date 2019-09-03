from ..core.solution_tester import SolutionTester
from .data_provider import DataProvider
from .solution import Solution
import os
import sys
import json

class TesterConfig:
    def get_data_provider(self):
        return DataProvider()

    def get_solution(self):
        return Solution()

def main():
    base_path = os.getcwd()
    _, config_path, result_path = sys.argv
    with open(config_path, 'r') as myfile:
        test_config = json.loads(myfile.read())
    test_result = SolutionTester().run_case_from_test_config(TesterConfig(), test_config)
    with open(result_path, "w") as myfile:
        myfile.write(json.dumps(test_result))

if __name__ == '__main__':
    main()
