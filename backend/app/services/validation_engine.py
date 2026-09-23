import re
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.policy import PolicyDocument, PolicyChunk
from app.models.rule_matrix import RuleMatrixEntry
from app.schemas.complaint import ComplaintInput
from app.schemas.genai import GenAIComplaintAnalysis
from app.schemas.validation import GroundTruthValidationResult, DiscrepancyItem

class GroundTruthValidationEngine:
    """
    Pipeline 2: 100% Deterministic, Zero-AI Python Ground-Truth Validation Engine.
    Independently verifies, overrides, and scores Pipeline 1 outputs against structured
    Rule Matrix boundaries and active policy chunks in SQLite.
    """

    # Comprehensive Hazard, Safety, and Legal Trigger Keywords
    SAFETY_HAZARD_KEYWORDS = [
        "fire", "smoke", "spark", "sparked", "burn", "burned", "burning",
        "explosion", "explode", "exploded", "shock", "electric shock",
        "chemical", "corrosive", "toxic", "poison", "injury", "injured",
        "hospital", "ambulance", "emergency", "doctor", "bleeding", "wound",
        "hazard", "battery swell", "battery pack", "melt", "melted"
    ]

    LEGAL_THREAT_KEYWORDS = [
        "lawsuit", "attorney", "lawyer", "police", "court", "subpoena",
        "sue you", "legal action", "litigation", "regulatory breach",
        "class action", "consumer protection board", "ftc complaint"
    ]

    # Screaming / Anger Profanity Regex (for Tone Bias Decoupling)
    SCREAMING_ANGER_PATTERNS = [
        r'\b(?:livid|furious|thieves|scam|scammers|crooks|heads roll|bastards|disgraceful)\b',
        r'[A-Z\s!]{10,}'  # All-caps screaming shout
    ]

    # Prohibited Action Compensation Regex Scanners
    PROHIBITED_COMPENSATION_PATTERNS = [
        (r'(?:credit|credited|deposit|deposited|transferred|transfer|refund|refunded|send|sent)\s*(?:\$\s*[0-9]+|[0-9]+\s*dollars?)\s*(?:cash|to your bank|into your account|direct deposit)', "Unauthorized direct cash/bank transfer promised"),
        (r'(?:refund\s*of\s*\$\s*([5-9][0-9]|[1-9][0-9]{2,}))\s*(?:without\s*requiring\s*return|no\s*return\s*needed|keep\s*the\s*item)', "Refund exceeding $50 without verified return"),
        (r'(?:admit|accept)\s*(?:full\s*)?(?:legal\s*liability|fault\s*in\s*court)', "Explicit admission of corporate legal liability"),
        (r'(?:promise|guarantee)\s*(?:24h|immediate)\s*replacement\s*for\s*standard\s*tier', "Unauthorized VIP SLA promised to standard customer"),
        (r'(?:close|closed)\s*(?:the\s*)?ticket\s*(?:immediately\s*)?(?:without\s*further\s*investigation|as\s*instructed)', "Premature closure triggered by customer injection")
    ]

    @classmethod
    def mask_pii(cls, text: str) -> str:
        """
        Sanitizes customer text by masking payment cards, phone numbers, and emails.
        Ensures compliance with TechWiz constraints (Page 7).
        """
        if not text:
            return ""
        # 1. Credit Card Numbers (13-16 digits with optional spaces or dashes)
        masked = re.sub(r'\b(?:\d{4}[-\s]?){3}\d{4}\b', '****-****-****-XXXX', text)
        # 2. Phone Numbers
        masked = re.sub(r'\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b', '***-***-XXXX', masked)
        # 3. Emails
        masked = re.sub(r'\b([A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@([A-Za-z0-9.-]+\.[A-Z|a-z]{2,})\b', r'\1***@\2', masked)
        return masked

    @classmethod
    def validate(
        cls,
        complaint: ComplaintInput,
        genai_output: GenAIComplaintAnalysis,
        db_session: Session
    ) -> GroundTruthValidationResult:
        """
        Executes complete deterministic validation pipeline.
        """
        discrepancies: List[DiscrepancyItem] = []
        raw_text = f"{complaint.complaint_title} {complaint.complaint_description}".lower()

        # ---------------------------------------------------------
        # Check 1: Master Rule Matrix Category & Subcategory Lookup
        # ---------------------------------------------------------
        rule_entries = db_session.query(RuleMatrixEntry).all()
        
        # Find best matching matrix entry for GenAI category
        matched_rule: Optional[RuleMatrixEntry] = None
        for rule in rule_entries:
            if rule.category.lower() == genai_output.issue_category.lower():
                matched_rule = rule
                break
        
        if not matched_rule and rule_entries:
            # Try fuzzy match or default to first rule
            for rule in rule_entries:
                if genai_output.issue_category.lower() in rule.category.lower():
                    matched_rule = rule
                    break

        if not matched_rule:
            # Fallback if no category matches
            matched_rule = rule_entries[0] if rule_entries else None
            discrepancies.append(DiscrepancyItem(
                field="issue_category",
                severity="CRITICAL",
                genai_value=genai_output.issue_category,
                ground_truth_value="Unknown Category",
                rule_code="RULE_CAT_UNKNOWN",
                description=f"Issue category '{genai_output.issue_category}' does not exist in master Rule Matrix."
            ))

        validated_category = matched_rule.category if matched_rule else genai_output.issue_category
        validated_subcategory = matched_rule.subcategory if matched_rule else genai_output.subcategory
        allowed_departments = matched_rule.allowed_departments if matched_rule else []

        # ---------------------------------------------------------
        # Check 2: Department Routing Verification
        # ---------------------------------------------------------
        routing_valid = False
        recommended_department = allowed_departments[0] if allowed_departments else "General Support"
        
        if allowed_departments:
            routing_valid = any(genai_output.department.strip().lower() == d.strip().lower() for d in allowed_departments)
            if not routing_valid:
                discrepancies.append(DiscrepancyItem(
                    field="department",
                    severity="CRITICAL",
                    genai_value=genai_output.department,
                    ground_truth_value=f"Allowed: {', '.join(allowed_departments)}",
                    rule_code="RULE_DEPT_ROUTING_MISMATCH",
                    description=f"Department '{genai_output.department}' is not permitted for category '{validated_category}'."
                ))

        # ---------------------------------------------------------
        # Check 3: Sentiment vs. Urgency Trap Decoupling Heuristics
        # ---------------------------------------------------------
        hazard_keywords_found: List[str] = []
        for kw in cls.SAFETY_HAZARD_KEYWORDS + cls.LEGAL_THREAT_KEYWORDS:
            # Disambiguate "fire the employee/courier/driver" from actual combustion/thermal fire hazard
            if kw == "fire":
                if re.search(r'\bfire\s+(?:the|this|that|him|her|them|your|an?)\s+[a-z]+', raw_text):
                    continue
            if re.search(r'\b' + re.escape(kw) + r'\b', raw_text):
                hazard_keywords_found.append(kw)

        hazard_detected = len(hazard_keywords_found) > 0
        calculated_urgency = genai_output.urgency
        calculated_priority = genai_output.priority
        urgency_overridden = False
        priority_overridden = False
        tone_bias_detected = False

        # Trap 1: Calm P0 / Hazard Trap (Customer calm or polite, but hazard present)
        if hazard_detected:
            if genai_output.urgency != "Critical":
                calculated_urgency = "Critical"
                urgency_overridden = True
                discrepancies.append(DiscrepancyItem(
                    field="urgency",
                    severity="CRITICAL",
                    genai_value=genai_output.urgency,
                    ground_truth_value="Critical",
                    rule_code="RULE_HAZARD_OVERRIDE_URGENCY",
                    description=f"Deterministic Hazard Override: Raw complaint contains safety/legal triggers ({', '.join(hazard_keywords_found[:3])}). Enforcing Critical Urgency despite calm tone.",
                    is_overridden=True
                ))

            if genai_output.priority != "P1":
                calculated_priority = "P1"
                priority_overridden = True
                discrepancies.append(DiscrepancyItem(
                    field="priority",
                    severity="CRITICAL",
                    genai_value=genai_output.priority,
                    ground_truth_value="P1",
                    rule_code="RULE_HAZARD_OVERRIDE_PRIORITY",
                    description="Deterministic Priority Override: Life-safety or legal hazard detected; P1 SLA required.",
                    is_overridden=True
                ))
                
            # If hazard, routing must be to Emergency Response or Safety department
            if "Emergency Response" in allowed_departments and genai_output.department != "Emergency Response":
                recommended_department = "Emergency Response"

        # Trap 2: Screaming P4 Tone Bias Trap (Angry/profane over trivial issue with NO safety/legal hazard)
        is_angry = genai_output.sentiment in ["Severely Distressed", "Negative"]
        has_anger_cues = any(re.search(p, complaint.complaint_description, re.IGNORECASE) for p in cls.SCREAMING_ANGER_PATTERNS)
        
        if not hazard_detected and (is_angry or has_anger_cues):
            # Check if issue is low-impact delivery or cosmetic inquiry
            is_low_impact = any(k in raw_text for k in ["sock", "socks", "t-shirt", "30 minutes", "color shade", "packaging dent", "minor delay"])
            if is_low_impact and genai_output.priority in ["P1", "P2"]:
                calculated_priority = "P4"
                calculated_urgency = "Low"
                priority_overridden = True
                urgency_overridden = True
                tone_bias_detected = True
                discrepancies.append(DiscrepancyItem(
                    field="priority",
                    severity="WARNING",
                    genai_value=genai_output.priority,
                    ground_truth_value="P4",
                    rule_code="RULE_TONE_BIAS_SUPPRESSION",
                    description="Sentiment vs. Urgency Trap Decoupled: Customer hostility/screaming on trivial low-risk item dampened from P1/P2 to P4 SLA.",
                    is_overridden=True
                ))

        # Check 3.5: Repeat Customer Priority Escalation (FR lvii-lviii, Step 54)
        is_repeat_customer = (complaint.previous_complaints_count or 0) >= 2
        if is_repeat_customer and not hazard_detected:
            if calculated_priority in ["P3", "P4"]:
                previous_priority = calculated_priority
                calculated_priority = "P2"
                priority_overridden = True
                discrepancies.append(DiscrepancyItem(
                    field="priority",
                    severity="WARNING",
                    genai_value=genai_output.priority,
                    ground_truth_value="P2",
                    rule_code="RULE_REPEAT_CUSTOMER_ESCALATION",
                    description=f"Repeat Customer Escalation: Customer has {complaint.previous_complaints_count} unresolved complaints within 30 days. Priority elevated from {previous_priority} to P2.",
                    is_overridden=True
                ))

        # ---------------------------------------------------------
        # Check 4: Mandatory Escalation Enforcement
        # ---------------------------------------------------------
        mandatory_escalation_triggered = False
        escalation_triggers_matched: List[str] = []
        missing_mandatory_escalation = False

        # Scan custom escalation triggers from Rule Matrix
        if matched_rule and matched_rule.mandatory_escalation_triggers:
            for trigger in matched_rule.mandatory_escalation_triggers:
                if re.search(r'\b' + re.escape(trigger.lower()) + r'\b', raw_text):
                    mandatory_escalation_triggered = True
                    escalation_triggers_matched.append(trigger)

        if hazard_detected:
            mandatory_escalation_triggered = True
            escalation_triggers_matched.extend([kw for kw in hazard_keywords_found if kw not in escalation_triggers_matched])

        if mandatory_escalation_triggered and not genai_output.escalation_required:
            missing_mandatory_escalation = True
            discrepancies.append(DiscrepancyItem(
                field="escalation_required",
                severity="CRITICAL",
                genai_value=False,
                ground_truth_value=True,
                rule_code="RULE_MISSING_MANDATORY_ESCALATION",
                description=f"Missing Mandatory Escalation: Trigger words tripped ({', '.join(escalation_triggers_matched[:3])}), but GenAI set escalation_required=False.",
                is_overridden=True
            ))

        # ---------------------------------------------------------
        # Check 5: Source Traceability & Version Integrity Check
        # ---------------------------------------------------------
        policy_citation_valid = False
        policy_version_status = "NotFound"
        policy_doc_title = None
        policy_section_heading = None
        policy_chunk_content = None

        cited_doc_id = genai_output.policy_id.strip()
        cited_section = genai_output.policy_section.strip()

        db_doc = db_session.query(PolicyDocument).filter(PolicyDocument.doc_id == cited_doc_id).first()
        if not db_doc:
            discrepancies.append(DiscrepancyItem(
                field="policy_id",
                severity="CRITICAL",
                genai_value=cited_doc_id,
                ground_truth_value="Valid Active Policy ID",
                rule_code="RULE_SOURCE_SUPPORT_MISSING",
                description=f"Source Support Missing (Hallucination): Policy ID '{cited_doc_id}' does not exist in master policy database."
            ))
        else:
            policy_doc_title = db_doc.doc_title
            policy_version_status = db_doc.status
            if db_doc.status in ["Superseded", "Deprecated"]:
                discrepancies.append(DiscrepancyItem(
                    field="policy_id",
                    severity="CRITICAL",
                    genai_value=f"{cited_doc_id} ({db_doc.version})",
                    ground_truth_value=f"Active Policy ({matched_rule.active_policy_id if matched_rule else 'Active'})",
                    rule_code="RULE_OUTDATED_SOURCE_DETECTED",
                    description=f"Outdated Source Detected: GenAI cited policy '{cited_doc_id}' which has status '{db_doc.status}' ({db_doc.version})."
                ))
            else:
                # Query chunk
                chunk = db_session.query(PolicyChunk).filter(
                    PolicyChunk.doc_id == cited_doc_id
                ).first()
                if chunk:
                    policy_section_heading = chunk.heading
                    policy_chunk_content = chunk.content
                policy_citation_valid = True

        # ---------------------------------------------------------
        # Check 6: Prohibited & Mandatory Action Scanner
        # ---------------------------------------------------------
        prohibited_actions_detected: List[str] = []
        combined_genai_text = f"{genai_output.professional_response} {' '.join(genai_output.resolution_steps)}"

        for pattern, explanation in cls.PROHIBITED_COMPENSATION_PATTERNS:
            if re.search(pattern, combined_genai_text, re.IGNORECASE):
                prohibited_actions_detected.append(explanation)

        # Check against rule matrix prohibited actions
        if matched_rule and matched_rule.prohibited_actions:
            for prohibited in matched_rule.prohibited_actions:
                if re.search(r'\b' + re.escape(prohibited.lower()) + r'\b', combined_genai_text.lower()):
                    if prohibited not in prohibited_actions_detected:
                        prohibited_actions_detected.append(prohibited)

        if prohibited_actions_detected:
            discrepancies.append(DiscrepancyItem(
                field="prohibited_actions",
                severity="CRITICAL",
                genai_value="Prohibited Action Included",
                ground_truth_value="Zero Prohibited Actions",
                rule_code="RULE_PROHIBITED_ACTION_DETECTED",
                description=f"Prohibited Action Detected: Draft response contains forbidden commitment: {'; '.join(prohibited_actions_detected)}."
            ))

        # Mandatory Action Coverage Check
        mandatory_actions_total = len(matched_rule.mandatory_actions) if (matched_rule and matched_rule.mandatory_actions) else 0
        mandatory_actions_covered: List[str] = []
        mandatory_actions_missing: List[str] = []

        if matched_rule and matched_rule.mandatory_actions:
            for m_action in matched_rule.mandatory_actions:
                # Check semantic/lexical overlap in genai resolution_steps
                action_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', m_action.lower()))
                covered = False
                for step in genai_output.resolution_steps:
                    step_words = set(re.findall(r'\b[a-zA-Z]{4,}\b', step.lower()))
                    overlap = action_words.intersection(step_words)
                    if len(overlap) >= max(1, len(action_words) // 2):
                        covered = True
                        break
                if covered:
                    mandatory_actions_covered.append(m_action)
                else:
                    mandatory_actions_missing.append(m_action)

            if mandatory_actions_missing:
                discrepancies.append(DiscrepancyItem(
                    field="mandatory_actions",
                    severity="WARNING" if len(mandatory_actions_covered) > 0 else "CRITICAL",
                    genai_value=f"Missing {len(mandatory_actions_missing)} required steps",
                    ground_truth_value=f"Cover all {mandatory_actions_total} steps",
                    rule_code="RULE_REQUIREMENT_MISSING",
                    description=f"Requirement Missing: The following mandatory steps were omitted from resolution steps: {'; '.join(mandatory_actions_missing)}."
                ))

        # ---------------------------------------------------------
        # Check 7: Mathematical Score Calculation Engine
        # ---------------------------------------------------------
        # Mandatory Requirement Coverage Score: (Covered / Total) * 100
        if mandatory_actions_total > 0:
            coverage_score = round((len(mandatory_actions_covered) / mandatory_actions_total) * 100.0, 1)
        else:
            coverage_score = 100.0

        # Source Traceability Score: 100% if active, 0% if hallucinated or outdated
        traceability_score = 100.0 if (policy_citation_valid and policy_version_status == "Active") else 0.0

        # Routing Consistency Score: 100% if strictly allowed, 0% otherwise
        routing_score = 100.0 if routing_valid else 0.0

        # Overall Confidence Score: Weighted composite (40% coverage, 30% traceability, 30% routing)
        overall_confidence_score = round(
            (0.40 * coverage_score) + (0.30 * traceability_score) + (0.30 * routing_score), 1
        )

        # ---------------------------------------------------------
        # Synthesis & Final Ticket Status Determination
        # ---------------------------------------------------------
        has_critical = any(d.severity == "CRITICAL" for d in discrepancies)
        has_warning = any(d.severity == "WARNING" for d in discrepancies)

        # Status assignment priority:
        if policy_version_status == "NotFound":
            final_status = "Source Support Missing"
            block_automated_dispatch = True
            reason_for_blocking = "Hallucinated or non-existent policy cited."
        elif policy_version_status in ["Superseded", "Deprecated"]:
            final_status = "Outdated Source"
            block_automated_dispatch = True
            reason_for_blocking = "Outdated or superseded policy citation detected."
        elif prohibited_actions_detected:
            final_status = "Manual Review Required"
            block_automated_dispatch = True
            reason_for_blocking = f"Prohibited commitment detected: {prohibited_actions_detected[0]}"
        elif missing_mandatory_escalation or (hazard_detected and urgency_overridden):
            final_status = "Manual Review Required"
            block_automated_dispatch = True
            reason_for_blocking = "Life-safety or legal hazard requires human supervisor sign-off."
        elif not routing_valid:
            final_status = "Manual Review Required"
            block_automated_dispatch = True
            reason_for_blocking = f"Department routing mismatch: '{genai_output.department}' not allowed."
        elif mandatory_actions_missing and coverage_score == 0:
            final_status = "Requirement Missing"
            block_automated_dispatch = True
            reason_for_blocking = "Zero mandatory resolution steps were addressed."
        elif mandatory_actions_missing and coverage_score > 0:
            final_status = "Partially Verified"
            block_automated_dispatch = False
            reason_for_blocking = None
        elif has_warning:
            final_status = "Verified with Warning"
            block_automated_dispatch = False
            reason_for_blocking = None
        else:
            final_status = "Verified"
            block_automated_dispatch = False
            reason_for_blocking = None

        return GroundTruthValidationResult(
            complaint_id=complaint.complaint_id or genai_output.complaint_id,
            validated_category=validated_category,
            validated_subcategory=validated_subcategory,
            allowed_departments=allowed_departments,
            routing_valid=routing_valid,
            recommended_department=recommended_department,
            hazard_detected=hazard_detected,
            hazard_keywords_found=hazard_keywords_found,
            tone_bias_detected=tone_bias_detected,
            calculated_urgency=calculated_urgency,
            calculated_priority=calculated_priority,
            urgency_overridden=urgency_overridden,
            priority_overridden=priority_overridden,
            mandatory_escalation_triggered=mandatory_escalation_triggered,
            escalation_triggers_matched=escalation_triggers_matched,
            missing_mandatory_escalation=missing_mandatory_escalation,
            policy_citation_valid=policy_citation_valid,
            policy_version_status=policy_version_status,
            policy_doc_title=policy_doc_title,
            policy_section_heading=policy_section_heading,
            policy_chunk_content=policy_chunk_content,
            prohibited_actions_detected=prohibited_actions_detected,
            mandatory_actions_total=mandatory_actions_total,
            mandatory_actions_covered=mandatory_actions_covered,
            mandatory_actions_missing=mandatory_actions_missing,
            coverage_score=coverage_score,
            traceability_score=traceability_score,
            routing_score=routing_score,
            overall_confidence_score=overall_confidence_score,
            discrepancies=discrepancies,
            final_status=final_status,
            block_automated_dispatch=block_automated_dispatch,
            reason_for_blocking=reason_for_blocking
        )

validation_engine = GroundTruthValidationEngine()
