# The MNIST database of handwritten digits. http://yann.lecun.com/exdb/mnist/
#
# In this problem you need to implement model that will learn to recognize
# handwritten digits
import torch
import torchvision
from ..core.case_data import CaseData

class DataProvider:
    DATA_DIR = './data/data_mnist'

    def __init__(self):
        print("Start data loading...")
        train_dataset = torchvision.datasets.MNIST(
            DATA_DIR, train=True, download=False,
            transform=torchvision.transforms.ToTensor()
        )
        trainLoader = torch.utils.data.DataLoader(train_dataset, batch_size=len(train_dataset))
        test_dataset = torchvision.datasets.MNIST(
            DATA_DIR, train=False, download=False,
            transform=torchvision.transforms.ToTensor()
        )
        test_loader = torch.utils.data.DataLoader(test_dataset, batch_size=len(test_dataset))
        self.train_data = next(iter(trainLoader))
        self.test_data = next(iter(test_loader))
        print("Data loaded")

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
        print(seed, digits)

        train_data = self.__select_data(self.train_data, digits)
        test_data = self.__select_data(self.test_data, digits)

        case_data.set_train_data(train_data)
        case_data.set_test_data(test_data)
        return case_data