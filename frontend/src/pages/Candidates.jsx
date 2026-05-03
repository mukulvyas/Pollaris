import React, { useState, useEffect } from 'react';
import { Search, Star, GitCompare, Loader2, X, GraduationCap, BadgeIndianRupee, Scale, ShieldCheck } from 'lucide-react';
import { candidateService } from '../utils/api';
import useUserStore from '../store/userStore';

const Candidates = () => {
  const { constituency } = useUserStore();
  const [query, setQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        setIsLoading(true);
        const res = await candidateService.getAll(constituency);
        const data = (res.data.candidates || []).map((c, i) => ({ ...c, id: c.id || `c-${i}` }));
        setCandidates(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching candidates:', err);
        setError('Failed to load candidate information. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCandidates();
  }, [constituency]);

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id) 
        : [...prev, id]
    );
  };

  const filtered = candidates.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.party.toLowerCase().includes(query.toLowerCase())
  );

  const selectedCandidates = candidates.filter(c => selectedIds.includes(c.id));

  return (
    <div className="h-full flex flex-col relative bg-[#F8F9FA]">
      {/* Header Area */}
      <div className="px-5 pt-6 pb-2 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-0.5">Know Your Candidate</h1>
        <p className="text-sm text-gray-500 mb-1">Access verified information about representatives.</p>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Select candidates to compare</p>
        
        <div className="relative mb-3">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search by candidate name or party" 
            className="w-full py-3 pl-11 pr-4 rounded-xl bg-gray-50 border border-gray-200 text-sm focus:outline-none focus:border-[#F5831F] focus:ring-1 focus:ring-[#F5831F]/20" 
          />
        </div>
      </div>

      {/* Candidates List */}
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-[140px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="text-[#F5831F] animate-spin" size={32} />
            <p className="text-gray-500 font-medium">Fetching verified records...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 p-4 rounded-xl border border-red-100 text-center">
            <p className="text-red-600 text-sm">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-2 text-[#F5831F] font-bold text-sm underline">Retry</button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const isSelected = selectedIds.includes(c.id);
              return (
                <div 
                  key={c.id} 
                  onClick={() => toggleSelection(c.id)}
                  className={`relative p-4 rounded-[12px] border-[1.5px] transition-all cursor-pointer ${
                    isSelected ? 'border-[#F5831F] bg-[#FFF8F3]' : 'border-[#E0E0E0] bg-white'
                  }`}
                >
                  {/* Custom Checkbox Top-Left */}
                  <div className="absolute top-4 left-4 z-10">
                    <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'bg-[#F5831F] border-[#F5831F] text-white' : 'bg-white border-gray-300'
                    }`}>
                      {isSelected && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    </div>
                  </div>

                  <div className="pl-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900 truncate">{c.name}</h3>
                          {c.verified && <Star size={14} className="text-[#F5831F] fill-[#F5831F]" />}
                        </div>
                        <p className="text-sm font-bold text-[#F5831F] mt-0.5">{c.party}</p>
                      </div>
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 flex-shrink-0 text-xl">👤</div>
                    </div>

                    <div className="grid grid-cols-1 gap-y-2 mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <GraduationCap size={14} className="text-gray-400" />
                        <span className="text-xs text-gray-600 font-medium truncate">{c.education}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Scale size={14} className={c.criminal_cases > 0 ? 'text-red-500' : 'text-green-500'} />
                          <span className={`text-xs font-bold ${c.criminal_cases > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {c.criminal_cases} Criminal Cases
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BadgeIndianRupee size={14} className="text-gray-400" />
                          <span className="text-xs font-bold text-gray-800">{c.total_assets} Assets</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-gray-400 py-8">No candidates found matching your search.</p>}
          </div>
        )}
      </div>

      {/* Compare Button */}
      {selectedIds.length >= 2 && (
        <div 
          className="fixed bottom-[65px] left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-32px)] max-w-[398px]"
        >
          <button 
            onClick={() => setShowComparison(true)}
            className="w-full h-[52px] bg-[#F5831F] text-white rounded-[26px] font-semibold text-lg flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-transform"
          >
            <GitCompare size={20} />
            Compare {selectedIds.length} Candidates
          </button>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparison && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-[199] animate-fade-in" 
            onClick={() => setShowComparison(false)}
          />
          <div 
            className="fixed top-[60px] bottom-[65px] left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white rounded-t-[20px] z-[200] flex flex-col shadow-2xl animate-slide-up"
          >
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[20px] z-10">
              <h2 className="text-xl font-extrabold text-gray-900">Comparison Table</h2>
              <button 
                onClick={() => setShowComparison(false)}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[320px]">
                    <thead>
                      <tr>
                        <th className="text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-4 w-1/3">Field</th>
                        {selectedCandidates.map(c => (
                          <th key={c.id} className="text-center pb-4 px-2">
                            <div className="flex flex-col items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1.5 border border-gray-200">👤</div>
                              <p className="text-xs font-bold text-gray-900 leading-tight mb-0.5">{c.name.split(' ')[0]}</p>
                              <p className="text-[10px] font-bold text-[#F5831F] uppercase">{c.party}</p>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Education</td>
                        {selectedCandidates.map(c => (
                          <td key={c.id} className="py-4 text-center text-xs font-semibold text-gray-800 px-2">{c.education}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Criminal Cases</td>
                        {selectedCandidates.map(c => (
                          <td key={c.id} className="py-4 text-center">
                            <span className={`text-xs font-bold ${c.criminal_cases > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {c.criminal_cases}
                            </span>
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Assets</td>
                        {selectedCandidates.map(c => (
                          <td key={c.id} className="py-4 text-center text-xs font-bold text-gray-900 px-2">{c.total_assets}</td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Verified</td>
                        {selectedCandidates.map(c => (
                          <td key={c.id} className="py-4 text-center text-xs">
                            {c.verified ? '✅' : '❌'}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-50 flex flex-col items-center gap-1 pb-4">
                   <p className="text-[10px] text-gray-400 italic">Source: myneta.info</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Candidates;
