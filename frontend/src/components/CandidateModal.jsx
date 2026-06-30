import React, { useState } from 'react';
import { X, User, CheckCircle2, XCircle, Save } from 'lucide-react';

const CandidateModal = ({ candidate, job, onClose, onSave }) => {
    const [status, setStatus] = useState(candidate.status_tag || 'Pool');
    const [note, setNote] = useState(candidate.note_text || '');

    const handleSave = () => {
        onSave(status, note);
    };

    const jdSkills = job?.required_skills ? job.required_skills.split(',').map(s => s.trim().toLowerCase()) : [];
    const candSkillsLower = candidate.skills.map(s => s.toLowerCase());
    
    const matched = jdSkills.filter(s => candSkillsLower.includes(s));
    const missing = jdSkills.filter(s => !candSkillsLower.includes(s));

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-2xl font-bold">
                            {(candidate.candidate?.name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">{candidate.candidate?.name || 'Unknown Candidate'}</h2>
                            <p className="text-slate-500">{candidate.candidate?.email} • {candidate.candidate?.phone || 'No phone'}</p>
                            <div className="mt-2 flex gap-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                    candidate.score?.confidence_level === 'High' ? 'bg-green-100 text-green-700' :
                                    candidate.score?.confidence_level === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {candidate.score?.confidence_level} Confidence
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-200 text-slate-700">
                                    Rank #{candidate.rank}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">Screening Explanation</h3>
                            <div className="bg-brand-50 p-4 rounded-xl border border-brand-100 text-brand-800">
                                {candidate.score?.explanation_text || 'No explanation available.'}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-500" /> Matched Skills
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {matched.length === 0 ? <span className="text-sm text-slate-400">None</span> : 
                                        matched.map((s, i) => <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-medium">{s}</span>)
                                    }
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
                                    <XCircle className="w-4 h-4 text-red-500" /> Skill Gaps
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {missing.length === 0 ? <span className="text-sm text-slate-400">None</span> : 
                                        missing.map((s, i) => <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 rounded-md text-xs font-medium">{s}</span>)
                                    }
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-3 border-b pb-2">All Extracted Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {candidate.skills.map((s, i) => (
                                    <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 rounded-md text-xs font-medium">{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="space-y-6">
                        <div className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                            <h3 className="font-semibold text-slate-800 mb-4">Recruiter Decision</h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                    <select 
                                        className="w-full p-2.5 rounded-lg border border-slate-200 outline-none focus:border-brand-500 bg-white"
                                        value={status} onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="Pool">Pool (Undecided)</option>
                                        <option value="Shortlisted">Shortlisted</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Internal Notes</label>
                                    <textarea 
                                        className="w-full p-3 rounded-lg border border-slate-200 outline-none focus:border-brand-500 bg-white resize-none"
                                        rows={4}
                                        placeholder="E.g. Strong backend skills, but lacks AWS..."
                                        value={note} onChange={(e) => setNote(e.target.value)}
                                    ></textarea>
                                </div>

                                <button 
                                    onClick={handleSave}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white py-2.5 rounded-lg font-medium hover:bg-slate-900 transition-colors"
                                >
                                    <Save className="w-4 h-4" /> Save Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateModal;
