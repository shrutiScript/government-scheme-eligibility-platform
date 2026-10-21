import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { schemeService } from '../services/schemeService';
import { SchemeCard } from '../components/SchemeCard';
import { SchemeSetuHeroDesign } from '../components/SchemeSetuHeroDesign';
import { VerticalPanelSlideWrapper } from '../components/VerticalPanelSlideWrapper';
import { PageMotionWrapper } from '../components/PageMotionWrapper';
import { ShieldCheck, Sparkles, Zap, Users, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const [totalCount, setTotalCount] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const res = await schemeService.getSchemes({ limit: 3 });
        if (res.success) {
          setFeaturedSchemes(res.schemes);
          if (res.total) setTotalCount(res.total);
        }
      } catch (error) {
        console.error('Failed to load home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <PageMotionWrapper className="space-y-12 pb-16 bg-[#f8fafc]">
      {/* 1. HERO + OVERLAY PANEL VERTICAL SLIDE TRANSITION */}
      <VerticalPanelSlideWrapper
        heightVh={240}
        basePanel={() => (
          <div className="w-full h-full flex flex-col justify-start overflow-hidden">
            <SchemeSetuHeroDesign />
          </div>
        )}
        overlayPanel={() => (
          <div className="w-full h-full bg-gradient-to-b from-[#f0f6ff] via-white to-[#f4f8fc] text-slate-900 flex flex-col justify-between p-0 relative overflow-hidden shadow-2xl border-t border-slate-200/80">
            {/* Ambient Tricolor & Radial Lighting Accents */}
            <div className="absolute inset-0 bg-[radial-gradient(#0052cc_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none" />
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Ashoka Chakra Subtle Background Motif (Continuous Smooth 360° Clockwise Rotation) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[640px] opacity-[0.07] pointer-events-none text-[#0052cc] z-0 flex items-center justify-center">
              <svg className="w-full h-full animate-spin-slow origin-center" style={{ animationDuration: '24s' }} viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="50" cy="50" r="10" fill="currentColor" />
                {Array.from({ length: 24 }).map((_, i) => {
                  const angle = (i * 360) / 24;
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="50"
                      x2={50 + 46 * Math.cos((angle * Math.PI) / 180)}
                      y2={50 + 46 * Math.sin((angle * Math.PI) / 180)}
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  );
                })}
              </svg>
            </div>

            <div className="max-w-4xl mx-auto space-y-6 text-center relative z-10 my-auto px-4 pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#0052cc] text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Next-Gen Citizen Welfare Portal</span>
              </div>

              <motion.h2
                initial={{ filter: 'blur(16px)', opacity: 0, y: 15 }}
                whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl sm:text-5xl font-black font-serif text-[#0b2e59] tracking-tight leading-[1.12]"
              >
                Empowering 1.4 Billion Citizens With <br />
                <span className="text-[#138808]">Smart Scheme Eligibility</span>
              </motion.h2>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
                SchemeSetu uses intelligent rules engines to match your exact profile with active Central & State Government initiatives in seconds.
              </p>

              {/* High-Contrast Light Glassmorphic Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-4 w-full text-left">
                <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 border border-amber-200/80 shadow-2xs">
                    <Zap className="w-5 h-5" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">100+</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Active Schemes</p>
                </div>

                <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-[#138808] flex items-center justify-center mb-3 border border-emerald-200/80 shadow-2xs">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">100%</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Verified Data</p>
                </div>

                <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#0052cc] flex items-center justify-center mb-3 border border-blue-200/80 shadow-2xs">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">All States</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Pan-India Support</p>
                </div>

                <div className="p-5 rounded-3xl bg-white/90 border border-slate-200/90 shadow-md hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 border border-purple-200/80 shadow-2xs">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900">Instant</p>
                  <p className="text-xs text-slate-500 font-bold mt-0.5">Eligibility Check</p>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/eligibility"
                  className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-r from-[#0052cc] to-[#0f2942] hover:from-[#0041a3] hover:to-[#091b2c] text-white font-extrabold text-xs rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                >
                  <span>Check Your Eligibility Now</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* 
              ========================================================================
              CLEAN MARQUEE TICKER AT BOTTOM OF 2ND SLIDE
              ========================================================================
            */}
            <div className="w-full bg-white/80 border-t border-b border-slate-200/80 py-3.5 relative z-20 overflow-hidden select-none backdrop-blur-md mt-auto">
              <div className="animate-marquee flex items-center whitespace-nowrap gap-8">
                {[1, 2].map((groupKey) => (
                  <div key={groupKey} className="flex items-center gap-10 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0f2942]" />
                      <span className="text-xs font-black text-slate-900 tracking-tight">100% Trusted</span>
                      <span className="text-slate-300 font-light">•</span>
                      <span className="text-xs text-slate-600 font-medium">Official government sources & verified data</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#138808]" />
                      <span className="text-xs font-black text-slate-900 tracking-tight">Data Privacy First</span>
                      <span className="text-slate-300 font-light">•</span>
                      <span className="text-xs text-slate-600 font-medium">Your profile information is encrypted & never shared</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0052cc]" />
                      <span className="text-xs font-black text-slate-900 tracking-tight">Fast & Accurate</span>
                      <span className="text-slate-300 font-light">•</span>
                      <span className="text-xs text-slate-600 font-medium">Real-time demographic criteria matching</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff9933]" />
                      <span className="text-xs font-black text-slate-900 tracking-tight">Always Here</span>
                      <span className="text-slate-300 font-light">•</span>
                      <span className="text-xs text-slate-600 font-medium">24x7 guidance for all citizen scheme queries</span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      <span className="text-xs font-black text-slate-900 tracking-tight">Direct Benefits</span>
                      <span className="text-slate-300 font-light">•</span>
                      <span className="text-xs text-slate-600 font-medium">Seamless redirection to official central & state portals</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      />

      {/* 2. FEATURED SCHEMES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured schemes
            </h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              A snapshot of what citizens are checking right now.
            </p>
          </div>
          <Link
            to="/schemes"
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
          >
            See all
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-slate-200 rounded-[20px] animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredSchemes.map((scheme, idx) => (
              <SchemeCard key={scheme._id} scheme={scheme} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* 4. READY TO SEE YOUR ELIGIBLE SCHEMES BANNER
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Ready to see your eligible schemes?
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Registration is free and takes under two minutes.
            </p>
          </div>

          <Link
            to="/register"
            className="px-6 py-3 bg-[#0f2942] hover:bg-[#0c2338] text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer shrink-0"
          >
            Create free account
          </Link>
        </div>
      </section> */}
    </PageMotionWrapper>
  );
};
