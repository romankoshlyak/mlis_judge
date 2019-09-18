# HelloXor is a HelloWorld of Machine Learning.
import torch
from ..core.case_data import CaseData

class DataProvider:
    def __create_data(self):
        data = torch.FloatTensor([
            [0.0, 0.0],
            [0.0, 1.0],
            [1.0, 0.0],
            [1.0, 1.0]
            ])
        target = torch.FloatTensor([
            [0.0],
            [1.0],
            [1.0],
            [0.0]
            ])
        return (data, target)

    def create_case_data(self, config):
        case_data = CaseData()
        data, target = self.__create_data()
        case_data.set_train_data((data, target))
        case_data.set_test_data((data, target))
        return case_data
