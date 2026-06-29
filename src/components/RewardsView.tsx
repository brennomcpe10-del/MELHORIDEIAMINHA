/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Gift, 
  Lock, 
  Unlock, 
  Plus, 
  CheckCircle, 
  Compass, 
  Gamepad2, 
  Tv, 
  Youtube, 
  Sparkles, 
  AlertCircle,
  PlayCircle,
  HelpCircle,
  Trash2
} from 'lucide-react';
import { Reward, Task, UserStats } from '../types';

interface RewardsViewProps {
  rewards: Reward[];
  tasks: Task[];
  stats: UserStats;
  onAddReward: (name: string, type: Reward['type'], conditionType: Reward['unlockConditionType'], conditionValue: number) => void;
  onDeleteReward: (id: string) => void;
  onClaimReward: (id: string) => void;
}

export default function RewardsView({
  rewards,
  tasks,
  stats,
  onAddReward,
  onDeleteReward,
  onClaimReward
}: RewardsViewProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [rewardName, setRewardName] = useState('');
  const [rewardType, setRewardType] = useState<Reward['type']>('One Piece');
  const [conditionType, setConditionType] = useState<Reward['unlockConditionType']>('xp');
  const [conditionValue, setConditionValue] = useState('50');

  const todayStr = new Date().toISOString().split('T')[0];

  // Métricas de progresso de HOJE para validar desbloqueios em tempo real
  const todayTasks = tasks.filter(t => t.scheduledDate === todayStr);
  const completedTodayTasks = todayTasks.filter(t => t.completed);
  const highPriorityCompletedToday = completedTodayTasks.filter(t => t.priority === 'alta').length;
  
  // Total de XP acumulado hoje (estimado de tarefas completas hoje)
  const xpEarnedToday = tasks
    .filter(t => t.completed && t.completedAt?.startsWith(todayStr))
    .reduce((sum, t) => sum + t.xp, 0);

  const allCompletedToday = todayTasks.length > 0 && todayTasks.every(t => t.completed);

  // Determina se uma recompensa está elegível para desbloquear baseado no progresso de hoje
  const checkUnlockEligibility = (reward: Reward) => {
    switch (reward.unlockConditionType) {
      case 'prioritarias':
        return highPriorityCompletedToday >= reward.unlockConditionValue;
      case 'xp':
        return xpEarnedToday >= reward.unlockConditionValue;
      case 'todas_do_dia':
        return allCompletedToday;
      default:
        return false;
    }
  };

  const getRewardIcon = (type: Reward['type']) => {
    switch (type) {
      case 'One Piece':
        return <Compass className="w-5 h-5 text-orange-400" />;
      case 'Minecraft':
        return <Gamepad2 className="w-5 h-5 text-green-400" />;
      case 'TikTok':
        return <Tv className="w-5 h-5 text-pink-400" />;
      case 'YouTube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'Instagram':
        return <Tv className="w-5 h-5 text-indigo-400" />;
      default:
        return <Gift className="w-5 h-5 text-md3-tertiary" />;
    }
  };

  const handleAddRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rewardName.trim()) return;

    onAddReward(
      rewardName.trim(),
      rewardType,
      conditionType,
      parseInt(conditionValue) || 1
    );

    // Reset Form
    setRewardName('');
    setRewardType('One Piece');
    setConditionType('xp');
    setConditionValue('50');
    setShowAddModal(false);
  };

  return (
    <div id="rewards-view" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Central de Recompensas</h2>
          <p className="text-sm text-md3-outline">
            Troque seu esforço por diversão de forma equilibrada. Configure condições e desbloqueie recompensas.
          </p>
        </div>

        <button 
          id="btn-add-reward-modal"
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-md3-primary text-md3-bg rounded-xl hover:bg-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>Configurar Recompensa</span>
        </button>
      </div>

      {/* Real-time Effort Stats Row */}
      <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <p className="text-xs text-md3-outline">XP Acumulado Hoje</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-md3-tertiary">{xpEarnedToday} XP</span>
            <span className="text-[10px] text-md3-outline">ganhos</span>
          </div>
          <p className="text-[10px] text-md3-outline/70">Meta padrão de XP diário: 50 XP</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-md3-outline">Tarefas de Alta Prioridade Hoje</p>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-mono font-bold text-red-400">{highPriorityCompletedToday}</span>
            <span className="text-[10px] text-md3-outline">concluídas</span>
          </div>
          <p className="text-[10px] text-md3-outline/70">Necessárias para recompensas de nível S</p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-md3-outline">Status de Limpeza do Dia</p>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-bold uppercase ${allCompletedToday ? 'text-md3-success' : 'text-yellow-400'}`}>
              {allCompletedToday ? 'LIMPO! 🎉' : 'EM ANDAMENTO'}
            </span>
            <span className="text-xs font-mono text-md3-outline">
              ({completedTodayTasks.length}/{todayTasks.length})
            </span>
          </div>
          <p className="text-[10px] text-md3-outline/70">Conclua tudo hoje para bônus total</p>
        </div>
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const isEligible = checkUnlockEligibility(reward);
          const isClaimed = reward.unlocked; // se já resgatou na sessão anterior

          // Formatação amigável de condição
          let conditionLabel = '';
          if (reward.unlockConditionType === 'prioritarias') {
            conditionLabel = `Concluir ${reward.unlockConditionValue} tarefas prioritárias hoje`;
          } else if (reward.unlockConditionType === 'xp') {
            conditionLabel = `Acumular ${reward.unlockConditionValue} XP em tarefas hoje`;
          } else {
            conditionLabel = `Concluir 100% das tarefas planejadas para hoje`;
          }

          return (
            <div
              id={`reward-card-${reward.id}`}
              key={reward.id}
              className={`border rounded-3xl p-5 flex flex-col justify-between h-56 transition-all ${
                isClaimed 
                  ? 'bg-emerald-500/5 border-emerald-500/20 opacity-70' 
                  : isEligible 
                    ? 'bg-md3-surface border-md3-primary/50 glow-primary scale-[1.01]' 
                    : 'bg-md3-surface/70 border-md3-surface-variant'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-md3-surface flex items-center justify-center border border-md3-surface-variant">
                    {getRewardIcon(reward.type)}
                  </div>
                  
                  {/* Lock badge indicator */}
                  {isClaimed ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-wide border border-emerald-500/20">RESGATADA</span>
                  ) : isEligible ? (
                    <span className="px-2 py-0.5 rounded-full bg-md3-primary/10 text-md3-primary text-[10px] font-bold tracking-wide border border-md3-primary/20 flex items-center gap-1">
                      <Unlock className="w-3 h-3" /> LIBERADA
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-md3-surface-variant text-md3-outline text-[10px] font-bold tracking-wide border border-md3-surface-variant flex items-center gap-1 select-none">
                      <Lock className="w-3 h-3 text-red-400" /> BLOQUEADA
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-display font-bold text-sm text-white">{reward.name}</h4>
                  <p className="text-xs text-md3-outline mt-1 font-mono text-[10.5px]">
                    Condição: <span className="text-md3-secondary">{conditionLabel}</span>
                  </p>
                </div>
              </div>

              {/* Action area */}
              <div className="flex items-center justify-between border-t border-md3-surface-variant/30 pt-3 mt-4">
                {rewards.length > 5 && !isClaimed && (
                  <button
                    id={`delete-reward-btn-${reward.id}`}
                    onClick={() => onDeleteReward(reward.id)}
                    className="p-1.5 bg-md3-surface-variant/50 hover:bg-red-500/10 text-md3-outline hover:text-red-400 rounded-lg transition-all cursor-pointer"
                    title="Excluir Recompensa"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex-1" />

                {isClaimed ? (
                  <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Reivindicada hoje!
                  </span>
                ) : isEligible ? (
                  <button
                    id={`claim-reward-btn-${reward.id}`}
                    onClick={() => onClaimReward(reward.id)}
                    className="px-4 py-1.5 bg-md3-primary text-md3-bg rounded-xl text-xs font-bold hover:bg-white transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resgatar Recompensa</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-md3-outline font-mono">
                    <AlertCircle className="w-3.5 h-3.5 text-md3-outline/70" />
                    <span>Conclua tarefas para liberar</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Configure New Reward */}
      {showAddModal && (
        <div id="modal-add-reward" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-md3-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Gift className="w-5 h-5 text-md3-primary" />
                <h3 className="font-display font-bold text-lg text-white">Configurar Nova Recompensa</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-md3-outline hover:text-white font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddRewardSubmit} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Nome do Lazer / Recompensa</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Assistir 3 episódios de One Piece"
                  value={rewardName}
                  onChange={(e) => setRewardName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Type Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Estilo/Tipo</label>
                <select
                  value={rewardType}
                  onChange={(e) => setRewardType(e.target.value as Reward['type'])}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="One Piece">One Piece / Anime</option>
                  <option value="Minecraft">Minecraft / Game</option>
                  <option value="TikTok">TikTok / Redes Sociais</option>
                  <option value="YouTube">YouTube / Vídeos</option>
                  <option value="Instagram">Instagram</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              {/* Unlock criteria */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Condição de Desbloqueio</label>
                <div className="grid grid-cols-3 gap-2 pb-2">
                  {[
                    { id: 'xp', label: 'Meta de XP' },
                    { id: 'prioritarias', label: 'Tarefas de Alta Prioridade' },
                    { id: 'todas_do_dia', label: 'Concluir todas do dia' }
                  ].map((cond) => (
                    <button
                      key={cond.id}
                      type="button"
                      onClick={() => setConditionType(cond.id as Reward['unlockConditionType'])}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        conditionType === cond.id 
                          ? 'bg-md3-primary/20 text-md3-primary border-md3-primary/50 font-bold' 
                          : 'bg-md3-surface-variant/30 text-md3-secondary border-md3-surface-variant hover:text-white'
                      }`}
                    >
                      {cond.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Unlock Value (Xp quantity, or priority task count) */}
              {conditionType !== 'todas_do_dia' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">
                    {conditionType === 'xp' ? 'Quantidade de XP Necessária' : 'Quantidade de Tarefas de Alta Prioridade Necessárias'}
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    required
                    value={conditionValue}
                    onChange={(e) => setConditionValue(e.target.value)}
                    className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-md3-surface-variant flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-md3-primary text-md3-bg rounded-xl text-xs font-bold hover:bg-white transition-all"
                >
                  Confirmar Bloqueador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
