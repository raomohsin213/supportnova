import math
import re
from typing import List, Dict, Any, Optional
import numpy as np
from app.config import settings

class VectorStoreService:
    """
    High-performance semantic vector and lexical retrieval engine for policy chunks.
    Provides semantic ranking, exact citation traceability, and fast top-k retrieval.
    """
    _instance = None

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            cls._instance = super(VectorStoreService, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        self.chunks_db: Dict[str, Dict[str, Any]] = {}
        self.vocabulary: Dict[str, int] = {}
        self.idf: Dict[str, float] = {}
        self._initialized = True

    def _tokenize(self, text: str) -> List[str]:
        # Clean and tokenize words (including alphanumeric codes like DEL-POL-04, P1, etc.)
        tokens = re.findall(r'\b[a-zA-Z0-9_\-]{2,}\b', text.lower())
        return tokens

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        """
        Adds or updates policy chunks in the vector index.
        """
        for chunk in chunks:
            chunk_id = chunk["chunk_id"]
            self.chunks_db[chunk_id] = {
                "chunk_id": chunk_id,
                "doc_id": chunk.get("doc_id", ""),
                "section_id": chunk.get("section_id", ""),
                "heading": chunk.get("heading", ""),
                "content": chunk.get("content", ""),
                "category": chunk.get("category", ""),
                "version": chunk.get("version", ""),
                "status": chunk.get("status", "Active")
            }
        self._recompute_index()

    def remove_doc(self, doc_id: str) -> None:
        """
        Removes all chunks associated with a doc_id.
        """
        to_del = [cid for cid, c in self.chunks_db.items() if c.get("doc_id") == doc_id]
        for cid in to_del:
            del self.chunks_db[cid]
        self._recompute_index()

    def _recompute_index(self) -> None:
        """
        Computes TF-IDF index across all active and indexed chunks for fast vector cosine ranking.
        """
        doc_count = len(self.chunks_db)
        if doc_count == 0:
            return

        vocab = set()
        doc_token_counts: Dict[str, Dict[str, int]] = {}
        doc_freq: Dict[str, int] = {}

        for cid, chunk in self.chunks_db.items():
            full_text = f"{chunk.get('heading', '')} {chunk.get('section_id', '')} {chunk.get('category', '')} {chunk.get('content', '')}"
            tokens = self._tokenize(full_text)
            counts: Dict[str, int] = {}
            for t in tokens:
                counts[t] = counts.get(t, 0) + 1
            doc_token_counts[cid] = counts
            for t in counts:
                doc_freq[t] = doc_freq.get(t, 0) + 1
                vocab.add(t)

        self.vocabulary = {t: idx for idx, t in enumerate(sorted(vocab))}
        self.idf = {t: math.log((1 + doc_count) / (1 + doc_freq.get(t, 0))) + 1.0 for t in vocab}

        # Vector representations
        self.vectors: Dict[str, np.ndarray] = {}
        vocab_size = len(self.vocabulary)
        if vocab_size == 0:
            return

        for cid, counts in doc_token_counts.items():
            vec = np.zeros(vocab_size, dtype=np.float32)
            total = sum(counts.values()) or 1
            for t, count in counts.items():
                if t in self.vocabulary:
                    tf = count / total
                    vec[self.vocabulary[t]] = tf * self.idf.get(t, 1.0)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec /= norm
            self.vectors[cid] = vec

    def search(
        self,
        query: str,
        top_k: int = 3,
        category: Optional[str] = None,
        only_active: bool = False
    ) -> List[Dict[str, Any]]:
        """
        Searches index and returns top-k semantic matches with score.
        """
        if not self.chunks_db or not hasattr(self, 'vectors') or not self.vectors:
            return []

        q_tokens = self._tokenize(query)
        if not q_tokens:
            # Fallback to returning first top_k
            return list(self.chunks_db.values())[:top_k]

        vocab_size = len(self.vocabulary)
        q_vec = np.zeros(vocab_size, dtype=np.float32)
        q_counts: Dict[str, int] = {}
        for t in q_tokens:
            q_counts[t] = q_counts.get(t, 0) + 1
        q_total = len(q_tokens)

        for t, count in q_counts.items():
            if t in self.vocabulary:
                tf = count / q_total
                q_vec[self.vocabulary[t]] = tf * self.idf.get(t, 1.0)
        q_norm = np.linalg.norm(q_vec)
        if q_norm > 0:
            q_vec /= q_norm

        scored: List[Tuple[float, Dict[str, Any]]] = []
        for cid, chunk in self.chunks_db.items():
            if only_active and chunk.get("status") != "Active":
                continue
            if category and chunk.get("category", "").lower() != category.lower():
                continue

            doc_vec = self.vectors.get(cid)
            if doc_vec is not None and q_norm > 0:
                sim = float(np.dot(q_vec, doc_vec))
            else:
                sim = 0.0

            # Boost exact keyword matches for safety, legal, or policy IDs
            chunk_text = f"{chunk.get('heading', '')} {chunk.get('content', '')}".lower()
            for token in q_tokens:
                if len(token) > 3 and token in chunk_text:
                    sim += 0.05

            scored.append((sim, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        results = [item[1] for item in scored[:top_k]]
        return results

vector_store = VectorStoreService()
