import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ProfessorDashboard } from '../pages/ProfessorDashboard';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
  },
}));

const mockProfessorDashboardResponse = {
  totalActiveStudents: 2,
  studentsAtRiskCount: 1,
  pendingGradingCount: 3,
  studentsSummary: [
    {
      studentId: 'student-1',
      name: 'Larissa Almeida',
      email: 'larissa@t4english.com',
      attendancePercentage: 92,
      isAtRisk: false,
      averageGrade: 9.5,
    },
    {
      studentId: 'student-2',
      name: 'Lucas Mendes',
      email: 'lucas@t4english.com',
      attendancePercentage: 68,
      isAtRisk: true,
      averageGrade: 6.8,
    },
  ],
};

const mockCatalogFeedbacksResponse = [
  {
    id: 'fb-1',
    studentId: 'student-1',
    studentName: 'Larissa Almeida',
    studentEmail: 'larissa@t4english.com',
    catalogLessonId: 'first-step-01',
    feedback: 'Gostei bastante dos exemplos com pronomes e verbo to be no afirmativo!',
    completedAt: '2026-11-24T14:30:00Z',
  },
  {
    id: 'fb-2',
    studentId: 'student-1',
    studentName: 'Larissa Almeida',
    studentEmail: 'larissa@t4english.com',
    catalogLessonId: 'first-step-sumario',
    feedback: 'O sumário ajudou muito a entender como o módulo está dividido.',
    completedAt: '2026-11-23T10:15:00Z',
  },
];

describe('Página ProfessorDashboard (Progresso da Turma e Mural de Feedbacks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderProfessorDashboard = () => {
    return render(
      <MemoryRouter>
        <ProfessorDashboard />
      </MemoryRouter>
    );
  };

  it('deve exibir o progresso individual nas 47 aulas, calcular a média da turma e renderizar os feedbacks', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') {
        return Promise.resolve({ data: mockProfessorDashboardResponse });
      }
      if (url === '/Lesson/catalog/feedbacks') {
        return Promise.resolve({ data: mockCatalogFeedbacksResponse });
      }
      return Promise.resolve({ data: [] });
    });

    renderProfessorDashboard();

    await waitFor(() => {
      expect(screen.getByText('Métricas atualizadas com os dados da plataforma.')).toBeInTheDocument();
    });

    // Progresso individual: Larissa (2/47 = 4%) e Lucas (0/47 = 0%) -> média da turma = 2%
    expect(screen.getByText('2/47 aulas')).toBeInTheDocument();
    expect(screen.getByText('4%')).toBeInTheDocument();
    expect(screen.getByText('Atual: First Step Lesson 02')).toBeInTheDocument();

    expect(screen.getByText('0/47 aulas')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
    expect(screen.getByText('Atual: First Step Lesson 00 - Summary')).toBeInTheDocument();

    // Média geral da turma no card de métricas
    expect(screen.getByText('2%')).toBeInTheDocument();

    // Mural de feedbacks com títulos resolvidos do COURSE_CATALOG
    expect(screen.getByText('Feedbacks das Aulas (2)')).toBeInTheDocument();
    expect(screen.getByText('First Step Lesson 01')).toBeInTheDocument();
    expect(screen.getByText('First Step Lesson 00 - Summary')).toBeInTheDocument();
    expect(
      screen.getByText(/"Gostei bastante dos exemplos com pronomes e verbo to be no afirmativo!"/i)
    ).toBeInTheDocument();
  });

  it('deve filtrar os feedbacks por aluno e por termo de busca', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') {
        return Promise.resolve({ data: mockProfessorDashboardResponse });
      }
      if (url === '/Lesson/catalog/feedbacks') {
        return Promise.resolve({ data: mockCatalogFeedbacksResponse });
      }
      return Promise.resolve({ data: [] });
    });

    renderProfessorDashboard();

    await waitFor(() => {
      expect(screen.getByText('Feedbacks das Aulas (2)')).toBeInTheDocument();
    });

    // Filtra por aluno sem feedbacks enviados (Lucas Mendes)
    const studentSelect = screen.getByLabelText(/Filtrar feedbacks por aluno/i);
    fireEvent.change(studentSelect, { target: { value: 'student-2' } });

    expect(screen.getByText('Feedbacks das Aulas (0)')).toBeInTheDocument();
    expect(
      screen.getByText('Nenhum feedback corresponde aos filtros selecionados.')
    ).toBeInTheDocument();

    // Volta para todos os alunos e busca por palavra-chave
    fireEvent.change(studentSelect, { target: { value: 'all' } });
    const searchFeedbackInput = screen.getByPlaceholderText(/Buscar por aula ou comentário/i);
    fireEvent.change(searchFeedbackInput, { target: { value: 'sumário' } });

    expect(screen.getByText('Feedbacks das Aulas (1)')).toBeInTheDocument();
    expect(
      screen.getByText(/"O sumário ajudou muito a entender como o módulo está dividido."/i)
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/"Gostei bastante dos exemplos com pronomes e verbo to be no afirmativo!"/i)
    ).not.toBeInTheDocument();
  });

  it('deve manter a tabela de alunos funcional e exibir alerta se o endpoint de feedbacks falhar', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') {
        return Promise.resolve({ data: mockProfessorDashboardResponse });
      }
      if (url === '/Lesson/catalog/feedbacks') {
        return Promise.reject(new Error('Falha ao buscar feedbacks'));
      }
      return Promise.resolve({ data: [] });
    });

    renderProfessorDashboard();

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Não foi possível carregar os feedbacks das aulas/i
      );
    });

    // Tabela de alunos continua operando e filtrando normalmente
    const searchStudentInput = screen.getByPlaceholderText(/Buscar por nome ou e-mail/i);
    fireEvent.change(searchStudentInput, { target: { value: 'Lucas' } });

    expect(screen.getByRole('cell', { name: 'Lucas Mendes' })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: 'Larissa Almeida' })).not.toBeInTheDocument();
  });
});