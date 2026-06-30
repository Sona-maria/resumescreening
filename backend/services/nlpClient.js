const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const NLP_SERVICE_URL = process.env.NLP_SERVICE_URL || 'http://localhost:8000';

const parseResume = async (filePath) => {
    try {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const response = await axios.post(`${NLP_SERVICE_URL}/parse`, formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        return response.data;
    } catch (error) {
        console.error("NLP Parse Error:", error.message);
        throw error;
    }
};

const matchResume = async (jdText, jdSkills, resumeText, resumeSkills) => {
    try {
        const payload = {
            jd_text: jdText,
            jd_skills: jdSkills,
            resume_text: resumeText,
            resume_skills: resumeSkills
        };
        const response = await axios.post(`${NLP_SERVICE_URL}/match`, payload);
        return response.data;
    } catch (error) {
        console.error("NLP Match Error:", error.message);
        throw error;
    }
};

module.exports = {
    parseResume,
    matchResume
};
