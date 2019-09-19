class Limits:
    def __init__(self, limits_config):
        self.training_time_limit = limits_config['trainingTimeLimit']
        self.model_size_limit = limits_config.get('modelSizeLimit', None)
        self.train_accuracy_limit = limits_config.get('trainAccuracyLimit', None)
        self.test_accuracy_limit = limits_config.get('testAccuracyLimit', None)
        self.train_metric_limit = limits_config.get('trainMetricLimit', None)
        self.test_metric_limit = limits_config.get('testMetricLimit', None)