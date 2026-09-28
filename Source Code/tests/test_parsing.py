try:
    import pytest
except ImportError:
    pytest = None
import sys, os
sys.path.insert(0, str(os.path.abspath("Source Code")))
from document_processing.chunker import document_chunker

def test_chunking():
    chunks = document_chunker.chunk_policy("Section 1.0 Scope\nThis is policy content.\n\nSection 2.0 Return\nReturn within 14 days.", "POL-01")
    assert len(chunks) >= 1
