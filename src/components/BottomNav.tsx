import React from 'react';
import { 
  CheckSquare, 
  BarChart3, 
  History, 
  Repeat, 
  User, 
  Plus
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isAction?: boolean;
}

export const BottomNav: React.FC = () => {
  const { activeNavTab, setActiveNavTab, openTaskModal } = useApp();

  const navItems: NavItem[] = [
    { id: 'today', label: 'Today', icon: CheckSquare },
    { id: 'analytics', label: 'Monthly', icon: BarChart3 },
    { id: 'quick_add', label: 'Add', icon: Plus, isAction: true },
    { id: 'history', label: 'Logs', icon: History },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav aria-label="Mobile Navigation" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 pb-safe">
      <div className="flex items-center justify-around px-2 py-1.5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          
          if (item.isAction) {
            return (
              <button
                key={item.id}
                id="btn-mobile-quick-add"
                onClick={() => openTaskModal()}
                className="-mt-5 w-12 h-12 rounded-full bg-blue-600 active:bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 active:scale-90 transition-transform"
                title="Create New Task"
              >
                <Plus className="w-6 h-6 stroke-[2.5]" />
              </button>
            );
          }

          const isActive = activeNavTab === item.id;

          return (
            <button
              key={item.id}
              id={`nav-mobile-${item.id}`}
              onClick={() => setActiveNavTab(item.id as typeof activeNavTab)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition-all duration-150 active:scale-95 ${
                isActive 
                  ? 'text-blue-600 dark:text-blue-400 font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
