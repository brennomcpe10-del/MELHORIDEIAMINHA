/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Video, 
  Youtube, 
  Tv, 
  Instagram, 
  Plus, 
  Clock, 
  CheckCircle2, 
  PlayCircle,
  Eye,
  Sliders,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { Task, SchoolSubject } from '../types';

interface ContentCreatorViewProps {
  tasks: Task[];
  onNavigateToTasks: () => void;
}

export default function ContentCreatorView({
  tasks,
  onNavigateToTasks
}: ContentCreatorViewProps) {
  // Filtra as tarefas vinculadas a vídeos de criador de conteúdo
  const contentTasks = tasks.filter(t => t.id.startsWith('vid-'));

  // Agrupa as tarefas por prefixo de id de vídeo para reconstruir os vídeos planejados
  const videoGroups: { [id: string]: Task[] } = {};
  contentTasks.forEach(task => {
    // O id do vídeo é a parte comum 'vid-XXXXXXXXXX'
    const match = task.id.match(/vid-\d+/);
    if (match) {
      const vidId = match[0];
      if (!videoGroups[vidId]) {
        videoGroups[vidId] = [];
      }
      videoGroups[vidId].push(task);
    }
  });

  const plannedVideos = Object.entries(videoGroups).map(([id, tasks]) => {
    // Descobre o título a partir do nome da tarefa mais descritiva
    const grabTask = tasks.find(t => t.name.includes('vídeo:'));
    let title = 'Vídeo sem Título';
    if (grabTask) {
      title = grabTask.name.split('vídeo:')[1]?.trim() || 'Vídeo';
    } else {
      const grabTaskAlt = tasks.find(t => t.name.includes('para:'));
      if (grabTaskAlt) {
        title = grabTaskAlt.name.split('para:')[1]?.trim() || 'Vídeo';
      }
    }

    // Identifica plataforma
    let platform: 'YouTube' | 'TikTok' | 'Instagram' = 'YouTube';
    if (tasks.some(t => t.notes?.includes('TikTok'))) platform = 'TikTok';
    if (tasks.some(t => t.notes?.includes('Instagram'))) platform = 'Instagram';

    // Calcula progresso
    const completedCount = tasks.filter(t => t.completed).length;
    const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    
    // Tempo estimado total
    const totalMinutes = tasks.reduce((sum, t) => sum + t.estimatedMinutes, 0);
    const dueDate = tasks[0]?.dueDate || 'Hoje';

    return {
      id,
      title,
      platform,
      progressPercent,
      completedCount,
      totalCount: tasks.length,
      totalMinutes,
      dueDate,
      tasks
    };
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'YouTube':
        return <Youtube className="w-5 h-5 text-red-500" />;
      case 'TikTok':
        return <Tv className="w-5 h-5 text-emerald-400" />;
      default:
        return <Instagram className="w-5 h-5 text-pink-500" />;
    }
  };

  return (
    <div id="content-creator-view" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Esteira de Conteúdo</h2>
          <p className="text-sm text-md3-outline">
            Acompanhe o funil de produção dos seus vídeos. O FocusFlow agenda o ciclo completo de pós-produção.
          </p>
        </div>

        <button 
          id="go-to-tasks-btn"
          onClick={onNavigateToTasks}
          className="px-4 py-2.5 bg-md3-primary text-md3-bg rounded-xl hover:bg-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Planejar Novo Vídeo</span>
        </button>
      </div>

      {/* Overview Stat Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-md3-surface border border-md3-surface-variant p-4.5 rounded-2xl">
          <p className="text-xs text-md3-outline font-medium">Vídeos no Funil</p>
          <h3 className="text-2xl font-display font-bold text-white font-mono mt-1">{plannedVideos.length}</h3>
          <p className="text-[10px] text-md3-outline mt-1">Sendo roteirizados, gravados ou editados</p>
        </div>

        <div className="bg-md3-surface border border-md3-surface-variant p-4.5 rounded-2xl">
          <p className="text-xs text-md3-outline font-medium">Tempo de Produção Ativo</p>
          <h3 className="text-2xl font-display font-bold text-md3-success font-mono mt-1">
            {Math.round(contentTasks.filter(t => !t.completed).reduce((sum, t) => sum + t.estimatedMinutes, 0) / 60)}h
          </h3>
          <p className="text-[10px] text-md3-outline mt-1">Foco de gravação e edição pendente</p>
        </div>

        <div className="bg-md3-surface border border-md3-surface-variant p-4.5 rounded-2xl">
          <p className="text-xs text-md3-outline font-medium">Taxa de Conclusão de Mídia</p>
          <h3 className="text-2xl font-display font-bold text-md3-tertiary font-mono mt-1">
            {plannedVideos.length > 0 
              ? Math.round(plannedVideos.reduce((sum, v) => sum + v.progressPercent, 0) / plannedVideos.length) 
              : 100}%
          </h3>
          <p className="text-[10px] text-md3-outline mt-1">Média de andamento dos projetos de vídeo</p>
        </div>
      </div>

      {/* Production Pipeline Board */}
      <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-md3-surface-variant/50">
          <Video className="w-5 h-5 text-red-400" />
          <h3 className="font-display font-bold text-base text-white">Funil de Vídeos Ativos</h3>
        </div>

        {plannedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-md3-surface-variant flex items-center justify-center text-md3-outline">
              <Tv className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Nenhum vídeo em produção</h4>
              <p className="text-xs text-md3-outline mt-1 max-w-sm">
                Vá na aba Tarefas e clique em "Novo Vídeo". O FocusFlow agendará automaticamente os 8 passos necessários para publicar e interagir com o público!
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {plannedVideos.map((vid) => (
              <div 
                id={`content-video-row-${vid.id}`}
                key={vid.id}
                className="p-5 bg-md3-surface-variant/30 border border-md3-surface-variant rounded-2xl space-y-4"
              >
                {/* Upper info row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-md3-surface flex items-center justify-center border border-md3-surface-variant">
                      {getPlatformIcon(vid.platform)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white font-display">{vid.title}</h4>
                      <p className="text-[11px] text-md3-outline font-mono">
                        Plataforma: {vid.platform} • Prazo Publicação: {vid.dueDate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-white font-mono">{vid.progressPercent}%</p>
                      <p className="text-[10px] text-md3-outline">{vid.completedCount} de {vid.totalCount} etapas completas</p>
                    </div>
                    <div className="w-24 bg-md3-surface rounded-full h-1.5 overflow-hidden">
                      <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${vid.progressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Milestones horizontal checklist */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 border-t border-md3-surface-variant/50 pt-3">
                  {vid.tasks.map((task, idx) => {
                    const stepName = task.name.split(':')[0] || 'Etapa';
                    // Simplifica nome do passo para caber na grid
                    const displayStep = stepName.replace('Pesquisar ideias para vídeo', '1. Ideias')
                                                .replace('Criar roteiro para vídeo', '2. Roteiro')
                                                .replace('Gravar vídeo', '3. Gravar')
                                                .replace('Editar vídeo', '4. Editar')
                                                .replace('Criar Thumbnail para', '5. Capa')
                                                .replace('Escrever descrição e tags para', '6. SEO/Tags')
                                                .replace('Publicar vídeo', '7. Publicar')
                                                .replace('Responder comentários de', '8. Feedback');

                    return (
                      <div 
                        key={task.id} 
                        className={`p-2 rounded-xl border text-center space-y-1 transition-all ${
                          task.completed 
                            ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400 opacity-80' 
                            : 'bg-md3-surface/40 border-md3-surface-variant text-md3-secondary'
                        }`}
                      >
                        <p className="text-[9px] font-mono font-semibold truncate leading-none">{displayStep}</p>
                        <div className="flex items-center justify-center gap-1 text-[8px] font-mono opacity-80 pt-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{task.estimatedMinutes}m</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
