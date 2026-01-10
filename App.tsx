
import React, { useState, useEffect } from 'react';
import { AppScreen, PracticeMode, PracticeRange } from './types';
import { BottomNav } from './components';
import { HomeView, PracticeView, StatsView, ImportQuestionsView, ImportAnswersView } from './views';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(AppScreen.HOME);
  const [practiceMode, setPracticeMode] = useState<PracticeMode>(PracticeMode.SMART);
  const [practiceRange, setPracticeRange] = useState<PracticeRange | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('rl_theme');
    return (saved as 'light' | 'dark') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rl_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const navigateTo = (screen: AppScreen) => {
    setCurrentScreen(screen);
    setPracticeRange(undefined);
  };

  const startPractice = (mode: PracticeMode, range?: PracticeRange) => {
    setPracticeMode(mode);
    setPracticeRange(range);
    setCurrentScreen(AppScreen.PRACTICE);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case AppScreen.HOME:
        return <HomeView onNavigate={navigateTo} onStartPractice={startPractice} />;
      case AppScreen.IMPORT_QUESTIONS:
        return <ImportQuestionsView onBack={() => navigateTo(AppScreen.HOME)} />;
      case AppScreen.IMPORT_ANSWERS:
        return <ImportAnswersView onBack={() => navigateTo(AppScreen.HOME)} />;
      case AppScreen.PRACTICE:
        return <PracticeView mode={practiceMode} range={practiceRange} onExit={() => navigateTo(AppScreen.HOME)} />;
      case AppScreen.STATS:
        return <StatsView />;
      default:
        return <HomeView onNavigate={navigateTo} onStartPractice={startPractice} />;
    }
  };

  const showNav = [AppScreen.HOME, AppScreen.STATS].includes(currentScreen);

  return (
    <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white dark:bg-slate-950 overflow-x-hidden transition-colors duration-200">
      <main className="min-h-screen">
        {renderScreen()}
      </main>
      
      {showNav && (
        <BottomNav 
          active={currentScreen} 
          onNavigate={navigateTo} 
        />
      )}
      
      {currentScreen === AppScreen.HOME && (
         <button 
         onClick={toggleTheme}
         className="fixed top-4 right-4 p-3 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 z-50 shadow-lg border border-slate-200 dark:border-slate-800"
       >
         {theme === 'light' ? '🌙' : '☀️'}
       </button>
      )}
    </div>
  );
};

export default App;
