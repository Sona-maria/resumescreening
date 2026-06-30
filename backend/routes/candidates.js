const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');
const { authenticateToken } = require('./auth');

// Get ranked candidates for a job
router.get('/job/:jobId', authenticateToken, async (req, res) => {
    const jobId = parseInt(req.params.jobId);
    
    try {
        const resumes = await prisma.resume.findMany({
            where: { job_id: jobId, status: 'Parsed' },
            include: {
                candidate: true,
                score: true,
                skills: true,
                notes: {
                    where: { job_id: jobId }
                }
            }
        });

        // Format and rank
        const ranked = resumes.map(r => {
            const note = r.notes.length > 0 ? r.notes[0] : null;
            return {
                resume_id: r.id,
                candidate: r.candidate,
                score: r.score,
                skills: r.skills.map(s => s.skill_name),
                status_tag: note ? note.status_tag : 'Pool',
                note_text: note ? note.note_text : ''
            };
        }).sort((a, b) => (b.score?.match_score || 0) - (a.score?.match_score || 0));

        // Add rank
        ranked.forEach((r, idx) => r.rank = idx + 1);

        res.json(ranked);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update candidate status/note
router.put('/:resumeId/job/:jobId/note', authenticateToken, async (req, res) => {
    const resumeId = parseInt(req.params.resumeId);
    const jobId = parseInt(req.params.jobId);
    const { status_tag, note_text } = req.body;

    try {
        const note = await prisma.recruiterNote.upsert({
            where: {
                // To upsert we need a unique constraint on resume_id and job_id which we should add to schema
                // But for now, we'll find first and then update/create
                id: (await prisma.recruiterNote.findFirst({ where: { resume_id: resumeId, job_id: jobId } }))?.id || -1
            },
            update: {
                status_tag,
                note_text
            },
            create: {
                resume_id: resumeId,
                job_id: jobId,
                status_tag,
                note_text
            }
        });
        res.json(note);
    } catch (error) {
        // Fallback if upsert fails because id is not found
        try {
            const existing = await prisma.recruiterNote.findFirst({ where: { resume_id: resumeId, job_id: jobId } });
            if (existing) {
                const updated = await prisma.recruiterNote.update({
                    where: { id: existing.id },
                    data: { status_tag, note_text }
                });
                return res.json(updated);
            } else {
                const created = await prisma.recruiterNote.create({
                    data: { resume_id: resumeId, job_id: jobId, status_tag, note_text }
                });
                return res.json(created);
            }
        } catch (e) {
            res.status(500).json({ error: 'Failed to update note' });
        }
    }
});

module.exports = router;
