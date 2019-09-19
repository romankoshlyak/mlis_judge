import torch
import torch.nn as nn
import torch.optim as optim

class TutorialModel(nn.Module):
    def __init__(self):
        super(TutorialModel, self).__init__()
        self.linear1 = nn.Linear(1, 8)
        self.linear2 = nn.Linear(8, 1)

    def forward(self, x):
        x = self.linear1(x)
        x = torch.sigmoid(x)
        x = self.linear2(x)
        return x

    def calc_error(self, output, target):
        # This is loss function
        return ((output-target)**2).mean()

class Solution():
    # Return trained model
    def train_model(self, train_data, train_target, context):
        # Model represent our neural network
        model = TutorialModel()
        # Optimizer used for training neural network
        optimizer = optim.SGD(model.parameters(), lr=0.3)
        while context.step <= 5000:
            # Report step, so we know how many steps
            context.increase_step()
            # model.parameters()...gradient set to zero
            optimizer.zero_grad()
            # evaluate model => model.forward(data)
            output = model(train_data)
            # calculate error
            error = model.calc_error(output, train_target)
            # Print statistics
            if context.step % 1000 == 0:
                print("Step = {} Error = {}".format(context.step, error.item()))
            # calculate deriviative of model.forward() and put it in model.parameters()...gradient
            error.backward()
            # update model: model.parameters() -= lr * gradient
            optimizer.step()
        return model