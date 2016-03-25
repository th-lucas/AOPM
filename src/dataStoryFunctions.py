######################################
###          DATA STORY            ###
######################################

### Imports ###
import os
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.ticker as mtick
import scipy.stats as sstats
import time
import re

from matplotlib import gridspec
from pyechonest import config
from pyechonest import song
from pyechonest import artist
from pandas.io.json import json_normalize

# Geopy
from geopy.geocoders import Nominatim

### Global variables ###
ARTIST_DICTIONARY = {
        "Pink": "P!nk",
        "The Jackson 5": "The Jacksons",
        "Puff Daddy": "Diddy",
        "P. Diddy": "Diddy",
        "Snoop Doggy Dogg": "Snoop Dogg",
        "Jon Bon Jovi": "Bon Jovi",
        "'N Sync": "NSync",
        "Lil' Kim": "Lil Kim",
        "Soulja Boy Tell 'Em": "Soulja Boy",
        "The B-52s": "B-52",
        "John Cougar": "John Mellencamp",
        "John Cougar Mellencamp": "John Mellencamp",
        "The SOS Band": "The S.O.S Band",
        "PSY": "Psy",
        "Force MDs": "Force MD's",
        "GQ": "G.Q.",
        "Earth": "Earth, Wind & Fire",
        "Ricky Nelson": "Rick Nelson",
        "Ferrante": "Ferrante and Teicher",
        "Little Stevie Wonder": "Stevie Wonder",
        "Ike": "Ike Turner",
        "Zac Brown Band": "Zac Brown",
        "Lil' Bow Wow": "Bow Wow",
        "Kool": "Kool & the Gang",
        "The Guess Who": "Guess Who",
        "The Four Tops": "Four Tops",
        "The Bee Gees": "Bee Gees",
        "Allen": "Kris Allen",
        "The Bill Black Combo": "Bill Black",
        "Ray Parker": "Ray Parker Jr.",
        "Billy Davis": "Billy Davis Jr.",
        "M_a": "Mya",
        "Daryl Hall & John Oates": "Hall & Oates",
        "or Tyga": "Tyga",
        "K-Ci & JoJo /": "K-Ci & JoJo"
    }

MULTIPLE_ARTIST_LIST = [
    "Earth, Wind & Fire",
    "Peter, Paul and Mary",
    "Dino, Desi & Billy",
    "Blood, Sweat & Tears",
    "Ray Parker, Jr.",
    "Billy Davis, Jr.",
    "Sammy Davis, Jr.",
    "Crosby, Stills & Nash",
    "Hamilton, Joe Frank & Reynolds",
    "Dion and the Belmonts",
    "Ferrante & Teicher",
    "Hank Ballard and The Midnighters",
    "Skip & Flip",
    "Johnny and the Hurricanes"
    "Dick and Dee Dee",
    "Shep and the Limelites",
    "Little Caesar & the Romans",
    "Rosie and the Originals",
    "Joey Dee and the Starliters",
    "Jay and the Americans",
    "Booker T. & the M.G.'s",
    "Billy Joe and the Checkmates",
    "Ronnie & the Hi-Lites",
    "Paul & Paula",
    "Commander Cody and His Lost Planet Airmen",
    "Dr. Hook & The Medicine Show",
    "Brenda & the Tabulations",
    "Maurice Williams and the Zodiacs",
    "Love and Rockets",
    "Huey Lewis and the News",
    "Wing and a Prayer Fife and Drum Corps",
    "Peter and Gordon",
    "Gerry and the Pacemakers",
    "Tommy James and the Shondells",
    "Big Brother and the Holding Company",
    "Gary Lewis and the Playboys",
    "Mac and Katie Kissoon",
    "Mel and Tim",
    "Derek and the Dominos",
    "Tony Orlando and Dawn",
    "Prince and The Revolution",
    "Lisa Lisa and Cult Jam",
    "Prince and The New Power Generation",
    "Franke and the Knockouts",
    "Joan Jett and the Blackhearts",
    "Katrina and the Waves",
    "Love and Rockets",
    "Bruce Hornsby and the Range",
    "Evan and Jaron",
    "Marky Mark and the Funky Bunch",
    "Jive Bunny and the Mastermixers",
    "Tom Petty and the Heartbreakers",
    "B-Rock and the Bizz",
    "Marky Mark and the Funky Bunch",
    "Billy Vera and the Beaters"
]


### Functions creation ###

# Loads all the credentials for the lasfm annd echonest APIs
def load_secrets():
    secrets_file = "secrets.yaml"
    if os.path.isfile(secrets_file):
        import yaml  # pip install pyyaml
        with open(secrets_file, "r") as f: 
            doc = yaml.load(f)
    else:
        doc = {}
        print "The configuration file with the credentials for the APIs is missing!"
        print "You will not be able to use the EchoNest and the LastFM APIs."
    return doc


# Creation of a list of integers corresponding to all the years we are interested in
def create_years_list(start_year, end_year):
    years = []
    for i in range(start_year + 1, end_year + 1):
        years.append(i)
    return years

# Creation of a global dataframe from the CSV files
# This df has a new column named "year" to be able to do the filtering
def create_billboard_df_from_CSV(start_year, years):
    billboard_df = pd.read_csv('CSV_data/Billboard-charts/Billboard_Year-End_Hot_100_singles_of_' + str(start_year) + '.csv')
    billboard_df['Year'] = pd.Series(start_year, index = billboard_df.index)

    df_list = []
    for year in years:
        # Open CSV file
        billboard_current_year = pd.read_csv('CSV_data/Billboard-charts/Billboard_Year-End_Hot_100_singles_of_' + str(year) + '.csv')
        billboard_current_year['Year'] = pd.Series(year, index = billboard_current_year.index)
        df_list.append(billboard_current_year)

    # Creation of a big data frame containing all the data
    return billboard_df.append(df_list, ignore_index = True)

def create_tableau20_RGB_code():
    # These are the "Tableau 20" colors as RGB + pale gray
    tableau20 = [(31, 119, 180), (174, 199, 232), (255, 127, 14), (255, 187, 120),
                 (44, 160, 44), (152, 223, 138), (214, 39, 40), (255, 152, 150),
                 (148, 103, 189), (197, 176, 213), (140, 86, 75), (196, 156, 148),
                 (227, 119, 194), (247, 182, 210), (127, 127, 127), (199, 199, 199),
                 (188, 189, 34), (219, 219, 141), (23, 190, 207), (158, 218, 229), (248,248,248)]

    # Scale the RGB values to the [0, 1] range, which is the format matplotlib accepts.
    for i in range(len(tableau20)):
        r, g, b = tableau20[i]
        tableau20[i] = (r / 255., g / 255., b / 255.)

    return tableau20

# Colors
colors_list_tableau = create_tableau20_RGB_code()

# graph_type is a string which can be {'Artist(s)', 'Title'}
def create_stats_lists(graph_type, years, billboard_df):
    if graph_type not in ['Artist(s)', 'Title']:
        raise NameError('Incorrect value of parameter graph_type')

    # Put the different values in lists as it is easier to plot
    min_values = []
    max_values = []
    mean_values = []
    number1_values = []
    for year in years:
        min_values.append(billboard_df[billboard_df["Year"] == year][graph_type].str.len().min())
        max_values.append(billboard_df[billboard_df["Year"] == year][graph_type].str.len().max())
        mean_values.append(billboard_df[billboard_df["Year"] == year][graph_type].str.len().mean())
        number1_values.append(billboard_df[(billboard_df["Year"] == year) & (billboard_df["Num"] == 1)][graph_type].str.len().item())

    return (min_values, max_values, mean_values, number1_values)

def create_name_length_plot(graph_type, billboard_df, years, start_year, end_year,
                     ylabel, plot_title, save_title_path, legend_loc):

    tableau20 = create_tableau20_RGB_code()
    min_values, max_values, mean_values, number1_values = create_stats_lists(graph_type, years, billboard_df)

    # Plot size
    plt.figure(figsize=(12, 9))

    # Remove the plot frame lines
    ax = plt.subplot(111)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)

    # Ensure that the axis ticks only show up on the bottom and left of the plot.
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()

    # Limit the range of the plot to only where the data is.
    plt.ylim(0, max(max_values) + 5)
    plt.xlim(start_year - 2, end_year + 2)

    # Make sure axis ticks are large enough to be easily read.
    plt.xticks(range(start_year, end_year, 10), fontsize=14)
    plt.yticks(range(0, max(max_values) + 5, 10), fontsize=14)

    # Make sure axis labels are large enough to be easily read as well.
    plt.ylabel(ylabel, fontsize=16)

    # Use matplotlib's fill_between() call to fill the area between the different lines
    plt.fill_between(years, min_values, max_values, color = tableau20[len(tableau20) - 1])

    # Plot the mean, min, max and number 1 values
    plt.plot(years, mean_values, marker = 'o', linestyle = '--', color = tableau20[0], label = "mean")
    plt.plot(years, min_values, marker = 'v', linestyle = '--', color = tableau20[2], label = "min")
    plt.plot(years, max_values, marker = '^', linestyle = '--', color = tableau20[4], label = "max")
    plt.plot(years, number1_values, '*', color = tableau20[6], label = "number1")

    # Plot title
    plt.title(plot_title, fontsize=22)

    # Legend
    plt.legend(loc=legend_loc)

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")

def create_bar_chart_featurings(x, y, xlabel, ylabel, title, save_title_path, n1_list):
    plt.figure(figsize=(12, 9))

    # Axis properties
    ax = plt.subplot(111)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()
    plt.xticks(fontsize=14)
    plt.yticks(fontsize=14)

    # Axis labels
    plt.xlabel(xlabel, fontsize=16)
    plt.ylabel(ylabel, fontsize=16)

    # Plot title
    plt.title(title, fontsize=22)

    color_list = []
    for value in x:
        if value in n1_list:
            color_list.append(colors_list_tableau[3])
        else:
            color_list.append(colors_list_tableau[0])

    # Bar chart creation
    plt.bar(x, y, color=color_list)

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")

def create_entries_by_unique_artist(billboard_df, start_year, end_year):
    billboard_df = billboard_df[(billboard_df["Year"] >= start_year) & (billboard_df["Year"] <= end_year)]
    billboard_df_temp = pd.DataFrame.copy(billboard_df)

    billboard_unique_artists = []
    billboard_songs = []
    billboard_years = []
    billboard_rank = []

    for index_artist, row in billboard_df_temp.iterrows():
        artist = row["Artist(s)"]
        title = row["Title"]
        year = row["Year"]
        rank = row["Num"]
        if artist == "Earth, Wind & Fire & The Emotions":
            billboard_unique_artists.append("Earth, Wind & Fire")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("The Emotions")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue
        elif artist == "Grover Washington, Jr. & Bill Withers":
            billboard_unique_artists.append("Grover Washington, Jr.")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Bill Withers") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue
        elif artist == "Dionne and Friends (Dionne Warwick, Gladys Knight, Elton John and Stevie Wonder)":
            billboard_unique_artists.append("Dionne Warwick")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Gladys Knight") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Elton John")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Stevie Wonder") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue
        elif artist == "Allen, KrisKris Allen":
            billboard_unique_artists.append("Kris Allen") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue
        elif artist == "Crosby, Stills, Nash & Young":
            billboard_unique_artists.append("Crosby, Stills & Nash") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue 
        elif artist == "Neil Sedaka & Elton John":
            billboard_unique_artists.append("Neil Sedaka")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Elton John") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue
        elif artist == "Neil & Dara Sedaka":
            billboard_unique_artists.append("Neil Sedaka")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Dara Sedaka") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
        elif artist == "Donna Summer and Brooklyn Dreams":
            billboard_unique_artists.append("Donna Summer")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Brooklyn Dreams") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
        elif artist == "Donny and Marie Osmond":
            billboard_unique_artists.append("Donny Osmond")
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            billboard_unique_artists.append("Marie Osmond") 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
        elif artist in MULTIPLE_ARTIST_LIST:
            billboard_unique_artists.append(artist) 
            billboard_rank.append(rank)
            billboard_songs.append(title)
            billboard_years.append(year)
            continue   
        else:
            artist_comma_splitted = artist.split(", ")
            for item in artist_comma_splitted:
                if (item == "") or (item == " "):
                    continue
                elif item in MULTIPLE_ARTIST_LIST:
                    billboard_unique_artists.append(item) 
                    billboard_rank.append(rank)
                    billboard_songs.append(title)
                    billboard_years.append(year)
                    continue
                item_featuring_splitted = item.split(" featuring ")
                for item2 in item_featuring_splitted:
                    if (item2 == "") or (item2 == " "):
                        continue
                    
                    if item2 in MULTIPLE_ARTIST_LIST:
                        billboard_unique_artists.append(item2) 
                        billboard_rank.append(rank)
                        billboard_songs.append(title)
                        billboard_years.append(year)
                        continue
                    elif (year >= 1982) & ((" and " in item2) or (item2.startswith("and "))):
                        if item2.startswith("and "):
                            item_and_splitted = item2.split("and ")
                        else:
                            item_and_splitted = item2.split(" and ")

                        for item3 in item_and_splitted:
                            if (item3 == "") or (item3 == " "):
                                continue
                            
                            if item3 in ARTIST_DICTIONARY:
                                billboard_unique_artists.append(ARTIST_DICTIONARY[item3])
                            else:
                                billboard_unique_artists.append(item3)
                            billboard_rank.append(rank)
                            billboard_songs.append(title)
                            billboard_years.append(year)
                    else:
                        if item2 in ARTIST_DICTIONARY:
                            billboard_unique_artists.append(ARTIST_DICTIONARY[item2])
                        else:
                            billboard_unique_artists.append(item2)
                        billboard_rank.append(rank)
                        billboard_songs.append(title)
                        billboard_years.append(year)

    data = {"Rank": billboard_rank, "Artist(s)": billboard_unique_artists, "Title": billboard_songs, "Year": billboard_years}
    unique_artist_df = pd.DataFrame(data, columns = ["Rank", "Artist(s)", "Title", "Year"])
    return unique_artist_df


def create_entries_count_by_artist(unique_artist_df, start_year, end_year):
    unique_artist_df_temp = pd.DataFrame.copy(unique_artist_df[(unique_artist_df['Year'] >= start_year) & (unique_artist_df['Year'] <= end_year)])

    count_series = unique_artist_df_temp.groupby('Artist(s)')['Artist(s)'].transform('count')
    unique_artist_df_count = pd.concat([unique_artist_df_temp['Artist(s)'], count_series], axis=1,
                                           keys=['Artist(s)', 'Counts'])
    unique_artist_df_average_rank = pd.concat([unique_artist_df_temp['Artist(s)'], unique_artist_df_temp['Rank']], axis=1,
                                           keys=['Artist(s)', 'Rank'])

    unique_artist_df_count = unique_artist_df_count.groupby('Artist(s)').count().reset_index()
    unique_artist_df_average_rank = unique_artist_df_average_rank.groupby("Artist(s)").mean().reset_index()

    unique_artist_df_count_and_rank = unique_artist_df_count.merge(unique_artist_df_average_rank, on="Artist(s)")

    unique_artist_df_count_and_rank["List of songs"] = ""
    unique_artist_df_count_and_rank["Years of presence"] = 0
    for year in unique_artist_df_temp['Year']:
        unique_artist_df_count_and_rank[year] = 0

    for index_artist, row in unique_artist_df_temp.iterrows():
        artist_name = row["Artist(s)"]
        year = row["Year"]
        title = row["Title"]
        rank = row["Rank"]
        unique_artist_index = unique_artist_df_count_and_rank[unique_artist_df_count_and_rank['Artist(s)'] == artist_name].index.tolist()[0]
        if unique_artist_df_count_and_rank.loc[unique_artist_index, year] == 0:
            unique_artist_df_count_and_rank.loc[unique_artist_index, "Years of presence"] += 1
        unique_artist_df_count_and_rank.loc[unique_artist_index, year] += 1
        unique_artist_df_count_and_rank.loc[unique_artist_index, "List of songs"] += '{"title":"' +  title + '","year":"' + str(year) + '","rank":"' + str(rank) + '"},-,'

    unique_artist_df_count_and_rank["List of songs"] = unique_artist_df_count_and_rank["List of songs"].str[:-3]

    # We sort by "Counts" and then by "Rank" so that if two artists have the same number of songs,
    # the artist with the lowest average rank will come first.
    return unique_artist_df_count_and_rank.sort_values(['Counts', 'Rank'], ascending = [0, 1])

def create_histogram_nb_entries(counts_col, xlabel, ylabel, title, save_title_path):
    plt.figure(figsize=(12, 9))

    # Axis properties
    ax = plt.subplot(111)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()
    plt.xticks(fontsize=14)
    plt.yticks(fontsize=14)

    # Axis labels
    plt.xlabel(xlabel, fontsize=16)
    plt.ylabel(ylabel, fontsize=16)

    # Plot title
    plt.title(title, fontsize=22)

    n, bins, patches = plt.hist(counts_col, 10, normed=1, facecolor='green', alpha=0.5)

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")

def create_cumulative_counts_df(billboard_df_artist_count):
    counts_col = billboard_df_artist_count.sort_values(['Counts'], ascending = 0)["Counts"]
    cumulative_count = []
    temp = 0
    for count in counts_col:
        temp += count
        cumulative_count.append(temp)

    index = range(1, len(cumulative_count) + 1)
    data = {"Index": index, "Cumulative Count": cumulative_count}
    cumulative_count_df = pd.DataFrame(data, columns = ["Index", "Cumulative Count"])
    return cumulative_count_df

def plot_cumulative_distribution_function(cumulative_count_df, xlabel, ylabel, title, save_title_path):
    plt.figure(figsize=(12, 9))

    # Axis properties
    ax = plt.subplot(111)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()
    plt.xticks(fontsize=14)
    plt.yticks(fontsize=14)

    # Axis labels
    plt.xlabel(xlabel, fontsize=16)
    plt.ylabel(ylabel, fontsize=16)

    # Limit the range of the plot to only where the data is.
    plt.ylim(0, max(cumulative_count_df["Cumulative Count"]) + 5)
    plt.xlim(1, max(cumulative_count_df["Index"]) + 2)

    # Plot title
    plt.title(title, fontsize=22)

    # Line chart creation
    plt.plot(cumulative_count_df["Index"], cumulative_count_df["Cumulative Count"], color="#3F5D7D")

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")

def create_cumulative_counts_reverse_df(billboard_df_artist_count):
    counts_col_reverse = billboard_df_artist_count.sort_values(['Counts'], ascending = 1)["Counts"]
    cumulative_count_reverse = []
    temp = 0
    cumulative_count_reverse.append(temp)
    for count in counts_col_reverse:
        temp += count
        cumulative_count_reverse.append(temp)

    data = {"Cumulative Count Reverse": cumulative_count_reverse}
    cumulative_count_reverse_df = pd.DataFrame(data, columns = ["Cumulative Count Reverse"])
    return cumulative_count_reverse_df

def plot_lorenz_curve(cumulative_count_reverse_df, total_nb_songs, total_nb_artists, xlabel, ylabel, title, save_title_path):
    plt.figure(figsize=(12, 9))

    # Axis properties
    fmt = '%.0f%%' # Format you want the ticks, e.g. '40%'
    ax = plt.subplot(111)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()
    xticks = mtick.FormatStrFormatter(fmt)
    yticks = mtick.FormatStrFormatter(fmt)
    ax.xaxis.set_major_formatter(xticks)
    ax.yaxis.set_major_formatter(yticks)
    plt.xticks(fontsize=14)
    plt.yticks(fontsize=14)

    # Axis labels
    plt.xlabel(xlabel, fontsize=16)
    plt.ylabel(ylabel, fontsize=16)

    # Plot title
    plt.title(title, fontsize=22)

    # x axis values normalized
    x_values_normalized = [i/ float(total_nb_artists) * 100 for i in range(0, total_nb_artists + 1)]

    # y axis values normalized
    y_values_normalized = [i/ float(total_nb_songs) * 100 for i in cumulative_count_reverse_df["Cumulative Count Reverse"]]

    # Line chart creation
    plt.plot(x_values_normalized, y_values_normalized)

    # Equity line
    plt.plot(x_values_normalized, x_values_normalized, color="#3F5D7D")

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")


def plot_multiple_lorenz_curves(billboard_df, start_year, end_year, interval, step,
                                    xlabel, ylabel, title, save_title_path, subplot):

    if not subplot:
        fig = plt.figure(figsize=(12, 15))
        nb_plots = (end_year - start_year) / step
        if nb_plots > 1:
            gs = gridspec.GridSpec(nb_plots / 2, 2)
        else:
            gs = gridspec.GridSpec(1, 1)
    else:
        fig = plt.figure(figsize=(12, 9))

    years_range = range(start_year, end_year - step, step)

    if subplot:
        last_year = years_range[-1] + step
        if last_year <= end_year:
            years_range.append(last_year)

    for year in years_range:
        if year + interval <= end_year:
            billboard_df_artist_count = create_entries_count_by_artist(billboard_df, year, year + interval)
            upper_bound = year + interval - 1
        else:
            billboard_df_artist_count = create_entries_count_by_artist(billboard_df, year, end_year)
            upper_bound = end_year
        cumulative_count_reverse_df = create_cumulative_counts_reverse_df(billboard_df_artist_count)
        total_nb_songs = cumulative_count_reverse_df.tail(1)["Cumulative Count Reverse"].tolist()[0]
        total_nb_artists = cumulative_count_reverse_df.tail(1)["Cumulative Count Reverse"].index.tolist()[0]

        fmt = '%.0f%%' # Format you want the ticks, e.g. '40%'
        if subplot:
            ax = plt.subplot(111)
        else:
            ax = fig.add_subplot(gs[years_range.index(year) / 2, years_range.index(year) % 2])
        ax.spines["top"].set_visible(False)
        ax.spines["right"].set_visible(False)
        ax.get_xaxis().tick_bottom()
        ax.get_yaxis().tick_left()
        xticks = mtick.FormatStrFormatter(fmt)
        yticks = mtick.FormatStrFormatter(fmt)
        ax.xaxis.set_major_formatter(xticks)
        ax.yaxis.set_major_formatter(yticks)

        # Axis labels
        plt.xlabel(xlabel, fontsize=12)
        plt.ylabel(ylabel, fontsize=12)           

         # x axis values normalized
        x_values_normalized = [i/ float(total_nb_artists) * 100 for i in range(0, total_nb_artists + 1)]

        # y axis values normalized
        y_values_normalized = [i/ float(total_nb_songs) * 100 for i in cumulative_count_reverse_df["Cumulative Count Reverse"]]

        # Line chart creation
        plt.plot(x_values_normalized, y_values_normalized, label = str(year) + " - " + str(upper_bound))

        if not subplot:
            # Title
            plt.title(title + " " + str(year) + " - " + str(upper_bound), fontsize=14)

            # Equity line
            plt.plot(x_values_normalized, x_values_normalized, color="#3F5D7D")

            gs.update(wspace=0.5, hspace=0.8)

    if subplot:
        # Title
        plt.title(title + "s for each decade between " + str(start_year) + " and " + str(end_year), fontsize=14)

        # Equity line
        plt.plot(x_values_normalized, x_values_normalized, color="#3F5D7D")

        # Legend
        plt.legend(loc = 2)

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")


def calculate_gini_coefficient(billboard_df, start_year, end_year):
    billboard_df_artist_count = create_entries_count_by_artist(billboard_df, start_year, end_year)
    total_nb_artists = billboard_df_artist_count["Artist(s)"].count()
    mean = billboard_df_artist_count["Counts"].mean()
    rank = range(1, total_nb_artists + 1)
    sum_product = sum(billboard_df_artist_count["Counts"] * rank)

    g = (total_nb_artists + 1) / float(total_nb_artists - 1) - (2 / (total_nb_artists * (total_nb_artists - 1) * mean)) * sum_product
    return g

def calculte_gini_per_year(billboard_df, start_year, end_year, interval, step):
    years = []
    gini = []
    years_range = range(start_year, end_year - step + 1, step)
    last_year = years_range[-1] + step
    if last_year <= end_year:
        years_range.append(last_year)

    for year in years_range:
        if year + interval <= end_year:
            upper_bound = year + interval
        else:
            upper_bound = end_year
        if interval > 1:
            years.append(str(year) + " - " + str(upper_bound))
        else:    
            years.append(year)
        gini.append(calculate_gini_coefficient(billboard_df, year, upper_bound))

    data = {"Year(s)": years, "Gini Coefficient": gini}
    gini_coefficient_df = pd.DataFrame(data, columns = ["Year(s)", "Gini Coefficient"])
    return gini_coefficient_df  

def plot_gini_coefficient(gini_coefficient_df, xlabel, ylabel, title, save_title_path):
    plt.figure(figsize=(12, 9))

    # Axis properties
    ax = plt.subplot(111)
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.get_xaxis().tick_bottom()
    ax.get_yaxis().tick_left()
    plt.yticks(fontsize=12)

    # Axis labels
    plt.xlabel(xlabel, fontsize=16)
    plt.ylabel(ylabel, fontsize=16)

    # Plot title
    plt.title(title, fontsize=22)

    # x axis values can be strings, we need to map this to integer to be able to plot them
    years_index = gini_coefficient_df["Year(s)"].index.tolist()

    # Limit the range of the plot to only where the data is.
    plt.xlim(years_index[0] - 2, years_index[len(years_index) - 1] + 2)

    # Bar chart creation
    plt.bar(years_index, gini_coefficient_df["Gini Coefficient"], color = colors_list_tableau[0], align='center')
    plt.xticks(years_index, gini_coefficient_df["Year(s)"], fontsize = 12, rotation = 70)

    # Save the figure as a PNG.
    plt.savefig(save_title_path, bbox_inches="tight")


# EchoNest API functions

def add_items_to_billboard_df_artist_count(billboard_df_artist_count, items_to_add):
    billboard_df_temp = pd.DataFrame.copy(billboard_df_artist_count)
    for item in items_to_add:
        billboard_df_temp[item] = ""

    count_access_api = 0
    for artist_name in billboard_df_artist_count["Artist(s)"]:
        count_access_api += 1
        if count_access_api >= 120:
            time.sleep(60)
            count_access_api = 0
        try:    
            current_artist = artist.Artist(artist_name)
            for i, item in enumerate(items_to_add):
                count_access_api += 1
                if count_access_api >= 120:
                    time.sleep(60)
                    count_access_api = 0
                index_artist = billboard_df_artist_count[billboard_df_artist_count["Artist(s)"] == artist_name].index.tolist()[0]
                billboard_df_temp.loc[index_artist, item] = getattr(current_artist, item)
        except:
            print artist_name
            continue

    billboard_df_temp.to_csv('CSV_data/billboard_df_artist_count_with_additional_items.csv', sep=',')        
    return billboard_df_temp

def create_lead_artist_column(billboard_df):
    
    billboard_df_temp = pd.DataFrame.copy(billboard_df)
    billboard_df_temp["Lead Artist(s)"] = billboard_df_temp["Artist(s)"].str.split(" featuring ").str.get(0)
    billboard_df_temp["Lead Artist(s)"] = billboard_df_temp["Lead Artist(s)"].str.split(" and ").str.get(0)
    billboard_df_temp["Lead Artist(s)"] = billboard_df_temp["Lead Artist(s)"].str.split(" & ").str.get(0)
    billboard_df_temp["Lead Artist(s)"] = billboard_df_temp["Lead Artist(s)"].str.split(" with ").str.get(0)
    billboard_df_temp["Lead Artist(s)"] = billboard_df_temp["Lead Artist(s)"].str.split(", ").str.get(0)

    for index_artist, row in billboard_df_temp.iterrows():
        artist_name = row["Lead Artist(s)"]
        if artist_name in ARTIST_DICTIONARY:
            billboard_df_temp.loc[index_artist, "Lead Artist(s)"] = ARTIST_DICTIONARY[artist_name]

    return billboard_df_temp



def add_songs_characteristics_to_df(billboard_df, save_title_path):
    start_time = time.time()

    billboard_df_temp = create_lead_artist_column(billboard_df)

    billboard_df_temp["latitude"] = ""
    billboard_df_temp["longitude"] = ""
    billboard_df_temp["location"] = ""
    billboard_df_temp["song_type_0"] = ""
    billboard_df_temp["song_type_1"] = ""
    billboard_df_temp["song_type_2"] = ""
    billboard_df_temp["song_discovery"] = ""
    billboard_df_temp["acousticness"] = ""
    billboard_df_temp["danceability"] = ""
    billboard_df_temp["duration"] = ""
    billboard_df_temp["energy"] = ""
    billboard_df_temp["instrumentalness"] = ""
    billboard_df_temp["key"] = ""
    billboard_df_temp["liveness"] = ""
    billboard_df_temp["loudness"] = ""
    billboard_df_temp["mode"] = ""
    billboard_df_temp["speechiness"] = ""
    billboard_df_temp["tempo"] = ""
    billboard_df_temp["valence"] = ""

    fail_df = pd.DataFrame()
    fail_df["Artist(s)"] = ""
    fail_df["Title"] = ""
    fail_df["Lead Artist(s)"] = ""
    fail_df["Year"] = ""

    count_access_api = 0
    year = 1900
    index = 0
    #for artist_name in billboard_df_temp["Lead Artist(s)"]:
    for index_artist, row in billboard_df_temp.iterrows():
        year_loop = row["Year"]
        if year != year_loop:
            year = year_loop
            print year

        song_title = row["Title"] 
        artist_name = row["Lead Artist(s)"]
        artist_full_name = row["Artist(s)"]
              
        count_access_api += 1
        if count_access_api >= 120:
            time.sleep(60)
            count_access_api = 0
        try: 
            results = song.search(artist = artist_name, title = song_title, buckets=['artist_location', 'audio_summary', 'song_type', 'song_discovery'])
            current_song = results[0]

            if current_song.artist_location:
                billboard_df_temp.loc[index_artist, "latitude"] = current_song.artist_location["latitude"]
                billboard_df_temp.loc[index_artist, "longitude"] = current_song.artist_location["longitude"]
                billboard_df_temp.loc[index_artist, "location"] = current_song.artist_location["location"]

            song_type_list = current_song.song_type
            for i, song_type_item in enumerate(song_type_list):
                if i > 2:
                    break
                billboard_df_temp.loc[index_artist, "song_type_" + str(i)] = song_type_item


            billboard_df_temp.loc[index_artist, "song_discovery"] = current_song.song_discovery

            if current_song.audio_summary:
                billboard_df_temp.loc[index_artist, "acousticness"] = current_song.audio_summary["acousticness"]
                billboard_df_temp.loc[index_artist, "danceability"] = current_song.audio_summary["danceability"]
                billboard_df_temp.loc[index_artist, "duration"] = current_song.audio_summary["duration"]
                billboard_df_temp.loc[index_artist, "energy"] = current_song.audio_summary["energy"]
                billboard_df_temp.loc[index_artist, "instrumentalness"] = current_song.audio_summary["instrumentalness"]
                billboard_df_temp.loc[index_artist, "key"] = current_song.audio_summary["key"]
                billboard_df_temp.loc[index_artist, "liveness"] = current_song.audio_summary["liveness"]
                billboard_df_temp.loc[index_artist, "loudness"] = current_song.audio_summary["loudness"]
                billboard_df_temp.loc[index_artist, "mode"] = current_song.audio_summary["mode"]
                billboard_df_temp.loc[index_artist, "speechiness"] = current_song.audio_summary["speechiness"]
                billboard_df_temp.loc[index_artist, "tempo"] = current_song.audio_summary["tempo"]
                billboard_df_temp.loc[index_artist, "valence"] = current_song.audio_summary["valence"]

        except:
            print "Artist name: ", artist_name, "- Song Title: ", song_title
            fail_df.loc[index, "Artist(s)"] = artist_full_name
            fail_df.loc[index, "Title"] = song_title
            fail_df.loc[index, "Lead Artist(s)"] = artist_name
            fail_df.loc[index, "Year"] = year_loop
            index += 1
            continue

       
    billboard_df_temp.to_csv(save_title_path, sep=',', encoding='utf-8')

    elapsed_time = time.time() - start_time
    print "Time Elapsed: ", elapsed_time

    return {"billboard_df_temp": billboard_df_temp, "fail_df": fail_df} 


# Look at the artists who have managed to be in the top several years with the same song


# Last FM API Songs

def add_image_url_to_artist_count_df(unique_artist_df_count, last_fm_network):
    unique_artist_df_count_temp = pd.DataFrame.copy(unique_artist_df_count)
    unique_artist_df_count_temp["Image URL"] = ""
    
    for artist_name in unique_artist_df_count_temp["Artist(s)"]:
        try:
            artist_object = last_fm_network.get_artist(artist_name)
            image_url = artist_object.get_cover_image()
            index_artist = unique_artist_df_count_temp[unique_artist_df_count_temp["Artist(s)"] == artist_name].index.tolist()[0]
            unique_artist_df_count_temp.loc[index_artist, "Image URL"] = image_url
        except:
            print artist_name
            continue

    unique_artist_df_count_temp.to_csv('CSV_data/unique_artist_df_count_with_image_url.csv', sep=',')
    return unique_artist_df_count_temp

def add_artist_bio_to_artist_count_df(unique_artist_df_count, last_fm_network):
    unique_artist_df_count_temp = pd.DataFrame.copy(unique_artist_df_count)
    unique_artist_df_count_temp["Biographie"] = ""
    
    for artist_name in unique_artist_df_count_temp["Artist(s)"]:
        try:
            artist_object = last_fm_network.get_artist(artist_name)
            full_bio = artist_object.get_bio_content(language="en")
            # Only gets the first 3 sentences of the full bio
            bio = re.match(r'(?:[^.:;]+[.:;]){3}', full_bio).group()
            index_artist = unique_artist_df_count_temp[unique_artist_df_count_temp["Artist(s)"] == artist_name].index.tolist()[0]
            unique_artist_df_count_temp.loc[index_artist, "Biographie"] = bio
        except:
            print artist_name
            continue

    unique_artist_df_count_temp.to_csv('CSV_data/unique_artist_df_count_with_biographie.csv', sep=',')
    return unique_artist_df_count_temp


def get_most_dominant_artist_per_years(unique_artist_df, start_year, end_year, interval, step):
    tracks_per_year = 100
    entries_count_by_artist = create_entries_count_by_artist(unique_artist_df, start_year, end_year)

    dominance_per_year = {}
    df_index_list = []
    max_dominance_col = []

    years_range = range(start_year, end_year - step + 1, step)
    last_year = years_range[-1] + step
    if last_year <= end_year:
        years_range.append(last_year)

    for index_artist, row in entries_count_by_artist.iterrows():
        df_index_list.append(index_artist)
        max_dominance = {"value": 0, "years":[]}
        for year in years_range:
            number_of_tracks_for_current_year = 0

            if interval % 2 == 0:
                start_interval = year - interval / 2 - 1  
            else:
                start_interval = year - interval / 2    

            end_interval = year + interval / 2   

            if start_interval >= start_year:
                lower_bound = start_interval
            else:
                lower_bound = start_year

            if end_interval <= end_year:
                upper_bound = end_interval
            else:
                upper_bound = end_year

            if interval > 1:
                key = "Dominance " + str(lower_bound) + " - " + str(upper_bound)
            else:    
                key = "Dominance " + str(year)

            for i in range(lower_bound, upper_bound):
                number_of_tracks_for_current_year += row[i]
            
            current_dominance = number_of_tracks_for_current_year / float(tracks_per_year * interval)

            if key not in dominance_per_year:
                dominance_per_year[key] = []
            
            dominance_per_year[key].append(current_dominance)
            if ((current_dominance > max_dominance["value"]) & (current_dominance != 0)):
                max_dominance["value"] = current_dominance
                max_dominance["years"] = []
                max_dominance["years"].append(key)
            elif ((current_dominance == max_dominance["value"]) & (current_dominance != 0)):
                max_dominance["years"].append(key)

        max_dominance_col.append('{"value":' + str(max_dominance["value"]) + ',"years":["' + '", "'.join(max_dominance["years"]) + '"]}')


    for key in sorted(dominance_per_year):
        data = {"index": df_index_list, key: dominance_per_year[key]}
        dominance_temp_df = pd.DataFrame(data, columns = ["index", key])
        dominance_temp_df = dominance_temp_df.set_index("index")
        entries_count_by_artist = pd.concat([entries_count_by_artist, dominance_temp_df], axis=1)

    data_dominance_max = {"index": df_index_list, "Dominance Max": max_dominance_col}
    max_dominance_temp_df = pd.DataFrame(data_dominance_max, columns = ["index", "Dominance Max"])
    max_dominance_temp_df = max_dominance_temp_df.set_index("index")
    entries_count_by_artist = pd.concat([entries_count_by_artist, max_dominance_temp_df], axis=1)

    return entries_count_by_artist


def getTrackCountryOfOrigin(billboard_df_final):
    geolocator = Nominatim()
    track_state_of_origin = []
    track_country_of_origin = []
    for index_artist, row in billboard_df_final.iterrows():
        if (not pd.isnull(row['latitude'])) & (not pd.isnull(row['longitude'])):
            try:
                location = geolocator.reverse(str(row['latitude']) +',' + str(row['longitude']), language='en')
                state = location.raw['address']['state']
                if state == "Puerto Rico":
                    country = "Puerto Rico"
                else:
                    country = location.raw['address']['country']
                    if country == "The Netherlands":
                        country = "Netherlands"
            except:
                print row["Artist(s)"]
                country = "" 
                state = ""
        else:
            country = ""
            state = ""
        
        track_country_of_origin.append(country)
        if country == "United States of America":
            track_state_of_origin.append(state)
        else:
            track_state_of_origin.append("")

    return [track_country_of_origin, track_state_of_origin]

def addTrackCountryOfOriginToDF(billboard_df_final):
    country_and_state_array = getTrackCountryOfOrigin(billboard_df_final)
    country_and_state_dict = {"country": country_and_state_array[0], "state": country_and_state_array[1]}
    track_country_and_state_of_origin_df = pd.DataFrame(country_and_state_dict, columns = ["country", "state"])
    billboard_df_final_new = pd.concat([billboard_df_final, track_country_and_state_of_origin_df], axis=1)

    billboard_df_final_new.to_csv('CSV_data/billboard_df_final_new.csv', sep=',')
    return billboard_df_final_new


