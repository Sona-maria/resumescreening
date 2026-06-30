# Intelligent Resume Screening Platform

An end-to-end intelligent resume screening system.

## Project Structure
- `backend/`: Node.js Express server + Prisma (PostgreSQL).
- `frontend/`: React + Vite + Tailwind CSS dashboard.
- `nlp/`: Python FastAPI service for PyMuPDF and Sentence-Transformers processing.

## Getting Started

### 1. Database Setup (PostgreSQL)
Ensure you have a PostgreSQL database running. You can use the provided `docker-compose.yml` if you have Docker installed:
```bash
docker-compose up -d
```
(If you don't have Docker, please install PostgreSQL locally and create a database named `resume_db` with `user` / `password` credentials).

### 2. NLP Service (Python)
Open a terminal and run:
```bash
cd nlp
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python main.py
```
*Note: The first time you run this, it will download the SpaCy and Sentence-Transformers models.*

### 3. Backend API (Node.js)
Open a new terminal and run:
```bash
cd backend
npm install
npx prisma db push
node index.js
```
*Note: The backend runs on port 3000.*

### 4. Frontend Dashboard (React)
Open a new terminal and run:
```bash
cd frontend
npm install
npm run dev
```

## Demo Instructions
1. Navigate to `http://localhost:5173`
2. Enter any email to receive an OTP (The app uses Ethereal email; check the backend console for the OTP preview URL to get your code!).
3. Enter the OTP to log in.
4. Create a Job Profile (e.g., "Frontend Developer" requiring "React, Tailwind, Node.js").
5. Upload PDF resumes.
6. Click "Run Screening" to see the magic happen!
7. View ranked candidates, filter them, and export shortlists.
