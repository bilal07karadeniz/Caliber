import numpy as np
from typing import Optional

_model = None


def _get_model():
    global _model
    if _model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            print(f"Warning: Could not load sentence-transformers model: {e}")
            _model = "unavailable"
    return _model


class EmbeddingService:
    def encode_text(self, text: str) -> Optional[np.ndarray]:
        model = _get_model()
        if model == "unavailable" or model is None:
            return None
        try:
            return model.encode(text, convert_to_numpy=True)
        except Exception:
            return None

    def encode_batch(self, texts: list[str]) -> Optional[np.ndarray]:
        model = _get_model()
        if model == "unavailable" or model is None:
            return None
        try:
            return model.encode(texts, convert_to_numpy=True)
        except Exception:
            return None

    def cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        if vec_a is None or vec_b is None:
            return 0.0
        dot = np.dot(vec_a, vec_b)
        norm = np.linalg.norm(vec_a) * np.linalg.norm(vec_b)
        if norm == 0:
            return 0.0
        return float(dot / norm)


embedding_service = EmbeddingService()
