class Limits:
    def __init__(self, limits_config):
        self.training_time_limit = limits_config['trainingTimeLimit']
        self.model_size_limit = limits_config['modelSizeLimit']
        self.train_accuracy_limit = limits_config['trainAccuracyLimit']
        self.test_accuracy_limit = limits_config['testAccuracyLimit']