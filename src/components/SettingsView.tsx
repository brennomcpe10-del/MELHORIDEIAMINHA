/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sliders, 
  Clock, 
  Calendar, 
  Database, 
  RefreshCw, 
  FileUp, 
  FileDown, 
  Check, 
  AlertCircle,
  HelpCircle,
  Info
} from 'lucide-react';
import { UserPreferences } from '../types';

interface SettingsViewProps {
  preferences: UserPreferences;
  onUpdatePreferences: (prefs: UserPreferences) => void;
  onResetData: () => void;
  onImportData: (jsonStr: string) => boolean;
  onExportData: () => string;
}

export default function SettingsView({
  preferences,
  onUpdatePreferences,
  onResetData,
  onImportData,
  onExportData
}: SettingsViewProps) {
  
  // Local state for sliders/inputs
  const [freeHours, setFreeHours] = useState(preferences.freeHoursPerDay);
  const [dailyLimit, setDailyLimit] = useState(preferences.dailyLimitMinutes);
  const [schoolStart, setSchoolStart] = useState(preferences.schoolHoursStart);
  const [schoolEnd, setSchoolEnd] = useState(preferences.schoolHoursEnd);
  const [workStart, setWorkStart] = useState(preferences.workHoursStart);
  const [workEnd, setWorkEnd] = useState(preferences.workHoursEnd);

  // Custom free times per day
  const [monFree, setMonFree] = useState(preferences.customFreeTimes.segunda);
  const [tueFree, setTueFree] = useState(preferences.customFreeTimes.terca);
  const [wedFree, setWedFree] = useState(preferences.customFreeTimes.quarta);
  const [thuFree, setThuFree] = useState(preferences.customFreeTimes.quinta);
  const [friFree, setFriFree] = useState(preferences.customFreeTimes.sexta);
  const [satFree, setSatFree] = useState(preferences.customFreeTimes.sabado);
  const [sunFree, setSunFree] = useState(preferences.customFreeTimes.domingo);

  // Custom daily work hours
  const [customWorkHours, setCustomWorkHours] = useState(preferences.customWorkHours || {
    segunda: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: true },
    terca: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: true },
    quarta: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: true },
    quinta: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: true },
    sexta: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: true },
    sabado: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: false },
    domingo: { start: preferences.workHoursStart || '13:00', end: preferences.workHoursEnd || '18:00', active: false }
  });

  const handleWorkDayToggle = (day: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo') => {
    setCustomWorkHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        active: !prev[day].active
      }
    }));
  };

  const handleWorkTimeChange = (day: 'segunda' | 'terca' | 'quarta' | 'quinta' | 'sexta' | 'sabado' | 'domingo', field: 'start' | 'end', val: string) => {
    setCustomWorkHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: val
      }
    }));
  };

  // Backup state
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [savedStatus, setSavedStatus] = useState(false);

  const WEEKDAYS = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];
  const WEEKDAYS_LABELS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  // Toggle rest day index
  const handleToggleRestDay = (dayIndex: number) => {
    let updatedRestDays = [...preferences.restDays];
    if (updatedRestDays.includes(dayIndex)) {
      updatedRestDays = updatedRestDays.filter(d => d !== dayIndex);
    } else {
      updatedRestDays.push(dayIndex);
    }
    
    onUpdatePreferences({
      ...preferences,
      restDays: updatedRestDays
    });
  };

  // Saves preferences
  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    
    onUpdatePreferences({
      freeHoursPerDay: freeHours,
      dailyLimitMinutes: dailyLimit,
      schoolHoursStart: schoolStart,
      schoolHoursEnd: schoolEnd,
      workHoursStart: workStart,
      workHoursEnd: workEnd,
      restDays: preferences.restDays,
      customFreeTimes: {
        segunda: monFree,
        terca: tueFree,
        quarta: wedFree,
        quinta: thuFree,
        sexta: friFree,
        sabado: satFree,
        domingo: sunFree
      },
      customWorkHours: customWorkHours
    });

    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  // Handle data export
  const handleExport = () => {
    const jsonStr = onExportData();
    // Cria um download de arquivo simples
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `focusflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle data import
  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const success = onImportData(importText.trim());
    if (success) {
      setImportStatus('success');
      setImportText('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } else {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  return (
    <div id="settings-view" className="space-y-6">
      
      {/* View Header */}
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Configurações & Disponibilidade</h2>
        <p className="text-sm text-md3-outline">
          Personalize seus horários de estudo, dias livres de folga e gerencie backups locais para portabilidade do app.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Main Routine Preferences Form */}
        <form onSubmit={handleSavePreferences} className="lg:col-span-2 space-y-4">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-md3-surface-variant/50">
              <Sliders className="w-5 h-5 text-md3-primary" />
              <h3 className="font-display font-bold text-base text-white">Minha Rotina Semanal</h3>
            </div>

            {/* Slider: Base Free Hours and Daily Work Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-md3-secondary">Horas Livres Padrão Diárias</span>
                  <span className="text-white font-mono font-bold">{freeHours}h</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="12" 
                  value={freeHours}
                  onChange={(e) => setFreeHours(parseInt(e.target.value))}
                  className="w-full accent-md3-primary h-1.5 bg-md3-surface-variant rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-md3-outline leading-tight">
                  Horas padrão de foco livre reservadas no seu dia para tarefas escolares/conteúdos.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-md3-secondary">Limite Máximo Foco Diário</span>
                  <span className="text-white font-mono font-bold">{dailyLimit}min ({Math.round(dailyLimit/60)}h)</span>
                </div>
                <input 
                  type="range" 
                  min="60" 
                  max="480" 
                  step="30"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(parseInt(e.target.value))}
                  className="w-full accent-md3-primary h-1.5 bg-md3-surface-variant rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-[10px] text-md3-outline leading-tight">
                  Carga máxima produtiva diária. O FocusFlow evita agendar tarefas que estourem essa meta.
                </p>
              </div>
            </div>

            {/* Custom availability per weekday (Saves you from overwork!) */}
            <div className="space-y-3.5 pt-3.5 border-t border-md3-surface-variant/50">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-md3-primary" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Disponibilidade Customizada por Dia</h4>
              </div>
              <p className="text-[11px] text-md3-outline leading-normal mt-0.5">
                Ajuste fino de horas úteis livres específicas para cada dia da semana.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
                {[
                  { label: 'Seg', val: monFree, set: setMonFree },
                  { label: 'Ter', val: tueFree, set: setTueFree },
                  { label: 'Qua', val: wedFree, set: setWedFree },
                  { label: 'Qui', val: thuFree, set: setThuFree },
                  { label: 'Sex', val: friFree, set: setFriFree },
                  { label: 'Sáb', val: satFree, set: setSatFree },
                  { label: 'Dom', val: sunFree, set: setSunFree }
                ].map((d, i) => (
                  <div key={i} className="bg-md3-surface-variant/20 border border-md3-surface-variant/40 p-2.5 rounded-xl text-center space-y-1">
                    <span className="text-[10px] font-bold text-md3-outline font-mono">{d.label}</span>
                    <input 
                      type="number" 
                      min="0"
                      max="12"
                      value={d.val}
                      onChange={(e) => d.set(Math.min(12, Math.max(0, parseInt(e.target.value) || 0)))}
                      className="w-full text-center bg-md3-surface border border-md3-surface-variant rounded-lg font-mono font-bold text-xs py-1 text-white"
                    />
                    <span className="text-[9px] text-md3-outline font-mono">horas</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Busy Time Slots - School and Work Standard hours */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3.5 border-t border-md3-surface-variant/50">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-md3-secondary flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Horário Escolar Padrão
                </label>
                <div className="flex gap-2.5 items-center">
                  <input 
                    type="text" 
                    placeholder="07:00"
                    value={schoolStart}
                    onChange={(e) => setSchoolStart(e.target.value)}
                    className="w-full text-center px-3 py-2 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-xl text-xs font-mono text-white"
                  />
                  <span className="text-xs text-md3-outline font-mono">até</span>
                  <input 
                    type="text" 
                    placeholder="12:00"
                    value={schoolEnd}
                    onChange={(e) => setSchoolEnd(e.target.value)}
                    className="w-full text-center px-3 py-2 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-md3-secondary flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Trabalho Padrão (Fallback)
                </label>
                <div className="flex gap-2.5 items-center">
                  <input 
                    type="text" 
                    placeholder="13:00"
                    value={workStart}
                    onChange={(e) => setWorkStart(e.target.value)}
                    className="w-full text-center px-3 py-2 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-xl text-xs font-mono text-white"
                  />
                  <span className="text-xs text-md3-outline font-mono">até</span>
                  <input 
                    type="text" 
                    placeholder="18:00"
                    value={workEnd}
                    onChange={(e) => setWorkEnd(e.target.value)}
                    className="w-full text-center px-3 py-2 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-xl text-xs font-mono text-white"
                  />
                </div>
              </div>
            </div>

            {/* Custom Work Hours per day Section */}
            <div className="space-y-3.5 pt-3.5 border-t border-md3-surface-variant/50">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-md3-primary" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Horário de Trabalho Customizado por Dia</h4>
              </div>
              <p className="text-[11px] text-md3-outline leading-normal mt-0.5">
                Como seu horário de trabalho não é fixo, defina os dias em que você trabalha e o respectivo horário de início/fim. O sistema usará esses limites para agendar suas tarefas inteligentes de forma personalizada por dia.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                {(['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'] as const).map((day) => {
                  const dayLabels: Record<string, string> = {
                    segunda: 'Segunda-feira',
                    terca: 'Terça-feira',
                    quarta: 'Quarta-feira',
                    quinta: 'Quinta-feira',
                    sexta: 'Sexta-feira',
                    sabado: 'Sábado',
                    domingo: 'Domingo'
                  };
                  const workInfo = customWorkHours[day] || { start: '13:00', end: '18:00', active: true };
                  
                  return (
                    <div key={day} className="flex flex-row items-center justify-between gap-3 bg-md3-surface-variant/10 border border-md3-surface-variant/30 p-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <button
                          id={`btn-toggle-work-${day}`}
                          type="button"
                          onClick={() => handleWorkDayToggle(day)}
                          className={`w-10 h-6 rounded-full p-1 transition-all border cursor-pointer flex items-center ${
                            workInfo.active 
                              ? 'bg-md3-primary border-md3-primary/50 justify-end' 
                              : 'bg-md3-surface-variant border-md3-outline/20 justify-start'
                          }`}
                        >
                          <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                        </button>
                        <span className={`text-xs font-semibold ${workInfo.active ? 'text-white' : 'text-md3-outline line-through'}`}>
                          {dayLabels[day]}
                        </span>
                      </div>

                      {workInfo.active ? (
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="text" 
                            placeholder="13:00"
                            value={workInfo.start}
                            onChange={(e) => handleWorkTimeChange(day, 'start', e.target.value)}
                            className="w-16 text-center px-1.5 py-1 bg-md3-surface border border-md3-surface-variant rounded-lg text-[11px] font-mono text-white"
                          />
                          <span className="text-[10px] text-md3-outline font-mono">às</span>
                          <input 
                            type="text" 
                            placeholder="18:00"
                            value={workInfo.end}
                            onChange={(e) => handleWorkTimeChange(day, 'end', e.target.value)}
                            className="w-16 text-center px-1.5 py-1 bg-md3-surface border border-md3-surface-variant rounded-lg text-[11px] font-mono text-white"
                          />
                        </div>
                      ) : (
                        <span className="text-[10px] text-md3-outline font-mono italic">Folga / Sem Trabalho</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selection of Rest Days (avoid scheduling heavy milestones here) */}
            <div className="space-y-2.5 pt-3.5 border-t border-md3-surface-variant/50">
              <label className="text-xs font-semibold text-md3-secondary flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Dias de Descanso da Semana
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {WEEKDAYS_LABELS.map((dayLabel, idx) => {
                  const isRest = preferences.restDays.includes(idx);
                  return (
                    <button
                      id={`rest-day-pill-${idx}`}
                      key={idx}
                      type="button"
                      onClick={() => handleToggleRestDay(idx)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border cursor-pointer ${
                        isRest 
                          ? 'bg-red-400/25 text-red-300 border-red-500/35' 
                          : 'bg-md3-surface-variant/30 text-md3-secondary border-md3-surface-variant hover:text-white'
                      }`}
                    >
                      {dayLabel}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-md3-outline leading-tight">
                Em dias de folga/descanso, o sistema restringe o agendamento a no máximo 30 minutos de atividades para evitar esgotamento mental.
              </p>
            </div>

            {/* Save Buttons */}
            <div className="pt-4 border-t border-md3-surface-variant/50 flex items-center justify-between gap-4">
              {savedStatus ? (
                <span className="text-xs text-md3-success font-medium flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> Preferências salvas e redistribuídas!
                </span>
              ) : (
                <div />
              )}
              <button
                id="save-preferences-btn"
                type="submit"
                className="px-5 py-2.5 bg-md3-primary text-md3-bg font-bold rounded-xl hover:bg-white text-xs transition-all cursor-pointer"
              >
                Salvar & Reorganizar Agenda
              </button>
            </div>
          </div>
        </form>

        {/* Column 3: Local Storage / Backup Management Panel */}
        <div className="space-y-4">
          
          {/* Export / Reset Card */}
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-md3-tertiary" />
              <h3 className="font-display font-bold text-base text-white">Banco de Dados Local</h3>
            </div>

            <p className="text-xs text-md3-outline leading-relaxed font-sans">
              O FocusFlow utiliza persistência no navegador para reter suas matérias, tarefas e XP mesmo sem internet. Utilize as ações abaixo para migrar seus dados.
            </p>

            <div className="space-y-2.5 pt-2">
              <button
                id="btn-export-backup"
                onClick={handleExport}
                className="w-full py-2.5 bg-md3-surface-variant/60 hover:bg-md3-surface-variant border border-md3-surface-variant text-white rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-md3-primary" />
                <span>Exportar Dados (Backup)</span>
              </button>

              <button
                id="btn-reset-db"
                onClick={() => {
                  if (confirm('Deseja realmente limpar todos os seus dados? Isso apagará suas tarefas, matérias, XP e conquistas irreversivelmente!')) {
                    onResetData();
                  }
                }}
                className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 animate-pulse-slow" />
                <span>Resetar / Limpar Tudo</span>
              </button>
            </div>
          </div>

          {/* Import JSON Area */}
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <FileUp className="w-5 h-5 text-md3-primary" />
              <h3 className="font-display font-bold text-base text-white font-sans">Restaurar Backup</h3>
            </div>

            <form onSubmit={handleImport} className="space-y-3">
              <textarea 
                rows={3}
                required
                placeholder="Cole o código JSON do seu backup aqui..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full px-3 py-2.5 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-xl text-xs font-mono text-white placeholder-md3-outline"
              />

              <button
                id="btn-confirm-import"
                type="submit"
                className="w-full py-2.5 bg-md3-primary text-md3-bg rounded-xl font-bold text-xs hover:bg-white transition-all cursor-pointer"
              >
                Confirmar Restauração
              </button>
            </form>

            {importStatus === 'success' && (
              <div className="flex gap-2 p-3 bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl text-xs">
                <Check className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Backup importado com sucesso! Redistribuindo rotina...</p>
              </div>
            )}

            {importStatus === 'error' && (
              <div className="flex gap-2 p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>JSON de backup inválido. Por favor, verifique o formato.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
