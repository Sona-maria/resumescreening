const express = require('express');
const router = express.Router();
const prisma = require('../services/prisma');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Helper to generate a 6 digit OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Ethereal Email Transporter for local dev
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) {
        console.error('Failed to create a testing account. ' + err.message);
        return;
    }
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });
});

router.post('/request-otp', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const isDev = process.env.NODE_ENV !== 'production';

    try {
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

        const user = await prisma.user.upsert({
            where: { email },
            update: { otp_code: otp, otp_expires_at: expiresAt },
            create: { email, otp_code: otp, otp_expires_at: expiresAt }
        });

        // Send email
        if (transporter) {
            const info = await transporter.sendMail({
                from: '"Resume Screener" <no-reply@resumescreener.com>',
                to: email,
                subject: 'Your Login OTP',
                text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
                html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`
            });
            console.log('\n=============================================');
            console.log('✉️  OTP REQUESTED FOR:', email);
            console.log('🔑 YOUR OTP CODE IS:', otp);
            console.log('🔗 Ethereal Preview URL:', nodemailer.getTestMessageUrl(info));
            console.log('=============================================\n');

            return res.json({
                message: 'OTP sent successfully (Check console for Ethereal URL)',
                ...(isDev ? { otp, previewUrl: nodemailer.getTestMessageUrl(info) } : {})
            });
        }

        res.json({
            message: 'OTP sent successfully (mail transport not initialized)',
            ...(isDev ? { otp } : {})
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        
        if (user.otp_code !== otp || new Date() > user.otp_expires_at) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP and mark verified
        await prisma.user.update({
            where: { id: user.id },
            data: { otp_code: null, otp_expires_at: null, is_verified: true }
        });

        const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
        
        res.json({ token, message: 'Verified successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Middleware for protecting routes
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'supersecret', (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

module.exports = router;
module.exports.authenticateToken = authenticateToken;
