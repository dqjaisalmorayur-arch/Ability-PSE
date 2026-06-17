import React, { useState, useEffect } from 'react';
import { Shield, Users, FileText, BarChart3, Plus, Trash, Check, Loader2, Sparkles, BookOpen } from 'lucide-react';
import { Student, StudyMaterial, CurrentAffairsItem } from '../types';
import { db, collection, getDocs, deleteDoc, doc, query } from '../lib/firebase';

export default function AdminPanel() {
  const [students, setStudents] = useState<Student[]>([]);
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [news, setNews] = useState<CurrentAffairsItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Shared Quizzes and Attempts
  const [sharedQuizzes, setSharedQuizzes] = useState<any[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // New study material form
  const [mTitle, setMTitle] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [mSyllabus, setMSyllabus] = useState('LDC/LGS Prelims');

  const fetchSharedQuizzes = async () => {
    setLoadingQuizzes(true);
    setLoadingAttempts(true);
    try {
      // 1. Fetch Quizzes
      const q = query(collection(db, 'quizzes'));
      const querySnapshot = await getDocs(q);
      const quizzesList: any[] = [];
      querySnapshot.forEach((docSnap) => {
        quizzesList.push({ id: docSnap.id, ...docSnap.data() });
      });
      quizzesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setSharedQuizzes(quizzesList);

      // 2. Fetch Attempts
      const attSnapshot = await getDocs(collection(db, 'quiz_attempts'));
      const attList: any[] = [];
      attSnapshot.forEach((docSnap) => {
        attList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setQuizAttempts(attList);
    } catch (err) {
      console.error("Error loading shared quizzes for admin:", err);
    } finally {
      setLoadingQuizzes(false);
      setLoadingAttempts(false);
    }
  };

  const handleDeleteSharedQuiz = async (id: string) => {
    if (!confirm("നിങ്ങൾ ഈ പബ്ലിക് ക്വിസ് ഡിലീറ്റ് ചെയ്യാൻ ഉറപ്പാണോ? ഇത് മാറ്റാൻ കഴിയില്ല.")) return;
    try {
      await deleteDoc(doc(db, 'quizzes', id));
      alert("ക്വിസ് വിജയകരമായി നീക്കം ചെയ്തു!");
      fetchSharedQuizzes();
    } catch (err) {
      console.error(err);
      alert("നീക്കം ചെയ്യുന്നതിൽ തടസ്സം നേരിട്ടു.");
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const statsRes = await fetch('/api/public-stats');
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      // Fetch students list
      const studentsRes = await fetch('/api/students');
      if (studentsRes.ok) {
        const studList = await studentsRes.json();
        setStudents(studList);
      }

      // Fetch study materials list
      const matRes = await fetch('/api/study-materials');
      if (matRes.ok) {
        setMaterials(await matRes.json());
      }

      // Fetch current affairs
      const newsRes = await fetch('/api/current-affairs');
      if (newsRes.ok) {
        setNews(await newsRes.json());
      }

      // Fetch firebase quizzes
      await fetchSharedQuizzes();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAddMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mTitle || !mDesc) return;

    try {
      const res = await fetch('/api/study-materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: mTitle,
          description: mDesc,
          syllabusModule: mSyllabus,
          fileUrl: '#'
        })
      });

      if (res.ok) {
        setMTitle('');
        setMDesc('');
        fetchAdminData();
        alert("പുതിയ സ്റ്റഡി മെറ്റീരിയൽ വിജയകരമായി അപ്‌ലോഡ് ചെയ്തു!");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study material?")) return;
    try {
      const res = await fetch(`/api/study-materials?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Title badge */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-850 flex justify-between items-center">
        <div>
          <div className="flex items-center gap-1.5 text-yellow-500 font-mono tracking-widest text-xs font-bold uppercase">
            <Shield className="w-4 h-4 fill-yellow-500 text-yellow-500 animate-pulse" />
            <span>Ability Admin Panel Control Shield</span>
          </div>
          <h2 className="text-xl md:text-2xl font-black font-sans mt-1">ഡയറക്ടർ & അഡ്മിൻ ഡാഷ്‌ബോർഡ്</h2>
          <p className="text-xs text-slate-400 mt-1">Platform management tools for Ability Foundation Disabled Training Academy.</p>
        </div>
        <button
          onClick={fetchAdminData}
          className="p-2 bg-slate-800 hover:bg-slate-700 transition rounded-xl text-yellow-300 text-xs font-mono font-bold"
          title="Refresh statistics logs"
        >
          🔄 Reload Logs
        </button>
      </div>

      {/* Quantitative Stats Numbers Row */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border p-4 rounded-xl shadow-sm text-center">
            <Users className="w-6 h-6 text-[#006A4E] dark:text-emerald-400 mx-auto mb-1.5" />
            <span className="block text-2xl font-black text-slate-800 dark:text-white">{stats.studentsCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Registered Aspirants</span>
          </div>
          <div className="bg-white dark:bg-slate-800 border p-4 rounded-xl shadow-sm text-center">
            <FileText className="w-6 h-6 text-purple-500 mx-auto mb-1.5" />
            <span className="block text-2xl font-black text-slate-800 dark:text-white">{stats.quizzesCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Interactive Quizzes</span>
          </div>
          <div className="bg-white dark:bg-slate-800 border p-4 rounded-xl shadow-sm text-center">
            <BarChart3 className="w-6 h-6 text-orange-500 mx-auto mb-1.5" />
            <span className="block text-2xl font-black text-slate-800 dark:text-white">{stats.currentAffairsCount}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Daily Capsules</span>
          </div>
          <div className="bg-white dark:bg-slate-800 border p-4 rounded-xl shadow-sm text-center">
            <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-1.5" />
            <span className="block text-2xl font-black text-slate-800 dark:text-white">{materials.length}</span>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Resource Downloads</span>
          </div>
        </div>
      )}

      {/* Two Column details: Student Roster table vs Study Materials Creator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Student Roster table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white mb-4 border-b pb-2">
              <Users className="w-5 h-5 text-emerald-600" />
              <h3>രജിസ്റ്റർ ചെയ്ത ഉദ്യോഗാർത്ഥികൾ (Enrolled Student Roster)</h3>
            </div>
            
            {loading ? (
              <div className="py-12 text-center text-slate-400 font-mono">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-1" />
                <span>Loading student records...</span>
              </div>
            ) : students.length === 0 ? (
              <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded text-center font-mono">No students registered.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-650 dark:text-slate-350 divide-y divide-slate-100 font-mono">
                  <thead>
                    <tr className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-2">Student ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Streak</th>
                      <th className="py-2">Points gained</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-750">
                    {students.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-slate-755 transition">
                        <td className="py-2.5 font-mono text-slate-400 font-bold text-[10px]">{st.id}</td>
                        <td className="py-2.5 font-sans font-bold text-slate-800 dark:text-slate-205">{st.name}</td>
                        <td className="py-2.5 text-orange-500 font-black">🔥 {st.streak} d</td>
                        <td className="py-2.5 text-[#006A4E] dark:text-emerald-400 font-black">{st.points} XP</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          
          <div className="border-t pt-4 mt-6 text-slate-400 text-[11px] font-mono flex items-center justify-between">
            <span>Secure encryption active</span>
            <span className="text-[#006A4E] font-bold">Ability Foundation HQ Control</span>
          </div>
        </div>

        {/* Right Column: Study Materials uploader */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white mb-4 border-b pb-2">
              <Plus className="w-5 h-5 text-emerald-600" />
              <h3>Add Study Materials</h3>
            </div>

            <form onSubmit={handleAddMaterial} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Material Title</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. സമഗ്ര ഭരണഘടന ലഘു നോട്ട്"
                  value={mTitle}
                  onChange={e => setMTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-900 text-xs dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Description</label>
                <textarea
                  required
                  placeholder="Briefly state syllabus and pages info..."
                  value={mDesc}
                  onChange={e => setMDesc(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-650 bg-white dark:bg-slate-900 text-xs dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target exam track</label>
                <select
                  value={mSyllabus}
                  onChange={e => setMSyllabus(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs text-slate-805 dark:text-slate-205"
                >
                  <option value="LDC Prelims">LDC Prelims (എൽ.ഡി.സി പ്രിലിംസ്)</option>
                  <option value="LP/UP Teacher Coaching">LP/UP Teacher Exam (എൽ.പി/യു.പി സഹായി)</option>
                  <option value="Sub-Inspector Exams">Sub-Inspector Exams (എസ്.ഐ കോച്ചിംഗ്)</option>
                </select>
              </div>

              <button
                type="submit"
                id="btn-admin-submit-material"
                className="w-full py-2.5 bg-[#006A4E] text-white hover:text-yellow-300 font-bold tracking-wider text-xs uppercase rounded-xl transition"
              >
                Upload Resource Study
              </button>
            </form>
          </div>

          <div className="mt-4 pt-4 border-t">
            <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-2">Current PDF Downloads</h4>
            <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
              {materials.map(mat => (
                <div key={mat.id} className="flex justify-between items-center text-[11px] bg-slate-50 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-100">
                  <span className="truncate pr-2 font-medium text-slate-700 dark:text-slate-200">📂 {mat.title}</span>
                  <button
                    onClick={() => handleDeleteMaterial(mat.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded"
                    title="Delete resource"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* FEATURE 8: SHARED QUIZ MODERATION & ANALYTICS PANEL */}
      {(() => {
        // Calculate dynamic dashboard statistics
        const totalPublishedQuizzes = sharedQuizzes.length;
        
        let mostPopularQuiz = 'None';
        let maxParticipants = 0;
        sharedQuizzes.forEach(quiz => {
          const count = quiz.participantCount || 0;
          if (count > maxParticipants) {
            maxParticipants = count;
            mostPopularQuiz = quiz.title;
          }
        });

        const totalParticipantsVal = quizAttempts.length;

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const dailyAttemptsVal = quizAttempts.filter(att => {
          if (!att.completedAt) return false;
          return new Date(att.completedAt) >= oneDayAgo;
        }).length;

        return (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-150 p-5 space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-white">
                <Shield className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-sm md:text-base font-sans">പബ്ലിക് ക്വിസ് മോഡറേഷൻ സ്റ്റുഡിയോ (Shared Quizzes Moderation & Live Analytics)</h3>
              </div>
              <span className="text-[10px] bg-slate-100 dark:bg-slate-755 font-bold px-2.5 py-1 rounded text-slate-500">
                ടോട്ടൽ ക്വിസ്സുകൾ: {sharedQuizzes.length} Nos
              </span>
            </div>

            {/* Dynamic Interactive Quiz Analytics Suite */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 dark:bg-slate-900/45 rounded-2xl border">
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-150 text-center flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400">Total Published Quizzes</span>
                <span className="block text-lg font-mono font-black text-[#006A4E] dark:text-emerald-400 mt-1">
                  {loadingQuizzes ? '...' : totalPublishedQuizzes}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-150 text-center flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400">Most Popular Quiz</span>
                <span className="block text-[10px] font-bold text-amber-600 dark:text-amber-500 mt-1 line-clamp-1 leading-snug" title={mostPopularQuiz}>
                  {loadingQuizzes ? '...' : mostPopularQuiz}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-150 text-center flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400">Total Participants</span>
                <span className="block text-lg font-mono font-black text-indigo-600 dark:text-indigo-400 mt-1">
                  {loadingAttempts ? '...' : totalParticipantsVal}
                </span>
              </div>
              <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-150 text-center flex flex-col justify-center">
                <span className="text-[9px] font-black uppercase text-slate-400">Daily Quiz Attempts</span>
                <span className="block text-lg font-mono font-black text-rose-500 dark:text-rose-400 mt-1">
                  {loadingAttempts ? '...' : dailyAttemptsVal} Attempts
                </span>
              </div>
            </div>

            {loadingQuizzes ? (
              <div className="py-12 text-center text-slate-400 font-mono">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-1" />
                <span>ക്ലൗഡ് ഡാറ്റ പരിശോധിക്കുന്നു...</span>
              </div>
            ) : sharedQuizzes.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-8">നിലവിൽ ആരും ക്വിസുകൾ ക്രീയേറ്റ് ചെയ്തിട്ടില്ല.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sharedQuizzes.map((q) => (
                  <div 
                    key={q.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-155 flex flex-col justify-between hover:shadow-xs transition"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[8px] bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-teal-400 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                          LANG: {q.language === 'ml' ? 'Malayalam' : 'English'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {q.difficulty}
                        </span>
                      </div>
                      
                      <h4 className="text-xs md:text-sm font-black text-slate-800 dark:text-white leading-snug">
                        {q.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2">
                        {q.description || 'വിശദീകരണങ്ങൾ നൽകിയിട്ടില്ല.'}
                      </p>
                      
                      <div className="pt-2 border-t text-[10px] space-y-1 text-slate-400">
                        <p>✍️ ക്രീയേറ്റർ: <strong className="text-slate-600 dark:text-slate-200">{q.creatorName || 'Guest Teacher'}</strong></p>
                        <p>📝 ചോദ്യങ്ങൾ: <strong className="text-slate-600 dark:text-slate-200">{q.questionCount || q.questions?.length || 0} Nos</strong></p>
                        <p>👥 പങ്കെടുത്തവർ: <strong className="text-emerald-700 dark:text-emerald-400 font-bold">{q.participantCount || 0} Users</strong></p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t flex justify-between items-center gap-2">
                      <span className="text-[9px] text-slate-450 font-mono">
                        {q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Unknown date'}
                      </span>
                      
                      <button
                        onClick={() => handleDeleteSharedQuiz(q.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-800 p-2 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-black"
                        title="Delete Quiz"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        <span>ഡിലീറ്റ് ചെയ്യുക</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })()}

    </div>
  );
}
