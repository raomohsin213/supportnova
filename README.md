# SupportNova — ResponseX Intelligence
> **Aptech TechWiz 7 — Generative AI PowerPlay**  
> **Architecture:** Dual-Pipeline (Probabilistic GenAI + Deterministic Zero-AI Ground-Truth Engine)

---

## 📂 Source Code Modular Structure

The codebase is organized into modular packages conforming strictly to TechWiz 7 competition deliverables:

| Directory | Purpose |
|---|---|
| `comparison_engine/` | Dual-pipeline diff comparator, verification scoring, and manual review queue |
| `complaint_processing/` | Intake, normalization, duplicate detection, missing info checks, and SLA tracking |
| `complaint_rules/` | Deterministic categories taxonomy, rule matrix loader, and JSON rule definitions |
| `config/` | System configuration, GenAI model parameters, and SLA thresholds |
| `dashboards/` | Executive admin, support agent workspace, customer portal, and analytics |
| `database/` | SQLAlchemy models, audit trail logging, and database connections |
| `document_processing/` | Multi-format PDF & DOCX parsers, semantic chunkers, and version control |
| `escalation_rules/` | 6-tier deterministic escalation hierarchy and enforcement engine |
| `genai_pipeline/` | Gemini 2.5 Flash analyzer, response generator, and prompt telemetry logger |
| `hallucination_checks/` | Unsupported claim & unauthorized promise detectors (100% prevention) |
| `hidden_test_ready/` | Ready directory for unannounced competition test evaluations |
| `knowledge_base/` | Vector embeddings, semantic retriever, and policy applicability matrix |
| `prompt_templates/` | Versioned prompt templates (v1.0) and centralized prompt registry |
| `python_validation/` | 12 deterministic validators (category, refund, warranty, contradiction, etc.) |
| `routing_rules/` | Department routing matrix and multi-issue priority hierarchy |
| `schemas/` | JSON Schema definitions and schema validator |
| `security/` | PII maskers, prompt injection guard, and RBAC permissions |
| `src/` | Main application entry point (`app.py`), auth, and API routes |
| `static/` & `templates/` | Web assets, stylesheets, and base HTML templates |
| `tests/` | 19 automated test suites verifying all competition requirements |

---

## 🚀 Installation & Execution

### 1. Requirements
- Python 3.10+
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### 2. Environment Configuration
Copy `.env.example` to `.env` and provide your Google Gemini API key:
```ini
GENAI_PROVIDER=gemini
GENAI_MODEL=gemini-2.5-flash
GENAI_API_KEY=your_gemini_api_key_here
SECRET_KEY=supportnova_secret_key_2026
DATABASE_URL=sqlite:///supportnova.db
```

### 3. Run the Application
```bash
python src/app.py
```
Access the application at `http://localhost:8000`.

### 4. Run Automated Test Suite (19 Suites)
```bash
pytest tests/ -v
```

---

## 🛡️ Default Demo Accounts (RBAC)
- **System Admin:** `admin@supportnova.io` / `Admin123!`
- **Support Manager:** `manager@supportnova.io` / `Manager123!`
- **Reviewer / QA:** `reviewer@supportnova.io` / `Reviewer123!`
- **Support Agent:** `agent@supportnova.io` / `Agent123!`
- **Customer:** `customer@supportnova.io` / `Customer123!`
