import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, FileText } from 'lucide-react';

const Navbar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-slate-200">
            <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-brand-600">
                    <FileText className="w-6 h-6" />
                    <span>IntelliScreen</span>
                </Link>
                <div className="flex items-center gap-4">
                    <Link to="/" className="text-slate-600 hover:text-brand-600 transition-colors font-medium">Dashboard</Link>
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-slate-500 hover:text-red-500 transition-colors font-medium ml-4"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
