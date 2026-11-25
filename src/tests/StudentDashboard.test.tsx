import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StudentDashboard } from '../pages/StudentDashboard';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('Página StudentDashboard (Progresso Calibrado e Janela de Foco)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderStudentDashboard = () => {
    return render(
      <MemoryRouter>
        <StudentDashboard />
      </MemoryRouter>
    );
  };

  it('deve calcular o progresso apenas sobre as 47 aulas sequenciais e exibir a janela de foco', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/student') {
        return Promise.resolve({
          data: {
            subLevelId: null,
            subLevelName: 'First Step',
            attendancePercentage: 90,
            lessons: [],
          },
        });
      }

      if (url === '/Lesson/progress/me') {
        // 2 aulas sequenciais concluídas + 1 E-book (que não deve inflar o progresso do módulo)
        return Promise.resolve({
          data: ['first-step-sumario', 'first-step-01', 'CELPIP Canada - Writing'],
        });
      }

      return Promise.resolve({ data: [] });
    });

    renderStudentDashboard();

    // 2 de 47 = 4%
    await waitFor(() => {
      expect(screen.getByText('2 de 47 lições concluídas.')).toBeInTheDocument();
      expect(screen.getByText('4%')).toBeInTheDocument();
    });

    // Atalho "Continuar Estudando" aponta para a Lesson 02
    const nextLessonLink = screen.getByRole('link', { name: /Ir para aula/i });
    expect(nextLessonLink).toHaveAttribute('href', '/lesson/first-step-02');

    // Janela de foco exibe apenas 4 de 47 aulas (Lesson 01, Lesson 02 atual, Lesson 03.0 e 03.1)
    expect(screen.getByText('Exibindo 4 de 47 aulas em foco.')).toBeInTheDocument();
    expect(screen.getByText('Aula Atual')).toBeInTheDocument();
    expect(screen.getByText('First Step Lesson 01')).toBeInTheDocument();
    expect(screen.getByText('First Step Lesson 03.1')).toBeInTheDocument();

    // Aulas fora da janela não poluem o dashboard
    expect(screen.queryByText('First Step Lesson 00 - Summary')).not.toBeInTheDocument();
    expect(screen.queryByText('First Step Lesson 03.2')).not.toBeInTheDocument();

    // Botão de atalho para a trilha completa
    const viewAllLink = screen.getByRole('link', { name: /Ver todas \(47\)/i });
    expect(viewAllLink).toHaveAttribute('href', '/study-materials');
  });
});