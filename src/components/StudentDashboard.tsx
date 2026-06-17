import React, { useState } from 'react';
import { Flame, Star, Award, Bookmark, Calendar, CheckCircle, Clock, Check, Trash, Sparkles, Shield, BarChart2, ShieldAlert } from 'lucide-react';
import { Student } from '../types';

interface StudentDashboardProps {
  student: Student;
  onStudentUpdate: (updated: Student) => void;
  onSelectBookmark: (topic: string) => void;
}

export default function StudentDashboard({ student, onStudentUpdate, onSelectBookmark }: StudentDashboardProps) {
  const [isPremium, setIsPremium] = useState(false);
  
  const handleRemoveBookmark = async (e: React.MouseEvent, topic: string) => {
    e.stopPropagation(); // don't open the note
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: student.id,
          action: 'bookmark',
          payload: { topic }
        })
      });
      if (res.ok) {
        const updated = await res.json();
        onStudentUpdate(updated);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Profile banner */}
      <div className="bg-gradient-to-r from-[#006A4E] to-emerald-800 text-white rounded-2xl p-5 shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] bg-emerald-900 border border-emerald-600/40 text-emerald-300 font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full">Student Desk</span>
          <h2 className="text-xl md:text-2xl font-black mt-1">ഹലോ {student.name}!</h2>
          <p className="text-xs text-emerald-200 mt-1">അബിലിറ്റി ഭിന്നശേഷി പി.എസ്.സി ലേണിങ് പോർട്ടലിലേക്ക് സ്വാഗതം. (Achieve Success!)</p>
        </div>

        {/* Stats metrics */}
        <div className="flex gap-3 select-none">
          {/* XP Card */}
          <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="block text-[9px] uppercase tracking-wider text-emerald-300">Total Points</span>
            <span className="text-lg md:text-xl font-mono font-black text-yellow-300">{student.progress.points} XP</span>
          </div>

          {/* Streak Card */}
          <div className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-center">
            <span className="block text-[9px] uppercase tracking-wider text-emerald-300">Daily Streak</span>
            <span className="text-lg md:text-xl font-mono font-black text-orange-400 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              {student.progress.studyStreak} Days
            </span>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP PLANS CONTROLLER */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 dark:border-slate-700 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-100 dark:bg-yellow-950 p-2 rounded-xl text-yellow-600">
              <Award className="w-5 h-5 animate-spin" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-slate-850 dark:text-white flex items-center gap-1.5">
                <span>മെമ്പർഷിപ്പ് പ്ലാനുകൾ (Membership & AI Plans)</span>
                {isPremium ? (
                  <span className="bg-[#D4AF37] text-slate-950 text-[9px] px-2 py-0.5 rounded-full font-black uppercase font-mono tracking-wide">Pro Scholar</span>
                ) : (
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-500 text-[9px] px-2 py-0.5 rounded-full font-black uppercase font-mono tracking-wide">Free Tier</span>
                )}
              </h3>
              <p className="text-xs text-slate-450 mt-0.5 font-sans leading-normal">
                See the core differences in AI capability quotas, cognitive diagnostics, and full mock duration trials!
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsPremium(!isPremium)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm shrink-0 ${
              isPremium
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border dark:bg-slate-700 dark:text-white'
                : 'bg-[#006A4E] hover:bg-emerald-700 text-white font-extrabold'
            }`}
          >
            {isPremium ? "↩️ Switch to Free Plan" : "💡 Upgrade to SCHOLAR PRO"}
          </button>
        </div>

        {/* Perks Grid Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans pt-1">
          {/* Perk 1 */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 flex gap-2.5 items-start">
            <span className="text-lg">💬</span>
            <div className="text-xs">
              <h4 className="font-extrabold text-slate-800 dark:text-white">AI Consultation Quota</h4>
              <p className="text-[10px] text-slate-450 mt-1">
                {isPremium ? (
                  <b className="text-emerald-700">UNLIMITED PROMPTS:</b>
                ) : (
                  <b className="text-red-600">5 PROMPTS / DAY LIMIT:</b>
                )} Unlimited Speech, audio evaluations, and PDF chapter summaries.
              </p>
            </div>
          </div>

          {/* Perk 2 */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 flex gap-2.5 items-start">
            <span className="text-lg">⏱️</span>
            <div className="text-xs">
              <h4 className="font-extrabold text-slate-800 dark:text-white">Mock Exam Trials</h4>
              <p className="text-[10px] text-slate-450 mt-1">
                {isPremium ? (
                  <b className="text-emerald-750">PREMIUM FULL EXAMS:</b>
                ) : (
                  <b className="text-slate-500">SHORT BOOSTER DRILLS:</b>
                )} Access comprehensive state-level 100-q exams with negative markings.
              </p>
            </div>
          </div>

          {/* Perk 3 */}
          <div className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 flex gap-2.5 items-start">
            <span className="text-lg">📊</span>
            <div className="text-xs">
              <h4 className="font-extrabold text-slate-800 dark:text-white">SWOT Cognitive Analytics</h4>
              <p className="text-[10px] text-slate-450 mt-1">
                {isPremium ? (
                  <b className="text-[#006A4E]">COGNITIVE RADAR LIVE:</b>
                ) : (
                  <b className="text-slate-400">LOG HISTORIES ONLY:</b>
                )} Toggle Pro to unlock SWOT graphs of grade strength levels per syllabus field.
              </p>
            </div>
          </div>
        </div>

        {/* ADVANCED PERFORMANCE SWOT DIAGNOSTIC GRID PANEL */}
        {isPremium ? (
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-dashed border-emerald-300 space-y-3.5 mt-2 transition-all">
            <div className="flex justify-between items-center text-xs">
              <span className="font-black text-slate-800 dark:text-white flex items-center gap-1 uppercase tracking-wider font-sans">
                <BarChart2 className="w-4 h-4 text-emerald-600" />
                <span>Premium Scholar Cognitive SWOT Profile (സിലബസ് വിലയിരുത്തൽ)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 bg-white dark:bg-black px-2 py-0.5 rounded border font-bold">Accuracy Index: 92%</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3.5 pt-1 text-xs">
              {/* Subject 1 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-150">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 leading-none">
                  <span>MALAYALAM</span>
                  <span className="text-emerald-700">94%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '94%' }}></div>
                </div>
                <span className="text-[9px] text-emerald-700 font-bold block mt-1.5 leading-none">🎖️ Strength: Grammar</span>
              </div>

              {/* Subject 2 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-150">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 leading-none">
                  <span>CONSTITUTION</span>
                  <span className="text-emerald-700">85%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-[9px] text-emerald-700 font-bold block mt-1.5 leading-none">🎖️ Strength: Amendments</span>
              </div>

              {/* Subject 3 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-150">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 leading-none">
                  <span>MATH & LOGIC</span>
                  <span className="text-orange-500">72%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-[9px] text-orange-600 font-bold block mt-1.5 leading-none">⚡ Grow: Profit/Loss Formulas</span>
              </div>

              {/* Subject 4 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-150">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 leading-none">
                  <span>RENAISSANCE</span>
                  <span className="text-emerald-700">91%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-600 h-full rounded-full" style={{ width: '91%' }}></div>
                </div>
                <span className="text-[9px] text-emerald-700 font-bold block mt-1.5 leading-none">🎖️ Strength: Leaders, Year</span>
              </div>

              {/* Subject 5 */}
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl shadow-sm border border-slate-150">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1 leading-none">
                  <span>ENGLISH</span>
                  <span className="text-orange-500">64%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: '64%' }}></div>
                </div>
                <span className="text-[9px] text-orange-600 font-bold block mt-1.5 leading-none">⚡ Grow: Synonyms and Tenses</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-100/50 dark:bg-slate-900/60 p-3 rounded-xl text-center border border-dashed border-slate-200">
            <p className="text-[10px] font-mono text-slate-450 italic flex items-center justify-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Click "Upgrade to SCHOLAR PRO" to unlock real-time mock performance matrix mapping!</span>
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Column 1: Bookmarked Topic Notes */}
        <div className="md:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-slate-800 dark:text-white mb-4">
              <Bookmark className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <h3 className="font-extrabold text-sm md:text-base">സേവ് ചെയ്ത പാഠഭാഗങ്ങൾ</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4 font-sans leading-normal">
              Bookmarked study capsules for ready reference and offline summaries. Click on any topic to prepare immediately.
            </p>

            {student.bookmarkedNotes.length === 0 ? (
              <div className="py-10 text-center rounded-xl border border-dashed border-slate-100 bg-slate-50 dark:bg-slate-900/40 text-slate-450">
                <Bookmark className="w-6 h-6 text-slate-200 mx-auto mb-1" />
                <p className="text-[10px]">No bookmarks saved yet.</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {student.bookmarkedNotes.map((noteTopic, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectBookmark(noteTopic)}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 cursor-pointer text-xs transition"
                  >
                    <span className="font-bold text-slate-700 dark:text-slate-200 truncate pr-2">📚 {noteTopic}</span>
                    <button
                      onClick={(e) => handleRemoveBookmark(e, noteTopic)}
                      className="p-1 rounded text-red-500 hover:bg-red-50"
                      title="Delete bookmark"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-6">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Verified syllabus support</span>
              <span className="text-emerald-700 font-bold font-mono">100% Authentic</span>
            </div>
          </div>
        </div>

        {/* Column 2 & 3: Exam and Quiz submission histories */}
        <div className="md:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-850 dark:text-white mb-4">
              <div className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm md:text-base">പരീക്ഷാ ചരിത്രവും പരിശോധനകളും (History Logs)</h3>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">live synced logs</span>
            </div>

            {/* Sub listings: Mock results */}
            <div className="space-y-3.5 font-sans">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">1. Timed PSC Mock Exams (മാതൃകാ പരീക്ഷകൾ)</h4>
                {student.mockTestHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg text-center border">
                    No mock exams attempted. Please enter the mock examination hall!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {student.mockTestHistory.map((history, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/40 text-[11px] grid grid-cols-2 md:grid-cols-4 items-center gap-2 font-mono"
                      >
                        <div className="font-sans font-bold text-slate-805 dark:text-slate-205 truncate">
                          {history.testTitle}
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-bold">
                          Score: {history.score} XP
                        </div>
                        <div className="text-slate-500 font-semibold gap-1 flex items-center">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> {history.scorePercentage}% Passed
                        </div>
                        <div className="text-slate-400 text-right font-sans">
                          🕒 Time: {Math.round(history.timeSpentSeconds / 60)}m
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quiz submission logs */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">2. Dynamic Quiz Submissions (ലഘു പരീക്ഷകൾ)</h4>
                {student.quizHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg text-center border">
                    No quizzes completed. Use the AI YouTube Quiz generator or topic-drills to score!
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {student.quizHistory.map((history, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-slate-100 bg-slate-50 dark:bg-slate-900/40 text-[11px] flex justify-between items-center font-mono"
                      >
                        <span className="font-sans font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                           🎯 {history.quizTitle}
                        </span>
                        <div className="flex gap-4">
                          <span className="text-emerald-600 font-bold">+{history.score * 10} XP</span>
                          {history.score !== undefined && (
                            <span className="text-slate-500">Correct: {history.score} / {history.totalQuestions}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Verification disclaimer stamp */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mt-6 flex justify-between text-slate-400 text-[11px]">
            <span>Active learning account: {student.id}</span>
            <span className="text-emerald-700 font-medium font-sans">Certified by Ability Foundation Study Council</span>
          </div>
        </div>

      </div>

    </div>
  );
}
