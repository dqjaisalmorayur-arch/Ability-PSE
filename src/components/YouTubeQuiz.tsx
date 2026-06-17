import React, { useState, useRef, useEffect } from 'react';
import { 
  Youtube, 
  Sparkles, 
  Loader2, 
  Trophy, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  ChevronRight, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  Lightbulb, 
  Send
} from 'lucide-react';
import { Quiz, Question, Student } from '../types';

interface YouTubeQuizProps {
  currentStudent: Student | null;
  onStudentUpdate: (updatedStudent: Student) => void;
  userRole?: 'student' | 'admin';
}

interface NotesData {
  title: string;
  summary: string;
  detailedNotes: string;
  keyFacts: string[];
  oneLiners: string[];
  memoryTechniques: string[];
  revisionNotes: string;
  expectedQuestions: Array<{
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  suggestedDoubts: string[];
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const SAMPLE_VIDEOS = [
  { url: "https://www.youtube.com/watch?v=0hW64O7Z2E8", label: "കേരള നവോത്ഥാനം (Renaissance Study Part 1)" },
  { url: "https://www.youtube.com/watch?v=yYf02u_K3C4", label: "ഇന്ത്യൻ ഭരണഘടന - ഷെഡ്യൂളുകൾ (Constitution Schedules)" },
  { url: "https://www.youtube.com/watch?v=Xb1KjQ2Lz_U", label: "കേരള ഭൂമിശാസ്ത്രം (Physical Geography of Kerala)" }
];

export default function YouTubeQuiz({ currentStudent, onStudentUpdate }: YouTubeQuizProps) {
  // Input fields
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [activeTab, setActiveTab] = useState<'quiz' | 'notes'>('notes'); // Default to notes so the user sees doubts & note facilities instantly
  
  // Quiz parameters
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [language, setLanguage] = useState<'ml' | 'en' | 'both'>('ml');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Play Quiz states
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [historyAnswers, setHistoryAnswers] = useState<{ qIdx: number, selected: number, isCorrect: boolean }[]>([]);

  // Notes & Doubts states
  const [notesData, setNotesData] = useState<NotesData | null>(null);
  const [generatingNotes, setGeneratingNotes] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [userQuery, setUserQuery] = useState('');
  const [sendingQuery, setSendingQuery] = useState(false);
  const [notesFetchedUrl, setNotesFetchedUrl] = useState('');

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Generate Interactive Practice Test (Mock Test)
  const handleGenerateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) return;

    setGeneratingQuiz(true);
    setActiveQuiz(null);
    setShowResults(false);
    setScore(0);
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setHistoryAnswers([]);

    try {
      const res = await fetch('/api/youtube-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl,
          count: questionCount,
          difficulty,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setActiveQuiz(data);
      }
    } catch (err) {
      console.error("Failed to generate quiz:", err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  // Generate Notes & Study Insights
  const handleGenerateNotes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!youtubeUrl) return;

    setGeneratingNotes(true);
    setNotesData(null);
    setChatHistory([]);
    setNotesFetchedUrl(youtubeUrl);

    try {
      const res = await fetch('/api/youtube-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: youtubeUrl })
      });

      if (res.ok) {
        const data = await res.json();
        setNotesData(data);
        
        // Add welcome message from AI tutor
        setChatHistory([
          {
            id: 'welcome',
            role: 'model',
            text: `പ്രിയ ഉദ്യോഗാർത്ഥി സുഹൃത്തേ, ഈ പി.എസ്.സി സിലബസ് ക്ലാസ് വിശകലനം ചെയ്ത് ഞാൻ തയ്യാറാക്കിയ വിശദമായ പഠനക്കുറിപ്പുകൾ ഇടതുവശത്ത് ലഭ്യമാക്കിയിട്ടുണ്ട്. \n\nഈ വിഷയത്തിൽ നിങ്ങൾക്ക് എന്തെങ്കിലും സംശയങ്ങൾ ഉണ്ടെങ്കിൽ അതിവിടെ ചോദിക്കാവുന്നതാണ്. താഴെ കാണുന്ന ചോദ്യങ്ങളിൽ സ്പർശിച്ചും നിങ്ങൾക്ക് സംശയങ്ങൾ ദൂരീകരിക്കാം!`
          }
        ]);
      }
    } catch (err) {
      console.error("Failed to generate notes:", err);
    } finally {
      setGeneratingNotes(false);
    }
  };

  // Ask Doubt to YouTube AI Coach
  const handleSendDoubt = async (customText?: string) => {
    const questionText = customText?.trim() || userQuery.trim();
    if (!questionText || !notesFetchedUrl) return;

    if (!customText) setUserQuery('');

    // Append user query to chat list
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: questionText
    };
    setChatHistory(prev => [...prev, userMsg]);
    setSendingQuery(true);

    try {
      const historyPayload = chatHistory.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/youtube-ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: notesFetchedUrl,
          question: questionText,
          history: historyPayload
        })
      });

      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, {
          id: `model-${Date.now()}`,
          role: 'model',
          text: data.text
        }]);
      }
    } catch (err) {
      console.error("Doubt solver error:", err);
    } finally {
      setSendingQuery(false);
    }
  };

  // Select Quiz Answers
  const currentQuestion: Question | undefined = activeQuiz?.questions[currentQuestionIdx];

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);

    setHistoryAnswers(prev => [...prev, {
      qIdx: currentQuestionIdx,
      selected: selectedOption,
      isCorrect
    }]);

    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIdx < activeQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleCompleteQuiz();
    }
  };

  // Complete Quiz & report score card
  const handleCompleteQuiz = async () => {
    setShowResults(true);
    if (!activeQuiz || !currentStudent) return;

    const pointsEarned = score * 10;

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentStudent.id,
          action: 'submit_quiz',
          payload: {
            quizId: activeQuiz.id,
            quizTitle: activeQuiz.title,
            score: score,
            totalQuestions: activeQuiz.questions.length,
            pointsEarned
          }
        })
      });

      if (res.ok) {
        const updatedStudent = await res.json();
        onStudentUpdate(updatedStudent);
      }
    } catch (err) {
      console.error("Failed logs submission:", err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6">
      
      {/* Title & Core Meta info always clearly visible */}
      <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#006A4E] dark:text-emerald-400">
              <Youtube className="w-6 h-6 text-red-600 fill-red-600 animate-pulse shrink-0" />
              <h2 className="text-xl font-black font-sans tracking-tight">യൂട്യൂബ് സ്മാർട്ട് ക്ലാസ് സഹായി (YouTube Class AI Assistant)</h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium leading-relaxed">
              യൂട്യൂബിലെ ക്ലാസുകൾ കണ്ട് വിശകലനം ചെയ്യാനും, അതിൽ നിന്നും പഠനക്കുറിപ്പുകൾ (Class Notes) ഉണ്ടാക്കാനും, ലൈവായി സംശയങ്ങൾ ചോദിക്കാനും (Ask doubts), സ്വയം പരീക്ഷകൾ നിർമ്മിച്ച് പരിശീലിക്കാനും (PSC Mock Test) ഈ സംവിധാനം സഹായിക്കുന്നു!
            </p>
          </div>
          {activeQuiz && (
            <button
              onClick={() => setActiveQuiz(null)}
              className="text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 px-3.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-200 flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>മറ്റൊരു ക്ലാസ് നൽകാൻ</span>
            </button>
          )}
        </div>
      </div>

      {/* YOUTUBE LINK WORKSPACE PREPARATOR */}
      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 p-4 rounded-2xl mb-6">
        <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Youtube className="w-4 h-4 text-red-500" />
          <span>യൂട്യൂബ് വീഡിയോ ലിങ്ക് ചേർക്കുക (Paste YouTube Link here)</span>
        </h3>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            required
            placeholder="E.g., https://www.youtube.com/watch?v=0hW64O7Z2E8"
            value={youtubeUrl}
            onChange={e => setYoutubeUrl(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-650 text-xs md:text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={handleGenerateNotes}
              disabled={generatingNotes || generatingQuiz || !youtubeUrl}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition whitespace-nowrap disabled:opacity-50"
            >
              {generatingNotes ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>റിപ്പോർട്ട് തയ്യാറാക്കുന്നു...</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-4 h-4" />
                  <span>നോട്സ് നിർമ്മിക്കുക & സംശയം ചോദിക്കുക</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setActiveTab('quiz');
                setNotesData(null);
              }}
              className="px-4 py-2.5 bg-[#006A4E] hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>പരീക്ഷ തയ്യാറാക്കുക</span>
            </button>
          </div>
        </div>

        {/* SAMPLE VIDEOS ACCORDION SHORTCUTS */}
        <div className="flex flex-wrap gap-2 mt-3 select-none">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold self-center">ദ്രുത ലിങ്കുകൾ:</span>
          {SAMPLE_VIDEOS.map((vid, idx) => (
            <button
              type="button"
              key={idx}
              onClick={() => {
                setYoutubeUrl(vid.url);
                setActiveQuiz(null);
                setNotesData(null);
              }}
              className="px-2.5 py-1 rounded bg-white hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-500 dark:text-slate-300 transition"
            >
              🔗 {vid.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORE FUNCTIONAL INTERACTIVE PANELS CONTAINER */}
      {!notesData && !activeQuiz && !generatingNotes && !generatingQuiz ? (
        <div className="text-center py-12 px-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-900/10">
          <Youtube className="w-12 h-12 text-red-100 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">ക്ലാസ് ലിങ്ക് ചേർത്ത് പഠനം തുടങ്ങാം</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            മുകളിൽ ഒരു പി.എസ്.സി ക്ലാസ് വീഡിയോ ലിങ്ക് കൊടുത്ത് ആവശ്യമായ ഓപ്ഷൻ തെരഞ്ഞെടുക്കുക. ലിങ്കിലുള്ള ക്ലാസിനെ ആസ്പദമാക്കി ബാക്കി വിവരങ്ങൾ റിയൽ ടൈം ആയി ഞങ്ങൾ ക്രിയേറ്റ് ചെയ്തു നൽകുന്നതാണ്.
          </p>
        </div>
      ) : generatingNotes || generatingQuiz ? (
        <div className="text-center py-16 px-6 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/20">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-4" />
          <h3 className="text-sm font-black text-slate-800 dark:text-white mb-1.5 animate-pulse">
            യൂട്യൂബ് ക്ലാസ് റക്കോർഡുകൾ വിശകലനം ചെയ്യുന്നു
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Gemini AI ഈ പഠന വീഡിയോയിലെ ഉള്ളടക്കം പരിശോധിക്കുകയാണ്. ദയവായി അല്പം കാത്തിരിക്കൂ...
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Workspace TABS Selector */}
          <div className="flex border-b border-emerald-100 dark:border-slate-700 mb-4 font-sans font-bold text-xs select-none">
            <button
              onClick={() => setActiveTab('notes')}
              className={`pb-3 px-5 border-b-2 font-black transition ${
                activeTab === 'notes'
                  ? 'border-emerald-600 text-[#006A4E] dark:text-emerald-400'
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              📚 പഠനക്കുറിപ്പുകളും സംശയങ്ങളും (Class Notes & Doubts)
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`pb-3 px-5 border-b-2 font-black transition ${
                activeTab === 'quiz'
                  ? 'border-emerald-600 text-[#006A4E] dark:text-emerald-400'
                  : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600'
              }`}
            >
              📝 പരീക്ഷ എഴുതുക (PSC Mock Exams)
            </button>
          </div>

          {/* TAB 1: NOTES & STUDY DOUBT DISSOLVER CHATBOARD */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* LEFT HALF: GENERATED CLASS SUMMARY / ONE-LINERS / MNEMONICS */}
              <div className="lg:col-span-7 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-750 p-5 rounded-2xl space-y-5 h-[550px] overflow-y-auto">
                {!notesData ? (
                  <div className="text-center py-16">
                    <BookOpen className="w-10 h-10 text-emerald-100 mx-auto mb-3" />
                    <p className="text-xs text-slate-500">ഈ വീഡിയോയുടെ ഓട്ടോമാറ്റിക് നോട്സ് ഇതുവരെ ക്രിയേറ്റ് ചെയ്തിട്ടില്ല.</p>
                    <button
                      onClick={handleGenerateNotes}
                      className="mt-3 text-xs bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl"
                    >
                      നോട്സ് നിർമ്മിക്കാം
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="border-b pb-3 border-slate-200/50 dark:border-slate-800">
                      <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-[#006A4E] dark:text-emerald-400 font-extrabold font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                        Class Topic Study Notes
                      </span>
                      <h3 className="text-base font-black text-slate-800 dark:text-white mt-1.5 font-sans leading-snug">
                        {notesData.title}
                      </h3>
                    </div>

                    {/* Rich Summary */}
                    <div>
                      <h4 className="text-xs font-black text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5 mb-2 uppercase">
                        <Lightbulb className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span>ആമുഖ സംഗ്രഹം (Introductory Summary)</span>
                      </h4>
                      <p className="text-xs md:text-sm text-slate-705 dark:text-slate-300 leading-relaxed font-serif bg-white dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-100 dark:border-slate-700">
                        {notesData.summary}
                      </p>
                    </div>

                    {/* Detailed Syllabus Notes */}
                    <div>
                      <h4 className="text-xs font-black text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5 mb-2 uppercase">
                        <BookOpen className="w-4 h-4" />
                        <span>വിശദമായ ക്ലാസ്സ് കുറിപ്പുകൾ (Detailed Notes)</span>
                      </h4>
                      <div className="text-xs md:text-sm text-slate-705 dark:text-slate-300 leading-relaxed font-serif whitespace-pre-line bg-white dark:bg-slate-800/80 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                        {notesData.detailedNotes}
                      </div>
                    </div>

                    {/* Smart PSC Memory Techniques Mnemonics */}
                    {notesData.memoryTechniques && (
                      <div>
                        <h4 className="text-xs font-black text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5 mb-2 uppercase">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>പഠന കുറുക്കുവഴികൾ (PSC Memory Tricks)</span>
                        </h4>
                        <div className="bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 p-4 rounded-xl space-y-1.5">
                          {notesData.memoryTechniques.map((tech, i) => (
                            <p key={i} className="text-xs text-amber-900 dark:text-amber-200 font-bold leading-normal">
                              💡 {tech}
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Key Facts checklist */}
                    {notesData.keyFacts && (
                      <div>
                        <h4 className="text-xs font-black text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5 mb-2 uppercase">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>പ്രധാന പഠന വസ്തുതകൾ (Key Facts)</span>
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {notesData.keyFacts.map((fact, idx) => (
                            <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 flex items-start gap-1.5 bg-white dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-700">
                              <span className="text-emerald-600 mt-0.5 font-bold">✔</span>
                              <span>{fact}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Speed One Liners */}
                    {notesData.oneLiners && (
                      <div>
                        <h4 className="text-xs font-black text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5 mb-2 uppercase">
                          <ChevronRight className="w-4 h-4" />
                          <span>വൺ-ലൈൻ വിവരങ്ങൾ (PSC One-Liners)</span>
                        </h4>
                        <div className="bg-emerald-50/30 dark:bg-slate-800 p-3 rounded-xl border border-emerald-100/40 dark:border-slate-700 space-y-2">
                          {notesData.oneLiners.map((ol, i) => (
                            <p key={i} className="text-xs text-slate-705 dark:text-slate-300 font-mono flex gap-1.5">
                              <span className="text-red-500 font-black">»</span>
                              <span>{ol}</span>
                            </p>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Revision Notes */}
                    {notesData.revisionNotes && (
                      <div className="bg-slate-100 dark:bg-slate-800 border p-3.5 rounded-xl">
                        <h4 className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
                          പെട്ടെന്നുള്ള റിവിഷൻ വിവരങ്ങൾ (Fast Cheatsheet)
                        </h4>
                        <p className="text-xs text-slate-600 dark:text-slate-350 italic">
                          {notesData.revisionNotes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* RIGHT HALF: LIVE DOUBT CHAT ASSISTANT PANEL */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-750 rounded-2xl flex flex-col h-[550px] relative overflow-hidden shadow-sm">
                
                {/* Chat header */}
                <div className="bg-[#006A4E] text-white p-3.5 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-300" />
                  <div>
                    <h4 className="text-xs font-bold font-sans">പഠന സംശയ സഹായി (Doubt Solver Chat)</h4>
                    <p className="text-[10px] text-emerald-150 font-medium">സംശയങ്ങൾ ചോദിക്കൂ, അസിസ്റ്റന്റ് വിശദീകരിച്ചു തരാം</p>
                  </div>
                </div>

                {/* Chat window body */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin">
                  {chatHistory.length === 0 && (
                    <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                      <HelpCircle className="w-12 h-12 stroke-1 mx-auto mb-3" />
                      <p className="text-xs">വീഡിയോ ലിങ്ക് വിശകലനം ചെയ്തതിനു ശേഷം സംശയങ്ങൾ താഴെ ചോദിക്കാവുന്നതാണ്.</p>
                    </div>
                  )}

                  {chatHistory.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3 text-xs md:text-sm leading-relaxed font-sans ${
                          msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200/50 dark:border-slate-700/50'
                        }`}
                        style={{ whiteSpace: 'pre-line' }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {sendingQuery && (
                    <div className="flex justify-start">
                      <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-2xl rounded-tl-none p-3 text-xs flex items-center gap-1.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                        <span>ചിന്തിക്കുന്നു...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Suggested prompt chips underneath the scroll list */}
                {notesData?.suggestedDoubts && chatHistory.length > 0 && (
                  <div className="p-2 border-t bg-slate-50/50 dark:bg-slate-905 flex flex-wrap gap-1.5 select-none shrink-0">
                    {notesData.suggestedDoubts.slice(0, 2).map((doubt, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleSendDoubt(doubt)}
                        disabled={sendingQuery}
                        className="text-[10px] bg-white hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-650 dark:text-slate-350 font-bold transition text-left"
                      >
                        ❓ {doubt}
                      </button>
                    ))}
                  </div>
                )}

                {/* Form input sender */}
                <div className="p-3 border-t bg-white dark:bg-slate-900 flex gap-2 shrink-0">
                  <input
                    type="text"
                    placeholder={notesFetchedUrl ? "നിങ്ങളുടെ പഠന സംശയം ഇവിടെ ചോദിക്കുക..." : "സംശയം ചോദിക്കാൻ നോട്സ് ആദ്യം തയ്യാറാക്കുക"}
                    disabled={!notesFetchedUrl || sendingQuery}
                    value={userQuery}
                    onChange={e => setUserQuery(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleSendDoubt();
                      }
                    }}
                    className="flex-1 text-xs md:text-sm px-3.5 py-2.5 rounded-xl border border-slate-250 dark:border-slate-650 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 dark:text-white disabled:opacity-50"
                  />
                  <button
                    onClick={() => handleSendDoubt()}
                    disabled={!notesFetchedUrl || sendingQuery || !userQuery.trim()}
                    className="p-2.5 bg-emerald-600 dark:bg-emerald-500 text-white hover:bg-emerald-700 font-bold rounded-xl transition flex items-center justify-center shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE PRACTICE MOCK EXAMS (QUIZ) */}
          {activeTab === 'quiz' && (
            <div className="space-y-4">
              
              {/* QUIZ SETUP PANEL */}
              {!activeQuiz && (
                <form onSubmit={handleGenerateQuiz} className="space-y-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-750 p-5 rounded-2xl max-w-2xl mx-auto">
                  <div className="border-b pb-2 mb-4">
                    <span className="text-xs font-black text-[#006A4E] dark:text-emerald-400 uppercase tracking-widest">
                      PSC Test Settings (ക്വിസ് ഓപ്ഷനുകൾ)
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">സിലബസിന് അനുസൃതമായി ചോദ്യങ്ങളുടെ എണ്ണം, കാഠിന്യം എന്നിവ ക്രമീകരിക്കാം</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Question count */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1.5">ചോദ്യങ്ങളുടെ എണ്ണം (Count)</label>
                      <select
                        value={questionCount}
                        onChange={e => setQuestionCount(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="5">5 Questions</option>
                        <option value="10">10 Questions</option>
                        <option value="20">20 Questions</option>
                        <option value="30">30 Questions</option>
                        <option value="100">100 Questions</option>
                      </select>
                    </div>

                    {/* Difficulty */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1.5">കാഠിന്യം (Difficulty)</label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="easy">Easy (ലളിതം)</option>
                        <option value="medium">Medium (സാധാരണ)</option>
                        <option value="hard">Hard (കഠിനം)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-1.5">ഭാഷ (Language)</label>
                      <select
                        value={language}
                        onChange={e => setLanguage(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
                      >
                        <option value="ml">Malayalam (മലയാളം)</option>
                        <option value="en">English</option>
                        <option value="both">Malayalam & English Combined</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={generatingQuiz || !youtubeUrl}
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 font-bold rounded-xl text-xs uppercase tracking-wider disabled:opacity-50 flex items-center justify-center gap-1.5 shadow-md transition"
                  >
                    {generatingQuiz ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-yellow-300" />
                        <span>ക്വിസ് നിർമ്മിക്കുന്നു...</span>
                      </>
                    ) : (
                      <>
                        <Youtube className="w-4 h-4 text-white" />
                        <span>മോക്ക് ടെസ്റ്റ് പരിശീലിക്കാം</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* ACTIVE MOCK EXAM INTERRUPTER */}
              {activeQuiz && !showResults && currentQuestion && (
                <div className="bg-slate-50 dark:bg-slate-900/40 p-5 md:p-6 rounded-2xl border border-emerald-100/50 dark:border-slate-700 max-w-2xl mx-auto flex flex-col relative">
                  
                  {/* Test progress indicator */}
                  <div className="flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-[#006A4E] dark:text-emerald-400 mb-4 pb-2 border-b border-slate-200/50 dark:border-slate-800">
                    <span>ചോദ്യം {currentQuestionIdx + 1} of {activeQuiz.questions.length}</span>
                    <span>സ്കോർ: {score} pts</span>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-snug">
                      Q: {currentQuestion.text}
                    </h3>

                    {/* Options list A, B, C, D */}
                    <div className="grid grid-cols-1 gap-2 md:gap-3 font-sans">
                      {currentQuestion.options.map((opt, i) => (
                        <button
                          key={i}
                          onClick={() => handleOptionSelect(i)}
                          className={`w-full p-4 rounded-xl text-left text-xs md:text-sm font-semibold border transition-all ${
                            isAnswered
                              ? i === currentQuestion.correctAnswer
                                ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm'
                                : selectedOption === i
                                ? 'bg-red-100 dark:bg-red-950 border-red-500 text-red-800 dark:text-red-300'
                                : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'
                              : selectedOption === i
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-305'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750'
                          }`}
                          disabled={isAnswered}
                        >
                          <span className="inline-block w-6 text-center font-bold mr-2 text-[#006A4E] dark:text-emerald-400">
                            {['A', 'B', 'C', 'D'][i]}.
                          </span> 
                          {opt}
                        </button>
                      ))}
                    </div>

                    {/* CORRECTIVE EXPLANATORY NOTES */}
                    {isAnswered && (
                      <div className={`mt-4 p-4 rounded-xl text-xs md:text-sm leading-relaxed border ${
                        selectedOption === currentQuestion.correctAnswer
                          ? 'bg-emerald-50 border-emerald-250 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                          : 'bg-red-50 border-red-250 text-slate-700 dark:bg-slate-900/60 dark:text-slate-300'
                      }`}>
                        <p className="font-extrabold text-[#006A4E] dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                          {selectedOption === currentQuestion.correctAnswer ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-emerald-600" />
                              <span>ശരിയുത്തരം! (Correct Answer)</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-500" />
                              <span>തെറ്റായ ഉത്തരം! (Correct Answer is Option {['A','B','C','D'][currentQuestion.correctAnswer]})</span>
                            </>
                          )}
                        </p>
                        <div className="font-serif leading-relaxed bg-white/50 dark:bg-slate-800 p-3 rounded-lg border text-xs md:text-sm italic">
                          <b>വിശദീകരണം:</b> {currentQuestion.explanation}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submission and Progression controls */}
                  <div className="mt-6 flex justify-end gap-2 text-xs">
                    {!isAnswered ? (
                      <button
                        onClick={handleSubmitAnswer}
                        disabled={selectedOption === null}
                        className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase disabled:opacity-50 tracking-wider shadow"
                      >
                        ശരിയാണോ എന്ന് പരിശോധിക്കാം (Submit Answer)
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="px-5 py-2.5 rounded-lg bg-[#006A4E] hover:bg-emerald-800 text-white font-bold flex items-center gap-1 uppercase tracking-wider shadow"
                      >
                        <span>
                          {currentQuestionIdx < activeQuiz.questions.length - 1 ? 'അടുത്ത ചോദ്യം (Next Questions)' : 'പരീക്ഷ പൂർത്തിയാക്കാം'}
                        </span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                </div>
              )}

              {/* REPORT CARD DISPLAY PANEL */}
              {showResults && activeQuiz && (
                <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-2xl border border-slate-205 dark:border-slate-700 text-center max-w-lg mx-auto">
                  <div className="bg-yellow-105 dark:bg-yellow-950/60 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-4 text-yellow-600 dark:text-yellow-400">
                    <Trophy className="w-8 h-8 animate-bounce" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-white mb-1 font-sans">പരീക്ഷ പൂർത്തിയായി! (Quiz Completed)</h3>
                  <p className="text-[11px] text-slate-500 mb-6 font-semibold max-w-md mx-auto">
                    {activeQuiz.title}
                  </p>

                  <div className="grid grid-cols-2 gap-4 bg-white dark:bg-slate-800 border p-4 rounded-xl border-slate-200/50 mb-6 font-mono text-center">
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold tracking-widest mb-0.5">Your Score</span>
                      <span className="text-2xl font-black text-[#006A4E] dark:text-emerald-400">{score} / {activeQuiz.questions.length}</span>
                    </div>
                    <div>
                      <span className="block text-slate-400 uppercase text-[9px] font-bold tracking-widest mb-0.5">Points Reward</span>
                      <span className="text-2xl font-black text-emerald-600 font-sans">+{score * 10} XP</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 mb-5 text-left border-l-4 border-emerald-500 pl-3 leading-relaxed mb-6 bg-white dark:bg-slate-800 p-3 rounded-r-lg">
                    <b>റാങ്ക് വിവരങ്ങൾ:</b> ഈ പരിശീലന പരീക്ഷയുടെ മാർക്കുകൾ നിങ്ങളുടെ പ്രൊഫൈൽ പ്രോഗ്രസ്സിൽ വിജയകരമായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്. ഡെയിലി സ്ട്രീക്ക് നിലനിർത്താൻ കൂടുതൽ മൊഡ്യൂളുകൾ ആവർത്തിച്ചു പരിശീലിക്കുക!
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setActiveQuiz(null);
                        setYoutubeUrl('');
                      }}
                      className="flex-1 bg-[#006A4E] hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs uppercase"
                    >
                      മറ്റൊരു ചോദ്യപേപ്പർ നിർമ്മിക്കാം
                    </button>
                    <button
                      onClick={() => {
                        setShowResults(false);
                        setCurrentQuestionIdx(0);
                        setSelectedOption(null);
                        setScore(0);
                        setIsAnswered(false);
                        setHistoryAnswers([]);
                      }}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs uppercase"
                    >
                      വീണ്ടും എഴുതി നോക്കുക (Retry)
                    </button>
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      )}

    </div>
  );
}
