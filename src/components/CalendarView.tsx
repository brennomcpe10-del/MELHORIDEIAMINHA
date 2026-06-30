/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  CheckCircle,
  MoveRight,
  Sparkles,
  Info,
  CalendarDays,
  Radio
} from 'lucide-react';
import { Task, SchoolSubject } from '../types';
import { getWeekdayName, formatDateStr, getUpcomingDates } from '../utils/scheduler';

interface CalendarViewProps {
  tasks: Task[];
  subjects: SchoolSubject[];
  onMoveTask: (taskId: string, targetDate: string) => void;
}

export default function CalendarView({
  tasks,
  subjects,
  onMoveTask
}: CalendarViewProps) {
  // Calendar modes: 'hoje_amanha' | 'semana' | 'mes'
  const [calendarMode, setCalendarMode] = useState<'hoje_amanha' | 'semana' | 'mes'>('semana');
  const [currentMonthOffset, setCurrentMonthOffset] = useState(0); // For Month view

  const today = new Date();
  const todayStr = formatDateStr(today);

  // Calcula datas para "Hoje & Amanhã"
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrow);

  // Datas para "Esta Semana" (7 dias a partir de hoje)
  const weekDates = getUpcomingDates(todayStr, 7);

  // Helper para Drag & Drop
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      onMoveTask(taskId, targetDateStr);
    }
  };

  // Helper para mover tarefas via botões (importante para dispositivos móveis/touch)
  const moveTaskWithButton = (taskId: string, offsetDays: number) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const currentDate = task.scheduledDate ? new Date(task.scheduledDate + 'T12:00:00') : new Date();
    currentDate.setDate(currentDate.getDate() + offsetDays);
    onMoveTask(taskId, formatDateStr(currentDate));
  };

  // Renderiza um cartão de tarefa
  const renderTaskCard = (task: Task) => {
    const subj = task.subjectId ? subjects.find(s => s.id === task.subjectId) : null;
    
    return (
      <div
        id={`calendar-drag-task-${task.id}`}
        key={task.id}
        draggable={!task.completed}
        onDragStart={(e) => handleDragStart(e, task.id)}
        className={`p-3 rounded-xl border text-left space-y-2 cursor-grab transition-all select-none group relative ${
          task.completed 
            ? 'bg-md3-surface-variant/10 border-md3-surface-variant/20 opacity-40' 
            : task.category === 'live'
              ? 'bg-purple-950/40 border-purple-500/50 hover:border-purple-400 hover:bg-purple-950/60'
              : 'bg-md3-surface-variant/50 border-md3-surface-variant hover:border-md3-primary/50 hover:bg-md3-surface-variant/80'
        }`}
      >
        <div className="flex items-start justify-between gap-1.5">
          <p className={`text-xs font-semibold text-white leading-tight ${task.completed ? 'line-through' : ''}`}>
            {task.name}
          </p>
          <span className="text-[9px] font-mono font-bold text-md3-tertiary shrink-0">+{task.xp} XP</span>
        </div>

        {/* Task category / duration / subject */}
        <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-md3-outline">
          {subj ? (
            <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wide border ${subj.color}`}>
              {subj.name}
            </span>
          ) : (
            <span className={`px-1 py-0.5 rounded font-mono border flex items-center gap-0.5 ${
              task.category === 'live'
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                : 'bg-md3-surface border-md3-surface-variant'
            }`}>
              {task.category === 'live' && <Radio className="w-2.5 h-2.5 text-purple-400 animate-pulse" />}
              {task.category === 'live' ? 'Live' : task.category}
            </span>
          )}

          <span className="flex items-center gap-0.5 font-mono">
            <Clock className="w-2.5 h-2.5" />
            {task.estimatedMinutes}m
          </span>

          {task.scheduledTime && (
            <span className="bg-md3-primary/10 text-md3-primary border border-md3-primary/20 px-1 rounded font-mono">
              {task.scheduledTime}
            </span>
          )}
        </div>

        {/* Quick buttons for touch screens */}
        {!task.completed && (
          <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity bg-md3-surface border border-md3-surface-variant rounded-md p-0.5 shadow-md">
            <button
              id={`move-prev-btn-${task.id}`}
              title="Mover para dia anterior"
              onClick={() => moveTaskWithButton(task.id, -1)}
              className="p-1 hover:bg-md3-surface-variant rounded text-md3-outline hover:text-white"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-[8px] px-1 font-mono text-md3-outline">Reagendar</span>
            <button
              id={`move-next-btn-${task.id}`}
              title="Mover para próximo dia"
              onClick={() => moveTaskWithButton(task.id, 1)}
              className="p-1 hover:bg-md3-surface-variant rounded text-md3-outline hover:text-white"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  // Renderiza a visualização "Hoje & Amanhã"
  const renderHojeAmanha = () => {
    const dates = [
      { key: todayStr, label: 'Hoje', desc: 'Minha Fila de Hoje' },
      { key: tomorrowStr, label: 'Amanhã', desc: 'Próximas Atividades' }
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {dates.map((day) => {
          const dayTasks = tasks.filter(t => t.scheduledDate === day.key);
          const weekday = getWeekdayName(day.key);

          return (
            <div
              id={`calendar-col-${day.key}`}
              key={day.key}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, day.key)}
              className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 flex flex-col min-h-[400px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-md3-surface-variant mb-4">
                <div>
                  <h4 className="font-display font-bold text-base text-white flex items-center gap-2">
                    {day.label}
                    <span className="text-xs font-normal font-mono text-md3-outline capitalize">
                      ({weekday})
                    </span>
                  </h4>
                  <p className="text-[11px] text-md3-outline mt-0.5">{day.desc}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-md3-surface-variant rounded-full text-xs text-white font-mono">
                  {dayTasks.length}
                </span>
              </div>

              {/* Draggable Task Box */}
              <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[450px] pr-1">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-md3-surface-variant/40 rounded-2xl py-16">
                    <p className="text-xs text-md3-outline">Arraste tarefas aqui</p>
                    <p className="text-[10px] text-md3-outline/60 mt-0.5">Sem focos agendados</p>
                  </div>
                ) : (
                  dayTasks.map(renderTaskCard)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderiza a visualização "Esta Semana" (7 dias rotativos)
  const renderEstaSemana = () => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3.5">
        {weekDates.map((dateStr) => {
          const dayTasks = tasks.filter(t => t.scheduledDate === dateStr);
          const weekday = getWeekdayName(dateStr);
          const isToday = dateStr === todayStr;
          
          // Formata apenas o dia numérico
          const dayNum = dateStr.split('-')[2];

          return (
            <div
              id={`calendar-col-${dateStr}`}
              key={dateStr}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={`border rounded-2xl p-3.5 flex flex-col min-h-[350px] transition-all ${
                isToday 
                  ? 'bg-md3-surface-variant/40 border-md3-primary/40 glow-primary' 
                  : 'bg-md3-surface border-md3-surface-variant'
              }`}
            >
              {/* Column Header */}
              <div className="pb-2 border-b border-md3-surface-variant/60 mb-3 flex items-center justify-between">
                <div>
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${isToday ? 'text-md3-primary' : 'text-md3-outline'}`}>
                    {weekday.slice(0, 3)}
                  </span>
                  <p className="text-sm font-bold text-white font-display mt-0.5">{dayNum}</p>
                </div>
                <span className="text-[10px] text-md3-outline font-mono">
                  ({dayTasks.length})
                </span>
              </div>

              {/* Task Items */}
              <div className="flex-1 space-y-2 overflow-y-auto max-h-[300px]">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-2 rounded-xl border border-dashed border-md3-surface-variant/30 py-8">
                    <span className="text-[9px] text-md3-outline/50 font-mono">Vazio</span>
                  </div>
                ) : (
                  dayTasks.map(renderTaskCard)
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Renderiza a visualização "Este Mês" (Calendário simplificado de 30 dias)
  const renderEsteMes = () => {
    // Para simplificar a visualização do mês de forma super responsiva e polida,
    // mostramos um painel de grade onde cada bloco é um dia,
    // permitindo ver quais dias estão mais sobrecarregados e clicar para reagendar.
    const monthDates = getUpcomingDates(todayStr, 28); // 4 semanas completas a partir de hoje

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Info className="w-4 h-4 text-md3-primary" />
          <p className="text-xs text-md3-outline">
            Visualização de carga mensal. O FocusFlow distribui suas tarefas para evitar picos de sobrecarga.
          </p>
        </div>

        <div className="grid grid-cols-4 md:grid-cols-7 gap-3">
          {monthDates.map((dateStr) => {
            const dayTasks = tasks.filter(t => t.scheduledDate === dateStr);
            const isToday = dateStr === todayStr;
            const weekday = getWeekdayName(dateStr);
            const dayNum = dateStr.split('-')[2];
            
            // Determina a cor de intensidade de tarefas do dia
            let loadColor = 'border-md3-surface-variant/40 bg-md3-surface';
            if (dayTasks.length > 4) {
              loadColor = 'border-red-500/30 bg-red-500/5';
            } else if (dayTasks.length > 2) {
              loadColor = 'border-orange-500/30 bg-orange-500/5';
            } else if (dayTasks.length > 0) {
              loadColor = 'border-emerald-500/30 bg-emerald-500/5';
            }

            return (
              <div
                id={`calendar-month-cell-${dateStr}`}
                key={dateStr}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, dateStr)}
                className={`border rounded-2xl p-3 min-h-[100px] flex flex-col justify-between hover:border-md3-outline/30 cursor-pointer transition-all ${loadColor} ${
                  isToday ? 'ring-1 ring-md3-primary' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-xs font-bold text-white font-mono">{dayNum}</span>
                  <span className="text-[9px] text-md3-outline uppercase font-mono">{weekday.slice(0, 3)}</span>
                </div>

                <div className="mt-2 text-left">
                  {dayTasks.length > 0 ? (
                    <div className="space-y-1">
                      {dayTasks.slice(0, 2).map(t => (
                        <div key={t.id} className="text-[9px] text-white/95 truncate bg-md3-surface-variant/50 px-1 py-0.5 rounded border border-md3-surface-variant/30">
                          {t.name}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <p className="text-[8px] text-md3-primary font-mono">+{dayTasks.length - 2} mais...</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-[8px] text-md3-outline/40 font-mono">Sem focos</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="calendar-view" className="space-y-6">
      
      {/* Calendar Header with Mode Toggles */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Calendário Inteligente</h2>
          <p className="text-sm text-md3-outline">
            Arraste atividades para reagendar. O sistema reorganiza automaticamente a rotina restante.
          </p>
        </div>

        {/* Navigation Mode Button bar */}
        <div className="bg-md3-surface-variant/40 border border-md3-surface-variant p-1 rounded-2xl flex w-full sm:w-auto">
          {[
            { id: 'hoje_amanha', label: 'Hoje & Amanhã' },
            { id: 'semana', label: 'Esta Semana' },
            { id: 'mes', label: 'Próximos 28 dias' }
          ].map((mode) => (
            <button
              id={`cal-mode-btn-${mode.id}`}
              key={mode.id}
              onClick={() => setCalendarMode(mode.id as any)}
              className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                calendarMode === mode.id 
                  ? 'bg-md3-primary text-md3-bg shadow-sm' 
                  : 'text-md3-secondary hover:text-white'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Counselor Tip banner */}
      <div className="bg-gradient-to-r from-md3-surface via-md3-surface to-md3-tertiary/10 border border-md3-surface-variant p-4.5 rounded-2xl flex items-center gap-3.5">
        <div className="w-9 h-9 bg-md3-tertiary/10 border border-md3-tertiary/20 text-md3-tertiary rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white font-display">Dica de Fluxo Produtivo</h4>
          <p className="text-[11px] text-md3-outline leading-relaxed mt-0.5">
            Mover uma tarefa para dias futuros alivia a carga de hoje, mas preenche horários livres de amanhã. Arraste as tarefas de menor prioridade se estiver estressado!
          </p>
        </div>
      </div>

      {/* Dynamic Views rendering */}
      <div className="transition-all duration-300">
        {calendarMode === 'hoje_amanha' && renderHojeAmanha()}
        {calendarMode === 'semana' && renderEstaSemana()}
        {calendarMode === 'mes' && renderEsteMes()}
      </div>
    </div>
  );
}
