import React from 'react';
import { Mic, MicOff } from 'lucide-react';

const MicButton = ({ isListening, onClick, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16',
  };

  return (
    <button
      onClick={onClick}
      id="mic-button"
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center transition-all duration-300 ${
        isListening
          ? 'bg-red-500 text-white mic-glow scale-110'
          : 'bg-secondary text-white hover:bg-secondary-light shadow-lg hover:shadow-xl hover:scale-105'
      }`}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? <MicOff size={24} /> : <Mic size={24} />}
    </button>
  );
};

export default MicButton;
