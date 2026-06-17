import React, { useState } from 'react';
import { FileText, Sparkles, Loader2, ArrowRight, HelpCircle, MessageSquare, BookOpen, Send, CheckCircle, AlertTriangle, Bookmark } from 'lucide-react';
import { Student } from '../types';

interface PDFAnalyzerProps {
  currentStudent: Student | null;
  onStudentUpdate: (updated: Student) => void;
}

const SAMPLE_PDFS = [
  { name: "kerala_renaissance_notes.pdf", label: "Kerala Renaissance Guide" },
  { name: "indian_constitution_amendments.pdf", label: "Constitution Amendments" },
  { name: "environment_and_climate_kerala.pdf", label: "Kerala Geography & Climate" }
];

interface ExpectedQuestion {
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface PDFAnalysisResponse {
  summary: string;
  chapterWiseNotes: string;
  keyPoints: string[];
  oneLiners: string[];
  expectedQuestions: ExpectedQuestion[];
  revisionNotes: string;
}

export default function PDFAnalyzer({ currentStudent, onStudentUpdate }: PDFAnalyzerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [analysis, setAnalysis] = useState<PDFAnalysisResponse | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  // Output tabs
  const [activeSegment, setActiveSegment] = useState<'summary' | 'notes' | 'points' | 'oneliners' | 'quiz' | 'revision'>('summary');
  
  // Doubt solver state
  const [doubtText, setDoubtText] = useState('');
  const [doubtHistory, setDoubtHistory] = useState<{ query: string; reply: string }[]>([]);
  const [askingDoubt, setAskingDoubt] = useState(false);

  // Expected MCQs game states
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [isQAnswered, setIsQAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  const loadSamplePDF = (index: number) => {
    const fakeFile = new File(["dummy content"], SAMPLE_PDFS[index].name, { type: "application/pdf" });
    setFile(fakeFile);
  };

  const handleStartAnalysis = async () => {
    if (!file) return;
    setLoading(true);
    setLoadingStep('ഫയൽ വായിക്കുന്നു... (Reading PDF file...)');
    setAnalysis(null);
    setDoubtHistory([]);
    setQuizDone(false);
    setScore(0);
    setCurrentQIndex(0);
    setSelectedOpt(null);
    setIsQAnswered(false);

    try {
      // PDF documents are sent in clear envelope with full mock text converters or base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        setLoadingStep('പി.ഡി.എഫ് ഗഹനമായി അപഗ്രഥിക്കുന്നു... (Analyzing document layout...)');
        
        // Progressively update status
        const statusInterval = setInterval(() => {
          setLoadingStep(prev => {
            if (prev.includes('പി.ഡി.എഫ് ഗഹനമായി അപഗ്രഥിക്കുന്നു')) {
              return 'PSC പഠന വിവരങ്ങളും നോട്സുകളും തയ്യാറാക്കുന്നു... (Structuring PSC study guide...)';
            } else if (prev.includes('PSC പഠന വിവരങ്ങളും നോട്സുകളും')) {
              return 'റിവിഷൻ പോയിന്റുകൾ വികസിപ്പിക്കുന്നു... (Preparing rapid revision sheet...)';
            } else if (prev.includes('റിവിഷൻ പോയിന്റുകൾ വികസിപ്പിക്കുന്നു')) {
              return 'ലേഖനം പൂർത്തിയാക്കുന്നു, നോട്സ് ഉടൻ നിങ്ങളുടെ സ്ക്രീനിൽ ലഭ്യമാകും... (Finishing up layout...)';
            }
            return prev;
          });
        }, 3000);

        try {
          const base64data = (reader.result as string).split(',')[1];
          
          const response = await fetch('/api/pdf-analyzer', {
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
            console.error("PDF Analysis failed with status", response.status);
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

  // Submit Doubt to server solver
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
          type: 'PDF Study Pack',
          context: {
            summary: analysis.summary,
            keyPoints: analysis.keyPoints,
            oneLiners: analysis.oneLiners
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

  // Bookmark a specific keypoint or summary block to Student desk
  const handleBookmarkNotes = async (topic: string) => {
    if (!currentStudent) return;
    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: currentStudent.id,
          action: 'bookmark',
          payload: { topic: `[PDF] ${topic}` }
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

  const handleMcqOptionSelect = (idx: number) => {
    if (isQAnswered) return;
    setSelectedOpt(idx);
  };

  const handleMcqSubmit = () => {
    if (selectedOpt === null || !analysis) return;
    const currentQ = analysis.expectedQuestions[currentQIndex];
    const isCorrect = selectedOpt === currentQ?.correctAnswer;
    if (isCorrect) setScore(prev => prev + 1);
    setIsQAnswered(true);
  };

  const handleMcqNext = () => {
    if (!analysis) return;
    if (currentQIndex < analysis.expectedQuestions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setSelectedOpt(null);
      setIsQAnswered(false);
    } else {
      setQuizDone(true);
      // Give points
      if (currentStudent) {
        fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: currentStudent.id,
            action: 'submit_quiz',
            payload: {
              quizId: `pdf-quiz-${Date.now()}`,
              quizTitle: `PDF Test: ${file?.name || 'Study PDF'}`,
              score: score,
              totalQuestions: analysis.expectedQuestions.length,
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
          <FileText className="w-5 h-5 text-[#006A4E]" />
          <h2 className="text-xl font-bold">പി.ഡി.എഫ് പഠന സഹായി (AI PDF Analyzer)</h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          അപ്‌ലോഡ് ചെയ്യുന്ന പി.ഡി.എഫ് ഫയലുകൾ പൂർണ്ണമായി വായിച്ചു മനസ്സിലാക്കി അവയിൽ നിന്നുള്ള തിയറി കുറിപ്പുകൾ, വൺലൈനറുകൾ, ചോദ്യങ്ങൾ എന്നിവ ഞൊടിയിടയിൽ ലവൽ അപ്പ് ചെയ്യുക!
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
                ? 'border-emerald-600 bg-emerald-50 dark:bg-slate-900/60'
                : 'border-slate-350 hover:border-emerald-500'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="pdf-input-selector"
            />
            <label htmlFor="pdf-input-selector" className="cursor-pointer space-y-3 flex flex-col items-center">
              <div className="bg-emerald-50 dark:bg-emerald-950/60 p-4 rounded-full text-[#006A4E]">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-700 dark:text-white">
                  Drag and drop your study PDF here or click to browse
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Supports size up to 10MB • Syllabus chapters, guides, memory charts
                </p>
              </div>
            </label>

            {file && (
              <div className="mt-4 px-4 py-1.5 bg-emerald-100 dark:bg-emerald-950 text-[#006A4E] dark:text-emerald-300 font-mono text-[11px] font-bold rounded-full">
                📄 Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </div>
            )}
          </div>

          {/* Quick Demo files */}
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              ഡെമോ റെക്കോർഡുകൾ (Use Demo Guides for immediate testing)
            </h4>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PDFS.map((doc, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => loadSamplePDF(idx)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:text-emerald-700 transition flex items-center gap-1"
                >
                  <FileText className="w-3.5 h-3.5 text-red-500" />
                  <span>{doc.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Trigger */}
          <button
            onClick={handleStartAnalysis}
            disabled={loading || !file}
            className="w-full py-4 bg-[#006A4E] hover:bg-emerald-700 text-white font-bold rounded-xl text-xs uppercase tracking-widest disabled:opacity-50 flex flex-col items-center justify-center gap-1 cursor-pointer shadow-md"
          >
            {loading ? (
              <div className="flex flex-col items-center gap-2 py-1">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-300" />
                  <span className="font-extrabold text-white">പി.ഡി.എഫ് അപഗ്രഥിക്കുന്നു... Please Wait...</span>
                </div>
                <div className="text-[10px] text-yellow-200 mt-1 animate-pulse font-normal">
                  {loadingStep}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                <span>പഠനം ആരംഭിക്കുക (Analyze PDF Study Pack)</span>
              </div>
            )}
          </button>
        </div>
      )}

      {/* ANALYSIS WORKSPACE AND RESULTS GRID */}
      {analysis && (
        <div className="space-y-6">
          {/* File stamp info bar */}
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900 p-3 rounded-xl flex justify-between items-center text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200">
              📊 Analyzed: {file?.name || "Study Document"}
            </span>
            <button
              onClick={() => { setAnalysis(null); setFile(null); }}
              className="text-[10px] font-bold font-mono text-red-600 uppercase hover:underline"
            >
              Analyze New PDF
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* LEFT AREA: SEGMENT CONTENT (2 Cols) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Output Tab lists */}
              <div className="flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-bold shrink-0">
                <button
                  onClick={() => setActiveSegment('summary')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeSegment === 'summary' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  സംഗ്രഹം (Summary)
                </button>
                <button
                  onClick={() => setActiveSegment('notes')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeSegment === 'notes' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  പാഠക്കുറിപ്പുകൾ (Notes)
                </button>
                <button
                  onClick={() => setActiveSegment('points')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeSegment === 'points' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  പ്രധാന കടമ്പകൾ (Key Points)
                </button>
                <button
                  onClick={() => setActiveSegment('oneliners')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeSegment === 'oneliners' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  വൺലൈനറുകൾ (One-Liners)
                </button>
                <button
                  onClick={() => setActiveSegment('quiz')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeSegment === 'quiz' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  പഠന പരീക്ഷ (Expected Qs)
                </button>
                <button
                  onClick={() => setActiveSegment('revision')}
                  className={`pb-2 px-1 border-b-2 whitespace-nowrap transition-all ${
                    activeSegment === 'revision' ? 'border-[#006A4E] text-[#006A4E]' : 'border-transparent text-slate-450 hover:text-slate-800'
                  }`}
                >
                  റിവിഷൻ കാർഡ് (Revision)
                </button>
              </div>

              {/* TAB SEGMENTS WORKSPACE */}
              <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-150 rounded-xl p-5 min-h-[300px] leading-relaxed">
                
                {activeSegment === 'summary' && (
                  <div className="space-y-3 font-sans text-xs md:text-sm">
                    <div className="flex justify-between items-center">
                      <h3 className="font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">രത്നചുരുക്കം</h3>
                      <button
                        onClick={() => handleBookmarkNotes(`[Summary] ${file?.name}`)}
                        className="p-1 px-2.5 bg-white border rounded text-[#006A4E] hover:bg-emerald-50 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Bookmark Note</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap text-slate-650 dark:text-slate-200 mt-2">
                      {analysis.summary}
                    </div>
                  </div>
                )}

                {activeSegment === 'notes' && (
                  <div className="space-y-3 font-serif text-slate-700 dark:text-slate-200 text-xs md:text-sm">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-sans font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">വിഷയാധിഷ്ഠിത പാഠക്കുറിപ്പുകൾ</h3>
                      <button
                        onClick={() => handleBookmarkNotes(`[Ch-Notes] ${file?.name}`)}
                        className="p-1 px-2.5 bg-white border rounded text-[#006A4E] hover:bg-emerald-50 text-[10px] font-bold flex items-center gap-1 transition"
                      >
                        <Bookmark className="w-3 h-3" />
                        <span>Bookmark Chapters</span>
                      </button>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">
                      {analysis.chapterWiseNotes}
                    </div>
                  </div>
                )}

                {activeSegment === 'points' && (
                  <div className="space-y-3">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-xs md:text-sm mb-3">ക്ലാസ്സ് പ്രധാന പോയിന്റുകൾ</h3>
                    <div className="space-y-2">
                      {analysis.keyPoints.map((pt, i) => (
                        <div key={i} className="flex justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-100 items-start gap-2 text-xs md:text-sm">
                          <span className="text-slate-650 dark:text-slate-200 font-medium">📌 {pt}</span>
                          <button
                            onClick={() => handleBookmarkNotes(pt)}
                            className="p-1 rounded bg-slate-100 hover:bg-emerald-100 text-[#006A4E] transition shrink-0"
                            title="Bookmark this specific point"
                          >
                            <Bookmark className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSegment === 'oneliners' && (
                  <div className="space-y-3 font-mono">
                    <h3 className="font-sans font-extrabold text-slate-800 dark:text-white text-xs md:text-sm mb-3">വൺലൈനർ വസ്തുതകൾ (One-Line Crammers)</h3>
                    <div className="grid grid-cols-1 gap-2">
                      {analysis.oneLiners.map((ol, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-150 text-xs md:text-sm">
                          ⚡ {ol}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeSegment === 'quiz' && (
                  <div className="space-y-4">
                    <h3 className="font-extrabold text-slate-800 dark:text-white text-xs md:text-sm pb-2 border-b">പ്രതീക്ഷിക്കുന്ന PSC പരീക്ഷ ചോദ്യങ്ങൾ (Expected Test)</h3>
                    
                    {!quizDone && analysis.expectedQuestions[currentQIndex] ? (
                      <div className="space-y-4">
                        <div className="text-[10px] font-mono font-bold text-slate-400">
                          QUESTION {currentQIndex + 1} OF {analysis.expectedQuestions.length}
                        </div>
                        <h4 className="font-bold text-slate-820 dark:text-white text-xs md:text-sm leading-snug">
                          {analysis.expectedQuestions[currentQIndex].text}
                        </h4>

                        <div className="grid grid-cols-1 gap-2.5">
                          {analysis.expectedQuestions[currentQIndex].options.map((opt, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => handleMcqOptionSelect(oIdx)}
                              className={`w-full p-3 rounded-lg text-left text-xs font-semibold border transition ${
                                isQAnswered
                                  ? oIdx === analysis.expectedQuestions[currentQIndex].correctAnswer
                                    ? 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-800'
                                    : selectedOpt === oIdx
                                    ? 'bg-red-100 dark:bg-red-950 border-red-500 text-red-850'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-400'
                                  : selectedOpt === oIdx
                                  ? 'bg-emerald-600 text-white border-emerald-600'
                                  : 'bg-white dark:bg-slate-800 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                              disabled={isQAnswered}
                            >
                              <span className="font-mono mr-1.5">{['A', 'B', 'C', 'D'][oIdx]}.</span>
                              {opt}
                            </button>
                          ))}
                        </div>

                        {isQAnswered && (
                          <div className={`p-3.5 rounded-lg text-xs leading-normal border ${
                            selectedOpt === analysis.expectedQuestions[currentQIndex].correctAnswer
                              ? 'bg-emerald-50 border-emerald-200 text-slate-700'
                              : 'bg-red-50 border-red-200 text-slate-700'
                          }`}>
                            <p className="font-extrabold flex items-center gap-1 text-[#006A4E]">
                              {selectedOpt === analysis.expectedQuestions[currentQIndex].correctAnswer ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                              <span>{selectedOpt === analysis.expectedQuestions[currentQIndex].correctAnswer ? 'ശരിയുത്തരം!' : 'തെറ്റായ ഉത്തരം!'}</span>
                            </p>
                            <p className="mt-1 font-serif italic text-xs leading-relaxed">
                              <b>വിശദീകരണം:</b> {analysis.expectedQuestions[currentQIndex].explanation}
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end pt-2">
                          {!isQAnswered ? (
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
                              {currentQIndex < analysis.expectedQuestions.length - 1 ? 'Next Question' : 'Complete & Log Marks'}
                            </button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6 space-y-3">
                        <div className="bg-yellow-100 dark:bg-yellow-950 p-3.5 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-yellow-600">
                          🎯
                        </div>
                        <h4 className="font-black text-sm text-slate-800 dark:text-white">നിങ്ങൾ പരീക്ഷ പൂർത്തിയാക്കിയിരിക്കുന്നു!</h4>
                        <p className="text-xs text-slate-500">
                          Your Score: <b className="text-emerald-700 font-mono text-lg">{score} / {analysis.expectedQuestions.length}</b> Correct.
                        </p>
                        <p className="text-[10px] text-slate-400 bg-white dark:bg-slate-800 p-2 border inline-block rounded-lg mx-auto">
                          +{score * 10} XP points added to your study desk dashboard portfolio.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => {
                              setQuizDone(false);
                              setScore(0);
                              setCurrentQIndex(0);
                              setSelectedOpt(null);
                              setIsQAnswered(false);
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

                {activeSegment === 'revision' && (
                  <div className="space-y-3 font-serif text-xs md:text-sm">
                    <h3 className="font-sans font-extrabold text-slate-800 dark:text-white uppercase">ക്വിക്ക് റിവിഷൻ കാർഡ് (Last Minute Check)</h3>
                    <div className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-150">
                      {analysis.revisionNotes}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* RIGHT AREA: DOUBT SOLVER PANEL (1 Col) */}
            <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between h-[520px]">
              <div>
                <div className="flex items-center gap-1 text-[#006A4E] dark:text-emerald-400 border-b pb-2.5 mb-3.5 shrink-0">
                  <MessageSquare className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">സംശയ നിവാരണം (Coach Puneeth)</h3>
                </div>

                <p className="text-[10px] text-slate-400 leading-normal mb-3">
                  Ask any technical doubt specifically centered around the uploaded PDF document pages.
                </p>

                {/* Historied Conversations Scrollable */}
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-100 text-[11px] text-slate-700 leading-normal">
                    <span>ഹലോ {currentStudent?.name || "കൂട്ടുകാരൻ"}, ഈ പി.ഡി.എഫ് സംബന്ധിച്ചുള്ള കുറിപ്പുകൾ, ഭേദഗതികൾ, വർഷങ്ങൾ എന്നിവയിലുള്ള സംശയങ്ങൾ ചോദിക്കൂ! </span>
                  </div>

                  {doubtHistory.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 font-sans">
                      {/* Doubt */}
                      <div className="text-right">
                        <span className="inline-block bg-[#006A4E] text-white p-2 rounded-xl rounded-tr-none text-[11px] max-w-[90%] break-words">
                          {item.query}
                        </span>
                      </div>
                      {/* Reply */}
                      <div className="text-left">
                        <span className="inline-block bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-2.5 rounded-xl rounded-tl-none text-[10.5px] leading-relaxed max-w-[95%] break-words">
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

              {/* Doubt Input bar */}
              <form onSubmit={handleAskDoubt} className="border-t pt-3.5 flex gap-1 items-center shrink-0">
                <input
                  type="text"
                  required
                  placeholder="Ask a doubt..."
                  value={doubtText}
                  onChange={e => setDoubtText(e.target.value)}
                  className="flex-1 px-3 py-1.5. text-[11px] bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-650 rounded-lg dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
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
