"""
SupportNova 100-Case GenAI vs. Python Comparison Report Generator
Adheres strictly to SRS Section 1.10 Item 8 & Page 12:
- Processes 100 unseen customer complaint cases through both Pipeline 1 & Pipeline 2
- Records Complaint ID, Expected Category, GenAI Category, Python Category,
  GenAI Department, Python Department, GenAI Urgency, Python Urgency,
  GenAI Escalation, Python Escalation, Policy Reference, Match/Mismatch,
  Verification Status, and Explanation of Disagreement
- Saves results to reports/comparison_report_100_cases.json and reports/comparison_report_100_cases.csv
"""

import asyncio
import json
import csv
import sys
from pathlib import Path

# Add backend directory to sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.database import SyncSessionLocal
from app.schemas.complaint import ComplaintInput
from app.services.genai_pipeline import genai_pipeline
from app.services.validation_engine import validation_engine
from app.services.diff_engine import diff_engine

ROOT_DIR = BACKEND_DIR.parent
DATA_PATH = ROOT_DIR / "data" / "complaints_500.json"
REPORTS_DIR = ROOT_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

JSON_OUT_PATH = REPORTS_DIR / "comparison_report_100_cases.json"
CSV_OUT_PATH = REPORTS_DIR / "comparison_report_100_cases.csv"

def generate_report():
    print(f"[Report Gen] Loading complaints from {DATA_PATH}...")
    if not DATA_PATH.exists():
        raise FileNotFoundError(f"Complaints dataset missing: {DATA_PATH}")

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        all_complaints = json.load(f)

    # Select 100 complaints
    sample_100 = all_complaints[:100]
    print(f"[Report Gen] Running dual-pipeline evaluation over {len(sample_100)} cases...")

    db = SyncSessionLocal()
    report_rows = []

    try:
        matches_count = 0
        mismatches_count = 0
        overrides_count = 0

        for idx, item in enumerate(sample_100):
            c_input = ComplaintInput(
                complaint_id=item["complaint_id"],
                customer_name=item["customer_name"],
                customer_tier=item["customer_tier"],
                channel=item["channel"],
                complaint_title=item["complaint_title"],
                complaint_description=item["complaint_description"],
                product_or_service=item.get("product_or_service", "General Equipment"),
                order_reference=item.get("order_reference", f"ORD-{idx:04d}"),
                transaction_date="2026-03-01",
                previous_complaints_count=item.get("previous_complaints_count", 0)
            )

            # Pipeline 1: GenAI
            genai_res = asyncio.run(genai_pipeline.analyze(c_input))

            # Pipeline 2: Ground Truth
            val_res = validation_engine.validate(c_input, genai_res, db)

            # Pipeline Comparison
            diff = diff_engine.generate_diff(c_input, genai_res, val_res)

            is_match = (val_res.final_status == "Verified")
            if is_match:
                matches_count += 1
            else:
                mismatches_count += 1
                if val_res.urgency_overridden or val_res.priority_overridden:
                    overrides_count += 1

            disagreement_explanation = "Complete alignment across all fields and active policy citations."
            if not is_match:
                critical_discrepancies = [d.description for d in val_res.discrepancies if d.severity == "CRITICAL"]
                if critical_discrepancies:
                    disagreement_explanation = " | ".join(critical_discrepancies)
                elif val_res.discrepancies:
                    disagreement_explanation = " | ".join([d.description for d in val_res.discrepancies])
                else:
                    disagreement_explanation = f"Status set to {val_res.final_status} based on deterministic rules."

            row = {
                "complaint_id": item["complaint_id"],
                "actual_expected_category": item.get("expected_category", val_res.validated_category),
                "genai_category": genai_res.issue_category,
                "python_expected_category": val_res.validated_category,
                "genai_department": genai_res.department,
                "python_department": val_res.recommended_department,
                "genai_urgency": genai_res.urgency,
                "python_urgency": val_res.calculated_urgency,
                "genai_escalation": genai_res.escalation_required,
                "python_escalation": val_res.mandatory_escalation_triggered,
                "policy_reference": f"{genai_res.policy_id} ({val_res.policy_version_status})",
                "match_mismatch": "MATCH" if is_match else "MISMATCH / OVERRIDE",
                "verification_status": val_res.final_status,
                "coverage_score": val_res.coverage_score,
                "traceability_score": val_res.traceability_score,
                "routing_score": val_res.routing_score,
                "explanation_of_disagreement": disagreement_explanation
            }
            report_rows.append(row)

            if (idx + 1) % 25 == 0:
                print(f"  Processed {idx + 1}/100 cases...")

        # Write JSON report
        summary = {
            "total_cases_analyzed": len(report_rows),
            "clean_matches": matches_count,
            "mismatches_and_overrides": mismatches_count,
            "deterministic_safety_overrides": overrides_count,
            "match_rate_percentage": round((matches_count / len(report_rows)) * 100.0, 2),
            "generated_at": "2026-09-23T04:00:00Z",
            "cases": report_rows
        }
        JSON_OUT_PATH.write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(f"[Report Gen] Successfully wrote JSON report to {JSON_OUT_PATH}")

        # Write CSV report
        with open(CSV_OUT_PATH, "w", newline="", encoding="utf-8-sig") as f:
            fieldnames = [
                "complaint_id",
                "actual_expected_category",
                "genai_category",
                "python_expected_category",
                "genai_department",
                "python_department",
                "genai_urgency",
                "python_urgency",
                "genai_escalation",
                "python_escalation",
                "policy_reference",
                "match_mismatch",
                "verification_status",
                "coverage_score",
                "traceability_score",
                "routing_score",
                "explanation_of_disagreement"
            ]
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in report_rows:
                writer.writerow(r)
        print(f"[Report Gen] Successfully wrote CSV report to {CSV_OUT_PATH}")

    finally:
        db.close()

if __name__ == "__main__":
    generate_report()
