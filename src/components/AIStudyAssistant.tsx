import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Loader2, User, RefreshCw, Volume2, HelpCircle } from 'lucide-react';
import { ChatMessage, Student } from '../types';

interface AIStudyAssistantProps {
  currentStudent: Student | null;
  onStudentRegister: (student: Student) => void;
}

const TEMPLATE_PROMPTS = [
  { text: "കേരള നവോത്ഥാനം പഠന ട്രിക്ക്", label: "🎨 നവോത്ഥാന ട്രിക്ക്" },
  { text: "ഇന്ത്യൻ ഭരണഘടന പ്രധാന ഭേദഗതികൾ", label: "📜 ഭരണഘടനാ ഭേദഗതി" },
  { text: "മലപ്പുറം ജില്ല - പിഎസ്സി പ്രധാന വസ്തുതകൾ", label: "📍 മലപ്പുറം ജി്ല്ല" },
  { text: "എനിക്ക് ഒരു 30 ദിവസത്തെ സ്റ്റഡി പ്ലാൻ തരൂ", label: "📅 30 Days Study Plan" }
];

export default function AIStudyAssistant({ currentStudent, onStudentRegister }: AIStudyAssistantProps) {
  const [userNameInput, setUserNameInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "model",
      text: "സ്വാഗതം! ഞാൻ നിങ്ങളുടെ അബിലിറ്റി പി.എസ്.സി സഹായിയാണ്. സിലബസ് വിഷയങ്ങളിലെ സംശയങ്ങൾ, എളുപ്പവഴികൾ, മുൻ ചോദ്യങ്ങൾ എന്നിവ ഞാൻ പറഞ്ഞുതരാം. മലയാളത്തിലും ഇംഗ്ലീഷിലും ചോദിക്കാം!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleNameSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userNameInput.trim()) return;

    try {
      // Register or fetch Student record in our full-stack database
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: userNameInput.trim() })
      });
      if (res.ok) {
        const studentData = await res.json();
        onStudentRegister(studentData);
        
        // Append custom greeting message
        setMessages(prev => [
          ...prev,
          {
            id: `greet-${Date.now()}`,
            role: "model",
            text: `നമസ്കാരം ${studentData.name}! നമുക്ക് പഠനം ആരംഭിക്കാം. നിങ്ങൾക്ക് ഏത് വിഷയത്തിലാണ് സംശയമുള്ളത്?`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to register student on server", err);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || !currentStudent) return;

    // Add user message to state
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userName: currentStudent.name,
          history: messages
        })
      });

      if (res.ok) {
        const data = await res.json();
        
        // Add model message
        setMessages(prev => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'model',
            text: data.text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);

        // Sync streak and attendance counts with database server if chat is productive
        await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentStudent.id,
            action: 'submit_quiz', // triggers study progression points
            payload: { pointsEarned: 10, quizTitle: "AI Consultation", quizId: "ai-chat" }
          })
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Convert text output to voice narration
  const speakText = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      // clean markdown markers for smooth voice over
      const cleaned = text.replace(/[*#`_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = 'ml-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  // Entry Gate: Ask Name
  if (!currentStudent) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-8 text-center max-w-md mx-auto">
        <div className="bg-emerald-100 dark:bg-emerald-950/60 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-[#006A4E] dark:text-emerald-400">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">AI പഠന സഹായി (AI Study Assistant)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          പഠന സഹായി സജീവമാക്കുന്നതിനും നിങ്ങളുടെ സ്റ്റഡി ഡാഷ്‌ബോർഡ് കണക്ട് ചെയ്യുന്നതിനും ദയവായി നിങ്ങളുടെ പേര് നൽകുക.
        </p>

        <form onSubmit={handleNameSubmit} className="space-y-3">
          <div className="relative">
            <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Enter Your Name | പേര് നൽകുക"
              value={userNameInput}
              onChange={e => setUserNameInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-emerald-400 dark:text-white text-center font-semibold"
              required
            />
          </div>
          <button
            type="submit"
            id="btn-submit-assistant-name"
            className="w-full bg-[#006A4E] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
          >
            Start Learning with AI
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col h-[550px]">
      
      {/* Header */}
      <div className="bg-emerald-700 dark:bg-emerald-900 px-5 py-3.5 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <span className="w-2.5 h-2.5 bg-green-400 border border-white absolute right-0 bottom-0 rounded-full animate-ping"></span>
            <span className="w-2.5 h-2.5 bg-green-400 border border-white absolute right-0 bottom-0 rounded-full"></span>
            <div className="bg-emerald-800 p-1.5 rounded-full">
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-sm">AI പേഴ്സണൽ പി.എസ്.സി സഹായി</h3>
            <span className="text-[10px] text-emerald-200">Active Coach • Student: {currentStudent.name}</span>
          </div>
        </div>
        
        {/* Reset button to clear messages */}
        <button
          onClick={() => setMessages([
            {
              id: "clear-and-welcome",
              role: "model",
              text: `ഹലോ ${currentStudent.name}, നവീകരിച്ച കണക്ഷൻ ലഭ്യമാണ്. എന്താണ് പഠിക്കേണ്ടത്?`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ])}
          id="btn-reset-chat"
          className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-600 text-white hover:text-yellow-300 transition"
          title="Reset Chat Conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat scroll workspace area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/60 font-sans leading-relaxed">
        {messages.map((msg) => (
          <div
            key={msg.id}
            id={`chat-bubble-${msg.id}`}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-3.5 relative shadow-sm ${
              msg.role === 'user'
                ? 'bg-[#006A4E] text-white rounded-tr-none'
                : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-705 text-slate-800 dark:text-slate-100 rounded-tl-none'
            }`}>
              
              {/* Optional Speech-synthesis trigger on model responses */}
              {msg.role === 'model' && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-emerald-600 transition"
                  title="Speak this answer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Text content / parses simple list format */}
              <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed pr-5">
                {msg.text}
              </div>

              {/* Message timestamp metadata */}
              <span className={`block text-[9px] mt-2.5 text-right font-mono ${
                msg.role === 'user' ? 'text-emerald-200' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Dynamic Generating/Typing Dots Indicator fallback */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>AI ചിന്തിക്കുന്നു... (AI is typing)</span>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Template helper pill recommendation tools */}
      <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-800 flex gap-2 overflow-x-auto shrink-0 select-none">
        {TEMPLATE_PROMPTS.map((pill, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(pill.text)}
            className="px-3 py-1 bg-emerald-55 border border-emerald-100 dark:border-slate-700 text-emerald-800 dark:text-emerald-300 rounded-full text-[11px] font-medium hover:bg-[#006A4E] hover:text-white transition shrink-0"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Bottom control entry bar */}
      <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 flex gap-2 items-center shrink-0">
        <input
          type="text"
          placeholder="ഇവിടെ ചോദ്യങ്ങൾ ടൈപ്പ് ചെയ്യുക (Ask in Malayalam or English)..."
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSendMessage(inputText)}
          className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-905 border border-slate-300 dark:border-slate-600 text-xs md:text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <button
          onClick={() => handleSendMessage(inputText)}
          id="btn-chat-send"
          className="p-2.2 rounded-xl bg-[#006A4E] hover:bg-emerald-700 text-white font-bold transition-all"
          title="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}
