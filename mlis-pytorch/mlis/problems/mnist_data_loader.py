from .minst_data_provider import DataProvider

def load_data(self):
    print("Start data loading...")
    train_dataset = torchvision.datasets.MNIST(
        DataProvider.DATA_DIR, train=True, download=True,
        transform=torchvision.transforms.ToTensor()
    )
    print("Data loaded")