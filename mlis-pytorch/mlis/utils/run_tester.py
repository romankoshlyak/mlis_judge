from ..core.tester_config import TesterConfig
from ..core.solution_tester import SolutionTester

def run_tester(case_number = -1):
    # Note: this 2 classes need to be defined at this point
    tester_config = TesterConfig(DataProvider, Solution)
    test_set = TestSet
    SolutionTester().run(tester_config, test_set, case_number)