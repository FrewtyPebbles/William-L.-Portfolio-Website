# GPS Road Navigation System

This GPS Road Navigation System will find the (hopefully) shortest path to a destination using the A* graph traversal algorithm.  The graph is designed to use data from [Open Street Map](https://www.openstreetmap.org).

The dataset I used specifically was from [this page](https://download.geofabrik.de/north-america/us/california/socal.html).  If you would like to download the dataset directly you can do so from [this link](https://download.geofabrik.de/north-america/us/california/socal-251212.osm.pbf).

*This project was made for CPSC 481 (Artificial Intelligence) at California State University Fullerton.*

# How to Run Tests:

To run tests first download a [Southern California Open Street Map dataset](https://download.geofabrik.de/north-america/us/california/socal.html) and place it in the same directory as `main.py` and `many_tests.py`.  Then install all of the dependencies listed in `pyproject.toml`.  Finally run either `python main.py` for a single test or `python many_tests.py` and watch the magic happen!

 > Note that it will be slow the first time you load the map data (like 10-20 min slow on some computers), but the program will cache the data and it will be significantly faster in subsequent tests.

See the **Project Report** link for a breakdown of our findings.

**Note: The project statement and approach section of the project report were written by Jude L. and Mathew B.,  but I (William L.) was the one who came up with the problem, approach and did everything else.**