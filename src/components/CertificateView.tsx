import React, { useRef } from 'react';
import { Award, Printer, Download, X, Eye } from 'lucide-react';

interface CertificateViewProps {
  studentName: string;
  quizName: string;
  score: number;
  totalQuestions: number;
  dateString: string;
  onClose?: () => void;
}

export default function CertificateView({ 
  studentName, 
  quizName, 
  score, 
  totalQuestions, 
  dateString,
  onClose 
}: CertificateViewProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const percentage = Math.round((score / totalQuestions) * 100);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    
    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>PSC Academy Certificate - ${studentName}</title>
            <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
            <style>
              body { font-family: 'Inter', system-ui, sans-serif; background-color: #ffffff; margin: 0; padding: 20px; }
              @media print {
                body { margin: 0; padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="p-4 mx-auto max-w-5xl">
              ${printContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden max-w-3xl mx-auto">
      
      {/* Frame header actions */}
      <div className="bg-slate-50 dark:bg-slate-950 p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs select-none">
        <span className="font-extrabold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
          <Award className="w-5 h-5 text-amber-500 animate-pulse" />
          <span>അക്കാദമി ഡിജിറ്റൽ സർട്ടിഫിക്കറ്റ് (AI Certified Credential)</span>
        </span>
        <div className="flex gap-2">
          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3 py-1.5 rounded-lg flex items-center gap-1 transition text-[11px]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>പ്രിന്റ് ചെയ്യുക / സേവ് (Print)</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 px-2.5 rounded bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-300 rounded"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Printable Certificate wrapper */}
      <div className="p-6 md:p-10" ref={printRef}>
        <div className="border-[14px] border-double border-emerald-850 dark:border-emerald-900 bg-white p-6 md:p-12 relative text-center shadow-inner rounded-md text-slate-800">
          
          {/* Decorative Corner Accents */}
          <div className="absolute top-2 left-2 w-8 h-8 border-t-4 border-l-4 border-emerald-800"></div>
          <div className="absolute top-2 right-2 w-8 h-8 border-t-4 border-r-4 border-emerald-800"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 border-b-4 border-l-4 border-emerald-800"></div>
          <div className="absolute bottom-2 right-2 w-8 h-8 border-b-4 border-r-4 border-emerald-800"></div>

          {/* Certificate Body */}
          <div className="space-y-6 md:space-y-8">
            <div className="space-y-2">
              <span className="text-[10px] tracking-widest font-extrabold uppercase text-amber-600 block">ABILITY FOUNDATION PULIKKAL MALAPPURAM</span>
              <h1 className="text-xl md:text-3xl font-black font-serif text-[#006A4E] tracking-tight leading-none">
                ABILITY PSC EXAM ACADEMY
              </h1>
              <div className="h-0.5 w-1/3 bg-emerald-700 mx-auto mt-2"></div>
            </div>

            <div className="space-y-1">
              <h3 className="text-[12px] md:text-sm font-black text-slate-500 uppercase tracking-widest font-sans">
                പങ്കാളിത്ത സാക്ഷ്യപത്രം (CERTIFICATE OF ACHIEVEMENT)
              </h3>
              <p className="text-xs text-slate-400 italic">This is proudly presented with accolades to</p>
            </div>

            <div className="py-2">
              <h2 className="text-2xl md:text-4xl font-extrabold text-[#D4AF37] tracking-tight font-serif italic border-b border-dashed border-slate-300 max-w-md mx-auto pb-1">
                {studentName}
              </h2>
            </div>

            <p className="text-xs md:text-sm text-slate-600 leading-normal max-w-xl mx-auto font-sans">
              ഫോർ ദി ഡിസേബിൾഡ് യൂത്ത് എംപവർമെൻ്റ് അബിലിറ്റി ക്യാമ്പസ് മലപ്പുറം നടത്തുന്ന 
              ലാംഗ്വേജ് ടീച്ചർ & സിവിൽ സർവീസ് സിദ്ധാന്ത പരിശീലനത്തിന്റെ ഭാഗമായി തയ്യാറാക്കിയ 
              <br />
              <strong className="text-slate-900 font-extrabold italic">"{quizName}"</strong> എന്ന കസ്റ്റം മാതൃകാ സ്മാർട്ട് പരീക്ഷ 
              വിജയകരമായി പൂർത്തിയാക്കി <strong>{score} / {totalQuestions} ({percentage}%)</strong> സ്കോർ കൈവരിച്ചിരിക്കുന്നു.
            </p>

            {/* Bottom stamp and signature layout */}
            <div className="grid grid-cols-3 items-end gap-4 pt-4 md:pt-8 text-center text-[10px] md:text-xs">
              
              {/* Left Column: Date */}
              <div className="border-t border-slate-250 pt-2 text-slate-505">
                <span className="block font-mono font-bold">{dateString}</span>
                <span className="block text-[9px] uppercase font-bold text-slate-400">തീയതി (Issue Date)</span>
              </div>

              {/* Center Seal Badge */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-amber-100 text-amber-800 rounded-full w-12 h-12 flex items-center justify-center border-4 border-amber-300">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <span className="block text-[8px] uppercase font-bold text-slate-400 mt-1 block">Approved AI Credential</span>
              </div>

              {/* Right Column: Authorized sign */}
              <div className="border-t border-slate-250 pt-2 text-slate-505">
                <span className="block italic font-bold font-serif text-[#006A4E] tracking-tight">K.A. Rahiman</span>
                <span className="block text-[9px] uppercase font-bold text-slate-400">അഡ്മിനിസ്ട്രേറ്റർ (Ability Org)</span>
              </div>

            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
