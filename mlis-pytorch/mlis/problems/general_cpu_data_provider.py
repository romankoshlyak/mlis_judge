# You need to learn a function with n inputs.
# For given number of inputs, we will generate random function.
# Your task is to learn it
import torch
from ..core.case_data import CaseData

class DataProvider:
    def __create_data(self, input_size, seed):
        torch.manual_seed(seed)
        data_size = 1 << input_size

        data = torch.ByteTensor(data_size, input_size)
        target = torch.ByteTensor(data_size).random_(0, 2)

        ind = torch.arange(data_size)
        for i in range(input_size):
            data[:,i] = (ind >> i)&1

        return (data.float(), target.view(-1, 1).float())

    def create_case_data(self, config):
        case_data = CaseData()
        seed = config['seed']
        input_size = config['inputSize']
        data, target = self.__create_data(input_size, seed)
        case_data.set_train_data((data, target))
        case_data.set_test_data((data, target))
        return case_data
