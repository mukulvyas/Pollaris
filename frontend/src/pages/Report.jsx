import React, { useState } from 'react';
import { Phone, Camera, ExternalLink, Star, AlertTriangle, Users, ShieldAlert, Ban, MoreHorizontal, Send, Loader2, Plus, Minus } from 'lucide-react';
import { reportService } from '../utils/api';
import useUserStore from '../store/userStore';

const categories = [
  { id: 'bribery', icon: '💰', label: 'Bribery / Cash distribution', desc: 'Illegal exchange of money or gifts' },
  { id: 'fake', icon: '🎭', label: 'Fake voting', desc: 'Impersonation or multiple voting' },
  { id: 'booth', icon: '🏫', label: 'Booth capturing', desc: 'Illegal control of polling station' },
  { id: 'intimidation', icon: '⚠️', label: 'Intimidation', desc: 'Threats or pressure on voters' },
  { id: 'other', icon: '•••', label: 'Other', desc: 'Report any other violations not listed above' },
];

const KNOW_YOUR_RIGHTS = [
  {
    id: 'f1',
    q: "Can I vote without a Voter ID card?",
    a: "Yes! There are 12 valid ID proofs accepted at polling booths. Aadhaar Card, Passport, PAN Card, Driving License are all accepted. You only need ONE of them.",
    source: "eci.gov.in"
  },
  {
    id: 'f2',
    q: "Can a booth officer stop me from voting?",
    a: "No! If your name is on the voter list, nobody can stop you from voting. If you face any problem call 1950 immediately.",
    source: "Representation of People Act 1951"
  },
  {
    id: 'f3',
    q: "Can the EVM be hacked?",
    a: "No. EVMs are not connected to the internet or any network. They cannot be hacked remotely. The Supreme Court of India has declared EVMs safe and reliable.",
    source: "EVM Manual 2023, ECI"
  },
  {
    id: 'f4',
    q: "What if I press the wrong button on the EVM?",
    a: "Once a button is pressed on the EVM it cannot be changed. Take your time and choose your candidate carefully before pressing.",
    source: "eci.gov.in/voting-process"
  },
  {
    id: 'f5',
    q: "What is NOTA?",
    a: "NOTA means None of the Above. It is the last option on every EVM. Press it if you do not want to vote for any candidate. Your vote is counted but does not go to any candidate.",
    source: "Supreme Court Order 2013"
  },
  {
    id: 'f6',
    q: "Can senior citizens vote from home?",
    a: "Yes! Voters aged 85 and above and persons with disabilities can apply for postal ballot. Contact your returning officer or call 1950 for details.",
    source: "eci.gov.in/postal-ballot"
  }
];

const Report = () => {
  const { sessionId, location } = useUserStore();
  const [selected, setSelected] = useState('');
  const [desc, setDesc] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  const handleCamera = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!selected || !desc.trim() || isLoading) return;

    setIsLoading(true);
    try {
      let imageData = null;
      if (image) {
        imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      await reportService.submit(
        sessionId || 'anonymous',
        selected,
        desc.trim(),
        location?.lat,
        location?.lng,
        imageData
      );

      // GA: track report submission
      if (typeof window.trackEvent === 'function') {
        window.trackEvent('report_submitted', { category: selected, has_image: !!imageData });
      }

      setSubmitted(true);
      setSelected('');
      setDesc('');
      setImage(null);
      setPreview(null);
    } catch {
      alert('Failed to submit report. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full extra-bottom-padding">
      <div className="px-5 py-6">
        <div className="mb-1 text-xs font-bold text-primary uppercase tracking-wider">Emergency Assistance</div>
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Report a Problem</h1>
        <p className="text-sm text-gray-500 mb-5">Your contribution ensures a fair and transparent election process.</p>

        {submitted ? (
          <div className="bg-secondary-50 rounded-2xl p-6 text-center animate-fade-in">
            <span className="text-4xl mb-3 block">✅</span>
            <h3 className="text-lg font-bold text-secondary mb-2">Complaint Submitted</h3>
            <p className="text-sm text-gray-600">Your report (with evidence) has been recorded. Reference will be sent via SMS.</p>
            <button onClick={() => setSubmitted(false)} className="mt-4 text-sm font-bold text-primary underline">Report another issue</button>
          </div>
        ) : (
          <>
            {/* 1950 Helpline */}
            <a href="tel:1950" className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-card mb-4 border-l-4 border-primary hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center"><Phone size={22} className="text-primary" /></div>
              <div><h3 className="font-bold text-gray-900">Call 1950 Helpline</h3><p className="text-xs text-gray-500">Direct access to the Election Commission helpline</p></div>
            </a>

            {/* Camera */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <Camera size={22} className="text-blue-600" />
                <h3 className="font-bold text-gray-900">Take Photo of Violation</h3>
              </div>
              
              {preview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 border-2 border-blue-200">
                  <img src={preview} alt="Evidence" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => { setImage(null); setPreview(null); }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg"
                  >
                    <Ban size={16} />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 mb-2">Capture visual evidence safely and securely from your location.</p>
              )}

              <label className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">
                {preview ? 'CHANGE PHOTO' : 'LAUNCH CAMERA'}
                <input type="file" accept="image/*" capture="environment" onChange={handleCamera} className="hidden" />
              </label>
            </div>

            {/* cVIGIL */}
            <a href="https://cvigil.eci.gov.in" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-green-50 rounded-2xl p-4 mb-5 border border-green-100">
              <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-sm font-bold text-secondary">cV</div>
              <div><h3 className="font-bold text-gray-900 text-sm">cVIGIL App</h3><p className="text-xs text-gray-500">Official ECI Reporting App</p></div>
              <ExternalLink size={16} className="ml-auto text-secondary" />
            </a>

            {/* Categories */}
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><AlertTriangle size={16} className="text-primary" /> Report Categories</h3>
            <div className="space-y-2 mb-5">
              {categories.map(cat => (
                <button key={cat.id} onClick={() => setSelected(cat.id)} className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${selected === cat.id ? 'border-primary bg-primary-50' : 'border-gray-100 bg-white hover:border-gray-300'}`} id={`report-${cat.id}`}>
                  <span className="text-xl w-8 text-center">{cat.icon}</span>
                  <div><h4 className="font-bold text-sm text-gray-900">{cat.label}</h4><p className="text-xs text-gray-500">{cat.desc}</p></div>
                </button>
              ))}
            </div>

            {selected && (
              <div className="animate-slide-up">
                <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Describe the violation..." className="w-full p-4 rounded-xl border border-gray-200 text-sm h-24 resize-none focus:outline-none focus:border-primary mb-3" id="report-desc" />
                <button 
                  onClick={handleSubmit} 
                  disabled={!desc.trim() || isLoading} 
                  className="w-full py-4 rounded-2xl text-white font-bold gradient-orange flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 active:scale-[0.98]" 
                  id="report-submit"
                >
                  {isLoading ? (
                    <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                  ) : (
                    <><Send size={18} /> Submit Report {preview && '(with Photo)'}</>
                  )}
                </button>
              </div>
            )}

            {/* Disclaimer */}
            <div className="mt-5 bg-primary-50 rounded-2xl p-4 border border-primary/10">
              <div className="flex items-start gap-3">
                <Star className="text-primary fill-primary flex-shrink-0 mt-0.5" size={16} />
                <div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">Before you report</h4>
                  <p className="text-xs text-gray-600 leading-relaxed">Reports should be factual and made in good faith. False reporting is a punishable offence under the Representation of the People Act.</p>
                </div>
              </div>
            </div>

            {/* Know Your Rights FAQ Section */}
            <div className="mt-10 mb-8">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                Know Your Rights ⚖️
              </h2>
              <div className="space-y-3">
                {KNOW_YOUR_RIGHTS.map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div 
                      key={faq.id} 
                      className={`bg-white rounded-xl border transition-all duration-300 overflow-hidden ${
                        isOpen ? 'border-[#F5831F] border-l-4' : 'border-[#E0E0E0]'
                      }`}
                    >
                      <button 
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="w-full flex items-center justify-between p-4 text-left"
                        style={{ minHeight: '52px' }}
                      >
                        <span className={`font-semibold text-base ${isOpen ? 'text-[#F5831F]' : 'text-gray-800'}`}>
                          {faq.q}
                        </span>
                        {isOpen ? <Minus size={18} className="text-[#F5831F]" /> : <Plus size={18} className="text-gray-400" />}
                      </button>
                      <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${
                          isOpen ? 'max-h-96' : 'max-h-0'
                        }`}
                      >
                        <div className="px-4 pb-4">
                          <p className="text-gray-600 text-base leading-relaxed mb-3">{faq.a}</p>
                          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                            Source: {faq.source}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
        {/* Spacer for bottom nav */}
        <div className="h-10" />
      </div>
    </div>
  );
};

export default Report;
