import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Plus, Briefcase, ChevronRight, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

const JobUpload = () => {
    const [jobs, setJobs] = useState([]);
    const [selectedJobId, setSelectedJobId] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState([]);

    // New Job Form State
    const [title, setTitle] = useState('');
    const [roleType, setRoleType] = useState('Full-Time');
    const [location, setLocation] = useState('');
    const [minExp, setMinExp] = useState('');
    const [maxExp, setMaxExp] = useState('');
    const [skills, setSkills] = useState('');
    const [description, setDescription] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const res = await axios.get('http://localhost:3000/api/jobs');
            setJobs(res.data);
            if (res.data.length > 0 && !selectedJobId) {
                setSelectedJobId(res.data[0].id);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateJob = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:3000/api/jobs', {
                title, role_type: roleType, location, 
                min_experience: minExp, max_experience: maxExp, 
                required_skills: skills, description
            });
            await fetchJobs();
            setSelectedJobId(res.data.id);
            setIsCreating(false);
            // Reset form
            setTitle(''); setSkills(''); setDescription('');
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            setFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
        }
    };

    const handleUpload = async () => {
        if (!selectedJobId || files.length === 0) return;
        setUploading(true);
        setUploadResults([]);

        const formData = new FormData();
        formData.append('jobId', selectedJobId);
        files.forEach(file => formData.append('files', file));

        try {
            const res = await axios.post('http://localhost:3000/api/resumes/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setUploadResults(res.data.results);
            setFiles([]);
        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    const selectedJob = jobs.find(j => j.id == selectedJobId);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Workspace</h1>
                    <p className="text-slate-500">Select a job and upload resumes to start screening.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Job Selection / Creation */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800">
                            <Briefcase className="w-5 h-5 text-brand-600" /> Job Profile
                        </h2>
                        <button 
                            onClick={() => setIsCreating(!isCreating)}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-md"
                        >
                            {isCreating ? 'Select Existing' : <><Plus className="w-4 h-4"/> Create New</>}
                        </button>
                    </div>

                    {!isCreating ? (
                        <div className="space-y-6">
                            {jobs.length === 0 ? (
                                <p className="text-slate-500 text-center py-8">No jobs found. Create one to get started.</p>
                            ) : (
                                <>
                                    <select 
                                        className="w-full p-3 rounded-lg border border-slate-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none appearance-none bg-slate-50"
                                        value={selectedJobId}
                                        onChange={(e) => setSelectedJobId(e.target.value)}
                                    >
                                        {jobs.map(job => (
                                            <option key={job.id} value={job.id}>{job.title} - {job.location}</option>
                                        ))}
                                    </select>

                                    {selectedJob && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="mb-4">
                                                <h3 className="font-semibold text-slate-800 mb-2">Required Skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedJob.required_skills.split(',').map((s, i) => (
                                                        <span key={i} className="px-3 py-1 bg-white border border-slate-200 text-slate-600 rounded-full text-xs font-medium shadow-sm">
                                                            {s.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800 mb-1">Description snippet</h3>
                                                <p className="text-sm text-slate-500 line-clamp-3">{selectedJob.description}</p>
                                            </div>
                                            <button 
                                                onClick={() => navigate(`/ranking/${selectedJob.id}`)}
                                                className="mt-6 w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
                                            >
                                                View Screened Candidates <ChevronRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    ) : (
                        <form onSubmit={handleCreateJob} className="space-y-4">
                            <input 
                                required placeholder="Job Title (e.g. Senior Frontend Developer)"
                                className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500"
                                value={title} onChange={(e)=>setTitle(e.target.value)}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    placeholder="Location"
                                    className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500"
                                    value={location} onChange={(e)=>setLocation(e.target.value)}
                                />
                                <select 
                                    className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500"
                                    value={roleType} onChange={(e)=>setRoleType(e.target.value)}
                                >
                                    <option>Full-Time</option>
                                    <option>Part-Time</option>
                                    <option>Contract</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="number" placeholder="Min Experience (yrs)"
                                    className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500"
                                    value={minExp} onChange={(e)=>setMinExp(e.target.value)}
                                />
                                <input 
                                    type="number" placeholder="Max Experience (yrs)"
                                    className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500"
                                    value={maxExp} onChange={(e)=>setMaxExp(e.target.value)}
                                />
                            </div>
                            <input 
                                required placeholder="Required Skills (comma-separated)"
                                className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500"
                                value={skills} onChange={(e)=>setSkills(e.target.value)}
                            />
                            <textarea 
                                required placeholder="Full Job Description..." rows={4}
                                className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500 resize-none"
                                value={description} onChange={(e)=>setDescription(e.target.value)}
                            />
                            <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors">
                                Save Job Profile
                            </button>
                        </form>
                    )}
                </div>

                {/* Resume Upload Panel */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-slate-800 mb-6">
                        <UploadCloud className="w-5 h-5 text-brand-600" /> Resume Upload
                    </h2>

                    <div 
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleFileDrop}
                        className="flex-1 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center p-8 text-center hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-16 h-16 bg-white shadow-sm rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="w-8 h-8 text-brand-500" />
                        </div>
                        <p className="text-slate-700 font-medium mb-1">Drag & drop resume PDFs here</p>
                        <p className="text-slate-400 text-sm mb-6">or click to browse from your computer</p>
                        <label className="bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 font-medium shadow-sm transition-all">
                            Browse Files
                            <input type="file" multiple accept=".pdf" className="hidden" onChange={handleFileSelect} />
                        </label>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-6">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-sm font-medium text-slate-600">{files.length} file(s) selected</span>
                                <button 
                                    onClick={handleUpload} disabled={uploading || !selectedJobId}
                                    className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                >
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Run Screening'}
                                </button>
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-2">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded">
                                        <div className="w-2 h-2 rounded-full bg-brand-400"></div> {f.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {uploadResults.length > 0 && (
                        <div className="mt-6 border-t border-slate-100 pt-6">
                            <h3 className="font-medium text-slate-800 mb-3">Processing Results</h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto">
                                {uploadResults.map((r, i) => (
                                    <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${r.status === 'Success' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                                        {r.status === 'Success' ? <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" /> : <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />}
                                        <div>
                                            <p className="font-medium text-sm text-slate-800">{r.file}</p>
                                            {r.status === 'Success' ? (
                                                <p className="text-xs text-green-700 mt-1">Candidate: {r.candidate} | Score: <span className="font-bold">{r.score}%</span></p>
                                            ) : (
                                                <p className="text-xs text-red-600 mt-1">{r.error}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobUpload;
