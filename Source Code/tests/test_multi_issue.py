import os
import json
from pathlib import Path

try:
    import pytest
except ImportError:
    pytest = None

def test_multi_department_hierarchy():
    rules_path = Path("Source Code/routing_rules/multi_department_rules.json")
    if not rules_path.exists():
        rules_path = Path(__file__).resolve().parent.parent / "routing_rules" / "multi_department_rules.json"
    with open(rules_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    assert "Legal & Risk Management" in data["priority_hierarchy"]
