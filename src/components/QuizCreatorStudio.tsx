import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash, 
  ArrowUp, 
  ArrowDown, 
  Share2, 
  QrCode, 
  Copy, 
  Users, 
  Loader2, 
  Check, 
  Sparkles, 
  Youtube, 
  Music, 
  FileText, 
  PenTool, 
  Layers, 
  ChevronRight, 
  Save, 
  BookOpen, 
  ExternalLink,
  ShieldAlert,
  Trophy,
  Activity,
  AlertCircle
} from 'lucide-react';
import { db, collection, addDoc, getDocs, query, where, doc, getDoc, updateDoc, deleteDoc } from '../lib/firebase';
import { CreatorQuiz, SharedQuizAttempt, Student } from '../types';

interface QuizCreatorStudioProps {
  currentStudent: Student | null;
  onStudentUpdate: (updatedStudent: Student) => void;
}

export default function QuizCreatorStudio({ currentStudent }: QuizCreatorStudioProps) {
  // Input fields for creator
  const [sourceType, setSourceType] = useState<'youtube' | 'audio' | 'pdf' | 'topic' | 'notes'>('topic');
  const [inputText, setInputText] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [questionType, setQuestionType] = useState<'mcq' | 'boolean' | 'fill' | 'mixed'>('mcq');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [language, setLanguage] = useState<'ml' | 'en'>('ml');
  const [isCertificateEnabled, setIsCertificateEnabled] = useState(true);

  // Statuses
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'my-quizzes' | 'dashboard'>('create');
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Generated / edited quiz structure in memory
  const [editingQuiz, setEditingQuiz] = useState<CreatorQuiz | null>(null);

  // Creator's published quizzes from Firestore
  const [publishedQuizzes, setPublishedQuizzes] = useState<CreatorQuiz[]>([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Selected Quiz Dashboard (Analytics)
  const [selectedDashboardQuiz, setSelectedDashboardQuiz] = useState<CreatorQuiz | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<SharedQuizAttempt[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // Sharing states
  const [showShareModal, setShowShareModal] = useState<string | null>(null); // holds quizId

  // Load creator's published quizzes
  const fetchCreatorQuizzes = async () => {
    if (!currentStudent) return;
    setLoadingQuizzes(true);
    try {
      const q = query(
        collection(db, 'quizzes'),
        where('creatorId', '==', currentStudent.id)
      );
      const querySnapshot = await getDocs(q);
      const quizzesList: CreatorQuiz[] = [];
      querySnapshot.forEach((docSnap) => {
        quizzesList.push({ id: docSnap.id, ...docSnap.data() } as CreatorQuiz);
      });
      // Sort manually by date
      quizzesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setPublishedQuizzes(quizzesList);
    } catch (err) {
      console.error("Error loading quizzes from Firestore:", err);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my-quizzes') {
      fetchCreatorQuizzes();
    }
  }, [activeTab, currentStudent]);

  // Loading analytics for selected quiz
  const handleViewAnalytics = async (quiz: CreatorQuiz) => {
    setSelectedDashboardQuiz(quiz);
    setLoadingAttempts(true);
    setActiveTab('dashboard');
    try {
      const q = query(
        collection(db, 'quiz_attempts'),
        where('quizId', '==', quiz.id)
      );
      const querySnapshot = await getDocs(q);
      const attemptsList: SharedQuizAttempt[] = [];
      querySnapshot.forEach((docSnap) => {
        attemptsList.push({ id: docSnap.id, ...docSnap.data() } as SharedQuizAttempt);
      });
      // Sort by score (descending) and timeSpent (ascending) to generate rank list
      attemptsList.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeSpentSeconds - b.timeSpentSeconds;
      });
      setQuizAttempts(attemptsList);
    } catch (err) {
      console.error("Error fetching attempts:", err);
    } finally {
      setLoadingAttempts(false);
    }
  };

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  // AI Generation trigger using custom endpoint
  const handleGenerateAIQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) {
      showToast("ദയവായി കുറച്ചു വിവരങ്ങൾ ടൈപ്പ് ചെയ്യുകയോ ലിങ്ക് നൽകുകയോ ചെയ്യുക", "error");
      return;
    }

    setIsGenerating(true);
    setEditingQuiz(null);

    try {
      const res = await fetch('/api/shared-quiz-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceType,
          inputText: inputText.trim(),
          quizTitle: quizTitle.trim() || `സ്മാർട്ട് ക്വിസ് (${sourceType.toUpperCase()})`,
          quizDescription: quizDescription.trim(),
          questionCount,
          questionType,
          difficulty,
          language
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEditingQuiz({
          id: '',
          title: data.title || quizTitle.trim() || 'സ്മാർട്ട് എക്സാം',
          description: data.description || quizDescription.trim() || 'ഈ വിഷയത്തെക്കുറിച്ചുള്ള ഒരു മാതൃകാ പരീക്ഷ.',
          creatorId: currentStudent?.id || 'guest',
          creatorName: currentStudent?.name || 'അതിഥി',
          createdAt: new Date().toISOString(),
          language,
          difficulty,
          questionCount: data.questions?.length || questionCount,
          questionType,
          questions: data.questions || [],
          isCertificateEnabled
        });
        showToast("AI ചോദ്യപേപ്പർ വിജയകരമായി തയ്യാറാക്കിയിട്ടുണ്ട്! പരിശോധിച്ചു മാറ്റങ്ങൾ വരുത്താം.");
      } else {
        throw new Error("API call returned error status");
      }
    } catch (err) {
      console.error("Quiz generation failed:", err);
      showToast("AI ക്വിസ് നിർമ്മിക്കുന്നതിൽ തടസ്സം നേരിട്ടു. സാരമില്ല, ഓഫ്‌ലൈൻ രീതിയിൽ ഞങ്ങൾ ഡെമോ ചോദ്യപേപ്പർ നിർമ്മിച്ചു നൽകുന്നു.");
      // Fallback local mock quiz configuration
      setEditingQuiz({
        id: '',
        title: quizTitle.trim() || `കേരള ഹിസ്റ്ററി ക്രാഷ് ടെസ്റ്റ് (${difficulty.toUpperCase()})`,
        description: quizDescription.trim() || 'മാതൃകാ സിവിൽ സർവീസ് ടെസ്റ്റ്',
        creatorId: currentStudent?.id || 'guest',
        creatorName: currentStudent?.name || 'അതിഥി',
        createdAt: new Date().toISOString(),
        language,
        difficulty,
        questionCount,
        questionType,
        questions: Array.from({ length: Math.min(questionCount, 5) }).map((_, i) => ({
          id: `fallback-q-${i}`,
          text: `${i + 1}. കേരളത്തിലെ ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടി ഏത്?`,
          options: ["ആനമുടി (Anamudi)", "മീശപ്പുലിമല", "ചെമ്പ്ര കൊടുമുടി", "അഗസ്ത്യകൂടം"],
          correctAnswer: 0,
          explanation: "പശ്ചിമഘട്ടത്തിലെയും ദക്ഷിണേന്ത്യയിലെയും ഏറ്റവും ഉയരം കൂടിയ കൊടുമുടിയാണ് ആനമുടി (ഉയരം: 2695 മീറ്റർ)."
        })),
        isCertificateEnabled
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // EDITOR OPERATIONS
  const handleUpdateQuestion = (qIndex: number, field: string, value: any) => {
    if (!editingQuiz) return;
    const updatedQs = [...editingQuiz.questions];
    updatedQs[qIndex] = {
      ...updatedQs[qIndex],
      [field]: value
    };
    setEditingQuiz({
      ...editingQuiz,
      questions: updatedQs
    });
  };

  const handleUpdateOption = (qIndex: number, optIndex: number, value: string) => {
    if (!editingQuiz) return;
    const updatedQs = [...editingQuiz.questions];
    const updatedOpts = [...updatedQs[qIndex].options];
    updatedOpts[optIndex] = value;
    updatedQs[qIndex] = {
      ...updatedQs[qIndex],
      options: updatedOpts
    };
    setEditingQuiz({
      ...editingQuiz,
      questions: updatedQs
    });
  };

  const handleAddQuestion = () => {
    if (!editingQuiz) return;
    const newQuestion = {
      id: `custom-${Date.now()}-${editingQuiz.questions.length}`,
      text: 'പുതിയ ചോദ്യം?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: 0,
      explanation: 'വിശദീകരണം ഇവിടെ ടൈപ്പ് ചെയ്യുക...'
    };
    setEditingQuiz({
      ...editingQuiz,
      questions: [...editingQuiz.questions, newQuestion],
      questionCount: editingQuiz.questionCount + 1
    });
  };

  const handleDeleteQuestion = (index: number) => {
    if (!editingQuiz) return;
    const updatedQs = editingQuiz.questions.filter((_, i) => i !== index);
    setEditingQuiz({
      ...editingQuiz,
      questions: updatedQs,
      questionCount: updatedQs.length
    });
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (!editingQuiz) return;
    const updatedQs = [...editingQuiz.questions];
    if (direction === 'up' && index > 0) {
      const temp = updatedQs[index];
      updatedQs[index] = updatedQs[index - 1];
      updatedQs[index - 1] = temp;
    } else if (direction === 'down' && index < updatedQs.length - 1) {
      const temp = updatedQs[index];
      updatedQs[index] = updatedQs[index + 1];
      updatedQs[index + 1] = temp;
    }
    setEditingQuiz({
      ...editingQuiz,
      questions: updatedQs
    });
  };

  // Publish to Firestore
  const handlePublishQuiz = async (showSharingModalAfterSave: boolean) => {
    if (!editingQuiz) return;
    if (editingQuiz.questions.length === 0) {
      showToast("പ്രസിദ്ധീകരിക്കുന്നതിന് മുൻപായി കുറഞ്ഞത് ഒരു ചോദ്യമെങ്കിലും വേണം", "error");
      return;
    }

    setIsSaving(true);
    try {
      const quizPayload = {
        title: editingQuiz.title,
        description: editingQuiz.description || '',
        creatorId: editingQuiz.creatorId,
        creatorName: editingQuiz.creatorName,
        createdAt: new Date().toISOString(),
        language: editingQuiz.language,
        difficulty: editingQuiz.difficulty,
        questionCount: editingQuiz.questions.length,
        questionType: editingQuiz.questionType,
        questions: editingQuiz.questions,
        isCertificateEnabled: editingQuiz.isCertificateEnabled,
        participantCount: 0
      };

      const docRef = await addDoc(collection(db, 'quizzes'), quizPayload);
      showToast("🎉 അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ പരീക്ഷ വിജയകരമായി റെക്കോർഡ് ചെയ്തു!");
      
      // Update local quizzes
      setEditingQuiz(null);
      if (showSharingModalAfterSave) {
        // Open share modal
        setShowShareModal(docRef.id);
      }
      setActiveTab('my-quizzes');
    } catch (err) {
      console.error("Firestore Publish Error:", err);
      showToast("ഫയർസ്റ്റോറിലേക്ക് വിവരങ്ങൾ രേഖപ്പെടുത്താൻ കഴിഞ്ഞില്ല.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete published quiz from Firestore completely (for teachers/creators)
  const handleDeleteQuizFromDb = async (quizId: string) => {
    if (!confirm("നിങ്ങൾ തയ്യാറാക്കിയ ഈ ക്വിസ് എന്നെന്നേക്കുമായി ഡിലീറ്റ് ചെയ്യണോ?")) return;
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
      showToast("ക്വിസ് വിജയകരമായി ഡിലീറ്റ് ചെയ്തു.");
      fetchCreatorQuizzes();
    } catch (err) {
      console.error("Error deleting quiz from DB:", err);
      showToast("ഡിലീറ്റ് ചെയ്യാൻ കഴിഞ്ഞില്ല.", "error");
    }
  };

  // Sharing links generators
  const getQuizShareLink = (quizId: string) => {
    const host = window.location.host;
    if (host.includes('localhost') || host.includes('run.app') || host.includes('aistudio.google')) {
      return `${window.location.origin}/quiz/${quizId}`;
    }
    return `https://abilitypscacademy.com/quiz/${quizId}`;
  };

  const copyShareLink = (quizId: string) => {
    const link = getQuizShareLink(quizId);
    navigator.clipboard.writeText(link);
    showToast("ലിങ്ക് ക്ലിപ്പ്ബോർഡിലേക്ക് കോപ്പി ചെയ്തു!");
  };

  const shareViaWhatsApp = (quizId: string, title: string) => {
    const url = encodeURIComponent(getQuizShareLink(quizId));
    const text = encodeURIComponent(`💡 *Ability PSC Shared Quiz: ${title}* \nഹലോ കൂട്ടുകാരെ, ഈ വിഷയത്തെക്കുറിച്ചുള്ള പുതിയ പരീക്ഷ എഴുതി പരിശീലിക്കൂ! റെജിസ്ട്രേഷൻ ആവശ്യമില്ല. \n👉 പരീക്ഷാ ലിങ്ക്: `);
    window.open(`https://api.whatsapp.com/send?text=${text}${url}`, '_blank');
  };

  const shareViaTelegram = (quizId: string, title: string) => {
    const url = encodeURIComponent(getQuizShareLink(quizId));
    const text = encodeURIComponent(`Ability PSC Shared Quiz: ${title}\nഅക്കൗണ്ട് ഇല്ലാതെ തന്നെ പരീക്ഷ എഴുതി സർട്ടിഫിക്കറ്റ് സ്വന്തമാക്കാം 🏆\n👉 ലിങ്ക്: `);
    window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
  };

  const handleShareQuizUltimate = (quizId: string, title: string) => {
    // 1. Copy Link automatically
    const link = getQuizShareLink(quizId);
    try {
      navigator.clipboard.writeText(link);
      showToast("🎉 ലിങ്ക് കോപ്പി ചെയ്തു! (Link Copied Automatically)");
    } catch (e) {
      console.error("Copy failed", e);
    }

    // 2. Open WhatsApp Share option
    shareViaWhatsApp(quizId, title);

    // 3. Open Telegram Share option (delayed slightly to bypass popup blockers)
    setTimeout(() => {
      shareViaTelegram(quizId, title);
    }, 450);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6 max-w-7xl mx-auto">
      
      {/* Toast Alert popups */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3.5 rounded-xl border text-xs md:text-sm shadow-xl font-bold font-sans transition-all animate-slide-up ${
          toastMsg.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-250 text-emerald-800 dark:text-emerald-200' : 'bg-red-50 dark:bg-red-950 border-red-250 text-red-800 dark:text-red-200'
        }`}>
          {toastMsg.type === 'success' ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 dark:border-slate-700 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
            <PenTool className="w-6 h-6 text-[#006A4E] shrink-0" />
            <h2 className="text-xl font-black font-sans tracking-tight">നിർമ്മിതി സ്റ്റുഡിയോ (Quiz Creator Studio)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-2xl leading-relaxed">
            യൂട്യൂബ് വീഡിയോകൾ, ഓഡിയോ ഫയലുകൾ, പിഡിഎഫുകൾ അല്ലെങ്കിൽ ഏതെങ്കിലും സിലബസ് വിവരങ്ങൾ നൽകി അത്യാധുനിക ക്വിസുകൾ നിർമ്മിച്ച് കൂട്ടുകാരുമായി പങ്കുവെക്കുക (Share)! 
          </p>
        </div>

        {/* Studio Sub-Navigation */}
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => { setActiveTab('create'); setEditingQuiz(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'create'
                ? 'bg-[#006A4E] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            🆕 ക്വിസ് നിർമ്മിക്കാം
          </button>
          <button
            onClick={() => setActiveTab('my-quizzes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeTab === 'my-quizzes'
                ? 'bg-[#006A4E] text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200'
            }`}
          >
            📂 എൻ്റെ ലിസ്റ്റുകൾ
          </button>
          {selectedDashboardQuiz && (
            <button
              onClick={() => handleViewAnalytics(selectedDashboardQuiz)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === 'dashboard'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-650'
              }`}
            >
              📊 ഫലങ്ങൾ (Analytics)
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: CREATE PORTFOLIO FORM */}
      {activeTab === 'create' && !editingQuiz && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Form control side */}
          <form onSubmit={handleGenerateAIQuiz} className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 border border-slate-150 p-6 rounded-2xl space-y-5 text-xs">
            <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                <span>AI സിലബസ് തിരഞ്ഞെടുപ്പ് (Select Input Mode)</span>
              </h3>
            </div>

            {/* Source modes selector */}
            <div className="grid grid-cols-5 gap-1 select-none">
              <button
                type="button"
                onClick={() => { setSourceType('topic'); setInputText(''); }}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  sourceType === 'topic'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span className="text-[10px] font-black">വിഷയം (Topic)</span>
              </button>

              <button
                type="button"
                onClick={() => { setSourceType('notes'); setInputText(''); }}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  sourceType === 'notes'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span className="text-[10px] font-black">കുറിപ്പ് (Text notes)</span>
              </button>

              <button
                type="button"
                onClick={() => { setSourceType('youtube'); setInputText('https://www.youtube.com/watch?v=0hW64O7Z2E8'); }}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  sourceType === 'youtube'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                }`}
              >
                <Youtube className="w-4 h-4 text-red-500" />
                <span className="text-[10px] font-black">യൂട്യൂബ് (YouTube)</span>
              </button>

              <button
                type="button"
                onClick={() => { setSourceType('audio'); setInputText('audio_class_june_12.mp3'); }}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  sourceType === 'audio'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                }`}
              >
                <Music className="w-4 h-4 text-blue-500" />
                <span className="text-[10px] font-black">ഓഡിയോ (Audio)</span>
              </button>

              <button
                type="button"
                onClick={() => { setSourceType('pdf'); setInputText('syllabus_kerala_psc_lgs.pdf'); }}
                className={`py-3.5 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  sourceType === 'pdf'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-350 dark:border-slate-700'
                }`}
              >
                <Layers className="w-4 h-4 text-orange-500" />
                <span className="text-[10px] font-black">പി.ഡി.എഫ് (PDF)</span>
              </button>
            </div>

            {/* Input detail box */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400 mb-2">
                {sourceType === 'youtube' && "യൂട്യൂബ് ലിങ്ക് നൽകുക (YouTube URL)"}
                {sourceType === 'topic' && "ഗ്രൂപ്പ് ടോപ്പിക് ടൈപ്പ് ചെയ്യുക (E.g., കറന്റ് അഫയേഴ്‌സ്, ഇന്ത്യൻ റെയിൽവേ)"}
                {sourceType === 'notes' && "നിങ്ങളുടെ സ്വന്തം സിലബസ് തിയറി ഇവിടെ പേസ്റ്റ് ചെയ്യുക (Syllabus Draft)"}
                {sourceType === 'audio' && "ഓഡിയോ ക്ലാസ് വിവരണം (അല്ലെങ്കിൽ ഫയലിൻ്റെ പേര്)"}
                {sourceType === 'pdf' && "കുറിപ്പുകളുള്ള PDF ഉള്ളടക്കം അല്ലെങ്കിൽ പേര്"}
              </label>
              <textarea
                required
                rows={sourceType === 'notes' ? 6 : 3}
                placeholder={
                  sourceType === 'youtube' ? "E.g., https://www.youtube.com/watch?v=0hW64O7Z2E8" :
                  sourceType === 'topic' ? "E.g., ശാസ്ത്രവും സാങ്കേതിക വിദ്യയും ഇന്ത്യയിൽ..." :
                  sourceType === 'notes' ? "പഠന ഗൈഡിൽ നിന്നോ പത്രങ്ങളിൽ നിന്നോ ഉള്ള വിവരങ്ങൾ ഇവിടെ പേസ്റ്റ് ചെയ്യുക..." :
                  "സിലബസ് ഫയൽ സംഗ്രഹം..."
                }
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-250 dark:border-slate-650 bg-white dark:bg-slate-850 dark:text-white font-sans text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Title & Description shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">ക്വിസ് തലക്കെട്ട് (Change Quiz Title)</label>
                <input
                  type="text"
                  placeholder="ലളിതമായ ക്ലാസ്സ് ടൈറ്റിൽ നൽകുക"
                  value={quizTitle}
                  onChange={e => setQuizTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-850 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">വിവരണം (Add Quiz Description)</label>
                <input
                  type="text"
                  placeholder="ക്വിസിനെക്കുറിച്ച് ഒരു വരി"
                  value={quizDescription}
                  onChange={e => setQuizDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-850 dark:text-white"
                />
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {/* Question Count */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">ചോദ്യങ്ങൾ (Count)</label>
                <select
                  value={questionCount}
                  onChange={e => setQuestionCount(Number(e.target.value))}
                  className="w-full px-2 py-2 border bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 rounded-xl"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={30}>30 Questions</option>
                  <option value={50}>50 Questions</option>
                  <option value={100}>100 Questions</option>
                </select>
              </div>

              {/* Question Type */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">ചോദ്യ രൂപം (Type)</label>
                <select
                  value={questionType}
                  onChange={e => setQuestionType(e.target.value as any)}
                  className="w-full px-2 py-2 border bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 rounded-xl"
                >
                  <option value="mcq">MCQs (4 Options)</option>
                  <option value="boolean">True or False</option>
                  <option value="fill">Fill in the Blanks</option>
                  <option value="mixed">Mixed (എല്ലാം കലർന്നത്)</option>
                </select>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">കാഠിന്യം (Difficulty)</label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as any)}
                  className="w-full px-2 py-2 border bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 rounded-xl"
                >
                  <option value="easy">Easy (ലളിതം)</option>
                  <option value="medium">Medium (സാധാരണ)</option>
                  <option value="hard">Hard (കഠിനം)</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 mb-1.5">ഭാഷ (Language)</label>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as any)}
                  className="w-full px-2 py-2 border bg-white dark:bg-slate-850 dark:border-slate-700 dark:text-slate-200 rounded-xl"
                >
                  <option value="ml">Malayalam (മലയാളം)</option>
                  <option value="en">English (ഇംഗ്ലീഷ്)</option>
                </select>
              </div>
            </div>

            {/* Certificate toggle */}
            <div className="flex items-center gap-2 p-3 bg-emerald-50/40 dark:bg-slate-850 border border-emerald-100 dark:border-slate-700 rounded-xl select-none">
              <input
                id="cert-toggle"
                type="checkbox"
                checked={isCertificateEnabled}
                onChange={e => setIsCertificateEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 rounded border-slate-305"
              />
              <label htmlFor="cert-toggle" className="font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                വിജയികൾക്ക് ഓട്ടോമാറ്റിക് പങ്കാളിത്ത സർട്ടിഫിക്കറ്റ് നൽകുക (Generate Certificate on passing score)
              </label>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2 text-xs md:text-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
                  <span>AI ചോദ്യങ്ങൾ തയ്യാറാക്കുന്നു, ഇതൊരു നിമിഷമെടുക്കും...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-yellow-200" />
                  <span>AI കൊണ്ട് പരീക്ഷാ പാക്കേജ് നിർമ്മിക്കുക</span>
                </>
              )}
            </button>
          </form>

          {/* Guidelines info card side */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-emerald-50/30 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 p-5 rounded-2xl">
              <h4 className="text-xs font-black text-[#006A4E] dark:text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-emerald-100/30">
                💡
                <span>നിർമ്മിക്കുന്നത് വളരെ എളുപ്പമാണ്!</span>
              </h4>
              <ul className="space-y-3.5 mt-4 text-slate-600 dark:text-slate-350 text-xs leading-normal">
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">1.</span>
                  <span><strong>വിഷയ വിവരങ്ങൾ നൽകുക:</strong> പത്രങ്ങളിലോ പുസ്തകങ്ങളിലോ ഉള്ള ഏതു ഭാഗവും കോപ്പി ചെയ്തു നൽകാം. AI ചോദ്യപേപ്പർ രൂപപ്പെടുത്തും.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">2.</span>
                  <span><strong>കസ്റ്റം എഡിറ്റർ സൗകര്യം:</strong> ക്വിസ് പബ്ലിഷ് ചെയ്യും മുൻപ് ചോദ്യങ്ങൾ കൂട്ടിച്ചേർക്കാനും, തെറ്റു തിരുത്താനും ക്രമം ക്രമീകരിക്കാനും എഡിറ്റർ സഹായിക്കുന്നു.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">3.</span>
                  <span><strong>ഷെയർ ചെയ്യാൻ റിയൽ ടൈം ലിങ്കുകൾ:</strong> പ്രസിദ്ധീകരിച്ചു കഴിഞ്ഞാൽ ലഭിക്കുന്ന ലിങ്ക് വാട്സാപ്പിൽ നേരെ കൂട്ടുകാർക്ക് അയച്ചു നൽകാം. ക്ലൗഡ് പവർഡ് ആയതുകൊണ്ട് വിവരങ്ങൾ നഷ്ടപ്പെടില്ല.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-600 font-bold shrink-0">4.</span>
                  <span><strong>ഭിന്നശേഷി അനുയോജ്യ മാതൃക:</strong> ഞങ്ങളുടെ മൗനസിന്തസൈസറും സിസ്റ്റം റീഡറും എല്ലാ ചോദ്യങ്ങളേയും അപ്പപ്പോൾ ശബ്ദരൂപത്തിലാക്കി ഭിന്നശേഷി സുഹൃത്തുക്കളെ സഹായിക്കും.</span>
                </li>
              </ul>
            </div>

            {/* Short quick promo badge statistics */}
            <div className="bg-slate-50 dark:bg-slate-900 border p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/40 rounded-xl text-yellow-600">
                <Trophy className="w-6 h-6 animate-pulse" />
              </div>
              <div className="text-xs">
                <b className="block text-slate-800 dark:text-white">സർട്ടിഫിക്കേഷൻ ബാഡ്ജുകൾ</b>
                <span className="text-slate-550 leading-relaxed text-[11px]">തയ്യാറാക്കുന്ന ക്വിസുകൾ വിജയകരമായി പൂർത്തിയാക്കുന്ന എല്ലാ സുഹൃത്തുക്കൾക്കും അക്കാദമിയിൽ നിന്നുള്ള ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റ് ലഭിക്കുന്നതാണ്.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* FEATURE 2: CUSTOM QUIZ EDITOR (Visible when editingQuiz state is present) */}
      {editingQuiz && (
        <div className="space-y-6">
          <div className="bg-amber-50/50 dark:bg-amber-955/20 border border-amber-100 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-250">
              <PenTool className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="font-bold">ക്വിസ് എഡിറ്റർ തുറന്നിരിക്കുന്നു (Preview & Custom Quiz Editor)</h4>
                <p className="mt-0.5">താഴെ നൽകിയിരിക്കുന്ന വിവരങ്ങൾ പരിശോധിച്ച് പ്രസിദ്ധീകരിക്കാം (Publish). നിങ്ങൾക്ക് വേണമെങ്കിൽ ചോദ്യങ്ങൾ കൂട്ടുകയോ കുറയ്ക്കുകയോ ചെയ്യാം.</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setEditingQuiz(null)}
                className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-3 py-2 font-bold text-slate-700 dark:text-white rounded-xl text-xs transition"
              >
                റദ്ദാക്കുക (Cancel)
              </button>
              <button
                onClick={() => handlePublishQuiz(false)}
                disabled={isSaving}
                className="bg-slate-600 hover:bg-slate-705 px-3 py-2 font-bold text-white rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                title="Save without sharing modal"
              >
                <Save className="w-3.5 h-3.5" />
                <span>സേവ് ചെയ്യുക (Save Quiz)</span>
              </button>
              <button
                onClick={() => handlePublishQuiz(true)}
                disabled={isSaving}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:opacity-95 px-3 py-2 font-black text-white rounded-xl text-xs flex items-center gap-1.5 transition shadow"
                title="Publish and pop sharing modal"
              >
                <Check className="w-3.5 h-3.5" />
                <span>പബ്ലിഷ് ചെയ്യാം (Publish Quiz)</span>
              </button>
              <button
                onClick={() => handlePublishQuiz(true)}
                disabled={isSaving}
                className="bg-[#006A4E] hover:bg-emerald-850 px-3 py-2 font-black text-white rounded-xl text-xs flex items-center gap-1.5 transition shadow-md"
                title="Publish and open online share options"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>ഷെയർ പരീക്ഷ (Share Quiz)</span>
              </button>
            </div>
          </div>

          {/* Editable Header information */}
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border space-y-4">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b pb-1">ക്വിസ് ക്യാരക്ടർ (Metadata)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">ക്വിസ് ടൈറ്റിൽ (Quiz Title)</label>
                <input
                  type="text"
                  value={editingQuiz.title}
                  onChange={e => setEditingQuiz({ ...editingQuiz, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-850 dark:text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">വിവരണം/സിലബസ് (Quiz Description)</label>
                <input
                  type="text"
                  value={editingQuiz.description}
                  onChange={e => setEditingQuiz({ ...editingQuiz, description: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border bg-white dark:bg-slate-850 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Questions Editor blocks */}
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>ചോദ്യങ്ങൾ ക്രമീകരിക്കാം ({editingQuiz.questions.length})</span>
              </h3>
              <button
                onClick={handleAddQuestion}
                className="bg-[#006A4E] hover:bg-emerald-800 text-white font-extrabold px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>പുതിയ ചോദ്യം ചേർക്കാൻ</span>
              </button>
            </div>

            {editingQuiz.questions.map((q, idx) => (
              <div 
                key={q.id || idx} 
                className="bg-white dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-150 relative space-y-4 hover:shadow-sm transition"
              >
                {/* Question index controls */}
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-[#006A4E] dark:bg-emerald-950 dark:text-teal-400 px-2 py-0.5 rounded uppercase tracking-wider">
                    Question #{idx + 1}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 px-1.5 rounded border bg-slate-50 hover:bg-slate-100 disabled:opacity-30 dark:bg-slate-800 dark:border-slate-705 dark:text-white text-[10px]"
                      title="Move Question Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(idx, 'down')}
                      disabled={idx === editingQuiz.questions.length - 1}
                      className="p-1 px-1.5 rounded border bg-slate-50 hover:bg-slate-100 disabled:opacity-30 dark:bg-slate-800 dark:border-slate-705 dark:text-white text-[10px]"
                      title="Move Question Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteQuestion(idx)}
                      className="p-1 px-2 rounded border border-red-250 bg-red-50 hover:bg-red-100 text-red-700 text-[10px] flex items-center gap-1 font-bold"
                      title="Delete Question"
                    >
                      <Trash className="w-3.5 h-3.5" />
                      <span>ഇല്ലാതാക്കുക</span>
                    </button>
                  </div>
                </div>

                {/* Edit Question description */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">ചോദ്യം (Question Text)</label>
                    <input
                      type="text"
                      value={q.text}
                      onChange={e => handleUpdateQuestion(idx, 'text', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border bg-white dark:bg-slate-850 dark:text-yellow-100 text-xs md:text-sm font-semibold"
                    />
                  </div>

                  {/* Options (maximum 4) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-1">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex gap-1.5 items-center">
                        <span className="font-mono font-bold text-slate-400 text-xs">{['A', 'B', 'C', 'D'][optIdx]}.</span>
                        <input
                          type="text"
                          value={opt}
                          onChange={e => handleUpdateOption(idx, optIdx, e.target.value)}
                          className="flex-1 px-3 py-1.5 border rounded-lg bg-slate-50 dark:bg-slate-850 dark:text-white text-xs font-semibold"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Correct option index & explanations */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t pt-3">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-slate-550 mb-1.5">ശരിയായ ഓപ്ഷൻ (Correct answer)</label>
                      <select
                        value={q.correctAnswer}
                        onChange={e => handleUpdateQuestion(idx, 'correctAnswer', Number(e.target.value))}
                        className="w-full p-2 border rounded-xl bg-slate-50 dark:bg-slate-850 font-bold text-emerald-700"
                      >
                        <option value={0}>Option A</option>
                        <option value={1}>Option B</option>
                        {q.options.length > 2 && <option value={2}>Option C</option>}
                        {q.options.length > 3 && <option value={3}>Option D</option>}
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-black uppercase text-slate-550 mb-1.5">വിശദീകരണം (Explanation)</label>
                      <input
                        type="text"
                        value={q.explanation || ''}
                        onChange={e => handleUpdateQuestion(idx, 'explanation', e.target.value)}
                        className="w-full p-2 border rounded-xl bg-slate-50 dark:bg-slate-850 text-xs text-slate-650"
                        placeholder="ഈ ശരിയുത്തരത്തിനുള്ള കാരണം എന്താണെന്ന് ടൈപ്പ് ചെയ്യുക..."
                      />
                    </div>
                  </div>

                </div>

              </div>
            ))}
          </div>

          {/* Editor footer actions */}
          <div className="flex flex-wrap justify-end gap-3 border-t pt-5 select-none">
            <button
              onClick={() => setEditingQuiz(null)}
              className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 px-6 py-3 font-bold text-slate-700 dark:text-white rounded-xl text-xs uppercase"
            >
              റദ്ദാക്കുക (Cancel)
            </button>
            <button
              onClick={() => handlePublishQuiz(false)}
              disabled={isSaving}
              className="bg-slate-600 hover:bg-slate-700 text-white px-6 py-3 font-bold rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>സേവ് ചെയ്യുക (Save Quiz)</span>
            </button>
            <button
              onClick={() => handlePublishQuiz(true)}
              disabled={isSaving}
              className="bg-gradient-to-r from-indigo-600 to-indigo-750 text-white hover:opacity-95 px-6 py-3 font-extrabold rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>പബ്ലിഷ് ചെയ്യുക (Publish Quiz)</span>
            </button>
            <button
              onClick={() => handlePublishQuiz(true)}
              disabled={isSaving}
              className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 px-6 py-3 font-extrabold rounded-xl text-xs uppercase flex items-center gap-1.5 shadow-md"
            >
              <Share2 className="w-4 h-4" />
              <span>ഷെയർ ചെയ്യാം (Share Quiz)</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: MY CREATED QUIZZES LIST */}
      {activeTab === 'my-quizzes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-2 border-b">
            <h3 className="text-sm font-black text-slate-850 dark:text-white flex items-center gap-1.5">
              <span>ഞാൻ മുൻപ് പ്രസിദ്ധീകരിച്ച പരീക്ഷകൾ ({publishedQuizzes.length})</span>
            </h3>
            <button
              onClick={fetchCreatorQuizzes}
              className="p-2 bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-xl transition"
              title="Refresh Quizzes List"
            >
              <Users className="w-4 h-4" />
            </button>
          </div>

          {loadingQuizzes ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto mb-3" />
              <p className="text-xs text-slate-500">നിങ്ങളുടെ ക്വിസ് വിവരങ്ങൾ ഫയർസ്റ്റോറിൽ നിന്നും ശേഖരിക്കുന്നു...</p>
            </div>
          ) : publishedQuizzes.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 border border-dashed rounded-2xl p-6">
              <pen-tool className="w-12 h-12 stroke-1 text-slate-400 mx-auto mb-3 block" />
              <p className="text-xs font-bold text-slate-500">നിങ്ങൾ ഇതുവരെ സ്വന്തമായി പരീക്ഷകൾ ഒന്നും പ്രസിദ്ധീകരിച്ചിട്ടില്ല.</p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-3 text-xs bg-emerald-600 text-white font-extrabold px-4 py-2 rounded-xl hover:opacity-90 shadow"
              >
                പുതിയ പരീക്ഷ തയ്യാറാക്കാൻ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedQuizzes.map((quiz) => {
                const shareLink = getQuizShareLink(quiz.id);
                return (
                  <div 
                    key={quiz.id}
                    className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-150 flex flex-col justify-between hover:shadow-md transition"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[9px] bg-emerald-100/60 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold px-1.5 py-0.5 rounded uppercase font-mono tracking-wider">
                          {quiz.difficulty} • {quiz.language === 'ml' ? 'Malayalam' : 'English'}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                          {new Date(quiz.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h4 className="text-sm font-black text-slate-850 dark:text-white font-sans leading-snug line-clamp-2">
                        {quiz.title}
                      </h4>
                      {quiz.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {quiz.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-2 mt-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 font-sans">
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-xl text-center">
                          <span className="block text-slate-400">ചോദ്യങ്ങൾ</span>
                          <span className="text-xs font-black text-slate-880 dark:text-white mt-0.5 block">{quiz.questionCount} Nos</span>
                        </div>
                        <div className="bg-white dark:bg-slate-310 p-2 rounded-xl text-center">
                          <span className="block text-slate-400">പങ്കെടുത്തവർ</span>
                          <span className="text-xs font-black text-[#006A4E] dark:text-teal-400 mt-0.5 block">{quiz.participantCount || 0} Students</span>
                        </div>
                      </div>
                    </div>

                    {/* Quiz action shortcuts */}
                    <div className="mt-4 space-y-3 select-none">
                      {/* Copy Link URL input box */}
                      <div className="bg-slate-100 dark:bg-slate-950 p-1 px-2 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-[10px] gap-1.5">
                        <span className="truncate text-slate-500 font-mono select-all font-semibold py-1">{shareLink}</span>
                        <button
                          onClick={() => copyShareLink(quiz.id)}
                          className="bg-slate-205 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 p-1.5 rounded-lg text-slate-700 dark:text-white"
                          title="Copy Link to Clipboard"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewAnalytics(quiz)}
                          className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-750 text-white font-extrabold rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 shadow-sm transition"
                        >
                          <Activity className="w-3.5 h-3.5" />
                          <span>അനലിറ്റിക്സ് (Results)</span>
                        </button>
                        <button
                          onClick={() => setShowShareModal(quiz.id)}
                          className="flex-1 py-1.5 bg-[#006A4E] hover:bg-emerald-800 text-white font-extrabold rounded-xl text-[10px] uppercase flex items-center justify-center gap-1 shadow-sm transition"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>ഷെയർ (Share)</span>
                        </button>
                      </div>

                      <div className="flex gap-1.5 pt-1.5 justify-between items-center text-[10px] border-t border-slate-100 dark:border-slate-800">
                        {/* Quick share options icons */}
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => shareViaWhatsApp(quiz.id, quiz.title)}
                            className="p-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-600"
                            title="Share on WhatsApp"
                          >
                            <span>💬</span>
                          </button>
                          <button
                            onClick={() => shareViaTelegram(quiz.id, quiz.title)}
                            className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600"
                            title="Share on Telegram"
                          >
                            <span>✈</span>
                          </button>
                          <a
                            href={shareLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-250 text-slate-650 dark:text-slate-350"
                            title="Open Quiz Window"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                        <button
                          onClick={() => handleDeleteQuizFromDb(quiz.id)}
                          className="text-red-500 hover:text-red-700 font-bold text-[10px] px-2 py-1 flex items-center gap-1 select-none"
                          title="Delete Quiz"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          <span>ഡിലീറ്റ്</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: QUIZ RESULTS / ANALYTICS RANK LIST PANEL */}
      {activeTab === 'dashboard' && selectedDashboardQuiz && (
        <div className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-900 border p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                Rank and Progress Analytics
              </span>
              <h3 className="text-base font-black text-slate-850 dark:text-white mt-1.5 font-sans leading-none">
                {selectedDashboardQuiz.title}
              </h3>
              {selectedDashboardQuiz.description && (
                <p className="text-xs text-slate-500 mt-1">{selectedDashboardQuiz.description}</p>
              )}
            </div>
            <button
              onClick={() => setActiveTab('my-quizzes')}
              className="bg-[#006A4E] hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs block"
            >
              തയ്യാറാക്കിയ ഫയലുകളിലേക്ക് മടങ്ങാം
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* Stat 1 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border">
              <span className="text-[10px] font-bold uppercase text-slate-400">ആകെ പങ്കെടുത്ത വർ</span>
              <span className="block text-2xl font-black text-[#006A4E] mt-1">{loadingAttempts ? '...' : quizAttempts.length} പേർ</span>
            </div>
            {/* Stat 2 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border">
              <span className="text-[10px] font-bold uppercase text-slate-400">ശരാശരി വിജയശതമാനം</span>
              <span className="block text-2xl font-black text-emerald-600 mt-1">
                {loadingAttempts ? '...' : quizAttempts.length > 0 
                  ? `${Math.round(quizAttempts.reduce((acc, c) => acc + c.percentage, 0) / quizAttempts.length)}%`
                  : '0%'
                }
              </span>
            </div>
            {/* Stat 3 */}
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border">
              <span className="text-[10px] font-bold uppercase text-slate-400">മികച്ച വിജയമാർക്ക്</span>
              <span className="block text-2xl font-black text-amber-600 mt-1">
                {loadingAttempts ? '...' : quizAttempts.length > 0
                  ? `${Math.max(...quizAttempts.map(a => a.score))} / ${selectedDashboardQuiz.questionCount}`
                  : `0 / ${selectedDashboardQuiz.questionCount}`
                }
              </span>
            </div>
          </div>

          {/* Rank List Table */}
          <div className="bg-white dark:bg-slate-900/40 border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-[#006A4E] text-white p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 leading-none">
                <Trophy className="w-4 h-4 text-yellow-300 animate-bounce" />
                <span>ഉദ്യോഗാർത്ഥി റാങ്ക് പട്ടിക (Aspirants Leaderboard Details)</span>
              </h4>
            </div>

            {loadingAttempts ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#006A4E] mx-auto mb-2" />
                <p className="text-xs text-slate-405">റാങ്ക് വിവരങ്ങൾ റീഡയറക്ട് ചെയ്യുന്നു...</p>
              </div>
            ) : quizAttempts.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="w-10 h-10 stroke-1 mx-auto mb-1.5" />
                <p className="text-xs">ഇതുവരെ ആരും ഈ പരീക്ഷയിൽ പങ്കെടുത്തിട്ടില്ല. കൂടുതൽ ആളുകളിലേക്ക് ലിങ്ക് ഷെയർ ചെയ്യൂ!</p>
              </div>
            ) : (
              <div className="overflow-x-auto min-w-full">
                <table className="w-full text-left border-collapse font-sans text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-850 text-slate-500 uppercase text-[9px] font-black border-b border-slate-100 dark:border-slate-800">
                      <th className="p-4 w-16 text-center">റിപ്പോർട്ട് സ്ഥാനം (Rank)</th>
                      <th className="p-4">പേര് (Aspirant Name)</th>
                      <th className="p-4 text-center">മാർക്കുകൾ (Score)</th>
                      <th className="p-4 text-center">ശതമാനം (Percentage)</th>
                      <th className="p-4 text-center font-mono">എടുത്ത സമയം (Time)</th>
                      <th className="p-4 text-right">പരീക്ഷാ മോഡ് തീയതി (Date & Time)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {quizAttempts.map((attempt, index) => (
                      <tr 
                        key={attempt.id} 
                        className={`hover:bg-slate-50/55 dark:hover:bg-slate-800/40 ${
                          index === 0 ? 'bg-yellow-50/20 dark:bg-yellow-950/10' :
                          index === 1 ? 'bg-slate-100/30' : ''
                        }`}
                      >
                        <td className="p-4 text-center font-extrabold">
                          {index === 0 && <span className="text-lg">🥇</span>}
                          {index === 1 && <span className="text-lg">🥈</span>}
                          {index === 2 && <span className="text-lg">🥉</span>}
                          {index > 2 && <span className="text-slate-400">#{index + 1}</span>}
                        </td>
                        <td className="p-4 font-black text-slate-850 dark:text-white">
                          {attempt.studentName}
                        </td>
                        <td className="p-4 text-center font-extrabold text-[#006A4E] dark:text-teal-400">
                          {attempt.score} / {attempt.totalQuestions}
                        </td>
                        <td className="p-4 text-center font-bold font-mono">
                          {attempt.percentage}%
                        </td>
                        <td className="p-4 text-center font-mono text-slate-500">
                          {Math.floor(attempt.timeSpentSeconds / 60)} മി. {attempt.timeSpentSeconds % 60} സെ.
                        </td>
                        <td className="p-4 text-right text-slate-400 dark:text-slate-500">
                          {new Date(attempt.completedAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EXPLICIT SHARING MODAL OVERLAY */}
      {showShareModal && (() => {
        const quizLink = getQuizShareLink(showShareModal);
        const fbShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(quizLink)}`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(quizLink)}`;
        const quizTitleForShare = publishedQuizzes.find(q => q.id === showShareModal)?.title || "സ്മാർട്ട് ക്വിസ്";

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-emerald-100 dark:border-slate-800 shadow-2xl p-6 md:p-8 max-w-md w-full relative animate-scale-in">
              {/* Close Button */}
              <button 
                onClick={() => setShowShareModal(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-full transition font-black text-sm"
              >
                ✕
              </button>

              <div className="text-center space-y-4">
                <div className="mx-auto w-12 h-12 bg-emerald-50 dark:bg-emerald-950/55 rounded-full flex items-center justify-center text-[#006A4E] dark:text-emerald-400">
                  <Share2 className="w-6 h-6 animate-pulse" />
                </div>
                <h4 className="text-base font-black text-slate-850 dark:text-white font-sans">
                  പരീക്ഷ ഷെയർ ഓപ്ഷനുകൾ (Share Quiz Details)
                </h4>
                <p className="text-xs text-slate-455">
                  ഈ പരീക്ഷ വിദ്യാർത്ഥികളിലേക്ക് പങ്കുവെക്കൂ. പരീക്ഷ എഴുതാൻ കുട്ടികൾക്ക് യാതൊരു ലോഗിനും ആവശ്യമില്ല.
                </p>
              </div>

              {/* Prominent "Share Quiz" Button Centerpiece */}
              <div className="pt-4 pb-2 select-none">
                <button
                  onClick={() => handleShareQuizUltimate(showShareModal, quizTitleForShare)}
                  className="w-full py-4 px-6 bg-[#006A4E] hover:bg-emerald-800 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider cursor-pointer transform hover:scale-[1.01]"
                >
                  <Share2 className="w-5 h-5 animate-pulse" />
                  <span>Share Quiz</span>
                </button>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2.5 text-center leading-normal">
                  * അമർത്തുമ്പോൾ പരീക്ഷാ ലിങ്ക് ഓട്ടോമാറ്റിക്കായി <strong>കോപ്പി ചെയ്യുകയും</strong>, വാട്സ്ആപ്പും ടെലിഗ്രാമും തുറക്കുകയും ചെയ്യും.
                </p>
              </div>

              {/* Alternative Individual Sharing Buttons for Convenience */}
              <div className="grid grid-cols-2 gap-2.5 mt-4 pb-4 border-b">
                {/* WhatsApp Alternative */}
                <button
                  onClick={() => shareViaWhatsApp(showShareModal, quizTitleForShare)}
                  className="flex items-center justify-center gap-1.5 p-2.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 rounded-xl border border-emerald-100 transition text-[11px] font-bold text-emerald-800 dark:text-emerald-400"
                >
                  <span className="text-base">💬</span>
                  <span>WhatsApp</span>
                </button>

                {/* Telegram Alternative */}
                <button
                  onClick={() => shareViaTelegram(showShareModal, quizTitleForShare)}
                  className="flex items-center justify-center gap-1.5 p-2.5 bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/40 rounded-xl border border-sky-100 transition text-[11px] font-bold text-sky-800 dark:text-sky-400"
                >
                  <span className="text-base">✈️</span>
                  <span>Telegram</span>
                </button>
              </div>

              {/* Copyable input URL fallback */}
              <div className="mt-5 space-y-1.5 font-sans">
                <label className="block text-[9px] font-black uppercase text-slate-400">
                  Public Quiz Link (പരീക്ഷാ ലിങ്ക്)
                </label>
                <div className="flex gap-1.5 p-1 px-2 border rounded-xl bg-slate-50 dark:bg-slate-950 items-center">
                  <input
                    type="text"
                    readOnly
                    value={quizLink}
                    className="w-full text-xs font-mono font-medium text-slate-655 bg-transparent border-none focus:outline-none select-all"
                  />
                  <button
                    onClick={() => copyShareLink(showShareModal)}
                    className="bg-[#006A4E] text-white hover:opacity-90 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition shrink-0"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* QR Code */}
              <div className="mt-6 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950/50 p-4 border border-dashed rounded-2xl">
                <span className="text-[9px] font-black text-slate-450 uppercase mb-2">ക്യുആർ കോഡ് (Scan QR Code)</span>
                <img 
                  src={qrUrl} 
                  alt="Quiz QR Code" 
                  className="w-36 h-36 bg-white p-2 rounded-xl border object-contain shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[9px] text-slate-405 mt-2 font-medium text-center font-sans">
                  ഈ ക്യുആർ കോഡ് പ്രിന്റ് ചെയ്യാനോ സ്ക്രീൻഷോട്ട് എടുത്ത് ഷെയർ ചെയ്യാനോ ഉപയോഗിക്കാം.
                </span>
              </div>

              {/* Footer Close */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowShareModal(null)}
                  className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-6 py-2.5 font-bold rounded-xl text-xs uppercase text-slate-700 dark:text-white"
                >
                  Close (പൂർത്തിയാക്കാം)
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}
