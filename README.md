
# AI Resume Analyzer

An AI-powered Resume Analyzer built using React, FastAPI, PyMuPDF, and Google's Gemini API.

## Features

- Upload resumes in PDF format.
- Extract resume text using PyMuPDF.
- Identify technical and soft skills.
- Analyze education and work experience.
- Identify projects, strengths, and weaknesses.
- Detect missing resume information.
- Generate AI-powered improvement suggestions.

## Technology Stack

### Frontend
- React.js
- JavaScript
- Vite
- HTML and CSS

### Backend
- Python
- FastAPI
- PyMuPDF

### AI Integration
- Google Gemini API
- Google GenAI SDK

## Project Structure

AI-Resume-Analyzer/
- frontend/
- backend/
- .gitignore
- README.md

## Local Installation

### 1. Clone the repository

git clone YOUR_GITHUB_REPOSITORY_URL

### 2. Backend setup

cd backend

python -m venv venv

Activate the virtual environment:

Windows PowerShell:
venv\Scripts\Activate.ps1

Install dependencies:

pip install -r requirements.txt

Create a .env file inside backend:

GEMINI_API_KEY=your_api_key_here

Start the backend:

uvicorn main:app --reload

### 3. Frontend setup

Open another terminal:

cd frontend

npm install

npm run dev

## Important

Never share or upload your Gemini API key.

This project was developed as an academic project.
