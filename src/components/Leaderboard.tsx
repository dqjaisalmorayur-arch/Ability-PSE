import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Star, Flame, Award, Loader2 } from 'lucide-react';
import { LeaderboardEntry } from '../types';

export default function Leaderboard() {
  const [standings, setStandings] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'overall'>('overall');

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        let data: LeaderboardEntry[] = await res.json();
        
        // Randomize mock variations slightly just to illustrate distinct timeframes perfectly
        if (timeframe === 'weekly') {
          data = [...data].map(d => ({
            ...d,
            points: Math.max(20, Math.floor(d.points * 0.35 + 10)),
            streak: Math.max(1, Math.floor(d.streak * 0.5))
          })).sort((a,b) => b.points - a.points);
        } else if (timeframe === 'monthly') {
          data = [...data].map(d => ({
            ...d,
            points: Math.max(50, Math.floor(d.points * 0.8 + 20)),
            streak: Math.max(3, Math.floor(d.streak * 0.9))
          })).sort((a,b) => b.points - a.points);
        }

        // Recheck rankings indexes
        const reRanked = data.map((entry, idx) => ({ ...entry, rank: idx + 1 }));
        setStandings(reRanked);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6 flex flex-col justify-between h-full">
      
      {/* Title */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#006A4E] dark:text-emerald-400">
            <Trophy className="w-5 h-5 text-yellow-500 fill-yellow-400" />
            <h2 className="text-xl font-bold font-sans">പരീക്ഷാ റാങ്ക് ലിസ്റ്റ് (Leaderboard)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daily Top Scorers, Streaks, and overall performance index.</p>
        </div>

        {/* Timeframe selector subtabs */}
        <div className="flex bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-205 p-0.5 mt-2 sm:mt-0 select-none">
          <button
            onClick={() => setTimeframe('weekly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              timeframe === 'weekly' ? 'bg-[#006A4E] text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => setTimeframe('monthly')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              timeframe === 'monthly' ? 'bg-[#006A4E] text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setTimeframe('overall')}
            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
              timeframe === 'overall' ? 'bg-[#006A4E] text-white shadow-sm' : 'text-slate-500'
            }`}
          >
            Overall
          </button>
        </div>
      </div>

      {/* Standings block */}
      {loading ? (
        <div className="flex-1 py-14 text-center text-slate-400">
          <Loader2 className="w-7 h-7 animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs">റാങ്ക് കോളം ലഭ്യമാക്കുന്നു...</p>
        </div>
      ) : standings.length === 0 ? (
        <div className="flex-1 py-14 text-center text-slate-400">
          <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold">റാങ്ക് വിവരങ്ങൾ ഇപ്പോൾ ലഭ്യമല്ല.</p>
        </div>
      ) : (
        <div className="flex-1 space-y-2 font-mono">
          {/* Top 3 special cards */}
          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {/* 2nd place */}
            {standings[1] && (
              <div className="bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl flex flex-col items-center justify-between shadow-sm">
                <Medal className="w-8 h-8 text-slate-400" />
                <span className="text-center font-bold text-xs truncate max-w-full text-slate-700 dark:text-white mt-1.5">{standings[1].name}</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">{standings[1].points} pts</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rank 2</span>
              </div>
            )}

            {/* 1st Place */}
            {standings[0] && (
              <div className="bg-yellow-50/40 dark:bg-yellow-950/15 border border-yellow-350 dark:border-yellow-950 p-4 rounded-xl flex flex-col items-center justify-between shadow-md relative pr-1.5 pl-1.5">
                <div className="absolute -top-1.5 bg-yellow-400 text-slate-900 text-[10px] uppercase font-bold py-0.5 px-2.5 rounded-full ring-2 ring-white">Winner</div>
                <Trophy className="w-10 h-10 text-yellow-500 fill-yellow-400 mt-1" />
                <span className="text-center font-black text-sm text-slate-800 dark:text-slate-100 truncate max-w-full mt-2.5 leading-tight">{standings[0].name}</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-1">{standings[0].points} XP</span>
                <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 uppercase mt-0.5">Rank 1</span>
              </div>
            )}

            {/* 3rd place */}
            {standings[2] && (
              <div className="bg-slate-50 dark:bg-slate-900 border p-3 rounded-xl flex flex-col items-center justify-between shadow-sm">
                <Medal className="w-8 h-8 text-orange-400" />
                <span className="text-center font-bold text-xs truncate max-w-full text-slate-700 dark:text-white mt-1.5">{standings[2].name}</span>
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">{standings[2].points} pts</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Rank 3</span>
              </div>
            )}
          </div>

          {/* Remaining scroll lists */}
          <div className="max-h-[220px] overflow-y-auto space-y-1.5 divide-y divide-slate-100 dark:divide-slate-750 pr-1">
            {standings.map((entry, index) => {
              // Row styling
              return (
                <div
                  key={entry.userId}
                  className={`flex items-center justify-between p-2.5 text-xs pr-1 pl-1`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono text-slate-400 w-5 text-center">#{entry.rank}</span>
                    <div className="flex flex-col">
                      <span className="font-sans font-bold text-slate-705 dark:text-slate-205">{entry.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans">Active student</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Streak flame indicator */}
                    {entry.streak > 0 && (
                      <span className="flex items-center text-orange-500 text-[11px] font-bold font-mono">
                        <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500 mr-0.5" />
                        <span>{entry.streak} days</span>
                      </span>
                    )}
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">{entry.points} pts</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom disclaimer */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-xl border border-dashed border-slate-200 text-center mt-6">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
          <b>How to Top?</b> Participate in daily mock quizzes, attempt timed test centers, and consult the AI study assistants to grow your metrics daily!
        </p>
      </div>

    </div>
  );
}
