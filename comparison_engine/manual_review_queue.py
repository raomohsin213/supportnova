"""Manual Review Queue Manager."""
from typing import List, Dict, Any

class ManualReviewQueueManager:
    def __init__(self):
        self.queue: List[Dict[str, Any]] = []

    def enqueue(self, ticket_id: str, discrepancy_reason: str, score: float):
        item = {"ticket_id": ticket_id, "reason": discrepancy_reason, "score": score, "status": "Pending Review"}
        self.queue.append(item)
        return item

    def get_pending(self) -> List[Dict[str, Any]]:
        return [item for item in self.queue if item["status"] == "Pending Review"]

manual_review_queue = ManualReviewQueueManager()
