class CaseData:
    REGRESSION = 'regression'
    CLASSIFICATION = 'classification'

    def __init__(self):
        self.type = self.CLASSIFICATION

    def set_type(self, type):
        self.type = type

    def set_number(self, number):
        self.number = number

    def set_train_data(self, train_data):
        self.train_data = train_data

    def set_test_data(self, test_data):
        self.test_data = test_data

    def set_run_seed(self, run_seed):
        self.run_seed = run_seed

    def set_limits(self, limits):
        self.limits = limits

    def set_description(self, description):
        self.description = description
        return self

    def get_limits(self):
        return self.limits
