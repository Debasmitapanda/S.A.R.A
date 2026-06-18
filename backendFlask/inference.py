import matplotlib
matplotlib.use("Agg")

import pandas as pd
import os
import re
import string
import pickle
import nltk
from tensorflow.keras.layers import Layer
import tensorflow as tf
import keras
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
import matplotlib.pyplot as plt
from wordcloud import WordCloud
from keras.saving import register_keras_serializable

from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.sequence import pad_sequences
from collections import Counter
import numpy as np

# =======================
# NLTK setup
# =======================
nltk.download('stopwords', quiet=True)
nltk.download('wordnet', quiet=True)

english_stopwords = set(stopwords.words('english'))
hinglish_stopwords = set(["hai", "tha", "thi", "the", "aur", "kyunki", "phir", "yeh", "voh", "par", "mein"])
lemmatizer = WordNetLemmatizer()

# =======================
# Text Cleaning
# =======================
def remove_urls_mentions_hashtags(text):
    text = re.sub(r"http\S+|www\S+|https\S+", "", text)
    text = re.sub(r"@\w+|#\w+", "", text)
    return text

def remove_punctuation(text):
    return text.translate(str.maketrans("", "", string.punctuation))

def clean_tweet(text):
    if pd.isnull(text):
        return ""
    text = text.lower()
    text = remove_urls_mentions_hashtags(text)
    text = remove_punctuation(text)
    tokens = text.split()
    tokens = [t for t in tokens if t not in english_stopwords and t not in hinglish_stopwords]
    tokens = [lemmatizer.lemmatize(t) for t in tokens]
    return " ".join(tokens).strip()

# =======================
# Attention Layer (for model compatibility)
# =======================
@register_keras_serializable()
class AttentionLayerNamed(Layer):
    def __init__(self, name="attention_layer", **kwargs):
        super(AttentionLayerNamed, self).__init__(name=name, **kwargs)

    def build(self, input_shape):
        self.W = self.add_weight(
            name="att_weight",
            shape=(input_shape[-1], 1),
            initializer="glorot_uniform",
            trainable=True
        )
        super(AttentionLayerNamed, self).build(input_shape)

    def call(self, x):
        e = tf.keras.backend.tanh(tf.keras.backend.dot(x, self.W))    # (batch, timesteps, 1)
        a = tf.keras.backend.softmax(e, axis=1)
        out = x * a
        return tf.keras.backend.sum(out, axis=1)

    def get_attention_scores(self, seq_output):
        W = self.get_weights()[0]  # (features,1)
        e = np.tanh(np.dot(seq_output, W))  # shape (timesteps,1)
        a = np.exp(e - np.max(e))
        a = a / (np.sum(a) + 1e-12)
        return a.squeeze()   # (timesteps,)

    def get_config(self):
        config = super().get_config()
        return config

# =======================
# Load Models & Tokenizers
# =======================
print("Loading models and tokenizers...")

NEUTRAL_MODEL_PATH = "neutral_model/final_model.keras"
NEUTRAL_TOKENIZER_PATH = "neutral_model/tokenizer.pkl"
NEUTRAL_THRESHOLD_PATH = "neutral_model/threshold.pkl"

POSNEG_MODEL_PATH = "posneg_model/final_model.keras"
POSNEG_TOKENIZER_PATH = "posneg_model/tokenizer.pkl"
POSNEG_THRESHOLD_PATH = "posneg_model/threshold.pkl"

neutral_model = load_model(NEUTRAL_MODEL_PATH, custom_objects={"AttentionLayerNamed": AttentionLayerNamed})
with open(NEUTRAL_TOKENIZER_PATH, "rb") as f:
    neutral_tokenizer = pickle.load(f)

posneg_model = load_model(POSNEG_MODEL_PATH, custom_objects={"AttentionLayerNamed": AttentionLayerNamed})
with open(POSNEG_TOKENIZER_PATH, "rb") as f:
    posneg_tokenizer = pickle.load(f)

with open(NEUTRAL_THRESHOLD_PATH, "rb") as f:
    neutral_threshold = float(pickle.load(f)["threshold"])

with open(POSNEG_THRESHOLD_PATH, "rb") as f:
    posneg_threshold = float(pickle.load(f)["threshold"])

MAXLEN = 80
BATCH_SIZE = 128

# =======================
# Keyword extraction
# =======================
def extract_keyword(text, tokenizer):
    words = text.split()
    for w in words:
        if w in tokenizer.word_index:
            return w
    return "<OOV>"

# =======================
# WordCloud (Safe, Sequential)
# =======================
def generate_wordcloud(data, title, filename):
    try:
        if data is None or len(data) == 0:
            print(f"[WARN] No data for {title}, skipping WordCloud.")
            return
        text = " ".join(data).strip()
        if not text:
            print(f"[WARN] Empty text after cleaning for {title}, skipping WordCloud.")
            return
        wc = WordCloud(width=800, height=400, background_color="white").generate(text)
        plt.figure(figsize=(8, 4))
        plt.imshow(wc, interpolation="bilinear")
        plt.axis("off")
        plt.title(title)
        plt.savefig(filename)
        plt.close()
        print(f"[SUCCESS] WordCloud saved: {filename}")
    except Exception as e:
        print(f"[WARN] WordCloud generation failed for {title}: {e}")

# =======================
# Template Summary
# =======================
def generate_template_summary(data, sentiment_name, total_count, amendment_name, top_n=3):
    all_text = " ".join(data)
    words = [w for w in all_text.split() if w not in english_stopwords and w not in hinglish_stopwords]
    if not words:
        return f"Analysis of {total_count} comments provides limited insight into public perception of {amendment_name}. No strong themes emerged."
    word_counts = Counter(words)
    themes = [w for w, _ in word_counts.most_common(top_n)]
    theme_str = '", "'.join(themes[:top_n])
    if sentiment_name == "Positive":
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments indicates that {amendment_name} is met with strong public approval, "
                f"primarily driven by its perceived positive impacts. Key themes include \"{theme_str}.\" "
                f"Negative feedback is minimal and scattered, lacking a cohesive counter-narrative.")
    elif sentiment_name == "Negative":
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments indicates that {amendment_name} faces significant public opposition, "
                f"largely due to concerns around negative impacts. Common themes include \"{theme_str}.\" "
                f"While some supportive views exist, they are limited and do not form a strong counterpoint to the prevailing criticism.")
    elif sentiment_name == "Neutral":
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments shows a mixed public response to {amendment_name}. "
                f"Supporters highlight positive aspects, while critics emphasize negative aspects. "
                f"Key themes include \"{theme_str}.\" Overall, opinions are balanced, with no clear dominant narrative emerging.")
    else:
        return (f"AI-Generated Summary\n"
                f"Analysis of {total_count} comments provides insight into public perception of {amendment_name}. "
                f"Key themes include \"{theme_str}.\" Overall sentiment varies, with both positive and negative viewpoints contributing to the broader discussion.")

# =======================
# Inference Pipeline
# =======================
def run_inference(input_csv, output_csv):
    print(f"Loading data from {input_csv}...")
    if input_csv.lower().endswith('.json'):
        df = pd.read_json(input_csv)
    else:
        df = pd.read_csv(input_csv)

    if 'Author' not in df.columns:
        df['Author'] = 'Anonymous'
    if 'Date' not in df.columns:
        df['Date'] = 'N/A'

    amendment_name = os.path.splitext(os.path.basename(input_csv))[0].replace("_", " ").title()

    # Deduplicate columns if any exist
    df = df.loc[:, ~df.columns.duplicated()]

    if 'Comment' in df.columns and 'tweet' not in df.columns:
        df = df.rename(columns={'Comment': 'tweet'})
        
    if 'tweet' not in df.columns:
        raise ValueError("Input CSV/JSON must have a 'Comment' or 'tweet' column")

    print("Cleaning tweets...")
    df['clean_tweet'] = df['tweet'].apply(clean_tweet)

    print("Tokenizing and padding sequences for neutral model...")
    neutral_seq = neutral_tokenizer.texts_to_sequences(df['clean_tweet'])
    neutral_X = pad_sequences(neutral_seq, maxlen=MAXLEN)
    neutral_probs = neutral_model.predict(neutral_X, batch_size=BATCH_SIZE, verbose=1)
    neutral_preds = (neutral_probs >= neutral_threshold).astype(int).flatten()

    print("Stage 1 (Neutral vs Non-neutral) complete.")

    # Stage 2: batch Positive vs Negative
    final_labels = np.array([""] * len(df), dtype=object)
    keywords = ["<none>"] * len(df)

    non_neutral_idx = np.where(neutral_preds == 0)[0]
    non_neutral_texts = df.loc[non_neutral_idx, 'clean_tweet'].tolist()

    if len(non_neutral_texts) > 0:
        posneg_seq = posneg_tokenizer.texts_to_sequences(non_neutral_texts)
        posneg_X = pad_sequences(posneg_seq, maxlen=MAXLEN)
        posneg_probs = posneg_model.predict(posneg_X, batch_size=BATCH_SIZE, verbose=1)
        posneg_preds = (posneg_probs >= posneg_threshold).astype(int).flatten()

        for i, idx in enumerate(non_neutral_idx):
            if posneg_preds[i] == 1:
                final_labels[idx] = "Positive"
            else:
                final_labels[idx] = "Negative"
            keywords[idx] = extract_keyword(non_neutral_texts[i], posneg_tokenizer)

    # Assign neutrals
    for i, pred in enumerate(neutral_preds):
        if pred == 1:
            final_labels[i] = "Neutral"

    df['sentiment'] = final_labels
    df['key_word'] = keywords

    # numeric labels: 0=Negative, 1=Neutral, 2=Positive
    label_map = {"Negative": 0, "Neutral": 1, "Positive": 2}
    df['label'] = [label_map[s] for s in final_labels]

    # keep only required columns
    output_df = df[['Author', 'Date', 'tweet', 'label', 'key_word']]
    output_df.to_csv(output_csv, index=False, encoding='utf-8')
    print(f"[SUCCESS] Predictions saved to {output_csv}")
    
    counts = df['sentiment'].value_counts().to_dict()
    print("\nSentiment Counts:")
    print(f"Negative: {counts.get('Negative',0)}, Neutral: {counts.get('Neutral',0)}, Positive: {counts.get('Positive',0)}")
    
    # Sequential wordclouds
    print("Generating WordClouds sequentially...")
    generate_wordcloud(df[df['label']==0]['clean_tweet'], "Negative WordCloud", os.path.join(os.path.dirname(output_csv), "negative_wc.png"))
    generate_wordcloud(df[df['label']==1]['clean_tweet'], "Neutral WordCloud", os.path.join(os.path.dirname(output_csv), "neutral_wc.png"))
    generate_wordcloud(df[df['label']==2]['clean_tweet'], "Positive WordCloud", os.path.join(os.path.dirname(output_csv), "positive_wc.png"))
    print("[SUCCESS] Wordclouds generated")

    print("\nGenerating AI-Generated Summaries...")
    negative_summary = generate_template_summary(df[df['label']==0]['clean_tweet'], "Negative", counts.get("Negative",0), amendment_name)
    neutral_summary  = generate_template_summary(df[df['label']==1]['clean_tweet'], "Neutral", counts.get("Neutral",0), amendment_name)
    positive_summary = generate_template_summary(df[df['label']==2]['clean_tweet'], "Positive", counts.get("Positive",0), amendment_name)

    print("\n[SUMMARY] AI-Generated Summaries:")
    print(negative_summary)
    print(neutral_summary)
    print(positive_summary)

    return {
        "negative": negative_summary,
        "neutral": neutral_summary,
        "positive": positive_summary
    }

# =======================
# Run Standalone
# =======================
if __name__ == "__main__":
    run_inference("uploads/AmendmentCombinedIncreased2.csv", "outputs/final_predictions.csv")
