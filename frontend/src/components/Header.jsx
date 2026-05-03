import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Star, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import useUserStore from '../store/userStore';
import { speakContent, stopSpeech } from '../utils/speech';

const Header = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { messages, language } = useUserStore();
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isHome = location.pathname === '/';

  // Stop speech whenever the page changes
  useEffect(() => {
    stopSpeech();
    setIsSpeaking(false);
  }, [location.pathname]);

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      setIsSpeaking(false);
      return;
    }

    // Pick text based on current page
    let text = '';
    const p = location.pathname;

    if (p === '/') {
      const last = [...messages].reverse().find(m => m.role === 'assistant');
      text = last?.content ?? "Hello! I am Pollaris, your Election Assistant. How can I help you today?";
    } else if (p === '/guide') {
      text = "This is the Election Timeline 2024. It covers registration deadlines, nomination filing, voting day, and results.";
    } else if (p === '/candidates') {
      text = "Here you can meet your candidates. Check their details and make an informed choice.";
    } else if (p === '/help') {
      text = "Need to report a problem? Call the 1950 helpline or use the cVIGIL app to report violations.";
    } else if (p === '/map') {
      text = "Find your polling booth here. Enter your details to locate where you should go to vote.";
    } else {
      text = "Welcome to Pollaris, your election assistant.";
    }

    if (text) {
      setIsSpeaking(true);
      speakContent(text, language, () => setIsSpeaking(false));
    }
  };

  return (
    <header className="fixed-header">
      <div className="flex items-center gap-3">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            id="back-btn"
            aria-label="Go back"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
        )}
        <div className="flex items-center gap-2">
          <Star className="text-primary fill-primary" size={24} />
          <span className="text-xl font-bold text-primary tracking-tight uppercase">Pollaris</span>
        </div>
      </div>

      {/* Speaker button */}
      <button
        id="speaker-button"
        onClick={handleSpeak}
        className={`ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 ${
          isSpeaking
            ? 'bg-primary text-white border-primary'
            : 'bg-white text-gray-600 border-gray-300 hover:border-primary hover:text-primary'
        }`}
        aria-label={isSpeaking ? 'Stop speaking' : 'Read aloud'}
      >
        {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
        <span>{isSpeaking ? 'Stop' : 'A+ / Speaker'}</span>
      </button>
    </header>
  );
};

export default Header;
