import React, { useState } from 'react';
import { CheckSquare, Square, Star, ShieldCheck, Download } from 'lucide-react';

const items = [
  { id: 1, text: 'Voter ID Card (EPIC)', info: 'Or any valid photo ID' },
  { id: 2, text: 'Know your polling booth', info: 'Check Map tab' },
  { id: 3, text: 'Checked candidate list', info: 'See Candidates tab' },
  { id: 4, text: 'Phone charged', info: 'For booth directions' },
  { id: 5, text: 'Reminded neighbors', info: 'Every vote matters' },
  { id: 6, text: 'Reach before 6 PM', info: 'Booth closes at 6 PM' },
  { id: 7, text: 'No phone inside booth', info: 'ECI rule' },
];

const Checklist = () => {
  const [list, setList] = useState(items.map(i => ({ ...i, done: false })));
  const toggle = id => setList(p => p.map(i => i.id === id ? { ...i, done: !i.done } : i));
  const done = list.filter(i => i.done).length;

  return (
    <div className="h-full">
      <div className="px-5 py-6">
        <div className="flex items-center gap-3 mb-5">
          <ShieldCheck size={28} className="text-secondary" />
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Voting Checklist</h1>
            <p className="text-sm text-gray-500">Be 100% ready on voting day</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-card overflow-hidden mb-5">
          <div className="px-5 py-3 bg-secondary text-white flex items-center justify-between">
            <span className="font-bold text-sm">Progress</span>
            <span className="text-sm font-bold">{done}/{list.length}</span>
          </div>
          <div className="w-full bg-gray-100 h-2">
            <div className="h-2 bg-primary transition-all duration-500 rounded-r-full" style={{ width: `${(done / list.length) * 100}%` }}></div>
          </div>
          <div className="divide-y divide-gray-50">
            {list.map(item => (
              <button key={item.id} onClick={() => toggle(item.id)} className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left" id={`check-${item.id}`}>
                {item.done ? <CheckSquare size={24} className="text-secondary flex-shrink-0" /> : <Square size={24} className="text-gray-300 flex-shrink-0" />}
                <div>
                  <span className={`font-medium ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.text}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{item.info}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        {done === list.length && (
          <div className="bg-secondary-50 rounded-2xl p-5 text-center animate-slide-up border border-secondary/20">
            <span className="text-3xl mb-2 block">🎉</span>
            <h3 className="font-bold text-secondary">You are ready to vote!</h3>
            <p className="text-sm text-gray-600 mt-1">Democracy thanks you.</p>
          </div>
        )}
        <button className="w-full mt-4 py-4 rounded-2xl text-white font-bold gradient-green flex items-center justify-center gap-2 shadow-lg active:scale-[0.98]">
          <Download size={18} /> Download Checklist
        </button>
      </div>
    </div>
  );
};

export default Checklist;
