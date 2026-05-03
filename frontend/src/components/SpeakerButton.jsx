import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const SpeakerButton = ({ isSpeaking, onClick }) => {
  return (
    <button
      onClick={onClick}
      id="speaker-button"
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
        isSpeaking
          ? 'bg-primary text-white border-primary'
          : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
      }`}
      aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
    >
      {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
      <span>{isSpeaking ? 'Stop' : 'A+ / Speaker'}</span>
    </button>
  );
};

export default SpeakerButton;
