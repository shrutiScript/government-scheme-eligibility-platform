import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Search,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  Sprout,
  GraduationCap,
  Home,
  HeartPulse,
  Briefcase,
  Award,
  Check,
  ChevronRight,
  TrendingUp,
  FileCheck,
  IndianRupee,
  Zap,
  Building,
  Landmark
} from 'lucide-react';

const SCHEME_SECTORS = [
  { id: 'all', label: 'All Sectors', icon: Landmark, count: '500+' },
  { id: 'farming', label: 'Agriculture & Farmers', icon: Sprout, count: '125+' },
  { id: 'education', label: 'Education & Youth', icon: GraduationCap, count: '140+' },
  { id: 'housing', label: 'Housing & Infrastructure', icon: Home, count: '85+' },
  { id: 'healthcare', label: 'Health & Family Care', icon: HeartPulse, count: '95+' },
  { id: 'business', label: 'MSME & Entrepreneurship', icon: Briefcase, count: '75+' }
];

const SCHEME_FLOW_ITEMS = [
  {
    id: 'kisan',
    title: 'PM-KISAN Samman Nidhi',
    sector: 'farming',
    ministry: 'Ministry of Agriculture & Farmers Welfare',
    benefitText: '₹6,000 / Year Direct Income Support',
    benefitValue: 6000,
    matchScore: 98,
    badgeText: 'Direct Benefit Transfer (DBT)',
    icon: Sprout,
    borderColor: 'border-emerald-200 hover:border-emerald-400',
    accentBg: 'bg-emerald-50 text-emerald-700',
    progressGradient: 'from-[#138808] to-emerald-400',
    pos: { top: '8%', left: '8%' }
  },
  {
    id: 'awas',
    title: 'PM Awas Yojana (PMAY)',
    sector: 'housing',
    ministry: 'Ministry of Housing & Urban Affairs',
    benefitText: '₹1.20 Lakh to ₹2.67 Lakh Financial Assistance',
    benefitValue: 120000,
    matchScore: 94,
    badgeText: 'Housing Subsidy',
    icon: Home,
    borderColor: 'border-amber-200 hover:border-amber-400',
    accentBg: 'bg-amber-50 text-amber-800',
    progressGradient: 'from-[#ff9933] to-amber-400',
    pos: { top: '8%', right: '8%' }
  },
  {
    id: 'ayushman',
    title: 'Ayushman Bharat (PM-JAY)',
    sector: 'healthcare',
    ministry: 'Ministry of Health & Family Welfare',
    benefitText: '₹5.00 Lakh Cashless Health Cover / Family',
    benefitValue: 500000,
    matchScore: 100,
    badgeText: 'Instant Health Card',
    icon: HeartPulse,
    borderColor: 'border-blue-200 hover:border-blue-400',
    accentBg: 'bg-blue-50 text-blue-800',
    progressGradient: 'from-blue-600 to-cyan-400',
    pos: { bottom: '12%', left: '8%' }
  },
  {
    id: 'scholarship',
    title: 'Post-Matric National Scholarship',
    sector: 'education',
    ministry: 'Ministry of Social Justice & Empowerment',
    benefitText: 'Full Tuition Fee Waiver + Maintenance Allowance',
    benefitValue: 24000,
    matchScore: 91,
    badgeText: '100% Fee Support',
    icon: GraduationCap,
    borderColor: 'border-purple-200 hover:border-purple-400',
    accentBg: 'bg-purple-50 text-purple-800',
    progressGradient: 'from-purple-600 to-indigo-400',
    pos: { bottom: '12%', right: '8%' }
  }
];

export const SchemeSetuHeroMotionGraphic = () => {
  const canvasRef = useRef(null);
  const [selectedSector, setSelectedSector] = useState('all');
  const [activeHoverScheme, setActiveHoverScheme] = useState(null);
  const [scanPulse, setScanPulse] = useState(0);
  const [citizensCount, setCitizensCount] = useState(2845910);
  const [totalBenefitCalculated, setTotalBenefitCalculated] = useState(650000);

  // Live citizen counter pulse
  useEffect(() => {
    const timer = setInterval(() => {
      setCitizensCount((prev) => prev + Math.floor(Math.random() * 4) + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Scanning pulse animation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setScanPulse((prev) => (prev >= 360 ? 0 : prev + 1.5));
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // HTML5 Canvas background particle stream (Light Theme Clean Motion Graphic)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Light subtle particles representing citizen data packets
    const nodes = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 2 + 1.5,
      color: Math.random() > 0.5 ? '#ff9933' : '#138808'
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw subtle connective web
      for (let i = 0; i < nodes.length; i++) {
        const n1 = nodes[i];
        n1.x += n1.vx;
        n1.y += n1.vy;

        if (n1.x < 0 || n1.x > width) n1.vx *= -1;
        if (n1.y < 0 || n1.y > height) n1.vy *= -1;

        ctx.beginPath();
        ctx.arc(n1.x, n1.y, n1.r, 0, Math.PI * 2);
        ctx.fillStyle = n1.color === '#ff9933' ? 'rgba(230, 120, 16, 0.25)' : 'rgba(19, 136, 8, 0.25)';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(15, 41, 66, ${ (1 - dist / 120) * 0.06 })`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Filter schemes
  const visibleSchemes = SCHEME_FLOW_ITEMS.filter(
    (s) => selectedSector === 'all' || s.sector === selectedSector
  );

  return (
    <section className="relative w-full bg-[#f8fafc] text-slate-900 overflow-hidden pt-8 pb-12 border-b border-slate-200/80 select-none">
      
      {/* Background Motion Canvas (Subtle light particle grid) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
      />

      {/* Decorative Subtle Background Gradients */}
      <div className="absolute top-0 right-0 w-[550px] h-[550px] bg-gradient-to-bl from-amber-100/40 via-blue-50/30 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-100/40 via-slate-50 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* =========================================================================
              LEFT COLUMN: CLEAN GOVERNMENT PORTAL BRANDING & SEARCH INTENT
              ========================================================================= */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Government Platform Header Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 shadow-2xs">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600" />
              </span>
              <span className="text-xs font-bold text-[#0f2942] tracking-tight">
                SchemeSetu Platform
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ff9933]/15 text-[#c96a0b] uppercase tracking-wider">
                Digital India Integration
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#0f2942] tracking-tight leading-[1.18]">
                Find Government Schemes & Benefits <br className="hidden sm:inline" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e07a10] via-[#0f2942] to-[#138808]">
                  Tailored For You in 60 Seconds
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed max-w-xl">
                SchemeSetu automatically evaluates your age, state, occupation, income, and category against <strong className="text-slate-900 font-semibold">500+ Central & State Welfare Schemes</strong> to deliver instant, verified eligibility matches.
              </p>
            </div>

            {/* Sector Category Motion Switchers */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Select Sector to Visualize Eligibility:
                </span>
                <span className="text-[11px] font-semibold text-[#0f2942] flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  Live Motion Engine Active
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {SCHEME_SECTORS.map((sector) => {
                  const Icon = sector.icon;
                  const isSelected = selectedSector === sector.id;
                  return (
                    <button
                      key={sector.id}
                      onClick={() => setSelectedSector(sector.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                        isSelected
                          ? 'bg-[#0f2942] text-white shadow-md scale-105 ring-2 ring-blue-900/20'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs hover:border-slate-300'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`} />
                      <span>{sector.label}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {sector.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <Link
                to="/eligibility"
                className="btn-saas-action group shrink-0 px-6 py-3 bg-[#0f2942] text-white text-sm font-extrabold rounded-xl shadow-md hover:bg-[#0c2338] transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Check My Scheme Eligibility</span>
                <ArrowRight className="w-4 h-4 btn-arrow-icon" />
              </Link>

              <Link
                to="/schemes"
                className="px-5 py-3 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-sm font-bold shadow-2xs transition-all inline-flex items-center justify-center gap-2 text-center"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Browse All 500+ Schemes</span>
              </Link>
            </div>

            {/* Trust Features */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-200/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">100% Free Service</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">Direct Official Portals</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="text-xs font-semibold text-slate-700">No Signup Fees</span>
              </div>
            </div>

          </div>

          {/* =========================================================================
              RIGHT COLUMN: PROFESSIONAL MOTION GRAPHIC SCHEME FLOW & ELIGIBILITY DIAGRAM
              ========================================================================= */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            
            {/* White Container Box with Elevated Shadow & Tricolor Subtle Border */}
            <div className="relative w-full min-h-[440px] sm:min-h-[480px] bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 overflow-hidden flex flex-col justify-between">
              
              {/* Subtle Tricolor Accent Bottom Stripe */}
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#ff9933] via-slate-200 to-[#138808]" />

              {/* Graphic Title Bar */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-[#0f2942] uppercase tracking-wider">
                    Live Scheme Matching Engine
                  </span>
                </div>
                <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  Profile: Verified Citizen
                </span>
              </div>

              {/* CENTRAL CITIZEN HUB CARD */}
              <div className="relative z-20 my-auto flex flex-col items-center justify-center text-center py-6">
                
                {/* Orbital Rotating Scan Ring */}
                <div
                  className="absolute w-56 h-56 rounded-full border-2 border-dashed border-slate-200 pointer-events-none transition-transform duration-100"
                  style={{ transform: `rotate(${scanPulse}deg)` }}
                />

                <div
                  className="absolute w-72 h-72 rounded-full border border-slate-100 pointer-events-none transition-transform duration-100"
                  style={{ transform: `rotate(-${scanPulse * 0.5}deg)` }}
                />

                {/* Citizen Profile Node Card */}
                <div className="relative z-30 bg-[#0f2942] text-white px-6 py-4 rounded-2xl shadow-xl border border-blue-900 flex flex-col items-center gap-2 max-w-[240px]">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#ff9933] to-[#138808] p-0.5 flex items-center justify-center shadow-md">
                    <div className="w-full h-full bg-[#0f2942] rounded-full flex items-center justify-center text-white">
                      <Users className="w-5 h-5 text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-extrabold text-white tracking-wide">
                      Citizen Eligibility Profile
                    </h3>
                    <p className="text-[10px] text-slate-300 font-medium">
                      Age: 26 • Income: &lt; ₹2.5L • Farmer / Student
                    </p>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    <span>Calculated Total Entitlement: ₹6.3L+</span>
                  </div>
                </div>

              </div>

              {/* ORBITING SECTOR SCHEME BENEFIT CARDS */}
              <div className="relative z-30 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {visibleSchemes.map((scheme) => {
                  const Icon = scheme.icon;
                  const isHovered = activeHoverScheme === scheme.id;

                  return (
                    <div
                      key={scheme.id}
                      onMouseEnter={() => setActiveHoverScheme(scheme.id)}
                      onMouseLeave={() => setActiveHoverScheme(null)}
                      className={`p-3.5 rounded-2xl bg-slate-50/90 border transition-all duration-300 cursor-pointer text-left ${scheme.borderColor} ${
                        isHovered ? 'bg-white shadow-lg -translate-y-1 ring-2 ring-slate-200' : 'shadow-2xs'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className={`p-1.5 rounded-lg ${scheme.accentBg}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <Check className="w-3 h-3 text-emerald-600" />
                          {scheme.matchScore}% Match
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                        {scheme.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1">
                        {scheme.ministry}
                      </p>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/70 flex items-center justify-between text-[11px]">
                        <span className="font-extrabold text-[#0f2942] truncate">
                          {scheme.benefitText}
                        </span>
                        <ChevronRight className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isHovered ? 'translate-x-1 text-[#0f2942]' : ''}`} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Connecting Vector Lines Overlay */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30">
                <line x1="50%" y1="40%" x2="25%" y2="75%" stroke="#0f2942" strokeWidth="1.5" strokeDasharray="4 4" />
                <line x1="50%" y1="40%" x2="75%" y2="75%" stroke="#0f2942" strokeWidth="1.5" strokeDasharray="4 4" />
              </svg>

            </div>

          </div>

        </div>

        {/* =========================================================================
            BOTTOM STATS TICKER (CLEAN WHITE CARD WITH RICH METRICS)
            ========================================================================= */}
        <div className="mt-10 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-100">
            
            <div className="space-y-1 px-2">
              <div className="text-xl sm:text-2xl font-extrabold text-[#0f2942] tracking-tight flex items-center justify-center gap-1">
                <span>500+</span>
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Central & State Schemes</p>
            </div>

            <div className="space-y-1 px-2">
              <div className="text-xl sm:text-2xl font-extrabold text-[#138808] tracking-tight flex items-center justify-center gap-1">
                <IndianRupee className="w-5 h-5 text-emerald-700" />
                <span>2.4 Lakh Cr+</span>
              </div>
              <p className="text-xs font-semibold text-slate-500">Direct Welfare Tracked</p>
            </div>

            <div className="space-y-1 px-2">
              <div className="text-xl sm:text-2xl font-extrabold text-[#0f2942] tracking-tight font-mono">
                {citizensCount.toLocaleString('en-IN')}+
              </div>
              <p className="text-xs font-semibold text-slate-500">Citizens Benefited</p>
            </div>

            <div className="space-y-1 px-2">
              <div className="text-xl sm:text-2xl font-extrabold text-[#c96a0b] tracking-tight flex items-center justify-center gap-1">
                <span>100%</span>
                <ShieldCheck className="w-4 h-4 text-[#c96a0b]" />
              </div>
              <p className="text-xs font-semibold text-slate-500">Verified Rule Engine</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
