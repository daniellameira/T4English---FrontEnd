import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LessonViewer } from '../pages/LessonViewer';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock('../data/courseCatalog', () => {
  const mockCatalog = [
    {
      id: 'first-step-sumario',
      title: 'Sumário — First Step',
      theme: 'Visão Geral do Módulo 1',
      category: 'Módulo 1: Básico',
      embedUrl: 'https://example.com/sumario',
      order: 1,
      isSequential: true,
    },
    {
      id: 'first-step-01',
      title: 'First Step Lesson 01#',
      theme: 'Introdução e Alfabeto',
      category: 'Módulo 1: Básico',
      embedUrl: 'https://example.com/lesson-01',
      order: 2,
      isSequential: true,
    },
    {
      id: 'first-step-02',
      title: 'First Step Lesson 02#',
      theme: 'Verbo To Be e Cumprimentos',
      category: 'Módulo 1: Básico',
      embedUrl: 'https://example.com/lesson-02',
      order: 3,
      isSequential: true,
    },
    {
      id: 'CELPIP Canada - Writing',
      title: 'CELPIP Canada - Writing',
      theme: 'Writing',
      category: 'E-books',
      embedUrl: 'https://example.com/ebook',
      isSequential: false,
    },
  ];

  const getSorted = (category: string) =>
    mockCatalog
      .filter((item) => item.category === category && item.isSequential)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return {
    COURSE_CATALOG: mockCatalog,
    getLessonAccessInfo: (lesson: (typeof mockCatalog)[number], completedIds: string[]) => {
      if (!lesson.isSequential) return { isLocked: false };
      const sorted = getSorted(lesson.category);
      const idx = sorted.findIndex((i) => i.id === lesson.id);
      if (idx <= 0) return { isLocked: false };
      const prev = sorted[idx - 1];
      return {
        isLocked: !completedIds.includes(prev.id),
        prerequisiteTitle: prev.title,
      };
    },
    getNextSequentialLesson: (currentLesson: (typeof mockCatalog)[number]) => {
      if (!currentLesson.isSequential) return null;
      const sorted = getSorted(currentLesson.category);
      const idx = sorted.findIndex((i) => i.id === currentLesson.id);
      return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
    },
  };
});

describe('Página LessonViewer (Sequência, Temporizador e Feedback)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const renderLessonViewer = (initialRoute = '/lesson/first-step-sumario') => {
    return render(
      <MemoryRouter initialEntries={[initialRoute]}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonViewer />} />
          <Route path="/study-materials" element={<div>Biblioteca de Aulas</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  const advanceTimer60Seconds = () => {
    for (let i = 0; i < 60; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
  };

  it('deve redirecionar para a biblioteca ao tentar acessar aula sequencial bloqueada via URL', async () => {
    (api.get as any).mockResolvedValue({ data: [] });

    renderLessonViewer('/lesson/first-step-01');

    await act(async () => {});

    expect(screen.getByText('Biblioteca de Aulas')).toBeInTheDocument();
  });

  it('deve exigir 60s e feedback mínimo de 20 caracteres antes de concluir e liberar Próximo Conteúdo', async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    (api.post as any).mockResolvedValue({ status: 200 });

    renderLessonViewer('/lesson/first-step-sumario');

    await act(async () => {});

    const timerButton = screen.getByRole('button', { name: /Disponível em/i });
    expect(timerButton).toBeDisabled();

    advanceTimer60Seconds();

    const feedbackInput = screen.getByLabelText(/Feedback da Aula/i);
    fireEvent.change(feedbackInput, { target: { value: 'Aula muito boa!' } });

    const pendingFeedbackButton = screen.getByRole('button', { name: /Preencha o feedback/i });
    expect(pendingFeedbackButton).toBeDisabled();

    const validFeedback = 'Excelente introdução ao módulo, explicação bem objetiva!';
    fireEvent.change(feedbackInput, { target: { value: validFeedback } });

    const completeButton = screen.getByRole('button', { name: /Marcar Aula como Concluída/i });
    expect(completeButton).not.toBeDisabled();

    fireEvent.click(completeButton);

    expect(api.post).toHaveBeenCalledWith(
      '/Lesson/catalog/first-step-sumario/complete',
      { feedback: validFeedback }
    );

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByText(/Aula Concluída!/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Próximo Conteúdo/i })).toBeInTheDocument();
    });
  });

  it('deve exibir alerta de erro e não concluir a aula se a API falhar', async () => {
    (api.get as any).mockResolvedValue({ data: [] });
    (api.post as any).mockRejectedValue(new Error('Erro de rede'));

    renderLessonViewer('/lesson/first-step-sumario');

    await act(async () => {});

    advanceTimer60Seconds();

    const feedbackInput = screen.getByLabelText(/Feedback da Aula/i);
    fireEvent.change(feedbackInput, {
      target: { value: 'Feedback válido com mais de vinte caracteres para o teste.' },
    });

    const completeButton = screen.getByRole('button', { name: /Marcar Aula como Concluída/i });
    fireEvent.click(completeButton);

    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/Não foi possível guardar/i);
    });

    expect(screen.queryByText(/Aula Concluída!/i)).not.toBeInTheDocument();
  });
});