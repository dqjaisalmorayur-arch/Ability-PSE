import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Calendar, 
  BookOpen, 
  Sparkles, 
  Youtube, 
  Clock, 
  Trophy, 
  Shield, 
  User, 
  Moon, 
  Sun, 
  BookMarked,
  MapPin,
  Flame,
  Accessibility,
  PenTool,
  History
} from 'lucide-react';

// Components imports
import AccessibilityControls from './components/AccessibilityControls';
import AboutSection from './components/AboutSection';
import MalayalamCalendar from './components/MalayalamCalendar';
import CurrentAffairs from './components/CurrentAffairs';
import AIStudyAssistant from './components/AIStudyAssistant';
import SmartTopicLearning from './components/SmartTopicLearning';
import YouTubeQuiz from './components/YouTubeQuiz';
import MockTestCenter from './components/MockTestCenter';
import Leaderboard from './components/Leaderboard';
import StudentDashboard from './components/StudentDashboard';
import AdminPanel from './components/AdminPanel';
import PDFAnalyzer from './components/PDFAnalyzer';
import AudioAnalyzer from './components/AudioAnalyzer';
import QuizGenerator from './components/QuizGenerator';
import QuizCreatorStudio from './components/QuizCreatorStudio';
import MyLearning from './components/MyLearning';
import StudentQuizAttempt from './components/StudentQuizAttempt';

import { Student } from './types';

export default function App() {
  // Global View states
  const [activeTab, setActiveTab] = useState<'calendar' | 'affairs' | 'assistant' | 'topic' | 'youtube' | 'audio' | 'pdf' | 'quiz' | 'mock' | 'ranks' | 'dashboard' | 'admin' | 'creator-studio' | 'my-learning'>('calendar');
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [sharedQuizId, setSharedQuizId] = useState<string | null>(null);

  // Read quizId from query parameter or path format /quiz/XYZ
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let qId = params.get('quizId');
    if (!qId) {
      const parts = window.location.pathname.split('/');
      const quizIndex = parts.indexOf('quiz');
      if (quizIndex !== -1 && parts[quizIndex + 1]) {
        qId = parts[quizIndex + 1];
      }
    }
    if (qId) {
      setSharedQuizId(qId);
    }
  }, []);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  
  // Accessibility Font size scaling
  const [fontSize, setFontSize] = useState(16);
  const [langMode, setLangMode] = useState<'ml' | 'en'>('ml');

  // Trigger dark mode on HTML root element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Attempt to load previously logged student from database, or initialize guest
  useEffect(() => {
    const fetchDefaultStudent = async () => {
      try {
        const res = await fetch('/api/students');
        if (res.ok) {
          const studentsList: Student[] = await res.json();
          // Auto log-in to first user if exists, to avoid blank initialization
          if (studentsList.length > 0) {
            setCurrentStudent(studentsList[0]);
          }
        }
      } catch (e) {
        console.error("Failed to load default student", e);
      }
    };
    fetchDefaultStudent();
  }, []);

  const handleStudentUpdate = (updated: Student) => {
    setCurrentStudent(updated);
  };

  const handleSelectBookmark = (topic: string) => {
    setActiveTab('topic');
    // Simulated event: we can trigger a notification or prompt
  };

  if (sharedQuizId) {
    return (
      <div 
        style={{ fontSize: `${fontSize}px` }} 
        className={`min-h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 md:p-8 flex items-center justify-center transition-all duration-300 ${
          highContrast ? 'contrast-125' : ''
        }`}
      >
        <div className="w-full max-w-3xl">
          <StudentQuizAttempt quizId={sharedQuizId} onExit={() => { setSharedQuizId(null); window.history.replaceState({}, document.title, "/"); }} />
        </div>
      </div>
    );
  }

  return (
    <div 
      style={{ fontSize: `${fontSize}px` }} 
      className={`min-h-screen font-sans bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-all duration-300 ${
        highContrast ? 'contrast-125' : ''
      }`}
    >
      
      {/* 1. TOP ACCESSBILITY ACCESSIBLE BANNER SHIELD */}
      <AccessibilityControls 
        fontSize={fontSize} 
        setFontSize={setFontSize} 
        langMode={langMode} 
        setLangMode={setLangMode}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
      />

      {/* 2. MAIN HEADER NAV BAR */}
      <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-emerald-100 dark:border-slate-800/80 shadow-sm backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Logo & Brand titles with disabled flag */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#006A4E] to-emerald-700 text-white rounded-xl flex items-center justify-center font-bold font-display shadow-md shrink-0">
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg md:text-xl font-black text-slate-905 dark:text-slate-50 font-display flex items-center gap-1.5 leading-none">
                  <span>അബിലിറ്റി പി.എസ്.സി അക്കാദമി</span>
                </h1>
                <span className="text-[10px] bg-[#D4AF37] text-slate-950 px-2 py-0.5 rounded font-black font-mono">ABILITY PSC</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Ability Foundation for the Disabled, Pulikkal, Malappuram • <span className="font-mono text-[10px]">Learn Smart, Achieve Success</span>
              </p>
            </div>
          </div>

          {/* Student Status box, controls, dark mode trigger, log in */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            
            {/* Student Session Indicator */}
            {currentStudent ? (
              <div 
                onClick={() => setActiveTab('dashboard')}
                className="flex items-center gap-2 bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 px-3 py-1.5 rounded-full cursor-pointer hover:border-emerald-350 transition select-none"
              >
                <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center text-white text-[10px] uppercase font-bold">
                  {currentStudent.name[0]}
                </div>
                <div className="text-[11px] text-left leading-none">
                  <span className="block font-bold text-slate-700 dark:text-slate-205">{currentStudent.name}</span>
                  <span className="text-[10px] text-emerald-850 dark:text-emerald-350 font-mono mt-0.5 block font-extrabold">{currentStudent.progress.points} XP • 🔥 {currentStudent.progress.studyStreak} d</span>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => setActiveTab('assistant')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full cursor-pointer text-xs font-bold"
              >
                <User className="w-3.5 h-3.5" />
                <span>Guest (Click login)</span>
              </div>
            )}

            {/* Dark mode button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              title="Toggle day/night theme view"
              aria-label="Toggle dark mode theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-650" />}
            </button>
          </div>

        </div>
      </header>

      {/* 3. HERO HERO HERO BANNER SECTION */}
      <section className="bg-gradient-to-b from-white to-slate-50 dark:from-slate-950 dark:to-slate-900 border-b border-slate-105 dark:border-slate-850 py-12 px-4 md:px-8 text-center transition-all">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-yellow-50 dark:bg-yellow-950/40 text-yellow-800 dark:text-yellow-400 rounded-full text-xs font-extrabold border border-yellow-250/20 shadow-sm leading-none uppercase tracking-wider font-mono">
            🌟 {langMode === 'ml' ? 'മാതൃകാപരമായ ഭിന്നശേഷി പരിശീലനം' : 'Assistive AI-Driven Coaching'}
          </div>

          <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white font-display tracking-tight leading-tight">
            {langMode === 'ml' ? (
              <>
                പഠിക്കാം സ്മാർട്ടായി, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">നേടാം വിജയം!</span>
              </>
            ) : (
              <>
                Learn Smart, <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Achieve Success!</span>
              </>
            )}
          </h2>

          <p className="text-sm md:text-base text-slate-600 dark:text-slate-350 max-w-2xl mx-auto leading-relaxed">
            {langMode === 'ml' ? (
              "അബിലിറ്റി ഫൗണ്ടേഷൻ പുളിക്കൽ മലപ്പുറം തദ്ദേശീയമായി രൂപകൽപ്പന ചെയ്ത ആർട്ടിഫിഷ്യൽ ഇന്റലിജൻസ് അസിസ്റ്റന്റ് വഴി മികച്ച എൽ.ഡി.സി, ലാംഗ്വേജ് ടീച്ചർ കോച്ചിംഗ് ഇനി വിരൽത്തുമ്പിൽ."
            ) : (
              "Tailored civil service & government recruitment learning center equipped with simplified Malayalam memory rules, customized mock test suites, and dynamic video-to-quiz translators."
            )}
          </p>

          <div className="flex flex-wrap justify-center gap-3 pt-3">
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-6 py-3 rounded-xl bg-[#006A4E] hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              💬 Enter AI Classroom
            </button>
            <button
              onClick={() => setActiveTab('mock')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              ⏱️ Start Mock Exam
            </button>
          </div>
        </div>
      </section>

      {/* 4. MAIN LAYOUT AND NAVIGATION GRID PANEL */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        
        {/* TAB OPTIONS NAVIGATION */}
        <div className="flex gap-1.5 overflow-x-auto pb-4 mb-8 select-none justify-start md:justify-center">
          
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'calendar'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-950'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>നിത്യ പഞ്ചാംഗം (Calendar)</span>
          </button>

          <button
            onClick={() => setActiveTab('affairs')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'affairs'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>കറന്റ് അഫയേഴ്‌സ് (News)</span>
          </button>

          <button
            onClick={() => setActiveTab('assistant')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'assistant'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>AI ക്ലാസ്സ് റൂം (AI Chat)</span>
          </button>

          <button
            onClick={() => setActiveTab('topic')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'topic'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <BookMarked className="w-4 h-4 text-[#D4AF37]" />
            <span>സ്മാർട്ട് നോട്ട്സ് (Study Notes)</span>
          </button>

          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'youtube'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Youtube className="w-4 h-4 text-red-500" />
            <span>യൂട്യൂബ് സഹായി (YouTube Class Assistant)</span>
          </button>

          <button
            onClick={() => setActiveTab('audio')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'audio'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <span>🎙️</span>
            <span>ഓഡിയോ ക്ലാസ് (Audio)</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'pdf'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <span>📄</span>
            <span>പി.ഡി.എഫ് സഹായി (PDF)</span>
          </button>

          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'quiz'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <span>⚙️</span>
            <span>സ്മാർട്ട് ക്വിസ് (Quiz Generator)</span>
          </button>

          <button
            onClick={() => setActiveTab('creator-studio')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'creator-studio'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <PenTool className="w-4 h-4 text-emerald-500" />
            <span>ക്വിസ് സ്റ്റുഡിയോ (Quiz Creator Studio)</span>
          </button>

          <button
            onClick={() => setActiveTab('my-learning')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'my-learning'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-500" />
            <span>എൻ്റെ പഠനം (My Learning)</span>
          </button>

          <button
            onClick={() => setActiveTab('mock')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'mock'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>മാതൃകാ പരീക്ഷ (Mock exam)</span>
          </button>

          <button
            onClick={() => setActiveTab('ranks')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'ranks'
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-600" />
            <span>റാങ്ക് ലിസ്റ്റ് (Leaderboard)</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`px-4 py-2.5 rounded-full text-xs font-bold shrink-0 transition flex items-center gap-1.5 ${
              activeTab === 'admin'
                ? 'bg-slate-900 text-white shadow-sm ring-2 ring-yellow-400'
                : 'bg-white dark:bg-slate-800 text-slate-650 hover:bg-slate-100 dark:text-slate-300 border border-slate-200/50'
            }`}
          >
            <Shield className="w-4 h-4 text-yellow-500" />
            <span>അഡ്മിൻ ഓഫീസ്‌ (Admin Office)</span>
          </button>
        </div>

        {/* ACTIVE MODULE CONTAINER BODY */}
        <div id="module-display-area" className="transition-all duration-300">
          
          {activeTab === 'calendar' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <MalayalamCalendar />
              </div>
              <div className="lg:col-span-1">
                <Leaderboard />
              </div>
            </div>
          )}

          {activeTab === 'affairs' && (
            <CurrentAffairs userRole={currentStudent?.name.toLowerCase() === 'admin' ? 'admin' : 'student'} />
          )}

          {activeTab === 'assistant' && (
            <div className="max-w-3xl mx-auto">
              <AIStudyAssistant 
                currentStudent={currentStudent} 
                onStudentRegister={handleStudentUpdate} 
              />
            </div>
          )}

          {activeTab === 'topic' && (
            <SmartTopicLearning 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'youtube' && (
            <YouTubeQuiz 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'audio' && (
            <AudioAnalyzer 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'pdf' && (
            <PDFAnalyzer 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'quiz' && (
            <QuizGenerator 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'mock' && (
            <MockTestCenter 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'ranks' && (
            <div className="max-w-2xl mx-auto">
              <Leaderboard />
            </div>
          )}

          {activeTab === 'dashboard' && currentStudent && (
            <StudentDashboard 
              student={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
              onSelectBookmark={handleSelectBookmark}
            />
          )}

          {activeTab === 'creator-studio' && (
            <QuizCreatorStudio 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
            />
          )}

          {activeTab === 'my-learning' && (
            <MyLearning 
              currentStudent={currentStudent} 
              onStudentUpdate={handleStudentUpdate} 
              onSelectBookmark={handleSelectBookmark}
            />
          )}

          {activeTab === 'admin' && (
            <AdminPanel />
          )}

        </div>

      </main>

      {/* 5. ABOUT SECTION PORTRAIT */}
      <AboutSection />

      {/* 6. SYSTEM FOOTER INFO */}
      <footer className="bg-slate-100 dark:bg-slate-950/60 py-12 px-6 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-center text-xs md:text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8">
          <div>
            <h4 className="font-extrabold text-slate-700 dark:text-white mb-2 uppercase text-xs tracking-wider">Ability PSC Academy</h4>
            <p className="leading-relaxed font-sans text-xs">
              A high-end Kerala PSC coaching and technological learning hub run comprehensively under the direct control of the Ability Foundation for the Disabled, Pulikkal, Malappuram district.
            </p>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-700 dark:text-white mb-2 uppercase text-xs tracking-wider">Contact & Location</h4>
            <p className="leading-relaxed font-sans text-xs flex items-start gap-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-emerald-600 mt-0.5" />
              <span>Ability Campus, Pulikkal P.O, Malappuram District, Kerala - 673637. Near Kondotty, Kozhikode bypass.</span>
            </p>
          </div>
          <div>
            <h4 className="font-extrabold text-slate-700 dark:text-white mb-2 uppercase text-xs tracking-wider">Accessibility Statement</h4>
            <p className="leading-relaxed font-sans text-xs">
              Every interface, button element, and card structure on this application incorporates sound synthesizer triggers, font-scaling tools, assistive reader hooks conforming fully to WCAG 2.1 accessibility levels.
            </p>
          </div>
        </div>

        {/* License, legal and credit lines */}
        <div className="border-t border-slate-200/60 dark:border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono">
          <span>© {new Date().getFullYear()} Ability Foundation. All Rights Reserved.</span>
          <span className="flex items-center gap-1 bg-white dark:bg-slate-900 border px-3 py-1.5 rounded-full dark:border-slate-800">
            <Accessibility className="w-4 h-4 text-emerald-600" />
            <span>Designed for Equal Opportunity Empowerment</span>
          </span>
        </div>
      </footer>

    </div>
  );
}
