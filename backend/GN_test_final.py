# -*- coding: utf-8 -*-
"""
Created on Sat Feb  3 21:54:54 2024

@author: tk-44
"""

from pygooglenews_local import GoogleNews as gn
import csv
import pandas as pd
import math
import requests
import feedparser
from bs4 import BeautifulSoup
import sqlite3

def isNaN(string):
    return string != string    

def zip_article_search(zip_code, search_phrase = ["politics"], csv_name="news_scrape.csv"):
    df_zip = pd.read_csv("zip_code_database.csv")
    """
    for entry in df_zip['zip']:
        zip_input = entry
    """
    zip_input = zip_code
    
    df_temp = df_zip.loc[df_zip['zip'] == zip_input]
    #print(df_temp.head())
    #sub_df.iloc[0]['A']
    pd_zip_towns = (df_temp.iloc[0]['primary_city'], df_temp.iloc[0]['acceptable_cities'],df_temp.iloc[0]['state'])
    
    #url = 'https://www.google.com/search?q=new+york+good+news&tbm=nws'
    #search_phrase = ["politics",'elections','"local elections"','"local elections 2024"']
    for i,phrase in enumerate(search_phrase):
        if i == 0:
            final_phrase = phrase
        else:
            final_phrase = final_phrase + "+" + phrase
    
    if((type(pd_zip_towns[1]) is str) and (not isNaN(pd_zip_towns[1]))):
        if "," in pd_zip_towns[1]:
            pd_zip_towns_new = pd_zip_towns[1].split(",")
        else:
            pd_zip_towns_new = None
    else:
        pd_zip_towns_new = pd_zip_towns[1]
    """
    if((type(pd_zip_towns_new) is str) and (not isNaN(pd_zip_towns_new))):
        if type(pd_zip_towns_new) is tuple:
            towns_temp = pd_zip_towns_new
            pd_zip_towns_new = []
            for i in range(len(pd_zip_towns)):
                pd_zip_towns_new[i] = towns_temp[i] 
    """
    #print(type(pd_zip_towns_new))
    #print(type(pd_zip_towns_new) is not str)
    location_query = pd_zip_towns[0] + "," + pd_zip_towns[2]
    
    # print(type(pd_zip_towns_new))
    if((type(pd_zip_towns_new) is list) or (type(pd_zip_towns_new) is tuple)):
        for town in pd_zip_towns_new:
            if (type(town) is str) and (not isNaN(town)):
                location_query = location_query + "+OR+" + town + "," + pd_zip_towns[2]
    elif((type(pd_zip_towns_new) is str) and (not isNaN(pd_zip_towns_new))):
        location_query = location_query + "+OR+" + pd_zip_towns_new + "," + pd_zip_towns[2]
    
    custom_search = final_phrase + "+location:+" + location_query
    #custom_search = location_query
    custom_search = custom_search.replace(" +", "+")
    custom_search = custom_search.replace("+ ", "+")
    print(custom_search)
    
    scraper = gn()

    rss_response = scraper._custom_search(custom_search)
    soup = BeautifulSoup(rss_response, 'xml')  # or use 'lxml' if available

    for item in soup.find_all('item'):
        title = item.title.text
        link = item.link.text
        publication_date = item.pubDate.text
        description = item.description.text
        source = item.source['url']

        # Print extracted data (or process as needed)
        print(f"Title: {title}")
        print(f"Link: {link}")
        print(f"Publication Date: {publication_date}")
        print(f"Description: {description}")
        print(f"Source: {source}")
        print("-----")
    

    
    # with open(csv_name, mode='w', newline='') as file:
    #     rss_response = scraper._custom_search(custom_search)
    #     soup = BeautifulSoup(rss_response, 'xml')  # or use 'lxml' if available
    #
    #     for item in soup.find_all('item'):
    #         title = item.title.text
    #         link = item.link.text
    #         publication_date = item.pubDate.text
    #         description = item.description.text
    #         source = item.source['url']
    #
    #         # Print extracted data (or process as needed)
    #         print(f"Title: {title}")
    #         print(f"Link: {link}")
    #         print(f"Publication Date: {publication_date}")
    #         print(f"Description: {description}")
    #         print(f"Source: {source}")
    #         print("-----")


zip_article_search(zip_code=13209, search_phrase = ["politics"], csv_name="news_scrape.csv")