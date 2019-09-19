# The MNIST database of handwritten digits. http://yann.lecun.com/exdb/mnist/
#
# In this problem you need to implement model that will learn to recognize
# handwritten digits
import os
import shutil
import torch
import torchvision
from ..core.case_data import CaseData

class DataProvider:
    DATA_DIR = './data/data_mnist'
    MLIS_DATA_DIR = DATA_DIR + '/mlis'
    TRAIN_DATA_DIR = MLIS_DATA_DIR + '/train_data.pt'
    TEST_DATA_DIR = MLIS_DATA_DIR + '/test_data.pt'

    # slow and called during installation
    def prepare_case_data(self, force = False):
        if (force or (not os.path.exists(self.TRAIN_DATA_DIR)) or (not os.path.exists(self.TEST_DATA_DIR))):
            if os.path.exists(self.DATA_DIR):
                shutil.rmtree(self.DATA_DIR)
            print("Loading data...")
            train_dataset = torchvision.datasets.MNIST(
                self.DATA_DIR, train=True, download=True,
                transform=torchvision.transforms.ToTensor()
            )
            train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=len(train_dataset))
            test_dataset = torchvision.datasets.MNIST(
                self.DATA_DIR, train=False, download=True,
                transform=torchvision.transforms.ToTensor()
            )
            test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=len(test_dataset))
            train_data = next(iter(train_loader))
            test_data = next(iter(test_loader))
            print("Saving data...")
            os.makedirs(self.MLIS_DATA_DIR)
            torch.save(train_data, self.TRAIN_DATA_DIR)
            torch.save(test_data, self.TEST_DATA_DIR)
            print("Data prepared")

    def __select_data(self, data, digits):
        data, target = data
        mask = target == -1
        for digit in digits:
            mask |= target == digit
        indices = torch.arange(0,mask.size(0))[mask].long()
        return (torch.index_select(data, dim=0, index=indices), target[mask])

    def create_case_data(self, config):
        case_data = CaseData()
        seed = config['seed']
        digits = config['digits']

        train_data = torch.load(self.TRAIN_DATA_DIR)
        test_data = torch.load(self.TEST_DATA_DIR)
        train_data = self.__select_data(train_data, digits)
        test_data = self.__select_data(test_data, digits)

        case_data.set_train_data(train_data)
        case_data.set_test_data(test_data)
        return case_data