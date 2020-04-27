import torch
from ..core.case_data import CaseData

# There are 2 languages.
class Language:
    def __init__(self, config):
        self.min_words_count = config['minWordsCount']
        self.max_words_count = config['maxWordsCount']
        self.words = config['words']

    def gen_sentences(self, number_of_sentences):
        sentences_length = torch.LongTensor(number_of_sentences).random_(self.min_words_count, self.max_words_count+1)
        total_length = sentences_length.sum().item()
        random_words_index = torch.LongTensor(total_length).random_(0, len(self.words))
        random_words = [self.words[word_index] for word_index in random_words_index.tolist()]
        sentences = []
        start_index = 0
        for sentence_length in sentences_length:
            sentences.append(''.join(random_words[start_index:start_index+sentence_length]))
            start_index += sentence_length
        return sentences
    
    def find_max_length_count(self, sentence):
        length_to_count = [0.0] * (len(sentence)+1)
        max_word_length = max([len(word) for word in self.words])
        words = set(self.words)
        length_to_count[0] = 1.0
        updated = True
        while updated:
            updated = False
            for i in range(len(length_to_count)-1, -1, -1):
                if length_to_count[i] > 0.0:
                    possible_words = sentence[i:i+max_word_length]
                    for word_len in range(1, max_word_length+1):
                        possible_word = possible_words[:word_len]
                        if possible_word in words:
                            length_to_count[i+word_len] += length_to_count[i]

class DataProvider:
    def __reindex_list(self, list_data, list_index):
        return [list_data[index] for index in list_index]

    def __create_data(self, data_size, languages, seed):
        torch.manual_seed(seed)
        language_indexes = torch.LongTensor(data_size).random_(0, len(languages))
        data = []
        target = []
        used_sentences = set()
        for language_index, language in enumerate(languages):
            number_of_sentences = (language_indexes == language_index).sum().item()
            sentences = language.gen_sentences(number_of_sentences)
            new_sentences = set(sentences)
            expected_size = len(used_sentences)+len(new_sentences)
            used_sentences = used_sentences.union(set(sentences))
            if len(used_sentences) != expected_size:
                raise "Not uniq sentence"
            data += sentences
            target += [language_index] * number_of_sentences

        perm = torch.randperm(len(data)).tolist()
        data = self.__reindex_list(data, perm)
        target = self.__reindex_list(target, perm)
        return (data, target)

    def create_case_data(self, config):
        case_data = CaseData()
        # correct seed help generate data faster
        seed = config['seed']
        data_size = config['dataSize']
        language_configs = config['languages']
        languages = [Language(language_config) for language_config in language_configs]
        data, target = self.__create_data(2*data_size, languages, seed)

        case_data.set_train_data((data[:data_size], target[:data_size]))
        case_data.set_test_data((data[data_size:], target[data_size:]))
        return case_data