from fastapi import FastAPI, UploadFile, File, Form
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
from parser import extract_text_from_pdf, extract_entities
from matcher import calculate_match_score

app = FastAPI(title="Resume NLP Service")

class MatchRequest(BaseModel):
    jd_text: str
    jd_skills: List[str]
    resume_text: str
    resume_skills: List[str]

@app.get("/")
def read_root():
    return {"status": "ok"}

@app.post("/parse")
async def parse_resume(file: UploadFile = File(...)):
    """Receives a PDF and extracts text and entities."""
    content = await file.read()
    text = extract_text_from_pdf(content)
    entities = extract_entities(text)
    return entities

@app.post("/match")
def match_resume(req: MatchRequest):
    """Computes match score between JD and Resume."""
    result = calculate_match_score(
        jd_text=req.jd_text,
        resume_text=req.resume_text,
        jd_skills=req.jd_skills,
        resume_skills=req.resume_skills
    )
    return result

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
