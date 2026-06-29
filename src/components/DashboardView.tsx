/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  Flame, 
  Sparkles, 
  ArrowRight, 
  AlertTriangle,
  Gift,
  Lock,
  Unlock,
  PlayCircle,
  HelpCircle,
  TrendingUp,
  Award,
  ListTodo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Task, SchoolSubject, Reward, UserStats, UserPreferences } from '../types';

interface DashboardProps {
  tasks: Task[];
  subjects: SchoolSubject[];
  preferences: UserPreferences;
  stats: UserStats;
  rewards: Reward[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: string) => void;
  aiAdvice: {
    advice: string;
    summary: string;
    warnings: string[];
    suggestedSequence: Task[];
  };
}

export default function DashboardView({
  tasks,
  subjects,
  preferences,
  stats,
  rewards,
  onToggleTask,
  onNavigate,
  aiAdvice
}: DashboardProps) {
  // Obtenha a data de hoje formatada (YYYY-MM-DD)
  const todayStr = new Date().toISOString().split('T')[0];

  // Tarefas de hoje
  const todayTasks = tasks.filter(t => t.scheduledDate === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.completed);
  
  // Percentual de progresso de hoje
  const todayProgress = todayTasks.length > 0 
    ? Math.round((completedTodayTasks.length / todayTasks.length) * 100) 
    : 100;

  // Próxima tarefa (a mais prioritária agendada para hoje ou no futuro que não esteja concluída)
  const sortedUpcoming = [...tasks]
    .filter(t => !t.completed)
    .sort((a, b) => {
      // 1. Data de agendamento primeiro (compara strings YYYY-MM-DD)
      if (a.scheduledDate && b.scheduledDate) {
        if (a.scheduledDate !== b.scheduledDate) return a.scheduledDate.localeCompare(b.scheduledDate);
      }
      // 2. Prioridade
      const priorityWeight = { alta: 3, media: 2, baixa: 1 };
      const pA = priorityWeight[a.priority] || 1;
      const pB = priorityWeight[b.priority] || 1;
      if (pA !== pB) return pB - pA;
      // 3. Hora de agendamento
      if (a.scheduledTime && b.scheduledTime) return a.scheduledTime.localeCompare(b.scheduledTime);
      return 0;
    });

  const nextTask = sortedUpcoming[0];
  const nextTaskSubject = nextTask?.subjectId 
    ? subjects.find(s => s.id === nextTask.subjectId) 
    : null;

  // Horas produtivas hoje (convertido de minutos)
  const productiveHoursToday = (stats.productiveMinutesToday / 60).toFixed(1);

  // Calcula horas restantes no dia úteis (baseado no limite máximo diário de foco)
  const remainingMinutesToday = Math.max(0, preferences.dailyLimitMinutes - stats.productiveMinutesToday);
  const remainingHoursToday = (remainingMinutesToday / 60).toFixed(1);

  // Filtra as conquistas recentes (desbloqueadas) para exibir
  const unlockedRewardsCount = rewards.filter(r => r.unlocked).length;

  // Frase motivacional baseada no progresso
  const getMotivationalQuote = () => {
    if (todayTasks.length === 0) {
      return {
        title: "Dia Livre e Planejado!",
        quote: "Você não tem tarefas agendadas para hoje. Aproveite para descansar ou revisar conceitos em 'Ajustes'!"
      };
    }
    if (todayProgress === 100) {
      return {
        title: "Perfeição Alcançada! 🎉",
        quote: "Todas as tarefas de hoje foram concluídas com sucesso. Hora de reivindicar suas Recompensas!"
      };
    }
    if (todayProgress >= 70) {
      return {
        title: "Quase lá! Foco total! 🚀",
        quote: "Você completou a maior parte do seu dia. Só mais um gás e você finaliza tudo!"
      };
    }
    if (todayProgress >= 40) {
      return {
        title: "Excelente Progresso!",
        quote: "Sua rotina está fluindo de forma inteligente. Siga a ordem recomendada pela IA."
      };
    }
    return {
      title: "Vamos começar com tudo?",
      quote: "Organização é o segredo do alto rendimento. Complete sua primeira tarefa para subir de nível!"
    };
  };

  const quoteInfo = getMotivationalQuote();

  // Helper para renderizar crachá de prioridade
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'alta':
        return <span className="px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-[10px] font-semibold tracking-wider uppercase border border-red-500/20">ALTA</span>;
      case 'media':
        return <span className="px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-[10px] font-semibold tracking-wider uppercase border border-yellow-500/20">MÉDIA</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-[10px] font-semibold tracking-wider uppercase border border-blue-500/20">BAIXA</span>;
    }
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Banner with level, greeting and Quote */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-md3-surface via-md3-surface to-md3-surface-variant/40 border border-md3-surface-variant p-6 rounded-3xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-md3-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-32 h-32 bg-md3-tertiary/5 rounded-full blur-2xl -z-10 pointer-events-none" />

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono text-md3-primary font-semibold tracking-wider uppercase">Foco Inteligente Ativo</span>
            <div className="w-1.5 h-1.5 rounded-full bg-md3-success animate-pulse" />
          </div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">
            Olá, Brenno!
          </h2>
          <p className="text-sm text-md3-outline max-w-xl">
            Sua rotina escolar e criação de conteúdo foram otimizadas de ponta a ponta.
          </p>
        </div>

        {/* Motivational Widget */}
        <div className="bg-md3-surface-variant/40 border border-md3-surface-variant p-4 rounded-2xl w-full lg:max-w-md">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-md3-warning" />
            <span className="text-xs font-semibold text-white">{quoteInfo.title}</span>
          </div>
          <p className="text-xs text-md3-secondary italic leading-relaxed">
            "{quoteInfo.quote}"
          </p>
        </div>
      </div>

      {/* Grid: 4 Core Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Progress Card */}
        <div id="stat-progress-card" className="bg-md3-surface border border-md3-surface-variant rounded-2xl p-4.5 flex flex-col justify-between h-32 relative">
          <div className="flex items-center justify-between">
            <span className="text-xs text-md3-outline font-medium">Progresso Diário</span>
            <span className="text-lg font-mono font-bold text-md3-primary">{todayProgress}%</span>
          </div>
          <div className="space-y-2">
            <div className="w-full bg-md3-surface-variant rounded-full h-2">
              <motion.div 
                className="bg-md3-primary h-2 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${todayProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <p className="text-[10px] text-md3-outline">
              {completedTodayTasks.length} de {todayTasks.length} tarefas de hoje conclúidas
            </p>
          </div>
        </div>

        {/* Productive Hours */}
        <div id="stat-hours-card" className="bg-md3-surface border border-md3-surface-variant rounded-2xl p-4.5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs text-md3-outline font-medium">Horas Produtivas</span>
            <Clock className="w-4 h-4 text-md3-success" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white font-mono">{productiveHoursToday}h</h3>
            <p className="text-[10px] text-md3-outline mt-1">Concluídas sob foco hoje</p>
          </div>
        </div>

        {/* Time Remaining */}
        <div id="stat-remaining-card" className="bg-md3-surface border border-md3-surface-variant rounded-2xl p-4.5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs text-md3-outline font-medium">Tempo Foco Restante</span>
            <TrendingUp className="w-4 h-4 text-md3-tertiary" />
          </div>
          <div>
            <h3 className="text-2xl font-display font-bold text-white font-mono">{remainingHoursToday}h</h3>
            <p className="text-[10px] text-md3-outline mt-1">Dos {preferences.dailyLimitMinutes}min configurados</p>
          </div>
        </div>

        {/* Rewards Blocked/Unlocked */}
        <div id="stat-rewards-card" className="bg-md3-surface border border-md3-surface-variant rounded-2xl p-4.5 flex flex-col justify-between h-32">
          <div className="flex items-center justify-between">
            <span className="text-xs text-md3-outline font-medium">Recompensas</span>
            <Gift className="w-4 h-4 text-md3-warning" />
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-2xl font-display font-bold text-white font-mono">
                {unlockedRewardsCount}
              </h3>
              <p className="text-[10px] text-md3-outline mt-1">De {rewards.length} liberadas</p>
            </div>
            <button 
              id="view-rewards-btn"
              onClick={() => onNavigate('rewards')}
              className="ml-auto w-8 h-8 rounded-lg bg-md3-surface-variant hover:bg-md3-primary hover:text-md3-bg text-white flex items-center justify-center transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Timeline and Right Smart AI Assistant Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Timeline Tasks of today */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-md3-success" />
              <h3 className="font-display font-bold text-lg text-white">Cronograma do Dia</h3>
            </div>
            <button 
              id="view-all-tasks-btn"
              onClick={() => onNavigate('tasks')}
              className="text-xs text-md3-primary hover:underline flex items-center gap-1"
            >
              Gerenciar Tarefas <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4 min-h-[300px]">
            {todayTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-md3-surface-variant flex items-center justify-center text-md3-outline">
                  <ListTodo className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">Nenhum estudo hoje!</h4>
                  <p className="text-xs text-md3-outline mt-1 max-w-sm">
                    As tarefas escolares e de vídeo são distribuídas automaticamente conforme seu cronograma escolar e horas livres.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {todayTasks.map((task) => {
                    const subj = task.subjectId 
                      ? subjects.find(s => s.id === task.subjectId) 
                      : null;
                      
                    return (
                      <motion.div
                        id={`today-task-card-${task.id}`}
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all ${
                          task.completed 
                            ? 'bg-md3-surface-variant/20 border-md3-surface-variant/40 opacity-60' 
                            : 'bg-md3-surface-variant/40 border-md3-surface-variant hover:border-md3-outline/30'
                        }`}
                      >
                        <button
                          id={`toggle-complete-btn-${task.id}`}
                          onClick={() => onToggleTask(task.id)}
                          className="mt-0.5 text-md3-outline hover:text-md3-success transition-colors cursor-pointer"
                        >
                          {task.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-md3-success fill-md3-success/10" />
                          ) : (
                            <Circle className="w-5 h-5 text-md3-outline" />
                          )}
                        </button>

                        <div className="flex-1 space-y-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold text-white truncate ${task.completed ? 'line-through text-md3-outline' : ''}`}>
                              {task.name}
                            </h4>
                            <span className="text-xs font-mono font-bold text-md3-tertiary">+{task.xp} XP</span>
                          </div>

                          {/* Task details bar */}
                          <div className="flex flex-wrap items-center gap-2 text-xs text-md3-outline">
                            {/* Class badge if school task */}
                            {subj && (
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide border ${subj.color}`}>
                                {subj.name}
                              </span>
                            )}
                            
                            {/* Estimated duration */}
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3.5 h-3.5 text-md3-outline" />
                              {task.estimatedMinutes} min
                            </span>

                            {/* Priority */}
                            {getPriorityBadge(task.priority)}

                            {/* Difficulty */}
                            <span className="px-1.5 py-0.5 rounded bg-md3-surface-variant border border-md3-outline/10 text-[10px] font-mono capitalize">
                              {task.difficulty}
                            </span>

                            {/* Scheduled Time info */}
                            {task.scheduledTime && (
                              <span className="text-[10px] text-md3-primary bg-md3-primary/10 border border-md3-primary/20 px-1.5 py-0.5 rounded font-mono">
                                {task.scheduledTime}
                              </span>
                            )}
                          </div>

                          {task.notes && (
                            <p className="text-xs text-md3-secondary leading-relaxed pt-1 font-sans border-t border-md3-surface-variant mt-1">
                              {task.notes}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Right Smart IA Assistant Panel */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Award className="w-5 h-5 text-md3-tertiary" />
            <h3 className="font-display font-bold text-lg text-white">IA Assistente</h3>
          </div>

          <div className="bg-gradient-to-br from-md3-surface via-md3-surface to-md3-tertiary/5 border border-md3-surface-variant rounded-3xl p-5 space-y-5">
            {/* Advice Text Header */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-md3-tertiary/10 border border-md3-tertiary/20 flex items-center justify-center text-md3-tertiary glow-tertiary">
                  <Sparkles className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-mono text-md3-tertiary tracking-wider font-semibold uppercase">RECOMENDAÇÃO DE FOCO</h4>
                  <p className="text-[10px] text-md3-outline">Análise preditiva em tempo real</p>
                </div>
              </div>
              
              <div className="bg-md3-surface-variant/40 border border-md3-surface-variant p-4 rounded-2xl text-xs text-md3-secondary leading-relaxed space-y-2.5">
                <p>{aiAdvice.advice}</p>
                <p className="font-mono text-[11px] text-md3-outline border-t border-md3-surface-variant pt-2.5">
                  {aiAdvice.summary}
                </p>
              </div>
            </div>

            {/* Smart Alerts Warnings */}
            {aiAdvice.warnings.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono font-semibold text-md3-error tracking-wider uppercase px-1">ALERTA DE PRAZOS</h5>
                <div className="space-y-2">
                  {aiAdvice.warnings.map((warn, i) => (
                    <div key={i} className="flex gap-2.5 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-xs text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed">{warn}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended order list */}
            {aiAdvice.suggestedSequence.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] font-mono font-semibold text-md3-primary tracking-wider uppercase px-1">SEQUÊNCIA RECOMENDADA</h5>
                <div className="space-y-1.5 font-mono">
                  {aiAdvice.suggestedSequence.slice(0, 3).map((task, idx) => (
                    <div 
                      key={task.id} 
                      className="flex items-center gap-2.5 bg-md3-surface-variant/20 border border-md3-surface-variant/50 px-3 py-2 rounded-xl text-xs text-white"
                    >
                      <span className="text-[10px] font-bold text-md3-outline bg-md3-surface-variant px-1.5 py-0.5 rounded">{idx + 1}</span>
                      <span className="truncate flex-1">{task.name}</span>
                      <span className="text-[10px] text-md3-outline">{task.estimatedMinutes}min</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Up Next / Next big task card */}
      {nextTask && (
        <div id="next-task-highlight" className="bg-md3-surface-variant/40 border border-md3-surface-variant rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-[10px] font-mono text-md3-success font-semibold tracking-wider uppercase bg-md3-success/15 border border-md3-success/20 px-2.5 py-1 rounded-full">Próximo Foco Programado</span>
            <h4 className="text-base font-bold text-white font-display pt-1">{nextTask.name}</h4>
            <div className="flex flex-wrap items-center gap-3 text-xs text-md3-outline">
              {nextTaskSubject && (
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${nextTaskSubject.color}`}>
                  {nextTaskSubject.name}
                </span>
              )}
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5" />
                {nextTask.estimatedMinutes} min
              </span>
              <span className="font-mono text-md3-primary">Entrega: {nextTask.dueDate}</span>
            </div>
          </div>
          <button 
            id={`dashboard-focus-task-${nextTask.id}`}
            onClick={() => onToggleTask(nextTask.id)}
            className="w-full md:w-auto px-5 py-2.5 bg-md3-primary text-md3-bg font-bold rounded-2xl hover:bg-white transition-all flex items-center justify-center gap-2 cursor-pointer text-sm shadow-md"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Iniciar & Concluir</span>
          </button>
        </div>
      )}
    </div>
  );
}
