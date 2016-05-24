# Analysis Of Popular Music
Repository containing the code of the Analysis of Popular Music project

The article of the project can be found on my [website](http://th-lucas.github.io/analysisOfPopularMusic).

##### Summary

Whether one likes it or not, music is an art that does not let people indifferent. At a time when listening to music has never been easier, I felt interesting to have a closer look at what are the characteristics of popular music and popular artists over the last half-century.

To do that, I am using data from the *Billboard* Hot 100 year-end raking scrapped from Wikipedia. All the data analysis phase has been done in an iPython Notebook using **Pandas** and **NumPy** for the data wrangling steps. **Scikit-learn** has also been used for some machine learning tasks.

Several interactive visualizations have been made in the article. They are all using **d3.js**.

To have access to the tracks acoustic attributes, the artists details and the tracks 30s preview, I have chosen to use different **APIs**:

- The Echo Nest API (for the acoustic attributes and track details)
- LastFM API (for the artist details)
- Spotify API (for the track preview)
