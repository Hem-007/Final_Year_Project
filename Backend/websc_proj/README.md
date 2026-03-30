
MULTI-URL WEB SCRAPER (VS CODE PROJECT)

This project extracts text content from multiple URLs using web scraping.

PROJECT STRUCTURE
-----------------
main.py        -> runs the scraper
scraper.py     -> scraping logic
urls.txt       -> add the URLs you want to scrape
requirements.txt -> libraries to install

STEP 1 - Install Python
Download Python from https://python.org

STEP 2 - Open Folder in VS Code

STEP 3 - Install Libraries
Open terminal in VS Code and run:

pip install -r requirements.txt

STEP 4 - Add URLs
Open urls.txt and add job URLs like:

https://jobs.lever.co/airbnb
https://example.com

STEP 5 - Run the Program

python main.py

OUTPUT
------
A file named scraped_output.csv will be created containing:

URL
Title
Extracted Text

This text can be used for NLP processing or fake job detection.
