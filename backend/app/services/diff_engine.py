from typing import Dict, Any, List
from app.schemas.complaint import ComplaintInput
from app.schemas.genai import GenAIComplaintAnalysis
from app.schemas.validation import GroundTruthValidationResult

class DualPipelineDiffEngine:
    """
    Module 5: Dual-Pipeline Comparison & Conflict Resolution Engine.
    Performs field-by-field diff comparison, assigns visual pill statuses,
    and calculates governance synthesis.
    """

    @classmethod
    def generate_diff(
        cls,
        complaint: ComplaintInput,
        genai: GenAIComplaintAnalysis,
        validation: GroundTruthValidationResult
    ) -> Dict[str, Any]:
        """
        Builds side-by-side diff structure with visual indicator flags.
        """
        field_comparisons = []

        # 1. Issue Category
        cat_match = genai.issue_category.lower() == validation.validated_category.lower()
        field_comparisons.append({
            "field": "Category",
            "field_key": "category",
            "p1_value": genai.issue_category,
            "p2_value": validation.validated_category,
            "status": "MATCH" if cat_match else "DISCREPANCY",
            "pill_variant": "green" if cat_match else "red",
            "explanation": "Exact category alignment with Master Rule Matrix." if cat_match else f"Classified as '{genai.issue_category}' but Rule Matrix defines '{validation.validated_category}'."
        })

        # 2. Subcategory
        sub_match = genai.subcategory.lower() == validation.validated_subcategory.lower()
        field_comparisons.append({
            "field": "Subcategory",
            "field_key": "subcategory",
            "p1_value": genai.subcategory,
            "p2_value": validation.validated_subcategory,
            "status": "MATCH" if sub_match else "WARNING",
            "pill_variant": "green" if sub_match else "amber",
            "explanation": "Subcategory aligned." if sub_match else "Subcategory nuance difference."
        })

        # 3. Department Routing
        dept_match = validation.routing_valid
        field_comparisons.append({
            "field": "Department Routing",
            "field_key": "department",
            "p1_value": genai.department,
            "p2_value": f"Allowed: {', '.join(validation.allowed_departments)}",
            "status": "MATCH" if dept_match else "OVERRIDE",
            "pill_variant": "green" if dept_match else "red",
            "explanation": f"Permitted in organizational routing matrix." if dept_match else f"Routing Mismatch: '{genai.department}' is not in allowed departments."
        })

        # 4. Urgency
        urgency_match = not validation.urgency_overridden
        field_comparisons.append({
            "field": "Urgency Assessment",
            "field_key": "urgency",
            "p1_value": genai.urgency,
            "p2_value": validation.calculated_urgency,
            "status": "MATCH" if urgency_match else "OVERRIDE",
            "pill_variant": "green" if urgency_match else "red",
            "explanation": "Urgency rating accepted." if urgency_match else f"Deterministic Override: Triggered by safety/hazard decoupling heuristics ({genai.urgency} -> {validation.calculated_urgency})."
        })

        # 5. Priority / SLA
        prio_match = not validation.priority_overridden
        field_comparisons.append({
            "field": "SLA Priority",
            "field_key": "priority",
            "p1_value": genai.priority,
            "p2_value": validation.calculated_priority,
            "status": "MATCH" if prio_match else ("WARNING" if validation.tone_bias_detected else "OVERRIDE"),
            "pill_variant": "green" if prio_match else ("amber" if validation.tone_bias_detected else "red"),
            "explanation": "SLA priority validated." if prio_match else (
                f"Tone Bias Decoupled: Rage shouting suppressed ({genai.priority} -> {validation.calculated_priority})"
                if validation.tone_bias_detected else
                f"Safety Risk Escalation ({genai.priority} -> {validation.calculated_priority})"
            )
        })

        # 6. Policy Citation & Version
        cit_match = validation.policy_citation_valid and validation.policy_version_status == "Active"
        field_comparisons.append({
            "field": "Policy Citation Traceability",
            "field_key": "policy_id",
            "p1_value": f"{genai.policy_id} ({genai.policy_section})",
            "p2_value": f"{validation.policy_version_status} Status in SQLite",
            "status": "MATCH" if cit_match else ("OVERRIDE" if validation.policy_version_status == "NotFound" else "WARNING"),
            "pill_variant": "green" if cit_match else ("red" if validation.policy_version_status == "NotFound" else "amber"),
            "explanation": "Exact citation verified in active policy store." if cit_match else (
                f"Source Support Missing (Hallucination): Policy '{genai.policy_id}' not found." if validation.policy_version_status == "NotFound" else
                f"Outdated Source Detected: Status is '{validation.policy_version_status}'."
            )
        })

        # 7. Escalation Trigger
        esc_match = not validation.missing_mandatory_escalation
        field_comparisons.append({
            "field": "Escalation Required",
            "field_key": "escalation_required",
            "p1_value": str(genai.escalation_required),
            "p2_value": str(validation.mandatory_escalation_triggered),
            "status": "MATCH" if esc_match else "OVERRIDE",
            "pill_variant": "green" if esc_match else "red",
            "explanation": "Escalation status aligned." if esc_match else f"Missing Mandatory Escalation: Trigger words tripped ({', '.join(validation.escalation_triggers_matched)})."
        })

        # 8. Prohibited Actions
        has_prohibited = len(validation.prohibited_actions_detected) > 0
        field_comparisons.append({
            "field": "Prohibited Commitments",
            "field_key": "prohibited_actions",
            "p1_value": "Action Included" if (genai.prohibited_action_detected or has_prohibited) else "Clean Draft",
            "p2_value": "Zero Prohibited Commitments Allowed",
            "status": "DISCREPANCY" if has_prohibited else "MATCH",
            "pill_variant": "red" if has_prohibited else "green",
            "explanation": "Response adheres to legal and financial compliance rules." if not has_prohibited else f"Forbidden Promise Blocked: {'; '.join(validation.prohibited_actions_detected)}"
        })

        # 9. Mandatory Action Coverage
        cov_match = len(validation.mandatory_actions_missing) == 0
        field_comparisons.append({
            "field": "Mandatory Steps Coverage",
            "field_key": "mandatory_actions",
            "p1_value": f"{len(validation.mandatory_actions_covered)} / {validation.mandatory_actions_total} Covered",
            "p2_value": f"100% Required ({validation.mandatory_actions_total} steps)",
            "status": "MATCH" if cov_match else ("WARNING" if validation.coverage_score > 0 else "DISCREPANCY"),
            "pill_variant": "green" if cov_match else ("amber" if validation.coverage_score > 0 else "red"),
            "explanation": f"Full mandatory coverage ({validation.coverage_score}%)." if cov_match else f"Missing steps: {'; '.join(validation.mandatory_actions_missing)}"
        })

        return {
            "complaint_id": complaint.complaint_id or genai.complaint_id,
            "overall_status": validation.final_status,
            "dispatch_blocked": validation.block_automated_dispatch,
            "block_reason": validation.reason_for_blocking,
            "scores": {
                "coverage_score": validation.coverage_score,
                "traceability_score": validation.traceability_score,
                "routing_score": validation.routing_score,
                "overall_confidence": validation.overall_confidence_score
            },
            "field_comparisons": field_comparisons,
            "critical_discrepancy_count": sum(1 for c in field_comparisons if c["status"] in ["OVERRIDE", "DISCREPANCY"]),
            "warning_count": sum(1 for c in field_comparisons if c["status"] == "WARNING"),
            "match_count": sum(1 for c in field_comparisons if c["status"] == "MATCH")
        }

diff_engine = DualPipelineDiffEngine()
