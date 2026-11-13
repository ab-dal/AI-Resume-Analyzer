
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os

from resume_parser import extract_text_from_pdf
from gemini_service import analyze_resume

app = FastAPI(
    title="AI Resume Analyzer",
    description="AI-powered Resume Analysis using Gemini",
    version="1.0.0"
)

# React frontend connection
frontend_url = os.getenv("FRONTEND_URL", "")

allowed_origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://ai-resume-analyzer-frontend-lake-sigma.vercel.app",
    "https://ai-resume-analyzer-sable-two.vercel.app",
]

if frontend_url:
    for origin in frontend_url.split(","):
        origin = origin.strip().rstrip("/")
        if origin and origin not in allowed_origins:
            allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/api")
def home():
    return {
        "message": "AI Resume Analyzer Backend is running!"
    }


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "healthy"}


@app.get("/test")
@app.get("/api/test")
def test_connection():
    return {
        "message": "React and FastAPI are connected successfully!"
    }


@app.post("/upload")
@app.post("/api/upload")
async def upload_resume(file: UploadFile = File(...)):

    # Validate file extension
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are allowed."
        )

    # Read PDF
    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=400,
            detail="Uploaded file is empty."
        )

    if len(content) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size must be below 5 MB."
        )

    # Extract resume text
    try:
        extracted_text = extract_text_from_pdf(content)

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    # Analyze resume using Gemini
    try:
        analysis = analyze_resume(extracted_text)

    except Exception as error:
        raise HTTPException(
            status_code=502,
            detail=f"AI analysis failed: {str(error)}"
        )

    return {
        "message": "Resume analyzed successfully!",
        "filename": file.filename,
        "text_length": len(extracted_text),
        "analysis": analysis
    }
