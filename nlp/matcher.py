from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

print("Loading SentenceTransformer model...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("Model loaded.")

def compute_similarity(jd_text: str, resume_text: str) -> float:
    """Computes cosine similarity between Job Description and Resume Text."""
    embeddings = model.encode([jd_text, resume_text])
    sim = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    # Ensure it's between 0 and 1
    return max(0.0, min(1.0, float(sim)))

def calculate_match_score(jd_text: str, resume_text: str, jd_skills: list, resume_skills: list) -> dict:
    """Calculates a combined match score and skill gaps."""
    # 1. Semantic Similarity
    semantic_sim = compute_similarity(jd_text, resume_text)
    
    # 2. Skill Overlap
    jd_skills_set = set([s.lower().strip() for s in jd_skills if s.strip()])
    resume_skills_set = set([s.lower().strip() for s in resume_skills if s.strip()])
    
    matched_skills = list(jd_skills_set.intersection(resume_skills_set))
    missing_skills = list(jd_skills_set.difference(resume_skills_set))
    
    skill_score = 0
    if len(jd_skills_set) > 0:
        skill_score = len(matched_skills) / len(jd_skills_set)
    else:
        skill_score = 1.0 # If no skills required, give full marks
        
    # Combine (e.g., 60% semantic, 40% skills)
    final_score = (0.6 * semantic_sim) + (0.4 * skill_score)
    final_score_percentage = round(final_score * 100, 2)
    
    # Confidence Level
    confidence = "Low"
    if len(resume_skills) >= 5 and semantic_sim > 0.2:
        confidence = "High"
    elif len(resume_skills) >= 2:
        confidence = "Medium"
        
    explanation = f"Semantic match: {round(semantic_sim*100)}%. Matched {len(matched_skills)} out of {len(jd_skills_set)} required skills."
    
    return {
        "match_score": final_score_percentage,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "confidence_level": confidence,
        "explanation_text": explanation
    }
