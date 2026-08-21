import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { TodayView } from './components/TodayView';
import { MonthlyAnalytics } from './components/MonthlyAnalytics';
import { TimeLogsHistory } from './components/TimeLogsHistory';
import { RoutinesManager } from './components/RoutinesManager';
import { UserProfile } from './components/UserProfile';
import { AuthModal } from './components/modals/AuthModal';
import { TaskModal } from './components/modals/TaskModal';
import { LogModal } from './components/modals/LogModal';

const MainLayout: React.FC = () => {
  const { activeNavTab } = useApp();

  const renderActiveView = () => {
    switch (activeNavTab) {
      case 'today':
        return <TodayView />;
      case 'analytics':
        return <MonthlyAnalytics />;
      case 'history':
        return <TimeLogsHistory />;
      case 'routines':
        return <RoutinesManager />;
      case 'profile':
        return <UserProfile />;
      default:
        return <TodayView />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Navbar />

      {/* Main App Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Center Stage Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 max-w-full overflow-y-auto pb-24 sm:pb-12">
          {renderActiveView()}
        </main>
      </div>

      {/* Mobile Native Bottom Navigation */}
      <BottomNav />

      {/* Global Interactive Modals */}
      <AuthModal />
      <TaskModal />
      <LogModal />

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
