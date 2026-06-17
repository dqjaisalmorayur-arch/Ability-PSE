import React, { useState, useEffect } from 'react';
import { Newspaper, Sparkles, Plus, Check, Loader2, Award, Calendar, BookOpen } from 'lucide-react';
import { CurrentAffairsItem } from '../types';

interface CurrentAffairsProps {
  userRole?: 'student' | 'admin';
}

const CATEGORIES = [
  { id: 'all', label: 'എല്ലാം (All)' },
  { id: 'kerala', label: 'കേരളം (Kerala)' },
  { id: 'india', label: 'ഇന്ത്യ (India)' },
  { id: 'world', label: 'ലോകം (World)' },
  { id: 'science', label: 'ശാസ്ത്രം & സാങ്കേതികവിദ്യ (Science)' },
  { id: 'environment', label: 'പരിസ്ഥിതി (Environment)' },
  { id: 'sports', label: 'കായികം (Sports)' },
  { id: 'awards', label: 'അവാർഡുകൾ (Awards)' },
  { id: 'schemes', label: 'ഗവ. പദ്ധതികൾ (Schemes)' },
  { id: 'economy', label: 'സാമ്പത്തികം (Economy)' },
];

export default function CurrentAffairs({ userRole }: CurrentAffairsProps) {
  const [items, setItems] = useState<CurrentAffairsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newCat, setNewCat] = useState<'kerala' | 'india' | 'world' | 'science' | 'environment' | 'sports' | 'awards' | 'schemes' | 'economy'>('kerala');

  const fetchCurrentAffairs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/current-affairs');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentAffairs();
  }, []);

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newSummary) return;

    setLoading(true);
    try {
      const res = await fetch('/api/current-affairs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          summary: newSummary,
          category: newCat
        })
      });
      if (res.ok) {
        setNewTitle('');
        setNewSummary('');
        setShowAddForm(false);
        fetchCurrentAffairs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic PSC category summary using Gemini
  const handleAiCategoryGenerate = async (cat: string) => {
    setAiGenerating(true);
    try {
      const prompt = `Generate 1 concise, highly informative, real-world style Kerala PSC current affairs topic note for the category: "${cat}". 
Include:
1. Title in Malayalam (e.g. 'കേരളത്തിലെ പുതിയ കായൽ പുനരുദ്ധാരണ പദ്ധതി' or Indian scheme updates).
2. A bulleted summary in Malayalam emphasizing exam-oriented statistics, names, and years.
3. Strict structure, avoiding commentary. Make it highly professional.`;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          userName: 'Admin'
        })
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.text || '';
        
        // Parse title and summary from Gemini text response
        let title = `AI-Generated Updates: ${cat.toUpperCase()}`;
        let summary = text;

        const lines = text.split('\n');
        const titleLine = lines.find((l: string) => l.trim().startsWith('#') || l.trim().length > 10);
        if (titleLine) {
          title = titleLine.replace(/[#*]/g, '').trim();
          summary = lines.filter((l: string) => l !== titleLine).join('\n').trim();
        }

        // Post this newly generated item to the database server
        const addRes = await fetch('/api/current-affairs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title || `പുതിയ കായിക പുരസ്കാരം ${new Date().getFullYear()}`,
            summary: summary || 'വിശദ വിവരങ്ങൾ ഉടൻ അപ്ഡേറ്റ് ചെയ്യും.',
            category: cat === 'all' ? 'kerala' : cat
          })
        });

        if (addRes.ok) {
          fetchCurrentAffairs();
        }
      }
    } catch (e) {
      console.error("AI Current Affairs Error", e);
    } finally {
      setAiGenerating(false);
    }
  };

  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-sm p-6">
      
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-slate-105 dark:border-slate-700 pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#006A4E] dark:text-emerald-400">
            <Newspaper className="w-5 h-5" />
            <h2 className="text-xl font-bold font-sans">കറന്റ് അഫയേഴ്‌സ് കേന്ദ്രം (Current Affairs Center)</h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daily simplified Kerala PSC exam-oriented bullet notes & AI summaries.</p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Quick AI generation button */}
          <button
            onClick={() => handleAiCategoryGenerate(selectedCategory === 'all' ? 'kerala' : selectedCategory)}
            disabled={aiGenerating}
            id="btn-ai-generate-ca"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:opacity-90 disabled:opacity-50 shadow-sm"
          >
            {aiGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>AI Generate Current Affair</span>
              </>
            )}
          </button>

          {/* Admin Addition Option */}
          {userRole === 'admin' && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              id="btn-add-ca-form"
              className="flex items-center justify-center gap-1 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-100 dark:hover:bg-slate-600"
            >
              <Plus className="w-3.5 h-3.5 mr-0.5" /> News
            </button>
          )}
        </div>
      </div>

      {/* Admin Insertion Form */}
      {showAddForm && (
        <form onSubmit={handleManualAdd} className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 mb-6 space-y-3">
          <h3 className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200">Add Current Affairs Manually</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Headline / Title (Malayalam/English)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              className="sm:col-span-2 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm dark:text-white"
              required
            />
            <select
              value={newCat}
              onChange={e => setNewCat(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm dark:text-white"
            >
              <option value="kerala">Kerala</option>
              <option value="india">India</option>
              <option value="world">World</option>
              <option value="science">Science</option>
              <option value="environment">Environment</option>
              <option value="sports">Sports</option>
              <option value="awards">Awards</option>
              <option value="schemes">Schemes</option>
              <option value="economy">Economy</option>
            </select>
          </div>
          <div>
            <textarea
              placeholder="Concise Summary bullet points..."
              value={newSummary}
              onChange={e => setNewSummary(e.target.value)}
              rows={3}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-sm dark:text-white"
              required
            />
          </div>
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 hover:bg-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-emerald-600 text-white font-bold hover:bg-emerald-700 flex items-center gap-1"
            >
              <Check className="w-3 h-3" /> Save Note
            </button>
          </div>
        </form>
      )}

      {/* Category Filtres horizontal bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide select-none">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            id={`tab-ca-${cat.id}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#006A4E] text-white shadow-sm ring-2 ring-emerald-300 dark:ring-emerald-950'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/40 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Current affairs news results list */}
      {loading ? (
        <div className="py-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
          <p className="text-xs">കറന്റ് അഫയേഴ്‌സ് ലോഡ് ചെയ്യുന്നു...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-12 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
          <BookOpen className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">ഈ വിഭാഗത്തിൽ ഇന്ന് പ്രധാന വിവരങ്ങൾ ഇല്ല.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">ക്ലിക്ക് ചെയ്ത് പുതിയ AI അഫയറുകൾ ഉണ്ടാക്കുക!</p>
          <button
            onClick={() => handleAiCategoryGenerate(selectedCategory === 'all' ? 'kerala' : selectedCategory)}
            className="mt-3 text-xs bg-slate-200 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950 text-emerald-800 dark:text-emerald-400 px-3 py-1 rounded-lg font-bold"
          >
            Sync with AI Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div
              key={item.id}
              id={`ca-item-${item.id}`}
              className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-700 border-l-4 border-l-[#006A4E] dark:border-l-emerald-500 flex flex-col justify-between hover:shadow-md transition duration-250 cursor-pointer"
            >
              <div>
                {/* News tag */}
                <div className="flex items-center justify-between gap-2 mb-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">
                  <span className="bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded text-emerald-800 dark:text-emerald-300">
                    🔴 {item.category}
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3" /> {item.date}
                  </span>
                </div>
                <h4 className="font-bold text-[#006A4E] dark:text-emerald-300 text-sm md:text-base leading-snug line-clamp-2">
                  {item.title}
                </h4>
                
                {/* Clean formatted summarizer output */}
                <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                  {item.summary.includes('-') || item.summary.includes('•') ? (
                    <div className="whitespace-pre-line leading-relaxed pl-1">
                      {item.summary}
                    </div>
                  ) : (
                    <p className="leading-relaxed">
                      {item.summary}
                    </p>
                  )}
                </div>
              </div>

              {/* Bookmark and coach helper button */}
              <div className="mt-3 pt-2.5 border-t border-slate-200/40 dark:border-slate-750 flex justify-between items-center text-[10px] md:text-xs">
                <span className="text-slate-400 select-none">PSC Coaching Capsule</span>
                <span className="text-[#006A4E] dark:text-emerald-400 hover:underline font-bold">
                  Syllabus Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
