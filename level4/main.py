import pandas
import copy

col_position = 'Position'
col_track = 'Track Name'
col_artist = 'Artist'
col_stream = 'Streams'
col_url = 'URL'
col_date = 'Date'
col_region = 'Region'
col_continent = 'Continent'

def read_data():
    return pandas.read_csv('data.csv')

def question_1(_df):
    df_global = _df[_df[col_region] == 'global']
    df_global_track_stream = df_global[[col_track, col_stream]].groupby(by=col_track).sum()
    tmp = df_global_track_stream.sort_values(by=col_stream, ascending=False)
    print('Top 10 tracks in the global throught year 2017')
    print(tmp[:10].reset_index())

def question_2(_df):
    df_artist = _df[[col_artist, col_stream]].groupby(by=col_artist).sum()
    tmp = df_artist.sort_values(by=col_stream, ascending=False)
    print('Top 10 artists')
    print(tmp[:10].reset_index())

def question_3(_df):
    import json
    with open('countries.json', encoding="utf8") as fin:
        country = json.load(fin)

    def region2continent(region):
        return country[region.upper()]['continent']

    df_copy = copy.deepcopy(_df)
    df_copy['Date'] = pandas.to_datetime(df_copy['Date'])
    mask =  (df_copy['Date'] >= '2017-12-01') & (df_copy['Date'] <= '2017-12-31')
    df_201712 = _df[mask]

    country['GLOBAL'] = {}
    country['GLOBAL']['continent'] = 'global'
    df_201712[col_continent] = df_201712['Region'].apply(region2continent)
    
    df_201712_continent = df_201712[[col_track, col_stream, col_continent]].groupby(col_continent).apply(pandas.DataFrame)

    continents = df_201712[col_continent].unique()
    continents_str_map = {'NA': 'North America', 'EU': 'Europe', 'AS': 'Asia', 'SA': 'South America', 'OC': 'Oceania'}
    for each in continents:
        if each == 'global':
            continue
        this_df = df_201712_continent[ df_201712_continent[col_continent] == each]
        this_df_sorted = this_df.groupby(col_track).sum().sort_values(by=col_stream, ascending=False)
        print('Top 10 tracks for continent %s in December 2017'%continents_str_map[each])
        print(this_df_sorted[:10].reset_index())

def question_4(_df):
    import numpy
    shape_of_you = 'Shape of You'
    df_shape_of_you = _df[ _df[col_track] == shape_of_you]
    days = df_shape_of_you[col_date].unique()

    x_numbers = range(len(days))

    def sortDays(day_str):
        from datetime import datetime
        return datetime.strptime(day_str, '%Y-%m-%d')
    sorted(days, key=sortDays)

    ranks = list()
    stream_counts = list()

    for each_day in days:
        df_day = _df[ _df[col_date] == each_day]

        df_tmp = df_day[[col_track, col_stream]].groupby(by=col_track).sum()
        df_rank = df_tmp.sort_values(by=col_stream, ascending=False).reset_index()
        rank_shape_of_you = numpy.where(df_rank[col_track] == shape_of_you)[0][0] + 1
        stream_counts.append(df_rank.iloc[rank_shape_of_you-1][col_stream])
        ranks.append(rank_shape_of_you)

    import matplotlib.pyplot as plt
    fig, ax1 = plt.subplots()
    ax1.plot(x_numbers, ranks, color='b')
    ax1.set_ylabel('Ranks', color='b')
    ax1.tick_params('y', colors='b')
    ax1.invert_yaxis()
    ax1.set_xlabel('Day')

    ax2 =ax1.twinx()
    ax2.plot(x_numbers, stream_counts, color='r')
    ax2.set_ylabel('Stream counts', color='r')
    ax2.tick_params('y', colors='r')

    plt.tight_layout()
    plt.show()


def main():
    data = read_data()
    question_1(data)
    question_2(data)
    question_3(data)
    question_4(data)

if __name__ == "__main__":
    main()
