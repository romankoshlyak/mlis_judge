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
    def __create_data(self, data_size, input_size, input_count_size, seed):
        torch.manual_seed(seed)
        function_size = 1 << input_size
        total_input_size = input_size*input_count_size

        function_table = torch.ByteTensor(function_size).random_(0, 2)
        data = torch.ByteTensor(data_size, total_input_size).random_(0, 2)
        target = torch.ByteTensor(data_size)

        ind_data_bits = data.view(data_size*input_count_size, input_size).long()
        ind_data = torch.LongTensor(data_size*input_count_size).zero_()
        for i in range(input_size):
            ind_data = (ind_data << 1) | (ind_data_bits[:,i] & 1)
        ind_data = ind_data.view(data_size, input_count_size)
        function_data = function_table[ind_data]
        sum_data = function_data.sum(dim=1)
        target = sum_data > input_count_size/2

        return (data.float(), target.view(-1, 1).float())

    def create_case_data(self, config):
        case_data = CaseData()
        seed = config['seed']
        data_size = config['dataSize']
        input_size = config['inputSize']
        input_count_size = config['inputCountSize']

        data, target = self.__create_data(2*data_size, input_size, input_count_size, seed)
        case_data.set_train_data((data[:data_size], target[:data_size]))
        case_data.set_test_data((data[data_size:], target[data_size:]))
        return case_data