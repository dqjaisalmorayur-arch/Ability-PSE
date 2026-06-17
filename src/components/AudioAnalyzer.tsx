import React, { useState } from 'react';
import { Volume2, Sparkles, Loader2, BookOpen, MessageSquare, Send, CheckCircle, AlertTriangle, Bookmark } from 'lucide-react';
import { Student } from '../types';

interface AudioAnalyzerProps {
  currentStudent: Student | null;
  onStudentUpdate: (updated: Student) => void;
}

const SAMPLE_AUDIOS = [
  { name: "1857_revolt_lecture.mp3", label: "1857 Revolt Lecture" },
  { name: "fundamental_rights.wav", label: "Fundamental Rights tape" },
  { name: "kerala_rivers_facts.m4a", label: "Kerala Rivers Facts" }
];

interface ExpectedMcq {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface AudioAnalysisResponse {
  transcript: string;
  summary: string;
  keyPoints: string[];
  pscFacts: string[];
  revisionNotes: string;
  expectedMcqs: ExpectedMcq[];
}

export default function AudioAnalyzer({ currentStudent, onStudentUpdate }: AudioAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysis, setAnalysis] = useState<AudioAnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Tabs for layout display
  const [activeTab, setActiveTab] = useState<'transcript' | 'summary' | 'keypoints' | 'facts' | 'quiz' | 'revision'>('transcript');

  // Doubt solving
  const [doubtText, setDoubtText] = useState('');
  const [doubtHistory, setDoubtHistory] = useState<{ query: string; reply: string }[]>([]);
  const [askingDoubt, setAskingDoubt] = useState(false);

  // MCQ assessment
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const loadSampleAudio = (index: number) => {
    const fakeFile = new File(["dummy audio"], SAMPLE_AUDIOS[index].name, { type: "audio/mp3" });
    setFile(fakeFile);
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingStep('ഫയൽ വായിക്കുന്നു... (Reading audio file...)');
    setAnalysis(null);
    setDoubtHistory([]);
    setQuizFinished(false);
    setScore(0);
    setCurrentQIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        setLoadingStep('ക്ലാസ്സ് ഗഹനമായി അപഗ്രഥിക്കുന്നു... (Analyzing class audio...)');
        
        // Progressively update loading status so user understands what is running
        const statusInterval = setInterval(() => {
          setLoadingStep(prev => {
            if (prev.includes('ക്ലാസ്സ് ഗഹനമായി അപഗ്രഥിക്കുന്നു')) {
              return 'PSC ചോദ്യങ്ങളും നോട്സുകളും തയ്യാറാക്കുന്നു... (Structuring PSC notes & questions...)';
            } else if (prev.includes('PSC ചോദ്യങ്ങളും നോട്സുകളും')) {
              return 'വിശദീകരണങ്ങൾ തയ്യാറാക്കുന്നു... (Preparing high-yield answers...)';
            } else if (prev.includes('വിശദീകരണങ്ങൾ തയ്യാറാക്കുന്നു')) {
              return 'പൂർത്തിയാക്കുന്നു, നോട്സ് ഉടൻ നിങ്ങളുടെ സ്ക്രീനിൽ ലഭ്യമാകും... (Finishing up layout...)';
            }
            return prev;
          });
        }, 3000);

        try {
          const base64data = (reader.result as string).split(',')[1];
          
          const response = await fetch('/api/audio-analyzer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileBase64: base64data,
              fileName: file.name,
              fileType: file.type
            })
          });

          if (response.ok) {
            const data = await response.json();
            setAnalysis(data);
          } else {
            console.error("Audio Analysis failed with status", response.status);
          }
        } catch (err) {
          console.error(err);
        } finally {
          clearInterval(statusInterval);
          setLoading(false);
        }
      };
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Bookmark a specific keypoint / summary text to Student desk
  const handleBookmarkNotes = async (topic: string) => {
    if (!currentStudent) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentStudent.id,
          action: 'bookmark',
          payload: { topic: `[Audio] ${topic}` }
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

  const handleAskDoubt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim() || !analysis) return;

    setAskingDoubt(true);
    const query = doubtText.trim();
    setDoubtText('');

    try {
      const res = await fetch('/api/analyze-doubt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'Audio Lecture Recording',
          context: {
            transcript: analysis.transcript,
            summary: analysis.summary,
            pscFacts: analysis.pscFacts
          },
          question: query,
          userName: currentStudent?.name || "Aspirant"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDoubtHistory(prev => [...prev, { query, reply: data.text }]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setAskingDoubt(false);
    }
  };

  const handleMcqOptionSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOpt(idx);
  };

  const handleMcqSubmit = () => {
    if (selectedOpt === null || !analysis) return;
    const currentQ = analysis.expectedMcqs[currentQIdx];
    const isCorrect = selectedOpt === currentQ?.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    setIsAnswered(true);
  };

  const handleMcqNext = () => {
    if (!analysis) return;
    if (currentQIdx < analysis.expectedMcqs.length - 1) {
      setCurrentQIdx(prev => prev + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      if (currentStudent) {
        fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentStudent.id,
            action: 'submit_quiz',
            payload: {
              quizId: `audio-quiz-${Date.now()}`,
              quizTitle: `Audio Test: ${file?.name || 'Class Audio'}`,
              score: score,
              totalQuestions: analysis.expectedMcqs.length,
              pointsEarned: score * 10
            }
          })
        }).then(res => res.json()).then(updated => onStudentUpdate(updated));
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6 space-y-6">
      
      {/* Block Title Header */}
      <div className="border-b border-slate-100 dark:border-slate-700 pb-4">
        <div className="flex items-center gap-2 text-[#006A4E] dark:text-emerald-400">
          <Volume2 className="w-5 h-5 text-[#006A4E]" />
          <h2 className="text-xl font-bold">ഓഡിയോ ക്ലാസ് സഹായി (AI Audio Analyzer)</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          അപ്‌ലോഡ് ചെയ്യുന്ന ക്ലാസ് ഓഡിയോ ഫയലുകളിൽ (MP3, WAV, M4A) നിന്നുള്ള പ്രസംഗം കൃത്യമായി എഴുതിയെടുത്ത് അതിർത്തികളില്ലാത്ത മലയാളം നോട്സുകളായും പരീക്ഷീ ചോദ്യങ്ങളായും സ്മാർട്ടായി മാറ്റിത്തരുന്നു!
        </p>
      </div>

      {!analysis && (
        <div className="space-y-4">
          {/* UPLOAD PANEL */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-all min-h-[180px] flex flex-col justify-center items-center ${
              dragActive
                ? 'border-emerald-600 bg-emerald-50'
                : 'border-slate-350 hover:border-emerald-500'
            }`}
          >
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="hidden"
              id="audio-input-selector"
            />
            <label htmlFor="audio-input-selector" className="cursor-pointer space-y-3 flex flex-col items-center">
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-full text-[#006A4E]">
                <Volume2 className="w-8 h-8 font-extrabold" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-705 dark:text-white">
                  Drag and drop your study audio recording here or click to browse
                </p>
                <p className="text-[10px] text-slate-405 mt-1 animate-pulse">
                  Supported formats: MP3, WAV, M4A up to 15MB • Automatic Whisper-Scribe
                </p>
              </div>
            </label>

            {file && (
              <div className="mt-4 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-[#006A4E] dark:text-emerald-300 font-mono text-[11px] font-bold rounded-full">
                🎵 Selected Audio: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Quick Demo audio clips */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              ഡെമോ റെക്കോർഡുകൾ (Use Sample Audio Lectures for testing)
            </h4>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_AUDIOS.map((aud, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => loadSampleAudio(idx)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5 text-blue-500" />
                  <span>{aud.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action trigger */}
          <button
            onClick={handleStartAnalysis}
            disabled={loading || !file}
            className="w-full py-4 bg-[#006A4E] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
                  <span className="font-extrabold text-white">ഓഡിയോ ക്ലാസ് അപഗ്രഥിക്കുന്നു... Please Wait...</span>
                </div>
                <div className="text-[10px] text-yellow-200 mt-1 animate-pulse font-normal">
                  {loadingStep}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>ഓഡിയോ പാഠം തുടങ്ങുക (Analyze Audio Lecture)</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* WORKSPACE & RENDER AREA */}
      {analysis && (
        <div className="space-y-6">
          {/* Audio info file card */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 p-3 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              🎤 Lecture File: {file?.name || "Class Audio"}
            </span>
            <button
              onClick={() => { setAnalysis(null); setFile(null); }}
              className="text-[10px] font-bold font-mono text-red-600 uppercase hover:underline"
            >
              Upload Another Track
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* LEFT WORKSPACE (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              
              {/* Audio Tab selection options */}
              <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold shrink-0">
                <button
                  onClick={() => setActiveTab('transcript')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'transcript' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  എഴുത്തുപകർപ്പ് (Transcript)
                </button>
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'summary' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  പ്രധാന സംഗ്രഹം (Summary)
                </button>
                <button
                  onClick={() => setActiveTab('keypoints')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'keypoints' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  സുപ്രധാന കോൺസെപ്റ്റുകൾ (Key Points)
                </button>
                <button
                  onClick={() => setActiveTab('facts')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'facts' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  പി.എസ്.സി വസ്തുതകൾ (PSC Facts)
                </button>
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'quiz' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  ശബ്ദ പരീക്ഷ (Interactive Qs)
                </button>
                <button
                  onClick={() => setActiveTab('revision')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeTab === 'revision' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  റിവിഷൻ ഷീറ്റ് (Revision)
                </button>
              </div>

              {/* RENDER ACTIVE TAB */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 rounded-xl p-5 min-h-[300px] leading-relaxed">
                
                {activeTab === 'transcript' && (
                  <div className="space-y-3 font-serif text-slate-700 dark:text-slate-205 text-xs md:text-sm">
                    <div className="flex justify-between items-center mb-2 font-sans text-xs">
                      <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">ക്ലാസ്സ് പകർപ്പ് (Speech-To-Text Output)</h3>
                      <button
                        onClick={() => handleBookmarkNotes(`[Transcript] ${file?.name}`)}
                        className="p-1 px-2.5 bg-white border rounded text-[#006A4E] hover:bg-emerald-50 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Bookmark Transcript</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed border-l-4 border-[#006A4E] pl-3 italic">
                      "{analysis.transcript}"
                    </div>
                  </div>
                )}

                {activeTab === 'summary' && (
                  <div className="space-y-3 font-sans text-xs md:text-sm text-slate-700 dark:text-slate-200">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-extrabold text-[#006A4E] dark:text-emerald-400 uppercase">ക്ലാസ്സ് പ്രധാന ഉള്ളടക്കം</h3>
                      <button
                        onClick={() => handleBookmarkNotes(`[Summary] ${file?.name}`)}
                        className="p-1 px-2.5 bg-white border rounded text-[#006A4E] hover:bg-emerald-50 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Bookmark Notes</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap">
                      {analysis.summary}
                    </div>
                  </div>
                )}

                {activeTab === 'keypoints' && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-xs md:text-sm mb-3">പ്രഭാഷണ പ്രധാന വശങ്ങൾ (Key Concepts)</h3>
                    <div className="space-y-2">
                      {analysis.keyPoints.map((pt, i) => (
                        <div key={i} className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 items-start gap-2 text-xs md:text-sm">
                          <span className="text-slate-650 dark:text-slate-200 font-medium">📍 {pt}</span>
                          <button
                            onClick={() => handleBookmarkNotes(pt)}
                            className="p-1 rounded bg-slate-100 hover:bg-emerald-50 text-[#006A4E] transition shrink-0"
                            title="Bookmark this core idea"
                          >
                            <Bookmark className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'facts' && (
                  <div className="space-y-3 font-sans text-xs md:text-sm">
                    <h3 className="font-extrabold text-[#006A4E] dark:text-emerald-400">Direct PSC Fact Nodes (പരീക്ഷാ പോയിന്റുകൾ)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {analysis.pscFacts.map((fact, i) => (
                        <div key={i} className="p-3 bg-emerald-500/5 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-950 rounded-xl text-slate-800 dark:text-slate-200 text-xs flex justify-between items-center">
                          <span>⚡ {fact}</span>
                          <button
                            onClick={() => handleBookmarkNotes(fact)}
                            className="text-[#006A4E] font-extrabold text-[10px] flex items-center shrink-0 hover:underline"
                          >
                            Bookmark
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-xs md:text-sm pb-2 border-b">ശബ്ദകുറിപ്പ് കുഞ്ഞൻ പരീക്ഷ (Audio Expected Qs)</h3>

                    {!quizFinished && analysis.expectedMcqs[currentQIdx] ? (
                      <div className="space-y-4">
                        <div className="text-[10px] font-mono font-bold text-slate-400">
                          QUESTION {currentQIdx + 1} OF {analysis.expectedMcqs.length}
                        </div>
                        <h4 className="font-bold text-slate-820 dark:text-white text-xs md:text-sm">
                          {analysis.expectedMcqs[currentQIdx].text}
                        </h4>

                        <div className="grid grid-cols-1 gap-2.5">
                          {analysis.expectedMcqs[currentQIdx].options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleMcqOptionSelect(oIdx)}
                              className={`w-full p-3 rounded-lg text-left text-xs font-semibold border transition ${
                                isAnswered
                                  ? oIdx === analysis.expectedMcqs[currentQIdx].correctAnswer
                                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800'
                                    : selectedOpt === oIdx
                                    ? 'bg-red-100 dark:bg-red-950 border-red-500 text-red-805'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'
                                  : selectedOpt === oIdx
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                              disabled={isAnswered}
                            >
                              <span className="font-mono mr-1.5">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                              {opt}
                            </button>
                          ))}
                        </div>

                        {isAnswered && (
                          <div className={`p-3.5 rounded-lg text-xs leading-normal border ${
                            selectedOpt === analysis.expectedMcqs[currentQIdx].correctAnswer
                              ? 'bg-emerald-50 border-emerald-250 text-slate-700'
                              : 'bg-red-50 border-red-250 text-slate-700'
                          }`}>
                            <p className="font-extrabold flex items-center gap-1 text-[#006A4E]">
                              {selectedOpt === analysis.expectedMcqs[currentQIdx].correctAnswer ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                              <span>{selectedOpt === analysis.expectedMcqs[currentQIdx].correctAnswer ? 'ശരിയുത്തരം!' : 'തെറ്റായ ഉത്തരം!'}</span>
                            </p>
                            <p className="mt-1 font-serif text-xs leading-relaxed">
                              <b>വിശദീകരണം:</b> {analysis.expectedMcqs[currentQIdx].explanation}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          {!isAnswered ? (
                            <button
                              onClick={handleMcqSubmit}
                              disabled={selectedOpt === null}
                              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase transition disabled:opacity-50"
                            >
                              Submit Answer
                            </button>
                          ) : (
                            <button
                              onClick={handleMcqNext}
                              className="px-4 py-2 rounded-lg bg-[#006A4E] text-white text-xs font-bold uppercase transition"
                            >
                              {currentQIdx < analysis.expectedMcqs.length - 1 ? 'Next Question' : 'Complete & Log Marks'}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-3">
                        <div className="bg-emerald-100 dark:bg-emerald-950 p-3.5 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-emerald-600">
                          🎯
                        </div>
                        <h4 className="font-black text-sm text-slate-8s0 dark:text-white">പരീക്ഷ വിജയകരമായി പൂർത്തിയാക്കിയിരിക്കുന്നു!</h4>
                        <p className="text-xs text-slate-500">
                          Your Score: <b className="text-[#006A4E] font-mono text-lg">{score} / {analysis.expectedMcqs.length}</b> Correct.
                        </p>
                        <p className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 p-2 border inline-block rounded-lg mx-auto">
                          +{score * 10} XP points synchronized with your leaderboard rankings.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setQuizFinished(false);
                              setScore(0);
                              setCurrentQIdx(0);
                              setSelectedOpt(null);
                              setIsAnswered(false);
                            }}
                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg uppercase"
                          >
                            Retake Expected Test
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'revision' && (
                  <div className="space-y-3 font-sans text-xs md:text-sm text-slate-705 dark:text-slate-150">
                    <h3 className="font-extrabold text-slate-800 dark:text-white uppercase">ദ്രുത റിവിഷൻ കാർഡ് (Speech Summarization Sheets)</h3>
                    <div className="whitespace-pre-wrap leading-relaxed mt-2 pl-3 border-l-4">
                      {analysis.revisionNotes}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT WORKSPACE: AUDIO DOUBT BOARD (1 Col) */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between h-[520px]">
              <div>
                <div className="flex items-center gap-1 text-[#006A4E] dark:text-emerald-400 border-b pb-2.5 mb-3.5 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">സംശയ നിവാരണം (Coach Puneeth)</h3>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal mb-3">
                  Ask doubts based specifically on the audio speech transcription of this Kerala PSC video/audio session.
                </p>

                {/* Chat items */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 text-[11px] text-slate-700 leading-normal">
                    <span>ഹലോ {currentStudent?.name || "കൂട്ടുകാരൻ"}, ഈ ക്ലാസ്സിൽ പറഞ്ഞിട്ടുള്ള കാര്യങ്ങളിൽ സംശയമുണ്ടെങ്കിൽ താഴെ ചോദിക്കൂ! </span>
                  </div>

                  {doubtHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 font-sans">
                      <div className="text-right">
                        <span className="inline-block bg-[#006A4E] text-white p-2 rounded-xl rounded-tr-none text-[11px] max-w-[90%] break-words">
                          {item.query}
                        </span>
                      </div>
                      <div className="text-left">
                        <span className="inline-block bg-slate-100 dark:bg-slate-900 text-slate-805 dark:text-slate-100 p-2.5 rounded-xl rounded-tl-none text-[10.5px] leading-relaxed max-w-[95%] break-words">
                          {item.reply}
                        </span>
                      </div>
                    </div>
                  ))}

                  {askingDoubt && (
                    <div className="flex justify-start">
                      <div className="bg-slate-50 p-2.5 rounded-xl flex items-center gap-1.5 text-[10px] text-slate-400 animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>അപഗ്രഥിക്കുന്നു...</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Doubt solver form */}
              <form onSubmit={handleAskDoubt} className="border-t pt-3.5 flex gap-1 items-center shrink-0">
                <input
                  type="text"
                  required
                  placeholder="Ask a doubt..."
                  value={doubtText}
                  onChange={e => setDoubtText(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-350 dark:border-slate-650 rounded-lg dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={askingDoubt}
                  className="p-1 px-2.5 bg-[#006A4E] text-white hover:bg-emerald-700 transition rounded-lg text-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
