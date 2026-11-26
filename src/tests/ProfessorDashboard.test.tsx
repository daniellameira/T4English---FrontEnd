import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ProfessorDashboard } from '../pages/ProfessorDashboard';
import { api } from '../api/client';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockDashboardResponse = {
  totalActiveStudents: 2,
  studentsAtRiskCount: 0,
  pendingGradingCount: 3,
  studentsSummary: [
    {
      studentId: 'stu-1',
      name: 'Larissa Almeida',
      email: 'larissa@t4english.com',
      attendancePercentage: 100,
      isAtRisk: false,
      averageGrade: 9.0,
    },
    {
      studentId: 'stu-2',
      name: 'João Pedro',
      email: 'joao@t4english.com',
      attendancePercentage: 100,
      isAtRisk: false,
      averageGrade: null,
    },
  ],
};

const mockFeedbacksResponse = [
  {
    id: 'fb-1',
    studentId: 'stu-1',
    studentName: 'Larissa Almeida',
    studentEmail: 'larissa@t4english.com',
    catalogLessonId: 'first-step-01',
    feedback: 'Achei muito clara a explicação sobre pronúncia.',
    completedAt: new Date().toISOString(),
  },
  {
    id: 'fb-2',
    studentId: 'stu-1',
    studentName: 'Larissa Almeida',
    studentEmail: 'larissa@t4english.com',
    catalogLessonId: 'first-step-02',
    feedback: '',
    completedAt: new Date().toISOString(),
  },
];

const mockAssignmentsResponse = [
  {
    id: 'assign-1',
    title: 'Homework — Greetings',
    dueDate: '2026-01-10T23:59:59Z',
  },
];

const mockSubmissionsResponse = [
  {
    studentId: 'stu-1',
    submittedAt: '2026-01-09T15:00:00Z',
    grade: 9.0,
  },
];

describe('Página ProfessorDashboard (Métricas Reais, Assiduidade Automática e Feedbacks)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <MemoryRouter>
        <ProfessorDashboard />
      </MemoryRouter>
    );
  };

  it('deve calcular assiduidade média e individual automaticamente, abrir diagnóstico e filtrar alunos', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') return Promise.resolve({ data: mockDashboardResponse });
      if (url === '/Lesson/catalog/feedbacks') return Promise.resolve({ data: mockFeedbacksResponse });
      if (url === '/Assignment') return Promise.resolve({ data: mockAssignmentsResponse });
      if (url === '/Assignment/assign-1/submissions') {
        return Promise.resolve({ data: mockSubmissionsResponse });
      }
      return Promise.resolve({ data: [] });
    });

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('Métricas atualizadas com os dados da plataforma.')
      ).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    expect(within(table).getByText('Larissa Almeida')).toBeInTheDocument();
    expect(within(table).getByText('João Pedro')).toBeInTheDocument();

    // Larissa: 98% (Em dia) | João Pedro: 32% (Em risco) | Média da turma: 65%
    const metricsRegion = screen.getByRole('region', { name: 'Métricas da turma' });
    expect(within(metricsRegion).getByText('65%')).toBeInTheDocument();
    expect(
      within(metricsRegion).getByText('1 aluno(s) abaixo da assiduidade recomendada de 75%.')
    ).toBeInTheDocument();
    expect(within(metricsRegion).getByText('2%')).toBeInTheDocument();

    const larissaRow = within(table).getByText('Larissa Almeida').closest('tr')!;
    const joaoRow = within(table).getByText('João Pedro').closest('tr')!;

    expect(within(larissaRow).getByText('98%')).toBeInTheDocument();
    expect(within(larissaRow).getByText('Em dia')).toBeInTheDocument();
    expect(within(joaoRow).getByText('32%')).toBeInTheDocument();
    expect(within(joaoRow).getByText('Em risco')).toBeInTheDocument();

    // Clica na pílula de assiduidade da Larissa para abrir o detalhamento dos 3 pilares
    fireEvent.click(within(larissaRow).getByRole('button', { name: /98%/i }));

    expect(screen.getByText('Assiduidade — Larissa Almeida')).toBeInTheDocument();
    expect(screen.getByText('1 de 1 entregues')).toBeInTheDocument();
    expect(screen.getByText('Média das correções: 9/10')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar Detalhes' }));
    expect(screen.queryByText('Assiduidade — Larissa Almeida')).not.toBeInTheDocument();

    // Filtra tabela de alunos por situação: Atenção / Em risco
    const situationSelect = screen.getByLabelText(/Filtrar alunos por situação/i);
    fireEvent.change(situationSelect, { target: { value: 'needs_attention' } });

    expect(within(table).getByText('João Pedro')).toBeInTheDocument();
    expect(within(table).queryByText('Larissa Almeida')).not.toBeInTheDocument();

    // Limpa filtro de situação e busca por e-mail
    fireEvent.change(situationSelect, { target: { value: 'all' } });
    fireEvent.change(screen.getByPlaceholderText(/Buscar por nome ou e-mail/i), {
      target: { value: 'larissa@' },
    });

    expect(within(table).getByText('Larissa Almeida')).toBeInTheDocument();
    expect(within(table).queryByText('João Pedro')).not.toBeInTheDocument();
  });

  it('deve identificar aluno sem aulas e sem tarefas vencidas como Recém-matriculado', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') {
        return Promise.resolve({
          data: {
            totalActiveStudents: 1,
            studentsAtRiskCount: 0,
            pendingGradingCount: 0,
            studentsSummary: [
              {
                studentId: 'stu-new',
                name: 'Camila Rocha',
                email: 'camila@t4english.com',
                attendancePercentage: 100,
                isAtRisk: false,
                averageGrade: null,
              },
            ],
          },
        });
      }
      if (url === '/Lesson/catalog/feedbacks') return Promise.resolve({ data: [] });
      if (url === '/Assignment') {
        return Promise.resolve({
          data: [{ id: 'assign-future', title: 'Future Task', dueDate: '2099-12-31T23:59:59Z' }],
        });
      }
      if (url === '/Assignment/assign-future/submissions') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText('Métricas atualizadas com os dados da plataforma.')
      ).toBeInTheDocument();
    });

    const table = screen.getByRole('table');
    const camilaRow = within(table).getByText('Camila Rocha').closest('tr')!;
    expect(within(camilaRow).getByText('100%')).toBeInTheDocument();
    expect(within(camilaRow).getByText('Recém-matriculado')).toBeInTheDocument();
  });

  it('deve exibir apenas feedbacks com comentário preenchido e filtrar o mural por texto', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') return Promise.resolve({ data: mockDashboardResponse });
      if (url === '/Lesson/catalog/feedbacks') return Promise.resolve({ data: mockFeedbacksResponse });
      if (url === '/Assignment') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText('Feedbacks das Aulas (1)')).toBeInTheDocument();
      expect(
        screen.getByText('"Achei muito clara a explicação sobre pronúncia."')
      ).toBeInTheDocument();
    });

    const feedbackSearchInput = screen.getByPlaceholderText(/Buscar por aula ou comentário/i);
    fireEvent.change(feedbackSearchInput, { target: { value: 'inexistente' } });

    expect(
      screen.getByText('Nenhum feedback corresponde aos filtros selecionados.')
    ).toBeInTheDocument();
  });

  it('deve exibir aviso de fallback demonstrativo quando o serviço do dashboard falhar', async () => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Dashboard/professor') return Promise.reject(new Error('Network Error'));
      if (url === '/Lesson/catalog/feedbacks') return Promise.reject(new Error('Network Error'));
      if (url === '/Assignment') return Promise.resolve({ data: [] });
      return Promise.resolve({ data: [] });
    });

    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText(
          'Não foi possível carregar os dados reais. Exibindo métricas demonstrativas.'
        )
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Não foi possível carregar os feedbacks das aulas/i)
      ).toBeInTheDocument();
    });
  });
});