import os
import json
import bootstrapped.bootstrap as bs
import bootstrapped.stats_functions as bs_stats
from ..utils.grid_search import RunsLogs, GridSearchConfig, GridSearch
from ..utils.plotter import Plotter
from .hello_xor_data_provider import DataProvider
from .hello_xor_code_template import Solution
from .tester import TesterConfig
from ..core.solution_tester import SolutionTester

def main():
    tester_config = TesterConfig(DataProvider, Solution)
    case_number = 1
    dir_path = os.path.dirname(os.path.realpath(__file__))
    with open(os.path.join(dir_path, 'hello_xor.json'), 'r') as myfile:
        problem_config = json.loads(myfile.read())
    test_set = problem_config['testSets'][0]
    solution_tester = SolutionTester()
    tests = solution_tester.get_tests_with_limits(test_set)
    tests = solution_tester.filter_tests(tests, case_number)
    grid_search_config = GridSearchConfig()
    grid_search_config.set_test_config(tests[0])
    grid_search_config.set_verbose(False)
    grid_search_config.set_runs_config(
            runs_params_grid = dict(
                hidden_size=[3, 4],
                learning_rate=[1.0,2.0,3.0],
                ),
            runs_per_params=10
            )

    # Note: we can save and accumulate results data if grid keys did not change
    runs_logs_file = 'helloxor_runs_logs.pickle'
    runs_logs = RunsLogs.load(runs_logs_file)
    runs_logs = GridSearch().run(tester_config, grid_search_config, runs_logs)
    runs_logs.save(runs_logs_file)

    # Explore data
    df = runs_logs.get_dataframe()
    def confidence_range(df):
        res = bs.bootstrap(df.values, stat_func=bs_stats.mean)
        return res.lower_bound, res.upper_bound
    df = df.groupby(['name', 'hidden_size', 'learning_rate']).agg({'value':['count', 'min', 'mean', 'max', confidence_range]})
    df.columns = df.columns.map('_'.join)
    df = df.reset_index()
    df['value_lmean'] = df.value_confidence_range.transform(lambda x: x[0])
    df['value_umean'] = df.value_confidence_range.transform(lambda x: x[1])
    df = df.drop(columns=['value_confidence_range'])
    print(df)

    Plotter(runs_logs).show_1d(query="hidden_size==4 and name=='time_left'")

if __name__ == '__main__':
    main()
