import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StudentMaterials } from '../pages/StudentMaterials';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
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

describe('Página StudentMaterials (Biblioteca, Sequência e E-books)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderStudentMaterials = () => {
    return render(
      <MemoryRouter>
        <StudentMaterials />
      </MemoryRouter>
    );
  };

  it('deve liberar o Sumário e os E-books inicialmente, mantendo as aulas seguintes bloqueadas', async () => {
    (api.get as any).mockResolvedValue({ data: [] });

    renderStudentMaterials();

    await waitFor(() => {
      const studyButtons = screen.getAllByRole('button', { name: /Estudar Aula/i });
      expect(studyButtons).toHaveLength(2);
    });

    const lockedButtons = screen.getAllByRole('button', { name: /Aula Bloqueada/i });
    expect(lockedButtons).toHaveLength(2);
    lockedButtons.forEach((btn) => expect(btn).toBeDisabled());
  });

  it('deve desbloquear a Aula 01 e marcar o Sumário como Revisar Aula quando o Sumário estiver concluído', async () => {
    (api.get as any).mockResolvedValue({ data: ['first-step-sumario'] });

    renderStudentMaterials();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Revisar Aula/i })).toBeInTheDocument();
    });

    const studyButtons = screen.getAllByRole('button', { name: /Estudar Aula/i });
    expect(studyButtons).toHaveLength(2);

    const lockedButtons = screen.getAllByRole('button', { name: /Aula Bloqueada/i });
    expect(lockedButtons).toHaveLength(1);
  });

  it('deve filtrar os conteúdos corretamente ao usar a barra de pesquisa', async () => {
    (api.get as any).mockResolvedValue({ data: [] });

    renderStudentMaterials();

    await waitFor(() => {
      expect(screen.getByText('Sumário — First Step')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Pesquisar por título ou tema da aula/i);
    fireEvent.change(searchInput, { target: { value: 'CELPIP' } });

    expect(screen.getByText('CELPIP Canada - Writing')).toBeInTheDocument();
    expect(screen.queryByText('Sumário — First Step')).not.toBeInTheDocument();
  });
});