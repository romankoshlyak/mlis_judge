
# There are random function from 8 inputs.
# There are random input vector of size 8 * number of voters.
# We calculate function number of voters times and sum result.
# We return 1 if sum > voters/2, 0 otherwise
# We split data in 2 parts, on first part you will train and on second
# part we will test
import numpy as np
import torch
from ..core.case_data import CaseData

class DataProvider:
    def packbits(self, x, bits_count):
        row_count = x.size(0)
        x = x.view(-1, bits_count)
        x = x.byte().numpy()
        x = np.packbits(x, axis=-1)
        x = torch.from_numpy(x).long()
        x = x.view(row_count, -1)
        return x

    def create_data(self, data_size, input_size, input_count_size, seed):
        torch.manual_seed(seed)
        function_size = 1 << input_size
        function_table = torch.ByteTensor(function_size).random_(0, 2)
        function_table2 = reversed(function_table)
        total_input_size = input_size*input_count_size
        data = torch.ByteTensor(data_size, total_input_size).random_(0, 2)
        target = torch.ByteTensor(data_size)
        ind_data = self.packbits(data, input_size)
        function_data = function_table[ind_data]
        sum_data = function_data.sum(dim=1)
        target = sum_data > input_count_size/2

        return (data.float(), target.view(-1, 1).float())

    def create_case_data(self, case):
        input_size = 8
        data_size = (1<<input_size)*32
        input_count_size = case

        data, target = self.create_data(2*data_size, input_size, input_count_size, case)
        return sm.CaseData(case, Limits(), (data[:data_size], target[:data_size]), (data[data_size:], target[data_size:])).set_description("{} inputs per voter and {} voters".format(input_size, input_count_size))

    def create_case_data(self, config):
        case_data = CaseData()
        seed = config['seed']
        data_size = config['dataSize']
        input_size = config['inputSize']
        input_count_size = config['inputCountSize']

        data, target = self.create_data(2*data_size, input_size, input_count_size, seed)
        case_data.set_train_data((data[:data_size], target[:data_size]))
        case_data.set_test_data((data[data_size:], target[data_size:]))
        return case_data