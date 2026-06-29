/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Task, SchoolSchedule, SchoolSubject, UserPreferences } from '../types';

const WEEKDAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'] as const;
type WeekdayName = typeof WEEKDAYS[number];

/**
 * Converte uma data YYYY-MM-DD em dia da semana (ex: 'segunda', 'terca'...)
 */
export function getWeekdayName(dateStr: string): WeekdayName {
  const date = new Date(dateStr + 'T12:00:00'); // Evita fuso horário movendo pro meio do dia
  const dayIndex = date.getDay();
  return WEEKDAYS[dayIndex];
}

/**
 * Formata data Date para string YYYY-MM-DD
 */
export function formatDateStr(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Obtém uma lista das próximas datas (strings YYYY-MM-DD) a partir de uma data inicial
 */
export function getUpcomingDates(startDateStr: string, count: number): string[] {
  const list: string[] = [];
  const start = new Date(startDateStr + 'T12:00:00');
  for (let i = 0; i < count; i++) {
    const next = new Date(start);
    next.setDate(start.getDate() + i);
    list.push(formatDateStr(next));
  }
  return list;
}

/**
 * Descobre automaticamente quando será a próxima aula de uma matéria escolar.
 * Retorna a data em formato YYYY-MM-DD.
 */
export function findNextClassDate(
  subjectId: string,
  schedule: SchoolSchedule,
  startDateStr: string
): string {
  const start = new Date(startDateStr + 'T12:00:00');
  
  // Percorre até 14 dias para frente para encontrar a próxima aula
  for (let i = 1; i <= 14; i++) {
    const targetDate = new Date(start);
    targetDate.setDate(start.getDate() + i);
    const dayName = getWeekdayName(formatDateStr(targetDate)) as keyof SchoolSchedule;
    
    const classesOnDay = schedule[dayName] || [];
    if (classesOnDay.includes(subjectId)) {
      return formatDateStr(targetDate);
    }
  }
  
  // Se não encontrar no horário, retorna daqui a 7 dias como padrão
  const fallbackDate = new Date(start);
  fallbackDate.setDate(start.getDate() + 7);
  return formatDateStr(fallbackDate);
}

/**
 * Converte string HH:MM para minutos desde a meia-noite
 */
function hhmmToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hStr, mStr] = timeStr.split(':');
  return (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0);
}

/**
 * Converte minutos para string HH:MM
 */
function minutesToHHMM(m: number): string {
  const h = Math.floor(m / 60);
  const mins = m % 60;
  return `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Gera os blocos livres de tempo para um determinado dia respeitando school, work e rest days.
 */
function getDailyFreeIntervals(
  dateStr: string,
  preferences: UserPreferences,
  schedule: SchoolSchedule,
  completedTasks: Task[]
): { start: number; end: number }[] {
  const weekday = getWeekdayName(dateStr);
  const dayIndex = WEEKDAYS.indexOf(weekday);
  const isRestDay = preferences.restDays.includes(dayIndex);

  // Determina limite de horas livres para este dia
  const baseFreeHours = preferences.customFreeTimes[weekday as keyof typeof preferences.customFreeTimes] !== undefined
    ? preferences.customFreeTimes[weekday as keyof typeof preferences.customFreeTimes]
    : preferences.freeHoursPerDay;

  // Carga das tarefas completadas já agendadas para este dia
  const completedLoad = completedTasks
    .filter(t => t.scheduledDate === dateStr)
    .reduce((sum, t) => sum + t.estimatedMinutes, 0);

  const maxFreeMinutes = Math.max(0, (isRestDay ? 30 : baseFreeHours * 60) - completedLoad);

  if (maxFreeMinutes <= 0) {
    return [];
  }

  // Parse dos limites de escola e trabalho
  const schoolStart = hhmmToMinutes(preferences.schoolHoursStart || "07:00");
  const schoolEnd = hhmmToMinutes(preferences.schoolHoursEnd || "12:00");

  let hasWork = false;
  let workStart = hhmmToMinutes(preferences.workHoursStart || "13:00");
  let workEnd = hhmmToMinutes(preferences.workHoursEnd || "18:00");

  if (preferences.customWorkHours && preferences.customWorkHours[weekday as keyof typeof preferences.customWorkHours]) {
    const dailyWork = preferences.customWorkHours[weekday as keyof typeof preferences.customWorkHours];
    hasWork = dailyWork.active;
    workStart = hhmmToMinutes(dailyWork.start);
    workEnd = hhmmToMinutes(dailyWork.end);
  } else {
    hasWork = weekday !== 'sabado' && weekday !== 'domingo';
  }

  const hasSchool = schedule[weekday as keyof SchoolSchedule]?.length > 0;

  // Constrói minutos não-bloqueados no período de vigília (06:00 a 22:00)
  const unblockedMinutes: number[] = [];
  for (let m = 360; m < 1320; m++) {
    const inSchool = hasSchool && (m >= schoolStart && m < schoolEnd);
    const inWork = hasWork && (m >= workStart && m < workEnd);
    if (!inSchool && !inWork) {
      unblockedMinutes.push(m);
    }
  }

  if (unblockedMinutes.length === 0) {
    return [];
  }

  // Atribui prioridades para os horários livres (1 = melhor, 5 = menos preferível)
  const getPriority = (m: number): number => {
    if (m >= 1080 && m < 1320) return 1; // Fim de tarde / Noite (18:00 - 22:00)
    if (m >= 720 && m < 780) return 2;   // Almoço / Pós-aula (12:00 - 13:00)
    if (m >= 780 && m < 1080) return 3;  // Tarde (13:00 - 18:00)
    if (m >= 480 && m < 720) return 4;   // Manhã (08:00 - 12:00)
    return 5;                            // Início do dia (06:00 - 08:00)
  };

  const prioritizedMinutes = [...unblockedMinutes].sort((a, b) => {
    const pA = getPriority(a);
    const pB = getPriority(b);
    if (pA !== pB) return pA - pB;
    return a - b;
  });

  // Filtra apenas o limite de tempo configurado do usuário
  const selectedMinutes = prioritizedMinutes.slice(0, maxFreeMinutes);

  // Ordena cronologicamente para agrupar em intervalos contínuos
  selectedMinutes.sort((a, b) => a - b);

  const intervals: { start: number; end: number }[] = [];
  if (selectedMinutes.length > 0) {
    let start = selectedMinutes[0];
    let prev = selectedMinutes[0];

    for (let i = 1; i < selectedMinutes.length; i++) {
      const curr = selectedMinutes[i];
      if (curr === prev + 1) {
        prev = curr;
      } else {
        intervals.push({ start, end: prev + 1 });
        start = curr;
        prev = curr;
      }
    }
    intervals.push({ start, end: prev + 1 });
  }

  return intervals;
}

/**
 * Aloca as partes de uma tarefa nos blocos livres dos dias válidos de forma transacional.
 */
function allocateTaskParts(
  task: Task,
  dailyFreeIntervals: { [date: string]: { start: number; end: number }[] },
  validDates: string[]
): { date: string; time: string; duration: number }[] | null {
  let rem = task.estimatedMinutes;
  const allocations: { date: string; time: string; duration: number }[] = [];

  // Cria backup dos intervalos livres caso precise reverter (transação falhar)
  const backup: { [date: string]: { start: number; end: number }[] } = {};
  for (const d of validDates) {
    backup[d] = dailyFreeIntervals[d].map(interval => ({ ...interval }));
  }

  for (const dateStr of validDates) {
    const intervals = dailyFreeIntervals[dateStr];
    for (let i = 0; i < intervals.length; i++) {
      const interval = intervals[i];
      const capacity = interval.end - interval.start;
      if (capacity > 0) {
        const alloc = Math.min(rem, capacity);
        allocations.push({
          date: dateStr,
          time: minutesToHHMM(interval.start),
          duration: alloc
        });

        // Encolhe o intervalo livre consumido
        interval.start += alloc;
        rem -= alloc;

        if (rem === 0) {
          return allocations;
        }
      }
    }
  }

  // Falhou ao alocar completamente: reverte alterações nos blocos livres e retorna nulo
  for (const d of validDates) {
    dailyFreeIntervals[d] = backup[d];
  }
  return null;
}

/**
 * Organiza de forma inteligente as tarefas nos dias disponíveis.
 * Retorna uma nova lista de tarefas atualizada com `scheduledDate` e `scheduledTime`.
 */
export function autoScheduleTasks(
  tasks: Task[],
  preferences: UserPreferences,
  schedule: SchoolSchedule,
  subjects: SchoolSubject[],
  todayStr: string
): Task[] {
  // Filtra as tarefas completadas e ativas
  const completedTasks = tasks.filter(t => t.completed);
  const activeTasks = tasks.filter(t => !t.completed);

  // 1. Reconstituição de tarefas ativas que foram divididas anteriormente
  const partPattern = /(.+)-part-\d+$/;
  const nonPartActiveTasks: Task[] = [];
  const partGroups: { [baseId: string]: Task[] } = {};

  for (const t of activeTasks) {
    const match = t.id.match(partPattern);
    if (match) {
      const baseId = match[1];
      if (!partGroups[baseId]) {
        partGroups[baseId] = [];
      }
      partGroups[baseId].push(t);
    } else {
      nonPartActiveTasks.push(t);
    }
  }

  const reconstitutedActiveTasks = [...nonPartActiveTasks];

  for (const [baseId, parts] of Object.entries(partGroups)) {
    parts.sort((a, b) => a.id.localeCompare(b.id));
    const firstPart = parts[0];
    
    // Remove o sufixo "(Parte X/Y)" do nome
    const cleanName = firstPart.name.replace(/\s*\(Parte\s+\d+\/\d+\)$/i, '');
    const totalMinutes = parts.reduce((sum, p) => sum + p.estimatedMinutes, 0);
    const totalXP = parts.reduce((sum, p) => sum + p.xp, 0);

    const mergedTask: Task = {
      ...firstPart,
      id: baseId,
      name: cleanName,
      estimatedMinutes: totalMinutes,
      xp: totalXP,
      scheduledDate: undefined,
      scheduledTime: undefined,
    };
    reconstitutedActiveTasks.push(mergedTask);
  }

  // 2. Ordena tarefas por relevância acadêmica/prazos urgentes
  const sortedTasks = [...reconstitutedActiveTasks].sort((a, b) => {
    // Prazos mais curtos primeiro
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    // Prioridade mais alta primeiro
    const priorityWeight = { alta: 3, media: 2, baixa: 1 };
    const pA = priorityWeight[a.priority] || 1;
    const pB = priorityWeight[b.priority] || 1;
    if (pA !== pB) return pB - pA;
    
    // Tarefas maiores primeiro para ocupar os melhores blocos primeiro
    return b.estimatedMinutes - a.estimatedMinutes;
  });

  // 3. Inicializa os blocos livres de tempo para cada data dos próximos 30 dias
  const futureDates = getUpcomingDates(todayStr, 30);
  const dailyFreeIntervals: { [date: string]: { start: number; end: number }[] } = {};

  for (const dateStr of futureDates) {
    dailyFreeIntervals[dateStr] = getDailyFreeIntervals(dateStr, preferences, schedule, completedTasks);
  }

  const scheduledActiveTasks: Task[] = [];

  // 4. Aloca cada tarefa respeitando todas as regras
  for (const task of sortedTasks) {
    // Filtra datas válidas de hoje até o prazo final da tarefa
    let validDates = futureDates.filter(d => d >= todayStr && d <= task.dueDate);

    // Regra da matéria escolar: distribuir apenas nos horários livres ANTERIORES à próxima aula
    if (task.category === 'escola' && task.subjectId) {
      const nextClassDate = findNextClassDate(task.subjectId, schedule, todayStr);
      validDates = validDates.filter(d => d < nextClassDate);
    }

    // Tenta agendar a tarefa de forma inteligente e contínua
    const allocations = allocateTaskParts(task, dailyFreeIntervals, validDates);

    if (allocations && allocations.length > 0) {
      if (allocations.length === 1) {
        // Alocado em um único bloco livre
        const alloc = allocations[0];
        task.scheduledDate = alloc.date;
        task.scheduledTime = alloc.time;
        scheduledActiveTasks.push(task);
      } else {
        // Dividido em múltiplos blocos livres no mesmo dia ou em dias diferentes
        const totalDur = allocations.reduce((sum, a) => sum + a.duration, 0);
        
        allocations.forEach((alloc, idx) => {
          const partXp = Math.max(5, Math.round(task.xp * (alloc.duration / totalDur)));
          const partTask: Task = {
            ...task,
            id: `${task.id}-part-${idx + 1}`,
            name: `${task.name} (Parte ${idx + 1}/${allocations.length})`,
            estimatedMinutes: alloc.duration,
            xp: partXp,
            scheduledDate: alloc.date,
            scheduledTime: alloc.time,
          };
          scheduledActiveTasks.push(partTask);
        });
      }
    } else {
      // Se não há horário livre disponível antes do prazo, a tarefa fica SEM agendamento
      task.scheduledDate = undefined;
      task.scheduledTime = undefined;
      scheduledActiveTasks.push(task);
    }
  }

  return [...completedTasks, ...scheduledActiveTasks];
}

/**
 * Gera conselhos de IA baseados no contexto do usuário e tarefas ativas
 */
export function generateAIRecommendations(
  tasks: Task[],
  preferences: UserPreferences,
  schedule: SchoolSchedule,
  subjects: SchoolSubject[],
  todayStr: string
): {
  advice: string;
  summary: string;
  warnings: string[];
  suggestedSequence: Task[];
} {
  const activeTasks = tasks.filter(t => !t.completed);
  const todayWeekday = getWeekdayName(todayStr);
  const isTodayRestDay = preferences.restDays.includes(WEEKDAYS.indexOf(todayWeekday));
  
  // Horas livres de hoje
  const todayFreeHours = preferences.customFreeTimes[todayWeekday as keyof typeof preferences.customFreeTimes] !== undefined
    ? preferences.customFreeTimes[todayWeekday as keyof typeof preferences.customFreeTimes]
    : preferences.freeHoursPerDay;
  const todayFreeMinutes = isTodayRestDay ? 30 : todayFreeHours * 60;

  // Filtra as tarefas agendadas para hoje
  const todayTasks = activeTasks.filter(t => t.scheduledDate === todayStr);
  const todayScheduledMinutes = todayTasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);

  // Procura por aulas amanhã para avisar sobre tarefas escolares urgentes
  const tomorrow = new Date(new Date(todayStr + 'T12:00:00').getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = formatDateStr(tomorrow);
  const tomorrowWeekday = getWeekdayName(tomorrowStr);
  const tomorrowClasses = schedule[tomorrowWeekday as keyof SchoolSchedule] || [];

  const warnings: string[] = [];

  // Se houver tarefas com prazo amanhã e não concluídas
  const tomorrowDueTasks = activeTasks.filter(t => t.dueDate === tomorrowStr);
  if (tomorrowDueTasks.length > 0) {
    warnings.push(
      `Você possui ${tomorrowDueTasks.length} atividade(s) com entrega marcada para AMANHÃ! Finalize hoje.`
    );
  }

  // Verifica se há aulas amanhã e tarefas pendentes dessas matérias
  if (tomorrowClasses.length > 0) {
    tomorrowClasses.forEach(subjectId => {
      const subject = subjects.find(s => s.id === subjectId);
      const subjectPendingTasks = activeTasks.filter(
        t => t.category === 'escola' && t.subjectId === subjectId
      );

      if (subjectPendingTasks.length > 0 && subject) {
        warnings.push(
          `Amanhã você tem aula de ${subject.name}. Recomendo resolver as ${subjectPendingTasks.length} tarefas pendentes de ${subject.name}.`
        );
      }
    });
  }

  // Se houver tarefas que ficaram sem horário livre disponível (Regra 4)
  const unscheduledTasks = activeTasks.filter(t => !t.scheduledDate);
  if (unscheduledTasks.length > 0) {
    warnings.push(
      `Atenção: ${unscheduledTasks.length} tarefa(s) não possuem horário disponível antes do prazo! Libere espaço ou adie compromissos.`
    );
  }

  // Se o tempo ocupado hoje estourar o limite de tempo livre
  if (todayScheduledMinutes > todayFreeMinutes) {
    warnings.push(
      `Sua agenda de hoje está sobrecarregada (${Math.round(todayScheduledMinutes / 60)}h planejadas de ${Math.round(todayFreeMinutes / 60)}h disponíveis).`
    );
  }

  // Gera frase motivacional baseada no progresso
  const completedToday = tasks.filter(t => t.completed && t.completedAt?.startsWith(todayStr)).length;
  let advice = '';
  let summary = '';

  if (completedToday > 0) {
    advice = `Excelente trabalho hoje! Você já concluiu ${completedToday} tarefa(s). Continue assim para manter seu ritmo de aprendizado!`;
  } else if (todayTasks.length === 0) {
    advice = `Sua agenda para hoje está livre de focos programados! Que tal descansar ou adiantar algumas leituras?`;
  } else {
    advice = `Olá! Hoje você tem ${todayTasks.length} blocos de foco planejados. Comece devagar e faça pausas regulares para render mais!`;
  }

  // Resumo de tempo
  const freeHoursLeft = Math.max(0, (todayFreeMinutes - todayScheduledMinutes) / 60);
  if (todayScheduledMinutes > 0) {
    summary = `Hoje você possui ${todayFreeHours} horas de foco disponíveis. Atividades agendadas ocupam ${Math.round(todayScheduledMinutes / 60 * 10) / 10} horas. Restam ${Math.round(freeHoursLeft * 10) / 10}h de folga.`;
  } else {
    summary = `Você possui ${todayFreeHours} horas de foco disponíveis hoje, sem nenhuma tarefa agendada para hoje.`;
  }

  // Ordena sequência sugerida de execução hoje: alta prioridade > estudos > conteúdo
  const suggestedSequence = [...todayTasks].sort((a, b) => {
    const priorityWeight = { alta: 3, media: 2, baixa: 1 };
    const pA = priorityWeight[a.priority] || 1;
    const pB = priorityWeight[b.priority] || 1;
    if (pA !== pB) return pB - pA;
    return a.estimatedMinutes - b.estimatedMinutes; // mais rápidas primeiro para pegar embalo
  });

  return {
    advice,
    summary,
    warnings,
    suggestedSequence,
  };
}

/**
 * Gera uma lista inicial padrão de matérias escolares para o usuário
 */
export function getDefaultSubjects(): SchoolSubject[] {
  return [
    { id: '1', name: 'Matemática', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    { id: '2', name: 'Física', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { id: '3', name: 'Química', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
    { id: '4', name: 'Português', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
    { id: '5', name: 'História', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { id: '6', name: 'Geografia', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: '7', name: 'Biologia', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: '8', name: 'Filosofia', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  ];
}

/**
 * Retorna as conquistas (conquistas/badges) iniciais padrão do sistema
 */
export function getDefaultAchievements(): any[] {
  return [
    { id: 'ach-1', title: 'Primeiro Passo', description: 'Conclua sua primeira tarefa no FocusFlow', icon: 'CheckCircle2', unlocked: false },
    { id: 'ach-2', title: 'Foco Absoluto', description: 'Acumule 100 minutos produtivos de foco', icon: 'Flame', unlocked: false },
    { id: 'ach-3', title: 'Mestre Colegial', description: 'Cadastre seu horário escolar semanal completo', icon: 'School', unlocked: false },
    { id: 'ach-4', title: 'Criador Prolífico', description: 'Cadastre e planeje as tarefas de 1 novo vídeo', icon: 'Tv', unlocked: false },
    { id: 'ach-5', title: 'Nível 5 Alcançado', description: 'Alcance o nível de experiência 5', icon: 'Sparkles', unlocked: false },
    { id: 'ach-6', title: 'One Piece Liberado', description: 'Desbloqueie e ative a recompensa One Piece', icon: 'Compass', unlocked: false },
    { id: 'ach-7', title: 'Super Sequência', description: 'Alcance uma sequência de 3 dias ativos', icon: 'Zap', unlocked: false },
    { id: 'ach-8', title: 'Maratona Acadêmica', description: 'Conclua 5 tarefas de estudos em uma semana', icon: 'BookOpen', unlocked: false },
  ];
}
