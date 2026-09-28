"""Semantic Retrieval Engine for Relevant Policy Chunks."""
from typing import List, Dict, Any
import numpy as np
from knowledge_base.embeddings import embedding_generator

class SemanticRetriever:
    def __init__(self):
        self.chunks: List[Dict[str, Any]] = []

    def set_chunks(self, chunks: List[Dict[str, Any]]):
        self.chunks = chunks

    def retrieve_relevant(self, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
        if not self.chunks:
            return []
        q_vec = np.array(embedding_generator.generate_embedding(query))
        scored = []
        for c in self.chunks:
            c_vec = np.array(embedding_generator.generate_embedding(c.get("content", "")))
            sim = float(np.dot(q_vec, c_vec))
            # Keyword bonus
            words = set(query.lower().split())
            c_words = set(c.get("content", "").lower().split())
            overlap = len(words.intersection(c_words))
            score = sim + (overlap * 0.05)
            scored.append((score, c))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]

retriever = SemanticRetriever()
