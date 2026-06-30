const express = require('express');
const router = express.Router();
const multer = require('multer');
const prisma = require('../services/prisma');
const { authenticateToken } = require('./auth');
const nlpClient = require('../services/nlpClient');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', authenticateToken, upload.array('files'), async (req, res) => {
    const jobId = parseInt(req.body.jobId);
    if (!jobId || !req.files) return res.status(400).json({ error: 'Job ID and files are required' });

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const jdSkills = job.required_skills.split(',').map(s => s.trim());

    const results = [];

    for (const file of req.files) {
        try {
            // 1. Initial Resume Record
            const parseResult = await nlpClient.parseResume(file.path);
            
            // Handle duplicate detection based on email
            let candidate = null;
            if (parseResult.email) {
                candidate = await prisma.candidate.findUnique({ where: { email: parseResult.email } });
            }
            if (!candidate) {
                candidate = await prisma.candidate.create({
                    data: {
                        name: parseResult.name,
                        email: parseResult.email || `unknown_${Date.now()}@example.com`,
                        phone: parseResult.phone,
                        total_experience_years: parseResult.total_experience_years
                    }
                });
            }

            const resume = await prisma.resume.create({
                data: {
                    candidate_id: candidate.id,
                    job_id: jobId,
                    file_path: file.path,
                    parsed_text: parseResult.text,
                    status: 'Parsed'
                }
            });

            // Save skills
            if (parseResult.skills && parseResult.skills.length > 0) {
                const skillsData = parseResult.skills.map(s => ({
                    resume_id: resume.id,
                    skill_name: s,
                    source: 'Extracted'
                }));
                await prisma.skill.createMany({ data: skillsData });
            }

            // 2. Score Resume
            const matchResult = await nlpClient.matchResume(job.description, jdSkills, parseResult.text, parseResult.skills || []);

            await prisma.score.create({
                data: {
                    resume_id: resume.id,
                    job_id: jobId,
                    match_score: matchResult.match_score,
                    confidence_level: matchResult.confidence_level,
                    explanation_text: matchResult.explanation_text
                }
            });

            results.push({
                file: file.originalname,
                status: 'Success',
                candidate: candidate.name,
                score: matchResult.match_score
            });

        } catch (error) {
            console.error(error);
            let errMsg = error.message;
            if (error.isAxiosError) {
                errMsg = error.response?.data?.detail || "Failed to connect to NLP Service (Make sure it is running on port 8000).";
            }
            results.push({ file: file.originalname, status: 'Error', error: errMsg || "Unknown error occurred" });
        }
    }

    res.json({ results });
});

module.exports = router;
