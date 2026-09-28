"""Rule Loader for SupportNova Rule Matrix and Taxonomy."""
import json
from pathlib import Path
from typing import Dict, Any, List

RULES_DIR = Path(__file__).resolve().parent

def load_categories() -> List[Dict[str, Any]]:
    path = RULES_DIR / "categories.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f).get("categories", [])
    return []

def load_rule_matrix() -> List[Dict[str, Any]]:
    path = RULES_DIR / "rule_matrix.json"
    if path.exists():
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f).get("rules", [])
    return []

def get_rule_by_id(rule_id: str) -> Dict[str, Any]:
    rules = load_rule_matrix()
    for r in rules:
        if r.get("rule_id") == rule_id:
            return r
    return {}
