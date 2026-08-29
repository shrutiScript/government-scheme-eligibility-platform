import React from 'react';
import { Modal } from './Modal';
import { Badge, SchemeStatusBadge } from './Badge';
import {
  Building2,
  IndianRupee,
  Users,
  Calendar,
  ExternalLink,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  MapPin,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  PhoneCall,
  Edit,
  Eye,
  FileText,
  HelpCircle
} from 'lucide-react';

export const SchemeViewModal = ({ isOpen, onClose, scheme, onEdit }) => {
  if (!scheme) return null;

  const isActive = scheme.status ? scheme.status.toLowerCase() === 'active' : Boolean(scheme.isActive);

  // Extract all eligibility bounds safely
  const incomeCeiling = scheme.eligibility?.maxIncome ?? scheme.eligibilityCriteria?.maxIncome ?? 0;
  const minAge = scheme.eligibility?.minAge ?? scheme.eligibilityCriteria?.minAge ?? 0;
  const maxAge = scheme.eligibility?.maxAge ?? scheme.eligibilityCriteria?.maxAge ?? 100;
  const gender = scheme.eligibility?.gender || scheme.eligibilityCriteria?.gender || 'All';
  const targetState = scheme.targetStates ? scheme.targetStates.join(', ') : scheme.state || 'All India';

  const occupationsList = scheme.eligibility?.occupations ? scheme.eligibility.occupations.join(', ') : scheme.eligibilityCriteria?.allowedOccupations ? scheme.eligibilityCriteria.allowedOccupations.join(', ') : 'All Occupations';
  const educationList = scheme.eligibility?.educationLevels ? scheme.eligibility.educationLevels.join(', ') : scheme.eligibilityCriteria?.allowedEducations ? scheme.eligibilityCriteria.allowedEducations.join(', ') : 'All Education Levels';
  const castesList = scheme.eligibility?.castes ? scheme.eligibility.castes.join(', ') : scheme.eligibilityCriteria?.allowedCastes ? scheme.eligibilityCriteria.allowedCastes.join(', ') : 'All Castes';

  const disabilityReq = scheme.eligibility?.disabilityRequired || scheme.eligibilityCriteria?.disabilityRequired ? 'Required / Applicable' : 'Not Required';
  const bplReq = scheme.eligibility?.bplRequired || scheme.eligibilityCriteria?.bplRequired ? 'Required / BPL Card Holders' : 'Not Required';

  const documents = Array.isArray(scheme.requiredDocuments)
    ? scheme.requiredDocuments
    : Array.isArray(scheme.documentsRequired)
      ? scheme.documentsRequired
      : [];

  const benefitsList = Array.isArray(scheme.benefits)
    ? scheme.benefits
    : typeof scheme.benefits === 'string'
      ? scheme.benefits.split('\n').filter(Boolean)
      : [];

  const isNoAge = Boolean(
    scheme.eligibilityCriteria?.noAgeLimit ||
    scheme.eligibility?.noAgeLimit ||
    (scheme.eligibilityCriteria?.minAge === null && scheme.eligibilityCriteria?.maxAge === null) ||
    (scheme.eligibility?.minAge === null && scheme.eligibility?.maxAge === null)
  );

  const isNoIncome = Boolean(
    scheme.eligibilityCriteria?.noIncomeLimit ||
    scheme.eligibility?.noIncomeLimit ||
    scheme.eligibilityCriteria?.maxIncome === null ||
    scheme.eligibility?.maxIncome === null ||
    scheme.eligibilityCriteria?.maxAnnualIncome === null ||
    scheme.eligibility?.maxAnnualIncome === null
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Government Scheme Comprehensive Audit View" maxWidth="max-w-3xl">
      <div className="space-y-6 text-slate-800 text-xs">

        {/* Title Header Block */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-[#f0f6ff] via-white to-[#f4f8fc] border border-blue-100/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <SchemeStatusBadge isActive={isActive} status={scheme.status} />
              <Badge variant="primary">{scheme.category}</Badge>
              {scheme.sponsorType && (
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {scheme.sponsorType}
                </span>
              )}
              {scheme.code && (
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                  ID: {scheme.code}
                </span>
              )}
            </div>

            <h2 className="text-xl font-black text-[#0b2e59] tracking-tight">{scheme.title}</h2>

            <div className="flex items-center gap-4 text-slate-500 font-medium flex-wrap text-[11px]">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <Building2 className="w-3.5 h-3.5 text-[#0052cc]" />
                <span>{scheme.department}</span>
              </div>
              {scheme.launchDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Launched: {scheme.launchDate}</span>
                </div>
              )}
              {(scheme.lastDate || scheme.applicationLastDate) ? (
                <div className={`flex items-center gap-1 font-bold ${new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? 'text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200' : 'text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200'}`}>
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Last Date: {scheme.lastDate || scheme.applicationLastDate} {new Date(scheme.lastDate || scheme.applicationLastDate).getTime() < new Date().setHours(0, 0, 0, 0) ? '(Expired)' : ''}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-slate-500 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last Date: No Expiry (Ongoing)</span>
                </div>
              )}
              {scheme.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  <span>{scheme.viewCount} Citizen Views</span>
                </div>
              )}
            </div>
          </div>

          {onEdit && (
            <button
              onClick={() => {
                onClose();
                onEdit(scheme);
              }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#0052cc] to-[#0f2942] hover:from-[#0041a3] hover:to-[#091b2c] text-white font-extrabold text-xs rounded-xl shadow-md transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Scheme</span>
            </button>
          )}
        </div>

        {/* Short & Detailed Description */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#0052cc]" />
            <span>Scheme Description</span>
          </h4>
          <div className="text-slate-700 leading-relaxed text-xs bg-slate-50 p-4.5 rounded-2xl border border-slate-200/80 font-medium space-y-2">
            {scheme.shortDescription && (
              <p className="font-extrabold text-slate-900">{scheme.shortDescription}</p>
            )}
            <p>{scheme.detailedDescription || scheme.description || 'No detailed description provided.'}</p>
          </div>
        </div>

        {/* Comprehensive Eligibility Criteria Matrix */}
        <div className="space-y-2">
          <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#138808]" />
            <span>Eligibility Requirements Matrix</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Max Annual Income</span>
              <p className="font-black text-slate-900 text-sm">
                {isNoIncome ? 'No Income Limit' : `₹${incomeCeiling.toLocaleString('en-IN')} / yr`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Eligible Age Range</span>
              <p className="font-black text-slate-900 text-sm">
                {isNoAge ? 'No Age Limit' : `${minAge} - ${maxAge} yrs`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Gender Target</span>
              <p className="font-black text-slate-900 text-sm">{gender}</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">State Jurisdiction</span>
              <p className="font-black text-slate-900 text-sm">{targetState}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Occupations</span>
              <span className="font-extrabold text-slate-800">{occupationsList}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Education</span>
              <span className="font-extrabold text-slate-800">{educationList}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Caste Categories</span>
              <span className="font-extrabold text-slate-800">{castesList}</span>
            </div>
          </div>
        </div>

        {/* Key Benefits */}
        {benefitsList.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#138808]" />
              <span>Key Welfare Benefits</span>
            </h4>
            <ul className="space-y-2 bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/80">
              {benefitsList.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-slate-900 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-[#138808] shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Application Process */}
        {scheme.applicationProcess && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#0052cc]" />
              <span>Application Instructions</span>
            </h4>
            <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-slate-800 font-medium leading-relaxed">
              {scheme.applicationProcess}
            </div>
          </div>
        )}

        {/* Required Documents */}
        {documents.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Mandatory Documents Required</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {documents.map((doc, idx) => (
                <span key={idx} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-extrabold text-[11px] border border-slate-200/90 shadow-2xs">
                  <FileCheck className="w-3.5 h-3.5 text-[#0052cc]" />
                  <span>{doc}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Helpline Info */}
        {scheme.helpline && (
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center gap-3">
            <PhoneCall className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-[10px] font-bold text-amber-700 uppercase">Citizen Helpline Contact</span>
              <p className="font-extrabold text-slate-900 text-xs">{scheme.helpline}</p>
            </div>
          </div>
        )}

        {/* Footer Official Link & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
          {scheme.officialWebsiteUrl ? (
            <a
              href={scheme.officialWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-extrabold text-[#0052cc] hover:underline"
            >
              <span>Visit Official Government Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium">Official Portal Link N/A</span>
          )}

          <div className="flex items-center gap-3 shrink-0">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(scheme);
                }}
                className="px-4 py-2.5 bg-[#0052cc] hover:bg-[#0041a3] text-white font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Details</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </Modal>
  );
};
