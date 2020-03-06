import matplotlib.pyplot as plt
import seaborn as sns

class Plotter():
    COLUMN_DELIMITER = ':'
    def __init__(self, results_data):
        self.results_data = results_data

    def show_1d(self, column_index = -1, query = None):
        columns = self.results_data.get_columns()

        df = self.results_data.get_dataframe()
        if query is not None:
            df.query(query, inplace=True)

        if df.shape[0] == 0:
            print('[WARNING] Empty filtered results')
            return

        if column_index == -1:
            uniq_per_column = df[columns].nunique()
            for i, r in enumerate(uniq_per_column):
                if r > 1:
                    column_index = i
                    break
        x_column = columns.pop(column_index)
        col_column = 'col:'+Plotter.COLUMN_DELIMITER.join(columns)
        df[col_column] = df.apply (lambda row: Plotter.COLUMN_DELIMITER.join([str(row[c]) for c in columns]), axis=1)
        sns.set(style="darkgrid")
        sns.relplot(x=x_column, y="value", hue="name", col=col_column, col_wrap=2, kind="line", markers=True, data=df)
        plt.show()
