export interface StudentLessonActivity {
  catalogLessonId: string;
  completedAt?: string | null;
}

export interface StudentAssignmentActivity {
  assignmentId: string;
  dueDate?: string | null;
  isSubmitted: boolean;
  grade?: number | null;
}

export interface EngagementBreakdown {
  score: number;
  statusLabel: 'Excelente' | 'Atenção' | 'Em Risco' | 'Recém-matriculado';
  completedLessonsCount: number;
  totalCatalogLessons: number;
  daysSinceLastLesson: number | null;
  submittedTasksCount: number;
  relevantTasksCount: number;
  overduePendingTasksCount: number;
  averageGrade: number | null;
  tasksComponentScore: number;
  lessonsComponentScore: number;
  gradesComponentScore: number;
}

export function calculateStudentEngagement(params: {
  lessons: StudentLessonActivity[];
  assignments: StudentAssignmentActivity[];
  totalCatalogLessons?: number;
  now?: Date;
}): EngagementBreakdown {
  const {
    lessons,
    assignments,
    totalCatalogLessons = 47,
    now = new Date(),
  } = params;

  const nowMs = now.getTime();

  // 1. Pilar Tarefas (50%): considera tarefas já entregues ou com prazo vencido
  const relevantTasks = assignments.filter((task) => {
    if (task.isSubmitted) return true;
    if (!task.dueDate) return false;
    const dueMs = new Date(task.dueDate).getTime();
    return !Number.isNaN(dueMs) && dueMs <= nowMs;
  });

  const submittedTasksCount = relevantTasks.filter((t) => t.isSubmitted).length;
  const overduePendingTasksCount = relevantTasks.filter((t) => !t.isSubmitted).length;

  const tasksComponentScore =
    relevantTasks.length > 0
      ? Math.round((submittedTasksCount / relevantTasks.length) * 100)
      : 100;

  // 2. Pilar Constância nas Aulas (30%)
  const completedLessonsCount = lessons.length;
  let daysSinceLastLesson: number | null = null;

  const validTimestamps = lessons
    .map((l) => (l.completedAt ? new Date(l.completedAt).getTime() : NaN))
    .filter((ms) => !Number.isNaN(ms));

  if (validTimestamps.length > 0) {
    const latestMs = Math.max(...validTimestamps);
    daysSinceLastLesson = Math.max(
      0,
      Math.floor((nowMs - latestMs) / (1000 * 60 * 60 * 24))
    );
  }

  let lessonsComponentScore = 100;
  if (completedLessonsCount === 0) {
    // Aluno novo sem tarefas atrasadas não é penalizado; se já tem atraso, sinaliza baixa atividade
    lessonsComponentScore = overduePendingTasksCount > 0 ? 40 : 100;
  } else if (daysSinceLastLesson !== null) {
    if (daysSinceLastLesson <= 7) lessonsComponentScore = 100;
    else if (daysSinceLastLesson <= 14) lessonsComponentScore = 80;
    else if (daysSinceLastLesson <= 21) lessonsComponentScore = 55;
    else lessonsComponentScore = 30;
  }

  // 3. Pilar Aproveitamento / Notas (20%)
  const gradedTasks = assignments.filter(
    (t) => typeof t.grade === 'number' && !Number.isNaN(t.grade)
  );

  const averageGrade =
    gradedTasks.length > 0
      ? Number(
          (
            gradedTasks.reduce((sum, t) => sum + (t.grade ?? 0), 0) /
            gradedTasks.length
          ).toFixed(1)
        )
      : null;

  const gradesComponentScore =
    averageGrade !== null ? Math.min(100, Math.max(0, Math.round(averageGrade * 10))) : 100;

  // Cálculo ponderado final
  const weightedScore = Math.round(
    tasksComponentScore * 0.5 +
      lessonsComponentScore * 0.3 +
      gradesComponentScore * 0.2
  );

  const isBrandNew =
    completedLessonsCount === 0 &&
    relevantTasks.length === 0 &&
    gradedTasks.length === 0;

  let statusLabel: EngagementBreakdown['statusLabel'] = 'Excelente';
  if (isBrandNew) {
    statusLabel = 'Recém-matriculado';
  } else if (weightedScore < 60) {
    statusLabel = 'Em Risco';
  } else if (weightedScore < 80) {
    statusLabel = 'Atenção';
  }

  return {
    score: weightedScore,
    statusLabel,
    completedLessonsCount,
    totalCatalogLessons,
    daysSinceLastLesson,
    submittedTasksCount,
    relevantTasksCount: relevantTasks.length,
    overduePendingTasksCount,
    averageGrade,
    tasksComponentScore,
    lessonsComponentScore,
    gradesComponentScore,
  };
}