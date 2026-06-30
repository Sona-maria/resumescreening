import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, KeyRound, Loader2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const requestOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:3000/api/auth/request-otp', { email });
            setMsg(res.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to request OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await axios.post('http://localhost:3000/api/auth/verify-otp', { email, otp });
            login(res.data.token);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark overflow-hidden relative selection:bg-brand-500 selection:text-white">
            {/* Dynamic Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000"></div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-blue-500 mb-6 shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-transform duration-300">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">IntelliScreen</h1>
                    <p className="text-slate-400 mt-2 font-medium">Next-gen Recruiter Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}
                {msg && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <p className="text-emerald-400 text-sm font-medium">{msg}</p>
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={requestOtp} className="space-y-6 animate-fade-in">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                                </div>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300"
                                    placeholder="recruiter@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white py-3.5 rounded-xl font-semibold shadow-lg shadow-brand-500/25 transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Continue with Email'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={verifyOtp} className="space-y-6 animate-fade-in">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-300 ml-1">Secure OTP</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                                </div>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all duration-300 tracking-[0.5em] font-mono text-lg text-center"
                                    placeholder="------"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 hover:bg-slate-100 py-3.5 rounded-xl font-bold shadow-lg transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin text-slate-900" /> : (
                                <>Authenticate <ArrowRight className="w-5 h-5" /></>
                            )}
                        </button>
                    </form>
                )}
            </div>
            
            <p className="absolute bottom-8 text-slate-500 text-sm font-medium z-10">
                Secure AI-Powered Screening Platform
            </p>
        </div>
    );
};

export default Login;
