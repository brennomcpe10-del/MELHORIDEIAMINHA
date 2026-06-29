/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TaskCategory = 'escola' | 'trabalho' | 'conteudo' | 'pessoal' | 'estudos';

export type TaskPriority = 'baixa' | 'media' | 'alta';

export type TaskDifficulty = 'facil' | 'media' | 'dificil';

export type TaskRecurrence = 'nao' | 'diaria' | 'semanal';

export interface Task {
  id: string;
  name: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedMinutes: number;
  dueDate: string; // YYYY-MM-DD
  recurrence: TaskRecurrence;
  difficulty: TaskDifficulty;
  xp: number;
  notes: string;
  completed: boolean;
  completedAt?: string;
  scheduledDate?: string; // YYYY-MM-DD (alocado na agenda)
  scheduledTime?: string; // HH:MM (horário planejado)
  subjectId?: string; // Se vinculado a uma matéria
  originSource?: 'manual' | 'escola_atividade' | 'conteudo_video' | 'estudos_modelo';
  videoId?: string; // Se vinculado a um vídeo
  templateId?: string; // Se vinculado a um modelo de estudo
}

export interface SchoolSubject {
  id: string;
  name: string;
  color: string; // Tailwind bg- class or Hex
}

export interface SchoolSchedule {
  segunda: string[]; // List of subject IDs
  terca: string[];
  quarta: string[];
  quinta: string[];
  sexta: string[];
  sabado: string[];
  domingo: string[];
}

export interface ContentVideo {
  id: string;
  title: string;
  platform: 'YouTube' | 'TikTok' | 'Instagram';
  recordMinutes: number;
  editMinutes: number;
  hasThumbnail: boolean;
  hasDescription: boolean;
  createdAt: string;
}

export type StudyTemplateType = 'simulado' | 'leitura' | 'curso' | 'revisao' | 'flashcards' | 'redacao';

export interface StudyTemplate {
  id: string;
  title: string;
  type: StudyTemplateType;
  estimatedMinutes: number;
  dueDate: string; // YYYY-MM-DD
}

export interface Reward {
  id: string;
  name: string;
  type: 'One Piece' | 'Minecraft' | 'TikTok' | 'YouTube' | 'Instagram' | 'Outro';
  unlockConditionType: 'prioritarias' | 'xp' | 'todas_do_dia';
  unlockConditionValue: number; // e.g., 2 (tasks), 50 (xp), 1 (todas do dia)
  unlocked: boolean;
  notes?: string;
}

export interface UserStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
  productiveMinutesToday: number;
  completedTasksCount: number;
  totalXpGained: number;
}

export interface UserPreferences {
  freeHoursPerDay: number; // Horas livres padrão (ex: 4)
  dailyLimitMinutes: number; // Limite de estudo/trabalho por dia (ex: 240)
  restDays: number[]; // Dias de descanso (0 = domingo, 6 = sabado)
  schoolHoursStart: string; // HH:MM (ex: "07:00")
  schoolHoursEnd: string; // HH:MM (ex: "12:00")
  workHoursStart: string; // HH:MM (ex: "13:00")
  workHoursEnd: string; // HH:MM (ex: "18:00")
  customFreeTimes: {
    segunda: number;
    terca: number;
    quarta: number;
    quinta: number;
    sexta: number;
    sabado: number;
    domingo: number;
  };
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name
  unlocked: boolean;
  unlockedAt?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}
