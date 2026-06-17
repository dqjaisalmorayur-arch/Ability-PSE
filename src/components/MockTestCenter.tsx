import React, { useState, useEffect, useRef } from 'react';
import { Award, BookOpen, Clock, AlertCircle, RefreshCw, CheckCircle, XCircle, ChevronRight, PlayCircle, Loader2 } from 'lucide-react';
import { Quiz, Question, Student } from '../types';

interface MockTestProps {
  currentStudent: Student | null;
  onStudentUpdate: (updatedStudent: Student) => void;
}

export default function MockTestCenter({ currentStudent, onStudentUpdate }: MockTestProps) {
  const [examType, setExamType] = useState<'full' | 'renaissance' | 'constitution'>('full');
  const [totalQuestionsSize, setTotalQuestionsSize] = useState('10');
  const [durationMinutes, setDurationMinutes] = useState('10');
  const [applyNegativeMarking, setApplyNegativeMarking] = useState(true);
  
  // Status
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  // Active exam questions
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [qIdx: number]: number }>({}); // maps question Index -> option Index

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(600);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Detailed scores
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [negativeMarksFactor, setNegativeMarksFactor] = useState(0);

  // Fetch or compile dynamic mock test questions
  const startExam = async () => {
    setLoading(true);
    try {
      // We can fetch existing quizzes from server and merge/sample their questions
      const res = await fetch('/api/quizzes');
      if (res.ok) {
        let allQuizzes: Quiz[] = await res.json();
        
        // Filter based on topic
        if (examType === 'renaissance') {
          allQuizzes = allQuizzes.filter(q => q.title.toLowerCase().includes('renaissance') || q.title.toLowerCase().includes('നവോത്ഥാനം'));
        } else if (examType === 'constitution') {
          allQuizzes = allQuizzes.filter(q => q.title.toLowerCase().includes('constitution') || q.title.toLowerCase().includes('ഭരണഘടന'));
        }

        // Flatten questions
        let pool: Question[] = [];
        allQuizzes.forEach(q => {
          pool = pool.concat(q.questions);
        });

        // Add additional standard pool if list is small to ensure dynamic full-bodied exams
        const backupPool: Question[] = [
          {
            id: "b1",
            text: "സ്വതന്ത്ര ഇന്ത്യയുടെ ആദ്യത്തെ ഗവർണർ ജനറൽ ആര്?",
            options: ["സി. രാജഗോപാലാചാരി", "മൗണ്ട്ബാറ്റൺ പ്രഭു", "ഡോ. രാജേന്ദ്ര പ്രസാദ്", "ജവഹർലാൽ നെഹ്റു"],
            correctAnswer: 1,
            explanation: "സ്വതന്ത്ര ഇന്ത്യയുടെ ആദ്യത്തെ ഗവർണർ ജനറൽ മൗണ്ട്ബാറ്റൺ പ്രഭു ആയിരുന്നു. എന്നാൽ ആദ്യത്തെ ഇന്ത്യൻ ഗവർണർ ജനറൽ സി. രാജഗോപാലാചാരിയാണ്."
          },
          {
            id: "b2",
            text: "കേരളത്തിൽ കടൽത്തീരമില്ലാത്ത ഒരേയൊരു കോർപ്പറേഷൻ ഏത്?",
            options: ["കൊച്ചി", "കോഴിക്കോട്", "കൊല്ലം", "തൃശ്ശൂർ"],
            correctAnswer: 3,
            explanation: "കേരളത്തിലെ കോർപ്പറേഷനുകളിൽ കടൽത്തീരമില്ലാത്ത ഒരേയൊരു കോർപ്പറേഷൻ തൃശ്ശൂർ ആണ്."
          },
          {
            id: "b3",
            text: "ഇന്ത്യയിൽ മൗലികാവകാശങ്ങൾ സംരക്ഷിക്കുന്നതിനുള്ള റിട്ടുകൾ പുറപ്പെടുവിക്കാൻ അധികാരമുള്ള കോടതികൾ ഏവ?",
            options: ["ഹൈക്കോടതികൾ മാത്രം", "സുപ്രീം കോടതി മാത്രം", "സുപ്രീം കോടതിയും ഹൈക്കോടതികളും", "ജില്ലാ കോടതികൾ"],
            correctAnswer: 2,
            explanation: "ഭരണഘടന പ്രകാരം സുപ്രീം കോടതിക്കും (ആർട്ടിക്കിൾ 32) ഹൈക്കോടതികൾക്കും (ആർട്ടിക്കിൾ 226) റിട്ടുകൾ പുറപ്പെടുവിക്കാൻ അധികാരമുണ്ട്."
          },
          {
            id: "b4",
            text: "കേരളത്തിന്റെ ഔദ്യോഗിക പക്ഷി ഏത്?",
            options: ["വേഴാമ്പൽ", "കുയിൽ", "മയിൽ", "തത്ത"],
            correctAnswer: 0,
            explanation: "കേരളത്തിന്റെ ഔദ്യോഗിക പക്ഷി മലമുഴക്കി വേഴാമ്പൽ (Great Hornbill) ആണ്."
          },
          {
            id: "b5",
            text: "ഇന്ത്യയിലെ ഏറ്റവും ഉയരം കൂടിയ കവാടമായ ബുലന്ദ് ദർവാസ നിർമ്മിച്ചതാരാണ്?",
            options: ["ഷാജഹാൻ", "അക്ബർ", "ജഹാംഗീർ", "ബാബർ"],
            correctAnswer: 1,
            explanation: "ഗുജറാത്ത് വിജയത്തിന്റെ സ്മരണയ്ക്കായി ഫത്തേപ്പൂർ സിക്രിയിൽ അക്ബർ ചക്രവർത്തി നിർമ്മിച്ചതാണ് ബുലന്ദ് ദർവാസ."
          }
        ];

        let combined = [...pool, ...backupPool];
        // Shuffle Combined
        combined = combined.sort(() => 0.5 - Math.random());

        // Select exact requested size
        const targetSize = Math.min(Number(totalQuestionsSize), combined.length);
        const selectedQuestions = combined.slice(0, targetSize);

        setQuestions(selectedQuestions);
        setSelectedOptions({});
        setSecondsRemaining(Number(durationMinutes) * 60);
        setCurrentIdx(0);
        setExamStarted(true);
        setExamFinished(false);

        // Start countdown timer
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setSecondsRemaining(prev => {
            if (prev <= 1) {
              clearInterval(timerRef.current!);
              finishExam(selectedQuestions, {}); // auto-submit
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const finishExam = async (testQuestions: Question[] = questions, answers: { [qIdx: number]: number } = selectedOptions) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    testQuestions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected === undefined) {
        unanswered++;
      } else if (selected === q.correctAnswer) {
        correct++;
      } else {
        wrong++;
      }
    });

    // 1 point for correct, minus 0.33 index for wrong (if negative marking applied)
    const negativePenalty = applyNegativeMarking ? Number((wrong * 0.33).toFixed(2)) : 0;
    const finalScoreFloat = Number((correct - negativePenalty).toFixed(2));
    const finalSafeScore = Math.max(0, finalScoreFloat);
    const scorePercentage = Math.round((finalSafeScore / testQuestions.length) * 100);

    setCorrectCount(correct);
    setWrongCount(wrong);
    setUnansweredCount(unanswered);
    setNegativeMarksFactor(negativePenalty);
    setFinalScore(finalSafeScore);
    setExamFinished(true);
    setExamStarted(false);

    // Save Mock Attempt to local student database
    if (currentStudent && testQuestions.length > 0) {
      try {
        const timeSpent = (Number(durationMinutes) * 60) - secondsRemaining;
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentStudent.id,
            action: 'submit_mock',
            payload: {
              testTitle: `${examType.toUpperCase()} Kerala PSC Mock Exam`,
              score: finalSafeScore,
              correctAnswers: correct,
              wrongAnswers: wrong,
              scorePercentage: scorePercentage,
              negativeMarks: negativePenalty,
              timeSpentSeconds: timeSpent
            }
          })
        });

        if (res.ok) {
          const freshStudent = await res.json();
          onStudentUpdate(freshStudent);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6 overflow-hidden">
      
      {/* Title */}
      <div className="mb-6 flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#006A4E] dark:text-emerald-400">
            <Clock className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold font-sans">മാതൃകാ പരീക്ഷാ ഹാൾ (Mock Test Center)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete simulated timed evaluations with negative-marking penalizations conforming to standard Kerala PSC formats.
          </p>
        </div>
      </div>

      {/* SETUP PHASE SCREEN */}
      {!examStarted && !examFinished && (
        <div className="space-y-6 max-w-xl mx-auto p-4 bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200">
          <h3 className="font-extrabold text-sm md:text-base text-slate-800 dark:text-slate-150 border-b pb-2 mb-4">Exam Configuration Settings</h3>
          
          <div className="space-y-4">
            
            {/* Exam category */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">1. Select Target Exam</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setExamType('full')}
                  className={`p-3.5 rounded-xl border text-left text-xs md:text-sm font-bold transition ${
                    examType === 'full'
                      ? 'bg-[#006A4E] border-[#006A4E] text-white shadow'
                      : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  🏫 Full Multi-Subject Mock
                </button>
                <button
                  type="button"
                  onClick={() => setExamType('renaissance')}
                  className={`p-3.5 rounded-xl border text-left text-xs md:text-sm font-bold transition ${
                    examType === 'renaissance'
                      ? 'bg-[#006A4E] border-[#006A4E] text-white shadow'
                      : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  🎨 Kerala Renaissance Special
                </button>
                <button
                  type="button"
                  onClick={() => setExamType('constitution')}
                  className={`p-3.5 rounded-xl border text-left text-xs md:text-sm font-bold transition ${
                    examType === 'constitution'
                      ? 'bg-[#006A4E] border-[#006A4E] text-white shadow'
                      : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  📜 Indian Constitution Special
                </button>
              </div>
            </div>

            {/* Sizes selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">2. Total Questions Size</label>
                <select
                  value={totalQuestionsSize}
                  onChange={e => setTotalQuestionsSize(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="5">5 Questions (Speed Drill)</option>
                  <option value="10">10 Questions</option>
                  <option value="20">20 Questions</option>
                  <option value="50">50 Questions</option>
                  <option value="100">100 Questions (Full PSC syllabus)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5">3. Duration / Time allowed</label>
                <select
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-200"
                >
                  <option value="5">5 Minutes</option>
                  <option value="10">10 Minutes</option>
                  <option value="20">20 Minutes</option>
                  <option value="50">50 Minutes</option>
                  <option value="75">75 Minutes (Standard LDC)</option>
                </select>
              </div>
            </div>

            {/* Negative Marking Toggler */}
            <div className="pt-2 bg-white dark:bg-slate-800 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-105">Enable Negative Marking (ഫീച്ചർ ഓൺ ചെയ്യുക)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Deducts 1/3 (0.33) marks per wrong selection matching standard PSC rules.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={applyNegativeMarking}
                onChange={e => setApplyNegativeMarking(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 ring-2 ring-emerald-300"
              />
            </div>
          </div>

          <button
            onClick={startExam}
            disabled={loading}
            id="btn-start-psc-mock"
            className="w-full py-3 bg-gradient-to-r from-emerald-700 to-[#006A4E] text-white hover:opacity-90 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <PlayCircle className="w-4 h-4 text-white" />}
            <span>Enter Examination Hall</span>
          </button>
        </div>
      )}

      {/* EXAM IN-PROGRESS WINDOW */}
      {examStarted && questions.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-900/40 p-4 md:p-6 rounded-2xl border border-slate-200">
          
          {/* Exam status row */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-800 border p-3 rounded-xl mb-4 text-xs font-mono select-none">
            <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              📝 Question {currentIdx + 1} of {questions.length}
            </span>
            <span className={`font-black p-1 px-3 border rounded-full ${
              secondsRemaining < 60 ? 'animate-pulse bg-red-100 text-red-600 border-red-300' : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100'
            }`}>
              ⏱️ Time left: {formatTimer(secondsRemaining)}
            </span>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-sm md:text-base leading-relaxed pl-2 border-l-4 border-l-emerald-600">
              Q: {questions[currentIdx].text}
            </h3>

            {/* Options selecting */}
            <div className="grid grid-cols-1 gap-2.5">
              {questions[currentIdx].options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedOptions(prev => ({ ...prev, [currentIdx]: i }))}
                  className={`w-full p-3.5 rounded-xl text-left text-xs md:text-sm font-semibold border transition-all ${
                    selectedOptions[currentIdx] === i
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-705 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-755'
                  }`}
                >
                  <span className="inline-block w-6 text-center font-mono font-bold mr-2">{['A','B','C','D'][i]}.</span>
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Controls Footer */}
          <div className="mt-8 pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
            <button
              onClick={() => setSelectedOptions(prev => {
                const updated = { ...prev };
                delete updated[currentIdx];
                return updated;
              })}
              className="text-slate-400 dark:text-slate-500 hover:underline hover:text-slate-600"
              disabled={selectedOptions[currentIdx] === undefined}
            >
              Clear Selection
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="px-3.5 py-2.0 rounded bg-slate-200 dark:bg-slate-700 test-slate-710 hover:bg-slate-300 disabled:opacity-40 rounded-lg text-slate-600 dark:text-slate-300 font-bold"
              >
                Previous
              </button>

              {currentIdx < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentIdx(prev => prev + 1)}
                  className="px-5 py-2.0 hover:bg-emerald-600 bg-emerald-50 text-emerald-800 hover:text-white rounded-lg font-bold"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={() => finishExam()}
                  id="btn-complete-mock-confirm"
                  className="px-5 py-2.0 bg-red-600 hover:bg-red-700 text-white rounded-lg font-black"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>

        </div>
      )}

      {/* EXAM COMPLETED PERFORMANCE REPORT */}
      {examFinished && (
        <div className="space-y-6">
          
          <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 max-w-2xl mx-auto text-center">
            <div className="bg-emerald-100 dark:bg-emerald-950/60 p-4 rounded-full w-14 h-14 flex items-center justify-center mx-auto mb-2 text-emerald-700 dark:text-emerald-400">
              <Award className="w-8 h-8 animate-pulse" />
            </div>
            
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Exam Report Generated!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">Attempted: {examType.toUpperCase()} mock test config.</p>

            {/* Performance Analysis stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white dark:bg-slate-800 border p-4 rounded-xl mt-4 font-mono text-center shadow-inner">
              <div className="p-2 border-r border-slate-100 dark:border-slate-700">
                <span className="block text-slate-400 text-[10px] font-bold uppercase">Correct</span>
                <span className="text-xl font-black text-emerald-600">✅ {correctCount}</span>
              </div>
              <div className="p-2 border-r border-slate-100 dark:border-slate-700">
                <span className="block text-slate-400 text-[10px] font-bold uppercase">Wrong</span>
                <span className="text-xl font-black text-red-500">❌ {wrongCount}</span>
              </div>
              <div className="p-2 border-r border-slate-100 dark:border-slate-700">
                <span className="block text-slate-400 text-[10px] font-bold uppercase">Penalties</span>
                <span className="text-xs font-bold text-orange-600">-{negativeMarksFactor} pts</span>
              </div>
              <div className="p-2">
                <span className="block text-slate-350 text-[10px] font-bold uppercase">Net Score</span>
                <span className="text-xl font-extrabold text-[#006A4E] dark:text-emerald-400">{finalScore} / {questions.length}</span>
              </div>
            </div>

            {/* Omitted stats helper */}
            <p className="text-[11px] text-slate-400 mt-2">
               Omitted/Skipped Questions count: {unansweredCount}. Net score percentage: {Math.round((finalScore/questions.length)*100)}%
            </p>

            <button
              onClick={() => {
                setExamFinished(false);
                setQuestions([]);
              }}
              className="mt-6 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Start Another Exam Session
            </button>
          </div>

          {/* STEP BY STEP OPTION REVIEW */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mt-6">
            <div className="bg-slate-100 dark:bg-slate-900 border-b p-4">
              <h4 className="font-extrabold text-sm text-slate-700 dark:text-slate-300">Detailed Answer Review (ചോദ്യോത്തര അവലോകനം)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Browse textbook-style detailed commentaries for educational clarity.</p>
            </div>

            <div className="divide-y divide-slate-105 dark:divide-slate-700">
              {questions.map((q, idx) => {
                const ans = selectedOptions[idx];
                const isCorrect = ans === q.correctAnswer;
                
                return (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 space-y-2 text-xs md:text-sm">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-400">
                      <span>Question {idx + 1}</span>
                      {ans === undefined ? (
                        <span className="text-orange-500 font-mono">Skipped Study</span>
                      ) : isCorrect ? (
                        <span className="text-emerald-600 font-mono font-bold flex items-center gap-0.5">
                             Correct (+1)
                        </span>
                      ) : (
                        <span className="text-red-500 font-mono font-bold flex items-center gap-0.5">
                             Wrong (-0.33)
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100">
                      {q.text}
                    </h5>

                    {/* Option outcomes */}
                    <div className="space-y-1 mt-1 pl-2 font-mono">
                      <p className="text-slate-650 dark:text-slate-350">
                         👉 Your Answer: {ans !== undefined ? `Option ${['A','B','C','D'][ans]} (${q.options[ans]})` : 'Omitted'}
                      </p>
                      <p className="text-emerald-700 dark:text-emerald-400 font-bold">
                         ⭐ Correct Answer: Option {['A','B','C','D'][q.correctAnswer]} ({q.options[q.correctAnswer]})
                      </p>
                    </div>

                    <div className="p-2.5 rounded bg-emerald-50 dark:bg-slate-900/60 border-l-2 border-l-[#006A4E] text-xs leading-relaxed italic text-slate-600 dark:text-slate-400 font-serif mt-2">
                       <b>PSC Commentary:</b> {q.explanation}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
