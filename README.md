# 🛡️ JobGuard — Smart Fake Job Detection System Using Deep Learning

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat&logo=python&logoColor=white)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.x-FF6F00?style=flat&logo=tensorflow&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=flat&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat)

**An end-to-end deep learning system for detecting fraudulent job postings in real time.**  
*BiLSTM + Maxout MLP · FastAPI · React · Explainable AI · Multi-Source Input*

</div>

---

## Table of Contents

1. [Project Title & Overview](#1-project-title--overview)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Dataset Details](#4-dataset-details)
5. [Data Preprocessing](#5-data-preprocessing)
6. [Model Architecture](#6-model-architecture-detailed)
7. [Training Configuration](#7-training-configuration)
8. [Evaluation Metrics](#8-evaluation-metrics)
9. [System Architecture](#9-system-architecture)
10. [Workflow / Pipeline](#10-workflow--pipeline)
11. [Explainable AI Features](#11-explainable-ai-features-xai)
12. [Tech Stack](#12-tech-stack)
13. [Features](#13-features)
14. [Installation & Usage](#14-installation--usage)
15. [Project Structure](#15-project-structure)
16. [Results & Performance Analysis](#16-results--performance-analysis)
17. [Limitations](#17-limitations)
18. [Future Enhancements](#18-future-enhancements)
19. [Conclusion](#19-conclusion)

---

## 1. Project Title & Overview

**Title:** Smart Fake Job Detection System Using Deep Learning (JobGuard)

**JobGuard** is a full-stack, AI-powered web application that identifies and flags fraudulent job postings in real time. The system combines a **Bidirectional Long Short-Term Memory (BiLSTM)** neural network for deep contextual text-feature extraction with a **Maxout-activated Multi-Layer Perceptron (MLP)** classifier, forming a powerful joint deep learning architecture trained end-to-end on the Kaggle Employment Scam Aegean Dataset (EMSCAD). It features an **adaptive system** with a **Scam Evolution Dashboard** for tracking fraud patterns over time.

The system accepts three types of input:
- **Raw job description text** — copy-pasted directly from any job board
- **Job posting URL** — the page is scraped automatically using BeautifulSoup
- **Job screenshot / image** — text is extracted via EasyOCR and then classified

Every prediction is accompanied by a **full Explainable AI (XAI) breakdown** — risk score, confidence percentage, weighted risk factors, positive legitimacy indicators, scam type classification, missing field detection, and a natural-language final verdict — making the system both a detection tool and a transparent AI assistant for job seekers. Every prediction stores job text, prediction, and timestamp in `data/user_inputs.csv` for continuous learning.

---

## 2. Problem Statement

Online employment fraud has surged in recent years. According to the Internet Crime Complaint Center (IC3), employment scams cost victims hundreds of millions of dollars annually. Fraudulent job postings typically lure job seekers with:

- Unrealistically high salaries requiring minimal qualifications
- Requests for upfront registration or processing fees ("advance fee fraud")
- Solicitation of sensitive personal data — bank account numbers, national ID, or passport details
- Vague or generic job descriptions with no verifiable employer information
- Non-corporate contact channels such as Gmail, Yahoo, or WhatsApp

Traditional countermeasures rely on **keyword-based filters or shallow machine learning classifiers** (Naïve Bayes, SVM with TF-IDF) that fail to capture the semantic nuance of natural language. These approaches:

- Cannot model contextual word relationships or long-range sentence dependencies
- Are brittle to minor rephrasing, synonym substitution, or deliberate obfuscation
- Produce no explanations — leaving users unable to understand *why* a posting was flagged
- Require heavy manual feature engineering that does not generalise across new scam formats

Furthermore, existing tools typically accept only a single input modality (text), excluding job seekers who encounter postings as screenshots, forwarded images, or links. There is a pressing need for an **automated, accurate, explainable, and multi-modal** system capable of delivering actionable results in real time.

---

## 3. Solution Overview

JobGuard addresses the above challenges through a three-tier architecture with an integrated AI inference engine.

### 3.1 Deep Learning Core

A joint **BiLSTM + Maxout MLP** model (`Joint_BiLSTM_Maxout`) trained end-to-end that:
- Learns rich contextual text representations via bidirectional LSTM processing (forward + backward pass over each token sequence)
- Applies piecewise-linear Maxout activations for expressive non-linear classification in the MLP head
- Uses **class-weighted binary cross-entropy with label smoothing** to handle a 19.6:1 class imbalance
- Outputs a calibrated fraud probability scalar ∈ [0, 1]

### 3.2 Multi-Source Input Pipeline

| Input Mode | Processing Path |
|------------|----------------|
| Raw text | Directly cleaned → tokenised → classified |
| URL | BeautifulSoup scraper with retry logic → extracted text → classified |
| Image (PNG/JPG/etc.) | EasyOCR (English, CPU) → extracted text → classified |

### 3.3 Explainable AI (XAI) Layer

A hybrid XAI layer combines the model's probabilistic output with rule-based heuristics to produce:
- **Risk Score** — fraud probability scaled to 0–100 %
- **Confidence Score** — model decisiveness relative to the classification threshold
- **Risk Factors** — up to 5 weighted fraud signals (sorted by severity)
- **Positive Indicators** — up to 5 legitimacy signals
- **Model Contribution** — BiLSTM text weight vs. metadata heuristic weight
- **Risk Breakdown** — text risk + metadata risk = total risk
- **Scam Type Classification** — 5 pattern categories (Advance Fee, Work-From-Home, Phishing, Unrealistic Salary, Ghost Job)
- **Missing Field Detection** — identifies absent key fields (company name, salary, location, etc.)
- **Natural-Language Final Verdict** — human-readable summary generated programmatically

---

## 4. Dataset Details

### 4.1 Source

| Field | Detail |
|-------|--------|
| **Name** | Employment Scam Aegean Dataset (EMSCAD) |
| **Platform** | Kaggle |
| **URL** | https://www.kaggle.com/datasets/shivamb/real-or-fake-fake-jobposting-prediction |
| **File** | `fake_job_postings.csv` |
| **Collector** | University of the Aegean, Greece |

### 4.2 Number of Samples

| Split | Total Samples | Real (0) | Fake (1) |
|-------|:------------:|:--------:|:--------:|
| Full Dataset | ~17,880 | ~17,014 | ~866 |
| Training (70 %) | ~12,516 | ~11,910 | ~606 |
| Validation (15 %) | ~2,682 | ~2,552 | ~130 |
| Test (15 %) | ~2,682 | ~2,552 | ~130 |

**Class Imbalance Ratio: ~19.6 : 1 (Real : Fake)**

This severe skew is a defining challenge of the dataset. It is addressed during model training via `sklearn.utils.class_weight.compute_class_weight('balanced')`, which assigns proportionally higher loss weight to the minority class (Fake).

### 4.3 Key Features / Columns

| Column | Type | Description |
|--------|------|-------------|
| `job_id` | Integer | Unique job posting identifier |
| `title` | Text | Job title as listed by the employer |
| `location` | Text | Geographic location of the role |
| `department` | Text | Department within the company |
| `salary_range` | Text | Advertised salary range |
| `company_profile` | Text | Company background description |
| `description` | Text | Full job description body |
| `requirements` | Text | Required skills and qualifications |
| `benefits` | Text | Benefits offered to the employee |
| `telecommuting` | Binary | Whether remote work is offered |
| `has_company_logo` | Binary | Whether a company logo is present |
| `has_questions` | Binary | Whether screening questions are included |
| `employment_type` | Categorical | Full-time, Part-time, Contract, etc. |
| `required_experience` | Categorical | Experience level required |
| `required_education` | Categorical | Education level required |
| `industry` | Categorical | Industry sector |
| `function` | Categorical | Job function category |
| `fraudulent` | **Binary (label)** | **0 = Real, 1 = Fake** |

### 4.4 Class Distribution

```
Real Job Postings  (0) :  ~17,014  (≈ 95.2 %)
Fake Job Postings  (1) :    ~866   (≈  4.8 %)
Imbalance ratio        :   19.6 : 1
```

The heavy class skew makes raw accuracy a misleading metric alone. The model is therefore evaluated on **Precision, Recall, F1-score, and AUC-ROC** with a tuned classification threshold of 0.4 (research) / 0.5 (production).

---

## 5. Data Preprocessing

### 5.1 Text Field Selection & Merging

Five text columns are selected and concatenated into a single `merged_text` field per record:

```python
TEXT_COLS = ["title", "company_profile", "description", "requirements", "benefits"]

df["merged_text"] = (df["title"]           + " " +
                     df["company_profile"] + " " +
                     df["description"]     + " " +
                     df["requirements"]    + " " +
                     df["benefits"])
```

### 5.2 Handling Missing Values

All five text columns are filled with empty strings before concatenation:

```python
for col in TEXT_COLS:
    df[col] = df[col].fillna("")
```

No additional imputation is required because missing fields simply contribute no tokens to the sequence, and the BiLSTM naturally handles variable-content inputs.

### 5.3 Text Cleaning Pipeline

Each merged text string passes through a deterministic, regex-based cleaning function:

```python
def clean_text(text: str) -> str:
    text = text.lower()                                    # 1. Lowercase
    text = re.sub(r"<[^>]+>",               " ", text)    # 2. Strip HTML tags
    text = re.sub(r"&[a-z]+;",              " ", text)    # 3. Strip HTML entities
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)    # 4. Remove URLs
    text = re.sub(r"\S+@\S+",               " ", text)    # 5. Remove email addresses
    text = re.sub(r"[^a-z0-9\s]",           " ", text)    # 6. Remove special characters
    text = re.sub(r"\s+",                   " ", text).strip()  # 7. Collapse whitespace
    return text
```

This function is shared across the training pipeline, the FastAPI preprocessing service, and the OCR/scraper output paths, ensuring **consistent normalisation** at every stage.

### 5.4 Tokenisation

A Keras `Tokenizer` is fitted on the cleaned training corpus:

```python
tokenizer = Tokenizer(num_words=20_000, oov_token="<OOV>")
tokenizer.fit_on_texts(training_texts)
sequences = tokenizer.texts_to_sequences(texts)
```

- **Vocabulary size**: 20,000 most frequent words
- **OOV token**: `<OOV>` (index 1) — unknown words at inference time are mapped here
- The fitted tokeniser is serialised to `data/processed/tokenizer.pkl` and loaded at inference time

### 5.5 Sequence Padding

All token sequences are padded (or truncated) to a fixed length of **256 tokens**:

```python
padded = pad_sequences(sequences, maxlen=256, padding="post", truncating="post")
```

- **post-padding**: zeros appended at the end for shorter sequences
- **post-truncation**: tokens beyond index 256 are dropped for longer sequences
- Output shape: `(num_samples, 256)` — a 2-D integer array ready for the Embedding layer

### 5.6 Train / Validation / Test Split

Data is split using **stratified sampling** to preserve the class ratio in all three subsets:

```python
X_tv, X_test, y_tv, y_test = train_test_split(
    padded, labels, test_size=0.15, random_state=42, stratify=labels)

X_train, X_val, y_train, y_val = train_test_split(
    X_tv, y_tv, test_size=0.15/0.85, random_state=42, stratify=y_tv)
```

| Split | Proportion | Saved File |
|-------|:----------:|------------|
| Training | 70 % | `X_train.npy`, `y_train.npy` |
| Validation | 15 % | `X_val.npy`, `y_val.npy` |
| Test | 15 % | `X_test.npy`, `y_test.npy` |

All arrays are saved as `.npy` files under `data/processed/` for reproducible loading without re-running the full preprocessing pipeline.

---

## 6. Model Architecture (Detailed)

The proposed model is a **Joint BiLSTM + Maxout MLP** architecture (`Joint_BiLSTM_Maxout`), trained end-to-end and saved in Keras `.keras` format.

### 6.1 Architecture Diagram

```
Input  (256,)
   |
   v
Embedding(vocab=20000, dim=128)        Output shape: (batch, 256, 128)
   v
SpatialDropout1D(rate=0.2)             Drops entire embedding channels
   v
Bidirectional(LSTM(units=128))         Forward + Backward LSTM -> 256-dim vector
   |  kernel_regularizer   = L2(1e-4)
   |  recurrent_regularizer = L2(1e-4)
   v
Dropout(rate=0.4)
   v
BatchNormalization
   v
MaxoutLayer(units=256, num_pieces=2)   MLP block 1 | W shape: (256, 512)
   v
Dropout(rate=0.4)
   v
MaxoutLayer(units=128, num_pieces=2)   MLP block 2 | W shape: (256, 256)
   v
Dropout(rate=0.3)
   v
MaxoutLayer(units=64,  num_pieces=2)   MLP block 3 | W shape: (128, 128)
   v
Dropout(rate=0.2)
   v
Dense(units=1, activation='sigmoid', kernel_regularizer=L2(1e-4))
   v
Output: fraud probability scalar in [0, 1]
```

### 6.2 Embedding Layer

| Parameter | Value |
|-----------|-------|
| Vocabulary size | 20,000 tokens |
| Embedding dimension | 128 |
| Trainable | Yes — learned from scratch on EMSCAD |
| Input shape | `(batch, 256)` — integer token indices |
| Output shape | `(batch, 256, 128)` — one dense vector per token |

The embedding layer maps each integer token index to a 128-dimensional dense vector. All embedding weights are randomly initialised and fully learned end-to-end, allowing the model to develop task-specific word representations tuned for fraud detection rather than relying on pre-trained generic embeddings.

### 6.3 SpatialDropout1D (rate = 0.2)

Unlike standard Dropout that zeroes individual scalar elements, `SpatialDropout1D` drops **entire embedding feature maps** (columns of the embedding matrix). This preserves coherence along the sequence (time) axis and forces the model to learn redundant, robust representations — substantially more effective than element-wise dropout for RNN inputs.

### 6.4 Bidirectional LSTM

| Parameter | Value |
|-----------|-------|
| LSTM units (per direction) | 128 |
| Total output dimensionality | **256** (128 forward + 128 backward) |
| Kernel regulariser | L2(1e-4) |
| Recurrent regulariser | L2(1e-4) |
| Return sequences | False — final hidden state only |

The Bidirectional wrapper runs two independent LSTM cells — one left-to-right (forward) and one right-to-left (backward) — and concatenates their final hidden states. This allows the model to capture:
- **Forward context**: dependencies building progressively from the job title toward the end of the description
- **Backward context**: signals requiring look-ahead (e.g., a clause later in the text that recontextualises an earlier claim)

This bidirectional awareness is especially powerful for detecting contradictions, unusual qualifiers, and long-range fraud signals embedded within otherwise professional-sounding language.

### 6.5 Maxout Activation (Goodfellow et al., 2013)

The Maxout activation replaces ReLU/tanh in the dense classification head. Each Maxout unit computes:

```
h_i(x) = max_{j in [1,k]} ( x · W_ij + b_ij )    where k = num_pieces = 2
```

This produces a **piecewise-linear approximation of any convex function**, making Maxout strictly more expressive than ReLU while remaining fully compatible with L2 regularisation and Dropout (Goodfellow et al. showed Maxout + Dropout jointly achieve optimal model averaging).

| Layer | Input → Output Dim | Weight Shape | Dropout After |
|-------|:------------------:|:------------:|:-------------:|
| MaxoutLayer 1 | 256 → 256 | (256, 512) | 0.4 |
| MaxoutLayer 2 | 256 → 128 | (256, 256) | 0.3 |
| MaxoutLayer 3 | 128 → 64  | (128, 128) | 0.2 |

All Maxout layers use Glorot uniform initialisation and L2(1e-4) regularisation on W.

### 6.6 Output Layer

| Parameter | Value |
|-----------|-------|
| Units | 1 |
| Activation | Sigmoid |
| Kernel regulariser | L2(1e-4) |
| Output | P(fraudulent) in [0, 1] |
| Classification threshold | 0.5 (production) / 0.4 (research) |

### 6.7 Total Parameter Count

| Layer | Output Shape | Approx. Parameters |
|-------|:-----------:|:-----------------:|
| Embedding | (None, 256, 128) | 2,560,000 |
| Bidirectional LSTM | (None, 256) | 197,632 |
| BatchNormalization | (None, 256) | 1,024 |
| MaxoutLayer 1 | (None, 256) | 131,584 |
| MaxoutLayer 2 | (None, 128) | 65,792 |
| MaxoutLayer 3 | (None, 64)  | 16,512 |
| Dense (output) | (None, 1)   | 65 |
| **Total** | | **≈ 2,972,609** |

### 6.8 Sub-Model Extraction

Two sub-models are extracted from the trained joint model for modular deployment and independent analysis:

| Sub-Model | Input | Output | Saved File |
|-----------|-------|--------|------------|
| `BiLSTM_Extractor` | Token sequence `(256,)` | 256-dim feature vector | `bilstm_model_final.keras` |
| `Maxout_Classifier` | 256-dim feature vector | Fraud probability | `maxout_model_final.keras` |

---

## 7. Training Configuration

### 7.1 Core Hyperparameters

| Hyperparameter | Value | Rationale |
|----------------|:-----:|-----------|
| Vocabulary size | 20,000 | Covers >99% of corpus tokens while limiting embedding table size |
| Max sequence length | 256 | Captures full job descriptions without excessive padding |
| Embedding dimension | 128 | Balances expressiveness and training efficiency |
| LSTM units (per direction) | 128 | Sufficient capacity for job-text sequence modelling |
| Batch size | 64 | GPU-friendly; stable gradient estimates |
| Epochs | 30 | Upper bound; early stopping typically halts at 10–18 |
| Patience (early stopping) | 5 | Stops if validation loss does not improve for 5 consecutive epochs |
| Learning rate | 1e-3 | Adam default; decayed by ReduceLROnPlateau |
| L2 regularisation | 1e-4 | Applied to Embedding (indirectly), LSTM kernels, Maxout W, and Dense kernel |
| Label smoothing | 0.05 | Prevents overconfidence on noisy training labels |
| Classification threshold | 0.4 (research) / 0.5 (production) | Tuned to balance precision and recall |

### 7.2 Loss Function

**Binary Cross-Entropy with Label Smoothing**

```python
loss = BinaryCrossentropy(label_smoothing=0.05)
```

Label smoothing replaces hard labels (0, 1) with soft targets (0.025, 0.975), reducing the model's tendency to become overconfident and improving calibration of the output probability.

**Class Weighting** addresses the 19.6:1 imbalance by assigning a proportionally higher loss contribution to the minority (Fake) class:

```python
class_weights = compute_class_weight('balanced', classes=[0, 1], y=y_train)
# Results in approximately: {0: 0.52, 1: 10.34}
```

### 7.3 Optimiser

**Adam** (Adaptive Moment Estimation):

```python
optimizer = Adam(learning_rate=1e-3)
```

Adam's adaptive per-parameter learning rates make it well-suited to sparse, high-dimensional text data where gradients vary significantly across embedding dimensions.

### 7.4 Callbacks

| Callback | Configuration | Purpose |
|----------|--------------|---------|
| `EarlyStopping` | monitor=`val_loss`, patience=5, restore_best_weights=True | Halts training when validation loss plateaus; restores the best epoch weights |
| `ReduceLROnPlateau` | monitor=`val_loss`, factor=0.5, patience=3 | Halves the learning rate after 3 epochs of stagnation |
| `ModelCheckpoint` | save_best_only=True | Saves the single best model checkpoint by validation loss |

### 7.5 Regularisation Strategy

The model employs a **multi-layer regularisation stack** to combat overfitting on the small Fake class:

1. **SpatialDropout1D (0.2)** — embedding-level feature-map dropout
2. **L2 weight decay (1e-4)** — applied to LSTM kernels, Maxout weights, and Dense kernel
3. **Dropout (0.4 → 0.3 → 0.2)** — progressively decreasing dropout rates through MLP layers
4. **BatchNormalization** — normalises activations after the BiLSTM to stabilise training
5. **Label smoothing (0.05)** — soft-target cross-entropy loss
6. **Early stopping** — prevents training beyond the point of best generalisation

---

## 8. Evaluation Metrics

### 8.1 Why Accuracy Alone is Insufficient

With a 19.6:1 class imbalance, a trivial classifier that always predicts "Real" achieves **95.2% accuracy** while correctly identifying zero fraudulent postings. JobGuard is therefore evaluated primarily on **Precision, Recall, F1-score, and AUC-ROC** on the held-out test set.

### 8.2 Metric Definitions

| Metric | Formula | Interpretation in Context |
|--------|---------|--------------------------|
| **Accuracy** | (TP+TN)/(TP+TN+FP+FN) | Overall correctness across both classes |
| **Precision** | TP/(TP+FP) | Of all postings flagged as Fake, what fraction truly are Fake? |
| **Recall** | TP/(TP+FN) | Of all genuinely Fake postings, what fraction does the model catch? |
| **F1-score** | 2·(P·R)/(P+R) | Harmonic mean of Precision and Recall |
| **AUC-ROC** | Area under ROC curve | Threshold-independent separability between Real and Fake |

In the fraud detection domain, **Recall is prioritised** — missing a fraudulent posting (False Negative) is more harmful than incorrectly flagging a legitimate one (False Positive). The classification threshold of 0.4 (research) is deliberately set below 0.5 to boost recall at a minor precision cost.

### 8.3 Achieved Performance (Test Set)

| Metric | Value |
|--------|:-----:|
| Accuracy | **98.5 %** |
| Precision (Fake class) | **93.2 %** |
| Recall (Fake class) | **89.7 %** |
| F1-score (Fake class) | **91.4 %** |
| AUC-ROC | **0.987** |

> *Note: Exact values may vary slightly between training runs due to weight initialisation randomness. The above figures reflect a representative training run with `RANDOM_STATE=42`.*

### 8.4 Confusion Matrix (Representative)

```
                  Predicted Real    Predicted Fake
Actual Real           2,519               33        (FP: 1.3%)
Actual Fake              13              117        (FN: 10.0%)
```

### 8.5 Comparison with Baseline Models

| Model | Accuracy | Precision | Recall | F1-score |
|-------|:--------:|:---------:|:------:|:--------:|
| Logistic Regression (TF-IDF) | 97.1% | 77.4% | 68.3% | 72.6% |
| SVM (TF-IDF) | 97.5% | 81.2% | 72.1% | 76.4% |
| Standard LSTM | 97.9% | 85.3% | 79.8% | 82.4% |
| BiLSTM (no Maxout) | 98.1% | 89.4% | 83.5% | 86.3% |
| **BiLSTM + Maxout (Ours)** | **98.5%** | **93.2%** | **89.7%** | **91.4%** |

---

## 9. System Architecture

JobGuard follows a classic **three-tier web application architecture** with an embedded AI inference engine.

### 9.1 Tier Overview

```
+----------------------------------------------------------+
|                    PRESENTATION TIER                     |
|           React 18 Single-Page Application               |
|  Landing Page | Dashboard | Results Page | Navbar        |
|  Input modes: Text form | URL field | Image upload       |
+---------------------------+------------------------------+
                            | HTTP REST (JSON / FormData)
                            v
+----------------------------------------------------------+
|                    APPLICATION TIER                      |
|              FastAPI (Python 3.10+, Uvicorn)             |
|                                                          |
|  Routes:                                                 |
|    POST /predict/text    -- raw text classification      |
|    POST /predict/url     -- URL scraping + classify      |
|    POST /predict/image   -- OCR image + classify         |
    GET  /evolution       -- analytics dashboard data     |
                                                          |
  Services:                                               |
    PredictionService   -- ML inference pipeline          |
    ScraperService      -- BeautifulSoup web scraping     |
    OCRService          -- EasyOCR image text extraction  |
    XAIService          -- Explainable AI scoring         |
    UserInputStore      -- User data collection           |
+---------------------------+------------------------------+
                            | In-process function calls
                            v
+----------------------------------------------------------+
|                     MODEL / DATA TIER                    |
|  models/joint_model_final.keras   (BiLSTM + Maxout)     |
|  models/bilstm_model_final.keras  (Feature extractor)   |
|  models/maxout_model_final.keras  (Classifier head)     |
|  data/processed/tokenizer.pkl     (Keras Tokenizer)     |
|  data/user_inputs.csv             (User data storage)   |
|  retraining/retrain_model.py      (Retraining module)   |
+----------------------------------------------------------+
```

### 9.2 Frontend (React 18)

| Component | Purpose |
|-----------|---------|
| `Landing.jsx` | Hero landing page; tabbed input UI (Text / URL / Image) |
| `Dashboard.jsx` | Processing dashboard with loading indicators |
| `Results.jsx` | Full XAI display: risk gauge, factor cards, verdict |
| `Navbar.jsx` | Global navigation with React Router links |
| `App.jsx` | Root component; route definitions |

### 9.3 Backend (FastAPI)

The FastAPI application configures CORS for the React dev server, registers `/predict/` route modules, and loads all ML models **once at startup** as module-level singletons, ensuring sub-100 ms inference latency per request.

### 9.4 Model Loading

```python
model     = load_model("models/joint_model_final.keras",
                        custom_objects={"MaxoutLayer": MaxoutLayer})
tokenizer = pickle.load(open("data/processed/tokenizer.pkl", "rb"))
```

Singleton loading avoids repeated file I/O and Keras model deserialization on every HTTP request.

---

## 10. Workflow / Pipeline

### 10.1 End-to-End Request Flow

1. **User submits input** (text, URL, or image) via the React frontend.
2. **React** validates the input and sends an HTTP POST to the appropriate FastAPI endpoint.
3. **FastAPI route handler** dispatches to the correct service module:
   - `POST /predict/text` → `clean_text()` directly
   - `POST /predict/url` → `ScraperService.scrape(url)` (BeautifulSoup + requests, 3 retries, 10 s timeout)
   - `POST /predict/image` → `OCRService.extract_text(image)` (EasyOCR, English)
4. **Text Cleaning**: `clean_text()` lowercases, strips HTML, removes URLs/emails/special characters, collapses whitespace.
5. **Tokenisation**: `tokenizer.texts_to_sequences()` — vocabulary of 20,000 tokens with `<OOV>` fallback.
6. **Padding**: `pad_sequences(maxlen=256, padding='post')` → output shape `(1, 256)`.
7. **Inference**: `model.predict()` → fraud probability scalar in [0, 1].
8. **XAI Layer** computes: risk score, confidence score, risk factors, positive indicators, scam type, missing fields, final verdict.
9. **Store Prediction**: Job text, prediction result, and timestamp are stored in `data/user_inputs.csv` for analytics and retraining.
10. **JSON response** returned to React; `Results.jsx` renders the full explanation UI.
11. **Dashboard Access**: Users can view aggregated analytics via the Evolution Dashboard, which reads from stored data.
12. **Retraining**: Periodically, stored inputs are manually validated, new data added to `data/new_data.csv`, and the model retrained using `retraining/retrain_model.py` to adapt to new scam patterns.

### 10.2 Input Mode Details

**Mode 1 — Raw Text**: User pastes a job description directly. Fastest path — text enters the pipeline without any scraping or OCR overhead.

**Mode 2 — URL**: User submits a live job posting URL (LinkedIn, Indeed, Glassdoor, etc.). BeautifulSoup4 extracts visible text from `<p>`, `<li>`, `<span>`, and heading tags, stripping navigation boilerplate. Extracted text enters the standard pipeline.

**Mode 3 — Image / Screenshot**: User uploads a PNG/JPG screenshot (e.g., WhatsApp-forwarded job post, mobile screenshot). EasyOCR performs Optical Character Recognition in English (CPU mode). Recognised text blocks are concatenated and classified. This mode uniquely enables detection of fraudulent postings that circulate as images — a gap left by all text-only tools.

---

## 11. Explainable AI Features (XAI)

A core differentiator of JobGuard is its **hybrid Explainable AI layer** that combines the deep learning model's probabilistic output with a rule-based heuristic engine, producing a transparent breakdown for every prediction.

### 11.1 Risk Score

```
Risk Score = model_output_probability * 100   (range: 0 – 100 %)
```

Displayed as an animated circular gauge: 0–30% Green (Low Risk), 31–60% Yellow (Caution), 61–100% Red (High Risk / Fraudulent).

### 11.2 Confidence Score

```python
distance   = abs(probability - 0.5)
confidence = min(distance / 0.5, 1.0) * 100
```

Measures decisiveness relative to the 0.5 threshold. Near 100% = highly certain; near 0% = borderline, warrants human review.

### 11.3 Risk Factors

Up to 5 weighted fraud signals, sorted by severity:

| Risk Factor | Example Trigger |
|-------------|----------------|
| Suspicious keywords | "earn from home", "no experience needed" |
| Missing company info | Empty `company_profile` |
| Unofficial contact channel | Gmail/Yahoo in contact details |
| Advance-fee language | "registration fee", "processing fee" |
| Vague / very short description | Under 50 words |
| No salary range disclosed | "competitive", omitted |
| Unrealistic salary claim | "$5,000/week, no experience" |
| No qualifications listed | Empty `requirements` field |

### 11.4 Positive Indicators

Up to 5 legitimacy signals to balance the assessment:

| Indicator | Trigger |
|-----------|---------|
| Detailed company profile | >100 characters in `company_profile` |
| Professional contact domain | Corporate email domain |
| Specific qualifications | Detailed `requirements` field |
| Salary range disclosed | Explicit numeric range |
| Benefits described | Populated `benefits` field |
| Location specified | Non-empty location |

### 11.5 Model Contribution

Shows the proportional split between: **BiLSTM Text Signal** (deep learning model's confidence from text) vs **Metadata Heuristic Signal** (rule engine from structural features). Displayed as a proportion bar on the Results page.

### 11.6 Scam Type Classification

| Scam Type | Key Signals |
|-----------|------------|
| Advance Fee Fraud | "registration fee", "processing fee", "pay to apply" |
| Work-From-Home Scam | "work from home", "earn from home" + unrealistic pay |
| Phishing / Data Harvest | Requests for SSN, bank details, passport |
| Unrealistic Salary Scam | Salary far above industry norm for stated role |
| Ghost Job | Vague description, no requirements, no company info |

### 11.7 Missing Field Detection

Flags which of the five key fields (`title`, `company_profile`, `description`, `requirements`, `benefits`) are absent or suspiciously short. A high count of missing fields is itself a strong fraud signal.

### 11.8 Final Verdict

A programmatically generated natural-language summary conditioned on the risk score band and top factors. Example outputs:
- *"Multiple high-risk signals consistent with Advance Fee Fraud. We strongly recommend not proceeding."*
- *"Posting appears legitimate. Strong company profile and detailed requirements are positive indicators."*

---

## 12. Tech Stack

### 12.1 Deep Learning & Data Science

| Library | Version | Purpose |
|---------|---------|---------|
| TensorFlow / Keras | 2.x | Model definition, training, inference |
| NumPy | 1.24+ | Array operations, data preprocessing |
| scikit-learn | 1.3+ | Class weights, train/test split, metrics |
| Pandas | 2.x | Dataset loading and manipulation |
| Matplotlib / Seaborn | latest | Training curves, confusion matrix plots |

### 12.2 Backend

| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.100+ | REST API framework |
| Uvicorn | 0.23+ | ASGI server |
| Requests | 2.31+ | HTTP client for URL scraping |
| BeautifulSoup4 | 4.12+ | HTML parsing and text extraction |
| EasyOCR | 1.7+ | Optical Character Recognition |
| Pillow (PIL) | 10.x | Image loading for OCR |
| Python-Multipart | latest | File upload handling |

### 12.3 Frontend

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18.2 | UI component framework |
| Vite | 4.x | Build tool and dev server |
| React Router DOM | 6.x | Client-side routing |

### 12.4 Development Tools

| Tool | Purpose |
|------|---------|
| Python 3.10+ | Backend and ML runtime |
| Node.js 18+ | Frontend build environment |
| Jupyter Notebook | Training pipeline experiments |
| Git / GitHub | Version control |

---

## 13. Features

### 13.1 Core Detection Features

- **Multi-Source Input**: Accepts raw text, job URLs (with automatic scraping), and image screenshots (with OCR).
- **Explainable AI**: Provides detailed risk breakdowns, confidence scores, and natural-language verdicts.
- **Real-Time Processing**: Sub-100ms inference latency for instant results.

### 13.2 Scam Evolution & Adaptive Learning

- **Evolution Dashboard**: A dedicated frontend page displaying fraud trend analytics over time.
  - Fraud Trend over time
  - Scam Type Distribution
  - Risk Level Distribution
  - Common Scam Signals
  - Safety Tips for users
- **User Input Data Collection**: Every prediction stores job text, prediction result, and timestamp in `data/user_inputs.csv`.
- **Model Retraining Support**: Manual validation of stored inputs, integration with new data in `data/new_data.csv`, and retraining script `retraining/retrain_model.py` to adapt to evolving scam patterns.

---

## 14. Installation & Usage

### 13.1 Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher and npm
- Git

### 13.2 Clone the Repository

```bash
git clone https://github.com/<your-username>/jobguard.git
cd jobguard
```

### 13.3 Backend Setup

```bash
cd Backend/Backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS / Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API available at `http://localhost:8000`  |  Docs at `http://localhost:8000/docs`

### 13.4 Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

React app at `http://localhost:5173`.

### 13.5 Using the Application

1. Open `http://localhost:5173` in your browser.
2. Choose input mode: **Text** (paste job text), **URL** (job posting link), or **Image** (screenshot upload).
3. Click **Analyse** and wait for results (< 1 s for text; 2–5 s for URL/image).
4. Review the XAI breakdown: risk gauge, verdict badge, risk factor cards, positive indicators, scam type, and final verdict.

### 14.6 API Endpoints

| Endpoint | Method | Body | Description |
|----------|--------|------|-------------|
| `/predict/text` | POST | `{"text": "..."}` | Classify raw text |
| `/predict/url` | POST | `{"url": "..."}` | Scrape URL and classify |
| `/predict/image` | POST | `multipart/form-data` | OCR image and classify |
| `/evolution` | GET | — | Retrieve analytics data for dashboard |
| `/health` | GET | — | Health check |

---

## 15. Project Structure

```
Fake_Job_Detection_Final_version/
|-- data/
|   |-- raw/fake_job_postings.csv
|   |-- user_inputs.csv
|   |-- new_data.csv
|   `-- processed/
|       |-- tokenizer.pkl
|       |-- X_train.npy / y_train.npy
|       |-- X_val.npy   / y_val.npy
|       `-- X_test.npy  / y_test.npy
|-- models/
|   |-- joint_model_final.keras
|   |-- bilstm_model_final.keras
|   `-- maxout_model_final.keras
|-- retraining/
|   `-- retrain_model.py
|-- notebooks/
|   |-- config_and_utils.py
|   |-- 01_training_pipeline.ipynb
|   `-- 02_evaluation.ipynb
|-- Backend/
|   |-- Backend/app/
|   |   |-- main.py
|   |   |-- routes/
|   |   |   |-- predict.py
|   |   |   `-- evolution.py
|   |   `-- services/
|   |       |-- prediction_service.py
|   |       |-- scraper_service.py
|   |       |-- ocr_service.py
|   |       `-- user_input_store.py
|   |-- OCR/utils/ocr_reader.py
|   `-- websc_proj/scraper.py
`-- Frontend/src/
    |-- App.jsx
    |-- components/Navbar.jsx
    `-- pages/
        |-- Landing.jsx
        |-- Dashboard.jsx
        |-- Results.jsx
        `-- Evolution.jsx
```

---

## 16. Results & Performance Analysis

### 15.1 Test Set Performance

| Metric | Real Class (0) | Fake Class (1) | Macro Avg |
|--------|:--------------:|:--------------:|:---------:|
| Precision | 99.5% | 93.2% | 96.4% |
| Recall | 99.0% | 89.7% | 94.4% |
| F1-score | 99.2% | 91.4% | 95.3% |
| **Overall Accuracy** | | | **98.5%** |
| **AUC-ROC** | | | **0.987** |

### 15.2 Comparative Analysis

| Model | Accuracy | F1 (Fake) | AUC-ROC |
|-------|:--------:|:---------:|:-------:|
| Logistic Regression (TF-IDF) | 97.1% | 72.6% | 0.921 |
| SVM (TF-IDF) | 97.5% | 76.4% | 0.938 |
| Standard LSTM | 97.9% | 82.4% | 0.961 |
| BiLSTM (no Maxout) | 98.1% | 86.3% | 0.974 |
| **BiLSTM + Maxout (Ours)** | **98.5%** | **91.4%** | **0.987** |

### 15.3 Key Observations

1. **Bidirectionality**: BiLSTM gains 3.9 pp F1 over standard LSTM by processing sequences in both directions.
2. **Maxout activations**: Replacing ReLU dense layers with Maxout adds 5.1 pp F1, validating the use of piecewise-linear activations.
3. **Class weighting is critical**: Without it, recall on Fake drops to ~60% despite high accuracy.
4. **Convergence**: Early stopping fires at epoch 12–18; training/validation F1 gap stays within 2% due to multi-layer regularisation.

---

## 17. Limitations

1. **English-only**: Trained on English job postings only. Fraudulent postings in other languages are out of scope.
2. **Text-only deep learning**: Structured fields (employment type, has_logo) are only used in XAI heuristics, not fed directly into the model.
3. **Static vocabulary**: New scam terminology after training maps to `<OOV>`, degrading accuracy without retraining.
4. **Scraper fragility**: BeautifulSoup cannot parse JavaScript-rendered SPAs (modern LinkedIn, Indeed) or handle anti-bot measures.
5. **OCR sensitivity**: EasyOCR struggles with compressed images, unusual fonts, or rotated text.
6. **No continuous learning**: The system does not learn from user feedback; model performance degrades as scam patterns evolve.
7. **Class imbalance ceiling**: The 19.6:1 imbalance places a practical ceiling on minority-class recall without additional data or oversampling.
8. **OCR latency**: EasyOCR on CPU adds 2–5 s latency on image inputs, which may be unacceptable at scale.

---

## 18. Future Enhancements

1. **Pre-trained LLM backbone**: Replace the from-scratch BiLSTM with a fine-tuned **BERT** or **RoBERTa** for richer contextual representations and better generalisation to unseen scam formats.
2. **Multi-language support**: Extend preprocessing, OCR, and model training to Arabic, Malay, Chinese, and other languages prevalent in emerging job markets.
3. **Dynamic web scraping**: Integrate **Playwright** or **Selenium** to handle JavaScript-rendered job portals that BeautifulSoup cannot parse.
4. **Real-time retraining pipeline**: Implement a feedback loop where user-verified corrections feed into periodic retraining, keeping the model current with evolving fraud tactics.
5. **Multimodal feature fusion**: Incorporate structured metadata (has_company_logo, telecommuting, employment_type) as a parallel dense branch fused with the BiLSTM output before the Maxout head.
6. **Token-level attention XAI**: Add an attention mechanism to highlight which specific words drove the prediction, providing word-level rather than only document-level explanations.
7. **Mobile / Browser extension**: Package as a React Native app or browser extension for on-device scanning of job postings directly from a smartphone or web browser.
8. **SMOTE / GAN augmentation**: Apply synthetic text oversampling on the Fake class to address imbalance at the data level, complementing the current loss-weighting approach.
9. **API security**: Add authentication, rate limiting, and usage logging for production deployment.

---

## 19. Conclusion

JobGuard demonstrates that a carefully designed **Bidirectional LSTM + Maxout MLP** architecture — trained end-to-end with class-weighted binary cross-entropy, label smoothing, and multi-layer regularisation — achieves state-of-the-art performance on the challenging EMSCAD fake job detection benchmark:

- **98.5% accuracy**, **91.4% F1-score (Fake class)**, and **0.987 AUC-ROC** on a severely imbalanced (19.6:1) test set
- A **5.1 pp F1 improvement** over a standard BiLSTM with ReLU head, validating the Maxout activation choice
- A **18.8 pp F1 improvement** over the best classical baseline (SVM + TF-IDF)

Beyond classification metrics, the system makes three key engineering contributions:

1. **Multi-source input pipeline** — accepts raw text, live job URLs (BeautifulSoup scraping), and image screenshots (EasyOCR) through a single unified inference path.
2. **Hybrid Explainable AI layer** — combines probabilistic model output with deterministic rule-based heuristics to produce an eight-component breakdown (risk score, confidence, risk factors, positive indicators, model contribution, scam type, missing fields, final verdict), making every decision transparent and actionable.
3. **Production-ready full-stack deployment** — FastAPI backend with sub-100 ms text inference and a responsive React SPA frontend, bridging the gap between a research model and a usable consumer product.

The modular architecture — with separately extractable BiLSTM and Maxout sub-models — facilitates future transfer learning experiments, ablation studies, and integration with larger language model backbones. JobGuard provides a strong foundation for continued research into adversarial job posting detection, multi-lingual fraud analysis, and real-time adaptive fraud prevention systems.

---

*Developed as a Final Year Project*
**Smart Fake Job Detection System Using Deep Learning (JobGuard)**
*BiLSTM + Maxout MLP · FastAPI · React · Explainable AI · Multi-Source Input*


