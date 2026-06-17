import React, { useState } from 'react';
import { HelpCircle, Sparkles, Loader2, Trophy, RefreshCw, CheckCircle, AlertTriangle, ChevronRight, PlayCircle } from 'lucide-react';
import { Quiz, Question, Student } from '../types';

interface QuizGeneratorProps {
  currentStudent: Student | null;
  onStudentUpdate: (updatedStudent: Student) => void;
}

const TOPIC_PRESETS = [
  { label: "കേരള ചരിത്രം (Kerala History)", value: "History of Kerala, early arrival of Europeans, social revolts and Malayalam Renaissance leaders." },
  { label: "ഇന്ത്യൻ കായികം (Indian Sports)", value: "Indian Olympic achievements, National sports awards, Khel Ratna, trophy titles and sports locations." },
  { label: "ഐടി & സൈബർ നിയമങ്ങൾ (IT & Cyber Laws)", value: "Basic IT concepts, internet protocols, software terminology and the IT Act 2000 of India." },
  { label: "കേരളത്തിലെ നദികൾ (Rivers of Kerala)", value: "Origins of Kerala rivers, length, major tributaries, dams and historical importance of Periyar, Bharathappuzha." }
];

export default function QuizGenerator({ currentStudent, onStudentUpdate }: QuizGeneratorProps) {
  const [sourceMaterial, setSourceMaterial] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [language, setLanguage] = useState<'ml' | 'en' | 'both'>('ml');
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  // Playing generated Quiz states
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const handleGenerateCustomQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceMaterial.trim()) return;

    setGenerating(true);
    setActiveQuiz(null);
    setShowResults(false);
    setScore(0);
    setCurrentQIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);

    try {
      const res = await fetch('/api/quiz-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'Interactive custom generator',
          context: sourceMaterial.trim(),
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
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const currentQuestion: Question | undefined = activeQuiz?.questions[currentQIndex];

  const handleOptionSelect = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered || !currentQuestion) return;

    const isCorrect = selectedOption === currentQuestion.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    setIsAnswered(true);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQIndex < activeQuiz.questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = async () => {
    setShowResults(true);
    if (!activeQuiz || !currentStudent) return;

    // Log user marks instantly onto our persistence store
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
        const updated = await res.json();
        onStudentUpdate(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6">
      
      {/* Title */}
      <div className="mb-6 border-b border-slate-100 dark:border-slate-700 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <div className="flex items-center gap-2 text-[#006A4E] dark:text-emerald-400">
            <HelpCircle className="w-5 h-5 text-[#006A4E]" />
            <h2 className="text-xl font-bold">AI സ്മാർട്ട് പരീക്ഷാ നിർമ്മിതി (Custom Quiz Generator)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            നിങ്ങളുടെ സ്വന്തം കുറിപ്പുകൾ, സിലബസ് ടോപ്പിക്കുകൾ അല്ലെങ്കിൽ പത്രവാർത്തകൾ നൽകി 10 മുതൽ 100 ചോദ്യങ്ങളടങ്ങിയ മാതൃകാ പരീക്ഷകൾ നിർമ്മിക്കുക!
          </p>
        </div>
        {activeQuiz && (
          <button
            onClick={() => setActiveQuiz(null)}
            className="text-xs font-bold font-mono bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-200"
          >
            Create New Quiz
          </button>
        )}
      </div>

      {/* CREATION BOX */}
      {!activeQuiz && (
        <form onSubmit={handleGenerateCustomQuiz} className="space-y-4 font-sans text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
              പഠന വിഷയം / ടെക്സ്റ്റ് കുറിപ്പുകൾ നൽകുക (Input Topic or Notes)
            </label>
            <textarea
              required
              rows={4}
              placeholder="E.g., ടൈപ്പ് ചെയ്യുക: 'ഇന്ത്യൻ റെഡ് ക്രോസ്സ് കോൺഗ്രസ്സ്', അല്ലെങ്കിൽ 'കേരള ഭൂപരിഷ്കരണ നിയമം', അല്ലെങ്കിൽ പഠന ഗൈഡിൽ നിന്നുള്ള വരികൾ ഇവിടെ പേസ്റ്റ് ചെയ്യുക..."
              value={sourceMaterial}
              onChange={e => setSourceMaterial(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-905 border border-slate-300 dark:border-slate-650 text-xs md:text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-sans"
            />
            {/* Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {TOPIC_PRESETS.map((preset, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setSourceMaterial(preset.value)}
                  className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-[10px] text-slate-750 font-medium hover:bg-slate-200 transition"
                >
                  💡 {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Question count */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ചോദ്യങ്ങളുടെ എണ്ണം</label>
              <select
                value={questionCount}
                onChange={e => setQuestionCount(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="10">10 Questions</option>
                <option value="20">20 Questions</option>
                <option value="30">30 Questions</option>
                <option value="50">50 Questions</option>
                <option value="100">100 Questions</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">പരീക്ഷണ കാഠിന്യം (Difficulty)</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="easy">Easy (ലളിതം)</option>
                <option value="medium">Medium (സാധാരണ)</option>
                <option value="hard">Hard (കഠിനം)</option>
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ഭാഷ തിരഞ്ഞെടുക്കുക (Language)</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-xl border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs"
              >
                <option value="ml">Malayalam (മലയാളം)</option>
                <option value="en">English</option>
                <option value="both">Malayalam & English</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={generating || !sourceMaterial.trim()}
            className="w-full py-3 bg-gradient-to-r from-[#006A4E] to-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-2 shadow"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-yellow-350" />
                <span>Creating Custom PSC Exams from Text Context...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-white" />
                <span>പരീക്ഷ നിർമ്മിക്കുക (Generate Practice Test)</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ACTIVE TEST WORKSPACE */}
      {activeQuiz && !showResults && currentQuestion && (
        <div className="bg-slate-50 dark:bg-slate-900/45 p-4 md:p-6 rounded-xl border border-slate-150 relative">
          
          <div className="flex justify-between items-center text-xs text-slate-400 mb-4 pb-2 border-b border-slate-205">
            <span>QUESTION {currentQIndex + 1} OF {activeQuiz.questions.length}</span>
            <span>SCORE: {score} XP</span>
          </div>

          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-805 dark:text-white text-xs md:text-sm leading-snug">
              Q: {currentQuestion.text}
            </h3>

            <div className="grid grid-cols-1 gap-2 md:gap-3 font-sans">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleOptionSelect(i)}
                  className={`w-full p-3 rounded-xl text-left text-xs md:text-sm font-semibold border transition ${
                    isAnswered
                      ? i === currentQuestion.correctAnswer
                        ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-505 text-emerald-800'
                        : selectedOption === i
                        ? 'bg-red-100 dark:bg-red-950 border-red-505 text-red-800'
                        : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'
                      : selectedOption === i
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  disabled={isAnswered}
                >
                  <span className="font-mono font-bold mr-1.5">{['A', 'B', 'C', 'D'][i]}.</span>
                  {opt}
                </button>
              ))}
            </div>

            {isAnswered && (
              <div className={`mt-4 p-4 rounded-xl text-xs leading-normal border ${
                selectedOption === currentQuestion.correctAnswer ? 'bg-emerald-50 border-emerald-250 text-slate-700' : 'bg-red-50 border-red-250 text-slate-700'
              }`}>
                <p className="font-extrabold text-[#006A4E] flex items-center gap-1">
                  {selectedOption === currentQuestion.correctAnswer ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>ശരിയുത്തരം! (Correct!)</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                      <span>തെറ്റായ ഉത്തരം! (Option {['A','B','C','D'][currentQuestion.correctAnswer]} was correct)</span>
                    </>
                  )}
                </p>
                <p className="mt-1 font-serif text-xs leading-relaxed italic">
                  <b>വിശദീകരണം:</b> {currentQuestion.explanation}
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold uppercase disabled:opacity-50"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-5 py-2.5 rounded-lg bg-[#006A4E] text-white hover:bg-emerald-700 text-xs font-bold uppercase flex items-center gap-1"
              >
                <span>{currentQIndex < activeQuiz.questions.length - 1 ? 'Next Question' : 'View Exam summary'}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

        </div>
      )}

      {/* SHOW TRANSITION RESULTS VIEW */}
      {showResults && activeQuiz && (
        <div className="bg-slate-50 dark:bg-slate-900/40 p-6 rounded-xl border text-center max-w-md mx-auto">
          <div className="bg-yellow-105 p-3.5 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3 text-yellow-600">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">നിങ്ങളുടെ സ്കോർ റിപ്പൊർട്ട് !</h3>
          <p className="text-xs text-slate-550 mb-4">{activeQuiz.title}</p>

          <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-800 border p-3 rounded-xl mb-4 font-mono text-center">
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Total Correct</span>
              <span className="text-xl font-bold text-[#006A4E]">{score} / {activeQuiz.questions.length}</span>
            </div>
            <div>
              <span className="block text-slate-400 text-[10px] uppercase font-bold">Total XP</span>
              <span className="text-xl font-bold text-emerald-600">+{score * 10} XP</span>
            </div>
          </div>

          <div className="text-left text-[11px] text-slate-500 leading-normal pl-3 border-l-4 border-yellow-500 mb-5">
            Your results are synchronized and listed inside your <b>Student Personal Dashboard</b> under history logs. Consistent practice unlocks premium rankings.
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                setActiveQuiz(null);
                setSourceMaterial('');
              }}
              className="flex-1 bg-[#006A4E] hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs uppercase"
            >
              Generate Custom Test
            </button>
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentQIndex(0);
                setSelectedOption(null);
                setScore(0);
                setIsAnswered(false);
              }}
              className="flex-1 bg-slate-100 hover:bg-slate-250 text-slate-700 font-bold py-2 rounded-xl text-xs uppercase"
            >
              Retry
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
