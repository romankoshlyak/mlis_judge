import argparse
from enum import Enum
import os 
import json
from importlib import import_module
from ..core.solution_tester import SolutionTester

class TesterConfig:
    def __init__(self, data_provider, solution):
        self.data_provider = data_provider
        self.solution = solution

    def get_data_provider(self):
        return self.data_provider()

    def get_solution(self):
        return self.solution()

class ProblemName(Enum):
    HELLO_XOR = 'hello_xor'
    GENERAL_CPU = 'general_cpu'
    GENERAL_CPU_V2 = 'general_cpu_v2'
    FIND_ME = 'find_me'
    VOTE_PREDICTION = 'vote_prediction'

    def __str__(self):
        return self.value

def file_name_to_module_name(name):
    EXTENSION = '.py'
    if (name.endswith(EXTENSION)):
        name = name[:-len(EXTENSION)]
    return '.'+name

def main():
    parser = argparse.ArgumentParser(description='Local tester', allow_abbrev=False)
    parser.add_argument('--problem_name', type=ProblemName, choices=list(ProblemName), required=True)
    parser.add_argument('--solution_file', type=str)
    parser.add_argument('--case_number', type=int, default=-1)
    args = parser.parse_args()
    problem_name = args.problem_name.value
    case_number = args.case_number
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(os.path.join(dir_path, problem_name+'.json'), 'r') as myfile:
        problem_config = json.loads(myfile.read())

    data_provider_module_name = file_name_to_module_name(problem_config['dataProviderFile'])
    data_provider_module = import_module(data_provider_module_name, __package__)
    data_provider = getattr(data_provider_module, 'DataProvider')

    solution_file = args.solution_file
    if solution_file is None:
        solution_file = problem_config['codeTemplateFile']
        print('No solution file provided, using solution template {}'.format(solution_file))

    solution_module_name = file_name_to_module_name(solution_file)
    solution_module = import_module(solution_module_name, __package__)
    solution = getattr(solution_module, 'Solution')
    tester_config = TesterConfig(data_provider, solution)

    test_set = problem_config['testSets'][0]
    SolutionTester().run(tester_config, test_set, case_number)

if __name__ == '__main__':
    main()
