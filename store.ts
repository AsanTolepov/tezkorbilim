
import { Question, Progress, ProgressMap } from './types';

const KEYS = {
  QUESTIONS: 'rl_v2_questions',
  PROGRESS: 'rl_v2_progress',
  STATS: 'rl_v2_stats'
};

export const getStoredQuestions = (): Question[] => {
  const data = localStorage.getItem(KEYS.QUESTIONS);
  return data ? JSON.parse(data) : [];
};

export const saveQuestions = (questions: Question[]) => {
  localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
};

export const getStoredProgress = (): ProgressMap => {
  const data = localStorage.getItem(KEYS.PROGRESS);
  return data ? JSON.parse(data) : {};
};

export const saveProgress = (progress: ProgressMap) => {
  localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress));
};

export const updateProgress = (
  id: string,
  result: 'correct' | 'wrong' | 'none' | 'toggle_star'
) => {
  const allProgress = getStoredProgress();
  const current = allProgress[id] || {
    attempts: 0,
    correctAttempts: 0,
    lastResult: 'none',
    starred: false,
    lastSeenAt: 0
  };

  if (result === 'toggle_star') {
    current.starred = !current.starred;
  } else if (result !== 'none') {
    current.attempts += 1;
    if (result === 'correct') {
      current.correctAttempts += 1;
    }
    current.lastResult = result;
    current.lastSeenAt = Date.now();
    
    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const stats = getDailyStats();
    const dayStat = stats[today] || { answered: 0, correct: 0 };
    dayStat.answered += 1;
    if (result === 'correct') dayStat.correct += 1;
    stats[today] = dayStat;
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  }

  allProgress[id] = current;
  saveProgress(allProgress);
  return allProgress;
};

export const getDailyStats = (): Record<string, { answered: number, correct: number }> => {
  const data = localStorage.getItem(KEYS.STATS);
  return data ? JSON.parse(data) : {};
};

export const resetAllData = () => {
  localStorage.clear();
};
