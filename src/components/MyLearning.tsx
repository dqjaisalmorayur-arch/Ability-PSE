import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  History, 
  Activity, 
  BookMarked,
  Trophy, 
  Loader2, 
  RefreshCw, 
  Eye, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  X
} from 'lucide-react';
import { db, collection, getDocs, query, where } from '../lib/firebase';
import { Student, SharedQuizAttempt } from '../types';
import CertificateView from './CertificateView';

interface MyLearningProps {
  currentStudent: Student | null;
  onStudentUpdate: (updatedStudent: Student) => void;
  onSelectBookmark: (bookmark: string) => void;
}

export default function MyLearning({ currentStudent, onSelectBookmark }: MyLearningProps) {
  const [attempts, setAttempts] = useState<SharedQuizAttempt[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<SharedQuizAttempt | null>(null);

  // Stats calculation
  const totalAttempted = attempts.length;
  const averageScore = totalAttempted > 0 
    ? Math.round(attempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempted)
    : 0;
  const certificatesEarnedCount = attempts.filter(a => a.percentage >= 40).length; // Pass score of 40% generates certificate

  const fetchAttempts = async () => {
    if (!currentStudent) return;
    setLoading(true);
    try {
      // Find attempts from Firestore for this student's name
      const q = query(
        collection(db, 'quiz_attempts'),
        where('studentName', '==', currentStudent.name)
      );
      const querySnapshot = await getDocs(q);
      const attemptsList: SharedQuizAttempt[] = [];
      querySnapshot.forEach((docSnap) => {
        attemptsList.push({ id: docSnap.id, ...docSnap.data() } as SharedQuizAttempt);
      });
      // Sort by completed date descending
      attemptsList.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
      setAttempts(attemptsList);
    } catch (err) {
      console.error("Error fetching attempts in MyLearning:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [currentStudent]);

  if (!currentStudent) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border p-12 text-center max-w-lg mx-auto">
        <Trophy className="w-12 h-12 stroke-1 text-slate-400 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-700">പഠന ചരിത്രം പരിശോധിക്കാൻ ലോഗിൻ ചെയ്യുക</h3>
        <p className="text-xs text-slate-550 mt-1">അബിലിറ്റി പ്ലാറ്റ്‌ഫോമിൽ നിങ്ങളുടെ പഠനം നിരീക്ഷിക്കാനും സർട്ടിഫിക്കറ്റ് സ്വന്തമാക്കാനും പേര് രേഖപ്പെടുത്തി ലോഗിൻ ചെയ്യുക.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans max-w-7xl mx-auto">
      
      {/* 1. TOP METRIC REPORT BAR */}
      <div className="bg-gradient-to-r from-emerald-805 to-emerald-950 dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-emerald-800 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <span className="text-[9px] bg-emerald-700 dark:bg-slate-800 text-teal-200 font-extrabold px-2 py-0.5 rounded tracking-widest uppercase">
            STUDENT DASHBOARD
          </span>
          <h2 className="text-lg font-black mt-2 font-display">ഹലോ, {currentStudent.name} 👋</h2>
          <p className="text-xs text-emerald-100/85 mt-0.5">
            നിങ്ങളുടെ എല്ലാ പഠന റെക്കോർഡുകളും സർട്ടിഫിക്കറ്റുകളും ഒരേ സ്ഥലത്ത് തത്സമയം ക്ലൗഡ് സമന്വയത്തോടെ ലഭ്യമാക്കിയിരിക്കുന്നു!
          </p>
        </div>

        {/* Sync trigger button */}
        <button
          onClick={fetchAttempts}
          className="bg-white/10 hover:bg-white/20 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition leading-none shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>റീലോഡ് സമന്വയം (Sync database)</span>
        </button>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Streak */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-orange-50 dark:bg-orange-950/40 text-orange-650 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">പഠന തുടർച്ച (Study Streak)</span>
            <b className="text-lg text-slate-800 dark:text-white font-mono">{currentStudent.progress.studyStreak} Days 🔥</b>
          </div>
        </div>

        {/* Total attempted */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-650 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">പങ്കെടുത്ത പരീക്ഷകൾ (Attempted)</span>
            <b className="text-lg text-slate-800 dark:text-white font-mono">{loading ? '...' : totalAttempted} QUIZZES ⏱️</b>
          </div>
        </div>

        {/* Average accuracy */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-650 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">ശരാശരി മാർക്ക് (Avg % Score)</span>
            <b className="text-lg text-slate-800 dark:text-white font-mono">{loading ? '...' : `${averageScore}%`} 📈</b>
          </div>
        </div>

        {/* Certificates */}
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border flex items-center gap-3 shadow-2xs">
          <div className="p-3 bg-amber-50 dark:bg-amber-955/20 text-amber-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-slate-400">സർട്ടിഫിക്കറ്റുകൾ (Certificates)</span>
            <b className="text-lg text-slate-800 dark:text-white font-mono">{loading ? '...' : certificatesEarnedCount} E-BADGES 🏆</b>
          </div>
        </div>
      </div>

      {/* 3. HISTORIC LOGS GRID DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left side column: Attempted list & Cert selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#006A4E]" />
              <span>എഴുതിയ പരീക്ഷകളുടെ ലോഗ് (Practice Quiz History and Marks)</span>
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-2" />
              <p className="text-xs text-slate-500">നിങ്ങളുടെ വിവരങ്ങൾ ശേഖരിക്കുന്നു...</p>
            </div>
          ) : attempts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 border rounded-2xl">
              <Clock className="w-10 h-10 stroke-1 mx-auto text-slate-400 mb-2" />
              <p className="text-xs text-slate-505 font-bold">നിങ്ങൾ ഇതുവരെ പൊതുവായുള്ള പങ്കുവെച്ച പരീക്ഷകളിൽ പങ്കെടുത്തിട്ടില്ല.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">ക്വിസ് ക്രിയേറ്റർ വഴി സ്വന്തം പരീക്ഷ നിർമ്മിച്ചു അല്ലെങ്കിൽ ഷെയർ ചെയ്ത ലിങ്കിൽ ക്ലിക്ക് ചെയ്തു പരീക്ഷ എഴുതൂ!</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {attempts.map((attempt) => (
                <div 
                  key={attempt.id}
                  className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border hover:shadow-xs transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-slate-400 uppercase tracking-widest">
                      COMPLETED AT: {new Date(attempt.completedAt).toLocaleDateString()}
                    </span>
                    <h4 className="text-xs md:text-sm font-black text-slate-850 dark:text-white leading-snug">
                      {attempt.quizTitle}
                    </h4>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ⏱️ ചോദ്യങ്ങൾ: {attempt.totalQuestions} | സമയം: {Math.floor(attempt.timeSpentSeconds / 60)} മി. {attempt.timeSpentSeconds % 60} സെ.
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 w-full sm:w-auto shrink-0 justify-between sm:justify-start">
                    <div className="text-center bg-slate-50 dark:bg-slate-800 p-2 rounded-lg font-mono">
                      <span className="block text-[8px] uppercase text-slate-400">സ്കോർ (Result)</span>
                      <strong className={`block text-xs font-black ${attempt.percentage >= 40 ? 'text-emerald-700' : 'text-orange-600'}`}>
                        {attempt.score} / {attempt.totalQuestions} ({attempt.percentage}%)
                      </strong>
                    </div>

                    {attempt.percentage >= 40 ? (
                      <button
                        onClick={() => setSelectedCertificate(attempt)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[10px] uppercase font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>സർട്ടിഫിക്കറ്റ്</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-orange-500 font-bold bg-orange-50 dark:bg-orange-950/20 px-2.5 py-1 rounded" title="Requires 40% to unlock Certificate">
                        Failed ❌
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right side column: Bookmarks and stats graphs info */}
        <div className="space-y-5">
          {/* Study Bookmarks */}
          <div className="bg-slate-50/50 dark:bg-slate-900 border p-5 rounded-2xl">
            <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider border-b pb-2 flex items-center gap-1.5">
              <BookMarked className="w-4 h-4 text-emerald-700" />
              <span>ബുക്ക്മാർക്ക് കുറിപ്പുകൾ (Bookmarks)</span>
            </h4>
            
            {currentStudent.bookmarkedNotes?.length === 0 ? (
              <p className="text-[11px] text-slate-400 mt-4 leading-normal">ബുക്ക്മാർക്ക് ചെയ്ത കാര്യങ്ങൾ ഒന്നുമില്ല. സ്മാർട്ട് നോട്ട്സ് പഠിക്കുമ്പോൾ അവ സേവ് ചെയ്യാം!</p>
            ) : (
              <div className="mt-4 space-y-2 select-none">
                {currentStudent.bookmarkedNotes?.map((bookmark, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onSelectBookmark && onSelectBookmark(bookmark)}
                    className="p-2.5 bg-white dark:bg-slate-850 hover:bg-emerald-50 hover:text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between border cursor-pointer transition text-slate-700 dark:text-slate-200"
                  >
                    <span>📌 {bookmark}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Badge */}
          <div className="bg-slate-50/50 dark:bg-slate-900 border p-5 rounded-2xl text-center space-y-3">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-[#006A4E]">
              <ShieldCheck className="w-6 h-6 animate-pulse" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-white uppercase">അബിലിറ്റി ഓണർ ബാഡ്ജ്</h4>
            <p className="text-[10px] text-slate-400 leading-normal">
              സിനിമ, കായികം, കറന്റ് അഫയേഴ്സ് ശാസ്ത്രവിഭാഗം എന്നിവയിലെ കസ്റ്റം പരീക്ഷകളിൽ മികച്ച വിജയം നേടുന്നവർക്ക് വിതരണം ചെയ്യുന്ന അക്കാദമി ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റ് അക്കൗണ്ടിൽ സ്ഥിരമായി സൂക്ഷിക്കാം.
            </p>
          </div>
        </div>

      </div>

      {/* FLOAT MODAL: CERTIFICATE DETAILED DIGITAL VIEW */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="relative w-full max-w-4xl p-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl shadow-2xl scale-in">
            <button 
              onClick={() => setSelectedCertificate(null)}
              className="absolute -top-3 -right-3 z-50 bg-slate-900 text-white rounded-full p-2 hover:bg-red-650 transition"
              title="Close Certificate Modal"
            >
              <X className="w-4 h-4" />
            </button>
            <CertificateView 
              studentName={selectedCertificate.studentName}
              quizName={selectedCertificate.quizTitle}
              score={selectedCertificate.score}
              totalQuestions={selectedCertificate.totalQuestions}
              dateString={new Date(selectedCertificate.completedAt).toLocaleDateString()}
              onClose={() => setSelectedCertificate(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
