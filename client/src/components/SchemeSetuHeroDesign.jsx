import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  Lock,
  Headphones,
  ArrowRight,
  Users,
  Building,
  HeartHandshake,
  Search,
  CheckCircle2,
  FileEdit,
  IndianRupee,
  Clock,
  Shield,
  Sparkles
} from 'lucide-react';

const ARC_BADGES = [
  {
    id: 1,
    title: 'For Every Citizen',
    icon: Users,
    color: 'text-amber-600',
    bgColor: 'bg-[#fff9f0]',
    borderColor: 'border-amber-200/80',
    pos: { top: '8%', left: '10%' }
  },
  {
    id: 2,
    title: 'Secure',
    icon: ShieldCheck,
    color: 'text-[#0052cc]',
    bgColor: 'bg-[#f0f6ff]',
    borderColor: 'border-blue-200/80',
    pos: { top: '2%', left: '46%' }
  },
  {
    id: 3,
    title: 'Government Schemes',
    icon: Building,
    color: 'text-[#138808]',
    bgColor: 'bg-[#f0fff2]',
    borderColor: 'border-emerald-200/80',
    pos: { top: '10%', left: '80%' }
  },
  {
    id: 4,
    title: 'Better Tomorrow',
    icon: HeartHandshake,
    color: 'text-sky-600',
    bgColor: 'bg-[#f0f9ff]',
    borderColor: 'border-sky-200/80',
    pos: { top: '44%', left: '92%' }
  }
];

export const SchemeSetuHeroDesign = () => {
  const [pulsePos, setPulsePos] = useState(0);
  const [searchTyped, setSearchTyped] = useState('');
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const navigate = useNavigate();

  // Pulse animation along the dotted arc path
  useEffect(() => {
    const timer = setInterval(() => {
      setPulsePos((prev) => (prev >= 100 ? 0 : prev + 0.8));
    }, 30);
    return () => clearInterval(timer);
  }, []);

  // Subtle typewriter effect inside laptop search bar
  useEffect(() => {
    const queries = ['PM-KISAN Samman Nidhi...', 'Scholarships for students...', 'Ayushman Bharat health cover...'];
    let queryIndex = 0;
    let charIndex = 0;
    let isDeleting = false;

    const typeInterval = setInterval(() => {
      const currentQuery = queries[queryIndex];

      if (!isDeleting) {
        setSearchTyped(currentQuery.substring(0, charIndex + 1));
        charIndex++;
        if (charIndex === currentQuery.length) {
          isDeleting = true;
          setTimeout(() => {}, 1500);
        }
      } else {
        setSearchTyped(currentQuery.substring(0, charIndex - 1));
        charIndex--;
        if (charIndex === 0) {
          isDeleting = false;
          queryIndex = (queryIndex + 1) % queries.length;
        }
      }
    }, 120);

    return () => clearInterval(typeInterval);
  }, []);

  const [descTyped, setDescTyped] = useState('');
  const fullDesc = 'Discover government schemes you are eligible for and unlock benefits that build a better life.';

  // Typewriter effect for hero description
  useEffect(() => {
    let index = 0;
    const descInterval = setInterval(() => {
      if (index <= fullDesc.length) {
        setDescTyped(fullDesc.slice(0, index));
        index++;
      } else {
        clearInterval(descInterval);
      }
    }, 28);
    return () => clearInterval(descInterval);
  }, []);

  // Card highlight auto-pulse loop inside laptop screen
  useEffect(() => {
    const cardTimer = setInterval(() => {
      setActiveCardIndex((prev) => (prev + 1) % 3);
    }, 3000);
    return () => clearInterval(cardTimer);
  }, []);

  return (
    <div className="w-full bg-[#f4f8fc] text-slate-900 overflow-hidden font-sans select-none relative">
      
      {/* Dynamic Keyframe Animations */}
      <style>{`
        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes ribbonFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -400; }
        }
        .animate-float {
          animation: floatSlow 4s ease-in-out infinite;
        }
        .animate-ribbon-flow {
          animation: ribbonFlow 15s linear infinite;
        }
      `}</style>

      {/* 
        ========================================================================
        HERO MAIN SECTION (EXACT DESIGN & COMPOSITION MATCHING REFERENCE)
        ========================================================================
      */}
      <section className="relative w-full min-h-[640px] lg:min-h-[700px] pt-8 pb-10 bg-gradient-to-b from-[#f0f6ff] via-white to-[#f4f8fc] overflow-hidden">
        
        {/* Soft Background Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#0b2e59_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.035] pointer-events-none" />

        {/* ASHOKA CHAKRA WATERMARK (SLOW ROTATING VERY SUBTLE) */}
        <div className="absolute top-12 right-6 w-[540px] h-[540px] opacity-[0.09] pointer-events-none text-[#0052cc] z-0">
          <svg className="w-full h-full animate-spin-slow" style={{ animationDuration: '90s' }} viewBox="0 0 100 100">
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

        {/* HERO CONTENT CONTAINER */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* =========================================================
                LEFT COLUMN: TYPOGRAPHY, TRUST INDICATORS & BUTTONS
                ========================================================= */}
            <motion.div
              initial={{ opacity: 0, x: -35 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.25, 1, 0.5, 1] }}
              className="lg:col-span-5 space-y-6 text-left pt-4"
            >
              
              {/* Main Headline with Text Blur Reveal Effect */}
              <div className="space-y-1">
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-serif font-bold text-[#0b2e59] tracking-tight leading-[1.12]">
                  <motion.span
                    initial={{ filter: 'blur(16px)', opacity: 0, y: 15 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                  >
                    Empowering
                  </motion.span>
                  <motion.span
                    initial={{ filter: 'blur(16px)', opacity: 0, y: 15 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                  >
                    Every Indian
                  </motion.span>
                  <motion.span
                    initial={{ filter: 'blur(16px)', opacity: 0, y: 15 }}
                    animate={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-[#138808] font-serif"
                  >
                    Every Day
                  </motion.span>
                </h1>
              </div>

              {/* Supporting Text with Typewriter Effect */}
              <p className="text-base sm:text-lg text-slate-600 font-medium max-w-md leading-relaxed min-h-[56px]">
                {descTyped}
                {descTyped.length < fullDesc.length && (
                  <span className="inline-block w-0.5 h-4 bg-[#0052cc] ml-0.5 animate-pulse align-middle" />
                )}
              </p>

              {/* 4 Trust Indicators Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 text-slate-700">
                
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-[#0052cc] flex items-center justify-center shrink-0 border border-blue-200/80 shadow-2xs">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight text-slate-800">
                    Trusted <br /> by Millions
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/80 shadow-2xs">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight text-slate-800">
                    1000+ <br /> Schemes
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#138808] flex items-center justify-center shrink-0 border border-emerald-200/80 shadow-2xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight text-slate-800">
                    Simple <br /> & Secure
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-200/80 shadow-2xs">
                    <Headphones className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-bold leading-tight text-slate-800">
                    24x7 <br /> Support
                  </span>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  to="/eligibility"
                  className="px-8 py-3.5 bg-[#0052cc] hover:bg-[#0041a3] text-white text-sm font-extrabold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 cursor-pointer group"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/schemes"
                  className="px-7 py-3.5 bg-white border border-[#0052cc] hover:bg-blue-50/50 text-[#0052cc] text-sm font-extrabold rounded-full shadow-2xs transition-all flex items-center gap-2 cursor-pointer group"
                >
                  <span>Browse Schemes</span>
                  <ArrowRight className="w-4 h-4 text-[#0052cc] group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

            </motion.div>

            {/* =========================================================
                RIGHT COLUMN: LAPTOP MOCKUP + DOTTED ARC + FLOATING BADGES
                ========================================================= */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 1, 0.5, 1] }}
              className="lg:col-span-7 relative flex items-center justify-center min-h-[500px] lg:min-h-[560px] pt-4"
            >
              
              {/* CONTAINER FOR ARC + LAPTOP + FLOATING BADGES */}
              <div className="relative w-full h-[520px] flex items-center justify-center">
                
                {/* SVG DASHED CIRCULAR ARC SYSTEM WITH GLOWING MOTION PARTICLES */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 520" preserveAspectRatio="none">
                  {/* Outer Dashed Arc */}
                  <path
                    d="M 100 130 C 220 20, 420 10, 500 15 C 680 20, 850 60, 920 240 C 960 340, 920 440, 850 480"
                    fill="none"
                    stroke="#0052cc"
                    strokeWidth="2"
                    strokeDasharray="8 8"
                    className="opacity-45"
                  />

                  {/* Energy Particle Traveling Along Arc */}
                  <path
                    d="M 100 130 C 220 20, 420 10, 500 15 C 680 20, 850 60, 920 240 C 960 340, 920 440, 850 480"
                    fill="none"
                    stroke="#ff9933"
                    strokeWidth="3.5"
                    strokeDasharray="30 700"
                    strokeDashoffset={`${-pulsePos * 7}`}
                    className="transition-all duration-75"
                  />

                  {/* Secondary Green Particle */}
                  <path
                    d="M 100 130 C 220 20, 420 10, 500 15 C 680 20, 850 60, 920 240 C 960 340, 920 440, 850 480"
                    fill="none"
                    stroke="#138808"
                    strokeWidth="3.5"
                    strokeDasharray="20 700"
                    strokeDashoffset={`${-(pulsePos + 50) * 7}`}
                    className="transition-all duration-75 opacity-80"
                  />
                </svg>

                {/* 4 FLOATING CIRCULAR BADGES ALONG THE ARC */}
                {ARC_BADGES.map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className="absolute z-30 transform -translate-x-1/2 -translate-y-1/2 animate-float"
                      style={{
                        top: badge.pos.top,
                        left: badge.pos.left,
                        animationDelay: `${idx * 0.8}s`
                      }}
                    >
                      <div className="flex flex-col items-center text-center gap-1.5 group cursor-pointer">
                        <div className={`w-13 h-13 rounded-full bg-white shadow-md border ${badge.borderColor} flex items-center justify-center ${badge.color} group-hover:scale-110 transition-transform duration-300`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 bg-white/95 px-3 py-0.5 rounded-full shadow-2xs border border-slate-200/90 whitespace-nowrap">
                          {badge.title}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* =====================================================
                    REALISTIC SILVER METALLIC LAPTOP HARDWARE MOCKUP
                    ===================================================== */}
                <div className="relative z-20 w-[95%] sm:w-[86%] lg:w-[90%] max-w-[640px] pt-2">
                  
                  {/* Laptop Aluminum Outer Frame */}
                  <div className="bg-gradient-to-b from-[#e2e8f0] via-[#cbd5e1] to-[#94a3b8] p-2 rounded-t-[28px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35)] border border-slate-300 relative">
                    
                    {/* Dark Screen Bezel */}
                    <div className="bg-[#0b0f19] p-2 sm:p-2.5 rounded-t-2xl border border-slate-900 relative">
                      
                      {/* Top Bezel Web Camera & Status Indicator */}
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-950 mx-auto mb-1.5 border border-slate-800 flex items-center justify-center">
                        <div className="w-0.5 h-0.5 rounded-full bg-blue-400 animate-pulse" />
                      </div>

                      {/* LAPTOP DISPLAY CONTENT (LIVE SCHEMESETU PLATFORM UI) */}
                      <div className="bg-white rounded-lg overflow-hidden border border-slate-200 text-left text-xs text-slate-800 shadow-inner">
                        
                        {/* Inside Screen Header Bar */}
                        <div className="bg-white px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {/* Emblem Icon */}
                            <div className="w-5 h-5 rounded-md bg-blue-50 border border-blue-200 text-[#0052cc] flex items-center justify-center font-extrabold text-[10px]">
                              🏛️
                            </div>
                            <span className="font-extrabold text-[#0b2e59] text-xs">
                              SchemeSetu
                            </span>
                            <span className="text-[8px] text-slate-400 font-medium hidden sm:inline">
                              Connecting Citizens to Government Schemes
                            </span>
                          </div>

                          <div className="flex items-center gap-3 text-[9px] font-semibold text-slate-600">
                            <span className="text-[#0052cc] font-bold underline">Home</span>
                            <span>Browse Schemes</span>
                            <span>Dashboard</span>
                            <button className="px-2.5 py-0.5 bg-[#0052cc] text-white font-bold rounded-md text-[9px]">
                              Login
                            </button>
                          </div>
                        </div>

                        {/* Inside Screen Hero Banner */}
                        <div className="bg-gradient-to-r from-[#0052cc] to-blue-700 p-4 text-white relative overflow-hidden">
                          
                          <div className="max-w-[65%] space-y-1.5 z-10 relative">
                            <h4 className="text-xs sm:text-sm font-black tracking-tight leading-snug">
                              Find Government Schemes <br />
                              <span className="text-amber-300">You are eligible for</span>
                            </h4>
                            
                            {/* Animated Search Bar */}
                            <div className="bg-white rounded-lg p-1.5 flex items-center justify-between text-slate-800 shadow-md">
                              <span className="text-[10px] text-slate-500 font-medium pl-1 truncate max-w-[170px]">
                                {searchTyped}<span className="animate-pulse">|</span>
                              </span>
                              <div className="w-5 h-5 rounded-md bg-[#0052cc] text-white flex items-center justify-center shrink-0">
                                <Search className="w-3 h-3" />
                              </div>
                            </div>
                          </div>

                          {/* Banner Right Decorative Icon */}
                          <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-15">
                            <Building className="w-24 h-24 text-white" />
                          </div>
                        </div>

                        {/* Inside Screen 3 Feature Cards */}
                        <div className="p-3 bg-slate-50 grid grid-cols-3 gap-2 border-b border-slate-100">
                          
                          {/* Card 1 */}
                          <div className={`p-2.5 rounded-lg bg-white border transition-all duration-300 ${activeCardIndex === 0 ? 'border-[#0052cc] shadow-md ring-1 ring-blue-200' : 'border-slate-200'}`}>
                            <div className="w-5 h-5 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center mb-1">
                              <ShieldCheck className="w-3 h-3" />
                            </div>
                            <h5 className="text-[10px] font-bold text-slate-900">Check Eligibility</h5>
                            <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                              Check eligibility in seconds
                            </p>
                            <span className="text-[8px] font-extrabold text-[#0052cc] flex items-center gap-0.5 mt-1">
                              Check now &rarr;
                            </span>
                          </div>

                          {/* Card 2 */}
                          <div className={`p-2.5 rounded-lg bg-white border transition-all duration-300 ${activeCardIndex === 1 ? 'border-[#0052cc] shadow-md ring-1 ring-blue-200' : 'border-slate-200'}`}>
                            <div className="w-5 h-5 rounded-md bg-blue-50 text-[#0052cc] flex items-center justify-center mb-1">
                              <FileEdit className="w-3 h-3" />
                            </div>
                            <h5 className="text-[10px] font-bold text-slate-900">Apply Online</h5>
                            <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                              Apply via official portals
                            </p>
                            <span className="text-[8px] font-extrabold text-[#0052cc] flex items-center gap-0.5 mt-1">
                              Apply now &rarr;
                            </span>
                          </div>

                          {/* Card 3 */}
                          <div className={`p-2.5 rounded-lg bg-white border transition-all duration-300 ${activeCardIndex === 2 ? 'border-[#0052cc] shadow-md ring-1 ring-blue-200' : 'border-slate-200'}`}>
                            <div className="w-5 h-5 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                              <IndianRupee className="w-3 h-3" />
                            </div>
                            <h5 className="text-[10px] font-bold text-slate-900">Track Benefits</h5>
                            <p className="text-[8px] text-slate-500 leading-tight mt-0.5">
                              Track application status
                            </p>
                            <span className="text-[8px] font-extrabold text-[#0052cc] flex items-center gap-0.5 mt-1">
                              Track status &rarr;
                            </span>
                          </div>

                        </div>

                        {/* Inside Screen Bottom Sub-bar */}
                        <div className="bg-white px-3 py-2 grid grid-cols-4 gap-1 text-[8px] text-slate-600 border-t border-slate-100 text-center">
                          <div>
                            <span className="font-extrabold text-slate-900 block">1000+</span>
                            <span>Schemes</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">50Cr+</span>
                            <span>Citizens</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">24x7</span>
                            <span>Support</span>
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 block">100%</span>
                            <span>Secure</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Silver Aluminum Laptop Base & Center Notch */}
                  <div className="bg-gradient-to-r from-[#cbd5e1] via-[#e2e8f0] to-[#94a3b8] h-3.5 rounded-b-2xl shadow-xl border-t border-slate-300 relative flex items-start justify-center">
                    <div className="w-20 h-1.5 rounded-b-md bg-[#64748b]/50 shadow-inner" />
                  </div>
                </div>

              </div>

            </motion.div>

          </div>
        </div>

      </section>
    </div>
  );
};
