
import os
import json

from dotenv import load_dotenv
from google import genai


# Load environment variables from .env
load_dotenv()


def get_gemini_client():
    # Get Gemini API key
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing. Please set it in your environment or Vercel project settings.")

    # Initialize Gemini client
    return genai.Client(api_key=api_key)


def analyze_resume(resume_text: str):
    client = get_gemini_client()

    prompt = f"""
    You are an expert professional resume analyzer.

    Analyze the following resume carefully.

    Identify:
    1. Technical skills
    2. Soft skills
    3. Educational qualifications
    4. Work experience
    5. Projects
    6. Resume strengths
    7. Resume weaknesses
    8. Missing information
    9. Improvement suggestions

    Provide specific and actionable feedback.

    Do not invent qualifications, skills, or experience
    that are not present in the resume.

    Return the result strictly as valid JSON using this structure:

    {{
        "technical_skills": [],
        "soft_skills": [],
        "education": [],
        "experience": [],
        "projects": [],
        "strengths": [],
        "weaknesses": [],
        "missing_information": [],
        "suggestions": []
    }}

    Resume content:

    {resume_text}
    """

    try:
        response = client.models.generate_content(
            model="gemini-3.5-flash-lite",
            contents=prompt,
            config={
                "response_mime_type": "application/json"
            }
        )

        return json.loads(response.text)

    except Exception as error:
        raise RuntimeError(
            f"Gemini analysis failed: {str(error)}"
        )
