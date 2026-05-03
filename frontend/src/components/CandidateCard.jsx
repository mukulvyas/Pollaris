import React from 'react';
import { GraduationCap, Scale, BadgeIndianRupee, ShieldCheck, AlertTriangle, Star } from 'lucide-react';

const CandidateCard = ({ candidate, isSelected, onSelect, isSelectionMode }) => {
  const hasCases = candidate.criminal_cases > 0;

  return (
    <div 
      className={`bg-white rounded-2xl p-5 shadow-card animate-slide-up border transition-all ${
        isSelected ? 'border-primary ring-1 ring-primary/20' : 'border-gray-100'
      }`}
      onClick={() => isSelectionMode && onSelect(candidate.id)}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        {/* Selection Checkbox (visible in selection mode or if selected) */}
        {isSelectionMode && (
          <div className="flex-shrink-0 pt-1">
            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              isSelected ? 'bg-primary border-primary text-white' : 'bg-white border-gray-300'
            }`}>
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Avatar silhouette */}
        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 border-2 border-gray-200">
          <span className="text-2xl">👤</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg text-gray-900 truncate">{candidate.name}</h3>
            <Star size={14} className="text-primary fill-primary flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`w-2 h-2 rounded-full ${candidate.party === 'Lok Seva Party' ? 'bg-green-500' : candidate.party === 'Pragati Dal' ? 'bg-blue-500' : 'bg-purple-500'}`}></span>
            <span className="text-sm text-gray-500 font-medium">{candidate.party}</span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {candidate.verified && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
            <ShieldCheck size={12} /> Verified
          </span>
        )}
        {hasCases && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
            <AlertTriangle size={12} /> Cases
          </span>
        )}
      </div>

      <div className="border-t border-gray-100 mt-3 pt-3 space-y-2.5">
        {/* Education */}
        <div className="flex items-center gap-2.5">
          <GraduationCap size={16} className="text-gray-400" />
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Education</span>
            <p className="text-sm font-medium text-gray-800">{candidate.education}</p>
          </div>
        </div>

        {/* Criminal Cases */}
        <div className="flex items-center gap-2.5">
          <Scale size={16} className={hasCases ? 'text-red-400' : 'text-green-400'} />
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Criminal Cases</span>
            <p className={`text-sm font-bold ${hasCases ? 'text-red-600' : 'text-green-600'}`}>
              {candidate.criminal_cases === 0 ? '0 Cases Reported' : `${candidate.criminal_cases} Cases (Charges framed)`}
            </p>
          </div>
        </div>

        {/* Assets */}
        <div className="flex items-center gap-2.5">
          <BadgeIndianRupee size={16} className="text-gray-400" />
          <div>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Total Assets</span>
            <p className="text-sm font-bold text-gray-800">{candidate.total_assets}</p>
          </div>
        </div>
      </div>

      {/* Source */}
      <p className="text-xs text-gray-400 mt-3 italic">
        Source: affidavit on <a href="https://myneta.info" target="_blank" rel="noopener noreferrer" className="text-primary underline">myneta.info</a>
      </p>
    </div>
  );
};

export default CandidateCard;
