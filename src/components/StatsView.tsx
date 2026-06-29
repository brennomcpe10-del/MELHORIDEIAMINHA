/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Award, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Tv, 
  School, 
  Compass, 
  Zap, 
  BookOpen, 
  BarChart3, 
  TrendingUp, 
  Trophy,
  User,
  ShieldAlert,
  GraduationCap
} from 'lucide-react';
import { UserStats, Achievement } from '../types';

interface StatsViewProps {
  stats: UserStats;
  achievements: Achievement[];
}

export default function StatsView({
  stats,
  achievements
}: StatsViewProps) {
  
  // Percentual para o próximo nível
  const xpPercent = Math.min(100, Math.round((stats.xp / stats.xpToNextLevel) * 100));

  // Lista fictícia de competidores históricos para o "Ranking Pessoal"
  // Brenno está incluído dinamicamente na tabela conforme seu total de XP acumulado!
  const competitors = [
    { name: 'Albert Einstein', role: 'Físico Teórico', xp: 4500, avatarColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { name: 'Marie Curie', role: 'Cientista de Radiação', xp: 3900, avatarColor: 'bg-pink-500/20 text-pink-400 border-pink-500/30' },
    { name: 'Ada Lovelace', role: 'Mestra da Programação', xp: 3200, avatarColor: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { name: 'Brenno (Você)', role: 'FocusFlow Prodigy', xp: stats.totalXpGained, avatarColor: 'bg-md3-primary/20 text-md3-primary border-md3-primary/30', isUser: true },
    { name: 'Leonardo da Vinci', role: 'Polímata Renascentista', xp: 2800, avatarColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
    { name: 'Isaac Newton', role: 'Mestre da Gravidade', xp: 2100, avatarColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { name: 'Santos Dumont', role: 'Inventor & Aviador', xp: 1400, avatarColor: 'bg-teal-500/20 text-teal-400 border-teal-500/30' }
  ];

  // Ordena os competidores pelo total de XP
  const sortedCompetitors = [...competitors].sort((a, b) => b.xp - a.xp);

  // Determina a posição de Brenno
  const userRankIndex = sortedCompetitors.findIndex(c => c.isUser) + 1;

  // Helper para mapear strings para componentes de ícone
  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const defaultClass = `w-6 h-6 ${unlocked ? 'text-md3-primary' : 'text-md3-outline'}`;
    switch (iconName) {
      case 'CheckCircle2':
        return <CheckCircle2 className={defaultClass} />;
      case 'Flame':
        return <Flame className={defaultClass} />;
      case 'School':
        return <School className={defaultClass} />;
      case 'Tv':
        return <Tv className={defaultClass} />;
      case 'Sparkles':
        return <Sparkles className={defaultClass} />;
      case 'Compass':
        return <Compass className={defaultClass} />;
      case 'Zap':
        return <Zap className={defaultClass} />;
      case 'BookOpen':
        return <BookOpen className={defaultClass} />;
      default:
        return <Award className={defaultClass} />;
    }
  };

  return (
    <div id="stats-gamification-view" className="space-y-6">
      
      {/* View Header */}
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Conquistas & Gamificação</h2>
        <p className="text-sm text-md3-outline">
          Monitore sua evolução, ganhe insígnias de foco e suba no ranking dos pensadores mais disciplinados da história!
        </p>
      </div>

      {/* Gamification Hub Board with Level Progress and Streak */}
      <div className="bg-gradient-to-r from-md3-surface via-md3-surface to-md3-tertiary/10 border border-md3-surface-variant rounded-3xl p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-64 h-64 bg-md3-tertiary/5 rounded-full blur-3xl -z-10" />

        <div className="space-y-4 w-full lg:max-w-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-md3-tertiary/10 border border-md3-tertiary/20 flex items-center justify-center text-md3-tertiary shadow-md">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-md3-outline font-mono">Nível de Foco Atual</p>
              <h3 className="text-xl font-display font-bold text-white">PRODIGY NÍVEL {stats.level}</h3>
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-md3-outline">Experiência (XP):</span>
              <span className="text-white font-bold">{stats.xp} / {stats.xpToNextLevel} XP ({xpPercent}%)</span>
            </div>
            <div className="w-full bg-md3-surface-variant rounded-full h-3 overflow-hidden border border-md3-surface-variant">
              <div 
                className="bg-gradient-to-r from-md3-primary to-md3-tertiary h-full rounded-full transition-all duration-500"
                style={{ width: `${xpPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Big Streak Shield */}
        <div className="bg-md3-surface-variant/40 border border-md3-surface-variant/80 p-5 rounded-2xl flex items-center gap-4.5 w-full lg:w-64">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-current animate-pulse-slow" />
          </div>
          <div>
            <h4 className="text-2xl font-mono font-bold text-white">{stats.streak} Dias</h4>
            <p className="text-xs text-md3-outline">Sequência ativa de Foco</p>
          </div>
        </div>
      </div>

      {/* Grid: Stats overview & Personal Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1 & 2: Achievements Badge Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Award className="w-5 h-5 text-md3-primary" />
            <h3 className="font-display font-bold text-base text-white">Insígnias de Foco ({achievements.filter(a => a.unlocked).length}/{achievements.length})</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {achievements.map((badge) => (
              <div
                id={`achievement-card-${badge.id}`}
                key={badge.id}
                className={`flex gap-4 p-4.5 rounded-2xl border transition-all ${
                  badge.unlocked 
                    ? 'bg-md3-surface border-md3-primary/30 glow-primary' 
                    : 'bg-md3-surface/40 border-md3-surface-variant opacity-50'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${
                  badge.unlocked 
                    ? 'bg-md3-primary/10 border-md3-primary/20' 
                    : 'bg-md3-surface-variant/50 border-md3-surface-variant'
                }`}>
                  {renderBadgeIcon(badge.icon, badge.unlocked)}
                </div>

                <div className="space-y-1">
                  <h4 className={`text-xs font-bold leading-tight ${badge.unlocked ? 'text-white' : 'text-md3-outline'}`}>
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-md3-outline leading-normal">{badge.description}</p>
                  
                  {badge.unlocked && badge.unlockedAt && (
                    <span className="inline-block text-[9px] text-md3-success font-mono">
                      Desbloqueada em: {badge.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Ranking Pessoal (Historic Leaders Competitions) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Trophy className="w-5 h-5 text-md3-warning" />
            <h3 className="font-display font-bold text-base text-white">Ranking Pessoal</h3>
          </div>

          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4">
            <div className="border-b border-md3-surface-variant/50 pb-3">
              <h4 className="text-xs font-semibold text-white">Liga Acadêmica dos Prodígios</h4>
              <p className="text-[10px] text-md3-outline mt-0.5">Sua posição é atualizada em tempo real com seu XP total.</p>
            </div>

            <div className="space-y-2">
              {sortedCompetitors.map((competitor, idx) => {
                const isUser = competitor.isUser;
                const pos = idx + 1;

                // Estilo para o pódio
                let medalBadge = '';
                if (pos === 1) medalBadge = '🥇';
                else if (pos === 2) medalBadge = '🥈';
                else if (pos === 3) medalBadge = '🥉';

                return (
                  <div
                    id={`leaderboard-row-${pos}`}
                    key={idx}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      isUser 
                        ? 'bg-md3-primary/15 border-md3-primary/30 glow-primary font-bold' 
                        : 'bg-md3-surface-variant/20 border-md3-surface-variant/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xs font-mono font-bold text-md3-outline w-5 text-center">
                        {medalBadge || `${pos}.`}
                      </span>

                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold border shrink-0 ${competitor.avatarColor}`}>
                        {competitor.name.slice(0, 1)}
                      </div>

                      <div className="min-w-0">
                        <p className={`text-xs truncate ${isUser ? 'text-md3-primary' : 'text-white'}`}>
                          {competitor.name}
                        </p>
                        <p className="text-[9px] text-md3-outline truncate leading-none">{competitor.role}</p>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-white shrink-0">
                      {competitor.xp} XP
                    </span>
                  </div>
                );
              })}
            </div>

            {/* User personal performance overview */}
            <div className="bg-md3-surface-variant/30 border border-md3-surface-variant rounded-xl p-3.5 text-center space-y-1">
              <p className="text-[10px] text-md3-outline font-mono">SEU DESEMPENHO ATUAL</p>
              <h5 className="text-sm font-bold text-white">Posição: #{userRankIndex} de 7</h5>
              <p className="text-[10px] text-md3-outline leading-tight">
                Ganhe mais {userRankIndex > 1 ? sortedCompetitors[userRankIndex - 2].xp - stats.totalXpGained : 0} XP para subir de posição!
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
