import React, { useState } from 'react';
import { Search, Sparkles, BookOpen, Bookmark, FileText, HelpCircle, Lightbulb, CheckCircle2, ChevronRight, BookmarkCheck } from 'lucide-react';
import { TopicStudyNote, Student } from '../types';

interface SmartTopicLearningProps {
  currentStudent: Student | null;
  onStudentUpdate: (updatedStudent: Student) => void;
}

const TEMPLATE_TOPICS = [
  "Kerala Renaissance (കേരള നവോത്ഥാനം)",
  "Indian Constitution (ഇന്ത്യൻ ഭരണഘടന)",
  "Geography of Kerala (കേരള ഭൂമിശാസ്ത്രം)",
  "IT & Cyber Laws (വിവരസാങ്കേതികവിദ്യ)"
];

export default function SmartTopicLearning({ currentStudent, onStudentUpdate }: SmartTopicLearningProps) {
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [noteData, setNoteData] = useState<TopicStudyNote | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'facts' | 'memory' | 'prev' | 'practice'>('notes');

  const fetchTopicNotes = async (topicStr: string) => {
    if (!topicStr.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicStr.trim() })
      });
      if (res.ok) {
        const data = await res.json();
        setNoteData(data);
        setActiveTab('notes');

        // Increment student points for initiating educational study
        if (currentStudent) {
          const updateRes = await fetch('/api/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: currentStudent.id,
              action: 'submit_quiz',
              payload: { pointsEarned: 15, quizTitle: `Topic Learn: ${topicStr}`, quizId: 'topic' }
            })
          });
          if (updateRes.ok) {
            const freshStudent = await updateRes.json();
            onStudentUpdate(freshStudent);
          }
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!currentStudent || !noteData) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentStudent.id,
          action: 'bookmark',
          payload: { topic: noteData.topic }
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

  const isBookmarked = currentStudent && noteData && currentStudent.bookmarkedNotes.includes(noteData.topic);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6">
      
      {/* Title */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-[#006A4E] dark:text-emerald-400">
          <BookOpen className="w-5 h-5 animate-pulse" />
          <h2 className="text-xl font-bold font-sans">സ്മാർട്ട് ടോപിക് ക്ലാസ്സ് (Smart Topic Learning)</h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Type any topic and immediate AI-driven Kerala PSC textbooks details, codes, previous year analysis and mock drills.
        </p>
      </div>

      {/* Input Search controls */}
      <div className="space-y-4 mb-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="E.g. Kerala History, Fundamental Rights, അയ്യങ്കാളി..."
              value={topicInput}
              onChange={e => setTopicInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchTopicNotes(topicInput)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-905 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>
          <button
            onClick={() => fetchTopicNotes(topicInput)}
            disabled={loading || !topicInput.trim()}
            id="btn-generate-topic"
            className="px-5 py-2.5 rounded-xl bg-[#006A4E] hover:bg-emerald-700 text-white hover:text-yellow-300 font-bold text-xs uppercase tracking-wider disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition"
          >
            {loading ? 'Analyzing...' : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Learn</span>
              </>
            )}
          </button>
        </div>

        {/* Template Quick Tags */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 select-none">
          <span className="font-semibold">Quick Lessons:</span>
          {TEMPLATE_TOPICS.map((tag, idx) => (
            <button
              key={idx}
              onClick={() => {
                setTopicInput(tag.split(' (')[0]);
                fetchTopicNotes(tag.split(' (')[0]);
              }}
              className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-150 hover:text-[#006A4E] transition font-medium"
            >
              {tag.split(' (')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Study Notebook View */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <Sparkles className="w-14 h-14 text-emerald-600 animate-spin absolute" />
            <span className="w-4 h-4 bg-yellow-400 rounded-full absolute right-0 top-0 animate-ping"></span>
          </div>
          <p className="font-bold text-slate-800 dark:text-white">പഠനക്കുറിപ്പ് തയ്യാറാക്കുന്നു (AI is researching details)...</p>
          <p className="text-xs text-slate-500 mt-1">ശേഖരിച്ച PSC രേഖകൾ അപഗ്രഥിക്കുന്നു. കുറച്ചു നിമിഷങ്ങൾ കാത്തിരിക്കുക.</p>
        </div>
      ) : noteData ? (
        <div className="border border-slate-205 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm flex flex-col">
          
          {/* Notebook Header */}
          <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-[10px] bg-yellow-100 dark:bg-yellow-950 text-yellow-850 dark:text-yellow-300 px-2 py-0.5 rounded font-bold font-mono tracking-wider uppercase">verified study capsule</span>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 mt-1">📚 {noteData.topic}</h3>
            </div>

            {/* Bookmark Notes helper */}
            {currentStudent && (
              <button
                onClick={handleBookmarkToggle}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                  isBookmarked
                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-400'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-yellow-50'
                }`}
                title={isBookmarked ? "Remove Bookmark" : "Save class notes info"}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                    <span>Saved to Dashboard</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmark Notes</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Simple Explanation banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 border-b border-slate-200/50 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs md:text-sm italic pl-6 border-l-4 border-l-[#006A4E]">
            <span className="font-bold text-[10px] uppercase block text-emerald-800 dark:text-emerald-400 not-italic font-mono mb-0.5">ലളിതമായ വിവരണം (Accessible Summary)</span>
            {noteData.explanation}
          </div>

          {/* Internal Navigation Subtabs */}
          <div className="flex bg-slate-100 dark:bg-slate-900 gap-1 overflow-x-auto p-1 select-none">
            <button
              onClick={() => setActiveTab('notes')}
              className={`px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'notes' ? 'bg-white dark:bg-slate-800 text-[#006A4E] dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              തയ്യാറാക്കിയ നോട്ട്സ് (Study Notes)
            </button>
            <button
              onClick={() => setActiveTab('facts')}
              className={`px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'facts' ? 'bg-white dark:bg-slate-800 text-[#006A4E] dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              പ്രധാന വസ്തുതകൾ (Key Facts)
            </button>
            <button
              onClick={() => setActiveTab('memory')}
              className={`px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'memory' ? 'bg-white dark:bg-slate-800 text-[#006A4E] dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              ഓർമ്മിക്കാൻ വഴികൾ (Memory Tricks)
            </button>
            <button
              onClick={() => setActiveTab('prev')}
              className={`px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'prev' ? 'bg-white dark:bg-slate-800 text-[#006A4E] dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              പഴയ ചോദ്യങ്ങൾ (Previous Qs)
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-4 py-2 shrink-0 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'practice' ? 'bg-white dark:bg-slate-800 text-[#006A4E] dark:text-emerald-400 shadow-sm' : 'text-slate-500'
              }`}
            >
              സ്വയം പരീക്ഷ (Quiz Drill)
            </button>
          </div>

          {/* Active Tab Workspace */}
          <div className="p-5 min-h-[220px] bg-white dark:bg-slate-800 font-sans">
            
            {/* 1. Notes Tab */}
            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs md:text-sm space-y-3 whitespace-pre-wrap">
                  {noteData.detailedNotes}
                </div>
                <div className="bg-slate-50 dark:bg-slate-905 p-3 rounded-xl border border-slate-100 dark:border-slate-700 mt-4">
                  <h4 className="font-extrabold text-[#056247] dark:text-emerald-400 text-[11px] uppercase tracking-wider mb-1.5 flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1 text-[#D4AF37]" /> ക്വിക്ക് റിവിഷൻ നോട്ട് (Cheat Revision Note)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                    {noteData.revisionNotes}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Facts Tab */}
            {activeTab === 'facts' && (
              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-800 dark:text-white">പരീക്ഷക്ക് ചോദിക്കാൻ സാധ്യതയുള്ള പ്രധാന വൺ-ലൈനറുകൾ (Key Facts)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  {noteData.importantFacts.map((fact, i) => (
                    <div key={i} className="flex gap-2.5 items-start p-2.5 rounded-xl bg-orange-50/40 dark:bg-slate-900/40 border border-orange-100/40 dark:border-slate-700">
                      <span className="p-1 px-2 border bg-orange-100 text-orange-850 rounded text-[11px] font-mono font-bold leading-none">{i+1}</span>
                      <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-snug">{fact}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <h5 className="font-semibold text-xs text-slate-400 uppercase tracking-widest block mb-2">ഉദാഹരണങ്ങൾ (Examples / Analogies)</h5>
                  <ul className="list-disc pl-5 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    {noteData.examples?.map((ex, i) => (
                      <li key={i}>{ex}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* 3. Memory Tactics Tab */}
            {activeTab === 'memory' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                  <Lightbulb className="w-5 h-5 text-yellow-500 fill-yellow-400 animate-pulse" />
                  <h4 className="font-bold text-sm">ഓർമ്മിക്കാൻ എളുപ്പവഴികൾ (AI Memory Codes & Mnemonics)</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
                  തീയതികളും കഠിനമായ വിവരങ്ങളും ഹൃദിസ്ഥമാക്കാൻ അബിലിറ്റി ഐ.ടി വിഭാഗം വികസിപ്പിച്ച ലളിതമായ ഓർമ്മക്കുറിപ്പുകൾ താഴെ കാണാം.
                </p>

                <div className="space-y-3 mt-3">
                  {noteData.memoryTechniques.map((trick, i) => (
                    <div key={i} className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-950/20 border-l-4 border-l-yellow-400 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      💡 {trick}
                    </div>
                  ))}
                </div>

                {noteData.oneLiners && noteData.oneLiners.length > 0 && (
                  <div className="bg-[#006A4E]/5 p-3 rounded-lg border border-emerald-100/40 mt-4">
                    <h5 className="font-black text-xs text-[#006A4E] dark:text-emerald-400 mb-1.5 uppercase font-mono text-[10px]">വേഗത്തിൽ ഓർക്കാൻ ഒരു വരി നോട്ടുക്കൾ (One Liners)</h5>
                    <ul className="space-y-1">
                      {noteData.oneLiners.map((line, i) => (
                        <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          <ChevronRight className="w-3 h-3 text-[#D4AF37]" /> {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 4. Previous PSC Questions */}
            {activeTab === 'prev' && (
              <div className="space-y-4">
                <h4 className="font-black text-sm text-slate-800 dark:text-white">മുൻ പരീക്ഷ ചോദ്യാവലി വിശകലനം (Kerala PSC Previous Questions)</h4>
                
                <div className="space-y-3 mt-2">
                  {noteData.previousQuestions.map((pq, i) => (
                    <div key={i} className="p-3.5 rounded-xl border border-slate-105 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/30">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase font-mono">
                        <span>LDC/LGS/SI Question</span>
                        {pq.year && <span className="bg-purple-100 dark:bg-purple-950 text-purple-850 px-2 py-0.5 rounded text-purple-700 dark:text-purple-400">{pq.year}</span>}
                      </div>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm mt-1.5">
                        Q: {pq.question}
                      </h5>
                      <p className="text-xs md:text-sm text-emerald-700 dark:text-emerald-400 font-extrabold mt-2 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>ഉത്തരം (Ans): {pq.answer}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Practice Questions Tab */}
            {activeTab === 'practice' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
                  <HelpCircle className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-bold text-sm">ക്ലാസ്സ് പരീക്ഷ (Quick Topic Practice Drills)</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-normal">
                  നിങ്ങൾ പഠിച്ച വിവരങ്ങൾ ശരിയാണോ എന്ന് പരിശോധിക്കാൻ ഈ സുപ്രധാന മോഡൽ ചോദ്യങ്ങളിൽ പങ്കെടുത്തു നോക്കുക.
                </p>

                <div className="space-y-4">
                  {noteData.practiceQuestions.map((pq, i) => (
                    <div key={pq.id || i} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-200/50 dark:border-slate-700">
                      <span className="font-mono text-xs text-slate-400 font-bold block mb-1">മോഡൽ ചോദ്യം {i+1}</span>
                      <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs md:text-sm">
                        {pq.text}
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                        {pq.options.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => {
                              alert(
                                oIdx === pq.correctAnswer
                                  ? `✅ ശരിയുത്തരം! ${pq.explanation || ''}`
                                  : "❌ തെറ്റായ ഉത്തരം! വീണ്ടും ശ്രമിക്കുക."
                              );
                            }}
                            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg text-left hover:bg-[#006A4E] hover:text-white transition font-medium"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Download & Share notes simulated trigger */}
          <div className="bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 py-3 px-5 flex justify-between items-center text-xs text-slate-400 shrink-0">
            <span>Class: LDC/LPUP Coaching Companion</span>
            <button
              onClick={() => {
                alert("ക്ലാസ്സ് നോട്ട്സ് നിങ്ങളുടെ ലോക്കൽ ഡൗൺലോഡ് ഫോൾഡറിലേക്ക് PDF-ആയി സേവ് ചെയ്തു! (Simulated PDF download successfully)");
              }}
              className="font-bold text-[#006A4E] dark:text-emerald-400 hover:underline cursor-pointer"
            >
              📥 Download Notes PDF
            </button>
          </div>

        </div>
      ) : (
        <div className="py-20 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <BookOpen className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 mb-2.5" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">നോട്ട്സ് ഒന്നും തിരഞ്ഞെടുത്തിട്ടില്ല (Notebook feels empty).</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">മുകളിലുള്ള ഏതെങ്കിലും ഒരു വിഷയം തിരഞ്ഞെടുക്കുക, അല്ലെങ്കിൽ സ്വന്തമായി തിരയുക!</p>
        </div>
      )}

    </div>
  );
}
