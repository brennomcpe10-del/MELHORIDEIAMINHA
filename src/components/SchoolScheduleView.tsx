/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  School, 
  Plus, 
  Trash2, 
  BookOpen, 
  Clock, 
  Sliders, 
  Palette, 
  AlertCircle,
  Sparkles,
  Award
} from 'lucide-react';
import { SchoolSubject, SchoolSchedule } from '../types';

interface SchoolScheduleViewProps {
  subjects: SchoolSubject[];
  schedule: SchoolSchedule;
  onAddSubject: (name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;
  onUpdateSchedule: (day: keyof SchoolSchedule, subjectIds: string[]) => void;
}

export default function SchoolScheduleView({
  subjects,
  schedule,
  onAddSubject,
  onDeleteSubject,
  onUpdateSchedule
}: SchoolScheduleViewProps) {
  // Form states - New Subject
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjColor, setNewSubjColor] = useState('bg-blue-500/20 text-blue-400 border-blue-500/30');

  // Selected day to edit class schedule
  const [activeDay, setActiveDay] = useState<keyof SchoolSchedule>('segunda');
  const [tempAddSubjId, setTempAddSubjId] = useState('');

  const daysOfWeek: { id: keyof SchoolSchedule; label: string }[] = [
    { id: 'segunda', label: 'Segunda-feira' },
    { id: 'terca', label: 'Terça-feira' },
    { id: 'quarta', label: 'Quarta-feira' },
    { id: 'quinta', label: 'Quinta-feira' },
    { id: 'sexta', label: 'Sexta-feira' },
    { id: 'sabado', label: 'Sábado' },
    { id: 'domingo', label: 'Domingo' }
  ];

  const colors = [
    { value: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Vermelho' },
    { value: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Laranja' },
    { value: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Amarelo' },
    { value: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Verde' },
    { value: 'bg-teal-500/20 text-teal-400 border-teal-500/30', label: 'Ciano' },
    { value: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Azul' },
    { value: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'Indigo' },
    { value: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Roxo' },
    { value: 'bg-pink-500/20 text-pink-400 border-pink-500/30', label: 'Rosa' }
  ];

  // Adds a subject
  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    onAddSubject(newSubjName.trim(), newSubjColor);
    setNewSubjName('');
  };

  // Adds a class to a weekday schedule list
  const handleAddClassToDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempAddSubjId) return;

    const currentClasses = schedule[activeDay] || [];
    onUpdateSchedule(activeDay, [...currentClasses, tempAddSubjId]);
    setTempAddSubjId('');
  };

  // Removes a class from a weekday schedule list by index
  const handleRemoveClassFromDay = (indexToRemove: number) => {
    const currentClasses = schedule[activeDay] || [];
    const updated = currentClasses.filter((_, idx) => idx !== indexToRemove);
    onUpdateSchedule(activeDay, updated);
  };

  return (
    <div id="school-schedule-view" className="space-y-6">
      
      {/* Title Header */}
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Horário Escolar Semanal</h2>
        <p className="text-sm text-md3-outline">
          Cadastre suas disciplinas e organize seu quadro de aulas. O FocusFlow descobrirá quando é a próxima aula de cada matéria!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Interactive Weekly Schedule Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <School className="w-5 h-5 text-md3-primary" />
                <h3 className="font-display font-bold text-base text-white">Quadro de Horários</h3>
              </div>
              <span className="text-xs font-mono text-md3-primary bg-md3-primary/10 px-2.5 py-1 rounded-full border border-md3-primary/20">
                Foco Acadêmico
              </span>
            </div>

            {/* Timetable visual layout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
              {daysOfWeek.map((day) => {
                const dayClasses = schedule[day.id] || [];
                const isActive = activeDay === day.id;

                return (
                  <button
                    id={`schedule-day-btn-${day.id}`}
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col min-h-[140px] justify-between cursor-pointer ${
                      isActive 
                        ? 'bg-md3-primary/10 border-md3-primary glow-primary' 
                        : 'bg-md3-surface-variant/30 border-md3-surface-variant/60 hover:border-md3-outline/30'
                    }`}
                  >
                    <span className={`text-[11px] font-bold tracking-wider ${isActive ? 'text-md3-primary' : 'text-md3-secondary'}`}>
                      {day.label.split('-')[0]}
                    </span>
                    
                    <div className="my-2 space-y-1 w-full text-left">
                      {dayClasses.length > 0 ? (
                        dayClasses.slice(0, 3).map((subId, idx) => {
                          const sub = subjects.find(s => s.id === subId);
                          return (
                            <div 
                              key={idx} 
                              className="text-[9px] font-mono font-semibold py-0.5 px-1 bg-md3-surface-variant rounded border border-md3-surface-variant text-white truncate text-center"
                            >
                              {sub ? sub.name : 'Matéria'}
                            </div>
                          );
                        })
                      ) : (
                        <span className="text-[9px] text-md3-outline/40 italic font-mono">Sem aulas</span>
                      )}
                      {dayClasses.length > 3 && (
                        <p className="text-[8px] text-md3-primary font-mono text-center">+{dayClasses.length - 3}</p>
                      )}
                    </div>

                    <span className="text-[10px] text-md3-outline font-mono">
                      {dayClasses.length} aula{dayClasses.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Day Class Editor */}
            <div className="mt-6 p-4 bg-md3-surface-variant/30 border border-md3-surface-variant rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-md3-surface-variant/50 pb-3">
                <div>
                  <h4 className="font-display font-bold text-sm text-white capitalize">
                    Grade de Aulas: {daysOfWeek.find(d => d.id === activeDay)?.label}
                  </h4>
                  <p className="text-[11px] text-md3-outline">Ordene ou remova matérias escolares deste dia.</p>
                </div>

                {/* Quick Add Class Dropdown */}
                <form onSubmit={handleAddClassToDay} className="flex gap-2 w-full sm:w-auto">
                  <select
                    required
                    value={tempAddSubjId}
                    onChange={(e) => setTempAddSubjId(e.target.value)}
                    className="px-2.5 py-1.5 bg-md3-surface border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                  >
                    <option value="">+ Adicionar aula...</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <button
                    id="add-class-to-day-btn"
                    type="submit"
                    className="px-3 py-1.5 bg-md3-primary text-md3-bg rounded-xl hover:bg-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Adicionar
                  </button>
                </form>
              </div>

              {/* Class sequence list */}
              <div className="space-y-2">
                {schedule[activeDay]?.length === 0 ? (
                  <div className="text-center py-6 text-xs text-md3-outline italic">
                    Nenhuma aula cadastrada nesta data.
                  </div>
                ) : (
                  schedule[activeDay]?.map((subId, idx) => {
                    const sub = subjects.find(s => s.id === subId);
                    if (!sub) return null;

                    return (
                      <div 
                        id={`class-schedule-item-${idx}`}
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-md3-surface/60 border border-md3-surface-variant rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-md3-outline bg-md3-surface-variant w-6 h-6 rounded-full flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${sub.color}`}>
                            {sub.name}
                          </span>
                        </div>
                        <button
                          id={`remove-class-btn-${idx}`}
                          onClick={() => handleRemoveClassFromDay(idx)}
                          className="p-1.5 hover:bg-red-500/10 text-md3-outline hover:text-red-400 rounded-lg transition-all cursor-pointer"
                          title="Remover aula"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Column 3: Subjects Registry Panel */}
        <div className="space-y-4">
          
          {/* Add Subject Card */}
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-md3-tertiary" />
              <h3 className="font-display font-bold text-base text-white">Cadastrar Matérias</h3>
            </div>

            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Nome da Matéria</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Física Quântica"
                  value={newSubjName}
                  onChange={(e) => setNewSubjName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Color Selection grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Cor do Crachá</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {colors.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewSubjColor(c.value)}
                      className={`w-full h-8 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${c.value} ${
                        newSubjColor === c.value ? 'ring-2 ring-white scale-105' : 'opacity-80'
                      }`}
                      title={c.label}
                    >
                      <span className="text-[8px] font-bold">Aa</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                id="create-subject-btn"
                type="submit"
                className="w-full py-2.5 bg-md3-tertiary text-md3-bg rounded-xl font-bold text-xs hover:bg-white transition-all cursor-pointer"
              >
                + Adicionar Nova Disciplina
              </button>
            </form>
          </div>

          {/* List of Registered Subjects */}
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-3.5 max-h-[300px] overflow-y-auto">
            <h4 className="text-xs font-mono font-semibold text-md3-outline tracking-wider uppercase">Minhas Disciplinas ({subjects.length})</h4>
            <div className="space-y-2">
              {subjects.map((sub) => (
                <div 
                  id={`subject-list-item-${sub.id}`}
                  key={sub.id} 
                  className="flex items-center justify-between p-2.5 bg-md3-surface-variant/30 border border-md3-surface-variant/50 rounded-xl"
                >
                  <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${sub.color}`}>
                    {sub.name}
                  </span>
                  {/* Se houver mais de 3 matérias básicas, permite deletar */}
                  {subjects.length > 3 && (
                    <button
                      id={`delete-subject-btn-${sub.id}`}
                      onClick={() => onDeleteSubject(sub.id)}
                      className="p-1.5 hover:bg-red-500/10 text-md3-outline hover:text-red-400 rounded-lg transition-all cursor-pointer"
                      title="Deletar Matéria"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
