import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Filter, Download, ArrowLeft, Star, Edit3, Eye, MoreHorizontal } from 'lucide-react';
import CandidateModal from '../components/CandidateModal';

const CandidateRanking = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [candidates, setCandidates] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    
    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [minScore, setMinScore] = useState(0);
    const [statusFilter, setStatusFilter] = useState('All');

    // Modal
    const [selectedCandidate, setSelectedCandidate] = useState(null);

    useEffect(() => {
        fetchData();
    }, [jobId]);

    const fetchData = async () => {
        try {
            const [jobRes, candRes] = await Promise.all([
                axios.get(`http://localhost:3000/api/jobs/${jobId}`),
                axios.get(`http://localhost:3000/api/candidates/job/${jobId}`)
            ]);
            setJob(jobRes.data);
            setCandidates(candRes.data);
            setFiltered(candRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let res = candidates;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            res = res.filter(c => 
                (c.candidate?.name && c.candidate.name.toLowerCase().includes(term)) ||
                (c.candidate?.email && c.candidate.email.toLowerCase().includes(term))
            );
        }
        if (minScore > 0) {
            res = res.filter(c => (c.score?.match_score || 0) >= minScore);
        }
        if (statusFilter !== 'All') {
            res = res.filter(c => c.status_tag === statusFilter);
        }
        setFiltered(res);
    }, [searchTerm, minScore, statusFilter, candidates]);

    const handleUpdateNote = async (resumeId, newStatus, newNote) => {
        try {
            await axios.put(`http://localhost:3000/api/candidates/${resumeId}/job/${jobId}/note`, {
                status_tag: newStatus,
                note_text: newNote
            });
            fetchData();
            setSelectedCandidate(null);
        } catch (err) {
            console.error(err);
        }
    };

    const handleExportCSV = () => {
        const shortlisted = candidates.filter(c => c.status_tag === 'Shortlisted');
        if (shortlisted.length === 0) {
            alert('No shortlisted candidates to export!');
            return;
        }

        const headers = ['Rank', 'Name', 'Email', 'Score', 'Status', 'Notes'];
        const rows = shortlisted.map(c => [
            c.rank,
            c.candidate?.name || 'N/A',
            c.candidate?.email || 'N/A',
            c.score?.match_score || 0,
            c.status_tag,
            `"${(c.note_text || '').replace(/"/g, '""')}"`
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `shortlisted_candidates_job_${jobId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) return <div className="p-8 text-center"><div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full mx-auto mb-4"></div>Loading rankings...</div>;

    const metrics = {
        total: candidates.length,
        shortlisted: candidates.filter(c => c.status_tag === 'Shortlisted').length,
        avgScore: candidates.length ? Math.round(candidates.reduce((acc, curr) => acc + (curr.score?.match_score || 0), 0) / candidates.length) : 0
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 mb-2 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-slate-800">{job?.title}</h1>
                    <p className="text-slate-500 mt-1">{job?.location} • {job?.role_type}</p>
                </div>
                <button onClick={handleExportCSV} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-slate-900 transition-colors shadow-sm font-medium">
                    <Download className="w-4 h-4" /> Export Shortlist
                </button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Resumes Processed</p>
                        <h3 className="text-3xl font-bold text-slate-800">{metrics.total}</h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center"><Filter className="w-6 h-6"/></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Shortlisted</p>
                        <h3 className="text-3xl font-bold text-slate-800">{metrics.shortlisted}</h3>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center"><Star className="w-6 h-6"/></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-slate-500 mb-1">Avg. Match Score</p>
                        <h3 className="text-3xl font-bold text-slate-800">{metrics.avgScore}%</h3>
                    </div>
                    <div className="w-12 h-12 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center"><span className="text-xl font-bold">%</span></div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap gap-4 items-center">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" placeholder="Search by name or email..."
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none"
                            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-600">Min Score:</span>
                        <input type="range" min="0" max="100" value={minScore} onChange={(e) => setMinScore(Number(e.target.value))} className="w-24 accent-brand-500" />
                        <span className="text-sm font-medium text-slate-600 w-8">{minScore}%</span>
                    </div>
                    <select 
                        className="p-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-500 bg-white"
                        value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Statuses</option>
                        <option value="Pool">Pool</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 text-slate-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold w-16 text-center">Rank</th>
                                <th className="p-4 font-semibold">Candidate</th>
                                <th className="p-4 font-semibold text-center">Score</th>
                                <th className="p-4 font-semibold">Status</th>
                                <th className="p-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">No candidates match your filters.</td>
                                </tr>
                            ) : (
                                filtered.map(c => (
                                    <tr key={c.resume_id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="p-4 text-center font-bold text-slate-700">#{c.rank}</td>
                                        <td className="p-4">
                                            <div className="font-semibold text-slate-800">{c.candidate?.name || 'Unknown'}</div>
                                            <div className="text-xs text-slate-500">{c.candidate?.email}</div>
                                            {c.candidate?.total_experience_years > 0 && <div className="text-xs text-slate-400 mt-0.5">{c.candidate.total_experience_years} yrs exp</div>}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-4 border-slate-100 relative">
                                                <svg className="w-full h-full absolute top-0 left-0 -rotate-90" viewBox="0 0 36 36">
                                                    <path className="text-brand-500" strokeDasharray={`${c.score?.match_score || 0}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
                                                </svg>
                                                <span className="text-sm font-bold text-slate-700">{c.score?.match_score || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                c.status_tag === 'Shortlisted' ? 'bg-green-100 text-green-700' :
                                                c.status_tag === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                                            }`}>
                                                {c.status_tag}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => setSelectedCandidate(c)}
                                                className="p-2 text-brand-600 hover:bg-brand-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" /> Review
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            {/* Modal */}
            {selectedCandidate && (
                <CandidateModal 
                    candidate={selectedCandidate} 
                    job={job}
                    onClose={() => setSelectedCandidate(null)}
                    onSave={(status, note) => handleUpdateNote(selectedCandidate.resume_id, status, note)}
                />
            )}
        </div>
    );
};

export default CandidateRanking;
