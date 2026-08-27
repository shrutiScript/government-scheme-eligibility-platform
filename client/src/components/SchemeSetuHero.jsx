import React from 'react';
import {
  User,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';

export const SchemeSetuHero = () => {
  return (
    <div className="w-full bg-[#f8fafc] text-slate-900 overflow-hidden">
      {/* 
        ========================================================================
        "HOW IT WORKS" 3-STEP BENEFIT PIPELINE SECTION
        ========================================================================
      */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="text-center space-y-1.5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0f2942] tracking-tight">
            How it works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
            Three simple steps between you and the official government benefits you are entitled to.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div className="group cursor-pointer bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-400/80 transition-all duration-300 ease-out space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f2942] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              1. Create your profile
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Add your age, state, occupation, income, education and category once. Everything stays private to your account.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group cursor-pointer bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-400/80 transition-all duration-300 ease-out space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f2942] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              2. Run the eligibility check
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              We compare your profile against every scheme's official criteria and show a match score for each one.
            </p>
          </div>

          {/* Card 3 */}
          <div className="group cursor-pointer bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:-translate-y-1 hover:border-emerald-400/80 transition-all duration-300 ease-out space-y-4 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0f2942] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <ClipboardList className="w-5 h-5" />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              3. Apply with confidence
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              See required documents, benefits and last dates, then head straight to the official application portal.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
};

