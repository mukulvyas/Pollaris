import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Users, 
  MapPin, 
  ExternalLink, 
  Bell, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  PhoneCall, 
  Info,
  Vote,
  MessageSquare
} from 'lucide-react';
import useUserStore from '../store/userStore';

const ELECTIONS_2026 = [
  {
    id: 1,
    state: "Kerala",
    type: "Vidhan Sabha",
    date: "April - May 2026",
    seats: 140,
    status: "upcoming",
    eci_url: "https://eci.gov.in",
    results_url: null
  },
  {
    id: 2,
    state: "Tamil Nadu", 
    type: "Vidhan Sabha",
    date: "April - May 2026",
    seats: 234,
    status: "upcoming",
    eci_url: "https://eci.gov.in",
    results_url: null
  },
  {
    id: 3,
    state: "West Bengal",
    type: "Vidhan Sabha", 
    date: "April - May 2026",
    seats: 294,
    status: "upcoming",
    eci_url: "https://eci.gov.in",
    results_url: null
  },
  {
    id: 4,
    state: "Assam",
    type: "Vidhan Sabha",
    date: "April - May 2026", 
    seats: 126,
    status: "upcoming",
    eci_url: "https://eci.gov.in",
    results_url: null
  },
  {
    id: 5,
    state: "Puducherry",
    type: "Vidhan Sabha",
    date: "April - May 2026",
    seats: 30,
    status: "upcoming",
    eci_url: "https://eci.gov.in",
    results_url: null
  },
  {
    id: 6,
    state: "Delhi",
    type: "Vidhan Sabha",
    date: "February 2025",
    seats: 70,
    status: "completed",
    eci_url: "https://eci.gov.in",
    results_url: "https://results.eci.gov.in"
  },
  {
    id: 7,
    state: "Bihar",
    type: "Vidhan Sabha",
    date: "Oct - Nov 2025",
    seats: 243,
    status: "completed",
    eci_url: "https://eci.gov.in",
    results_url: "https://results.eci.gov.in"
  },
  {
    id: 8,
    state: "Lok Sabha",
    type: "General Election",
    date: "2029 (Expected)",
    seats: 543,
    status: "future",
    eci_url: "https://eci.gov.in",
    results_url: null
  }
];

const IMPORTANT_DATES = [
  { icon: "📋", text: "Register by March 2026" },
  { icon: "🗳️", text: "Kerala votes: Apr-May 2026" },
  { icon: "🗳️", text: "Tamil Nadu votes: Apr-May 2026" },
  { icon: "📊", text: "Delhi results: Feb 2025 ✓" }
];

const ELECTION_101 = [
  {
    id: 1,
    icon: "📝",
    title: "Step 1: Register",
    body: "First add your name to the official voter list",
    color: "bg-orange-50",
    query: "How do I register as a voter?"
  },
  {
    id: 2,
    icon: "🗳️",
    title: "Step 2: Vote",
    body: "Go to your booth and press the button on the EVM",
    color: "bg-green-50",
    query: "What happens on voting day?"
  },
  {
    id: 3,
    icon: "📊",
    title: "Step 3: Results",
    body: "Votes are counted and the winner is announced",
    color: "bg-blue-50",
    query: "How are votes counted?"
  }
];



const initialChecklist = [
  { id: 1, text: 'Voter ID / valid ID proof ready', checked: false },
  { id: 2, text: 'Booth address saved / screenshotted', checked: false },
  { id: 3, text: 'Charged phone', checked: false },
  { id: 4, text: 'Know your candidate', checked: false },
  { id: 5, text: 'Tell one neighbor to vote too', checked: false },
];

const Guide = () => {
  const navigate = useNavigate();
  const { addMessage } = useUserStore();
  const [activeFilter, setActiveFilter] = useState("upcoming");
  const [expandedCard, setExpandedCard] = useState(null);
  const [checklist, setChecklist] = useState(initialChecklist);
  const [toast, setToast] = useState(null);

  const toggleCheck = (id) => setChecklist(p => p.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const done = checklist.filter(i => i.checked).length;

  const filteredElections = activeFilter === "all" 
    ? ELECTIONS_2026
    : ELECTIONS_2026.filter(e => e.status === activeFilter);

  const handle101Click = (query) => {
    addMessage('user', query);
    navigate('/');
  };

  const showReminderToast = () => {
    setToast("Reminder set! We will notify you when dates are announced.");
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'upcoming':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF3E0] text-[#F5831F]">Upcoming</span>;
      case 'completed':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E8F5E9] text-[#2E7D32]">Completed</span>;
      case 'ongoing':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E3F2FD] text-[#1565C0]">Ongoing</span>;
      case 'future':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#F5F5F5] text-[#757575]">Future</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-full bg-[#F5F5F0] pb-24 overflow-x-hidden">
      {/* Important Dates Bar */}
      <div className="bg-[#FFF8F0] p-3 flex gap-3 overflow-x-auto no-scrollbar border-b border-orange-100 sticky top-0 z-20">
        {IMPORTANT_DATES.map((pill, idx) => (
          <div key={idx} className="flex-shrink-0 px-4 py-2 border border-[#F5831F] rounded-full bg-white text-sm font-medium flex items-center gap-2">
            <span>{pill.icon}</span>
            <span className="whitespace-nowrap text-gray-800">{pill.text}</span>
          </div>
        ))}
      </div>

      <div className="px-5 py-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-6">Election Guide 2026</h1>

        {/* Election 101 Section */}
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            Election 101 — How Does an Election Work? 🏛️
          </h2>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {ELECTION_101.map((item) => (
              <button
                key={item.id}
                onClick={() => handle101Click(item.query)}
                className={`flex-shrink-0 w-64 p-5 rounded-2xl ${item.color} border border-white shadow-sm text-left active:scale-95 transition-transform`}
              >
                <span className="text-3xl mb-3 block">{item.icon}</span>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.body}</p>
                <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#F5831F]">
                  ASK AI <MessageSquare size={12} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'upcoming', 'completed'].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setExpandedCard(null);
              }}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all border ${
                activeFilter === filter 
                  ? 'bg-[#F5831F] text-white border-[#F5831F]' 
                  : 'bg-white text-gray-500 border-[#E0E0E0]'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {/* Election Cards Grid */}
        <div className="space-y-4">
          {filteredElections.map((election) => {
            const isExpanded = expandedCard === election.id;
            return (
              <div 
                key={election.id} 
                className="bg-white rounded-xl border border-[#E0E0E0] shadow-sm overflow-hidden transition-all animate-fade-in"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{election.state}</h3>
                      <p className="text-sm text-gray-500">{election.type}</p>
                    </div>
                    {getStatusBadge(election.status)}
                  </div>

                  <div className="flex gap-4 mb-4">
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Calendar size={16} />
                      {election.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                      <Users size={16} />
                      {election.seats} Seats
                    </div>
                  </div>

                  {election.status === 'upcoming' && (
                    <button 
                      onClick={() => setExpandedCard(isExpanded ? null : election.id)}
                      className="w-full py-3 rounded-xl border border-[#F5831F] text-[#F5831F] font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-50"
                    >
                      {isExpanded ? '▲ Show Less' : '🗳️ View Election Details →'}
                    </button>
                  )}

                  {election.status === 'completed' && (
                    <a 
                      href={election.results_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3 rounded-xl border border-[#2E7D32] text-[#2E7D32] font-bold text-sm flex items-center justify-center gap-2 hover:bg-green-50"
                    >
                      📊 View Results →
                    </a>
                  )}

                  {election.status === 'future' && (
                    <button 
                      onClick={showReminderToast}
                      className="w-full py-3 rounded-xl border border-gray-400 text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
                    >
                      📅 Set Reminder →
                    </button>
                  )}

                  <div 
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      isExpanded ? 'max-height-600 mt-4 border-t border-gray-100 pt-4' : 'max-h-0'
                    }`}
                    style={{ maxHeight: isExpanded ? '600px' : '0px' }}
                  >
                    <div className="space-y-4 mb-6">
                      <TimelineStep label="Voter Registration Deadline" date="Check eci.gov.in" />
                      <TimelineStep label="Nomination Filing" date="Check eci.gov.in" />
                      <TimelineStep label="Campaign Period Ends" date="Check eci.gov.in" />
                      <TimelineStep label="Voting Day" date={election.date} isHighlight info="Booths open 7AM - 6PM" />
                      <TimelineStep label="Counting Day" date="Check eci.gov.in" />
                      <TimelineStep label="Results Announced" date="Check eci.gov.in" />
                    </div>

                    <div className="flex gap-3">
                      <button 
                        onClick={() => navigate('/map')}
                        className="flex-1 py-3 bg-[#F5831F] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-sm"
                      >
                        <MapPin size={16} /> Find My Booth
                      </button>
                      <a 
                        href="https://eci.gov.in"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-3 border border-[#2E7D32] text-[#2E7D32] rounded-xl font-bold text-sm flex items-center justify-center gap-2"
                      >
                        <ExternalLink size={16} /> ECI Website
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>



        {/* Voting Day Checklist */}
        <div className="mt-8 bg-white rounded-2xl p-5 shadow-card border border-[#E0E0E0]">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🗳️</span>
            <h3 className="text-lg font-bold text-gray-900">Voting Day Checklist</h3>
            <span className="ml-auto text-xs font-bold text-[#F5831F] bg-orange-50 px-2 py-1 rounded-full">{done}/{checklist.length}</span>
          </div>
          <div className="space-y-1">
            {checklist.map(item => (
              <button 
                key={item.id} 
                onClick={() => toggleCheck(item.id)} 
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left" 
                id={`checklist-${item.id}`}
              >
                <div className={`flex-shrink-0 transition-all ${item.checked ? 'text-[#2E7D32]' : 'text-gray-300'}`}>
                  {item.checked ? <CheckCircle2 size={22} fill="currentColor" className="text-white fill-[#2E7D32]" /> : <div className="w-[22px] h-[22px] rounded-md border-2 border-gray-200" />}
                </div>
                <span className={`text-sm font-medium ${item.checked ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                  {item.text}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Info Card */}
        <div className="mt-8 bg-green-50 rounded-xl border-2 border-dashed border-green-200 p-5">
          <div className="flex items-start gap-3 mb-4">
            <Info className="text-[#1B5E20] flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-gray-900">Dates not confirmed yet?</h4>
              <p className="text-sm text-gray-600 leading-relaxed mt-1">
                State election dates are announced by Election Commission of India. 
                For latest confirmed dates visit eci.gov.in or call 1950.
              </p>
            </div>
          </div>
          <a 
            href="tel:1950"
            className="w-full py-4 bg-[#1B5E20] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-md"
          >
            <PhoneCall size={18} /> Call 1950 Now
          </a>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-full text-sm font-medium shadow-2xl animate-slide-up z-50">
          {toast}
        </div>
      )}
    </div>
  );
};

const TimelineStep = ({ label, date, isHighlight, info }) => (
  <div className="flex gap-3">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full mt-1.5 ${isHighlight ? 'bg-[#F5831F] scale-125' : 'bg-gray-300'}`} />
      <div className="w-0.5 flex-1 bg-gray-200" />
    </div>
    <div className="pb-2">
      <p className={`text-sm ${isHighlight ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>{label}</p>
      <p className="text-xs text-gray-500">{date}</p>
      {info && <p className="text-[11px] text-[#F5831F] font-bold mt-0.5">{info}</p>}
    </div>
  </div>
);

export default Guide;
