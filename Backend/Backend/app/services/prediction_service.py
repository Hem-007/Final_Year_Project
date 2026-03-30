import pickle
from functools import lru_cache
from pathlib import Path

import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, regularizers
from tensorflow.keras.models import load_model

from app.services.preprocess_service import MAX_SEQUENCE_LENGTH, prepare_for_model

ROOT_DIR = Path(__file__).resolve().parents[4]
MODEL_PATH = ROOT_DIR / "models" / "joint_model_final.keras"
TOKENIZER_PATH = ROOT_DIR / "data" / "processed" / "tokenizer.pkl"
PREDICTION_THRESHOLD = 0.5


class MaxoutLayer(layers.Layer):
    def __init__(self, units: int, num_pieces: int = 2, l2: float = 1e-4, **kwargs):
        super().__init__(**kwargs)
        self.units = units
        self.num_pieces = num_pieces
        self.l2_val = l2

    def build(self, input_shape):
        input_dim = int(input_shape[-1])
        reg = regularizers.l2(self.l2_val)
        self.W = self.add_weight(
            name="W",
            shape=(input_dim, self.units * self.num_pieces),
            initializer="glorot_uniform",
            regularizer=reg,
            trainable=True,
        )
        self.b = self.add_weight(
            name="b",
            shape=(self.units * self.num_pieces,),
            initializer="zeros",
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs):
        z = tf.matmul(inputs, self.W) + self.b
        z = tf.reshape(z, (-1, self.units, self.num_pieces))
        return tf.reduce_max(z, axis=-1)

    def get_config(self):
        config = super().get_config()
        config.update(
            {"units": self.units, "num_pieces": self.num_pieces, "l2": self.l2_val}
        )
        return config


class PredictionPipeline:
    def __init__(self):
        self.max_sequence_length = MAX_SEQUENCE_LENGTH
        self.tokenizer = self._load_tokenizer()
        self.model = self._load_model()

    def _load_tokenizer(self):
        if not TOKENIZER_PATH.exists():
            raise FileNotFoundError(f"Tokenizer not found at {TOKENIZER_PATH}")

        with TOKENIZER_PATH.open("rb") as tokenizer_file:
            return pickle.load(tokenizer_file)

    def _load_model(self):
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model not found at {MODEL_PATH}")

        model = load_model(
            MODEL_PATH,
            custom_objects={"MaxoutLayer": MaxoutLayer},
            compile=False,
        )
        model.make_predict_function()
        return model

    def _calculate_risk_level(self, fraud_probability: float) -> str:
        if fraud_probability > 0.75:
            return "High"
        if fraud_probability >= 0.5:
            return "Medium"
        return "Low"

    def _calculate_confidence(self, fraud_probability: float) -> str:
        certainty = abs(fraud_probability - PREDICTION_THRESHOLD) * 2
        if certainty >= 0.6:
            return "High"
        if certainty >= 0.3:
            return "Medium"
        return "Low"

    def _build_recommendation(self, prediction: str, risk_level: str) -> str:
        if prediction == "Fake Job":
            if risk_level == "High":
                return "This job post shows strong scam indicators. Avoid sharing personal or financial information until the employer is independently verified."
            return "This job post shows some scam-related characteristics. Verify the company, recruiter identity, and contact channels before continuing."

        if risk_level == "Low":
            return "This job post appears legitimate based on the current model output, but you should still verify the employer and application process."

        return "This job post leans legitimate, but some caution is still advised. Confirm the employer, job details, and communication channels before proceeding."

    def predict_text(self, user_text: str, input_source: str = "text") -> dict:
        cleaned_text, padded_sequences = prepare_for_model(
            user_text,
            self.tokenizer,
            max_len=self.max_sequence_length,
        )
        probabilities = self.model.predict(padded_sequences, verbose=0)
        fraud_probability = float(np.asarray(probabilities).reshape(-1)[0])
        prediction = "Fake Job" if fraud_probability >= PREDICTION_THRESHOLD else "Real Job"
        risk_level = self._calculate_risk_level(fraud_probability)
        confidence = self._calculate_confidence(fraud_probability)

        return {
            "prediction": prediction,
            "fraud_probability": round(fraud_probability, 4),
            "confidence": confidence,
            "risk_level": risk_level,
            "input_source": input_source,
            "cleaned_text_length": len(cleaned_text),
            "recommendation": self._build_recommendation(prediction, risk_level),
        }


@lru_cache(maxsize=1)
def get_prediction_pipeline() -> PredictionPipeline:
    return PredictionPipeline()


def predict_text(user_text: str, input_source: str = "text") -> dict:
    return get_prediction_pipeline().predict_text(user_text, input_source=input_source)
