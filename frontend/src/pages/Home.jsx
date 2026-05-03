import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Star, ChevronRight, Sparkles, Users, ArrowLeft, Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import useUserStore from '../store/userStore';
import LanguageGrid from '../components/LanguageGrid';
import { chatService } from '../utils/api';

// ─── Language map: code → BCP-47 tag ───────────────────────────────────────
const LANG_MAP = {
  en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
  kn: 'kn-IN', ml: 'ml-IN', bn: 'bn-IN', gu: 'gu-IN',
  mr: 'mr-IN', pa: 'pa-IN', or: 'or-IN', ur: 'ur-IN',
};

// ─── Speech Recognition helper ──────────────────────────────────────────────
const getSpeechRecognition = () =>
  window.SpeechRecognition || window.webkitSpeechRecognition || null;

// ─── TTS: speak a string ────────────────────────────────────────────────────
// We keep utterance in module-scope to prevent Chrome GC bug
let _currentUtterance = null;

const speakText = (text, langCode, onEnd) => {
  const synth = window.speechSynthesis;
  if (!synth) return;

  synth.cancel();

  const lang = LANG_MAP[langCode] || 'en-IN';
  const utter = new SpeechSynthesisUtterance(text);
  _currentUtterance = utter; // prevent garbage collection
  utter.lang = lang;
  utter.rate = 0.92;
  utter.pitch = 1.05;

  const doSpeak = () => {
    const voices = synth.getVoices();
    // Try exact match first (e.g. hi-IN), then prefix match (hi)
    const voice =
      voices.find(v => v.lang === lang) ||
      voices.find(v => v.lang.startsWith(lang.split('-')[0])) ||
      voices.find(v => v.lang.startsWith('en'));
    if (voice) utter.voice = voice;

    utter.onend = () => { _currentUtterance = null; if (onEnd) onEnd(); };
    utter.onerror = () => { _currentUtterance = null; if (onEnd) onEnd(); };

    // Chrome sometimes needs resume() after cancel()
    synth.resume();
    setTimeout(() => synth.speak(utter), 120);
  };

  // Voices might not be loaded yet
  if (synth.getVoices().length > 0) {
    doSpeak();
  } else {
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null;
      doSpeak();
    };
  }
};

const stopSpeech = () => {
  window.speechSynthesis?.cancel();
  _currentUtterance = null;
};

// ─── Component ───────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const {
    language, setLanguage,
    sessionId, setSessionId,
    messages, addMessage, completeOnboarding,
    clearMessages,
  } = useUserStore();

  const [inputText, setInputText]   = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isProceeded, setIsProceeded] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState(null); // which message is playing
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Reset chat when language changes to avoid mixing languages in one thread
  useEffect(() => {
    if (language) {
      clearMessages();
      setSessionId(null);
    }
  }, [language, clearMessages, setSessionId]);

  // Stop speech when unmounting
  useEffect(() => () => stopSpeech(), []);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || isLoading) return;

    setInputText('');
    addMessage('user', msg);
    setIsLoading(true);
    stopSpeech();
    setIsSpeaking(false);
    setSpeakingIdx(null);

    // GA: track chat message sent
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('chat_message_sent', { language, message_length: msg.length });
    }

    try {
      const sid = sessionId || `sess_${Date.now()}`;
      if (!sessionId) setSessionId(sid);

      const res = await chatService.send(msg, sid, language);
      const reply = res.data?.reply || 'Sorry, I could not get a response. Please try again.';
      addMessage('assistant', reply);
    } catch {
      addMessage('assistant',
        'Sorry, I am having trouble connecting to the server. Please make sure the backend is running and try again. 🙏'
      );
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, sessionId, language, addMessage, setSessionId]);

  const handleSend = () => sendMessage(inputText);

  // ── Chip click ──────────────────────────────────────────────────────────────
  const handleChip = (query) => {
    if (isLoading) return;
    sendMessage(query);
  };

  // ── Voice input (Mic) ───────────────────────────────────────────────────────
  const handleMic = useCallback(() => {
    const SR = getSpeechRecognition();
    if (!SR) {
      addMessage('assistant', 'Voice input is not supported in your browser. Please type your question.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // GA: track voice input usage
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('voice_input_started', { language });
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = LANG_MAP[language] || 'en-IN';
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onerror  = () => setIsListening(false);
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInputText(transcript);
      setIsListening(false);
    };

    try { rec.start(); } catch { setIsListening(false); }
  }, [isListening, language, addMessage]);

  // ── TTS ─────────────────────────────────────────────────────────────────────
  const handleSpeak = (text, idx) => {
    if (isSpeaking && speakingIdx === idx) {
      stopSpeech();
      setIsSpeaking(false);
      setSpeakingIdx(null);
      return;
    }

    stopSpeech();
    setIsSpeaking(true);
    setSpeakingIdx(idx);
    speakText(text, language, () => {
      setIsSpeaking(false);
      setSpeakingIdx(null);
    });
  };

  // ── Proceed ─────────────────────────────────────────────────────────────────
  const handleProceed = useCallback(() => {
    setIsProceeded(true);
    completeOnboarding();
    // GA: track onboarding completion
    if (typeof window.trackEvent === 'function') {
      window.trackEvent('onboarding_complete', { language });
    }
  }, [completeOnboarding, language]);

  // ── Suggestion chips ────────────────────────────────────────────────────────
  const CHIPS = [
    { text: '🗳️ How do I vote?',       query: 'How do I vote?' },
    { text: '📋 Valid ID proofs',        query: 'What ID do I need to vote?' },
    { text: '📍 Find my booth',          query: 'How to find my polling booth?' },
    { text: '📅 Election dates',         query: 'When are elections?' },
    { text: '👤 Know candidates',        query: 'Show me candidate information' },
    { text: '🔰 What is NOTA?',          query: 'What is NOTA?' },
    { text: '📝 Voter registration',     query: 'How to register as a voter?' },
    { text: '⚡ What is EVM?',           query: 'Is EVM safe?' },
  ];

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4 pb-28">

        {/* ── Welcome Screen ─────────────────────────────────────────────── */}
        {!isProceeded ? (
          <div className="flex flex-col items-center text-center animate-fade-in pt-4">
            {/* Mascot */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-50 to-orange-100 flex items-center justify-center mb-5 shadow-lg border-4 border-white">
              <span className="text-6xl">🙏</span>
            </div>

            <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">
              Hello! I am{' '}
              <span className="text-primary">Pollaris</span> —<br />
              your Election Assistant.
            </h1>
            <p className="flex items-center gap-1 text-primary mt-1">
              <Sparkles size={18} />
            </p>

            <p className="text-gray-500 mt-4 text-base leading-relaxed max-w-xs">
              I can help you with everything related to elections — simple, clear, and in your language.
            </p>

            <div className="mt-4 bg-blue-50 px-4 py-2 rounded-full">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Choose your language</p>
            </div>

            {/* Language Grid */}
            <div className="w-full mt-4">
              <LanguageGrid selected={language} onSelect={setLanguage} />
            </div>

            {/* CTAs */}
            <button
              onClick={() => navigate('/guide')}
              className="w-full mt-5 py-4 rounded-2xl text-white font-bold text-base gradient-orange flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
              id="first-voter-btn"
            >
              <Star size={18} className="fill-white" />
              First Time Voter Guide
            </button>

            <button
              onClick={() => navigate('/candidates')}
              className="w-full mt-3 py-4 rounded-2xl text-white font-bold text-base gradient-blue flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
              id="meet-candidates-btn"
            >
              <Users size={18} />
              Meet Your Candidates
            </button>

            <button
              onClick={handleProceed}
              className="w-full mt-3 py-4 rounded-2xl font-bold text-base text-gray-700 bg-white border-2 border-gray-200 flex items-center justify-center gap-2 hover:border-primary transition-colors"
              id="continue-btn"
            >
              <ChevronRight size={18} />
              Start Chat / Proceed
            </button>
          </div>

        ) : (
          /* ── Chat Screen ──────────────────────────────────────────────── */
          <div className="space-y-4">
            {/* Back to home */}
            <button
              onClick={() => setIsProceeded(false)}
              className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-2"
              id="chat-back-btn"
            >
              <ArrowLeft size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Back to Home</span>
            </button>

            {/* Greeting bubble */}
            {messages.length === 0 && !isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md text-sm leading-relaxed bg-white text-gray-800 shadow-card border border-gray-100">
                  {language === 'hi' ? '👋 नमस्ते! मैं पोलारिस हूँ, आपका AI चुनाव मित्र। मुझसे चुनाव, उम्मीदवारों या पोलिंग बूथ के बारे में कुछ भी पूछें!' :
                   language === 'ta' ? '👋 வணக்கம்! நான் பொல்லாரிஸ், உங்கள் AI தேர்தல் நண்பன். தேர்தல், வேட்பாளர்கள் அல்லது வாக்குச்சாவடிகள் பற்றி என்னிடம் கேளுங்கள்!' :
                   language === 'te' ? '👋 నమస్కారం! నేను పొల్లారిస్, మీ AI ఎన్నికల స్నేహితుడిని. ఎన్నికలు, అభ్యర్థులు లేదా పోలింగ్ బూత్‌ల గురించి నన్ను ఏదైనా అడగండి!' :
                   '👋 Namaste! I\'m Pollaris, your AI Election Assistant. Ask me anything about voting, candidates, or polling booths — in any language!'}
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                style={{ animationDelay: `${Math.min(i, 5) * 40}ms` }}
              >
                <div
                  className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white text-gray-800 shadow-card border border-gray-100 rounded-bl-md pb-5'
                  }`}
                >
                  {msg.content}

                  {/* Speaker button on assistant messages */}
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleSpeak(msg.content, i)}
                      className={`absolute bottom-1.5 right-2 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all ${
                        isSpeaking && speakingIdx === i
                          ? 'text-primary font-semibold'
                          : 'text-gray-400 hover:text-primary'
                      }`}
                      title={isSpeaking && speakingIdx === i ? 'Stop' : 'Read aloud'}
                      aria-label="Read aloud"
                    >
                      {isSpeaking && speakingIdx === i
                        ? <><VolumeX size={11} /> Stop</>
                        : <><Volume2 size={11} /> Listen</>
                      }
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Loading dots */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-white px-5 py-3 rounded-2xl rounded-bl-md shadow-card border border-gray-100">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            {/* Suggestion chips */}
            {!isLoading && (
              <div className="mt-4 pb-4">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-3">💡 Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {CHIPS.map((chip) => (
                    <button
                      key={chip.query}
                      onClick={() => handleChip(chip.query)}
                      disabled={isLoading}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-700 hover:border-primary hover:text-primary transition-all shadow-sm active:scale-95 disabled:opacity-50"
                    >
                      {chip.text}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
            <div className="h-16" />
          </div>
        )}
      </div>

      {/* ── Input Bar ────────────────────────────────────────────────────── */}
      {isProceeded && (
        <div className="fixed-input-bar">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full w-full p-1.5 border border-gray-200">
            {/* Mic button */}
            <button
              onClick={handleMic}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                isListening ? 'bg-red-500 shadow-lg animate-pulse' : 'bg-gray-200 hover:bg-gray-300'
              }`}
              title={isListening ? 'Stop listening' : 'Speak'}
              aria-label={isListening ? 'Stop recording' : 'Start voice input'}
            >
              {isListening
                ? <MicOff size={16} className="text-white" />
                : <Mic size={16} className="text-gray-600" />
              }
            </button>

            {/* Text input */}
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={isListening ? '🎤 Listening...' : 'Ask me anything...'}
              className="flex-1 py-1 px-1 text-sm focus:outline-none border-none bg-transparent"
              id="chat-input"
              disabled={isLoading}
            />

            {/* Send button */}
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center disabled:opacity-40 shrink-0 transition-all active:scale-90"
              id="chat-send-btn"
              aria-label="Send message"
            >
              <Send size={17} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
