# Team Contribution Record & Verification Sign-Off
**SupportNova — Enterprise AI Complaint Intelligence & Autonomous Governance**  
**Aptech TechWiz 7 — Theme: ResponseX Intelligence | Category: Generative AI PowerPlay**  
**SRS Reference:** Section 1.10 (Item 18 & 19)

---

## 1. Team Roster & Module Ownership

| Member Name | Primary Competition Role | Core Modules & Responsibilities | Key Deliverables & Code |
| :--- | :--- | :--- | :--- |
| **Team Lead / AI Architect** | Principal Systems Architect | Dual-Pipeline design, Gemini 2.0 Flash prompt engineering, XML delimiter isolation, schema validation. | `backend/app/services/genai_pipeline.py`<br>`backend/app/schemas/`<br>`BLOG.md` |
| **Senior Python Engineer** | Ground-Truth Governance Lead | Pipeline 2 deterministic engine, tone decoupling heuristics, safety hazard scanners, version checks. | `backend/app/services/validation_engine.py`<br>`backend/app/services/diff_engine.py`<br>`data/rule_matrix_100.json` |
| **Full-Stack Engineer** | Frontend & UI/UX Specialist | React 18 SPA, Tailwind CSS v4, Diff Inspector, Policy Drawer, Review Queue, Multi-channel switcher. | `frontend/src/views/`<br>`frontend/src/components/`<br>`frontend/src/services/api.js` |
| **Data & QA Engineer** | Test Automation & Data Lead | Policy ingestion, document chunking, 500 complaints dataset, 100-case comparison report, pytest suite. | `backend/tests/`<br>`data/policies/`<br>`data/complaints_500.json`<br>`reports/` |

---

## 2. Five-Day Development Breakdown & Git Milestone Log

In accordance with SRS Section 1.8 Item 16 ("Meaningful commits must occur across all five competition days"):

* **Day 1 (Foundations & Fictional Org Architecture)**:
  * Established fictional enterprise support domain and core organizational hierarchy.
  * Formulated database schemas for `users`, `policies`, `chunks`, `rule_matrix`, and `tickets`.
  * Initialized FastAPI asynchronous backend with SQLAlchemy 2.0 ORM and SQLite.
* **Day 2 (Document Ingestion & Multi-Channel Intake)**:
  * Implemented logical section chunker in `document_parser.py` supporting `.pdf`, `.docx`, and `.txt`.
  * Built semantic vector store for top-3 relevant policy section context retrieval.
  * Engineered 4-channel complaint intake switcher (Web Form, Email Simulator, Live Chat Mock, File Upload).
* **Day 3 (The Dual Pipelines & Isolated Prompts)**:
  * Developed Pipeline 1 with Google Gemini 2.0 Flash and strict XML tag isolation (`<complaint_text>`).
  * Developed Pipeline 2 (Zero-AI Ground Truth Engine) with Rule Matrix validation and precedence logic.
  * Authored the 6 canonical adversarial test cases (Injection, Calm Hazard, Screaming P4, Outdated Citation, Prohibited Action, Clean Match).
* **Day 4 (Tone Decoupling, Diff Inspector & Review Queue)**:
  * Formalized and implemented the mathematical Tone Decoupling heuristics (`Calm P0` and `Screaming P4`).
  * Built the Diff Inspector in React with real-time indicator pills (`MATCH`, `OVERRIDE`, `DISCREPANCY`).
  * Created the slide-out Policy Citation Drawer and Quarantined Review Queue.
* **Day 5 (Datasets, Deliverables & Final Hardening)**:
  * Generated 500+ customer complaint dataset (`data/complaints_500.json`) and 20+ policy documents (`data/policies/`).
  * Executed 100-case evaluation report (`reports/comparison_report_100_cases.json` & `.csv`).
  * Authored `AI_USAGE.md`, `BLOG.md` (2,500 words), and `docs/PROJECT_REPORT.md`.
  * Validated 100% test pass rate across pytest test suite.

---

## 3. Independent Code Verification Certification

The team hereby certifies that:
1. All generative AI outputs (Pipeline 1) are strictly verified by independent, deterministic Python code (Pipeline 2) without relying on AI self-evaluation.
2. All source code, schemas, mathematical scoring formulations, and UI components have been reviewed, tested, and understood by all team members.
3. No secrets or external production credentials have been committed to this repository.

*Verified and Signed by the SupportNova Development Team*  
*September 23, 2026*
