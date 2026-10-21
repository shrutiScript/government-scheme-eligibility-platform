import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Mail, MapPin, ArrowUpRight } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-[#0f2942] text-slate-300 border-t border-slate-800">
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#0f2942] via-[#e07a10] to-[#138808]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: SchemeSetu Branding */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#e07a10] shrink-0">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-6 h-6">
                  <path d="M12 2L4 7v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V7l-8-5z" fill="#0b1f33" />
                  <circle cx="12" cy="12" r="4" stroke="#0052cc" strokeWidth="1.5" />
                  <path d="M12 8v8M8 12h8" stroke="#e07a10" strokeWidth="1.2" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black text-white tracking-tight leading-none">
                  SchemeSetu
                </span>
                <span className="text-[10px] font-bold text-slate-400 tracking-tight mt-0.5">
                  Connecting Citizens to Government Schemes
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              A unified national platform empowering citizens across India to discover,
              evaluate eligibility for, and access central and state government welfare
              schemes — transparently and securely.
            </p>

            <div className="flex items-center gap-2 text-[11px] text-amber-300 font-bold bg-amber-950/30 border border-amber-800/50 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Official Citizen Eligibility Portal</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
                  <span>Home Portal</span>
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
                  <span>Browse All Schemes</span>
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
                  <span>Automated Eligibility Checker</span>
                </Link>
              </li>
              <li>
                <Link to="/profile" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
                  <span>User Profile & Demographics</span>
                </Link>
              </li>
              <li>
                <Link to="/login" className="inline-flex items-center gap-1 text-slate-400 hover:text-amber-300 transition-colors">
                  <span>Sign In</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Scheme Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Popular Sectors
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/schemes?category=Agriculture+%26+Farmers" className="text-slate-400 hover:text-amber-300 transition-colors">
                  Agriculture & Farmers
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Healthcare+%26+Health+Insurance" className="text-slate-400 hover:text-amber-300 transition-colors">
                  Healthcare & Insurance
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Education+%26+Scholarships" className="text-slate-400 hover:text-amber-300 transition-colors">
                  Scholarships & Education
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Financial+Inclusion+%26+Business" className="text-slate-400 hover:text-amber-300 transition-colors">
                  MUDRA & Business Loans
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Social+Security+%26+Pensions" className="text-slate-400 hover:text-amber-300 transition-colors">
                  Social Security & Pensions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: National Helpdesk */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              National Helpdesk
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5 text-slate-400">
                <PhoneCall className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Toll Free: 1800-111-555 (24x7)</span>
              </li>
              <li className="flex items-center gap-2.5 text-slate-400">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>support@govschemes.in</span>
              </li>
              <li className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Ministry of Electronics & IT, CGO Complex, New Delhi 110003</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-700/70 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SchemeSetu — Government Scheme Eligibility Platform. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer transition-colors">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

