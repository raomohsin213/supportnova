"""
SupportNova - Hugging Face Spaces Entry Point
Aptech TechWiz 7 - ResponseX Intelligence
Uses Gradio SDK (100% Free, NO Credit Card or Billing Required)
"""

import sys
import os
from pathlib import Path

# Add project root and backend to Python path
PROJECT_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_ROOT / "backend"))
sys.path.insert(0, str(PROJECT_ROOT))

import gradio as gr
from app.main import app as fastapi_app

# Define a clean Gradio interface for Hugging Face Space wrapper
with gr.Blocks(title="SupportNova AI Governance Engine", theme=gr.themes.Soft()) as demo:
    gr.Markdown("""
    # 🛡️ SupportNova — Autonomous AI Governance & Complaint Intelligence
    ### *TechWiz 7 — ResponseX Intelligence Dual-Pipeline Engine*
    
    The full-stack SupportNova React SPA & FastAPI backend are running live on this Space.
    """)
    
    with gr.Row():
        gr.Button("🚀 Open Full Screen Web Application", link="/", variant="primary")
        gr.Button("📑 Interactive API Docs (Swagger)", link="/docs")
        gr.Button("🩺 System Health Check", link="/health")
        
    gr.HTML("""
    <div style="border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.15); margin-top: 15px;">
        <iframe src="/" style="width: 100%; height: 850px; border: none;"></iframe>
    </div>
    """)

# Mount Gradio onto the existing FastAPI application
app = gr.mount_gradio_app(fastapi_app, demo, path="/gradio")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 7860))
    uvicorn.run(fastapi_app, host="0.0.0.0", port=port)
