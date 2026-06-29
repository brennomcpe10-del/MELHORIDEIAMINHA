/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  LayoutDashboard, 
  Calendar, 
  ListTodo, 
  School, 
  Video, 
  BookOpen, 
  Gift, 
  BarChart3, 
  Settings,
  BrainCircuit,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streak: number;
  level: number;
}

export default function Sidebar({ activeTab, setActiveTab, streak, level }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, color: 'text-md3-primary' },
    { id: 'tasks', label: 'Tarefas', icon: ListTodo, color: 'text-md3-success' },
    { id: 'calendar', label: 'Calendário', icon: Calendar, color: 'text-emerald-400' },
    { id: 'school', label: 'Horário Escolar', icon: School, color: 'text-orange-400' },
    { id: 'content', label: 'Criador de Vídeo', icon: Video, color: 'text-red-400' },
    { id: 'studies', label: 'Modelos de Estudo', icon: BookOpen, color: 'text-indigo-400' },
    { id: 'rewards', label: 'Recompensas', icon: Gift, color: 'text-yellow-400' },
    { id: 'stats', label: 'Conquistas & XP', icon: BarChart3, color: 'text-tertiary' },
    { id: 'settings', label: 'Ajustes', icon: Settings, color: 'text-gray-400' },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left side) */}
      <aside 
        id="desktop-sidebar"
        className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 bg-md3-surface border-r border-md3-surface-variant z-30 justify-between py-6 px-4"
      >
        <div className="flex flex-col gap-8">
          {/* Logo Brand area */}
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-md3-primary to-md3-tertiary flex items-center justify-center glow-primary">
              <BrainCircuit className="w-5.5 h-5.5 text-md3-bg font-bold" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-white tracking-wide">FocusFlow</h1>
              <p className="text-[10px] text-md3-outline font-mono">ASSISTENTE INTELIGENTE</p>
            </div>
          </div>

          {/* User Status Bar */}
          <div className="bg-md3-surface-variant/50 border border-md3-surface-variant rounded-2xl p-3.5 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-md3-tertiary-container text-md3-tertiary flex items-center justify-center font-bold text-sm">
                {level}
              </div>
              <div>
                <p className="text-xs text-md3-outline">Nível Atual</p>
                <p className="text-xs font-semibold text-white">PRODIGY</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium">
              <Zap className="w-3.5 h-3.5 fill-current animate-pulse-slow" />
              <span>{streak}d</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  id={`nav-item-${item.id}`}
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-left cursor-pointer group ${
                    isActive 
                      ? 'text-white font-semibold' 
                      : 'text-md3-secondary hover:text-white hover:bg-md3-surface-variant/40'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="active-nav-indicator"
                      className="absolute inset-0 bg-md3-surface-variant border-l-4 border-md3-primary rounded-xl -z-10"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={`w-4.5 h-4.5 transition-transform duration-200 group-hover:scale-110 ${item.color}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info */}
        <div className="px-2 text-[11px] text-md3-outline font-mono">
          <p>FocusFlow v1.0.0</p>
          <p className="text-[10px] opacity-70">© 2026 • Capacitor Ready</p>
        </div>
      </aside>

      {/* Mobile / Tablet Bottom Navigation Bar */}
      <nav 
        id="mobile-bottom-nav"
        className="flex md:hidden fixed bottom-0 left-0 right-0 h-18 bg-md3-surface/95 backdrop-blur-lg border-t border-md3-surface-variant z-40 items-center justify-around px-2 pb-safe shadow-2xl"
      >
        {menuItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              id={`nav-mobile-${item.id}`}
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 relative rounded-xl transition-all ${
                isActive ? 'text-md3-primary font-semibold' : 'text-md3-secondary'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="active-mobile-indicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-md3-primary"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? item.color : 'text-md3-secondary'}`} />
              <span className="text-[9.5px] truncate max-w-16">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
        
        {/* Simple More Options Trigger */}
        <button
          id="nav-mobile-more"
          onClick={() => {
            // Se clicar em mais, alterna para o painel de conquistas ou ajustes como backup
            setActiveTab(activeTab === 'stats' ? 'settings' : 'stats');
          }}
          className={`flex flex-col items-center justify-center py-2 px-3 relative rounded-xl transition-all ${
            ['stats', 'settings', 'rewards', 'studies'].includes(activeTab) ? 'text-md3-primary font-semibold' : 'text-md3-secondary'
          }`}
        >
          {['stats', 'settings', 'rewards', 'studies'].includes(activeTab) && (
            <motion.div 
              layoutId="active-mobile-indicator"
              className="absolute -top-1 w-8 h-1 rounded-full bg-md3-primary"
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <Gift className="w-5 h-5 mb-0.5" />
          <span className="text-[9.5px]">Gamificação</span>
        </button>
      </nav>
    </>
  );
}
