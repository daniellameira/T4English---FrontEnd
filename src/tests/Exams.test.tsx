import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Exams } from '../pages/Exams';
import { api } from '../api/client';
import { prepareAssignmentAttachment } from '../utils/assignmentAttachment';

const mockUseAuth = vi.fn();

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../utils/assignmentAttachment', () => ({
  formatFileSize: vi.fn((bytes: number) => `${bytes} B`),
  prepareAssignmentAttachment: vi.fn(),
}));

function renderExams() {
  return render(
    <MemoryRouter>
      <Exams />
    </MemoryRouter>
  );
}

function submitFormByButtonName(buttonName: RegExp) {
  const button = screen.getByRole('button', { name: buttonName });
  const form = button.closest('form');
  if (!form) {
    throw new Error(`Formulário não encontrado para o botão ${buttonName}`);
  }
  fireEvent.submit(form);
}

const futureIso = () => new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();
const pastIso = () => new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();

describe('Exams Page — Provas e Avaliações', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  // =========================================================================
  // PROFESSOR — CAMINHO FELIZ
  // =========================================================================
  describe('Visão do Professor — Caminho Feliz', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'prof-1', name: 'Prof. Carlos', role: 'Professor' },
      });
    });

    it('deve listar apenas atividades do tipo Exam e ocultar tarefas regulares (Homework)', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-1',
            title: 'Prova 01 — Verb To Be',
            description: 'Responda as questões.',
            dueDate: futureIso(),
            type: 'Exam',
            weight: 3,
            allowLateSubmission: true,
            latePenaltyPercentage: 10,
            submissionsCount: 2,
            pendingGradingCount: 1,
          },
          {
            id: 'hw-1',
            title: 'Homework Diário 01',
            description: 'Não deve aparecer na tela de provas.',
            dueDate: futureIso(),
            type: 'Homework',
          },
        ],
      });

      renderExams();

      expect(await screen.findByText('Prova 01 — Verb To Be')).toBeInTheDocument();
      expect(screen.queryByText('Homework Diário 01')).not.toBeInTheDocument();
      expect(screen.getByText(/Avaliação • Peso 3/i)).toBeInTheDocument();
    });

    it('deve publicar uma nova prova com horário limite e política de desconto por atraso', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'exam-new',
              title: 'Avaliação Final First Step',
              description: 'Envie o áudio e as frases.',
              dueDate: '2026-12-10T23:59:00.000Z',
              type: 'Exam',
              weight: 4,
              allowLateSubmission: true,
              latePenaltyPercentage: 15,
              submissionsCount: 0,
            },
          ],
        });
      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'exam-new' } });

      renderExams();

      const newExamBtn = await screen.findByRole('button', { name: /Nova Prova/i });
      fireEvent.click(newExamBtn);

      fireEvent.change(screen.getByLabelText(/Título da Prova/i), {
        target: { value: 'Avaliação Final First Step' },
      });
      fireEvent.change(screen.getByLabelText(/Enunciado, Link da Prova e Critérios/i), {
        target: { value: 'Envie o áudio e as frases.' },
      });
      fireEvent.change(screen.getByLabelText(/Data e Horário Limite/i), {
        target: { value: '2026-12-10T20:59' },
      });
      fireEvent.change(screen.getByLabelText(/Peso/i), {
        target: { value: '4' },
      });
      fireEvent.change(screen.getByLabelText(/Redução de nota por atraso/i), {
        target: { value: '15' },
      });

      submitFormByButtonName(/Salvar Prova/i);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/Assignment',
          expect.objectContaining({
            title: 'Avaliação Final First Step',
            description: 'Envie o áudio e as frases.',
            type: 'Exam',
            weight: 4,
            allowLateSubmission: true,
            latePenaltyPercentage: 15,
            allowResubmission: false,
          })
        );
      });

      expect(await screen.findByText(/Nova prova publicada com sucesso!/i)).toBeInTheDocument();
    });

    it('deve aplicar automaticamente a redução de nota por atraso na correção e permitir abono manual', async () => {
      const deadline = '2026-11-20T18:00:00.000Z';
      const lateSubmissionTime = '2026-11-20T20:30:00.000Z';

      vi.mocked(api.get)
        .mockResolvedValueOnce({
          data: [
            {
              id: 'exam-1',
              title: 'Prova de Escrita',
              description: 'Redação curta.',
              dueDate: deadline,
              type: 'Exam',
              weight: 2,
              allowLateSubmission: true,
              latePenaltyPercentage: 10,
              submissionsCount: 1,
            },
          ],
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'sub-1',
              studentId: 'stu-1',
              studentName: 'João Silva',
              studentEmail: 'joao@email.com',
              answerText: 'My daily routine...',
              submittedAt: lateSubmissionTime,
              isLate: true,
              grade: null,
            },
          ],
        })
        .mockResolvedValueOnce({ data: [] });

      vi.mocked(api.post).mockResolvedValueOnce({ data: {} });

      renderExams();

      const entregasBtn = await screen.findByRole('button', { name: /Entregas \(1\)/i });
      fireEvent.click(entregasBtn);

      expect(await screen.findByText('João Silva')).toBeInTheDocument();
      expect(screen.getByText(/Em atraso \(2h de atraso\)/i)).toBeInTheDocument();

      const gradeInput = screen.getByLabelText('Nota de João Silva');
      fireEvent.change(gradeInput, { target: { value: '9' } });

      // Prévia deve indicar 9 * 0.9 = 8.1
      expect(screen.getByText(/Nota final: 8\.1\/10/i)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Salvar Nota/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/Assignment/submissions/sub-1/grade', {
          grade: 8.1,
          professorFeedback: null,
        });
      });

      expect(
        await screen.findByText(/Avaliação salva! Nota final atribuída: 8\.1\/10\./i)
      ).toBeInTheDocument();
    });
  });

  // =========================================================================
  // PROFESSOR — CAMINHO RUIM (FALHAS E VALIDAÇÕES)
  // =========================================================================
  describe('Visão do Professor — Caminho Ruim', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'prof-1', name: 'Prof. Carlos', role: 'PROFESSOR' },
      });
    });

    it('deve exibir banner de alerta quando a API falhar ao carregar as provas', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Network Error'));

      renderExams();

      expect(
        await screen.findByText(/Não foi possível carregar as provas e avaliações no momento\./i)
      ).toBeInTheDocument();
    });

    it('deve exibir erro no modal se o backend recusar a criação da prova', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({ data: [] });
      vi.mocked(api.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: 'Horário limite inválido no servidor.' } },
      });

      renderExams();

      fireEvent.click(await screen.findByRole('button', { name: /Nova Prova/i }));

      fireEvent.change(screen.getByLabelText(/Título da Prova/i), {
        target: { value: 'Prova Teste Erro' },
      });
      fireEvent.change(screen.getByLabelText(/Enunciado, Link da Prova e Critérios/i), {
        target: { value: 'Instruções.' },
      });
      fireEvent.change(screen.getByLabelText(/Data e Horário Limite/i), {
        target: { value: '2026-12-01T19:00' },
      });

      submitFormByButtonName(/Salvar Prova/i);

      expect(
        await screen.findByText(/Horário limite inválido no servidor\./i)
      ).toBeInTheDocument();
    });

    it('deve impedir salvar nota fora do intervalo de 0 a 10 sem chamar a API', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({
          data: [
            {
              id: 'exam-1',
              title: 'Prova Oral',
              description: 'Áudio.',
              dueDate: futureIso(),
              type: 'Exam',
              submissionsCount: 1,
            },
          ],
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'sub-99',
              studentId: 'stu-2',
              studentName: 'Maria Souza',
              studentEmail: 'maria@email.com',
              submittedAt: new Date().toISOString(),
              isLate: false,
              grade: null,
            },
          ],
        });

      renderExams();

      fireEvent.click(await screen.findByRole('button', { name: /Entregas \(1\)/i }));

      const gradeInput = await screen.findByLabelText('Nota de Maria Souza');
      fireEvent.change(gradeInput, { target: { value: '12' } });
      fireEvent.click(screen.getByRole('button', { name: /Salvar Nota/i }));

      expect(await screen.findByText(/Informe uma nota válida entre 0 e 10\./i)).toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // ALUNO — CAMINHO FELIZ
  // =========================================================================
  describe('Visão do Aluno — Caminho Feliz', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'stu-1', name: 'Ana Clara', role: 'Student' },
      });
    });

    it('deve permitir responder prova no prazo, passar pelo modal de confirmação e enviar', async () => {
      vi.mocked(api.get)
        .mockResolvedValueOnce({
          data: [
            {
              id: 'exam-10',
              title: 'Avaliação 01 — Greetings',
              description: 'Escreva um diálogo.',
              dueDate: futureIso(),
              type: 'Exam',
              weight: 2,
              allowLateSubmission: true,
              latePenaltyPercentage: 10,
              status: 'Pending',
            },
          ],
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'exam-10',
              title: 'Avaliação 01 — Greetings',
              description: 'Escreva um diálogo.',
              dueDate: futureIso(),
              type: 'Exam',
              status: 'Submitted',
              submissionId: 'sub-500',
              answerText: 'Hello, nice to meet you!',
            },
          ],
        });

      vi.mocked(api.post).mockResolvedValueOnce({ data: { id: 'sub-500' } });

      renderExams();

      expect(screen.queryByRole('button', { name: /Nova Prova/i })).not.toBeInTheDocument();

      const answerBtn = await screen.findByRole('button', { name: /Responder Prova/i });
      fireEvent.click(answerBtn);

      fireEvent.change(screen.getByLabelText(/Suas respostas ou observações/i), {
        target: { value: 'Hello, nice to meet you!' },
      });

      submitFormByButtonName(/Revisar e Enviar/i);

      expect(await screen.findByText(/Confirmar Envio da Prova\?/i)).toBeInTheDocument();
      expect(
        screen.getByText(/não será possível alterar ou reenviar/i)
      ).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Confirmar e Enviar/i }));

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith(
          '/Assignment/exam-10/submit',
          expect.any(FormData),
          expect.objectContaining({
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        );
      });

      expect(
        await screen.findByText(/Prova enviada com sucesso! Aguarde a correção do professor\./i)
      ).toBeInTheDocument();
    });

    it('deve liberar envio em atraso com alerta visual e desconto antes da confirmação', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-late',
            title: 'Prova 02 — Numbers',
            description: 'Envie a resolução.',
            dueDate: pastIso(),
            type: 'Exam',
            weight: 2,
            allowLateSubmission: true,
            latePenaltyPercentage: 20,
            status: 'Pending',
          },
        ],
      });

      renderExams();

      const lateBtn = await screen.findByRole('button', { name: /Enviar em Atraso/i });
      fireEvent.click(lateBtn);

      expect(await screen.findByText(/entregue em atraso/i)).toBeInTheDocument();
      expect(screen.getByText(/redução de 20% na nota final/i)).toBeInTheDocument();

      fireEvent.change(screen.getByLabelText(/Suas respostas ou observações/i), {
        target: { value: 'One, two, three...' },
      });
      submitFormByButtonName(/Revisar e Enviar/i);

      expect(
        await screen.findByText(/Envio fora do horário limite: esta entrega será marcada como atrasada/i)
      ).toBeInTheDocument();
    });

    it('deve exibir nota e comentário do professor na aba Avaliadas', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-graded',
            title: 'Prova 03 — Family',
            description: 'Árvore genealógica.',
            dueDate: pastIso(),
            type: 'Exam',
            status: 'Graded',
            grade: 9.5,
            professorFeedback: 'Excelente pronúncia e vocabulário!',
          },
        ],
      });

      renderExams();

      const gradedTab = await screen.findByRole('button', { name: /Avaliadas \(1\)/i });
      fireEvent.click(gradedTab);

      expect(await screen.findByText(/Nota: 9\.5\/10/i)).toBeInTheDocument();
      expect(screen.getByText(/Excelente pronúncia e vocabulário!/i)).toBeInTheDocument();
    });
  });

  // =========================================================================
  // ALUNO — CAMINHO RUIM (BLOQUEIOS, VALIDAÇÕES E ERROS)
  // =========================================================================
  describe('Visão do Aluno — Caminho Ruim', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: { id: 'stu-1', name: 'Ana Clara', role: 'STUDENT' },
      });
    });

    it('deve bloquear envio quando o prazo expirou e allowLateSubmission for false', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-closed',
            title: 'Prova Fechada',
            description: 'Não aceita atraso.',
            dueDate: pastIso(),
            type: 'Exam',
            allowLateSubmission: false,
            status: 'Pending',
          },
        ],
      });

      renderExams();

      expect(await screen.findByText('Prazo Encerrado')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Responder Prova/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Enviar em Atraso/i })).not.toBeInTheDocument();
    });

    it('deve impedir envio vazio sem texto nem anexo e não abrir modal de confirmação', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-empty',
            title: 'Prova Validação Vazia',
            description: 'Teste de validação.',
            dueDate: futureIso(),
            type: 'Exam',
            status: 'Pending',
          },
        ],
      });

      renderExams();

      fireEvent.click(await screen.findByRole('button', { name: /Responder Prova/i }));
      submitFormByButtonName(/Revisar e Enviar/i);

      expect(
        await screen.findByText(
          /Escreva suas respostas ou anexe o arquivo da prova antes de continuar\./i
        )
      ).toBeInTheDocument();
      expect(screen.queryByText(/Confirmar Envio da Prova\?/i)).not.toBeInTheDocument();
      expect(api.post).not.toHaveBeenCalled();
    });

    it('deve exibir erro ao anexar arquivo inválido ou maior que o permitido', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-file-err',
            title: 'Prova Anexo Inválido',
            description: 'Teste upload.',
            dueDate: futureIso(),
            type: 'Exam',
            status: 'Pending',
          },
        ],
      });
      vi.mocked(prepareAssignmentAttachment).mockRejectedValueOnce(
        new Error('Formato não suportado. Envie PDF, JPG, PNG ou WEBP.')
      );

      renderExams();

      fireEvent.click(await screen.findByRole('button', { name: /Responder Prova/i }));

      const fileInput = screen.getByLabelText(/Anexar PDF ou Foto da prova/i);
      const invalidFile = new File(['dummy'], 'virus.exe', { type: 'application/x-msdownload' });
      fireEvent.change(fileInput, { target: { files: [invalidFile] } });

      expect(
        await screen.findByText(/Formato não suportado\. Envie PDF, JPG, PNG ou WEBP\./i)
      ).toBeInTheDocument();
    });

    it('deve fechar o modal de confirmação e exibir alerta se a API recusar envio duplicado', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: [
          {
            id: 'exam-dup',
            title: 'Prova Envio Único',
            description: 'Teste duplicidade.',
            dueDate: futureIso(),
            type: 'Exam',
            status: 'Pending',
          },
        ],
      });
      vi.mocked(api.post).mockRejectedValueOnce({
        isAxiosError: true,
        response: { data: { message: 'Esta avaliação permite apenas um envio.' } },
      });

      renderExams();

      fireEvent.click(await screen.findByRole('button', { name: /Responder Prova/i }));
      fireEvent.change(screen.getByLabelText(/Suas respostas ou observações/i), {
        target: { value: 'Minha resposta final.' },
      });
      submitFormByButtonName(/Revisar e Enviar/i);

      fireEvent.click(await screen.findByRole('button', { name: /Confirmar e Enviar/i }));

      expect(
        await screen.findByText(/Esta avaliação permite apenas um envio\./i)
      ).toBeInTheDocument();
      expect(screen.queryByText(/Confirmar Envio da Prova\?/i)).not.toBeInTheDocument();
    });
  });
});