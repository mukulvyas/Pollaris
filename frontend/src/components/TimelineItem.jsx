import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, Clock } from 'lucide-react';

const TimelineItem = ({ step, index, isLast }) => {
  const navigate = useNavigate();
  const statusStyles = {
    completed: {
      dot: 'bg-secondary text-white',
      line: 'bg-secondary',
      text: 'text-gray-900',
      icon: <CheckCircle2 size={20} />,
    },
    current: {
      dot: 'bg-primary text-white animate-pulse-slow',
      line: 'bg-gray-200',
      text: 'text-gray-900 font-bold',
      icon: <Clock size={20} />,
    },
    upcoming: {
      dot: 'bg-gray-200 text-gray-400',
      line: 'bg-gray-200',
      text: 'text-gray-500',
      icon: <Circle size={20} />,
    },
  };

  const style = statusStyles[step.status] || statusStyles.upcoming;

  return (
    <div className="flex gap-4 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${style.dot} shadow-sm flex-shrink-0`}>
          {style.icon}
        </div>
        {!isLast && (
          <div className={`w-0.5 flex-1 min-h-[40px] ${style.line} mt-1`}></div>
        )}
      </div>

      {/* Content */}
      <div className={`pb-6 flex-1 ${step.status === 'current' ? '' : ''}`}>
        <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${
          step.status === 'current' ? 'text-primary' : 'text-gray-400'
        }`}>
          {step.date}
        </div>
        <h4 className={`text-lg font-semibold ${style.text}`}>{step.title}</h4>
        <p className="text-sm text-gray-500 mt-1 leading-relaxed">{step.desc}</p>

        {step.status === 'current' && step.action && (
          <button 
            onClick={() => navigate('/map')}
            className="mt-3 px-5 py-2.5 rounded-xl text-sm font-bold text-white gradient-orange transition-transform active:scale-95 shadow-md"
          >
            {step.action}
          </button>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;
