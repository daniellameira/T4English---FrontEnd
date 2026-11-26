import { describe, it, expect } from 'vitest';
import { calculateStudentEngagement } from '../utils/studentEngagement';

describe('calculateStudentEngagement (Motor de Assiduidade Automática)', () => {
  const fixedNow = new Date('2026-11-26T12:00:00Z');

  it('deve classificar aluno sem aulas e sem tarefas vencidas como Recém-matriculado com 100%', () => {
    const result = calculateStudentEngagement({
      lessons: [],
      assignments: [
        {
          assignmentId: 'future-task',
          dueDate: '2026-12-15T23:59:59Z',
          isSubmitted: false,
          grade: null,
        },
      ],
      now: fixedNow,
    });

    expect(result.score).toBe(100);
    expect(result.statusLabel).toBe('Recém-matriculado');
    expect(result.relevantTasksCount).toBe(0);
    expect(result.overduePendingTasksCount).toBe(0);
  });

  it('deve calcular pontuação ponderada para aluno engajado com tarefas entregues, aula recente e notas', () => {
    const result = calculateStudentEngagement({
      lessons: [
        { catalogLessonId: 'first-step-01', completedAt: '2026-11-24T10:00:00Z' }, // há 2 dias -> 100%
      ],
      assignments: [
        {
          assignmentId: 'task-1',
          dueDate: '2026-11-20T23:59:59Z',
          isSubmitted: true,
          grade: 9.0,
        },
        {
          assignmentId: 'task-2',
          dueDate: '2026-11-25T23:59:59Z',
          isSubmitted: true,
          grade: 8.0,
        },
      ],
      now: fixedNow,
    });

    // Tarefas: 100% * 0.5 = 50 | Aulas: 100% * 0.3 = 30 | Notas (média 8.5 -> 85%): 85 * 0.2 = 17 => 97%
    expect(result.score).toBe(97);
    expect(result.statusLabel).toBe('Excelente');
    expect(result.averageGrade).toBe(8.5);
    expect(result.daysSinceLastLesson).toBe(2);
  });

  it('deve sinalizar Em Risco quando houver tarefas vencidas não entregues e inatividade nas aulas', () => {
    const result = calculateStudentEngagement({
      lessons: [
        { catalogLessonId: 'first-step-01', completedAt: '2026-10-20T10:00:00Z' }, // há 37 dias -> 30%
      ],
      assignments: [
        {
          assignmentId: 'task-1',
          dueDate: '2026-11-01T23:59:59Z',
          isSubmitted: false,
          grade: null,
        },
        {
          assignmentId: 'task-2',
          dueDate: '2026-11-15T23:59:59Z',
          isSubmitted: false,
          grade: null,
        },
      ],
      now: fixedNow,
    });

    // Tarefas: 0% * 0.5 = 0 | Aulas: 30% * 0.3 = 9 | Notas (neutro): 100% * 0.2 = 20 => 29%
    expect(result.score).toBe(29);
    expect(result.statusLabel).toBe('Em Risco');
    expect(result.overduePendingTasksCount).toBe(2);
  });
});