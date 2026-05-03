/**
 * Pollaris — Speech Utility
 * Handles TTS (Text-to-Speech) with cross-browser support.
 *
 * Known browser quirks handled:
 * - Chrome GC bug: utterance must be kept in module-scope variable
 * - Chrome pause bug: call resume() before speak()
 * - Async voice loading: wait for onvoiceschanged if voices aren't ready
 */

const LANG_MAP = {
  en: 'en-IN', hi: 'hi-IN', ta: 'ta-IN', te: 'te-IN',
  kn: 'kn-IN', ml: 'ml-IN', bn: 'bn-IN', gu: 'gu-IN',
  mr: 'mr-IN', pa: 'pa-IN', or: 'or-IN', ur: 'ur-IN',
};

// Kept at module scope to prevent Chrome garbage-collecting the utterance
let _utterance = null;

const _doSpeak = (text, bcp47, onEnd) => {
  const synth = window.speechSynthesis;
  const voices = synth.getVoices();

  const utter = new SpeechSynthesisUtterance(text);
  _utterance = utter; // prevent GC

  utter.lang  = bcp47;
  utter.rate  = 0.9;
  utter.pitch = 1.0;

  // Best-effort voice selection
  const langPrefix = bcp47.split('-')[0];
  const voice =
    voices.find(v => v.lang === bcp47)        ||   // exact: hi-IN
    voices.find(v => v.lang.startsWith(langPrefix)) || // prefix: hi
    voices.find(v => v.lang.startsWith('en'));          // English fallback

  if (voice) utter.voice = voice;

  utter.onend   = () => { _utterance = null; onEnd?.(); };
  utter.onerror = (e) => { _utterance = null; console.warn('TTS error', e.error); onEnd?.(); };

  // Chrome bug: after cancel() the engine can be paused
  synth.resume();
  setTimeout(() => synth.speak(utter), 100);
};

/**
 * Speak `text` in the given language code (e.g. 'hi', 'ta', 'en').
 * Calls `onEnd()` when speech finishes or errors.
 */
export const speakContent = (text, langCode, onEnd) => {
  if (!window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    onEnd?.();
    return;
  }

  const synth  = window.speechSynthesis;
  const bcp47  = LANG_MAP[langCode] || 'en-IN';

  synth.cancel(); // stop any current speech

  const voices = synth.getVoices();
  if (voices.length > 0) {
    _doSpeak(text, bcp47, onEnd);
  } else {
    // Voices load asynchronously on first call in some browsers
    synth.onvoiceschanged = () => {
      synth.onvoiceschanged = null;
      _doSpeak(text, bcp47, onEnd);
    };
  }
};

/** Stop any currently playing speech immediately. */
export const stopSpeech = () => {
  window.speechSynthesis?.cancel();
  _utterance = null;
};

export { LANG_MAP };
