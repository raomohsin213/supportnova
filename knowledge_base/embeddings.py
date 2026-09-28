"""Vector Embedding Generator for Policy Knowledge Base."""
import numpy as np
from typing import List

class EmbeddingGenerator:
    def __init__(self, dim: int = 128):
        self.dim = dim

    def generate_embedding(self, text: str) -> List[float]:
        # Deterministic lightweight term hash embedding for fast vector search
        vec = np.zeros(self.dim, dtype=np.float32)
        words = text.lower().split()
        for w in words:
            idx = hash(w) % self.dim
            vec[idx] += 1.0
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm
        return vec.tolist()

embedding_generator = EmbeddingGenerator()
