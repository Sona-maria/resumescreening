import fitz  # PyMuPDF
import spacy
import re

_NLP = None


def get_nlp():
    global _NLP
    if _NLP is not None:
        return _NLP

    try:
        _NLP = spacy.load("en_core_web_sm")
    except OSError:
        # Fall back to a blank pipeline so the service starts even if the
        # spaCy model has not been downloaded yet.
        _NLP = spacy.blank("en")
    return _NLP

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extracts raw text from PDF bytes."""
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text

def extract_entities(text: str) -> dict:
    """Uses spaCy and regex to extract basic info and skills."""
    doc = get_nlp()(text)
    
    # 1. Regex for email and phone
    email_regex = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"
    emails = re.findall(email_regex, text)
    email = emails[0] if emails else None
    
    phone_regex = r"\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}"
    phones = re.findall(phone_regex, text)
    phone = phones[0] if phones else None
    
    # 2. Extract Person name (often the first PER entity)
    name = None
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            name = ent.text
            break
            
    # 3. Basic skills extraction (dictionary based for demo purposes)
    common_skills = ["python", "java", "c++", "javascript", "react", "node.js", "express", 
                     "postgresql", "sql", "aws", "docker", "kubernetes", "machine learning",
                     "nlp", "spacy", "scikit-learn", "git", "ci/cd", "agile", "tailwind", "next.js", "typescript"]
    
    found_skills = []
    text_lower = text.lower()
    for skill in common_skills:
        # Simple word boundary regex
        if re.search(rf"\b{re.escape(skill)}\b", text_lower):
            found_skills.append(skill)
            
    # 4. Extract experience years (rough heuristic)
    years_exp = 0
    # look for patterns like "5 years of experience"
    exp_matches = re.findall(r"(\d+)\+?\s+years?", text_lower)
    if exp_matches:
        try:
            years_exp = float(exp_matches[0])
        except:
            pass

    return {
        "name": name,
        "email": email,
        "phone": phone,
        "skills": found_skills,
        "total_experience_years": years_exp,
        "text": text
    }
