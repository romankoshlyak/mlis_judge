# You need to approximate y=f(x)
import torch
from ..core.case_data import CaseData

class DataProvider:
    def __create_data(self, seed, x_start, x_end, y_min, y_max, y_noise, number_of_segments, number_of_points_per_segment):
        torch.manual_seed(seed)
        segment_distances = torch.FloatTensor(number_of_segments+1).uniform_(0.0, 1.0)
        segment_distances[0] = 0.0
        segment_points_x = segment_distances.cumsum(dim=0)
        segment_points_x = segment_points_x*((x_end-x_start)/segment_points_x[-1])+x_start
        segment_points_y = torch.FloatTensor(number_of_segments+1).uniform_(y_min, y_max)
        data = torch.FloatTensor(number_of_segments*number_of_points_per_segment)
        target = torch.FloatTensor(number_of_segments*number_of_points_per_segment).uniform_(-y_noise, y_noise)
        for segment_id in range(number_of_segments):
            segments_points_start = segment_id*number_of_points_per_segment
            segments_points_end = segments_points_start + number_of_points_per_segment
            x_start = segment_points_x[segment_id]
            x_end = segment_points_x[segment_id+1]
            y_start = segment_points_y[segment_id]
            y_end = segment_points_y[segment_id+1]
            p = torch.FloatTensor(number_of_points_per_segment).uniform_(0.0, 1.0)
            x = p*(x_end-x_start)+x_start
            y = p*(y_end-y_start)+y_start
            data[segments_points_start:segments_points_end] = x
            target[segments_points_start:segments_points_end] += y
        perm = torch.randperm(data.size(0))
        data = data[perm]
        target = target[perm]

        return (data.view(-1, 1), target.view(-1, 1))

    def create_case_data(self, config):
        case_data = CaseData()
        x_start = -3.0
        x_end = 3.0
        y_min = -2.0
        y_max = 2.0
        y_noise = 0.1
        seed = config['seed']
        number_of_segments = config['numberOfSegments']
        number_of_points_per_segment = config['numberOfPointsPerSegment']
        data, target = self.__create_data(seed, x_start, x_end, y_min, y_max, y_noise, number_of_segments, 2*number_of_points_per_segment)
        data_size = data.size(0)
        case_data.set_type(case_data.REGRESSION)
        case_data.set_train_data((data[:data_size//2], target[:data_size//2]))
        case_data.set_test_data((data[data_size//2:], target[data_size//2:]))
        return case_data
