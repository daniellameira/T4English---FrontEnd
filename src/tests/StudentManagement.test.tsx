import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { StudentManagement } from '../pages/StudentManagement';
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

const mockLevels = [
  {
    id: 'lvl-basic',
    name: 'Básico',
    subLevels: [
      { id: 'sub-first-step', name: 'First Step' },
      { id: 'sub-next-step', name: 'Next Step' },
    ],
  },
];

const baseStudents = [
  {
    id: 'stu-1',
    name: 'Larissa Almeida',
    email: 'larissa@t4english.com',
    isActive: true,
    subLevelId: 'sub-first-step',
    subLevelName: 'Básico - First Step',
  },
  {
    id: 'stu-2',
    name: 'João Pedro',
    email: 'joao@t4english.com',
    isActive: true,
    subLevelId: null,
    subLevelName: null,
  },
  {
    id: 'stu-3',
    name: 'Rafael Costa',
    email: 'rafael@t4english.com',
    isActive: false,
    subLevelId: 'sub-next-step',
    subLevelName: 'Básico - Next Step',
  },
];

const baseFeedbacks = [
  { studentId: 'stu-1', catalogLessonId: 'first-step-01', createdAt: new Date().toISOString() },
  { studentId: 'stu-1', catalogLessonId: 'first-step-02', createdAt: new Date().toISOString() },
];

const mockAssignments = [
  {
    id: 'assign-past-1',
    title: 'Homework — Verb To Be',
    dueDate: '2026-01-10T23:59:59Z',
  },
];

const mockSubmissionsByAssignment: Record<string, unknown[]> = {
  'assign-past-1': [
    {
      studentId: 'stu-1',
      submittedAt: '2026-01-09T14:00:00Z',
      grade: 9.0,
    },
  ],
};

describe('Página StudentManagement (Gestão Completa e Assiduidade Automática)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const setupDefaultApi = (studentsList = [...baseStudents]) => {
    (api.get as any).mockImplementation((url: string) => {
      if (url === '/Student') return Promise.resolve({ data: studentsList });
      if (url === '/Level') return Promise.resolve({ data: mockLevels });
      if (url === '/Lesson/catalog/feedbacks') return Promise.resolve({ data: baseFeedbacks });
      if (url === '/Assignment') return Promise.resolve({ data: mockAssignments });
      if (url === '/Assignment/assign-past-1/submissions') {
        return Promise.resolve({ data: mockSubmissionsByAssignment['assign-past-1'] });
      }
      return Promise.resolve({ data: [] });
    });
  };

  const renderStudentManagement = () => {
    return render(
      <MemoryRouter>
        <StudentManagement />
      </MemoryRouter>
    );
  };

  it('deve calcular assiduidade automaticamente cruzando aulas e tarefas e abrir detalhamento ao clicar', async () => {
    setupDefaultApi();

    renderStudentManagement();

    await waitFor(() => {
      expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
      expect(screen.getByText('João Pedro')).toBeInTheDocument();
      expect(screen.getByText('Rafael Costa')).toBeInTheDocument();
    });

    const avgCard = screen.getByText('ASSIDUIDADE MÉDIA').parentElement!;
    expect(within(avgCard).getByText('65%')).toBeInTheDocument();

    const larissaRow = screen.getByText('Larissa Almeida').closest('tr')!;
    const joaoRow = screen.getByText('João Pedro').closest('tr')!;

    expect(within(larissaRow).getByText('98%')).toBeInTheDocument();
    expect(within(joaoRow).getByText('32%')).toBeInTheDocument();

    fireEvent.click(within(larissaRow).getByRole('button', { name: /98%/i }));

    expect(screen.getByText('Assiduidade — Larissa Almeida')).toBeInTheDocument();
    expect(screen.getByText('1 de 1 entregues')).toBeInTheDocument();
    expect(screen.getByText('Média das correções: 9/10')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Fechar Detalhes' }));
    expect(screen.queryByText('Assiduidade — Larissa Almeida')).not.toBeInTheDocument();
  });

  it('deve filtrar alunos por status, nível e busca por e-mail', async () => {
    setupDefaultApi();

    renderStudentManagement();

    await waitFor(() => {
      expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
    });

    const statusSelect = screen.getByLabelText(/Filtrar alunos por status/i);
    fireEvent.change(statusSelect, { target: { value: 'inactive' } });

    expect(screen.getByText('Rafael Costa')).toBeInTheDocument();
    expect(screen.queryByText('Larissa Almeida')).not.toBeInTheDocument();

    fireEvent.change(statusSelect, { target: { value: 'all' } });
    const levelSelect = screen.getByLabelText(/Filtrar alunos por nível/i);
    fireEvent.change(levelSelect, { target: { value: 'none' } });

    expect(screen.getByText('João Pedro')).toBeInTheDocument();
    expect(screen.queryByText('Larissa Almeida')).not.toBeInTheDocument();

    fireEvent.change(levelSelect, { target: { value: 'all' } });
    const searchInput = screen.getByPlaceholderText(/Buscar nome ou e-mail/i);
    fireEvent.change(searchInput, { target: { value: 'larissa@' } });

    expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
    expect(screen.queryByText('João Pedro')).not.toBeInTheDocument();
  });

  it('CREATE: deve cadastrar novo aluno sem exigir nível selecionado (Trilha Padrão)', async () => {
    let currentStudents = [...baseStudents];
    setupDefaultApi(currentStudents);

    (api.post as any).mockImplementation((url: string, payload: any) => {
      if (url === '/Student') {
        currentStudents = [
          ...currentStudents,
          {
            id: 'stu-4',
            name: payload.name,
            email: payload.email,
            isActive: true,
            subLevelId: payload.subLevelId,
            subLevelName: null,
          },
        ];
        setupDefaultApi(currentStudents);
      }
      return Promise.resolve({ data: { id: 'stu-4' } });
    });

    renderStudentManagement();

    await waitFor(() => {
      expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /Novo Aluno/i }));

    fireEvent.change(screen.getByLabelText(/Nome Completo/i), {
      target: { value: 'Camila Rocha' },
    });
    fireEvent.change(screen.getByLabelText(/E-mail de Acesso/i), {
      target: { value: 'camila@t4english.com' },
    });
    fireEvent.change(screen.getByLabelText(/Senha Provisória/i), {
      target: { value: 'Senha@123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Cadastrar Aluno/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/Student', {
        name: 'Camila Rocha',
        email: 'camila@t4english.com',
        initialPassword: 'Senha@123',
        subLevelId: null,
      });
      expect(screen.getByText('Aluno cadastrado com sucesso!')).toBeInTheDocument();
      expect(screen.getByText('Camila Rocha')).toBeInTheDocument();
    });
  });

  it('UPDATE (Cadeado de Proteção): deve abrir nome, e-mail e senha bloqueados e permitir destravar para edição', async () => {
    setupDefaultApi();
    (api.put as any).mockResolvedValue({ data: {} });

    renderStudentManagement();

    await waitFor(() => {
      expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTitle('Editar Aluno')[0]);

    const nameInput = screen.getByLabelText(/Nome Completo/i);
    const emailInput = screen.getByLabelText(/E-mail de Acesso/i);
    const passwordInput = screen.getByLabelText(/Nova Senha \(opcional\)/i);
    const levelSelect = screen.getByLabelText(/Nível Liberado \(Opcional\)/i);

    expect(nameInput).toBeDisabled();
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(levelSelect).not.toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Destravar' }));

    fireEvent.change(nameInput, { target: { value: 'Larissa Almeida Silva' } });
    fireEvent.change(levelSelect, { target: { value: 'sub-next-step' } });
    fireEvent.change(passwordInput, { target: { value: 'NovaSenha@2026' } });

    fireEvent.click(screen.getByRole('button', { name: /Salvar Alterações/i }));

    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/Student/stu-1', {
        name: 'Larissa Almeida Silva',
        email: 'larissa@t4english.com',
        subLevelId: 'sub-next-step',
        isActive: true,
        newPassword: 'NovaSenha@2026',
        initialPassword: 'NovaSenha@2026',
      });
      expect(screen.getByText('Dados do aluno atualizados com sucesso!')).toBeInTheDocument();
    });
  });

  it('STATUS (Soft Delete): deve confirmar e desabilitar aluno ativo mantendo histórico, e permitir reativar depois', async () => {
    setupDefaultApi();
    (api.patch as any).mockResolvedValue({ data: {} });

    renderStudentManagement();

    await waitFor(() => {
      expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByTitle('Desabilitar Acesso do Aluno')[0]);
    fireEvent.click(screen.getByRole('button', { name: 'Sim, Desabilitar' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/Student/stu-1/status', { isActive: false });
      expect(
        screen.getByText(
          'Acesso de "Larissa Almeida" desabilitado. O histórico de aulas foi mantido.'
        )
      ).toBeInTheDocument();
    });

    const larissaRow = screen.getByText('Larissa Almeida').closest('tr')!;
    fireEvent.click(within(larissaRow).getByTitle('Reativar Acesso do Aluno'));
    fireEvent.click(screen.getByRole('button', { name: 'Sim, Reativar' }));

    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith('/Student/stu-1/status', { isActive: true });
      expect(
        screen.getByText('Acesso de "Larissa Almeida" reativado com sucesso!')
      ).toBeInTheDocument();
    });
  });
});