# Change to True to run grid search, see hello xor templace for example of logging to grid search
if False:
    tester_config = TesterConfig(DataProvider, Solution)
    test_set = TestSet
    solution_tester = SolutionTester()

    # Specify case number
    case_number = 1
    tests = solution_tester.get_tests_with_limits(test_set)
    tests = solution_tester.filter_tests(tests, case_number)
    grid_search_config = GridSearchConfig()
    grid_search_config.set_test_config(tests[0])
    grid_search_config.set_verbose(False)

    # Configure grid search
    grid_search_config.set_runs_config(
        runs_params_grid = dict(
            hidden_size=[3, 4],
            learning_rate=[1.0,2.0,3.0],
        ),
        runs_per_params=10
    )

    # Note: we can save and accumulate results data if grid keys did not change
    runs_logs_file = 'grid_search_logs.pickle'
    runs_logs = RunsLogs.load(runs_logs_file)
    runs_logs = GridSearch().run(tester_config, grid_search_config, runs_logs)
    runs_logs.save(runs_logs_file)

    # Explore data
    df = runs_logs.get_dataframe()
    df = df.groupby(['name', 'hidden_size', 'learning_rate']).agg({'value':['count', 'mean']})
    df.columns = df.columns.map('_'.join)
    df = df.reset_index()
    print(df)

    # Plot data
    Plotter(runs_logs).show_1d(query="hidden_size==4 and name=='step'")
    Plotter(runs_logs).show_1d(query="learning_rate==2.0 and name=='step'")