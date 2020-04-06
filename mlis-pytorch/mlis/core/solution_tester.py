import time
import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from .speed_calculator import SpeedCalculator
from .training_context import TrainingContext
from .timer import Timer
from .limits import Limits

class SolutionTester():
    HINT_YELLOW = '\033[93m'
    ACCEPTED_GREEN = '\033[92m'
    REJECTED_RED = '\033[91m'
    END_COLOR = '\033[0m'
    def __init__(self):
        self.metric = nn.MSELoss()

    def calc_model_size(self, model):
        modelSize = 0
        for param in model.parameters():
            modelSize += param.view(-1).size()[0]
        return modelSize

    def sampleData(self, data, max_samples = 10000):
        dataSize = list(data.size())
        data = data.view(dataSize[0], -1)[:max_samples,:]
        dataSize[0] = min(dataSize[0], max_samples)
        data = data.view(tuple(dataSize))
        return data

    def calc_model_stats(self, case_data, model, data, target, time_mult):
        with torch.no_grad():
            data = self.sampleData(data)
            target = self.sampleData(target)
            evaluation_start_time = time.time()
            output = model(data)
            evaluation_end_time = time.time()
            # Number of correct predictions
            error = model.calc_error(output, target).item()
            total = data.size(0)
            metric = self.metric(output, target).item()
            if case_data.type == case_data.CLASSIFICATION:
                predict = model.calc_predict(output)
                correct = predict.eq(target.view_as(predict)).long().sum().item()
                accuracy = correct/total
            else:
                correct = None
                accuracy = None

            return {
                    'error': error,
                    'correct': correct,
                    'total': total,
                    'accuracy': accuracy,
                    'metric': metric,
                    'evaluation_time': (evaluation_end_time - evaluation_start_time)*time_mult,
                    }

    def train_model(self, solution, train_data, context):
        # We need to init random system, used for multiple runs
        torch.manual_seed(context.run_seed)
        model = solution.train_model(*train_data, context)
        return context.step, model

    def set_case_data_from_config(self, case_data, test_config):
        case_data.set_number(test_config['number'])
        case_data.set_run_seed(test_config['runSeed'])
        case_data.set_description(test_config['description'])
        case_data.set_limits(Limits(test_config['limits']))
        return case_data

    def get_case_data_from_test_config(self, config, test_config):
        data_provider = config.get_data_provider()
        data_provider_config = test_config['dataProviderConfig']
        case_data = data_provider.create_case_data(data_provider_config)
        case_data = self.set_case_data_from_config(case_data, test_config)
        return case_data

    def run_case_from_case_data(self, config, case_data, time_mult = 1.0):
        limits = case_data.get_limits()
        timer = Timer(limits.training_time_limit, time_mult)
        context = TrainingContext(case_data.run_seed, timer)
        training_start_time = time.time()
        solution = config.get_solution()
        step, model = self.train_model(solution, case_data.train_data, context)
        training_end_time = time.time()
        training_time = (training_end_time - training_start_time)*time_mult
        model_size = self.calc_model_size(model)
        model.eval()
        train_stat = self.calc_model_stats(case_data, model, *case_data.train_data, time_mult)
        test_stat = self.calc_model_stats(case_data, model, *case_data.test_data, time_mult)

        return {
            'modelSize': model_size,
            'trainingSteps': step,
            'trainingTime': training_time,
            'trainEvaluationTime': train_stat['evaluation_time'],
            'trainError': train_stat['error'],
            'trainMetric': train_stat['metric'],
            'trainCorrect': train_stat['correct'],
            'trainTotal': train_stat['total'],
            'trainAccuracy': train_stat['accuracy'],
            'testEvaluationTime': test_stat['evaluation_time'],
            'testError': test_stat['error'],
            'testMetric': test_stat['metric'],
            'testCorrect': test_stat['correct'],
            'testTotal': test_stat['total'],
            'testAccuracy': test_stat['accuracy'],
        }

    def run_case_from_test_config(self, config, test_config, time_mult = 1.0):
        case_data = self.get_case_data_from_test_config(config, test_config)
        return self.run_case_from_case_data(config, case_data, time_mult)

    @classmethod
    def colored_string(self, s, color):
        return color+s+SolutionTester.END_COLOR

    @classmethod
    def print_hint(self, s, step=0):
        if step==0:
            print(SolutionTester.colored_string(s, SolutionTester.HINT_YELLOW))


    def hint_string(self, s):
        return self.colored_string(s, SolutionTester.HINT_YELLOW)

    def rejected_string(self, s):
        return self.colored_string(s, SolutionTester.REJECTED_RED)

    def accepted_string(self, s):
        return self.colored_string(s, SolutionTester.ACCEPTED_GREEN)

    def evaluate_result(self, case_data, case_result):
        limits = case_data.get_limits()
        r = case_result
        case = case_data.number
        description = case_data.description
        size = r['modelSize']
        step = r['trainingSteps']
        time = r['trainingTime']
        train_error = r['trainError']
        train_metric = r['trainMetric']
        train_correct = r['trainCorrect']
        train_total = r['trainTotal']
        train_accuracy = r['trainAccuracy']
        test_error = r['testError']
        test_metric = r['testMetric']
        test_correct = r['testCorrect']
        test_total = r['testTotal']
        test_accuracy = r['testAccuracy']

        print("Case #{}[{}] Step={} Size={}/{} Time={:.1f}/{:.1f}".format(
            case, description, step, size, limits.model_size_limit, time, limits.training_time_limit))
        if train_metric is not None:
            print("Train metric/limit={:.4f}/{} Error={}".format(
                train_metric, limits.train_metric_limit, train_error))
        if test_metric is not None:
            print("Test  metric/limit={:.4f}/{} Error={}".format(
                test_metric, limits.test_metric_limit, test_error))
        if train_accuracy is not None:
            print("Train correct/total={}/{} Ratio/limit={:.2f}/{:.2f} Error={}".format(
                train_correct, train_total, train_accuracy, limits.train_accuracy_limit, train_error))
        if test_accuracy is not None:
            print("Test  correct/total={}/{} Ratio/limit={:.2f}/{:.2f} Error={}".format(
                test_correct, test_total, test_accuracy, limits.test_accuracy_limit, test_error))
        r['accepted'] = False
        if limits.model_size_limit is not None and size > limits.model_size_limit:
            print(self.rejected_string("[REJECTED]")+": MODEL IS TOO BIG: Size={} Size Limit={}".format(size, limits.model_size_limit))
        elif time > limits.training_time_limit:
            print(self.rejected_string("[REJECTED]")+": TIME LIMIT EXCEEDED: Time={:.1f} Time Limit={:.1f}".format(time, limits.training_time_limit))
        elif limits.test_accuracy_limit is not None and test_accuracy < limits.test_accuracy_limit:
            print(self.rejected_string("[REJECTED]")+": MODEL DID NOT LEARN: Learn ratio={}/{}".format(test_accuracy, limits.test_accuracy_limit))
        elif limits.train_metric_limit is not None and train_metric > limits.train_metric_limit:
            print(self.rejected_string("[REJECTED]")+": MODEL DID NOT LEARN: Train metric={}/{}".format(train_metric, limits.train_metric_limit))
        elif limits.test_metric_limit is not None and test_metric > limits.test_metric_limit:
            print(self.rejected_string("[REJECTED]")+": MODEL DID NOT GENERELIZE: Test metric={}/{}".format(test_metric, limits.test_metric_limit))
        else:
            r['accepted'] = True
            print(self.accepted_string("[OK]"))

        return r

    def get_tests_with_limits(self, test_set, case_number):
        limits = test_set.get('limits', None)
        tests = test_set['tests']
        for test in tests:
            if ('limits' not in test):
                test['limits'] = limits
        if case_number != -1:
            tests = [test for test in tests if test['number'] == case_number]
        return tests

    def run(self, config, test_set, case_number):
        tests = self.get_tests_with_limits(test_set, case_number)
        speed_calculator = SpeedCalculator()
        time_mult = speed_calculator.calc_linear_time_mult()
        print("Local CPU time mult = {:.2f}".format(time_mult))
        case_results = []
        case_limits = []
        for test_config in tests:
            case_data = self.get_case_data_from_test_config(config, test_config)
            case_result = self.run_case_from_case_data(config, case_data, time_mult)
            case_result = self.evaluate_result(case_data, case_result)
            if case_result['accepted'] == False:
                print("Need more hint??? Ask for hint at Facebook comments")
                return False
            case_limits.append(case_data.get_limits())
            case_results.append(case_result)

        num_cases = float(len(case_results))
        if case_results[0]['testAccuracy'] is not None:
            test_rates = [x['testAccuracy'] for x in case_results]
            test_rate_max = max(test_rates)
            test_rate_mean = sum(test_rates)/len(test_rates)
            test_rate_min = min(test_rates)
            test_limit_mean = sum([x.test_accuracy_limit for x in case_limits])/num_cases
            print("Test rate (max/mean/min/limit) = {:.3f}/{:.3f}/{:.3f}/{:.3f}".format(
                test_rate_max, test_rate_mean, test_rate_min, test_limit_mean))
        step_mean = sum([x['trainingSteps'] for x in case_results])/num_cases
        time_mean = sum([x['trainingTime'] for x in case_results])/num_cases
        size_mean = sum([x['modelSize'] for x in case_results])/num_cases
        time_limit_mean = sum([x.training_time_limit for x in case_limits])/num_cases
        #size_limit_mean = sum([x.model_size_limit for x in case_limits])/num_cases
        print("Average steps = {:.3f}".format(step_mean))
        print("Average time = {:.3f}/{:.3f}".format(time_mean, time_limit_mean))
        print("Average size = {:.3f}".format(size_mean))
        if case_number == -1:
            print(self.accepted_string("[ACCEPTED]")+" you can submit now your score")
            print("Go to https://www.mlisjudge.com to submit your code")
        else:
            print(self.hint_string("[GOOD]")+" test passed, try to run on all tests")

