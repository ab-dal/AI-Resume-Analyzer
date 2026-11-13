
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from resume_parser import extract_text_from_pdf
from gemini_service import analyze_resume

app = FastAPI(
    title="AI Resume Analyzer",
    description="AI-powered Resume Analysis using Gemini",
    version="1.0.0"
)

# React frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {
        "message": "AI Resume Analyzer Backend is running!"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/test")
def test_connection():
    return {
        "message": "React and FastAPI are connected successfully!"
    }


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
