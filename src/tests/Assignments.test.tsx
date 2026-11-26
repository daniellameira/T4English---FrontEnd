import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Assignments } from '../pages/Assignments';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

const baseProfessorAssignments = [
  {
    id: 'assign-1',
    title: 'Homework — Verb To Be',
    description: 'Escreva 5 frases afirmativas usando I am, You are e He/She is.',
    dueDate: '2026-12-10T23:59:59Z',
    catalogLessonId: 'first-step-01',
    lessonId: null,
    submissionsCount: 1,
    pendingGradingCount: 1,
  },
  {
    id: 'assign-2',
    title: 'Prática de Saudações',
    description: 'Monte um pequeno diálogo de apresentação pessoal.',
    dueDate: '2026-12-15T23:59:59Z',
    catalogLessonId: 'first-step-02',
    lessonId: null,
    submissionsCount: 0,
    pendingGradingCount: 0,
  },
];

describe('Página Assignments (CRUD Completo e Sistema de Avaliação)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderAssignments = () => {
    return render(
      <MemoryRouter>
        <Assignments />
      </MemoryRouter>
    );
  };

  describe('CRUD Completo de Tarefas (Visão do Professor)', () => {
    beforeEach(() => {
      (useAuth as any).mockReturnValue({
        user: { id: 'prof-1', name: 'Professor Daniel', role: 'PROFESSOR' },
      });
    });

    it('READ: deve listar as tarefas cadastradas e filtrar por texto ou aula vinculada', async () => {
      (api.get as any).mockResolvedValue({ data: baseProfessorAssignments });

      renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Homework — Verb To Be')).toBeInTheDocument();
        expect(screen.getByText('Prática de Saudações')).toBeInTheDocument();
      });

      // Filtro por texto
      const searchInput = screen.getByPlaceholderText(/Buscar tarefa por título ou instrução/i);
      fireEvent.change(searchInput, { target: { value: 'Saudações' } });

      expect(screen.getByText('Prática de Saudações')).toBeInTheDocument();
      expect(screen.queryByText('Homework — Verb To Be')).not.toBeInTheDocument();

      // Limpa busca e filtra por aula do catálogo
      fireEvent.change(searchInput, { target: { value: '' } });
      const lessonSelect = screen.getByLabelText(/Filtrar tarefas por aula/i);
      fireEvent.change(lessonSelect, { target: { value: 'first-step-01' } });

      expect(screen.getByText('Homework — Verb To Be')).toBeInTheDocument();
      expect(screen.queryByText('Prática de Saudações')).not.toBeInTheDocument();
    });

    it('CREATE: deve criar uma nova tarefa vinculada a uma lição do catálogo', async () => {
      let currentList = [...baseProfessorAssignments];

      (api.get as any).mockImplementation((url: string) => {
        if (url === '/Assignment') {
          return Promise.resolve({ data: currentList });
        }
        return Promise.resolve({ data: [] });
      });

      (api.post as any).mockImplementation((url: string, payload: any) => {
        if (url === '/Assignment') {
          currentList = [
            ...currentList,
            {
              id: 'assign-3',
              title: payload.title,
              description: payload.description,
              dueDate: payload.dueDate,
              catalogLessonId: payload.catalogLessonId,
              lessonId: null,
              submissionsCount: 0,
              pendingGradingCount: 0,
            },
          ];
          return Promise.resolve({ data: { id: 'assign-3' } });
        }
        return Promise.resolve({ data: {} });
      });

      const { container } = renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Homework — Verb To Be')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Nova Tarefa/i }));

      const titleInput = screen.getByPlaceholderText(/Ex: Homework — Verb To Be/i);
      const descInput = screen.getByPlaceholderText(/Descreva o exercício/i);
      const dateInput = container.querySelector('input[type="date"]') as HTMLInputElement;

      fireEvent.change(titleInput, { target: { value: 'Articles A / An' } });
      fireEvent.change(descInput, { target: { value: 'Complete a lista com A ou An.' } });
      fireEvent.change(dateInput, { target: { value: '2026-12-20' } });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Tarefa/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/Assignment', {
          title: 'Articles A / An',
          description: 'Complete a lista com A ou An.',
          dueDate: expect.any(String),
          catalogLessonId: 'first-step-sumario',
          lessonId: null,
        });
        expect(screen.getByText('Nova tarefa publicada com sucesso!')).toBeInTheDocument();
        expect(screen.getByText('Articles A / An')).toBeInTheDocument();
      });
    });

    it('UPDATE: deve editar uma tarefa existente e atualizar os dados na tela', async () => {
      let currentList = [...baseProfessorAssignments];

      (api.get as any).mockImplementation(() => Promise.resolve({ data: currentList }));
      (api.put as any).mockImplementation((url: string, payload: any) => {
        if (url === '/Assignment/assign-1') {
          currentList = currentList.map((item) =>
            item.id === 'assign-1'
              ? { ...item, title: payload.title, description: payload.description }
              : item
          );
        }
        return Promise.resolve({ data: {} });
      });

      renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Homework — Verb To Be')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByTitle('Editar Tarefa');
      fireEvent.click(editButtons[0]);

      expect(screen.getByRole('heading', { name: 'Editar Tarefa' })).toBeInTheDocument();

      const titleInput = screen.getByDisplayValue('Homework — Verb To Be');
      fireEvent.change(titleInput, {
        target: { value: 'Homework — Verb To Be (Revisado)' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Salvar Tarefa/i }));

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith(
          '/Assignment/assign-1',
          expect.objectContaining({
            title: 'Homework — Verb To Be (Revisado)',
            catalogLessonId: 'first-step-01',
          })
        );
        expect(screen.getByText('Tarefa atualizada com sucesso!')).toBeInTheDocument();
        expect(screen.getByText('Homework — Verb To Be (Revisado)')).toBeInTheDocument();
      });
    });

    it('DELETE: deve excluir a tarefa após confirmação do professor', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      (api.get as any).mockResolvedValue({ data: baseProfessorAssignments });
      (api.delete as any).mockResolvedValue({ data: {} });

      renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Homework — Verb To Be')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByTitle('Excluir Tarefa');
      fireEvent.click(deleteButtons[0]);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/Assignment/assign-1');
        expect(screen.getByText('Tarefa excluída com sucesso.')).toBeInTheDocument();
        expect(screen.queryByText('Homework — Verb To Be')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sistema de Entrega e Avaliação (Fluxo Aluno <-> Professor)', () => {
    it('ALUNO (Envio): deve validar resposta vazia e enviar resposta escrita com sucesso', async () => {
      (useAuth as any).mockReturnValue({
        user: { id: 'student-1', name: 'Larissa Almeida', role: 'STUDENT' },
      });

      let studentAssignments = [
        {
          id: 'assign-1',
          title: 'Homework — Verb To Be',
          description: 'Escreva 3 frases usando o verbo To Be.',
          dueDate: '2026-12-10T23:59:59Z',
          catalogLessonId: 'first-step-01',
          lessonId: null,
          submissionId: null,
          status: 'Pending',
          answerText: null,
          attachmentFileName: null,
          submittedAt: null,
          grade: null,
          professorFeedback: null,
        },
      ];

      (api.get as any).mockImplementation(() => Promise.resolve({ data: studentAssignments }));
      (api.post as any).mockImplementation((url: string) => {
        if (url === '/Assignment/assign-1/submit') {
          studentAssignments = [
            {
              ...studentAssignments[0],
              submissionId: 'sub-101',
              status: 'Submitted',
              answerText: 'I am a student. She is my teacher. We are ready!',
              submittedAt: '2026-11-26T16:00:00Z',
            },
          ];
        }
        return Promise.resolve({ data: {} });
      });

      renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Pendentes (1)')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Responder Tarefa/i }));

      // Tenta enviar em branco -> deve bloquear e exibir alerta
      fireEvent.click(screen.getByRole('button', { name: /Enviar Tarefa/i }));
      expect(screen.getByRole('alert')).toHaveTextContent(
        /Escreva uma resposta ou anexe um arquivo PDF\/Foto antes de enviar/i
      );
      expect(api.post).not.toHaveBeenCalled();

      // Preenche resposta escrita e envia
      const answerField = screen.getByLabelText(/Sua resposta ou link de apoio/i);
      fireEvent.change(answerField, {
        target: { value: 'I am a student. She is my teacher. We are ready!' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Enviar Tarefa/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledTimes(1);
        const [calledUrl, sentFormData] = (api.post as any).mock.calls[0];
        expect(calledUrl).toBe('/Assignment/assign-1/submit');
        expect(sentFormData).toBeInstanceOf(FormData);
        expect((sentFormData as FormData).get('answerText')).toBe(
          'I am a student. She is my teacher. We are ready!'
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Tarefa enviada com sucesso!')).toBeInTheDocument();
        expect(screen.getByText('Aguardando Correção')).toBeInTheDocument();
        expect(screen.getByText('Entregues (1)')).toBeInTheDocument();
      });
    });

    it('PROFESSOR (Correção): deve validar faixa da nota (0-10) e salvar nota com comentário', async () => {
      (useAuth as any).mockReturnValue({
        user: { id: 'prof-1', name: 'Professor Daniel', role: 'PROFESSOR' },
      });

      (api.get as any).mockImplementation((url: string) => {
        if (url === '/Assignment') {
          return Promise.resolve({ data: baseProfessorAssignments });
        }
        if (url === '/Assignment/assign-1/submissions') {
          return Promise.resolve({
            data: [
              {
                id: 'sub-101',
                studentId: 'student-1',
                studentName: 'Larissa Almeida',
                studentEmail: 'larissa@t4english.com',
                answerText: 'I am a student. She is my teacher. We are ready!',
                attachmentFileName: null,
                submittedAt: '2026-11-26T16:00:00Z',
                grade: null,
                professorFeedback: null,
              },
            ],
          });
        }
        return Promise.resolve({ data: [] });
      });

      (api.post as any).mockResolvedValue({ data: {} });

      renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Homework — Verb To Be')).toBeInTheDocument();
      });

      // Abre o modal de entregas da primeira tarefa
      fireEvent.click(screen.getByRole('button', { name: /Entregas \(1\)/i }));

      await waitFor(() => {
        expect(screen.getByText('Larissa Almeida')).toBeInTheDocument();
        expect(
          screen.getByText('I am a student. She is my teacher. We are ready!')
        ).toBeInTheDocument();
      });

      const gradeInput = screen.getByLabelText(/Nota de Larissa Almeida/i);
      const feedbackInput = screen.getByLabelText(/Comentário para Larissa Almeida/i);
      const saveGradeBtn = screen.getByRole('button', { name: /Salvar Nota/i });

      // Tenta lançar nota fora da escala (12)
      fireEvent.change(gradeInput, { target: { value: '12' } });
      fireEvent.click(saveGradeBtn);

      expect(screen.getByText('Informe uma nota válida entre 0 e 10.')).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();

      // Lança nota válida (9.5) e comentário de feedback
      fireEvent.change(gradeInput, { target: { value: '9.5' } });
      fireEvent.change(feedbackInput, {
        target: { value: 'Excelente construção das frases no afirmativo!' },
      });
      fireEvent.click(saveGradeBtn);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/Assignment/submissions/sub-101/grade', {
          grade: 9.5,
          professorFeedback: 'Excelente construção das frases no afirmativo!',
        });
        expect(screen.getByText('Avaliação salva com sucesso!')).toBeInTheDocument();
        expect(screen.getByText('Avaliada: 9.5/10')).toBeInTheDocument();
      });
    });

    it('ALUNO (Resultado): deve exibir a nota e o feedback do professor na aba Avaliadas', async () => {
      (useAuth as any).mockReturnValue({
        user: { id: 'student-1', name: 'Larissa Almeida', role: 'STUDENT' },
      });

      (api.get as any).mockResolvedValue({
        data: [
          {
            id: 'assign-1',
            title: 'Homework — Verb To Be',
            description: 'Escreva 3 frases usando o verbo To Be.',
            dueDate: '2026-12-10T23:59:59Z',
            catalogLessonId: 'first-step-01',
            lessonId: null,
            submissionId: 'sub-101',
            status: 'Graded',
            answerText: 'I am a student. She is my teacher. We are ready!',
            attachmentFileName: null,
            submittedAt: '2026-11-26T16:00:00Z',
            grade: 9.5,
            professorFeedback: 'Excelente construção das frases no afirmativo!',
          },
        ],
      });

      renderAssignments();

      await waitFor(() => {
        expect(screen.getByText('Avaliadas (1)')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole('button', { name: /Avaliadas \(1\)/i }));

      expect(screen.getByText('Nota: 9.5/10')).toBeInTheDocument();
      expect(
        screen.getByText(/Excelente construção das frases no afirmativo!/i)
      ).toBeInTheDocument();
    });
  });
});