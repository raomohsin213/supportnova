"""
SupportNova Automated 100-Case Benchmark Evaluator (SRS Deliverable 8)
Executes dual-pipeline audit across 100 unseen complaints, compiles comparison matrix,
and exports directly to CSV / Excel compatible formats.
"""

import io
import csv
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.ticket import ComplaintTicket

class BenchmarkRunnerService:
    """
    Automated benchmark evaluation engine strictly implementing Aptech TechWiz 7
    SRS Section 1.10 Item 8 (GenAI and Python Comparison Report).
    """

    _cached_result: Optional[Dict[str, Any]] = None

    @classmethod
    def run_100_audit(cls, db: Session, limit: int = 100) -> Dict[str, Any]:
        """
        Gathers 100 complaint cases from database, evaluates GenAI vs Python Ground Truth,
        and generates the full audit matrix and summary telemetry.
        """
        # Fetch 100 tickets
        tickets = db.query(ComplaintTicket).order_by(ComplaintTicket.complaint_id.asc()).limit(limit).all()
        if not tickets:
            return {
                "total_evaluated": 0,
                "perfect_matches": 0,
                "mismatches_intercepted": 0,
                "quarantines_enforced": 0,
                "audit_matrix": []
            }

        audit_matrix: List[Dict[str, Any]] = []
        perfect_matches = 0
        mismatches_intercepted = 0
        quarantines_enforced = 0
        cat_matches = 0
        dept_matches = 0
        urgency_matches = 0
        esc_matches = 0
        total_traceability = 0.0
        total_coverage = 0.0
        total_confidence = 0.0

        for t in tickets:
            genai = t.genai_output
            val = t.validation_output

            genai_cat = genai.get("issue_category", "Unknown")
            py_cat = val.get("validated_category", t.complaint_title)
            
            genai_dept = genai.get("department", "Unknown")
            py_dept = val.get("recommended_department", t.assigned_department or "Customer Relations")
            allowed_depts = val.get("allowed_departments", [])

            genai_urgency = genai.get("urgency", "Medium")
            py_urgency = val.get("calculated_urgency", t.final_urgency or "Medium")

            genai_esc = genai.get("escalation_required", False)
            py_esc = val.get("mandatory_escalation_triggered", False)

            policy_ref = f"{genai.get('policy_id', 'None')} ({val.get('policy_version_status', 'Unknown')})"

            # Match checks
            c_match = (genai_cat.strip().lower() == py_cat.strip().lower())
            d_match = (genai_dept.strip().lower() in [d.strip().lower() for d in allowed_depts]) or (genai_dept.strip().lower() == py_dept.strip().lower())
            u_match = (genai_urgency.strip().lower() == py_urgency.strip().lower())
            e_match = (genai_esc == py_esc)

            if c_match: cat_matches += 1
            if d_match: dept_matches += 1
            if u_match: urgency_matches += 1
            if e_match: esc_matches += 1

            total_traceability += t.traceability_score or 0.0
            total_coverage += t.coverage_score or 0.0
            total_confidence += t.overall_confidence_score or 0.0

            is_quarantined = t.is_automated_dispatch_blocked
            if is_quarantined:
                quarantines_enforced += 1

            # Determine match status and detailed explanation
            discrepancy_reasons = []
            if val.get("hazard_detected") and val.get("urgency_overridden"):
                discrepancy_reasons.append("Calm Hazard Tone Decoupling: Python enforced Critical P1 over calm phrasing")
            if val.get("tone_bias_detected"):
                discrepancy_reasons.append("Screaming Tone Dampening: Python dampened rage caps to P4 Low")
            if val.get("policy_version_status") in ["Superseded", "Deprecated"]:
                discrepancy_reasons.append(f"Outdated Policy Citation: GenAI cited superseded {genai.get('policy_id')}")
            if val.get("policy_version_status") == "NotFound":
                discrepancy_reasons.append(f"Hallucinated Policy Citation: {genai.get('policy_id')} not in SQLite")
            if val.get("prohibited_actions_detected"):
                discrepancy_reasons.append(f"Prohibited Commitment: {val.get('prohibited_actions_detected')[0]}")
            if not d_match:
                discrepancy_reasons.append(f"Routing Mismatch: GenAI assigned '{genai_dept}', allowed are {allowed_depts}")
            if not e_match:
                discrepancy_reasons.append(f"Escalation Mismatch: GenAI={genai_esc}, Python={py_esc}")
            if t.is_duplicate:
                discrepancy_reasons.append(f"Duplicate Complaint: Matches prior ticket {t.duplicate_of_id}")

            if not discrepancy_reasons and c_match and d_match and u_match and e_match:
                match_status = "PERFECT_MATCH"
                explanation = "GenAI analysis fully verified and compliant with Python Ground-Truth Rule Matrix."
                perfect_matches += 1
            else:
                match_status = "MISMATCH_INTERCEPTED" if is_quarantined else "PARTIAL_MATCH"
                explanation = "; ".join(discrepancy_reasons) if discrepancy_reasons else "Minor parametric difference within acceptable governance bounds."
                mismatches_intercepted += 1

            audit_matrix.append({
                "complaint_id": t.complaint_id,
                "customer_name": t.customer_name,
                "actual_expected_category": py_cat,
                "genai_category": genai_cat,
                "python_category": py_cat,
                "category_match": c_match,
                "genai_department": genai_dept,
                "python_department": py_dept,
                "department_match": d_match,
                "genai_urgency": genai_urgency,
                "python_urgency": py_urgency,
                "urgency_match": u_match,
                "genai_escalation": "Yes" if genai_esc else "No",
                "python_escalation": "Yes" if py_esc else "No",
                "escalation_match": e_match,
                "policy_reference": policy_ref,
                "traceability_score": t.traceability_score,
                "coverage_score": t.coverage_score,
                "match_status": match_status,
                "verification_status": t.status,
                "is_quarantined": is_quarantined,
                "explanation": explanation
            })

        total = len(tickets)
        summary = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "total_evaluated": total,
            "perfect_matches": perfect_matches,
            "mismatches_intercepted": mismatches_intercepted,
            "quarantines_enforced": quarantines_enforced,
            "accuracy_metrics": {
                "overall_match_rate": round((perfect_matches / total) * 100, 1) if total else 0.0,
                "category_alignment_pct": round((cat_matches / total) * 100, 1) if total else 0.0,
                "department_alignment_pct": round((dept_matches / total) * 100, 1) if total else 0.0,
                "urgency_alignment_pct": round((urgency_matches / total) * 100, 1) if total else 0.0,
                "escalation_alignment_pct": round((esc_matches / total) * 100, 1) if total else 0.0,
                "avg_policy_traceability": round(total_traceability / total, 1) if total else 0.0,
                "avg_sop_coverage": round(total_coverage / total, 1) if total else 0.0,
                "avg_confidence_score": round(total_confidence / total, 1) if total else 0.0
            },
            "audit_matrix": audit_matrix
        }

        cls._cached_result = summary
        return summary

    @classmethod
    def get_latest(cls, db: Session) -> Dict[str, Any]:
        """Returns cached benchmark results or runs if not yet executed."""
        if cls._cached_result is None:
            return cls.run_100_audit(db)
        return cls._cached_result

    @classmethod
    def export_csv(cls, audit_matrix: List[Dict[str, Any]]) -> str:
        """Exports the 14-column comparison report as CSV (SRS Deliverable 8)."""
        output = io.StringIO()
        fieldnames = [
            "Complaint ID",
            "Actual/Expected Category",
            "GenAI Category",
            "Python Expected Category",
            "GenAI Department",
            "Python Department",
            "GenAI Urgency",
            "Python Urgency",
            "GenAI Escalation",
            "Python Escalation",
            "Policy Reference",
            "Traceability %",
            "Match/Mismatch Status",
            "Verification Status",
            "Dispatch Quarantined",
            "Explanation of Disagreement"
        ]
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()

        for row in audit_matrix:
            writer.writerow({
                "Complaint ID": row.get("complaint_id", ""),
                "Actual/Expected Category": row.get("actual_expected_category", ""),
                "GenAI Category": row.get("genai_category", ""),
                "Python Expected Category": row.get("python_category", ""),
                "GenAI Department": row.get("genai_department", ""),
                "Python Department": row.get("python_department", ""),
                "GenAI Urgency": row.get("genai_urgency", ""),
                "Python Urgency": row.get("python_urgency", ""),
                "GenAI Escalation": row.get("genai_escalation", ""),
                "Python Escalation": row.get("python_escalation", ""),
                "Policy Reference": row.get("policy_reference", ""),
                "Traceability %": f"{row.get('traceability_score', 0)}%",
                "Match/Mismatch Status": row.get("match_status", ""),
                "Verification Status": row.get("verification_status", ""),
                "Dispatch Quarantined": "YES (LOCKED)" if row.get("is_quarantined") else "NO (CLEARED)",
                "Explanation of Disagreement": row.get("explanation", "")
            })

        return output.getvalue()

benchmark_runner = BenchmarkRunnerService()
