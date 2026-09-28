"""Policy Versioning and Deprecation Control."""
from datetime import datetime
from typing import Dict, Any, List

class PolicyVersionControl:
    @staticmethod
    def create_version_tag(major: int, minor: int, is_active: bool = True) -> str:
        status = "Active" if is_active else "Deprecated"
        return f"v{major}.{minor}-{status}"

    @staticmethod
    def is_superseded(old_version: str, new_version: str) -> bool:
        try:
            v_old = [int(x) for x in old_version.split("-")[0].replace("v", "").split(".")]
            v_new = [int(x) for x in new_version.split("-")[0].replace("v", "").split(".")]
            return v_new > v_old
        except Exception:
            return False

policy_version_control = PolicyVersionControl()
