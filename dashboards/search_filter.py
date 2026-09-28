"""Real-Time Search and Multi-Dimensional Filter Service."""
from typing import List, Dict, Any

class SearchFilterService:
    @staticmethod
    def filter_tickets(tickets: List[Dict[str, Any]], query: str = "", category: str = "", urgency: str = "") -> List[Dict[str, Any]]:
        results = tickets
        if query:
            q = query.lower()
            results = [t for t in results if q in t.get("complaint_text", "").lower() or q in t.get("ticket_id", "").lower()]
        if category:
            results = [t for t in results if t.get("category") == category]
        if urgency:
            results = [t for t in results if t.get("urgency") == urgency]
        return results

search_filter_service = SearchFilterService()
