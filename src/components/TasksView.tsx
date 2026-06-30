/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  BookOpen, 
  Video, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Search, 
  SlidersHorizontal,
  PlusCircle, 
  Calendar, 
  Clock,
  Sparkles,
  HelpCircle,
  AlertCircle,
  Radio
} from 'lucide-react';
import { Task, TaskCategory, TaskPriority, TaskDifficulty, SchoolSubject, SchoolSchedule } from '../types';
import { findNextClassDate, generateLiveOccurrences } from '../utils/scheduler';

interface TasksViewProps {
  tasks: Task[];
  subjects: SchoolSubject[];
  schedule: SchoolSchedule;
  onAddTasks: (newTasks: Task[]) => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteTaskSeries?: (seriesId: string, fromDate: string) => void;
  onEditTaskSeries?: (seriesId: string, fromDate: string, updatedFields: any) => void;
  onEditTask?: (taskId: string, updatedFields: Partial<Task>) => void;
  onTriggerReschedule: () => void;
}

export default function TasksView({
  tasks,
  subjects,
  schedule,
  onAddTasks,
  onToggleTask,
  onDeleteTask,
  onDeleteTaskSeries,
  onEditTaskSeries,
  onEditTask,
  onTriggerReschedule
}: TasksViewProps) {
  // Modal toggle states
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showLiveModal, setShowLiveModal] = useState(false);

  // Deletion modal for Lives
  const [deleteConfirmLive, setDeleteConfirmLive] = useState<Task | null>(null);

  // Editing states for Lives
  const [editingLive, setEditingLive] = useState<Task | null>(null);
  const [isSeriesEdit, setIsSeriesEdit] = useState(false);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [selectedPriority, setSelectedPriority] = useState<string>('todos');

  // Form states - Live Task
  const [liveTitle, setLiveTitle] = useState('');
  const [liveTheme, setLiveTheme] = useState('');
  const [livePlatform, setLivePlatform] = useState<'YouTube' | 'Twitch' | 'TikTok' | 'Personalizada'>('YouTube');
  const [livePlatformCustom, setLivePlatformCustom] = useState('');
  const [liveDate, setLiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [liveStartTime, setLiveStartTime] = useState('18:00');
  const [liveDuration, setLiveDuration] = useState('60'); // minutes
  const [livePriority, setLivePriority] = useState<TaskPriority>('media');
  const [liveNotes, setLiveNotes] = useState('');
  const [liveRecurrenceType, setLiveRecurrenceType] = useState<'nao' | 'diaria' | 'segunda_sexta' | 'semanal' | 'mensal' | 'personalizado'>('nao');
  const [liveRecurrenceDays, setLiveRecurrenceDays] = useState<number[]>([1, 3, 5]); // default Seg, Qua, Sex

  // Form states - School Activity
  const [schoolSubjectId, setSchoolSubjectId] = useState('');
  const [schoolActivityType, setSchoolActivityType] = useState('Trabalho');
  const [schoolEstHours, setSchoolEstHours] = useState('2');
  const [schoolDeadlineType, setSchoolDeadlineType] = useState('next_class'); // 'next_class' | 'custom'
  const [schoolCustomDate, setSchoolCustomDate] = useState('');

  // Form states - Creator Video
  const [videoPlatform, setVideoPlatform] = useState<'YouTube' | 'TikTok' | 'Instagram'>('YouTube');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoRecordHours, setVideoRecordHours] = useState('1');
  const [videoEditHours, setVideoEditHours] = useState('2');
  const [videoThumbnail, setVideoThumbnail] = useState(true);
  const [videoDescription, setVideoDescription] = useState(true);
  const [videoDueDate, setVideoDueDate] = useState('');

  // Form states - Manual Task
  const [manualName, setManualName] = useState('');
  const [manualCategory, setManualCategory] = useState<TaskCategory>('pessoal');
  const [manualPriority, setManualPriority] = useState<TaskPriority>('media');
  const [manualDifficulty, setManualDifficulty] = useState<TaskDifficulty>('media');
  const [manualDuration, setManualDuration] = useState('30'); // minutes
  const [manualDueDate, setManualDueDate] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  // Handles School Activity creation
  const handleCreateSchoolActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolSubjectId) return;

    const todayStr = new Date().toISOString().split('T')[0];
    let finalDueDate = schoolCustomDate;

    if (schoolDeadlineType === 'next_class') {
      finalDueDate = findNextClassDate(schoolSubjectId, schedule, todayStr);
    }

    if (!finalDueDate) {
      finalDueDate = todayStr;
    }

    const minutesToAllocate = parseFloat(schoolEstHours) * 60;
    const subj = subjects.find(s => s.id === schoolSubjectId);
    const subjectName = subj ? subj.name : 'Matéria';

    const newTasksList: Task[] = [];
    const idPrefix = `sch-${Date.now()}`;

    // Diferencia fluxo com base no tipo de atividade
    if (schoolActivityType === 'Trabalho') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Pesquisar referências para Trabalho de ${subjectName}`,
          category: 'escola',
          priority: 'media',
          estimatedMinutes: Math.round(minutesToAllocate * 0.25),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 20,
          notes: 'Levantamento bibliográfico inicial e anotações.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-2`,
          name: `Rascunho inicial do Trabalho de ${subjectName}`,
          category: 'escola',
          priority: 'media',
          estimatedMinutes: Math.round(minutesToAllocate * 0.4),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 35,
          notes: 'Desenvolver a introdução e o corpo do trabalho escolar.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-3`,
          name: `Revisão e formatação do Trabalho de ${subjectName}`,
          category: 'escola',
          priority: 'baixa',
          estimatedMinutes: Math.round(minutesToAllocate * 0.15),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 15,
          notes: 'Revisar ortografia e garantir as regras da escola.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-4`,
          name: `Entregar Trabalho de ${subjectName}`,
          category: 'escola',
          priority: 'alta',
          estimatedMinutes: Math.round(minutesToAllocate * 0.2),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 30,
          notes: 'Envio ou entrega final para o professor.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        }
      );
    } else if (schoolActivityType === 'Seminário') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Pesquisa de conteúdo para Seminário de ${subjectName}`,
          category: 'escola',
          priority: 'media',
          estimatedMinutes: Math.round(minutesToAllocate * 0.3),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 25,
          notes: 'Estudar o tema e estruturar os principais tópicos.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-2`,
          name: `Criação dos slides para Seminário de ${subjectName}`,
          category: 'escola',
          priority: 'media',
          estimatedMinutes: Math.round(minutesToAllocate * 0.35),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 30,
          notes: 'Fazer slides visuais e objetivos.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-3`,
          name: `Treinar apresentação para Seminário de ${subjectName}`,
          category: 'escola',
          priority: 'baixa',
          estimatedMinutes: Math.round(minutesToAllocate * 0.2),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 20,
          notes: 'Treinar dicção e cronometrar o tempo de fala.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-4`,
          name: `Apresentar Seminário de ${subjectName}`,
          category: 'escola',
          priority: 'alta',
          estimatedMinutes: Math.round(minutesToAllocate * 0.15),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'dificil',
          xp: 50,
          notes: 'Dia da apresentação presencial!',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        }
      );
    } else if (schoolActivityType === 'Prova') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Revisão de capítulos para Prova de ${subjectName}`,
          category: 'escola',
          priority: 'alta',
          estimatedMinutes: Math.round(minutesToAllocate * 0.4),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 35,
          notes: 'Reler anotações do caderno e grifos do livro.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-2`,
          name: `Resolução de exercícios para Prova de ${subjectName}`,
          category: 'escola',
          priority: 'alta',
          estimatedMinutes: Math.round(minutesToAllocate * 0.4),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'dificil',
          xp: 45,
          notes: 'Fazer listas de exercícios e provas antigas para fixar.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-3`,
          name: `Simulado final / Fórmulas de ${subjectName}`,
          category: 'escola',
          priority: 'media',
          estimatedMinutes: Math.round(minutesToAllocate * 0.2),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 25,
          notes: 'Memorizar principais fórmulas e conceitos-chave antes da avaliação.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        }
      );
    } else if (schoolActivityType === 'Redação') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Roteiro e ideias para Redação de ${subjectName}`,
          category: 'escola',
          priority: 'media',
          estimatedMinutes: Math.round(minutesToAllocate * 0.3),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 15,
          notes: 'Definir tese, repertório e argumentos que usará na folha de rascunho.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        },
        {
          id: `${idPrefix}-2`,
          name: `Escrever e revisar Redação de ${subjectName}`,
          category: 'escola',
          priority: 'alta',
          estimatedMinutes: Math.round(minutesToAllocate * 0.7),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 40,
          notes: 'Escrever a versão definitiva e passar a limpo corrigindo erros.',
          completed: false,
          subjectId: schoolSubjectId,
          originSource: 'escola_atividade'
        }
      );
    } else {
      // Lista, Pesquisa, Exercícios, Prova, Redação, Projeto etc.
      newTasksList.push({
        id: `${idPrefix}-u`,
        name: `${schoolActivityType} de ${subjectName}`,
        category: 'escola',
        priority: 'media',
        estimatedMinutes: Math.round(minutesToAllocate),
        dueDate: finalDueDate,
        recurrence: 'nao',
        difficulty: 'media',
        xp: 30,
        notes: `Atividade acadêmica de ${subjectName} do tipo ${schoolActivityType}.`,
        completed: false,
        subjectId: schoolSubjectId,
        originSource: 'escola_atividade'
      });
    }

    onAddTasks(newTasksList);
    setShowSchoolModal(false);
    
    // Reset form states
    setSchoolSubjectId('');
    setSchoolEstHours('2');
    setSchoolDeadlineType('next_class');
    setSchoolCustomDate('');
  };

  // Handles Creator Video creation
  const handleCreateCreatorVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const finalDueDate = videoDueDate || todayStr;

    const recordMin = parseFloat(videoRecordHours) * 60;
    const editMin = parseFloat(videoEditHours) * 60;

    const newTasksList: Task[] = [];
    const idPrefix = `vid-${Date.now()}`;

    // 1. Pesquisar ideias
    newTasksList.push({
      id: `${idPrefix}-1`,
      name: `Pesquisar ideias para vídeo: ${videoTitle}`,
      category: 'conteudo',
      priority: 'baixa',
      estimatedMinutes: 20,
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: 'facil',
      xp: 10,
      notes: `Pesquisar referências no ${videoPlatform} e tendências.`,
      completed: false,
      originSource: 'conteudo_video'
    });

    // 2. Criar roteiro
    newTasksList.push({
      id: `${idPrefix}-2`,
      name: `Criar roteiro para vídeo: ${videoTitle}`,
      category: 'conteudo',
      priority: 'media',
      estimatedMinutes: 30,
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: 'media',
      xp: 25,
      notes: `Estruturar gancho (primeiros 3s), roteiro principal e chamada para ação (CTA).`,
      completed: false,
      originSource: 'conteudo_video'
    });

    // 3. Gravar
    newTasksList.push({
      id: `${idPrefix}-3`,
      name: `Gravar vídeo: ${videoTitle}`,
      category: 'conteudo',
      priority: 'alta',
      estimatedMinutes: Math.round(recordMin),
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: 'media',
      xp: 40,
      notes: `Preparar cenário, iluminação e gravar takes do roteiro.`,
      completed: false,
      originSource: 'conteudo_video'
    });

    // 4. Editar
    newTasksList.push({
      id: `${idPrefix}-4`,
      name: `Editar vídeo: ${videoTitle}`,
      category: 'conteudo',
      priority: 'alta',
      estimatedMinutes: Math.round(editMin),
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: 'dificil',
      xp: 50,
      notes: `Fazer cortes, adicionar legendas automáticas, trilha e efeitos sonoros.`,
      completed: false,
      originSource: 'conteudo_video'
    });

    // 5. Thumbnail?
    if (videoThumbnail) {
      newTasksList.push({
        id: `${idPrefix}-5`,
        name: `Criar Thumbnail para: ${videoTitle}`,
        category: 'conteudo',
        priority: 'media',
        estimatedMinutes: 30,
        dueDate: finalDueDate,
        recurrence: 'nao',
        difficulty: 'media',
        xp: 20,
        notes: `Criar arte chamativa com contraste de cores e texto legível.`,
        completed: false,
        originSource: 'conteudo_video'
      });
    }

    // 6. Descrição?
    if (videoDescription) {
      newTasksList.push({
        id: `${idPrefix}-6`,
        name: `Escrever descrição e tags para: ${videoTitle}`,
        category: 'conteudo',
        priority: 'baixa',
        estimatedMinutes: 15,
        dueDate: finalDueDate,
        recurrence: 'nao',
        difficulty: 'facil',
        xp: 10,
        notes: `Escrever copy persuasiva de SEO e otimizar hashtags.`,
        completed: false,
        originSource: 'conteudo_video'
      });
    }

    // 7. Publicar
    newTasksList.push({
      id: `${idPrefix}-7`,
      name: `Publicar vídeo: ${videoTitle}`,
      category: 'conteudo',
      priority: 'alta',
      estimatedMinutes: 10,
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: 'facil',
      xp: 15,
      notes: `Upload na plataforma ${videoPlatform} agendado no melhor horário.`,
      completed: false,
      originSource: 'conteudo_video'
    });

    // 8. Responder comentários
    newTasksList.push({
      id: `${idPrefix}-8`,
      name: `Responder comentários de: ${videoTitle}`,
      category: 'conteudo',
      priority: 'baixa',
      estimatedMinutes: 15,
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: 'facil',
      xp: 15,
      notes: `Responder primeiros comentários para engajar a audiência.`,
      completed: false,
      originSource: 'conteudo_video'
    });

    onAddTasks(newTasksList);
    setShowVideoModal(false);
    
    // Reset form states
    setVideoTitle('');
    setVideoRecordHours('1');
    setVideoEditHours('2');
    setVideoThumbnail(true);
    setVideoDescription(true);
    setVideoDueDate('');
  };

  // Handles Manual Task creation
  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const finalDueDate = manualDueDate || todayStr;

    // Calcula XP baseado na dificuldade
    let xpAward = 15;
    if (manualDifficulty === 'media') xpAward = 30;
    if (manualDifficulty === 'dificil') xpAward = 50;
    if (manualPriority === 'alta') xpAward += 10;

    const newTask: Task = {
      id: `man-${Date.now()}`,
      name: manualName,
      category: manualCategory,
      priority: manualPriority,
      estimatedMinutes: parseInt(manualDuration) || 30,
      dueDate: finalDueDate,
      recurrence: 'nao',
      difficulty: manualDifficulty,
      xp: xpAward,
      notes: manualNotes,
      completed: false,
      originSource: 'manual'
    };

    onAddTasks([newTask]);
    setShowManualModal(false);

    // Reset form
    setManualName('');
    setManualCategory('pessoal');
    setManualPriority('media');
    setManualDifficulty('media');
    setManualDuration('30');
    setManualDueDate('');
    setManualNotes('');
  };

  const handleToggleRecurrenceDay = (dayIndex: number) => {
    if (liveRecurrenceDays.includes(dayIndex)) {
      setLiveRecurrenceDays(liveRecurrenceDays.filter(d => d !== dayIndex));
    } else {
      setLiveRecurrenceDays([...liveRecurrenceDays, dayIndex]);
    }
  };

  const handleCreateLive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveTitle) return;

    const baseDate = liveDate || new Date().toISOString().split('T')[0];
    const durationMin = parseInt(liveDuration) || 60;

    if (editingLive) {
      const updatedFields = {
        name: `🔴 Live: ${liveTitle}`,
        liveGameOrTheme: liveTheme,
        livePlatform: livePlatform,
        livePlatformCustom: livePlatform === 'Personalizada' ? livePlatformCustom : '',
        scheduledTime: liveStartTime,
        estimatedMinutes: durationMin,
        priority: livePriority,
        notes: liveNotes,
        liveRecurrence: liveRecurrenceType,
        liveRecurrenceDays: liveRecurrenceDays,
        dueDate: baseDate,
        scheduledDate: baseDate,
        xp: Math.round(durationMin * 0.7)
      };

      if (isSeriesEdit && editingLive.liveSeriesId && onEditTaskSeries) {
        onEditTaskSeries(editingLive.liveSeriesId, baseDate, updatedFields);
      } else if (onEditTask) {
        onEditTask(editingLive.id, updatedFields);
      }

      setEditingLive(null);
      setShowLiveModal(false);
      resetLiveForm();
      return;
    }

    const newLives = generateLiveOccurrences(
      liveTitle,
      liveTheme,
      livePlatform,
      livePlatformCustom,
      baseDate,
      liveStartTime,
      durationMin,
      livePriority,
      liveNotes,
      liveRecurrenceType,
      liveRecurrenceDays
    );

    onAddTasks(newLives);
    setShowLiveModal(false);
    resetLiveForm();
  };

  const resetLiveForm = () => {
    setLiveTitle('');
    setLiveTheme('');
    setLivePlatform('YouTube');
    setLivePlatformCustom('');
    setLiveDate(new Date().toISOString().split('T')[0]);
    setLiveStartTime('18:00');
    setLiveDuration('60');
    setLivePriority('media');
    setLiveNotes('');
    setLiveRecurrenceType('nao');
    setLiveRecurrenceDays([1, 3, 5]);
    setIsSeriesEdit(false);
  };

  const handleStartEditLive = (task: Task) => {
    setEditingLive(task);
    setLiveTitle(task.name.replace(/^🔴 Live:\s*/, ''));
    setLiveTheme(task.liveGameOrTheme || '');
    setLivePlatform(task.livePlatform || 'YouTube');
    setLivePlatformCustom(task.livePlatformCustom || '');
    setLiveDate(task.scheduledDate || task.dueDate);
    setLiveStartTime(task.scheduledTime || '18:00');
    setLiveDuration(String(task.estimatedMinutes));
    setLivePriority(task.priority);
    setLiveNotes(task.notes || '');
    setLiveRecurrenceType(task.liveRecurrence || 'nao');
    setLiveRecurrenceDays(task.liveRecurrenceDays || [1, 3, 5]);
    setIsSeriesEdit(false);
    setShowLiveModal(true);
  };

  // Filtragem e busca de tarefas
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.notes.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || t.category === selectedCategory;
    const matchesPriority = selectedPriority === 'todos' || t.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  return (
    <div id="tasks-view-container" className="space-y-6">
      
      {/* View Header with Trigger Buttons */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Central de Tarefas</h2>
          <p className="text-sm text-md3-outline">Gerencie, planeje e fragmente atividades complexas com um clique.</p>
        </div>

        {/* Buttons Group */}
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
          <button 
            id="btn-school-modal"
            onClick={() => setShowSchoolModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl transition-all font-semibold text-xs cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Nova Atividade Escolar</span>
          </button>
          
          <button 
            id="btn-video-modal"
            onClick={() => setShowVideoModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-all font-semibold text-xs cursor-pointer"
          >
            <Video className="w-4 h-4" />
            <span>Novo Vídeo</span>
          </button>

          <button 
            id="btn-live-modal"
            onClick={() => {
              resetLiveForm();
              setShowLiveModal(true);
            }}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-xl transition-all font-semibold text-xs cursor-pointer"
          >
            <Radio className="w-4 h-4 text-purple-400" />
            <span>Nova Live</span>
          </button>

          <button 
            id="btn-manual-modal"
            onClick={() => setShowManualModal(true)}
            className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-md3-primary text-md3-bg rounded-xl hover:bg-white transition-all font-semibold text-xs cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Tarefa</span>
          </button>
        </div>
      </div>

      {/* Agenda Alert Indicator */}
      <div className="bg-md3-surface border border-md3-surface-variant p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex gap-2.5">
          <AlertCircle className="w-5 h-5 text-md3-primary shrink-0" />
          <div>
            <h4 className="text-xs font-semibold text-white">Distribuição Inteligente Ativada</h4>
            <p className="text-[11px] text-md3-outline leading-relaxed mt-0.5">
              Ao adicionar ou mover tarefas, o FocusFlow automaticamente calcula seus dias livres e as distribui da melhor forma.
            </p>
          </div>
        </div>
        <button 
          id="trigger-reschedule-btn"
          onClick={onTriggerReschedule}
          className="w-full md:w-auto px-4 py-2 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
        >
          Reorganizar Agenda
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-md3-surface border border-md3-surface-variant p-4 rounded-3xl space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Field */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-md3-outline" />
            <input 
              id="task-search-input"
              type="text" 
              placeholder="Pesquisar tarefas..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-2xl text-xs text-white placeholder-md3-outline focus:outline-none focus:border-md3-primary"
            />
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-2.5 min-w-[200px]">
            <SlidersHorizontal className="w-4 h-4 text-md3-outline" />
            <select
              id="priority-filter"
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 bg-md3-surface-variant/50 border border-md3-surface-variant rounded-2xl text-xs text-white focus:outline-none cursor-pointer"
            >
              <option value="todos">Todas Prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>

        {/* Category horizontal scroll badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-1 border-t border-md3-surface-variant/50">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'escola', label: 'Escola' },
            { id: 'conteudo', label: 'Conteúdo' },
            { id: 'estudos', label: 'Estudos' },
            { id: 'trabalho', label: 'Trabalho' },
            { id: 'pessoal', label: 'Pessoal' },
            { id: 'live', label: 'Lives' }
          ].map((cat) => (
            <button
              id={`filter-cat-${cat.id}`}
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-medium transition-all shrink-0 cursor-pointer ${
                selectedCategory === cat.id 
                  ? 'bg-md3-primary text-md3-bg font-semibold' 
                  : 'bg-md3-surface-variant/40 hover:bg-md3-surface-variant text-md3-secondary hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task List Grid */}
      <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 min-h-[350px]">
        {filteredTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-md3-surface-variant flex items-center justify-center text-md3-outline">
              <PlusCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">Nenhuma tarefa encontrada</h4>
              <p className="text-xs text-md3-outline mt-1 max-w-sm">
                Adicione novas tarefas manualmente ou use nossos modelos automatizados de vídeo e escola para economizar tempo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => {
              const subj = task.subjectId ? subjects.find(s => s.id === task.subjectId) : null;
              
              return (
                <div 
                  id={`task-row-${task.id}`}
                  key={task.id}
                  className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-2xl border transition-all ${
                    task.completed 
                      ? 'bg-md3-surface-variant/10 border-md3-surface-variant/40 opacity-60' 
                      : 'bg-md3-surface-variant/30 border-md3-surface-variant hover:border-md3-outline/20'
                  }`}
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <button
                      id={`list-toggle-complete-${task.id}`}
                      onClick={() => onToggleTask(task.id)}
                      className="mt-0.5 text-md3-outline hover:text-md3-success transition-colors cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-md3-success fill-md3-success/10" />
                      ) : (
                        <Circle className="w-5 h-5 text-md3-outline" />
                      )}
                    </button>

                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold text-white truncate ${task.completed ? 'line-through text-md3-outline' : ''}`}>
                          {task.name}
                        </h4>
                        <span className="text-[10px] font-mono text-md3-tertiary bg-md3-tertiary/10 px-1.5 py-0.5 rounded">+{task.xp} XP</span>
                      </div>

                      {/* Details row */}
                      <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-md3-outline">
                        <span className={`capitalize font-medium px-2 py-0.5 rounded-md flex items-center gap-1 ${
                          task.category === 'live' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 font-mono' 
                            : 'text-white/70 bg-md3-surface-variant'
                        }`}>
                          {task.category === 'live' && <Radio className="w-3 h-3 text-purple-400 animate-pulse" />}
                          {task.category}
                        </span>

                        {subj && (
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${subj.color}`}>
                            {subj.name}
                          </span>
                        )}

                        <span className="flex items-center gap-1 font-mono">
                          <Clock className="w-3.5 h-3.5" />
                          {task.estimatedMinutes}min
                        </span>

                        <span className="flex items-center gap-1 font-mono text-md3-primary">
                          <Calendar className="w-3.5 h-3.5" />
                          Prazo: {task.dueDate}
                        </span>

                        {task.scheduledDate ? (
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] px-2 py-0.5 rounded font-mono">
                            Agendado: {task.scheduledDate} {task.scheduledTime || ''}
                          </span>
                        ) : !task.completed ? (
                          <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] px-2 py-0.5 rounded font-mono flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Sem horário livre disponível
                          </span>
                        ) : null}
                      </div>

                      {task.notes && (
                        <p className="text-xs text-md3-secondary leading-relaxed pt-1.5 border-t border-md3-surface-variant/30 mt-1 max-w-2xl font-sans">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 border-md3-surface-variant/30 pt-3 md:pt-0">
                    {task.category === 'live' && (
                      <button
                        id={`edit-live-btn-${task.id}`}
                        title="Editar Live"
                        onClick={() => handleStartEditLive(task)}
                        className="p-2 bg-md3-surface-variant/50 hover:bg-purple-500/20 hover:text-purple-400 text-md3-outline rounded-xl transition-all cursor-pointer"
                      >
                        <SlidersHorizontal className="w-4 h-4" />
                      </button>
                    )}
                    <button 
                      id={`delete-task-btn-${task.id}`}
                      onClick={() => {
                        if (task.category === 'live' && task.liveSeriesId) {
                          setDeleteConfirmLive(task);
                        } else {
                          onDeleteTask(task.id);
                        }
                      }}
                      className="p-2 bg-md3-surface-variant/50 hover:bg-red-500/20 hover:text-red-400 text-md3-outline rounded-xl transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: School Activity Wizard */}
      {showSchoolModal && (
        <div id="modal-school-activity" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-md3-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-orange-400" />
                <h3 className="font-display font-bold text-lg text-white">Criar Atividade Escolar Inteligente</h3>
              </div>
              <button 
                onClick={() => setShowSchoolModal(false)}
                className="text-md3-outline hover:text-white font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSchoolActivity} className="p-6 space-y-4">
              {/* Subject Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Selecione a Matéria Escolar</label>
                <select
                  required
                  value={schoolSubjectId}
                  onChange={(e) => setSchoolSubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary cursor-pointer"
                >
                  <option value="">-- Selecione uma matéria cadastrada --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Type Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Tipo de Atividade</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Trabalho', 'Seminário', 'Prova', 'Redação', 'Exercícios', 'Projeto'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setSchoolActivityType(type)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        schoolActivityType === type 
                          ? 'bg-orange-400/20 text-orange-400 border-orange-400/50 font-bold' 
                          : 'bg-md3-surface-variant/30 text-md3-secondary border-md3-surface-variant hover:text-white'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Estimate hours */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Tempo Total Estimado (Horas)</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0.5"
                  max="20"
                  required
                  value={schoolEstHours}
                  onChange={(e) => setSchoolEstHours(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                />
                <p className="text-[10px] text-md3-outline italic">
                  O FocusFlow subdividirá automaticamente essas horas em pequenas tarefas agendadas nos seus horários livres.
                </p>
              </div>

              {/* Deadline Options */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Data de Entrega / Prazo</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input 
                      type="radio" 
                      name="deadline_type" 
                      value="next_class" 
                      checked={schoolDeadlineType === 'next_class'}
                      onChange={() => setSchoolDeadlineType('next_class')}
                      className="accent-md3-primary"
                    />
                    <span>Na próxima aula desta matéria</span>
                  </label>
                  
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                    <input 
                      type="radio" 
                      name="deadline_type" 
                      value="custom" 
                      checked={schoolDeadlineType === 'custom'}
                      onChange={() => setSchoolDeadlineType('custom')}
                      className="accent-md3-primary"
                    />
                    <span>Data Personalizada</span>
                  </label>
                </div>
              </div>

              {schoolDeadlineType === 'custom' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Escolha a data</label>
                  <input 
                    type="date" 
                    required={schoolDeadlineType === 'custom'}
                    value={schoolCustomDate}
                    onChange={(e) => setSchoolCustomDate(e.target.value)}
                    className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                  />
                </div>
              )}

              <div className="pt-4 border-t border-md3-surface-variant flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowSchoolModal(false)}
                  className="flex-1 py-2.5 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-md3-primary text-md3-bg rounded-xl text-xs font-bold hover:bg-white transition-all cursor-pointer"
                >
                  Gerar Roteiro de Estudos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Creator Video Wizard */}
      {showVideoModal && (
        <div id="modal-creator-video" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-md3-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-red-400" />
                <h3 className="font-display font-bold text-lg text-white">Criar Planejamento de Vídeo</h3>
              </div>
              <button 
                onClick={() => setShowVideoModal(false)}
                className="text-md3-outline hover:text-white font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCreatorVideo} className="p-6 space-y-4">
              
              {/* Platform selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Plataforma do Vídeo</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['YouTube', 'TikTok', 'Instagram'] as const).map((plat) => (
                    <button
                      key={plat}
                      type="button"
                      onClick={() => setVideoPlatform(plat)}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        videoPlatform === plat 
                          ? 'bg-red-400/20 text-red-400 border-red-400/50 font-bold' 
                          : 'bg-md3-surface-variant/30 text-md3-secondary border-md3-surface-variant hover:text-white'
                      }`}
                    >
                      {plat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Título do Vídeo ou Ideia Inicial</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Como organizei minha semana escolar"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Record and Edit durations */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Tempo Gravação (H)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    required
                    value={videoRecordHours}
                    onChange={(e) => setVideoRecordHours(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Tempo Edição (H)</label>
                  <input 
                    type="number" 
                    step="0.5"
                    min="0.5"
                    required
                    value={videoEditHours}
                    onChange={(e) => setVideoEditHours(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Checkboxes for Thumbnail and Description */}
              <div className="flex flex-col gap-2.5 py-1">
                <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={videoThumbnail}
                    onChange={(e) => setVideoThumbnail(e.target.checked)}
                    className="accent-md3-primary w-4 h-4 rounded"
                  />
                  <span>Precisa de Thumbnail (Miniatura)? (+30min agendados)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                  <input 
                    type="checkbox" 
                    checked={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.checked)}
                    className="accent-md3-primary w-4 h-4 rounded"
                  />
                  <span>Precisa de descrição escrita e otimização de SEO? (+15min)</span>
                </label>
              </div>

              {/* Target publish date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Data Alvo para Publicar</label>
                <input 
                  type="date" 
                  required
                  value={videoDueDate}
                  onChange={(e) => setVideoDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              <div className="pt-4 border-t border-md3-surface-variant flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="flex-1 py-2.5 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-md3-primary text-md3-bg rounded-xl text-xs font-bold hover:bg-white transition-all"
                >
                  Agendar Ciclo Completo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Manual Task Creation */}
      {showManualModal && (
        <div id="modal-manual-task" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-md3-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <PlusCircle className="w-5 h-5 text-md3-primary" />
                <h3 className="font-display font-bold text-lg text-white">Adicionar Nova Tarefa</h3>
              </div>
              <button 
                onClick={() => setShowManualModal(false)}
                className="text-md3-outline hover:text-white font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualTask} className="p-6 space-y-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Nome da Tarefa</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Resolver questionário de biologia"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Category, Priority and Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Categoria</label>
                  <select
                    value={manualCategory}
                    onChange={(e) => setManualCategory(e.target.value as TaskCategory)}
                    className="w-full px-2 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="pessoal">Pessoal</option>
                    <option value="escola">Escola</option>
                    <option value="conteudo">Conteúdo</option>
                    <option value="estudos">Estudos</option>
                    <option value="trabalho">Trabalho</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Prioridade</label>
                  <select
                    value={manualPriority}
                    onChange={(e) => setManualPriority(e.target.value as TaskPriority)}
                    className="w-full px-2 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Dificuldade</label>
                  <select
                    value={manualDifficulty}
                    onChange={(e) => setManualDifficulty(e.target.value as TaskDifficulty)}
                    className="w-full px-2 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="facil">Fácil</option>
                    <option value="media">Média</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              {/* Duration and Due Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Duração Estimada (min)</label>
                  <input 
                    type="number" 
                    min="5"
                    max="480"
                    required
                    value={manualDuration}
                    onChange={(e) => setManualDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Data de Entrega</label>
                  <input 
                    type="date" 
                    required
                    value={manualDueDate}
                    onChange={(e) => setManualDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Notas / Observações</label>
                <textarea 
                  rows={2}
                  placeholder="Instruções extras, links ou observações da tarefa..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white placeholder-md3-outline font-sans"
                />
              </div>

              <div className="pt-4 border-t border-md3-surface-variant flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-md3-primary text-md3-bg rounded-xl text-xs font-bold hover:bg-white transition-all"
                >
                  Confirmar Tarefa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Live Task Creation & Editing */}
      {showLiveModal && (
        <div id="modal-live-task" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-md3-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-5 h-5 text-purple-400 animate-pulse" />
                <h3 className="font-display font-bold text-lg text-white">
                  {editingLive ? 'Editar Live Transmissão' : 'Cadastrar Nova Live'}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setShowLiveModal(false);
                  setEditingLive(null);
                  resetLiveForm();
                }}
                className="text-md3-outline hover:text-white font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLive} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              
              {/* If editing series, show choice */}
              {editingLive && editingLive.liveSeriesId && (
                <div className="bg-purple-500/5 border border-purple-500/20 p-3.5 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-purple-400">Esta live faz parte de uma série recorrente.</p>
                  <p className="text-[11px] text-md3-outline">Como deseja aplicar as edições feitas abaixo?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsSeriesEdit(false)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all border ${
                        !isSeriesEdit 
                          ? 'bg-purple-500 text-white border-purple-500' 
                          : 'bg-md3-surface border-md3-surface-variant text-md3-secondary hover:text-white'
                      }`}
                    >
                      Apenas esta ocorrência
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSeriesEdit(true)}
                      className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-semibold transition-all border ${
                        isSeriesEdit 
                          ? 'bg-purple-500 text-white border-purple-500' 
                          : 'bg-md3-surface border-md3-surface-variant text-md3-secondary hover:text-white'
                      }`}
                    >
                      Toda a série (futuras)
                    </button>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Título da Live</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Gameplay de Minecraft, Conversa Fiada, etc."
                  value={liveTitle}
                  onChange={(e) => setLiveTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Game/Theme & Platform */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Jogo ou Tema</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Valorant / Programação"
                    value={liveTheme}
                    onChange={(e) => setLiveTheme(e.target.value)}
                    className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Plataforma</label>
                  <select
                    value={livePlatform}
                    onChange={(e) => setLivePlatform(e.target.value as any)}
                    className="w-full px-2 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="YouTube">YouTube</option>
                    <option value="Twitch">Twitch</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Personalizada">Personalizada</option>
                  </select>
                </div>
              </div>

              {/* Custom Platform Input */}
              {livePlatform === 'Personalizada' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Nome da Plataforma Personalizada</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ex: Instagram, Kick, Trovo"
                    value={livePlatformCustom}
                    onChange={(e) => setLivePlatformCustom(e.target.value)}
                    className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                  />
                </div>
              )}

              {/* Date, Time & Duration */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Data de Início</label>
                  <input 
                    type="date" 
                    required
                    value={liveDate}
                    onChange={(e) => setLiveDate(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Horário de Início</label>
                  <input 
                    type="time" 
                    required
                    value={liveStartTime}
                    onChange={(e) => setLiveStartTime(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Duração (minutos)</label>
                  <input 
                    type="number" 
                    min="15"
                    max="600"
                    required
                    value={liveDuration}
                    onChange={(e) => setLiveDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              {/* Priority and Repetition */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Prioridade</label>
                  <select
                    value={livePriority}
                    onChange={(e) => setLivePriority(e.target.value as TaskPriority)}
                    className="w-full px-2 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-md3-secondary">Repetição / Recorrência</label>
                  <select
                    value={liveRecurrenceType}
                    onChange={(e) => setLiveRecurrenceType(e.target.value as any)}
                    className="w-full px-2 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="nao">Não repetir</option>
                    <option value="diaria">Todos os dias</option>
                    <option value="segunda_sexta">Segunda a sexta</option>
                    <option value="semanal">Toda semana</option>
                    <option value="mensal">Todo mês</option>
                    <option value="personalizado">Personalizado</option>
                  </select>
                </div>
              </div>

              {/* Weekday checkboxes for Custom/Personalizado recurrence */}
              {liveRecurrenceType === 'personalizado' && (
                <div className="bg-md3-surface-variant/30 border border-md3-surface-variant p-3.5 rounded-2xl space-y-2">
                  <label className="text-xs font-semibold text-md3-secondary block">Selecione os dias da semana:</label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[
                      { id: 1, label: 'Seg' },
                      { id: 2, label: 'Ter' },
                      { id: 3, label: 'Qua' },
                      { id: 4, label: 'Qui' },
                      { id: 5, label: 'Sex' },
                      { id: 6, label: 'Sáb' },
                      { id: 0, label: 'Dom' }
                    ].map(day => (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleToggleRecurrenceDay(day.id)}
                        className={`py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          liveRecurrenceDays.includes(day.id)
                            ? 'bg-purple-500 text-white font-bold shadow-sm'
                            : 'bg-md3-surface border border-md3-surface-variant/60 text-md3-secondary hover:text-white'
                        }`}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Descrição (opcional)</label>
                <textarea 
                  rows={2}
                  placeholder="Escreva links ou anotações extras sobre o conteúdo ou cronograma da live..."
                  value={liveNotes}
                  onChange={(e) => setLiveNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white placeholder-md3-outline font-sans"
                />
              </div>

              <div className="pt-4 border-t border-md3-surface-variant flex gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowLiveModal(false);
                    setEditingLive(null);
                    resetLiveForm();
                  }}
                  className="flex-1 py-2.5 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-purple-900/10"
                >
                  {editingLive ? 'Salvar Alterações' : 'Confirmar Live'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 5: Delete Live Series Confirmation */}
      {deleteConfirmLive && (
        <div id="modal-delete-live-series" className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-red-500/15 text-red-400 rounded-full flex items-center justify-center animate-pulse">
                <Trash2 className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">Cancelar Transmissão</h3>
                <p className="text-xs text-md3-outline leading-relaxed">
                  A live <strong className="text-white">"{deleteConfirmLive.name}"</strong> faz parte de uma série recorrente. Como você deseja excluí-la?
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTask(deleteConfirmLive.id);
                    setDeleteConfirmLive(null);
                  }}
                  className="w-full py-2.5 bg-md3-surface-variant hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition-all border border-md3-surface-variant cursor-pointer"
                >
                  Excluir apenas esta ocorrência
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (onDeleteTaskSeries && deleteConfirmLive.liveSeriesId && deleteConfirmLive.scheduledDate) {
                      onDeleteTaskSeries(deleteConfirmLive.liveSeriesId, deleteConfirmLive.scheduledDate);
                    } else {
                      onDeleteTask(deleteConfirmLive.id);
                    }
                    setDeleteConfirmLive(null);
                  }}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Excluir toda a série (esta e futuras)
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmLive(null)}
                  className="w-full py-2 bg-transparent text-md3-outline hover:text-white text-xs font-semibold cursor-pointer"
                >
                  Voltar / Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
    );
  }
