import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { COURSE_CATALOG } from '../data/courseCatalog';
import {
  formatFileSize,
  prepareAssignmentAttachment,
} from '../utils/assignmentAttachment';
import { isAxiosError } from 'axios';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle,
  Edit3,
  Trash2,
  Users,
  Send,
  Upload,
  FileText,
  X,
  ShieldAlert,
  Award,
  ExternalLink,
} from 'lucide-react';

interface ExamItem {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  catalogLessonId?: string | null;
  lessonId?: string | null;
  type?: string;
  weight?: number;
  allowLateSubmission?: boolean;
  latePenaltyPercentage?: number;
  allowResubmission?: boolean;
  // Campos visão Professor
  submissionsCount?: number;
  pendingGradingCount?: number;
  // Campos visão Aluno
  submissionId?: string | null;
  status?: string;
  answerText?: string | null;
  attachmentFileName?: string | null;
  submittedAt?: string | null;
  isLate?: boolean;
  grade?: number | null;
  professorFeedback?: string | null;
}

interface ExamSubmission {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  answerText?: string | null;
  attachmentFileName?: string | null;
  submittedAt: string;
  isLate?: boolean;
  grade?: number | null;
  professorFeedback?: string | null;
}

type StudentTab = 'pending' | 'submitted' | 'graded';

function getField(obj: Record<string, unknown>, keyName: string): unknown {
  const match = Object.keys(obj).find((k) => k.toLowerCase() === keyName.toLowerCase());
  return match === undefined ? undefined : obj[match];
}

function normalizeExam(value: unknown): ExamItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;

  const id = getField(item, 'id');
  const title = getField(item, 'title');
  if (typeof id !== 'string' || typeof title !== 'string') return null;

  const description = getField(item, 'description');
  const dueDate = getField(item, 'dueDate');
  const rawType = getField(item, 'type');
  const catalogLessonId = getField(item, 'catalogLessonId');
  const lessonId = getField(item, 'lessonId');
  const weight = getField(item, 'weight');
  const allowLateSubmission = getField(item, 'allowLateSubmission');
  const latePenaltyPercentage = getField(item, 'latePenaltyPercentage');
  const allowResubmission = getField(item, 'allowResubmission');
  const submissionsCount = getField(item, 'submissionsCount');
  const pendingGradingCount = getField(item, 'pendingGradingCount');
  const submissionId = getField(item, 'submissionId');
  const status = getField(item, 'status');
  const answerText = getField(item, 'answerText');
  const attachmentFileName = getField(item, 'attachmentFileName');
  const submittedAt = getField(item, 'submittedAt');
  const isLate = getField(item, 'isLate');
  const rawGrade = getField(item, 'grade');
  const professorFeedback = getField(item, 'professorFeedback');

  return {
    id,
    title,
    description: typeof description === 'string' ? description : '',
    dueDate: typeof dueDate === 'string' ? dueDate : '',
    type: typeof rawType === 'string' && rawType.trim() ? rawType.trim() : 'Homework',
    catalogLessonId: typeof catalogLessonId === 'string' && catalogLessonId.trim() ? catalogLessonId : null,
    lessonId: typeof lessonId === 'string' && lessonId.trim() ? lessonId : null,
    weight: typeof weight === 'number' ? weight : 2,
    allowLateSubmission: typeof allowLateSubmission === 'boolean' ? allowLateSubmission : true,
    latePenaltyPercentage: typeof latePenaltyPercentage === 'number' ? latePenaltyPercentage : 0,
    allowResubmission: typeof allowResubmission === 'boolean' ? allowResubmission : false,
    submissionsCount: typeof submissionsCount === 'number' ? submissionsCount : 0,
    pendingGradingCount: typeof pendingGradingCount === 'number' ? pendingGradingCount : 0,
    submissionId: typeof submissionId === 'string' && submissionId.trim() ? submissionId : null,
    status: typeof status === 'string' ? status : undefined,
    answerText: typeof answerText === 'string' ? answerText : null,
    attachmentFileName: typeof attachmentFileName === 'string' ? attachmentFileName : null,
    submittedAt: typeof submittedAt === 'string' ? submittedAt : null,
    isLate: typeof isLate === 'boolean' ? isLate : undefined,
    grade: typeof rawGrade === 'number' ? rawGrade : null,
    professorFeedback: typeof professorFeedback === 'string' ? professorFeedback : null,
  };
}

function normalizeExamSubmission(value: unknown, index: number): ExamSubmission | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;

  const rawId = getField(item, 'id') ?? getField(item, 'submissionId');
  const studentId = getField(item, 'studentId');
  const studentName = getField(item, 'studentName');
  const studentEmail = getField(item, 'studentEmail');
  const answerText = getField(item, 'answerText');
  const attachmentFileName = getField(item, 'attachmentFileName');
  const submittedAt = getField(item, 'submittedAt');
  const isLate = getField(item, 'isLate');
  const rawGrade = getField(item, 'grade');
  const professorFeedback = getField(item, 'professorFeedback');

  if (typeof studentId !== 'string') return null;

  return {
    id: typeof rawId === 'string' && rawId.trim() ? rawId : `sub-${studentId}-${index}`,
    studentId,
    studentName: typeof studentName === 'string' && studentName.trim() ? studentName : 'Aluno',
    studentEmail: typeof studentEmail === 'string' ? studentEmail : '',
    answerText: typeof answerText === 'string' ? answerText : null,
    attachmentFileName: typeof attachmentFileName === 'string' ? attachmentFileName : null,
    submittedAt: typeof submittedAt === 'string' ? submittedAt : new Date().toISOString(),
    isLate: typeof isLate === 'boolean' ? isLate : undefined,
    grade: typeof rawGrade === 'number' ? rawGrade : null,
    professorFeedback: typeof professorFeedback === 'string' ? professorFeedback : null,
  };
}

function formatDateTimeBR(isoDate?: string | null): string {
  if (!isoDate) return 'Sem prazo definido';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 'Data inválida';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

function toDatetimeLocalInput(isoDate?: string | null): string {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function formatDelayDuration(submittedAt: string, dueDate: string): string {
  const subMs = new Date(submittedAt).getTime();
  const dueMs = new Date(dueDate).getTime();
  if (Number.isNaN(subMs) || Number.isNaN(dueMs) || subMs <= dueMs) return '';

  const diffMinutes = Math.floor((subMs - dueMs) / (1000 * 60));
  if (diffMinutes < 60) return `${diffMinutes} min de atraso`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h de atraso`;

  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  return remHours > 0 ? `${diffDays}d ${remHours}h de atraso` : `${diffDays} dia(s) de atraso`;
}

export function Exams() {
  const { user } = useAuth();
  const isProfessor = user?.role?.toUpperCase() === 'PROFESSOR';

  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [lessonFilter, setLessonFilter] = useState('all');
  const [studentTab, setStudentTab] = useState<StudentTab>('pending');

  const [bannerSuccess, setBannerSuccess] = useState('');
  const [bannerError, setBannerError] = useState('');

  // Modal Criar / Editar Prova (Professor)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDateTime, setDueDateTime] = useState('');
  const [catalogLessonId, setCatalogLessonId] = useState('first-step-sumario');
  const [weight, setWeight] = useState('2');
  const [allowLateSubmission, setAllowLateSubmission] = useState(true);
  const [latePenaltyPercentage, setLatePenaltyPercentage] = useState('10');
  const [savingExam, setSavingExam] = useState(false);
  const [formError, setFormError] = useState('');

  // Modal Entregas e Correção (Professor)
  const [gradingExam, setGradingExam] = useState<ExamItem | null>(null);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeInputs, setGradeInputs] = useState<Record<string, string>>({});
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [applyPenaltyMap, setApplyPenaltyMap] = useState<Record<string, boolean>>({});
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradingMessage, setGradingMessage] = useState('');
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  // Modal de Envio + Confirmação (Aluno)
  const [answeringExam, setAnsweringExam] = useState<ExamItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentInfo, setAttachmentInfo] = useState('');
  const [submitValidationError, setSubmitValidationError] = useState('');
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [submittingExam, setSubmittingExam] = useState(false);

  const lessonsMap = useMemo(
    () => new Map(COURSE_CATALOG.map((item) => [item.id, item.title])),
    []
  );

  useEffect(() => {
    loadExams();
  }, []);

  async function loadExams() {
    setLoading(true);
    setBannerError('');
    try {
      const response = await api.get<unknown>('/Assignment');
      const allItems = Array.isArray(response.data) ? response.data : [];
      const onlyExams = allItems
        .map(normalizeExam)
        .filter(
          (item): item is ExamItem =>
            item !== null && (item.type ?? 'Homework').toLowerCase() === 'exam'
        );
      setExams(onlyExams);
    } catch (err) {
      console.error('Erro ao carregar provas:', err);
      setBannerError('Não foi possível carregar as provas e avaliações no momento.');
    } finally {
      setLoading(false);
    }
  }

  const handleOpenProtectedAttachment = async (submissionId: string, fileName?: string | null) => {
    setOpeningFileId(submissionId);
    try {
      const response = await api.get<Blob>(`/Assignment/submissions/${submissionId}/file`, {
        responseType: 'blob',
      });

      const blobUrl = window.URL.createObjectURL(response.data);
      const opened = window.open(blobUrl, '_blank', 'noopener,noreferrer');

      if (!opened) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'anexo-prova';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error('Erro ao abrir anexo da prova:', err);
      alert('Não foi possível abrir o arquivo anexado.');
    } finally {
      setOpeningFileId(null);
    }
  };

  // --- Ações do Professor ---
  const handleOpenCreateModal = () => {
    setEditingExam(null);
    setTitle('');
    setDescription('');
    setDueDateTime('');
    setCatalogLessonId('first-step-sumario');
    setWeight('2');
    setAllowLateSubmission(true);
    setLatePenaltyPercentage('10');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (exam: ExamItem) => {
    setEditingExam(exam);
    setTitle(exam.title);
    setDescription(exam.description);
    setDueDateTime(toDatetimeLocalInput(exam.dueDate));
    setCatalogLessonId(exam.catalogLessonId || 'first-step-sumario');
    setWeight(String(exam.weight ?? 2));
    setAllowLateSubmission(exam.allowLateSubmission ?? true);
    setLatePenaltyPercentage(String(exam.latePenaltyPercentage ?? 0));
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSaveExam = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setBannerSuccess('');

    if (!dueDateTime) {
      setFormError('Informe a data e o horário limite para a prova.');
      return;
    }

    const parsedDate = new Date(dueDateTime);
    if (Number.isNaN(parsedDate.getTime())) {
      setFormError('Data ou horário limite inválido.');
      return;
    }

    const parsedWeight = Number(weight);
    const parsedPenalty = allowLateSubmission ? Number(latePenaltyPercentage) : 0;

    setSavingExam(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: parsedDate.toISOString(),
        catalogLessonId: catalogLessonId || null,
        lessonId: editingExam?.lessonId ?? null,
        type: 'Exam',
        weight: Number.isNaN(parsedWeight) || parsedWeight <= 0 ? 2 : parsedWeight,
        allowLateSubmission,
        latePenaltyPercentage:
          Number.isNaN(parsedPenalty) || parsedPenalty < 0 ? 0 : Math.min(100, parsedPenalty),
        allowResubmission: false,
      };

      if (editingExam) {
        await api.put(`/Assignment/${editingExam.id}`, payload);
        setBannerSuccess('Prova atualizada com sucesso!');
      } else {
        await api.post('/Assignment', payload);
        setBannerSuccess('Nova prova publicada com sucesso!');
      }

      setIsFormModalOpen(false);
      await loadExams();
    } catch (err) {
      console.error('Erro ao salvar prova:', err);
      const msg = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
      setFormError(msg || 'Erro ao salvar a prova. Verifique os campos e tente novamente.');
    } finally {
      setSavingExam(false);
    }
  };

  const handleDeleteExam = async (exam: ExamItem) => {
    if (!window.confirm(`Deseja realmente excluir a prova "${exam.title}"?`)) {
      return;
    }

    setBannerSuccess('');
    try {
      await api.delete(`/Assignment/${exam.id}`);
      setExams((prev) => prev.filter((item) => item.id !== exam.id));
      setBannerSuccess('Prova excluída com sucesso.');
    } catch (err) {
      console.error('Erro ao excluir prova:', err);
      alert('Não foi possível excluir a prova.');
    }
  };

  const handleOpenSubmissionsModal = async (exam: ExamItem) => {
    setGradingExam(exam);
    setLoadingSubmissions(true);
    setGradingMessage('');
    try {
      const response = await api.get<unknown>(`/Assignment/${exam.id}/submissions`);
      const list = Array.isArray(response.data)
        ? response.data
            .map((item, idx) => normalizeExamSubmission(item, idx))
            .filter((item): item is ExamSubmission => item !== null)
        : [];
      setSubmissions(list);

      const initialGrades: Record<string, string> = {};
      const initialFeedbacks: Record<string, string> = {};
      const initialApplyPenalty: Record<string, boolean> = {};

      for (const sub of list) {
        initialGrades[sub.id] = typeof sub.grade === 'number' ? String(sub.grade) : '';
        initialFeedbacks[sub.id] = sub.professorFeedback ?? '';
        initialApplyPenalty[sub.id] = (exam.latePenaltyPercentage ?? 0) > 0;
      }

      setGradeInputs(initialGrades);
      setFeedbackInputs(initialFeedbacks);
      setApplyPenaltyMap(initialApplyPenalty);
    } catch (err) {
      console.error('Erro ao carregar entregas da prova:', err);
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (sub: ExamSubmission) => {
    if (!gradingExam) return;
    setGradingMessage('');

    const rawGrade = Number(gradeInputs[sub.id]?.replace(',', '.'));
    if (gradeInputs[sub.id] === '' || Number.isNaN(rawGrade) || rawGrade < 0 || rawGrade > 10) {
      setGradingMessage('Informe uma nota válida entre 0 e 10.');
      return;
    }

    const late =
      sub.isLate ?? new Date(sub.submittedAt).getTime() > new Date(gradingExam.dueDate).getTime();
    const penaltyPct = gradingExam.latePenaltyPercentage ?? 0;
    const shouldDiscount = late && penaltyPct > 0 && (applyPenaltyMap[sub.id] ?? true);

    const finalGrade = shouldDiscount
      ? Number(Math.max(0, rawGrade * (1 - penaltyPct / 100)).toFixed(1))
      : Number(rawGrade.toFixed(1));

    setGradingSubId(sub.id);
    try {
      await api.post(`/Assignment/submissions/${sub.id}/grade`, {
        grade: finalGrade,
        professorFeedback: (feedbackInputs[sub.id] ?? '').trim() || null,
      });

      setSubmissions((prev) =>
        prev.map((item) =>
          item.id === sub.id
            ? {
                ...item,
                grade: finalGrade,
                professorFeedback: (feedbackInputs[sub.id] ?? '').trim() || null,
              }
            : item
        )
      );
      setGradingMessage(`Avaliação salva! Nota final atribuída: ${finalGrade}/10.`);
      await loadExams();
    } catch (err) {
      console.error('Erro ao salvar nota da prova:', err);
      setGradingMessage('Erro ao salvar a nota. Tente novamente.');
    } finally {
      setGradingSubId(null);
    }
  };

  // --- Ações do Aluno ---
  const handleOpenAnswerModal = (exam: ExamItem) => {
    setAnsweringExam(exam);
    setAnswerText('');
    setSelectedFile(null);
    setAttachmentInfo('');
    setSubmitValidationError('');
    setIsConfirmSubmitOpen(false);
  };

  const handleExamFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSubmitValidationError('');
    setAttachmentInfo('');

    if (!file) {
      setSelectedFile(null);
      return;
    }

    try {
      const prepared = await prepareAssignmentAttachment(file);
      setSelectedFile(prepared.file);
      setAttachmentInfo(
        prepared.wasCompressed
          ? `Imagem otimizada automaticamente (${formatFileSize(prepared.originalSizeBytes)} → ${formatFileSize(prepared.finalSizeBytes)}).`
          : `Arquivo pronto: ${prepared.file.name} (${formatFileSize(prepared.finalSizeBytes)}).`
      );
    } catch (err) {
      setSelectedFile(null);
      e.target.value = '';
      setSubmitValidationError(err instanceof Error ? err.message : 'Arquivo inválido.');
    }
  };

  const handleRequestSubmitConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitValidationError('');

    if (!answerText.trim() && !selectedFile) {
      setSubmitValidationError(
        'Escreva suas respostas ou anexe o arquivo da prova antes de continuar.'
      );
      return;
    }

    setIsConfirmSubmitOpen(true);
  };

  const handleConfirmFinalSubmission = async () => {
    if (!answeringExam) return;

    setSubmittingExam(true);
    setBannerSuccess('');
    try {
      const formData = new FormData();
      if (answerText.trim()) {
        formData.append('answerText', answerText.trim());
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post(`/Assignment/${answeringExam.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setIsConfirmSubmitOpen(false);
      setAnsweringExam(null);
      setBannerSuccess('Prova enviada com sucesso! Aguarde a correção do professor.');
      await loadExams();
    } catch (err) {
      console.error('Erro ao enviar prova:', err);
      const msg = isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined;
      setSubmitValidationError(msg || 'Não foi possível concluir o envio da prova.');
      setIsConfirmSubmitOpen(false);
    } finally {
      setSubmittingExam(false);
    }
  };

  // --- Filtros ---
  const filteredExams = useMemo(() => {
    const query = search.toLowerCase();

    return exams.filter((exam) => {
      const matchesText =
        exam.title.toLowerCase().includes(query) ||
        exam.description.toLowerCase().includes(query);

      if (!matchesText) return false;

      if (lessonFilter !== 'all' && exam.catalogLessonId !== lessonFilter) {
        return false;
      }

      if (!isProfessor) {
        const isGraded = exam.status?.toLowerCase() === 'graded' || typeof exam.grade === 'number';
        const isSubmitted =
          !isGraded &&
          (exam.status?.toLowerCase() === 'submitted' || Boolean(exam.submissionId));

        if (studentTab === 'pending') return !isGraded && !isSubmitted;
        if (studentTab === 'submitted') return isSubmitted;
        if (studentTab === 'graded') return isGraded;
      }

      return true;
    });
  }, [exams, search, lessonFilter, isProfessor, studentTab]);

  const studentCounts = useMemo(() => {
    let pending = 0;
    let submitted = 0;
    let graded = 0;

    for (const exam of exams) {
      const isGraded = exam.status?.toLowerCase() === 'graded' || typeof exam.grade === 'number';
      const isSubmitted =
        !isGraded &&
        (exam.status?.toLowerCase() === 'submitted' || Boolean(exam.submissionId));
      if (isGraded) graded++;
      else if (isSubmitted) submitted++;
      else pending++;
    }

    return { pending, submitted, graded };
  }, [exams]);

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
        Carregando provas e avaliações...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1120px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileSpreadsheet size={28} color="var(--brand-red)" />
            <h1 style={{ fontSize: '1.9rem', color: 'var(--text-main)', margin: 0 }}>
              Provas e Avaliações
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: '0.3rem 0 0 0' }}>
            {isProfessor
              ? 'Agende avaliações com horário limite, regra de envio em atraso e correção individual.'
              : 'Confira seus prazos de avaliação, envie suas respostas e acompanhe suas notas.'}
          </p>
        </div>

        {isProfessor && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              backgroundColor: 'var(--brand-red)',
              color: '#FFFFFF',
              border: '2px solid #181818',
              boxShadow: '3px 3px 0px #181818',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-subtitle)',
            }}
          >
            <Plus size={18} /> Nova Prova
          </button>
        )}
      </div>

      {/* Banners de feedback */}
      {bannerSuccess && (
        <div
          role="status"
          style={{
            backgroundColor: '#DCFCE7',
            color: '#166534',
            border: '2px solid #181818',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle size={18} /> {bannerSuccess}
        </div>
      )}

      {bannerError && (
        <div
          role="alert"
          style={{
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: '2px solid #181818',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
          }}
        >
          <AlertTriangle size={18} /> {bannerError}
        </div>
      )}

      {/* Abas da visão do Aluno */}
      {!isProfessor && (
        <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          {(
            [
              { key: 'pending', label: `Pendentes (${studentCounts.pending})` },
              { key: 'submitted', label: `Entregues (${studentCounts.submitted})` },
              { key: 'graded', label: `Avaliadas (${studentCounts.graded})` },
            ] as { key: StudentTab; label: string }[]
          ).map((tab) => {
            const active = studentTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStudentTab(tab.key)}
                style={{
                  backgroundColor: active ? '#181818' : '#FFFFFF',
                  color: active ? '#FFFFFF' : '#181818',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  padding: '0.55rem 1rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  boxShadow: active ? 'none' : '2px 2px 0px #181818',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Barra de Filtros */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '2px solid #181818',
            borderRadius: '8px',
            padding: '0.5rem 0.75rem',
            backgroundColor: '#FFFFFF',
            flex: 1,
            minWidth: '240px',
          }}
        >
          <Search size={18} color="#555" style={{ marginRight: '8px' }} />
          <input
            type="text"
            placeholder="Buscar prova por título ou instrução..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              backgroundColor: 'transparent',
              width: '100%',
              fontSize: '0.9rem',
            }}
          />
        </div>

        <select
          aria-label="Filtrar provas por aula"
          value={lessonFilter}
          onChange={(e) => setLessonFilter(e.target.value)}
          style={{
            padding: '0.55rem 0.85rem',
            borderRadius: '8px',
            border: '2px solid #181818',
            backgroundColor: '#FFFFFF',
            fontWeight: 600,
            fontSize: '0.88rem',
          }}
        >
          <option value="all">Todas as lições vinculadas</option>
          {COURSE_CATALOG.map((lesson) => (
            <option key={lesson.id} value={lesson.id}>
              {lesson.title}
            </option>
          ))}
        </select>
      </div>

      {/* Lista de Provas */}
      {filteredExams.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredExams.map((exam) => {
            const nowMs = Date.now();
            const dueMs = new Date(exam.dueDate).getTime();
            const isPastDue = !Number.isNaN(dueMs) && nowMs > dueMs;
            const allowsLate = exam.allowLateSubmission ?? true;
            const penaltyPct = exam.latePenaltyPercentage ?? 0;

            const isGraded =
              exam.status?.toLowerCase() === 'graded' || typeof exam.grade === 'number';
            const isSubmitted =
              !isGraded &&
              (exam.status?.toLowerCase() === 'submitted' || Boolean(exam.submissionId));
            const wasSubmittedLate =
              exam.isLate ??
              (exam.submittedAt ? new Date(exam.submittedAt).getTime() > dueMs : false);

            return (
              <article
                key={exam.id}
                className="doodle-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2.5px solid #181818',
                  borderRadius: '14px',
                  padding: '1.35rem 1.5rem',
                  boxShadow: '4px 4px 0px #181818',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '260px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        flexWrap: 'wrap',
                        marginBottom: '0.45rem',
                      }}
                    >
                      <span
                        style={{
                          backgroundColor: '#FEE2E2',
                          color: '#DC2626',
                          border: '1.5px solid #181818',
                          borderRadius: '999px',
                          padding: '0.15rem 0.65rem',
                          fontSize: '0.73rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                        }}
                      >
                        Avaliação • Peso {exam.weight ?? 2}
                      </span>

                      <span
                        style={{
                          backgroundColor: '#F4EFE6',
                          color: '#181818',
                          border: '1.5px solid #181818',
                          borderRadius: '999px',
                          padding: '0.15rem 0.65rem',
                          fontSize: '0.73rem',
                          fontWeight: 700,
                        }}
                      >
                        Envio Único
                      </span>

                      {exam.catalogLessonId && lessonsMap.get(exam.catalogLessonId) && (
                        <span
                          style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            border: '1px solid #181818',
                            borderRadius: '999px',
                            padding: '0.15rem 0.65rem',
                            fontSize: '0.73rem',
                            fontWeight: 700,
                          }}
                        >
                          {lessonsMap.get(exam.catalogLessonId)}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '1.22rem', margin: '0 0 0.4rem 0', color: '#181818' }}>
                      {exam.title}
                    </h2>
                    <p
                      style={{
                        margin: '0 0 0.85rem 0',
                        color: '#444444',
                        fontSize: '0.92rem',
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {exam.description}
                    </p>

                    {/* Linha de Prazo e Política de Atraso */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        flexWrap: 'wrap',
                        fontSize: '0.83rem',
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          fontWeight: 700,
                          color: isPastDue && !isSubmitted && !isGraded ? '#DC2626' : '#181818',
                        }}
                      >
                        <Clock size={15} />
                        Horário limite: {formatDateTimeBR(exam.dueDate)}
                      </span>

                      {allowsLate ? (
                        <span
                          style={{
                            backgroundColor: '#FEF3C7',
                            color: '#92400E',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                          }}
                        >
                          {penaltyPct > 0
                            ? `Aceita atraso (redução de ${penaltyPct}% na nota)`
                            : 'Aceita atraso com sinalização'}
                        </span>
                      ) : (
                        <span
                          style={{
                            backgroundColor: '#F3F4F6',
                            color: '#4B5563',
                            padding: '0.2rem 0.6rem',
                            borderRadius: '6px',
                            fontWeight: 700,
                          }}
                        >
                          Não aceita envio após o prazo
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Ações à Direita */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      gap: '0.6rem',
                    }}
                  >
                    {isProfessor ? (
                      <>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            type="button"
                            onClick={() => handleOpenSubmissionsModal(exam)}
                            style={{
                              backgroundColor: '#181818',
                              color: '#FFFFFF',
                              border: '2px solid #181818',
                              borderRadius: '8px',
                              padding: '0.55rem 0.9rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                            }}
                          >
                            <Users size={16} />
                            <span>Entregas ({exam.submissionsCount ?? 0})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(exam)}
                            title="Editar Prova"
                            style={{
                              backgroundColor: '#FEF08A',
                              border: '2px solid #181818',
                              borderRadius: '8px',
                              padding: '0.55rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Edit3 size={16} color="#181818" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteExam(exam)}
                            title="Excluir Prova"
                            style={{
                              backgroundColor: '#FEE2E2',
                              border: '2px solid #181818',
                              borderRadius: '8px',
                              padding: '0.55rem',
                              cursor: 'pointer',
                            }}
                          >
                            <Trash2 size={16} color="#DC2626" />
                          </button>
                        </div>

                        {(exam.pendingGradingCount ?? 0) > 0 && (
                          <span
                            style={{
                              fontSize: '0.78rem',
                              fontWeight: 800,
                              color: '#DC2626',
                            }}
                          >
                            {exam.pendingGradingCount} aguardando correção
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        {isGraded ? (
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.35rem',
                                backgroundColor: '#DCFCE7',
                                color: '#166534',
                                border: '2px solid #166534',
                                borderRadius: '10px',
                                padding: '0.4rem 0.85rem',
                                fontWeight: 900,
                                fontSize: '0.95rem',
                              }}
                            >
                              <Award size={17} />
                              Nota: {exam.grade}/10
                            </span>
                            {wasSubmittedLate && (
                              <div
                                style={{
                                  fontSize: '0.76rem',
                                  color: '#92400E',
                                  fontWeight: 700,
                                  marginTop: '0.3rem',
                                }}
                              >
                                Enviada em atraso
                              </div>
                            )}
                          </div>
                        ) : isSubmitted ? (
                          <div style={{ textAlign: 'right' }}>
                            <span
                              style={{
                                display: 'inline-block',
                                backgroundColor: '#FEF3C7',
                                color: '#92400E',
                                border: '1.5px solid #181818',
                                borderRadius: '8px',
                                padding: '0.4rem 0.8rem',
                                fontWeight: 800,
                                fontSize: '0.83rem',
                              }}
                            >
                              Aguardando Correção
                            </span>
                            {wasSubmittedLate && (
                              <div
                                style={{
                                  fontSize: '0.76rem',
                                  color: '#DC2626',
                                  fontWeight: 700,
                                  marginTop: '0.3rem',
                                }}
                              >
                                Entregue após o horário limite
                              </div>
                            )}
                          </div>
                        ) : isPastDue && !allowsLate ? (
                          <span
                            style={{
                              backgroundColor: '#FEE2E2',
                              color: '#DC2626',
                              border: '1.5px solid #DC2626',
                              borderRadius: '8px',
                              padding: '0.45rem 0.85rem',
                              fontWeight: 800,
                              fontSize: '0.83rem',
                            }}
                          >
                            Prazo Encerrado
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAnswerModal(exam)}
                            style={{
                              backgroundColor: isPastDue ? '#D97706' : 'var(--brand-red)',
                              color: '#FFFFFF',
                              border: '2px solid #181818',
                              boxShadow: '3px 3px 0px #181818',
                              borderRadius: '8px',
                              padding: '0.6rem 1.1rem',
                              fontWeight: 800,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.45rem',
                            }}
                          >
                            <Send size={16} />
                            <span>{isPastDue ? 'Enviar em Atraso' : 'Responder Prova'}</span>
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Anexo e Feedback visíveis para o aluno após o envio */}
                {!isProfessor && (isSubmitted || isGraded) && (
                  <div
                    style={{
                      marginTop: '1rem',
                      padding: '0.75rem 1rem',
                      backgroundColor: '#FDFBF7',
                      border: '1.5px solid #181818',
                      borderRadius: '8px',
                      fontSize: '0.88rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem',
                    }}
                  >
                    {exam.answerText && (
                      <div>
                        <strong>Sua resposta:</strong> {exam.answerText}
                      </div>
                    )}

                    {exam.attachmentFileName && exam.submissionId && (
                      <div>
                        <button
                          type="button"
                          disabled={openingFileId === exam.submissionId}
                          onClick={() =>
                            handleOpenProtectedAttachment(
                              exam.submissionId!,
                              exam.attachmentFileName
                            )
                          }
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            backgroundColor: '#FFFFFF',
                            border: '1.5px solid #181818',
                            borderRadius: '6px',
                            padding: '0.3rem 0.65rem',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                        >
                          <FileText size={14} />
                          <span>
                            {openingFileId === exam.submissionId
                              ? 'Abrindo...'
                              : exam.attachmentFileName}
                          </span>
                          <ExternalLink size={12} />
                        </button>
                      </div>
                    )}

                    {isGraded && exam.professorFeedback && (
                      <div>
                        <strong>Comentário do Professor:</strong> {exam.professorFeedback}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '2px dashed #181818',
            borderRadius: '14px',
            padding: '3rem 1.5rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
          }}
        >
          Nenhuma prova ou avaliação encontrada nesta visualização.
        </div>
      )}

      {/* MODAL 1: Criar / Editar Prova (Professor) */}
      {isFormModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <button
              type="button"
              onClick={() => setIsFormModalOpen(false)}
              title="Fechar"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h2 style={{ fontSize: '1.35rem', marginTop: 0, marginBottom: '1.1rem' }}>
              {editingExam ? 'Editar Prova / Avaliação' : 'Publicar Nova Prova'}
            </h2>

            {formError && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1.5px solid #DC2626',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveExam}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="exam-title-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}
                >
                  Título da Prova
                </label>
                <input
                  id="exam-title-input"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Avaliação 01 — Verb To Be & Pronúncia"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="exam-desc-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}
                >
                  Enunciado, Link da Prova e Critérios
                </label>
                <textarea
                  id="exam-desc-input"
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva as questões, cole o link do PDF/Google Drive da prova ou oriente o envio de foto/PDF..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 110px',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <label
                    htmlFor="exam-datetime-input"
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                    }}
                  >
                    Data e Horário Limite
                  </label>
                  <input
                    id="exam-datetime-input"
                    type="datetime-local"
                    required
                    value={dueDateTime}
                    onChange={(e) => setDueDateTime(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '2px solid #181818',
                    }}
                  />
                </div>

                <div>
                  <label
                    htmlFor="exam-weight-input"
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      marginBottom: '0.35rem',
                    }}
                  >
                    Peso
                  </label>
                  <input
                    id="exam-weight-input"
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '0.6rem',
                      borderRadius: '8px',
                      border: '2px solid #181818',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="exam-lesson-select"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}
                >
                  Lição de Referência (Opcional)
                </label>
                <select
                  id="exam-lesson-select"
                  value={catalogLessonId}
                  onChange={(e) => setCatalogLessonId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {COURSE_CATALOG.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Política de Entrega em Atraso */}
              <div
                style={{
                  backgroundColor: '#FDFBF7',
                  border: '2px solid #181818',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  marginBottom: '1.35rem',
                }}
              >
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.55rem',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={allowLateSubmission}
                    onChange={(e) => setAllowLateSubmission(e.target.checked)}
                  />
                  <span>Liberar envio após o horário limite (com aviso de atraso)</span>
                </label>

                {allowLateSubmission && (
                  <div style={{ marginTop: '0.75rem' }}>
                    <label
                      htmlFor="exam-penalty-select"
                      style={{
                        display: 'block',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        marginBottom: '0.3rem',
                      }}
                    >
                      Redução de nota por atraso
                    </label>
                    <select
                      id="exam-penalty-select"
                      value={latePenaltyPercentage}
                      onChange={(e) => setLatePenaltyPercentage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        borderRadius: '8px',
                        border: '1.5px solid #181818',
                        backgroundColor: '#FFFFFF',
                        fontSize: '0.86rem',
                      }}
                    >
                      <option value="0">0% — Apenas aviso visual (sem desconto na nota)</option>
                      <option value="10">10% — Redução de 10% sobre a nota obtida</option>
                      <option value="15">15% — Redução de 15% sobre a nota obtida</option>
                      <option value="20">20% — Redução de 20% sobre a nota obtida</option>
                      <option value="25">25% — Redução de 25% sobre a nota obtida</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingExam}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: 'var(--brand-red)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: savingExam ? 'not-allowed' : 'pointer',
                  }}
                >
                  {savingExam ? 'Salvando...' : 'Salvar Prova'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Entregas e Correção (Professor) */}
      {gradingExam && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '660px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <button
              type="button"
              onClick={() => setGradingExam(null)}
              title="Fechar"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '0.25rem' }}>
              Entregas — {gradingExam.title}
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#555555', marginTop: 0, marginBottom: '1rem' }}>
              Horário limite: <strong>{formatDateTimeBR(gradingExam.dueDate)}</strong>
              {(gradingExam.latePenaltyPercentage ?? 0) > 0 &&
                ` • Redução configurada para atraso: ${gradingExam.latePenaltyPercentage}%`}
            </p>

            {gradingMessage && (
              <div
                style={{
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  border: '1.5px solid #166534',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                }}
              >
                {gradingMessage}
              </div>
            )}

            {loadingSubmissions ? (
              <p>Carregando entregas dos alunos...</p>
            ) : submissions.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submissions.map((sub) => {
                  const late =
                    sub.isLate ??
                    new Date(sub.submittedAt).getTime() >
                      new Date(gradingExam.dueDate).getTime();
                  const delayLabel = late
                    ? formatDelayDuration(sub.submittedAt, gradingExam.dueDate)
                    : '';
                  const penaltyPct = gradingExam.latePenaltyPercentage ?? 0;
                  const rawNum = Number(gradeInputs[sub.id]?.replace(',', '.'));
                  const applyDiscount = late && penaltyPct > 0 && (applyPenaltyMap[sub.id] ?? true);
                  const previewFinal =
                    !Number.isNaN(rawNum) && gradeInputs[sub.id] !== ''
                      ? applyDiscount
                        ? Number(Math.max(0, rawNum * (1 - penaltyPct / 100)).toFixed(1))
                        : Number(rawNum.toFixed(1))
                      : null;

                  return (
                    <div
                      key={sub.id}
                      style={{
                        border: '2px solid #181818',
                        borderRadius: '10px',
                        padding: '1rem',
                        backgroundColor: '#FDFBF7',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                          marginBottom: '0.65rem',
                        }}
                      >
                        <div>
                          <strong>{sub.studentName}</strong>{' '}
                          {sub.studentEmail && (
                            <span style={{ fontSize: '0.8rem', color: '#555555' }}>
                              ({sub.studentEmail})
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {late ? (
                            <span
                              style={{
                                backgroundColor: '#FEE2E2',
                                color: '#DC2626',
                                border: '1px solid #DC2626',
                                borderRadius: '999px',
                                padding: '0.15rem 0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              Em atraso {delayLabel ? `(${delayLabel})` : ''}
                            </span>
                          ) : (
                            <span
                              style={{
                                backgroundColor: '#DCFCE7',
                                color: '#166534',
                                borderRadius: '999px',
                                padding: '0.15rem 0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              No prazo
                            </span>
                          )}

                          {typeof sub.grade === 'number' && (
                            <span
                              style={{
                                backgroundColor: '#181818',
                                color: '#FFFFFF',
                                borderRadius: '999px',
                                padding: '0.15rem 0.6rem',
                                fontSize: '0.75rem',
                                fontWeight: 800,
                              }}
                            >
                              Avaliada: {sub.grade}/10
                            </span>
                          )}
                        </div>
                      </div>

                      {sub.answerText && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2D7C5',
                            borderRadius: '8px',
                            padding: '0.75rem',
                            fontSize: '0.88rem',
                            marginBottom: '0.75rem',
                            whiteSpace: 'pre-wrap',
                          }}
                        >
                          {sub.answerText}
                        </div>
                      )}

                      {sub.attachmentFileName && (
                        <div style={{ marginBottom: '0.75rem', fontSize: '0.84rem' }}>
                          <button
                            type="button"
                            disabled={openingFileId === sub.id}
                            onClick={() =>
                              handleOpenProtectedAttachment(sub.id, sub.attachmentFileName)
                            }
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.4rem',
                              backgroundColor: '#FFFFFF',
                              border: '2px solid #181818',
                              borderRadius: '8px',
                              padding: '0.4rem 0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              boxShadow: '2px 2px 0px #181818',
                            }}
                          >
                            <FileText size={15} color="var(--brand-red)" />
                            <span>
                              {openingFileId === sub.id
                                ? 'Abrindo anexo...'
                                : `Visualizar / Baixar: ${sub.attachmentFileName}`}
                            </span>
                            <ExternalLink size={13} />
                          </button>
                        </div>
                      )}

                      {late && penaltyPct > 0 && (
                        <label
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.45rem',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            color: '#92400E',
                            marginBottom: '0.65rem',
                            cursor: 'pointer',
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={applyPenaltyMap[sub.id] ?? true}
                            onChange={(e) =>
                              setApplyPenaltyMap((prev) => ({
                                ...prev,
                                [sub.id]: e.target.checked,
                              }))
                            }
                          />
                          <span>
                            Aplicar redução de {penaltyPct}% por atraso
                            {previewFinal !== null && ` (Nota final: ${previewFinal}/10)`}
                          </span>
                        </label>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '110px 1fr auto',
                          gap: '0.6rem',
                          alignItems: 'center',
                        }}
                      >
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          aria-label={`Nota de ${sub.studentName}`}
                          placeholder="Nota (0-10)"
                          value={gradeInputs[sub.id] ?? ''}
                          onChange={(e) =>
                            setGradeInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                          }
                          style={{
                            padding: '0.55rem',
                            borderRadius: '8px',
                            border: '2px solid #181818',
                            backgroundColor: '#FFFFFF',
                          }}
                        />

                        <input
                          type="text"
                          aria-label={`Comentário para ${sub.studentName}`}
                          placeholder="Feedback para o aluno..."
                          value={feedbackInputs[sub.id] ?? ''}
                          onChange={(e) =>
                            setFeedbackInputs((prev) => ({ ...prev, [sub.id]: e.target.value }))
                          }
                          style={{
                            padding: '0.55rem',
                            borderRadius: '8px',
                            border: '2px solid #181818',
                            backgroundColor: '#FFFFFF',
                          }}
                        />

                        <button
                          type="button"
                          disabled={gradingSubId === sub.id}
                          onClick={() => handleGradeSubmission(sub)}
                          style={{
                            backgroundColor: 'var(--brand-red)',
                            color: '#FFFFFF',
                            border: '2px solid #181818',
                            borderRadius: '8px',
                            padding: '0.55rem 0.95rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          Salvar Nota
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ color: '#555555' }}>Nenhum aluno enviou esta prova ainda.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL 3: Responder Prova (Aluno) */}
      {answeringExam && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <button
              type="button"
              onClick={() => setAnsweringExam(null)}
              title="Fechar"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '0.4rem' }}>
              {answeringExam.title}
            </h2>
            <p
              style={{
                fontSize: '0.88rem',
                color: '#555555',
                marginTop: 0,
                marginBottom: '1rem',
                whiteSpace: 'pre-wrap',
              }}
            >
              {answeringExam.description}
            </p>

            {/* Aviso de entrega após o horário limite */}
            {Date.now() > new Date(answeringExam.dueDate).getTime() && (
              <div
                role="status"
                style={{
                  backgroundColor: '#FEF3C7',
                  color: '#92400E',
                  border: '2px solid #D97706',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  marginBottom: '1rem',
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                }}
              >
                <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>
                  O horário limite ({formatDateTimeBR(answeringExam.dueDate)}) já passou. Seu envio
                  continua liberado, mas será registrado como <strong>entregue em atraso</strong>
                  {(answeringExam.latePenaltyPercentage ?? 0) > 0
                    ? ` com redução de ${answeringExam.latePenaltyPercentage}% na nota final.`
                    : '.'}
                </span>
              </div>
            )}

            {submitValidationError && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1.5px solid #DC2626',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}
              >
                {submitValidationError}
              </div>
            )}

            <form onSubmit={handleRequestSubmitConfirmation}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="exam-answer-textarea"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}
                >
                  Suas respostas ou observações
                </label>
                <textarea
                  id="exam-answer-textarea"
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Digite suas respostas aqui ou descreva o arquivo anexado..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.35rem' }}>
                <label
                  htmlFor="exam-file-input"
                  style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.35rem' }}
                >
                  Anexar PDF ou Foto da prova (opcional • máx. 5 MB)
                </label>
                <label
                  htmlFor="exam-file-input"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: '2px dashed #181818',
                    borderRadius: '8px',
                    padding: '0.7rem 0.9rem',
                    backgroundColor: '#FDFBF7',
                    cursor: 'pointer',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                  }}
                >
                  <Upload size={17} color="var(--brand-red)" />
                  <span>
                    {selectedFile ? selectedFile.name : 'Selecionar PDF, JPG, PNG ou WEBP'}
                  </span>
                </label>
                <input
                  id="exam-file-input"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleExamFileChange}
                  style={{ display: 'none' }}
                />

                {attachmentInfo && (
                  <p style={{ margin: '0.45rem 0 0 0', fontSize: '0.82rem', color: '#166534', fontWeight: 700 }}>
                    {attachmentInfo}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setAnsweringExam(null)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: 'var(--brand-red)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Revisar e Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Confirmação Definitiva de Envio da Prova (Aluno) */}
      {answeringExam && isConfirmSubmitOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.72)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 1100,
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '450px',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.85rem' }}>
              <div
                style={{
                  backgroundColor: '#FEF3C7',
                  border: '2px solid #181818',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  display: 'inline-flex',
                }}
              >
                <ShieldAlert size={22} color="#92400E" />
              </div>
              <h2 style={{ fontSize: '1.22rem', margin: 0 }}>Confirmar Envio da Prova?</h2>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#333333', lineHeight: 1.5, marginBottom: '0.85rem' }}>
              Você está prestes a enviar sua resposta definitiva para{' '}
              <strong>{answeringExam.title}</strong>. Como se trata de uma avaliação,{' '}
              <strong>não será possível alterar ou reenviar</strong> após a confirmação.
            </p>

            {Date.now() > new Date(answeringExam.dueDate).getTime() && (
              <div
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1.5px solid #DC2626',
                  borderRadius: '8px',
                  padding: '0.65rem 0.8rem',
                  fontSize: '0.83rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                Envio fora do horário limite: esta entrega será marcada como atrasada
                {(answeringExam.latePenaltyPercentage ?? 0) > 0
                  ? ` (sujeita à redução de ${answeringExam.latePenaltyPercentage}% na nota).`
                  : '.'}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={submittingExam}
                onClick={() => setIsConfirmSubmitOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: '2px solid #181818',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Voltar e Revisar
              </button>
              <button
                type="button"
                disabled={submittingExam}
                onClick={handleConfirmFinalSubmission}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: '2px solid #181818',
                  backgroundColor: '#166534',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: submittingExam ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingExam ? 'Enviando...' : 'Confirmar e Enviar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}