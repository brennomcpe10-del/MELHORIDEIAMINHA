/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  Bookmark, 
  Tv, 
  RotateCw, 
  Layers, 
  FileText, 
  Plus, 
  Clock, 
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { Task, StudyTemplateType, SchoolSubject } from '../types';

interface StudyModelsViewProps {
  subjects: SchoolSubject[];
  onAddTasks: (newTasks: Task[]) => void;
}

export default function StudyModelsView({
  subjects,
  onAddTasks
}: StudyModelsViewProps) {
  const [activeModel, setActiveModel] = useState<StudyTemplateType | null>(null);

  // Form inputs
  const [studyTitle, setStudyTitle] = useState('');
  const [studySubjectId, setStudySubjectId] = useState('');
  const [studyDuration, setStudyDuration] = useState('60'); // default 1 hour
  const [studyDueDate, setStudyDueDate] = useState('');

  const studyTemplates = [
    {
      type: 'simulado' as StudyTemplateType,
      title: 'Simulados Inteligentes',
      desc: 'Gera tarefas de simulação de provas sob estresse de tempo, correção de lacunas e fixação ativa.',
      icon: HelpCircle,
      color: 'text-orange-400 border-orange-500/20 bg-orange-500/5',
      estimatedSubtasks: 3
    },
    {
      type: 'leitura' as StudyTemplateType,
      title: 'Leitura Ativa & Fichamento',
      desc: 'Ideal para livros literários, artigos científicos ou capítulos extensos do livro didático.',
      icon: Bookmark,
      color: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
      estimatedSubtasks: 2
    },
    {
      type: 'curso' as StudyTemplateType,
      title: 'Curso Online / Videoaulas',
      desc: 'Gera etapas para assistir aulas, aplicar anotações visuais e consolidar exercícios práticos.',
      icon: Tv,
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      estimatedSubtasks: 3
    },
    {
      type: 'revisao' as StudyTemplateType,
      title: 'Revisão Espaçada',
      desc: 'Relembre matérias estudadas há dias por meio de auto-explicação e checagem de mapas mentais.',
      icon: RotateCw,
      color: 'text-teal-400 border-teal-500/20 bg-teal-500/5',
      estimatedSubtasks: 2
    },
    {
      type: 'flashcards' as StudyTemplateType,
      title: 'Baralho de Flashcards (Anki)',
      desc: 'Divida o estudo em criação de perguntas/respostas (active recall) e rodada prática de memorização.',
      icon: Layers,
      color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/5',
      estimatedSubtasks: 2
    },
    {
      type: 'redacao' as StudyTemplateType,
      title: 'Redação & Escrita Acadêmica',
      desc: 'Roteirize referências de apoio, crie rascunho dissertativo e faça passagens a limpo corretivas.',
      icon: FileText,
      color: 'text-pink-400 border-pink-500/20 bg-pink-500/5',
      estimatedSubtasks: 3
    }
  ];

  const handleGenerateStudyTasks = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studyTitle || !activeModel) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const finalDueDate = studyDueDate || todayStr;
    const durationMins = parseInt(studyDuration) || 60;

    const newTasksList: Task[] = [];
    const idPrefix = `std-${activeModel}-${Date.now()}`;

    // Configura tarefas dependendo do modelo selecionado
    if (activeModel === 'simulado') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Fazer Simulado: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.7),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'dificil',
          xp: 40,
          notes: 'Fazer o simulado de forma focada, simulando tempo de prova real, sem consulta.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-2`,
          name: `Corrigir erros de: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.2),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 25,
          notes: 'Corrigir as questões erradas, entendendo o gabarito e revendo conceitos fracos.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-3`,
          name: `Anotar pontos fracos para revisão: ${studyTitle}`,
          category: 'estudos',
          priority: 'baixa',
          estimatedMinutes: Math.round(durationMins * 0.1),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 15,
          notes: 'Registrar no caderno os tópicos que precisa estudar mais na próxima semana.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        }
      );
    } else if (activeModel === 'leitura') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Leitura ativa dos capítulos de: ${studyTitle}`,
          category: 'estudos',
          priority: 'media',
          estimatedMinutes: Math.round(durationMins * 0.7),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 25,
          notes: 'Fazer a leitura grifando partes mais importantes e fazendo anotações laterais.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-2`,
          name: `Fichamento / Resumo de: ${studyTitle}`,
          category: 'estudos',
          priority: 'baixa',
          estimatedMinutes: Math.round(durationMins * 0.3),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 20,
          notes: 'Compilar os grifos em um arquivo de notas ou fichas físicas.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        }
      );
    } else if (activeModel === 'curso') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Assistir módulos do curso: ${studyTitle}`,
          category: 'estudos',
          priority: 'media',
          estimatedMinutes: Math.round(durationMins * 0.6),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 20,
          notes: 'Assistir às videoaulas anotando termos chaves e fluxogramas.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-2`,
          name: `Resolver exercícios práticos do curso: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.3),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 30,
          notes: 'Resolver as listas práticas de código ou questionários anexos do curso.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-3`,
          name: `Registrar insights e revisões de: ${studyTitle}`,
          category: 'estudos',
          priority: 'baixa',
          estimatedMinutes: Math.round(durationMins * 0.1),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 15,
          notes: 'Fazer um fechamento prático do aprendizado da aula de hoje.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        }
      );
    } else if (activeModel === 'revisao') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Revisar mapas mentais / Notas de: ${studyTitle}`,
          category: 'estudos',
          priority: 'media',
          estimatedMinutes: Math.round(durationMins * 0.4),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 15,
          notes: 'Reler resumos de forma rápida ativando a memória visual.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-2`,
          name: `Fazer auto-explicação ativa: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.6),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 35,
          notes: 'Tente explicar em voz alta para si mesmo a matéria revisada como se estivesse dando aula (Método Feynman).',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        }
      );
    } else if (activeModel === 'flashcards') {
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Criar baralho de flashcards de: ${studyTitle}`,
          category: 'estudos',
          priority: 'media',
          estimatedMinutes: Math.round(durationMins * 0.5),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 25,
          notes: 'Formular perguntas e respostas curtas e objetivas em cards no Anki ou papel.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-2`,
          name: `Revisão prática espaçada dos cards de: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.5),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 30,
          notes: 'Executar rodada de lembrança ativa com as cartas, marcando as dificuldades.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        }
      );
    } else {
      // Redação
      newTasksList.push(
        {
          id: `${idPrefix}-1`,
          name: `Estruturação de repertórios para Redação: ${studyTitle}`,
          category: 'estudos',
          priority: 'media',
          estimatedMinutes: Math.round(durationMins * 0.3),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 20,
          notes: 'Pesquisar alusões históricas, citações e dados estatísticos relevantes ao tema.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-2`,
          name: `Escrever rascunho dissertativo: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.5),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'media',
          xp: 35,
          notes: 'Estruturar introdução, dois parágrafos de desenvolvimento e proposta de intervenção.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        },
        {
          id: `${idPrefix}-3`,
          name: `Passar a limpo e revisar Redação de: ${studyTitle}`,
          category: 'estudos',
          priority: 'alta',
          estimatedMinutes: Math.round(durationMins * 0.2),
          dueDate: finalDueDate,
          recurrence: 'nao',
          difficulty: 'facil',
          xp: 25,
          notes: 'Passar a limpo cuidando da ortografia, conectivos e garantindo uma estética limpa.',
          completed: false,
          subjectId: studySubjectId || undefined,
          originSource: 'estudos_modelo'
        }
      );
    }

    onAddTasks(newTasksList);
    setActiveModel(null);

    // Reset Form states
    setStudyTitle('');
    setStudySubjectId('');
    setStudyDuration('60');
    setStudyDueDate('');
  };

  return (
    <div id="study-models-view" className="space-y-6">
      
      {/* View Header */}
      <div>
        <h2 className="font-display font-bold text-2xl lg:text-3xl text-white">Modelos Inteligentes de Estudo</h2>
        <p className="text-sm text-md3-outline font-sans">
          Estude de forma correta e cientificamente validada. Cada bento modelo gera etapas estruturadas de auto-revisão e fixação ativa.
        </p>
      </div>

      {/* AI Science Tip banner */}
      <div className="bg-gradient-to-r from-md3-surface via-md3-surface to-md3-primary/10 border border-md3-surface-variant p-4.5 rounded-2xl flex items-center gap-3.5">
        <div className="w-9 h-9 bg-md3-primary/10 border border-md3-primary/20 text-md3-primary rounded-xl flex items-center justify-center shrink-0">
          <Sparkles className="w-4.5 h-4.5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-white font-display">Estudo Baseado em Evidências Científicas</h4>
          <p className="text-[11px] text-md3-outline leading-relaxed mt-0.5">
            Modelos como Flashcards e Simulados estimulam a **Recordação Ativa** (Active Recall) e a **Repetição Espaçada** (Spaced Repetition), garantindo taxas de absorção de conteúdo até 3x superiores a leituras passivas repetidas.
          </p>
        </div>
      </div>

      {/* Bento Grid layout representing study models */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {studyTemplates.map((template) => {
          const IconComponent = template.icon;
          
          return (
            <div
              id={`study-model-card-${template.type}`}
              key={template.type}
              className="bg-md3-surface border border-md3-surface-variant rounded-3xl p-5 hover:border-md3-outline/30 transition-all flex flex-col justify-between h-56 group relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${template.color}`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-white">{template.title}</h4>
                  <p className="text-xs text-md3-outline leading-relaxed mt-1">{template.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-md3-surface-variant/30 pt-3 mt-4">
                <span className="text-[10px] font-mono text-md3-outline bg-md3-surface-variant/50 px-2 py-0.5 rounded-md">
                  Gera {template.estimatedSubtasks} etapas
                </span>
                <button
                  id={`activate-model-btn-${template.type}`}
                  onClick={() => setActiveModel(template.type)}
                  className="px-3 py-1.5 bg-md3-surface-variant hover:bg-white hover:text-md3-bg text-white rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aplicar Modelo</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Model Wizard Dialog Modal */}
      {activeModel && (
        <div id="modal-study-wizard" className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-md3-surface border border-md3-surface-variant rounded-3xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-md3-surface-variant flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-md3-primary" />
                <h3 className="font-display font-bold text-lg text-white">
                  Instanciar Modelo: {studyTemplates.find(t => t.type === activeModel)?.title}
                </h3>
              </div>
              <button 
                onClick={() => setActiveModel(null)}
                className="text-md3-outline hover:text-white font-semibold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateStudyTasks} className="p-6 space-y-4">
              
              {/* Study Subject Name / Theme */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">O que você vai estudar? (Assunto/Tópico)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Revolução Industrial ou Funções Afins"
                  value={studyTitle}
                  onChange={(e) => setStudyTitle(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Class association dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Vincular a uma Matéria Escolar (Opcional)</label>
                <select
                  value={studySubjectId}
                  onChange={(e) => setStudySubjectId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none cursor-pointer"
                >
                  <option value="">-- Não vincular (Estudo avulso) --</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Estimated study duration */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Tempo Total Estimado de Foco (Minutos)</label>
                <input 
                  type="number" 
                  min="20"
                  max="480"
                  required
                  value={studyDuration}
                  onChange={(e) => setStudyDuration(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              {/* Target study date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-md3-secondary">Data para Realizar o Estudo</label>
                <input 
                  type="date" 
                  required
                  value={studyDueDate}
                  onChange={(e) => setStudyDueDate(e.target.value)}
                  className="w-full px-3 py-2.5 bg-md3-surface-variant/60 border border-md3-surface-variant rounded-xl text-xs text-white focus:outline-none focus:border-md3-primary"
                />
              </div>

              <div className="pt-4 border-t border-md3-surface-variant flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setActiveModel(null)}
                  className="flex-1 py-2.5 bg-md3-surface-variant hover:bg-md3-outline/20 text-white rounded-xl text-xs font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-md3-primary text-md3-bg rounded-xl text-xs font-bold hover:bg-white transition-all"
                >
                  Gerar Roteiro Científico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
