import React, { useState } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft, RefreshCcw, ShieldCheck } from 'lucide-react';

const ResendOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [email, setEmail] = useState(location.state?.email || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [otp, setOtp] = useState('');

    const resendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMsg('');

        try {
            const res = await axios.post('http://localhost:3000/api/auth/request-otp', { email });
            setOtp(res.data.otp || '');
            setMsg(res.data.message || 'OTP resent successfully');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark overflow-hidden relative selection:bg-brand-500 selection:text-white">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse delay-1000"></div>

            <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-3xl shadow-2xl">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500 to-blue-500 mb-6 shadow-lg shadow-brand-500/20">
                        <RefreshCcw className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold text-white tracking-tight">Resend OTP</h1>
                    <p className="text-slate-400 mt-2 font-medium">Request a fresh sign-in code</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2"></div>
                        <p className="text-red-400 text-sm font-medium">{error}</p>
                    </div>
                )}

                {msg && (
                    <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-emerald-400 text-sm font-medium">{msg}</p>
                            {otp && (
                                <p className="text-emerald-300 text-sm font-mono tracking-[0.3em]">OTP: {otp}</p>
                            )}
                        </div>
                    </div>
                )}

                <form onSubmit={resendOtp} className="space-y-6">
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
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Resend OTP'}
                    </button>

                    <div className="flex items-center justify-between text-sm">
                        <button
                            type="button"
                            onClick={() => navigate('/login', { state: { email } })}
                            className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to login
                        </button>
                        <Link to="/login" state={{ email }} className="text-brand-400 hover:text-brand-300 transition-colors">
                            Use OTP screen
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResendOtp;