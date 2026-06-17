import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Type, Languages, Accessibility, RefreshCw } from 'lucide-react';

interface AccessibilityProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  langMode: 'ml' | 'en';
  setLangMode: (mode: 'ml' | 'en') => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
}

export default function AccessibilityControls({
  fontSize,
  setFontSize,
  langMode,
  setLangMode,
  highContrast,
  setHighContrast
}: AccessibilityProps) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Read aloud helper using Web Speech Synthesis API
  const speakText = (text: string) => {
    if (!soundEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // Prefer Indian English or local voice if available, else standard
    utterance.lang = langMode === 'ml' ? 'ml-IN' : 'en-IN';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  };

  // Listen to mouse hovers on button elements if TTS is active to serve as an auditory Screen Reader
  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      if (!soundEnabled) return;
      const target = e.target as HTMLElement;
      // If it contains a screen-readable tag or text
      const readableText = target.getAttribute('aria-label') || target.innerText;
      if (readableText && readableText.length < 200) {
        speakText(readableText);
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [soundEnabled, langMode]);

  return (
    <div id="accessibility-panel" className="bg-emerald-50 dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 py-2 px-4 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        {/* Organization / Brand Flag */}
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-medium">
          <Accessibility className="w-4 h-4" />
          <span className="font-mono">Ability Foundation Accessibility Shield</span>
        </div>

        {/* Dynamic controls */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 font-sans justify-center">
          {/* Sound Screen Reader */}
          <button
            onClick={() => {
              const nextState = !soundEnabled;
              setSoundEnabled(nextState);
              if (!nextState) stopSpeaking();
              else speakText(langMode === 'ml' ? 'ശബ്ദ സഹായം സജീവമാക്കി' : 'Screen reader active');
            }}
            id="btn-sound-toggle"
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-medium transition-all ${
              soundEnabled
                ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
            }`}
            title="Read text on mouse hover"
            aria-label={soundEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech Screen Reader"}
          >
            {soundEnabled ? (
              <>
                <Volume2 className={`w-4 h-4 ${speaking ? 'animate-bounce' : ''}`} />
                <span>Reader active</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>Enable Audio Coach</span>
              </>
            )}
          </button>

          {/* Sizing scale */}
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700 p-0.5">
            <span className="pl-3 pr-1 text-slate-500 dark:text-slate-400 flex items-center">
              <Type className="w-3.5 h-3.5 mr-1" /> Size:
            </span>
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              id="btn-font-decrease"
              className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full font-semibold focus:outline-none"
              aria-label="Decrease Font Size"
            >
              A-
            </button>
            <span className="font-bold px-1 text-emerald-700 dark:text-emerald-400">{fontSize}px</span>
            <button
              onClick={() => setFontSize(Math.min(24, fontSize + 2))}
              id="btn-font-increase"
              className="px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full font-semibold focus:outline-none"
              aria-label="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* Lang mode toggler */}
          <button
            onClick={() => {
              const nextLang = langMode === 'ml' ? 'en' : 'ml';
              setLangMode(nextLang);
              speakText(nextLang === 'ml' ? 'മലയാളം ഭാഷ തിരഞ്ഞെടുത്തു' : 'English language enabled');
            }}
            id="btn-lang-toggle"
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-medium"
            aria-label="Switch Language Malayalam or English"
          >
            <Languages className="w-4 h-4 text-slate-400 mr-0.5" />
            <span>{langMode === 'ml' ? 'മലയാളം' : 'English'}</span>
          </button>

          {/* High Contrast */}
          <button
            onClick={() => {
              setHighContrast(!highContrast);
              speakText(
                !highContrast 
                  ? 'ഉയർന്ന കോൺട്രാസ്റ്റ് ഓൺ ആക്കി' 
                  : 'സാധാരണ മോഡ് സജീവമാക്കി'
              );
            }}
            id="btn-contrast-toggle"
            className={`px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 font-medium transition-all ${
              highContrast
                ? 'bg-slate-900 text-yellow-300 ring-2 ring-yellow-400'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
            aria-label="Toggle High Contrast Accessible Colors"
          >
            ♿ {highContrast ? "Standard View" : "Accessible Contrast"}
          </button>
        </div>
      </div>
    </div>
  );
}
