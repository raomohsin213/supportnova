"""Follow-up Action Validator."""
from typing import Tuple

class FollowupValidator:
    @staticmethod
    def validate_followup(has_pending_actions: bool, followup_scheduled: bool) -> Tuple[bool, str]:
        if has_pending_actions and not followup_scheduled:
            return False, "Ticket has pending actions but no follow-up is scheduled"
        return True, "Follow-up workflow verified"

followup_validator = FollowupValidator()
