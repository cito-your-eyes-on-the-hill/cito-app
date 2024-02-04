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
from openai import OpenAI
import time
from joblib import load

client = OpenAI(api_key='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')


def isNaN(string):
    return string != string


def zip_article_search(zip_code, search_phrase=["politics"], csv_name="news_scrape.csv"):
    df_zip = pd.read_csv("zip_code_database.csv")
    """
    for entry in df_zip['zip']:
        zip_input = entry
    """
    zip_input = int(zip_code)

    df_temp = df_zip.loc[df_zip['zip'] == zip_input]
    # print(df_temp.head())
    # sub_df.iloc[0]['A']
    # print(df_temp)
    pd_zip_towns = (df_temp.iloc[0]['primary_city'], df_temp.iloc[0]['acceptable_cities'], df_temp.iloc[0]['state'])

    # url = 'https://www.google.com/search?q=new+york+good+news&tbm=nws'
    # search_phrase = ["politics",'elections','"local elections"','"local elections 2024"']
    for i, phrase in enumerate(search_phrase):
        if i == 0:
            final_phrase = phrase
        else:
            final_phrase = final_phrase + "+" + phrase

    if ((type(pd_zip_towns[1]) is str) and (not isNaN(pd_zip_towns[1]))):
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
    # print(type(pd_zip_towns_new))
    # print(type(pd_zip_towns_new) is not str)
    location_query = pd_zip_towns[0] + "," + pd_zip_towns[2]

    # print(type(pd_zip_towns_new))
    if ((type(pd_zip_towns_new) is list) or (type(pd_zip_towns_new) is tuple)):
        for town in pd_zip_towns_new:
            if (type(town) is str) and (not isNaN(town)):
                location_query = location_query + "+OR+" + town + "," + pd_zip_towns[2]
    elif ((type(pd_zip_towns_new) is str) and (not isNaN(pd_zip_towns_new))):
        location_query = location_query + "+OR+" + pd_zip_towns_new + "," + pd_zip_towns[2]

    custom_search = final_phrase + "+location:+" + location_query
    # custom_search = location_query
    custom_search = custom_search.replace(" +", "+")
    custom_search = custom_search.replace("+ ", "+")
    # print(custom_search)

    scraper = gn()

    rss_response = scraper._custom_search(custom_search)
    soup = BeautifulSoup(rss_response, 'xml')  # or use 'lxml' if available

    titles = get_all_articles_titles()

    for item in soup.find_all('item'):
        title = item.title.text
        # if title in titles:
        #     continue
        link = item.link.text
        publication_date = item.pubDate.text
        description = item.description.text
        desc_soup = BeautifulSoup(description, 'html.parser')

        # Extract text from the <a> tag
        a_text = desc_soup.find('a').get_text(strip=True) if desc_soup.find('a') else ''

        # Extract text from the <font> tag
        font_text = desc_soup.find('font').get_text(strip=True) if desc_soup.find('font') else ''

        # Combine the extracted texts
        description = f"{a_text} - {font_text}".strip()
        source = item.source['url']

        article_content = get_articles_text(link)

        if len(article_content) < 1000:
            continue

        bias = get_article_bias(article_content)
        summary = summarize_article(article_content)

        add_article_to_db(title, article_content, summary, publication_date, None, bias, source, zip_code, link)

        # Add call to the api to update the front end with the new article

        # Print extracted data (or process as needed)
        print(f"Title: {title}")
        print(f"Link: {link}")
        print(f"Publication Date: {publication_date}")
        print(f"Description: {description}")
        print(f"Source: {source}")
        print("-----")


def get_all_articles_titles():
    conn = sqlite3.connect('../lib/citoData.db')
    c = conn.cursor()
    c.execute('SELECT title FROM articles')
    titles = c.fetchall()
    conn.close()
    # Flattening the list of tuples into a list of strings
    titles = [title[0] for title in titles]
    return titles


def add_article_to_db(title, text, summary, date, imageData, classifierNumber, websiteName, zipCode, link):
    conn = sqlite3.connect('../lib/citoData.db')
    c = conn.cursor()
    c.execute('INSERT INTO articles VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
              (title, text, summary, date, imageData, classifierNumber, websiteName, zipCode, link))
    conn.commit()
    conn.close()


def get_articles_text(url):
    response = requests.get(url)

    html_content = response.text

    # Parse the HTML content
    soup = BeautifulSoup(html_content, 'html.parser')

    # Define tags to extract (common article tags)
    tags_to_extract = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']

    # Extract text from each tag and concatenate
    article_text = ''
    for tag in tags_to_extract:
        for element in soup.find_all(tag):
            article_text += element.get_text() + '\n'

    return article_text


def summarize_article(article_text):
    response = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=[
            {"role": "system", "content": "You are a politically unbiased summarizer."},
            {"role": "user",
             "content": f"Your job is to summarize the following text from an article, the order might be a bit off or missing sentences. You will not include anything else in your response other than the summary of the article. If there is not enough content, return an empty string. Here is the text:\n{article_text}"},
        ]
    )

    resp = response.choices[0].message.content

    return resp


def make_prediction(model_filename, input_text):
    # Load the trained pipeline
    pipeline = load(model_filename)

    # Assuming the pipeline has a TfidfVectorizer as the first step and SVC as the second
    tfidf_vectorizer = pipeline.named_steps['tfidfvectorizer']
    svm_model = pipeline.named_steps['svc']

    # Transform the input text using the loaded vectorizer
    input_text_transformed = tfidf_vectorizer.transform([input_text])

    # Make a prediction
    prediction = svm_model.predict(input_text_transformed)
    return prediction[0]

def get_article_bias(article_text):
    model_filename = 'bias_classifier.joblib'

    prediction = make_prediction(model_filename, article_text)

    print(f"Prediction: {prediction}")

    return int(prediction)


def get_all_unique_zip():
    conn = sqlite3.connect('../lib/citoData.db')
    c = conn.cursor()
    c.execute('SELECT DISTINCT zipCode FROM devices')
    zips = c.fetchall()
    conn.close()
    zips = [zip[0] for zip in zips]
    return zips


time_interval = 60*10
while(True):
    zipCodes = get_all_unique_zip()
    for zipCode in zipCodes:
        zip_article_search(zip_code=str(zipCode), search_phrase=["politics"], csv_name="news_scrape.csv")
    time.sleep(time_interval)
