
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { AppScreen, PracticeMode, Question, ProgressMap, Progress, PracticeRange } from './types';
import { Card, Button, ProgressBar, Icons } from './components';
import { getStoredQuestions, getStoredProgress, updateProgress, saveQuestions, saveProgress, resetAllData, getDailyStats } from './store';
import { parseWordText, parseAnswerKey } from './parser';

// --- HOME VIEW ---
export const HomeView: React.FC<{ 
  onNavigate: (s: AppScreen) => void, 
  onStartPractice: (m: PracticeMode, r?: PracticeRange) => void
}> = ({ onNavigate, onStartPractice }) => {
  const questions = getStoredQuestions();
  const progress = getStoredProgress();
  const stats = getDailyStats();
  const today = new Date().toISOString().split('T')[0];
  const todayStat = stats[today] || { answered: 0, correct: 0 };

  const [showRangeModal, setShowRangeModal] = useState(false);
  const [rangeStart, setRangeStart] = useState<number>(1);
  const [rangeEnd, setRangeEnd] = useState<number>(questions.length || 100);
  const [questionCount, setQuestionCount] = useState<number>(25);
  const [isShuffle, setIsShuffle] = useState<boolean>(true);
  const [isShuffleOptions, setIsShuffleOptions] = useState<boolean>(false);
  const [timeLimit, setTimeLimit] = useState<number>(0); 

  useEffect(() => {
    if (questions.length > 0) {
      setRangeEnd(questions.length);
      setQuestionCount(Math.min(25, questions.length));
    }
  }, [questions.length]);

  const meta = useMemo(() => {
    const vals = Object.values(progress);
    const starred = vals.filter(p => p.starred).length;
    const wrongCount = vals.filter(p => p.lastResult === 'wrong').length;
    const accuracy = todayStat.answered > 0 ? Math.round((todayStat.correct / todayStat.answered) * 100) : 0;
    return { starred, accuracy, wrongCount };
  }, [progress, todayStat]);

  const handleReset = () => {
    if (confirm("DIQQAT! Barcha yuklangan savollar va natijalar butunlay o'chib ketadi. Rozimisiz?")) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleRangeSubmit = () => {
    onStartPractice(PracticeMode.RANGE, { 
      start: rangeStart, 
      end: rangeEnd, 
      limit: questionCount,
      shuffle: isShuffle,
      shuffleOptions: isShuffleOptions,
      timeLimit: timeLimit > 0 ? timeLimit : undefined
    });
    setShowRangeModal(false);
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-24 animate-in fade-in duration-500 relative">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">TezkorBilim</h1>
          <p className="text-slate-500 text-sm">Vizual xotira orqali o'rganish</p>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <Card className="text-center py-4 px-2">
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{questions.length}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Jami Savollar</div>
        </Card>
        <Card className="text-center py-4 px-2">
          <div className="text-2xl font-black text-amber-500">{meta.starred}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Tanlanganlar</div>
        </Card>
        <Card className="text-center py-4 px-2">
          <div className="text-2xl font-black text-green-500">{todayStat.answered}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Bugun yechildi</div>
        </Card>
        <Card className="text-center py-4 px-2">
          <div className="text-2xl font-black text-blue-500">{meta.accuracy}%</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Bugungi aniqlik</div>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={() => setShowRangeModal(true)} variant="primary" className="h-20 text-lg shadow-indigo-500/30" disabled={questions.length === 0}>
           Testni Sozlash va Boshlash
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => onStartPractice(PracticeMode.STARRED)} 
            variant="ghost" 
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" 
            disabled={meta.starred === 0}
          >
            ⭐ Tanlanganlar
          </Button>
          <Button 
            onClick={() => onStartPractice(PracticeMode.WRONG)} 
            variant="ghost" 
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            disabled={meta.wrongCount === 0}
          >
            ❌ Xatolar
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Ma'lumotlar Boshqaruvi</h3>
        <Button onClick={() => onNavigate(AppScreen.IMPORT_QUESTIONS)} variant="ghost" className="justify-start gap-3 bg-slate-100 dark:bg-slate-900">
          <Icons.Practice /> Word matnidan yuklash
        </Button>
        <Button onClick={() => onNavigate(AppScreen.IMPORT_ANSWERS)} variant="ghost" className="justify-start gap-3 bg-slate-100 dark:bg-slate-900">
          <Icons.Stats /> Javoblar kalitini qo'shish
        </Button>
        <Button onClick={handleReset} variant="danger" className="justify-start gap-3 mt-2 shadow-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Barcha ma'lumotlarni o'chirish
        </Button>
      </div>

      {showRangeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl scale-in-center overflow-y-auto max-h-[90vh] no-scrollbar border-t-4 border-indigo-500 sm:border-t-0">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Test Sozlamalari</h2>
              <button onClick={() => setShowRangeModal(false)} className="text-slate-400 hover:text-slate-600 p-2"><Icons.Back /></button>
            </div>
            
            <div className="flex flex-col gap-6 mb-8">
              {/* Range Selection */}
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Savollar oralig'i (1 - {questions.length}):</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <input 
                      type="number" 
                      value={rangeStart}
                      onChange={(e) => setRangeStart(parseInt(e.target.value) || 0)}
                      className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center"
                    />
                    <span className="text-[9px] text-center text-slate-400 font-bold">DAN</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <input 
                      type="number" 
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(parseInt(e.target.value) || 0)}
                      className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border-none outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center"
                    />
                    <span className="text-[9px] text-center text-slate-400 font-bold">GACHA</span>
                  </div>
                </div>
              </div>

              {/* Count Selection */}
              <div className="relative">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Nechta savol yechasiz?</label>
                  <input 
                    type="number" 
                    value={questionCount === 0 ? "" : questionCount}
                    placeholder="0"
                    onChange={(e) => setQuestionCount(e.target.value === '' ? 0 : parseInt(e.target.value))}
                    className="w-20 bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-black text-center text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {[25, 50, 100].map(c => (
                    <button 
                      key={c}
                      onClick={() => setQuestionCount(c)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${questionCount === c ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                      {c}
                    </button>
                  ))}
                  <button 
                    onClick={() => setQuestionCount(questions.length)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${questionCount === questions.length ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                  >
                    Hammasi
                  </button>
                </div>
              </div>

              {/* Time Selection */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Vaqt chegarasi (daqiqa):</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={timeLimit === 0 ? "" : timeLimit}
                    onChange={(e) => setTimeLimit(e.target.value === '' ? 0 : parseInt(e.target.value))}
                    className="w-20 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg border border-blue-200 dark:border-blue-800 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-black text-center text-blue-600 dark:text-blue-400"
                  />
                </div>
                <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                  {[5, 30, 60].map(m => (
                    <button 
                      key={m}
                      onClick={() => setTimeLimit(m)}
                      className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${timeLimit === m ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                    >
                      {m} m
                    </button>
                  ))}
                  <button 
                    onClick={() => setTimeLimit(0)}
                    className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all ${timeLimit === 0 ? 'bg-slate-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}
                  >
                    Cheksiz
                  </button>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-2">
                 <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer active:scale-95 transition-transform border border-slate-100 dark:border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={isShuffle}
                    onChange={(e) => setIsShuffle(e.target.checked)}
                    className="w-5 h-5 rounded accent-indigo-600"
                  />
                  <span className="font-bold text-sm">Savollarni aralashtirish</span>
                </label>

                <label className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer active:scale-95 transition-transform border border-slate-100 dark:border-slate-800">
                  <input 
                    type="checkbox" 
                    checked={isShuffleOptions}
                    onChange={(e) => setIsShuffleOptions(e.target.checked)}
                    className="w-5 h-5 rounded accent-indigo-600"
                  />
                  <span className="font-bold text-sm">Variantlarni aralashtirish</span>
                </label>
              </div>
            </div>

            <Button onClick={handleRangeSubmit} variant="primary" className="h-16 text-lg shadow-xl shadow-indigo-500/20">
              Boshlash
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- IMPORT QUESTIONS VIEW ---
export const ImportQuestionsView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Question[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const handleParse = () => {
    const { questions, errors: parseErrors } = parseWordText(text);
    setPreview(questions);
    setErrors(parseErrors);
  };

  const handleSave = () => {
    if (preview.length === 0) return;
    saveQuestions(preview);
    alert(`${preview.length} ta savol muvaffaqiyatli saqlandi!`);
    onBack();
  };

  return (
    <div className="p-6 flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 p-2"><Icons.Back /></button>
        <h1 className="text-2xl font-black">Savollarni Yuklash</h1>
      </div>

      <Card className="p-4 bg-amber-500/5 border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
        Format: <strong>1. Savol? a) var1 b) var2 c) var3 d) var4</strong>
      </Card>

      <textarea
        className="w-full h-64 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm focus:border-indigo-500 outline-none transition-all resize-none"
        placeholder="Matnni bu yerga joylang..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Button onClick={handleParse} variant="secondary">Matnni tahlil qilish</Button>

      {errors.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-rose-500 font-bold text-sm">Xatolar ({errors.length}):</h3>
          <div className="max-h-32 overflow-y-auto text-[10px] text-rose-400 bg-rose-500/5 p-2 rounded-lg border border-rose-500/20">
            {errors.map((err, i) => <div key={i}>• {err}</div>)}
          </div>
        </div>
      )}

      {preview.length > 0 && (
        <div className="flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-300">
          <h3 className="font-bold text-green-500">Muvaffaqiyatli: {preview.length} ta savol topildi</h3>
          <Button onClick={handleSave} variant="primary" className="h-16">Saqlash va Tasdiqlash</Button>
        </div>
      )}
    </div>
  );
};

// --- IMPORT ANSWERS VIEW ---
export const ImportAnswersView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [selectedBulk, setSelectedBulk] = useState<number | null>(null);

  const handleApply = () => {
    const { answers, errors: parseErrors } = parseAnswerKey(text);
    if (parseErrors.length > 5 && text.trim().length > 0) {
      setErrors(parseErrors);
      return;
    }

    const questions = getStoredQuestions();
    if (questions.length === 0) {
        alert("Avval savollarni yuklang!");
        return;
    }

    let updatedCount = 0;
    const updated = questions.map(q => {
      if (answers[q.id] !== undefined) {
        updatedCount++;
        return { ...q, correctIndex: answers[q.id] as any };
      }
      return q;
    });

    saveQuestions(updated);
    alert(`${updatedCount} ta savol uchun to'g'ri javoblar biriktirildi!`);
    onBack();
  };

  const handleBulkSet = (index: number) => {
    const questions = getStoredQuestions();
    if (questions.length === 0) {
        alert("Avval savollarni yuklang!");
        return;
    }

    setSelectedBulk(index);
    const letter = String.fromCharCode(65 + index); // A, B, C, D
    
    setTimeout(() => {
        if (confirm(`Barcha (${questions.length} ta) yuklangan savollar uchun to'g'ri javobni "${letter}" deb belgilashni tasdiqlaysizmi?`)) {
          const updated = questions.map(q => ({ ...q, correctIndex: index as any }));
          saveQuestions(updated);
          alert(`Barcha savollar uchun to'g'ri javob "${letter}" deb belgilandi.`);
          onBack();
        } else {
            setSelectedBulk(null);
        }
    }, 100);
  };

  return (
    <div className="p-6 flex flex-col gap-6 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="text-slate-400 p-2"><Icons.Back /></button>
        <h1 className="text-2xl font-black">Javoblar Kaliti</h1>
      </div>

      <div className="flex flex-col gap-3">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Hammasi bir xil javob (Tezkor):</h3>
        <div className="grid grid-cols-4 gap-3">
          {['A', 'B', 'C', 'D'].map((l, i) => {
            const isActive = selectedBulk === i;
            return (
              <button 
                key={l}
                onClick={() => handleBulkSet(i)}
                className={`h-16 rounded-2xl font-black border-2 transition-all duration-300 active:scale-90 flex items-center justify-center text-xl ${
                  isActive 
                  ? 'bg-green-600 text-white border-green-600 shadow-xl shadow-green-500/30 scale-105 z-10' 
                  : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800'
                }`}
              >
                {l}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-4" />

      <Card className="p-4 bg-blue-500/5 border-blue-500/20 text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
        Har xil javoblar uchun quyidagi formatda joylang: <br/>
        <strong>1-a, 2-c, 3-b</strong> yoki har bir qatorda bittadan: <br/>
        <strong>1 A <br/> 2 B</strong>
      </Card>

      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Kalitlarni matn orqali kiritish:</label>
        <textarea
            className="w-full h-48 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-sm focus:border-indigo-500 outline-none resize-none shadow-inner"
            placeholder="Masalan: 1-a, 2-b, 3-c..."
            value={text}
            onChange={(e) => setText(e.target.value)}
        />
      </div>

      <Button onClick={handleApply} variant="primary" className="h-16 shadow-lg shadow-indigo-500/20">
        Kalitni saqlash
      </Button>
      
      {errors.length > 0 && (
        <div className="text-rose-500 text-xs mt-2 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
            {errors.length} ta xato aniqlandi. Formatni tekshiring.
        </div>
      )}
    </div>
  );
};

// --- PRACTICE VIEW ---
export const PracticeView: React.FC<{ 
  mode: PracticeMode, 
  range?: PracticeRange, 
  onExit: () => void,
  onFinish: (results: { correct: number, wrong: number, total: number, timeSpent: number, unkeyed: number }) => void 
}> = ({ mode, range, onExit, onFinish }) => {
  const [questions, setQuestions] = useState<(Question & { displayOptions: string[], displayCorrectIdx?: number })[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [progress, setProgress] = useState<ProgressMap>(getStoredProgress());
  
  // Session Stats
  const [sessionResults, setSessionResults] = useState({ correct: 0, wrong: 0, unkeyed: 0 });
  const startTimeRef = useRef(Date.now());
  const autoNextTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    let pool = getStoredQuestions();
    if (pool.length === 0) {
      alert("Savollar mavjud emas.");
      onExit();
      return;
    }

    let filtered: Question[] = [];
    if (mode === PracticeMode.RANGE && range) {
      filtered = pool.filter(q => q.number >= range.start && q.number <= range.end);
      if (range.shuffle) {
        filtered = [...filtered].sort(() => Math.random() - 0.5);
      }
      if (range.limit && range.limit > 0) {
        filtered = filtered.slice(0, range.limit);
      }
      if (range.timeLimit) {
        setTimeLeft(range.timeLimit * 60);
      }
    } else if (mode === PracticeMode.STARRED) {
      filtered = pool.filter(q => progress[q.id]?.starred);
    } else if (mode === PracticeMode.WRONG) {
      filtered = pool.filter(q => progress[q.id]?.lastResult === 'wrong');
    } else {
      filtered = pool;
    }

    const processed = filtered.map(q => {
      if (range?.shuffleOptions) {
        const optionsWithIdx = q.options.map((text, idx) => ({ text, idx }));
        const shuffled = [...optionsWithIdx].sort(() => Math.random() - 0.5);
        let newCorrectIdx: number | undefined = undefined;
        if (q.correctIndex !== undefined) {
          newCorrectIdx = shuffled.findIndex(item => item.idx === q.correctIndex);
        }
        return {
          ...q,
          displayOptions: shuffled.map(s => s.text),
          displayCorrectIdx: newCorrectIdx
        };
      }
      return {
        ...q,
        displayOptions: [...q.options],
        displayCorrectIdx: q.correctIndex
      };
    });

    setQuestions(processed);

    return () => {
      if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    };
  }, [mode, range]);

  const finishQuiz = (finalResults?: typeof sessionResults) => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    const res = finalResults || sessionResults;
    onFinish({
      ...res,
      total: questions.length,
      timeSpent: duration
    });
  };

  // Timer Logic
  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      alert("Vaqt tugadi!");
      finishQuiz();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];

  const handleNext = (finalResults?: typeof sessionResults) => {
    if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedIdx(null);
      setIsRevealed(false);
    } else {
      finishQuiz(finalResults);
    }
  };

  const handleSelect = (idx: number) => {
    if (selectedIdx !== null) return;
    setSelectedIdx(idx);

    let nextStats = { ...sessionResults };

    if (currentQ.displayCorrectIdx !== undefined) {
      const isCorrect = idx === currentQ.displayCorrectIdx;
      const newProg = updateProgress(currentQ.id, isCorrect ? 'correct' : 'wrong');
      setProgress(newProg);
      setIsRevealed(true);
      
      if (isCorrect) nextStats.correct += 1;
      else nextStats.wrong += 1;
    } else {
      // Kaliti yo'q savolni ham javob berilgan deb hisoblaymiz
      setIsRevealed(true);
      nextStats.unkeyed += 1;
      updateProgress(currentQ.id, 'none'); 
    }

    setSessionResults(nextStats);

    // Avtomatik keyingisiga o'tish (2 soniyadan keyin)
    autoNextTimerRef.current = setTimeout(() => {
      handleNext(nextStats);
    }, 2000);
  };

  const toggleStar = () => {
    if (!currentQ) return;
    const newProg = updateProgress(currentQ.id, 'toggle_star');
    setProgress(newProg);
  };

  if (!currentQ) return null;

  const hasAnswerKey = currentQ.displayCorrectIdx !== undefined;

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-white dark:bg-slate-950 animate-in slide-in-from-bottom duration-300">
      <div className="p-4 flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <button onClick={onExit} className="text-slate-400 p-2"><Icons.Back /></button>
          
          <div className="flex items-center gap-4">
             {timeLeft !== null && (
                <div className={`px-3 py-1 rounded-full font-black text-xs tabular-nums border ${timeLeft < 60 ? 'bg-rose-500/10 border-rose-500 text-rose-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'}`}>
                   ⏱️ {formatTime(timeLeft)}
                </div>
             )}
             <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                {currentIndex + 1} / {questions.length}
             </div>
          </div>

          <button onClick={toggleStar} className="p-2">
            <Icons.Star filled={progress[currentQ.id]?.starred} />
          </button>
        </div>
        <ProgressBar current={currentIndex + 1} total={questions.length} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-32">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-8 leading-tight">
          {currentIndex + 1}. {currentQ.prompt}
        </h2>

        <div className="flex flex-col gap-3">
          {currentQ.displayOptions.map((opt, idx) => {
            let stateClass = "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200";
            
            if (selectedIdx !== null) {
              if (hasAnswerKey) {
                if (idx === currentQ.displayCorrectIdx) {
                  stateClass = "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400 ring-2 ring-green-500/30 font-bold";
                } else if (idx === selectedIdx) {
                  stateClass = "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/30";
                } else {
                  stateClass = "opacity-40";
                }
              } else {
                if (idx === selectedIdx) {
                   stateClass = "bg-indigo-600 text-white border-indigo-600 shadow-lg";
                } else {
                  stateClass = "opacity-40";
                }
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 font-medium active:scale-95 shadow-sm ${stateClass}`}
              >
                <div className="flex items-center gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full border border-current flex items-center justify-center font-bold text-xs uppercase">
                    {String.fromCharCode(97 + idx)}
                  </span>
                  <span className="flex-grow text-sm">{opt}</span>
                </div>
              </button>
            );
          })}
        </div>

        {selectedIdx !== null && !hasAnswerKey && (
          <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl animate-in fade-in duration-300">
             <p className="text-amber-600 dark:text-amber-400 text-xs font-bold text-center">Ushbu savol uchun to'g'ri javob kiritilmagan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- RESULTS VIEW ---
export const ResultsView: React.FC<{ 
  results: { correct: number, wrong: number, total: number, timeSpent: number, unkeyed: number },
  onHome: () => void 
}> = ({ results, onHome }) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins} m ${secs} s` : `${secs} s`;
  };

  const accuracy = results.total > 0 ? Math.round((results.correct / (results.total - results.unkeyed || 1)) * 100) : 0;

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-screen bg-white dark:bg-slate-950 animate-in fade-in duration-700">
      <div className="mb-8 text-center">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-4xl mb-4 ${accuracy > 70 ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'}`}>
          {accuracy > 70 ? '🏆' : '💪'}
        </div>
        <h1 className="text-3xl font-black">Test Yakunlandi!</h1>
        <p className="text-slate-500">Natijalaringiz bilan tanishing</p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full mb-10">
        <Card className="text-center p-4">
          <div className="text-2xl font-black text-indigo-500">{results.total}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Jami savollar</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-black text-green-500">{results.correct}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">To'g'ri</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-black text-rose-500">{results.wrong}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">Xato</div>
        </Card>
        <Card className="text-center p-4">
          <div className="text-2xl font-black text-blue-500">{results.unkeyed > 0 ? results.unkeyed : formatTime(results.timeSpent)}</div>
          <div className="text-[10px] uppercase font-bold text-slate-400 tracking-tighter">{results.unkeyed > 0 ? 'Kalitsiz' : 'Vaqt'}</div>
        </Card>
      </div>

      <div className="w-full max-w-xs space-y-3">
        <div className="text-center mb-6">
           <div className="text-4xl font-black text-slate-900 dark:text-white mb-1">{accuracy}%</div>
           <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">Umumiy Aniqlik</div>
        </div>
        <Button onClick={onHome} variant="primary" className="h-16">
          Asosiy ekranga qaytish
        </Button>
      </div>
    </div>
  );
};

// --- STATS VIEW ---
export const StatsView: React.FC = () => {
  const stats = getDailyStats();
  
  const handleReset = () => {
    if (confirm("Hamma natijalarni tozalashni xohlaysizmi?")) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
      <h1 className="text-2xl font-black">Statistika</h1>
      
      <div className="flex flex-col gap-3">
        {Object.entries(stats).length > 0 ? (
          Object.entries(stats).reverse().map(([date, data]) => (
            <Card key={date} className="flex justify-between items-center py-4">
              <div className="flex flex-col">
                <span className="font-bold text-sm">{date}</span>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
                  {data.answered} ta yechildi
                </span>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-indigo-500">
                  {data.answered > 0 ? Math.round((data.correct / data.answered) * 100) : 0}%
                </span>
                <div className="text-[8px] uppercase text-slate-500">Aniqlik</div>
              </div>
            </Card>
          ))
        ) : (
          <p className="text-center text-slate-400 py-10">Hali ma'lumotlar yo'q.</p>
        )}
      </div>

      <Button onClick={handleReset} variant="danger" className="mt-10">
        Barcha natijalarni o'chirish
      </Button>
    </div>
  );
};
