import textwrap
import datasets
import re
from html import unescape
import os
import xml.etree.ElementTree as ET
import pandas as pd
import logging
from joblib import dump
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import SVC
from sklearn.metrics import classification_report, accuracy_score
from sklearn.pipeline import make_pipeline

# device = 'cuda' if cuda.is_available() else 'cpu'

_CITATION = """\
@inproceedings{kiesel-etal-2019-semeval,
    title = "{S}em{E}val-2019 Task 4: Hyperpartisan News Detection",
    author = "Kiesel, Johannes  and
      Mestre, Maria  and
      Shukla, Rishabh  and
      Vincent, Emmanuel  and
      Adineh, Payam  and
      Corney, David  and
      Stein, Benno  and
      Potthast, Martin",
    booktitle = "Proceedings of the 13th International Workshop on Semantic Evaluation",
    month = jun,
    year = "2019",
    address = "Minneapolis, Minnesota, USA",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/S19-2145",
    doi = "10.18653/v1/S19-2145",
    pages = "829--839",
    abstract = "Hyperpartisan news is news that takes an extreme left-wing or right-wing standpoint. If one is able to reliably compute this meta information, news articles may be automatically tagged, this way encouraging or discouraging readers to consume the text. It is an open question how successfully hyperpartisan news detection can be automated, and the goal of this SemEval task was to shed light on the state of the art. We developed new resources for this purpose, including a manually labeled dataset with 1,273 articles, and a second dataset with 754,000 articles, labeled via distant supervision. The interest of the research community in our task exceeded all our expectations: The datasets were downloaded about 1,000 times, 322 teams registered, of which 184 configured a virtual machine on our shared task cloud service TIRA, of which in turn 42 teams submitted a valid run. The best team achieved an accuracy of 0.822 on a balanced sample (yes : no hyperpartisan) drawn from the manually tagged corpus; an ensemble of the submitted systems increased the accuracy by 0.048.",
}
"""

_DESCRIPTION = """\
Hyperpartisan News Detection was a dataset created for PAN @ SemEval 2019 Task 4.
Given a news article text, decide whether it follows a hyperpartisan argumentation, i.e., whether it exhibits blind, prejudiced, or unreasoning allegiance to one party, faction, cause, or person.
There are 2 parts:
- byarticle: Labeled through crowdsourcing on an article basis. The data contains only articles for which a consensus among the crowdsourcing workers existed.
- bypublisher: Labeled by the overall bias of the publisher as provided by BuzzFeed journalists or MediaBiasFactCheck.com.
"""
_URL_BASE = "/content/drive/MyDrive/PoliticalData/"


class HyperpartisanNewsDetection(datasets.GeneratorBasedBuilder):

    VERSION = datasets.Version("1.0.1")
    BUILDER_CONFIGS = [
        datasets.BuilderConfig(
            name="byarticle",
            version=datasets.Version("1.0.0", "Version Training and validation v1"),
            description=textwrap.dedent(
                """
                    This part of the data (filename contains "byarticle") is labeled through crowdsourcing on an article basis.
                    The data contains only articles for which a consensus among the crowdsourcing workers existed. It contains
                    a total of 645 articles. Of these, 238 (37%) are hyperpartisan and 407 (63%) are not, We will use a similar
                    (but balanced!) test set. Again, none of the publishers in this set will occur in the test set.
                """
            ),
        ),
        datasets.BuilderConfig(
            name="bypublisher",
            version=datasets.Version("1.0.1", "Version Training and validation v1"),
            description=textwrap.dedent(
                """
                    This part of the data (filename contains "bypublisher") is labeled by the overall bias of the publisher as provided
                    by BuzzFeed journalists or MediaBiasFactCheck.com. It contains a total of 750,000 articles, half of which (375,000)
                    are hyperpartisan and half of which are not. Half of the articles that are hyperpartisan (187,500) are on the left side
                    of the political spectrum, half are on the right side. This data is split into a training set (80%, 600,000 articles) and
                    a validation set (20%, 150,000 articles), where no publisher that occurs in the training set also occurs in the validation
                    set. Similarly, none of the publishers in those sets will occur in the test set.
                """
            ),
        ),
    ]

    def _info(self):
        features = {
            "text": datasets.Value("string"),
            "title": datasets.Value("string"),
            "hyperpartisan": datasets.Value("bool"),
            "url": datasets.Value("string"),
            "published_at": datasets.Value("string"),
        }

        if self.config.name == "bypublisher":
            # Bias is only included in the bypublisher config
            features["bias"] = datasets.ClassLabel(names=["right", "right-center", "least", "left-center", "left"])

        return datasets.DatasetInfo(
            description=_DESCRIPTION,
            features=datasets.Features(features),
            supervised_keys=("text", "label"),
            homepage="https://pan.webis.de/semeval19/semeval19-web/",
            citation=_CITATION,
        )

    def _split_generators(self, dl_manager):
        """Returns SplitGenerators."""
        urls = {
            datasets.Split.TRAIN: {
                "articles_file": _URL_BASE + "articles-training-" + self.config.name + "-20181122.zip",
                "labels_file": _URL_BASE + "ground-truth-training-" + self.config.name + "-20181122.zip",
            },
        }
        if self.config.name == "bypublisher":
            urls[datasets.Split.VALIDATION] = {
                "articles_file": _URL_BASE + "articles-validation-" + self.config.name + "-20181122.zip",
                "labels_file": _URL_BASE + "ground-truth-validation-" + self.config.name + "-20181122.zip",
            }

        data_dir = {}
        for key in urls:
            data_dir[key] = dl_manager.download_and_extract(urls[key])

        splits = []
        for split in data_dir:
            for key in data_dir[split]:
                data_dir[split][key] = os.path.join(data_dir[split][key], os.listdir(data_dir[split][key])[0])
            splits.append(datasets.SplitGenerator(name=split, gen_kwargs=data_dir[split]))
        return splits

    def _generate_examples(self, articles_file=None, labels_file=None):
        """Yields examples."""
        labels = {}
        with open(labels_file, "rb") as f_labels:
            tree = ET.parse(f_labels)
            root = tree.getroot()
            for label in root:
                article_id = label.attrib["id"]
                del label.attrib["labeled-by"]
                labels[article_id] = label.attrib

        with open(articles_file, "rb") as f_articles:
            tree = ET.parse(f_articles)
            root = tree.getroot()
            for idx, article in enumerate(root):
                example = {}
                example["title"] = article.attrib["title"]
                example["published_at"] = article.attrib.get("published-at", "")
                example["id"] = article.attrib["id"]
                example = {**example, **labels[example["id"]]}
                example["hyperpartisan"] = example["hyperpartisan"] == "true"

                example["text"] = ""
                for child in article:
                    example["text"] += ET.tostring(child).decode() + "\n"
                example["text"] = example["text"].strip()
                del example["id"]
                yield idx, example


# Setup logging
logging.basicConfig(filename='svm_training.log', level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Initialize the datasets library
datasets.logging.set_verbosity_info()

def clean_html(raw_html):
    cleanr = re.compile('<.*?>')  # Regex to identify HTML tags
    cleantext = re.sub(cleanr, '', raw_html)
    cleantext = unescape(cleantext)  # Converts HTML entities to plain text
    return cleantext

# Instantiate the builder for the bypublisher dataset
builder = HyperpartisanNewsDetection(name="bypublisher")

# Download and prepare the dataset
# builder.download_and_prepare()

# Load the bypublisher dataset
dataset = builder.as_dataset()
#
# # Assuming dataset is split into 'train' and 'test' (or 'validation')
train_dataset = dataset['train']
test_dataset = dataset['validation']

print("Data Loaded 1")

def convert_to_dataframe(dataset):
    df = pd.DataFrame(dataset)
    if 'bias' in df.columns:
        df['bias'] = df['bias'].apply(lambda x: dataset.features['bias'].int2str(x))
    return df


train_df = convert_to_dataframe(train_dataset)
test_df = convert_to_dataframe(test_dataset)

print("Converted to DF")

# Apply the cleaning function to your text data
train_df['text'] = train_df['text'].apply(clean_html)
test_df['text'] = test_df['text'].apply(clean_html)

print("Cleaned HTML")

bias_mapping = {'right': 0, 'right-center': 1, 'least': 2, 'left-center': 3, 'left': 4}

# Apply the mapping to your bias data if it's not already numeric
if train_df['bias'].dtype == 'object':
    train_df['bias'] = train_df['bias'].map(bias_mapping)
    test_df['bias'] = test_df['bias'].map(bias_mapping)

print("Mapped Bias")

# Function to train and evaluate SVM
def train_evaluate_svm(df, label_column, test_size=0.2, model_name='model'):
    logging.info(f"Starting training for {model_name}")

    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(df['text'], df[label_column], test_size=test_size, random_state=42)

    # Initialize and train the pipeline
    pipeline = make_pipeline(
        TfidfVectorizer(max_features=5000),  # Limiting the number of features
        SVC(probability=True,
            verbose=True),
        verbose=True
    )
    pipeline.fit(X_train, y_train)

    # Evaluate the model
    predictions = pipeline.predict(X_test)
    report = classification_report(y_test, predictions)
    logging.info("Training completed")
    logging.info(f"Classification Report for {model_name}:\n{report}")

    # Save the model
    dump(pipeline, f'{model_name}_classifier.joblib')

# Example usage
train_evaluate_svm(train_df, 'hyperpartisan', test_size=0.2, model_name='hyperpartisan')
if 'bias' in train_df.columns:
    train_evaluate_svm(train_df, 'bias', test_size=0.2, model_name='bias')