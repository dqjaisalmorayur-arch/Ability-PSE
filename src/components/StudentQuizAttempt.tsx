import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Clock, 
  HelpCircle, 
  Loader2, 
  ChevronRight,
  Phone,
  MapPin,
  Trophy,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { db, doc, getDoc, collection, addDoc, updateDoc, increment } from '../lib/firebase';
import { CreatorQuiz } from '../types';

interface StudentQuizAttemptProps {
  quizId: string;
  onExit?: () => void;
}

export default function StudentQuizAttempt({ quizId, onExit }: StudentQuizAttemptProps) {
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<CreatorQuiz | null>(null);

  // Steps: 'intro' | 'playing' | 'results'
  const [step, setStep] = useState<'intro' | 'playing' | 'results'>('intro');
  const [studentName, setStudentName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentDistrict, setStudentDistrict] = useState('');

  // Playing states
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  // Timer states
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [savingResult, setSavingResult] = useState(false);

  // Fetch quiz detail on load
  useEffect(() => {
    const loadQuiz = async () => {
      setLoading(true);
      try {
        const docRef = doc(db, 'quizzes', quizId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setQuiz({ id: docSnap.id, ...docSnap.data() } as CreatorQuiz);
        } else {
          console.error("Quiz not found in DB");
        }
      } catch (err) {
        console.error("Error loading shared quiz:", err);
      } finally {
        setLoading(false);
      }
    };
    loadQuiz();
  }, [quizId]);

  // Handle start timer
  const startTimer = () => {
    setTimeSpentSeconds(0);
    timerRef.current = setInterval(() => {
      setTimeSpentSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) return;
    setStep('playing');
    startTimer();
  };

  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
  };

  const handleNextQuestion = () => {
    if (!quiz || selectedOption === null) return;

    const currentQuestion = quiz.questions[currentQIndex];
    const isRight = selectedOption === currentQuestion.correctAnswer;

    let nextScore = score;
    if (isRight) {
      nextScore = score + 1;
      setScore(nextScore);
    }

    if (currentQIndex < quiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      handleCompleteQuiz(nextScore);
    }
  };

  const handleCompleteQuiz = async (finalScore: number) => {
    stopTimer();
    setStep('results');
    if (!quiz) return;

    setSavingResult(true);
    try {
      const percentage = Math.round((finalScore / quiz.questions.length) * 100);

      // Save submission details in Firestore under quiz_attempts
      const payload = {
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentName: studentName.trim(),
        studentPhone: studentPhone.trim() || null,
        studentDistrict: studentDistrict.trim() || null,
        score: finalScore,
        totalQuestions: quiz.questions.length,
        percentage,
        completedAt: new Date().toISOString(),
        timeSpentSeconds
      };

      await addDoc(collection(db, 'quiz_attempts'), payload);

      // Increment quiz participantCount in Firestore
      const quizRef = doc(db, 'quizzes', quiz.id);
      await updateDoc(quizRef, {
        participantCount: increment(1)
      });
    } catch (err) {
      console.error("Error saving participant attempt data:", err);
    } finally {
      setSavingResult(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 px-8 py-16 text-center border dark:border-slate-800 rounded-3xl max-w-xl mx-auto flex flex-col items-center shadow-lg">
        <Loader2 className="w-10 h-10 text-emerald-600 dark:text-emerald-500 animate-spin mb-4" />
        <p className="text-xs text-slate-500 dark:text-slate-400 font-extrabold font-sans">പൊതുപരീക്ഷാ ലിങ്ക് വിശകലനം ചെയ്യുന്നു, കാത്തിരിക്കുക...</p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="bg-white dark:bg-slate-900 p-12 text-center border dark:border-slate-800 rounded-3xl max-w-xl mx-auto space-y-4 shadow-lg font-sans">
        <div className="text-4xl">⚠️</div>
        <h3 className="text-sm font-black text-slate-850 dark:text-white">പരീക്ഷ ലിങ്ക് ലഭ്യമല്ല (Quiz Not Found)</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">ഈ ക്വിസ് നിലവിലില്ല അല്ലെങ്കിൽ അഡ്മിൻ നീക്കം ചെയ്തിട്ടുണ്ടാകാം.</p>
        {onExit && (
          <button onClick={onExit} className="bg-[#006A4E] hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-xs font-black">
            Go Home (ഹോം പേജ്)
          </button>
        )}
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQIndex];
  const progressPercent = quiz.questions.length > 1 
    ? Math.round(((currentQIndex) / (quiz.questions.length)) * 100)
    : 100;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* STEP 1: INTRO FORM SCREEN - Sleek Google Forms Card Theme */}
      {step === 'intro' && (
        <div className="bg-white dark:bg-slate-905 rounded-2xl border-t-[10px] border-t-emerald-700 border-x border-b border-slate-200 dark:border-slate-850 shadow-xl overflow-hidden font-sans">
          
          {/* Header section with distinct presentation */}
          <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80">
            <span className="text-[9px] bg-emerald-100 dark:bg-[#006a4e]/30 text-[#006A4E] dark:text-emerald-300 font-extrabold px-2 py-1 rounded tracking-widest uppercase font-mono">
              Exam mode (ലോഗിൻ ആവശ്യമില്ല)
            </span>
            <h2 id="student-quiz-title" className="text-lg md:text-xl font-black mt-2 text-slate-850 dark:text-white leading-tight">
              {quiz.title}
            </h2>
            {quiz.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                {quiz.description}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 mt-4 text-[10px] text-slate-500 dark:text-slate-400 font-bold">
              <span>📋 {quiz.questionCount} ചോദ്യങ്ങൾ (Questions)</span>
              <span>⭐ {quiz.difficulty} ലെവൽ </span>
              <span>🌐 {quiz.language === 'ml' ? 'മലയാളം' : 'English'}</span>
            </div>
          </div>

          <form onSubmit={handleStartQuiz} className="p-6 md:p-8 space-y-6 text-xs select-none">
            <div className="space-y-4">
              
              {/* Name Field (Required) */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  നിങ്ങളുടെ പേര് ടൈപ്പ് ചെയ്യുക (Student Name) *
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    placeholder="പേര് ഇവിടെ നൽകുക..."
                    value={studentName}
                    onChange={e => setStudentName(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-11 shadow-inner focus:bg-white transition"
                  />
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* Phone (Optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide flex justify-between">
                  <span>മൊബൈൽ നമ്പർ / വാട്സാപ്പ് (Phone)</span>
                  <span className="text-[10px] text-slate-400 font-normal normal-case font-sans">Optional</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    placeholder="ഫോൺ നമ്പർ നൽകാം..."
                    value={studentPhone}
                    onChange={e => setStudentPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-11 shadow-inner focus:bg-white transition"
                  />
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                </div>
              </div>

              {/* District Select (Optional) */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wide flex justify-between">
                  <span>ജില്ല (District)</span>
                  <span className="text-[10px] text-slate-400 font-normal normal-case font-sans">Optional</span>
                </label>
                <div className="relative">
                  <select
                    value={studentDistrict}
                    onChange={e => setStudentDistrict(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-xl dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 pl-11 appearance-none transition focus:bg-white"
                  >
                    <option value="">തിരഞ്ഞെടുക്കുക (Select)...</option>
                    <option value="Thiruvananthapuram">Thiruvananthapuram (തിരുവനന്തപുരം)</option>
                    <option value="Kollam">Kollam (കൊല്ലം)</option>
                    <option value="Pathanamthitta">Pathanamthitta (പത്തനംതിട്ട)</option>
                    <option value="Alappuzha">Alappuzha (ആലപ്പുഴ)</option>
                    <option value="Kottayam">Kottayam (കോട്ടയം)</option>
                    <option value="Idukki">Idukki (ഇടുക്കി)</option>
                    <option value="Ernakulam">Ernakulam (എറണാകുളം)</option>
                    <option value="Thrissur">Thrissur (തൃശ്ശൂർ)</option>
                    <option value="Palakkad">Palakkad (പാലക്കാട്)</option>
                    <option value="Malappuram">Malappuram (മലപ്പുറം)</option>
                    <option value="Kozhikode">Kozhikode (കോഴിക്കോട്)</option>
                    <option value="Wayanad">Wayanad (വയനാട്)</option>
                    <option value="Kannur">Kannur (കണ്ണൂർ)</option>
                    <option value="Kasaragod">Kasaragod (കാസർകോഡ്)</option>
                  </select>
                  <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <div className="absolute right-3.5 top-4 pointer-events-none text-slate-400">▼</div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-450 leading-relaxed">
                🛡️ ഈ പരീക്ഷയിൽ പങ്കെടുക്കുന്നതിനായി പ്രത്യേക ലോഗിൻ ആവശ്യമില്ല. നിങ്ങളുടെ പേര് നൽകി പരീക്ഷ എഴുതി തുടങ്ങാം. ശരിയുത്തരങ്ങളും വിശദീകരണങ്ങളും അഡ്മിൻ നിർദ്ദേശപ്രകാരം ഈ സ്ക്രീനിൽ നിന്നും മറച്ചിരിക്കുന്നു.
              </div>
            </div>

            <button
              type="submit"
              disabled={!studentName.trim()}
              className="w-full py-4 bg-[#006A4E] hover:bg-emerald-850 text-white font-black rounded-xl uppercase tracking-wider text-xs shadow-md hover:shadow-lg transition-all"
            >
              Start Quiz (പരീക്ഷ ആരംഭിക്കാം)
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: ACTIVE QUESTION WORKSPACE (Student Quiz - Simple, clean, exam mode, hidden keys) */}
      {step === 'playing' && currentQuestion && (
        <div className="bg-white dark:bg-slate-905 rounded-2xl border-t-[10px] border-t-[#006A4E] border-x border-b border-rose-100/50 dark:border-slate-850 shadow-xl p-6 md:p-8 font-sans space-y-6">
          
          {/* Header progress row */}
          <div className="flex justify-between items-center text-xs text-slate-400 font-bold border-b dark:border-slate-800/80 pb-3">
            <span className="text-[#006A4E] dark:text-emerald-400 tracking-wider">
              ചോദ്യം {currentQIndex + 1} / {quiz.questions.length}
            </span>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full text-slate-600 dark:text-slate-300 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.floor(timeSpentSeconds / 60)} മി. {timeSpentSeconds % 60} സെ.</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full relative overflow-hidden select-none">
            <div 
              className="bg-[#006A4E] h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* Question text */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-relaxed">
              {currentQuestion.text}
            </h3>

            {/* Selection Options - High resolution selection targets, no answer colors */}
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {currentQuestion.options.map((opt, i) => {
                const isSelected = selectedOption === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(i)}
                    className={`w-full p-4 rounded-xl text-left text-xs md:text-sm font-bold border transition-all duration-150 flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-[#006a4e]/10 border-[#006A4E] dark:border-emerald-500 text-[#006A4E] dark:text-emerald-300'
                        : 'bg-white hover:bg-slate-50/70 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-baseline gap-2.5">
                      <span className={`text-[10px] uppercase font-serif font-black mr-1 ${
                        isSelected ? 'text-[#006A4E] dark:text-emerald-400' : 'text-slate-400'
                      }`}>
                        {['A', 'B', 'C', 'D'][i]}.
                      </span>
                      <span>{opt}</span>
                    </div>
                    {/* Visual Radio Checkbox feedback */}
                    <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'border-[#006A4E] dark:border-emerald-500 bg-[#006A4E] text-white text-[10px]' : 'border-slate-300 dark:border-slate-700 bg-transparent'
                    }`}>
                      {isSelected && "✓"}
                    </div>
                  </button>
                );
              })}
            </div>
            
            <p className="text-[10px] text-slate-400 dark:text-slate-500 italic">
              * ഒരു ഉത്തരം ക്ലിക്ക് ചെയ്തതിനുശേഷം താഴെയുള്ള സമർപ്പണ ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.
            </p>
          </div>

          {/* Action Row */}
          <div className="flex justify-end pt-2 border-t dark:border-slate-800/80">
            <button
              onClick={handleNextQuestion}
              disabled={selectedOption === null}
              className="px-6 py-3 rounded-xl bg-[#006A4E] dark:bg-emerald-600 dark:hover:bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow transition-all disabled:opacity-40"
            >
              <span>{currentQIndex < quiz.questions.length - 1 ? 'Next Question (തുടരാം)' : 'Submit Exam (പൂർത്തിയാക്കാം)'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* STEP 3: RESULT DASHBOARD (Pure final score reporting, absolutely no key leakages) */}
      {step === 'results' && (
        <div className="bg-white dark:bg-slate-905 rounded-2xl border-t-[10px] border-t-emerald-700 border-x border-b border-slate-200 dark:border-slate-850 shadow-xl p-8 text-center font-sans space-y-6">
          <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-950/20 rounded-full flex items-center justify-center mx-auto text-[#006A4E] dark:text-amber-500">
            <Trophy className="w-10 h-10 text-amber-500 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-black text-slate-850 dark:text-white">
              പരീക്ഷ പൂർത്തിയായിരിക്കുന്നു! 🎉
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              ഹലോ <strong>{studentName}</strong>, നിങ്ങളുടെ സ്കോർ വിവരങ്ങൾ വിജയകരമായി രേഖപ്പെടുത്തിയിട്ടുണ്ട്.
            </p>
          </div>

          {/* High visibility score block */}
          <div className="bg-slate-50 dark:bg-slate-900 border dark:border-slate-800 rounded-2xl p-6 max-w-sm mx-auto space-y-2">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase font-sans">
              പരീക്ഷാ സ്കോർ (Final Score)
            </span>
            <div className="text-3xl md:text-4xl font-black text-[#006A4E] dark:text-emerald-400 font-mono">
              {score} / {quiz.questions.length}
            </div>
            <p className="text-[11px] text-slate-450 dark:text-slate-400">
              ശതമാനം: {Math.round((score / quiz.questions.length) * 100)}% • സമയം: {Math.floor(timeSpentSeconds / 60)} മി. {timeSpentSeconds % 60} സെ.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border space-y-1 text-left text-[11px] text-slate-500 dark:text-slate-400">
            <p className="font-extrabold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 mb-1.5 border-b pb-1">
              <span>📌</span>
              <span>ശ്രദ്ധിക്കുക (Notice)</span>
            </p>
            <p className="leading-relaxed">നിങ്ങൾ എഴുതിയ ഈ ചോദ്യപേപ്പറിന്റെ ശരിയുത്തരങ്ങളും വിശദീകരണങ്ങളും ഔദ്യോഗിക ചട്ടങ്ങൾ പ്രകാരം സുരക്ഷിതമായി സൂക്ഷിച്ചിരിക്കുന്നു. അവ ഇവിടെ നേരിട്ട് ലഭ്യമാക്കില്ല.</p>
          </div>

          {/* Clean return choices */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => {
                setCurrentQIndex(0);
                setSelectedOption(null);
                setScore(0);
                setStep('playing');
                startTimer();
              }}
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs uppercase cursor-pointer"
            >
              വീണ്ടും പരീക്ഷിക്കാം (Retry)
            </button>
            {onExit && (
              <button
                onClick={onExit}
                className="flex-1 py-3 bg-[#006A4E] hover:bg-emerald-850 text-white font-bold rounded-xl text-xs uppercase cursor-pointer text-center"
              >
                തിരികെ പോകാം (Go Back)
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
