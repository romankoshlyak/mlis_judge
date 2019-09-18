# You need to learn a function with n inputs.
# For given number of inputs, we will generate random function.
# Your task is to learn it
import random
import torch
from ..core.case_data import CaseData

class DataProvider:
    def create_data(self, input_size, seed):
        random.seed(seed)
        data_size = 1 << input_size
        data = torch.FloatTensor(data_size, input_size)
        target = torch.FloatTensor(data_size)
        for i in range(data_size):
            for j in range(input_size):
                input_bit = (i>>j)&1
                data[i,j] = float(input_bit)
            target[i] = float(random.randint(0, 1))
        return (data, target.view(-1, 1))

    def create_case_data(self, config):
        case_data = CaseData()

        seed = config['seed']
        input_size = config['inputSize']
        data, target = self.create_data(input_size, seed)
        case_data.set_train_data((data, target))
        case_data.set_test_data((data, target))
        return case_data
