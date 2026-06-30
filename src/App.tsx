/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  Sparkles, 
  Flame, 
  Volume2, 
  VolumeX, 
  Tv, 
  Cpu, 
  LogOut,
  BrainCircuit,
  Info,
  CheckCircle2
} from 'lucide-react';

import { 
  Task, 
  SchoolSubject, 
  SchoolSchedule, 
  Reward, 
  UserStats, 
  UserPreferences, 
  Achievement,
  NotificationMessage
} from './types';

import { 
  autoScheduleTasks, 
  generateAIRecommendations, 
  getDefaultSubjects, 
  getDefaultAchievements,
  formatDateStr,
  generateLiveOccurrences
} from './utils/scheduler';

// Sub-views
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import TasksView from './components/TasksView';
import CalendarView from './components/CalendarView';
import SchoolScheduleView from './components/SchoolScheduleView';
import ContentCreatorView from './components/ContentCreatorView';
import StudyModelsView from './components/StudyModelsView';
import RewardsView from './components/RewardsView';
import StatsView from './components/StatsView';
import SettingsView from './components/SettingsView';

const STORAGE_KEY = 'focusflow_app_state';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App Core States
  const [tasks, setTasks] = useState<Task[]>([]);
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  const [schedule, setSchedule] = useState<SchoolSchedule>({
    segunda: [], terca: [], quarta: [], quinta: [], sexta: [], sabado: [], domingo: []
  });
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<UserStats>({
    level: 1,
    xp: 0,
    xpToNextLevel: 100,
    streak: 1,
    productiveMinutesToday: 0,
    completedTasksCount: 0,
    totalXpGained: 0
  });
  const ensurePreferencesWithCustomWorkHours = (prefs: any): UserPreferences => {
    const base = {
      freeHoursPerDay: 4,
      dailyLimitMinutes: 240,
      restDays: [0],
      schoolHoursStart: '07:00',
      schoolHoursEnd: '12:00',
      workHoursStart: '13:00',
      workHoursEnd: '18:00',
      customFreeTimes: {
        segunda: 4, terca: 4, quarta: 4, quinta: 4, sexta: 4, sabado: 6, domingo: 2
      },
      customWorkHours: {
        segunda: { start: '13:00', end: '18:00', active: true },
        terca: { start: '13:00', end: '18:00', active: true },
        quarta: { start: '13:00', end: '18:00', active: true },
        quinta: { start: '13:00', end: '18:00', active: true },
        sexta: { start: '13:00', end: '18:00', active: true },
        sabado: { start: '13:00', end: '18:00', active: false },
        domingo: { start: '13:00', end: '18:00', active: false }
      }
    };

    const merged = { ...base, ...prefs };
    if (!merged.customWorkHours) {
      merged.customWorkHours = {
        segunda: { start: merged.workHoursStart, end: merged.workHoursEnd, active: true },
        terca: { start: merged.workHoursStart, end: merged.workHoursEnd, active: true },
        quarta: { start: merged.workHoursStart, end: merged.workHoursEnd, active: true },
        quinta: { start: merged.workHoursStart, end: merged.workHoursEnd, active: true },
        sexta: { start: merged.workHoursStart, end: merged.workHoursEnd, active: true },
        sabado: { start: merged.workHoursStart, end: merged.workHoursEnd, active: false },
        domingo: { start: merged.workHoursStart, end: merged.workHoursEnd, active: false }
      };
    }
    return merged;
  };

  const [preferences, setPreferences] = useState<UserPreferences>({
    freeHoursPerDay: 4,
    dailyLimitMinutes: 240,
    restDays: [0], // Domingo como padrão
    schoolHoursStart: '07:00',
    schoolHoursEnd: '12:00',
    workHoursStart: '13:00',
    workHoursEnd: '18:00',
    customFreeTimes: {
      segunda: 4, terca: 4, quarta: 4, quinta: 4, sexta: 4, sabado: 6, domingo: 2
    },
    customWorkHours: {
      segunda: { start: '13:00', end: '18:00', active: true },
      terca: { start: '13:00', end: '18:00', active: true },
      quarta: { start: '13:00', end: '18:00', active: true },
      quinta: { start: '13:00', end: '18:00', active: true },
      sexta: { start: '13:00', end: '18:00', active: true },
      sabado: { start: '13:00', end: '18:00', active: false },
      domingo: { start: '13:00', end: '18:00', active: false }
    }
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [toast, setToast] = useState<{ title: string; desc: string; type: 'success' | 'info' | 'level' } | null>(null);

  const todayStr = formatDateStr(new Date());

  // 1. CARREGA DADOS DO LOCALSTORAGE OU SEED INICIAL
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTasks(parsed.tasks || []);
        setSubjects(parsed.subjects || []);
        setSchedule(parsed.schedule || {});
        setRewards(parsed.rewards || []);
        setStats(parsed.stats || {});
        setPreferences(ensurePreferencesWithCustomWorkHours(parsed.preferences || {}));
        setAchievements(parsed.achievements || []);
        setNotifications(parsed.notifications || []);
        return;
      } catch (err) {
        console.error('Falha ao ler dados do localStorage, recriando...', err);
      }
    }

    // --- SEED INICIAL DE DADOS (Simula um Produto Real Rodando de Primeira) ---
    const initialSubjects = getDefaultSubjects();
    const initialAchievements = getDefaultAchievements();
    
    // Horário Escolar padrão de Brenno
    const initialSchedule: SchoolSchedule = {
      segunda: ['1', '4', '6'], // Matemática, Português, Geografia
      terca: ['2', '5', '8'],   // Física, História, Filosofia
      quarta: ['3', '7', '1'],   // Química, Biologia, Matemática
      quinta: ['4', '2', '6'],   // Português, Física, Geografia
      sexta: ['1', '3', '7'],    // Matemática, Química, Biologia
      sabado: [],
      domingo: []
    };

    // Tarefas escolares, pessoais e conteúdo de exemplo
    const initialTasks: Task[] = [
      {
        id: 'init-task-1',
        name: 'Estudar mecânica clássica e óptica para Física',
        category: 'escola',
        priority: 'alta',
        estimatedMinutes: 60,
        dueDate: todayStr,
        recurrence: 'nao',
        difficulty: 'media',
        xp: 30,
        notes: 'Revisar equações de refração e cinemática.',
        completed: false,
        subjectId: '2', // Física
        originSource: 'manual',
        scheduledDate: todayStr,
        scheduledTime: '14:00'
      },
      {
        id: 'init-task-2',
        name: 'Fazer exercícios de fixação de matrizes',
        category: 'escola',
        priority: 'media',
        estimatedMinutes: 45,
        dueDate: todayStr,
        recurrence: 'nao',
        difficulty: 'media',
        xp: 25,
        notes: 'Responder lista entregue pelo professor na última segunda.',
        completed: false,
        subjectId: '1', // Matemática
        originSource: 'manual',
        scheduledDate: todayStr,
        scheduledTime: '15:15'
      },
      {
        id: 'init-task-3',
        name: 'Planejar roteiro do próximo vídeo do TikTok',
        category: 'conteudo',
        priority: 'baixa',
        estimatedMinutes: 30,
        dueDate: todayStr,
        recurrence: 'nao',
        difficulty: 'facil',
        xp: 15,
        notes: 'Tema: Como programar em celular Android',
        completed: false,
        originSource: 'manual',
        scheduledDate: todayStr,
        scheduledTime: '16:30'
      }
    ];

    // Recompensas sugeridas configuradas
    const initialRewards: Reward[] = [
      { id: 'rew-1', name: 'Assistir 2 episódios de One Piece', type: 'One Piece', unlockConditionType: 'xp', unlockConditionValue: 50, unlocked: false },
      { id: 'rew-2', name: 'Jogar 1 hora de Minecraft', type: 'Minecraft', unlockConditionType: 'prioritarias', unlockConditionValue: 1, unlocked: false },
      { id: 'rew-3', name: 'Navegar 20min no TikTok', type: 'TikTok', unlockConditionType: 'todas_do_dia', unlockConditionValue: 1, unlocked: false },
      { id: 'rew-4', name: 'Assistir YouTube sem culpa', type: 'YouTube', unlockConditionType: 'xp', unlockConditionValue: 80, unlocked: false }
    ];

    // Inicializa estados
    setSubjects(initialSubjects);
    setSchedule(initialSchedule);
    setRewards(initialRewards);
    setAchievements(initialAchievements);

    // Organiza as tarefas iniciais de forma automática
    const scheduled = autoScheduleTasks(
      initialTasks,
      preferences,
      initialSchedule,
      initialSubjects,
      todayStr
    );
    setTasks(scheduled);

    // Salva o primeiro estado
    saveStateToStorage({
      tasks: scheduled,
      subjects: initialSubjects,
      schedule: initialSchedule,
      rewards: initialRewards,
      stats,
      preferences,
      achievements: initialAchievements,
      notifications: []
    });
  }, []);

  // 2. ESCREVE MODIFICAÇÕES NO LOCALSTORAGE
  const saveStateToStorage = (stateToSave: {
    tasks: Task[];
    subjects: SchoolSubject[];
    schedule: SchoolSchedule;
    rewards: Reward[];
    stats: UserStats;
    preferences: UserPreferences;
    achievements: Achievement[];
    notifications: NotificationMessage[];
  }) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  };

  // 3. REORGANIZAÇÃO GERAL DA AGENDA (TRIGGER DE RE-CALCULO)
  const handleTriggerReschedule = (currentTasks = tasks, currentPrefs = preferences, currentSchedule = schedule, currentSubjects = subjects) => {
    const recalculated = autoScheduleTasks(
      currentTasks,
      currentPrefs,
      currentSchedule,
      currentSubjects,
      todayStr
    );
    setTasks(recalculated);

    saveStateToStorage({
      tasks: recalculated,
      subjects: currentSubjects,
      schedule: currentSchedule,
      rewards,
      stats,
      preferences: currentPrefs,
      achievements,
      notifications
    });

    showToast('Agenda Otimizada', 'A IA reorganizou suas tarefas de acordo com sua disponibilidade!', 'info');
  };

  // 4. CONCLUSÃO DE TAREFA (GERENCIA XP, NÍVEL, CONQUISTAS)
  const handleToggleTask = (taskId: string) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const isNowCompleted = !task.completed;
        return {
          ...task,
          completed: isNowCompleted,
          completedAt: isNowCompleted ? new Date().toISOString() : undefined
        };
      }
      return task;
    });

    setTasks(updatedTasks);

    const changedTask = updatedTasks.find(t => t.id === taskId);
    if (!changedTask) return;

    let updatedStats = { ...stats };

    if (changedTask.completed) {
      // 1. Soma XP e minutos produtivos
      updatedStats.xp += changedTask.xp;
      updatedStats.totalXpGained += changedTask.xp;
      updatedStats.productiveMinutesToday += changedTask.estimatedMinutes;
      updatedStats.completedTasksCount += 1;
      updatedStats.lastCompletedDate = todayStr;

      showToast('Tarefa Concluída!', `+${changedTask.xp} XP acumulado.`, 'success');

      // 2. Lógica de Level Up
      if (updatedStats.xp >= updatedStats.xpToNextLevel) {
        updatedStats.xp -= updatedStats.xpToNextLevel;
        updatedStats.level += 1;
        updatedStats.xpToNextLevel = updatedStats.level * 100; // Níveis seguintes exigem mais XP

        showToast('Subiu de Nível! 🎉', `Você agora é nível ${updatedStats.level}! Continue voando!`, 'level');
      }

      // 3. Checagem de Conquistas (Achievements)
      const updatedAchievements = achievements.map((ach) => {
        if (ach.unlocked) return ach;

        let shouldUnlock = false;
        if (ach.id === 'ach-1' && updatedStats.completedTasksCount >= 1) shouldUnlock = true;
        if (ach.id === 'ach-2' && updatedStats.productiveMinutesToday >= 100) shouldUnlock = true;
        if (ach.id === 'ach-5' && updatedStats.level >= 5) shouldUnlock = true;
        if (ach.id === 'ach-7' && updatedStats.streak >= 3) shouldUnlock = true;
        
        if (ach.id === 'ach-3' && (
          schedule.segunda.length > 0 ||
          schedule.terca.length > 0 ||
          schedule.quarta.length > 0 ||
          schedule.quinta.length > 0 ||
          schedule.sexta.length > 0 ||
          schedule.sabado.length > 0 ||
          schedule.domingo.length > 0
        )) {
          // Cadastrou horário escolar
          shouldUnlock = true;
        }
        if (ach.id === 'ach-4' && updatedTasks.some(t => t.id.startsWith('vid-'))) {
          // Planejou vídeo
          shouldUnlock = true;
        }

        if (shouldUnlock) {
          showToast('Conquista Desbloqueada!', ach.title, 'success');
          return {
            ...ach,
            unlocked: true,
            unlockedAt: new Date().toLocaleDateString('pt-BR')
          };
        }
        return ach;
      });

      setAchievements(updatedAchievements);
      setStats(updatedStats);

      // Re-agenda o restante
      const recalculated = autoScheduleTasks(
        updatedTasks,
        preferences,
        schedule,
        subjects,
        todayStr
      );
      setTasks(recalculated);

      saveStateToStorage({
        tasks: recalculated,
        subjects,
        schedule,
        rewards,
        stats: updatedStats,
        preferences,
        achievements: updatedAchievements,
        notifications
      });
    } else {
      // Caso desmarque tarefa como concluída
      updatedStats.xp = Math.max(0, updatedStats.xp - changedTask.xp);
      updatedStats.totalXpGained = Math.max(0, updatedStats.totalXpGained - changedTask.xp);
      updatedStats.productiveMinutesToday = Math.max(0, updatedStats.productiveMinutesToday - changedTask.estimatedMinutes);
      updatedStats.completedTasksCount = Math.max(0, updatedStats.completedTasksCount - 1);
      
      setStats(updatedStats);

      const recalculated = autoScheduleTasks(
        updatedTasks,
        preferences,
        schedule,
        subjects,
        todayStr
      );
      setTasks(recalculated);

      saveStateToStorage({
        tasks: recalculated,
        subjects,
        schedule,
        rewards,
        stats: updatedStats,
        preferences,
        achievements,
        notifications
      });
    }
  };

  // 5. REMOVE UMA TAREFA
  const handleDeleteTask = (taskId: string) => {
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    
    // Recalcula sem ela
    handleTriggerReschedule(updated, preferences, schedule, subjects);
  };

  const handleDeleteTaskSeries = (seriesId: string, fromDate: string) => {
    const updated = tasks.filter(t => !(t.liveSeriesId === seriesId && t.scheduledDate && t.scheduledDate >= fromDate));
    setTasks(updated);
    handleTriggerReschedule(updated, preferences, schedule, subjects);
    showToast('Série Removida', 'As ocorrências futuras da série de lives foram canceladas.', 'info');
  };

  const handleEditTaskSeries = (seriesId: string, fromDate: string, updatedFields: any) => {
    const filteredTasks = tasks.filter(t => !(t.liveSeriesId === seriesId && t.scheduledDate && t.scheduledDate >= fromDate));
    
    const newOccurrences = generateLiveOccurrences(
      updatedFields.name.replace(/^🔴 Live:\s*/, ''),
      updatedFields.liveGameOrTheme,
      updatedFields.livePlatform,
      updatedFields.livePlatformCustom || '',
      fromDate,
      updatedFields.scheduledTime,
      updatedFields.estimatedMinutes,
      updatedFields.priority,
      updatedFields.notes || '',
      updatedFields.liveRecurrence,
      updatedFields.liveRecurrenceDays || []
    );

    const newOccurrencesWithSameSeriesId = newOccurrences.map(t => ({
      ...t,
      liveSeriesId: seriesId
    }));

    const finalTasks = [...filteredTasks, ...newOccurrencesWithSameSeriesId];
    setTasks(finalTasks);
    handleTriggerReschedule(finalTasks, preferences, schedule, subjects);
    showToast('Série Atualizada', 'As ocorrências futuras da série de lives foram atualizadas.', 'success');
  };

  const handleEditTask = (taskId: string, updatedFields: Partial<Task>) => {
    const updated = tasks.map(t => t.id === taskId ? { ...t, ...updatedFields } : t);
    setTasks(updated);
    handleTriggerReschedule(updated, preferences, schedule, subjects);
    showToast('Tarefa Atualizada', 'A tarefa foi atualizada com sucesso!', 'success');
  };

  // 6. ADICIONA MÚLTIPLAS TAREFAS (Chamado pelos wizards da escola, vídeo, estudos)
  const handleAddTasks = (newTasks: Task[]) => {
    const updatedTasksList = [...tasks, ...newTasks];
    setTasks(updatedTasksList);
    
    // Agenda automaticamente na fila vazia
    handleTriggerReschedule(updatedTasksList, preferences, schedule, subjects);
    showToast('Planejamento Gerado', `${newTasks.length} novas tarefas distribuídas na agenda!`, 'success');
  };

  // 7. DRAG & DROP / CLICK PARA MOVER TAREFAS ENTRE DATAS DO CALENDÁRIO
  const handleMoveTask = (taskId: string, targetDate: string) => {
    const updated = tasks.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          scheduledDate: targetDate
        };
      }
      return task;
    });

    setTasks(updated);
    
    // Salva o reagendamento e recalcula o restante do funil sem sobrescrever o dia fixado do movido
    saveStateToStorage({
      tasks: updated,
      subjects,
      schedule,
      rewards,
      stats,
      preferences,
      achievements,
      notifications
    });

    showToast('Tarefa Reagendada', 'A IA reposicionou o foco e calibrou os horários restantes.', 'info');
  };

  // 8. CRIAÇÕES DE MATÉRIA ESCOLAR E UPDATE DO CRONOGRAMA DE AULAS
  const handleAddSubject = (name: string, color: string) => {
    const newSubj: SchoolSubject = {
      id: `subj-${Date.now()}`,
      name,
      color
    };
    const updated = [...subjects, newSubj];
    setSubjects(updated);

    saveStateToStorage({
      tasks,
      subjects: updated,
      schedule,
      rewards,
      stats,
      preferences,
      achievements,
      notifications
    });

    showToast('Matéria Cadastrada', `${name} adicionada com sucesso.`, 'success');
  };

  const handleDeleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);

    // Limpa matérias do cronograma semanal de aulas
    const updatedSchedule = { ...schedule };
    Object.keys(updatedSchedule).forEach((day) => {
      const d = day as keyof SchoolSchedule;
      updatedSchedule[d] = updatedSchedule[d].filter(subId => subId !== id);
    });
    setSchedule(updatedSchedule);

    saveStateToStorage({
      tasks,
      subjects: updated,
      schedule: updatedSchedule,
      rewards,
      stats,
      preferences,
      achievements,
      notifications
    });
  };

  const handleUpdateSchedule = (day: keyof SchoolSchedule, subjectIds: string[]) => {
    const updatedSchedule = {
      ...schedule,
      [day]: subjectIds
    };
    setSchedule(updatedSchedule);

    saveStateToStorage({
      tasks,
      subjects,
      schedule: updatedSchedule,
      rewards,
      stats,
      preferences,
      achievements,
      notifications
    });
  };

  // 9. CONFIGURAÇÃO DE RECOMPENSAS
  const handleAddReward = (name: string, type: Reward['type'], conditionType: Reward['unlockConditionType'], conditionValue: number) => {
    const newRew: Reward = {
      id: `rew-${Date.now()}`,
      name,
      type,
      unlockConditionType: conditionType,
      unlockConditionValue: conditionValue,
      unlocked: false
    };

    const updated = [...rewards, newRew];
    setRewards(updated);

    saveStateToStorage({
      tasks,
      subjects,
      schedule,
      rewards: updated,
      stats,
      preferences,
      achievements,
      notifications
    });

    showToast('Recompensa Criada', 'Novo bloqueio de lazer ativado com sucesso!', 'success');
  };

  const handleDeleteReward = (id: string) => {
    const updated = rewards.filter(r => r.id !== id);
    setRewards(updated);

    saveStateToStorage({
      tasks,
      subjects,
      schedule,
      rewards: updated,
      stats,
      preferences,
      achievements,
      notifications
    });
  };

  const handleClaimReward = (id: string) => {
    const updated = rewards.map((rew) => {
      if (rew.id === id) {
        return { ...rew, unlocked: true };
      }
      return rew;
    });
    setRewards(updated);

    // Unlocks One Piece badge achievement if applicable
    const claimedReward = updated.find(r => r.id === id);
    let updatedAchievements = [...achievements];
    if (claimedReward?.type === 'One Piece') {
      updatedAchievements = achievements.map(ach => {
        if (ach.id === 'ach-6') {
          return { ...ach, unlocked: true, unlockedAt: new Date().toLocaleDateString('pt-BR') };
        }
        return ach;
      });
      setAchievements(updatedAchievements);
    }

    saveStateToStorage({
      tasks,
      subjects,
      schedule,
      rewards: updated,
      stats,
      preferences,
      achievements: updatedAchievements,
      notifications
    });

    showToast('Lazer Liberado! 🎉', `Aproveite sua recompensa! Você mereceu.`, 'level');
  };

  // 10. PREFERÊNCIAS E AJUSTES DE BANCO DE DADOS
  const handleUpdatePreferences = (newPrefs: UserPreferences) => {
    setPreferences(newPrefs);
    
    // Redistribui a agenda com base nas novas regras de tempo
    handleTriggerReschedule(tasks, newPrefs, schedule, subjects);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const handleExportData = () => {
    const state = {
      tasks,
      subjects,
      schedule,
      rewards,
      stats,
      preferences,
      achievements,
      notifications
    };
    return JSON.stringify(state, null, 2);
  };

  const handleImportData = (jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.tasks && parsed.subjects && parsed.schedule) {
        setTasks(parsed.tasks);
        setSubjects(parsed.subjects);
        setSchedule(parsed.schedule);
        setRewards(parsed.rewards || []);
        setStats(parsed.stats || stats);
        setPreferences(ensurePreferencesWithCustomWorkHours(parsed.preferences || preferences));
        setAchievements(parsed.achievements || achievements);
        setNotifications(parsed.notifications || []);
        
        saveStateToStorage(parsed);
        return true;
      }
    } catch (e) {
      console.error(e);
    }
    return false;
  };

  // Toast Helper
  const showToast = (title: string, desc: string, type: 'success' | 'info' | 'level') => {
    setToast({ title, desc, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Calcula conselhos de IA no tempo de renderização (rápido e contextual!)
  const aiAdvice = generateAIRecommendations(
    tasks,
    preferences,
    schedule,
    subjects,
    todayStr
  );

  return (
    <div id="app-root" className="min-h-screen bg-md3-bg text-gray-200 font-sans md:pl-64 pb-20 md:pb-0 relative">
      
      {/* Notion-style header strip */}
      <header className="sticky top-0 bg-md3-bg/85 backdrop-blur-md z-20 border-b border-md3-surface-variant/30 py-4 px-4 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile visible logo brand */}
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-md3-primary to-md3-tertiary flex md:hidden items-center justify-center">
            <BrainCircuit className="w-4.5 h-4.5 text-md3-bg" />
          </div>
          <div className="text-xs text-md3-outline font-mono uppercase tracking-widest font-bold">
            ⚡ FocusFlow • {activeTab}
          </div>
        </div>

        {/* Level & Streak Stats Header Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-full text-xs">
            <Flame className="w-3.5 h-3.5 text-orange-400 fill-current animate-pulse-slow" />
            <span className="font-mono text-white font-bold">{stats.streak} dias</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-md3-outline font-mono">Nível {stats.level}</span>
            <div className="w-14 bg-md3-surface-variant rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-md3-primary h-full" 
                style={{ width: `${Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100))}%` }} 
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === 'dashboard' && (
              <DashboardView
                tasks={tasks}
                subjects={subjects}
                preferences={preferences}
                stats={stats}
                rewards={rewards}
                onToggleTask={handleToggleTask}
                onNavigate={setActiveTab}
                aiAdvice={aiAdvice}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksView
                tasks={tasks}
                subjects={subjects}
                schedule={schedule}
                onAddTasks={handleAddTasks}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onDeleteTaskSeries={handleDeleteTaskSeries}
                onEditTaskSeries={handleEditTaskSeries}
                onEditTask={handleEditTask}
                onTriggerReschedule={() => handleTriggerReschedule(tasks, preferences, schedule, subjects)}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                tasks={tasks}
                subjects={subjects}
                onMoveTask={handleMoveTask}
              />
            )}

            {activeTab === 'school' && (
              <SchoolScheduleView
                subjects={subjects}
                schedule={schedule}
                onAddSubject={handleAddSubject}
                onDeleteSubject={handleDeleteSubject}
                onUpdateSchedule={handleUpdateSchedule}
              />
            )}

            {activeTab === 'content' && (
              <ContentCreatorView
                tasks={tasks}
                onNavigateToTasks={() => setActiveTab('tasks')}
              />
            )}

            {activeTab === 'studies' && (
              <StudyModelsView
                subjects={subjects}
                onAddTasks={handleAddTasks}
              />
            )}

            {activeTab === 'rewards' && (
              <RewardsView
                rewards={rewards}
                tasks={tasks}
                stats={stats}
                onAddReward={handleAddReward}
                onDeleteReward={handleDeleteReward}
                onClaimReward={handleClaimReward}
              />
            )}

            {activeTab === 'stats' && (
              <StatsView
                stats={stats}
                achievements={achievements}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                preferences={preferences}
                onUpdatePreferences={handleUpdatePreferences}
                onResetData={handleResetData}
                onImportData={handleImportData}
                onExportData={handleExportData}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Sidebar (Desktop left navigation rail / Mobile bottom bar controller) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        streak={stats.streak} 
        level={stats.level} 
      />

      {/* Floating Interactive Toast notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            id="toast-notification"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className={`fixed bottom-20 md:bottom-6 right-4 md:right-8 p-4 rounded-2xl border shadow-2xl z-50 flex items-start gap-3 max-w-sm glass-panel ${
              toast.type === 'success' 
                ? 'border-md3-success/30 border-l-4 border-l-md3-success' 
                : toast.type === 'level' 
                  ? 'border-md3-tertiary/30 border-l-4 border-l-md3-tertiary glow-tertiary' 
                  : 'border-md3-primary/30 border-l-4 border-l-md3-primary'
            }`}
          >
            <div className={`p-1.5 rounded-lg shrink-0 ${
              toast.type === 'success' 
                ? 'bg-md3-success/15 text-md3-success' 
                : toast.type === 'level' 
                  ? 'bg-md3-tertiary/15 text-md3-tertiary' 
                  : 'bg-md3-primary/15 text-md3-primary'
            }`}>
              {toast.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h5 className="text-xs font-bold text-white">{toast.title}</h5>
              <p className="text-[11px] text-md3-outline mt-0.5 leading-relaxed">{toast.desc}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
