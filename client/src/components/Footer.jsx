import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Column 1: Portal Overview */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-600 flex items-center justify-center text-white font-extrabold text-base shadow-sm">
                GOV
              </div>
              <span className="text-base font-bold text-white tracking-tight">
                Government Scheme Platform
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              A unified national portal empowering citizens across India to search, evaluate eligibility, and access central and state government welfare schemes transparently.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold bg-amber-950/50 border border-amber-800/60 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500" />
              <span>Official Citizen Eligibility Portal</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-amber-400 transition-colors">
                  Home Portal
                </Link>
              </li>
              <li>
                <Link to="/schemes" className="hover:text-amber-400 transition-colors">
                  Browse All Schemes
                </Link>
              </li>
              <li>
                <Link to="/eligibility" className="hover:text-amber-400 transition-colors">
                  Automated Eligibility Checker
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-amber-400 transition-colors">
                  User Profile & Demographics
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Scheme Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              Popular Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/schemes?category=Agriculture+%26+Farmers" className="hover:text-amber-400 transition-colors">
                  Agriculture & Farmers
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Healthcare+%26+Health+Insurance" className="hover:text-amber-400 transition-colors">
                  Healthcare & Insurance
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Education+%26+Scholarships" className="hover:text-amber-400 transition-colors">
                  Scholarships & Education
                </Link>
              </li>
              <li>
                <Link to="/schemes?category=Financial+Inclusion+%26+Business" className="hover:text-amber-400 transition-colors">
                  MUDRA & Business Loans
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Helpdesk */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">
              National Helpdesk
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <PhoneCall className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Toll Free: 1800-111-555 (24x7)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-500 shrink-0" />
                <span>support@govschemes.in</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>Ministry of Electronics & IT, CGO Complex, New Delhi 110003</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Government Scheme Eligibility Platform. All Rights Reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Accessibility Statement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
