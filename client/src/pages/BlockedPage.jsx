import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, LogOut, Home, MessageSquare } from 'lucide-react';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import { useAuth } from '../context/AuthContext';

export const BlockedPage = () => {
    const { logout } = useAuth();

    // Clear any residual session info when the blocked page is loaded
    useEffect(() => {
        logout();
    }, []);

    return (
        <PageMotionWrapper className="min-h-screen flex items-center justify-center px-4 bg-slate-900 text-white relative overflow-hidden">
            {/* Decorative gradient glowing spots */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-lg bg-slate-950/80 border border-red-500/30 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8 text-center relative z-10">

                {/* Warning Icon Container */}
                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-rose-500/10 border border-rose-500/20 animate-ping" />
                    <div className="absolute inset-2 rounded-full bg-rose-500/20" />
                    <div className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg relative z-10">
                        <ShieldAlert className="w-9 h-9" />
                    </div>
                </div>

                {/* Heading */}
                <div className="space-y-3">
                    <h1 className="text-3xl font-black text-rose-500 tracking-tight">
                        Account Blocked
                    </h1>
                    <div className="h-0.5 w-16 bg-rose-500 mx-auto rounded-full" />
                </div>

                {/* Message */}
                <p className="text-sm sm:text-base font-medium text-slate-300 leading-relaxed max-w-md mx-auto">
                    Your account has been blocked by the administrator.<br />
                    Please contact the administrator.
                </p>

                {/* Contact info card */}
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-400 flex items-center justify-center gap-2 max-w-xs mx-auto">
                    <MessageSquare className="w-4 h-4 text-rose-400" />
                    <span>Support: admin@gmail.com</span>
                </div>

                {/* Action Button */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800/80">
                    <Link
                        to="/login"
                        className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Go to Login</span>
                    </Link>
                    <Link
                        to="/"
                        className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-xs rounded-xl border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <Home className="w-4 h-4" />
                        <span>Home Page</span>
                    </Link>
                </div>
            </div>
        </PageMotionWrapper>
    );
};

export default BlockedPage;
