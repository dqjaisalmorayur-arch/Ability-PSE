import React, { useState, useEffect } from 'react';
import { Calendar, Award, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { MalayalamDateInfo } from '../types';

export default function MalayalamCalendar() {
  const [calendarData, setCalendarData] = useState<MalayalamDateInfo | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const fetchCalendar = async (dateStr: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/malayalam-calendar?date=${dateStr}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data);
      }
    } catch (err) {
      console.error("Error loaded calendar", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar(selectedDate);
  }, [selectedDate]);

  // Adjust date helper
  const adjustDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col justify-between h-full">
      {/* Calendar Header block */}
      <div className="bg-emerald-700 dark:bg-emerald-900 text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-yellow-300" />
          <h3 className="font-bold text-sm uppercase tracking-wider font-mono">നിത്യ പഞ്ചാംഗം | Daily Calendar</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => adjustDate(-1)}
            id="btn-cal-prev"
            className="p-1 rounded bg-emerald-800 hover:bg-emerald-600 transition" 
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
            id="btn-cal-today"
            className="px-2 py-0.5 text-xs rounded bg-yellow-400 text-slate-900 font-bold hover:bg-yellow-300 transition"
          >
            Today
          </button>
          <button 
            onClick={() => adjustDate(1)}
            id="btn-cal-next"
            className="p-1 rounded bg-emerald-800 hover:bg-emerald-600 transition"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Content body */}
      <div className="p-5 flex-1 flex flex-col md:flex-row gap-6 items-center">
        {/* Paper Tearoff Representation */}
        <div className="relative w-40 h-44 bg-pink-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-lg shadow-md flex flex-col overflow-hidden text-center shrink-0">
          <div className="w-full bg-[#D12B2B] text-white py-1 font-bold text-[11px] uppercase tracking-wider">
            {calendarData ? calendarData.englishDate.split(',')[1]?.trim() : 'JUNE'}
          </div>
          {/* Spring binder dots representation */}
          <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 -mt-1.5">
            <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full border border-slate-400"></span>
            <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full border border-slate-400"></span>
            <span className="w-2.5 h-2.5 bg-slate-300 dark:bg-slate-700 rounded-full border border-slate-400"></span>
          </div>

          <div className="flex-1 flex flex-col justify-center items-center py-2">
            {/* The Date Number */}
            <span className="text-4xl md:text-5xl font-black text-slate-800 dark:text-slate-100 leading-none">
              {new Date(selectedDate).getDate()}
            </span>
            <span className="text-xs font-semibold text-slate-500 mt-1 dark:text-slate-400">
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-[10px] md:text-xs text-[#006A4E] dark:text-emerald-400 font-bold mt-2 font-mono">
              {calendarData ? calendarData.malayalamDate.split(' ')[0] : ''}
            </span>
          </div>
        </div>

        {/* Calendar details */}
        {loading ? (
          <div className="flex-1 text-center py-8 text-slate-400">
            <p className="animate-pulse">പഞ്ചാംഗം കണക്കുകൂട്ടുന്നു...</p>
          </div>
        ) : (
          calendarData && (
            <div className="flex-1 space-y-2.5 text-slate-700 dark:text-slate-200 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-2 text-center md:text-left bg-slate-50 dark:bg-slate-750 p-2.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">നക്ഷത്രം (Star)</span>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">⭐ {calendarData.nakshatram}</p>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">തിഥി (Thithi)</span>
                  <p className="font-bold text-[#006A4E] dark:text-emerald-400 text-sm">🌙 {calendarData.thithi}</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-1 uppercase-headings">
                <div>
                  <span className="font-semibold text-slate-400 text-[10px] tracking-wide block uppercase">കൊല്ലവർഷം (Malayalam Date)</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{calendarData.malayalamDate}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 text-[10px] tracking-wide block uppercase">ഇംഗ്ലീഷ് തീയതി (Gregorian)</span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium">{calendarData.englishDate}</p>
                </div>
                <div>
                  <span className="font-semibold text-[#D4AF37] text-[10px] tracking-wide block uppercase">പ്രത്യേകതകൾ (Important Day)</span>
                  <p className="text-pink-700 dark:text-pink-400 font-bold text-xs md:text-sm leading-snug">{calendarData.importantDay}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 text-[10px] tracking-wide block uppercase">കേരള സംഭവങ്ങൾ (Kerala events)</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{calendarData.keralaEvent}</p>
                </div>
                <div>
                  <span className="font-semibold text-purple-400 text-[10px] tracking-wide block uppercase">ഗവർമെന്റ് കാര്യങ്ങൾ (Govt Observances)</span>
                  <p className="text-xs text-purple-700 dark:text-purple-400 font-medium">{calendarData.govObservance}</p>
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="bg-slate-50 dark:bg-slate-900/60 py-2.5 px-4 text-center border-t border-slate-100 dark:border-slate-700">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
          Pulikkal, Malappuram Regional Calendrics Engine V2
        </span>
      </div>
    </div>
  );
}
