
# ══════════════════════════════════════════════════════════════════
#  FILE 1 — config_and_utils.py
#  Contains: Configuration, Text Cleaning, MaxoutLayer
#  Import this in ALL other files
# ══════════════════════════════════════════════════════════════════

import os, re, pickle
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, regularizers


# ── GPU Setup ──────────────────────────────────────────────────────
gpus = tf.config.list_physical_devices('GPU')
if gpus:
    try:
        for gpu in gpus:
            tf.config.experimental.set_memory_growth(gpu, True)
        print("GPU detected:", gpus)
    except RuntimeError as e:
        print(e)
else:
    print("No GPU detected. Running on CPU.")


# # ── Configuration ──────────────────────────────────────────────────
# DATASET_PATH        = "../data/raw/fake_job_postings.csv"
# # DATA_DIR            = "../data/processed_data"
# MODEL_DIR           = "../models"
# # JOINT_MODEL_PATH    = os.path.join(MODEL_DIR, "joint_model.keras")
# JOINT_MODEL_PATH    = "Final\models\joint_model_final.keras"
# # EXTRACTOR_PATH      = os.path.join(MODEL_DIR, "bilstm_model.keras")
# EXTRACTOR_PATH      = "Final\models\bilstm_model_final.keras"
# # MAXOUT_PATH         = os.path.join(MODEL_DIR, "maxout_model.keras")
# MAXOUT_PATH         = "Final\models\maxout_model_final.keras"
# # TOKENIZER_PATH      = os.path.join(DATA_DIR,  "tokenizer.pkl")
# TOKENIZER_PATH      = "Final\data\processed\tokenizer.pkl"

# ── Configuration ──────────────────────────────────────────────────

DATASET_PATH = "../data/raw/fake_job_postings.csv"

MODEL_DIR = "../models"

JOINT_MODEL_PATH = "../models/joint_model_final.keras"

EXTRACTOR_PATH = "../models/bilstm_model_final.keras"

MAXOUT_PATH = "../models/maxout_model_final.keras"

TOKENIZER_PATH = "../data/processed/tokenizer.pkl"


# # ── Configuration ──────────────────────────────────────────────────
# DATASET_PATH        = "../data/raw/fake_job_postings.csv"
# DATA_DIR            = "../data/processed"
# MODEL_DIR           = "../models"
# JOINT_MODEL_PATH    = "Final\models\joint_model_final.keras"
# EXTRACTOR_PATH      = "Final\models\bilstm_model_final.keras"
# MAXOUT_PATH         = "Final\models\maxout_model_final.keras"
# TOKENIZER_PATH      = "Final\data\processed\tokenizer.pkl"


VOCAB_SIZE          = 20_000
MAX_SEQUENCE_LENGTH = 256
EMBEDDING_DIM       = 128
LSTM_UNITS          = 128

BATCH_SIZE          = 64
EPOCHS              = 30
PATIENCE            = 5
LR                  = 1e-3
L2                  = 1e-4
LABEL_SMOOTHING     = 0.05
THRESHOLD           = 0.4
RANDOM_STATE        = 42

TEXT_COLS = ["title", "company_profile", "description", "requirements", "benefits"]


# ── Text Cleaning ──────────────────────────────────────────────────
def clean_text(text: str) -> str:
    """Remove HTML, URLs, emails, special chars from real job posting text."""
    if not isinstance(text, str):
        text = str(text) if text is not None else ""
    text = text.lower()
    text = re.sub(r"<[^>]+>",               " ", text)
    text = re.sub(r"&[a-z]+;",              " ", text)
    text = re.sub(r"https?://\S+|www\.\S+", " ", text)
    text = re.sub(r"\S+@\S+",               " ", text)
    text = re.sub(r"[^a-z0-9\s]",           " ", text)
    text = re.sub(r"\s+",                   " ", text).strip()
    return text


# ── Custom Maxout Layer ────────────────────────────────────────────
class MaxoutLayer(layers.Layer):
    """
    Maxout activation (Goodfellow et al., 2013).
    Each output unit takes the max over `num_pieces` linear projections.
    """
    def __init__(self, units: int, num_pieces: int = 2, l2: float = 1e-4, **kwargs):
        super().__init__(**kwargs)
        self.units      = units
        self.num_pieces = num_pieces
        self.l2_val     = l2

    def build(self, input_shape):
        input_dim = int(input_shape[-1])
        reg = regularizers.l2(self.l2_val)
        self.W = self.add_weight(
            name="W", shape=(input_dim, self.units * self.num_pieces),
            initializer="glorot_uniform", regularizer=reg, trainable=True)
        self.b = self.add_weight(
            name="b", shape=(self.units * self.num_pieces,),
            initializer="zeros", trainable=True)
        super().build(input_shape)

    def call(self, inputs):
        z = tf.matmul(inputs, self.W) + self.b
        z = tf.reshape(z, (-1, self.units, self.num_pieces))
        return tf.reduce_max(z, axis=-1)

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units, "num_pieces": self.num_pieces, "l2": self.l2_val})
        return cfg
