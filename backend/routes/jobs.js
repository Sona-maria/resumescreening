const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');
const { authenticateToken } = require('./auth');

// Get all jobs
router.get('/', authenticateToken, async (req, res) => {
    try {
        const jobs = await prisma.job.findMany({
            orderBy: { created_at: 'desc' }
        });
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new job
router.post('/', authenticateToken, async (req, res) => {
    const { title, role_type, location, min_experience, max_experience, required_skills, description } = req.body;
    
    try {
        const job = await prisma.job.create({
            data: {
                title,
                role_type,
                location,
                min_experience: parseFloat(min_experience) || null,
                max_experience: parseFloat(max_experience) || null,
                required_skills,
                description
            }
        });
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create job' });
    }
});

// Get job details
router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const job = await prisma.job.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { resumes: true }
        });
        if (!job) return res.status(404).json({ error: 'Job not found' });
        res.json(job);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
