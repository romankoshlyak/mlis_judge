class TesterConfig:
    def __init__(self, data_provider, solution):
        self.data_provider = data_provider
        self.solution = solution

    def get_data_provider(self):
        return self.data_provider()

    def get_solution(self):
        return self.solution()