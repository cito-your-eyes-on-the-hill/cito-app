import requests
from bs4 import BeautifulSoup
from openai import OpenAI

client = OpenAI(api_key='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')

def summarize_text(url):
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


    response = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=[
        {"role": "system", "content": "You are a politically unbiased summarizer."},
        {"role": "user", "content": f"Your job is to summarize the following text from an article, the order might be a bit off or missing sentences. You will not include anything else in your response other than the summary of the article. If there is not enough content, return an empty string. Here is the text:\n{article_text}"},
      ]
    )

    resp = response.choices[0].message.content

    return resp

# summarize_text("https://news.google.com/rss/articles/CBMigAFodHRwczovL3d3dy5zeXJhY3VzZS5jb20vcG9saXRpY3MvY255LzIwMjMvMTEvZWxlY3Rpb24tMjAyMy15b3VyLWd1aWRlLXRvLXZvdGluZy1pbi1jZW50cmFsLW5ldy15b3JrLXBvbGxzLXRpbWVzLWNhbmRpZGF0ZXMuaHRtbNIBjwFodHRwczovL3d3dy5zeXJhY3VzZS5jb20vcG9saXRpY3MvY255LzIwMjMvMTEvZWxlY3Rpb24tMjAyMy15b3VyLWd1aWRlLXRvLXZvdGluZy1pbi1jZW50cmFsLW5ldy15b3JrLXBvbGxzLXRpbWVzLWNhbmRpZGF0ZXMuaHRtbD9vdXRwdXRUeXBlPWFtcA?oc=5")