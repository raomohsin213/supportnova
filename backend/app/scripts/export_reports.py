"""
SupportNova Report Exporter (Step 1 Deliverables)
Exports:
1. reports/complaint_dataset_500.csv
2. reports/rule_matrix_100.csv
3. reports/benchmark_100_comparison_report.csv
"""

import json
import csv
import shutil
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
DATA_DIR = ROOT_DIR / "data"
REPORTS_DIR = ROOT_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def export_complaints_500_csv():
    json_path = DATA_DIR / "complaints_500.json"
    csv_path = REPORTS_DIR / "complaint_dataset_500.csv"
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"[Export] Writing {len(data)} complaints to {csv_path.name}...")
    headers = [
        "Complaint ID", "Customer Name", "Customer Tier", "Channel",
        "Complaint Title", "Complaint Description", "Product / Service",
        "Order Reference", "Expected Category", "Expected Urgency",
        "Expected Priority", "Expected Department", "Is Adversarial", "Adversarial Type"
    ]
    
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for item in data:
            writer.writerow([
                item.get("complaint_id", ""),
                item.get("customer_name", ""),
                item.get("customer_tier", ""),
                item.get("channel", ""),
                item.get("complaint_title", ""),
                item.get("complaint_description", ""),
                item.get("product_or_service", ""),
                item.get("order_reference", ""),
                item.get("expected_category", ""),
                item.get("expected_urgency", ""),
                item.get("expected_priority", ""),
                item.get("expected_department", ""),
                "YES" if item.get("is_adversarial") else "NO",
                item.get("adversarial_type", "None")
            ])
    print(f"[Export] Saved: {csv_path} ({csv_path.stat().st_size:,} bytes)")


def export_rule_matrix_100_csv():
    json_path = DATA_DIR / "rule_matrix_100.json"
    csv_path = REPORTS_DIR / "rule_matrix_100.csv"
    
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    print(f"[Export] Writing {len(data)} rules to {csv_path.name}...")
    headers = [
        "Rule ID", "Category", "Subcategory", "Variation Name",
        "Default Department", "Allowed Departments", "Default Urgency",
        "Default Priority", "SLA Target (Hours)", "Active Policy ID",
        "Requires Human Review", "Mandatory Escalation Triggers",
        "Prohibited Actions", "Mandatory Actions"
    ]
    
    with open(csv_path, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        for item in data:
            allowed_depts = "; ".join(item.get("allowed_departments", []))
            triggers = "; ".join(item.get("mandatory_escalation_triggers", []))
            prohibited = "; ".join(item.get("prohibited_actions", []))
            mandatory = "; ".join(item.get("mandatory_actions", []))
            
            writer.writerow([
                item.get("rule_id", ""),
                item.get("category", ""),
                item.get("subcategory", ""),
                item.get("variation_name", ""),
                item.get("default_department", ""),
                allowed_depts,
                item.get("default_urgency", ""),
                item.get("default_priority", ""),
                item.get("sla_target_hours", 24),
                item.get("active_policy_id", ""),
                "YES" if item.get("requires_human_review") else "NO",
                triggers or "None",
                prohibited or "None",
                mandatory or "None"
            ])
    print(f"[Export] Saved: {csv_path} ({csv_path.stat().st_size:,} bytes)")


def export_benchmark_100_csv():
    target_csv = REPORTS_DIR / "benchmark_100_comparison_report.csv"
    existing_csv = REPORTS_DIR / "comparison_report_100_cases.csv"
    
    if existing_csv.exists():
        print(f"[Export] Copying existing benchmark report to {target_csv.name}...")
        shutil.copyfile(existing_csv, target_csv)
    else:
        print(f"[Export] Generating fresh 100-case comparison report...")
        from app.scripts.generate_100_case_report import generate_report
        generate_report()
        if existing_csv.exists():
            shutil.copyfile(existing_csv, target_csv)
            
    print(f"[Export] Saved: {target_csv} ({target_csv.stat().st_size:,} bytes)")


if __name__ == "__main__":
    print("\nSupportNova CSV Exporter")
    print("=" * 60)
    export_complaints_500_csv()
    export_rule_matrix_100_csv()
    export_benchmark_100_csv()
    print("=" * 60)
    print("All Step 1 CSV reports exported successfully in reports/\n")
