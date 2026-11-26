import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import {
  PlusCircle,
  CheckCircle,
  Calendar,
  Edit3,
  Trash2,
  X,
  Upload,
  FileText,
  Award,
  Clock,
  AlertCircle,
  Send,
  Users,
  BookOpen,
  ExternalLink,
  Search,
} from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { COURSE_CATALOG } from '../data/courseCatalog';
import {
  formatFileSize,
  prepareAssignmentAttachment,
} from '../utils/assignmentAttachment';

type SubmissionStatus = 'Pending' | 'Submitted' | 'Graded';
type StudentTabFilter = 'all' | 'pending' | 'submitted' | 'graded';

interface AssignmentItem {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  catalogLessonId: string | null;
  lessonId: string | null;
  submissionId: string | null;
  status: SubmissionStatus;
  answerText: string | null;
  attachmentFileName: string | null;
  submittedAt: string | null;
  grade: number | null;
  professorFeedback: string | null;
  submissionsCount: number;
  pendingGradingCount: number;
}

interface StudentSubmissionItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  answerText: string | null;
  attachmentFileName: string | null;
  submittedAt: string | null;
  grade: number | null;
  professorFeedback: string | null;
}

interface ErrorPayload {
  message?: string;
}

function getField(obj: Record<string, unknown>, keyName: string): unknown {
  const match = Object.keys(obj).find((k) => k.toLowerCase() === keyName.toLowerCase());
  return match === undefined ? undefined : obj[match];
}

function normalizeStatus(rawStatus: unknown, isCompleted: unknown, grade: number | null): SubmissionStatus {
  if (typeof rawStatus === 'string') {
    const normalized = rawStatus.trim().toLowerCase();
    if (normalized === 'graded') return 'Graded';
    if (normalized === 'submitted') return 'Submitted';
    if (normalized === 'pending') return 'Pending';
  }
  if (grade !== null) return 'Graded';
  if (isCompleted === true) return 'Submitted';
  return 'Pending';
}

function normalizeAssignment(value: unknown): AssignmentItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;

  const id = getField(item, 'id');
  const title = getField(item, 'title');
  if (typeof id !== 'string' || typeof title !== 'string') return null;

  const description = getField(item, 'description');
  const dueDate = getField(item, 'dueDate');
  const catalogLessonId = getField(item, 'catalogLessonId');
  const lessonId = getField(item, 'lessonId');
  const submissionId = getField(item, 'submissionId');
  const rawStatus = getField(item, 'status');
  const isCompleted = getField(item, 'isCompleted');
  const answerText = getField(item, 'answerText');
  const attachmentFileName = getField(item, 'attachmentFileName');
  const submittedAt = getField(item, 'submittedAt');
  const rawGrade = getField(item, 'grade');
  const professorFeedback = getField(item, 'professorFeedback');
  const submissionsCount = getField(item, 'submissionsCount');
  const pendingGradingCount = getField(item, 'pendingGradingCount');

  const grade = typeof rawGrade === 'number' ? rawGrade : null;

  return {
    id,
    title,
    description: typeof description === 'string' ? description : '',
    dueDate: typeof dueDate === 'string' ? dueDate : null,
    catalogLessonId: typeof catalogLessonId === 'string' && catalogLessonId.trim() ? catalogLessonId : null,
    lessonId: typeof lessonId === 'string' && lessonId.trim() ? lessonId : null,
    submissionId: typeof submissionId === 'string' && submissionId.trim() ? submissionId : null,
    status: normalizeStatus(rawStatus, isCompleted, grade),
    answerText: typeof answerText === 'string' ? answerText : null,
    attachmentFileName: typeof attachmentFileName === 'string' ? attachmentFileName : null,
    submittedAt: typeof submittedAt === 'string' ? submittedAt : null,
    grade,
    professorFeedback: typeof professorFeedback === 'string' ? professorFeedback : null,
    submissionsCount: typeof submissionsCount === 'number' ? submissionsCount : 0,
    pendingGradingCount: typeof pendingGradingCount === 'number' ? pendingGradingCount : 0,
  };
}

function normalizeSubmission(value: unknown, index: number): StudentSubmissionItem | null {
  if (typeof value !== 'object' || value === null) return null;
  const item = value as Record<string, unknown>;

  const rawId = getField(item, 'id') ?? getField(item, 'submissionId');
  const studentId = getField(item, 'studentId');
  const studentName = getField(item, 'studentName');
  const studentEmail = getField(item, 'studentEmail');
  const answerText = getField(item, 'answerText');
  const attachmentFileName = getField(item, 'attachmentFileName');
  const submittedAt = getField(item, 'submittedAt');
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
    submittedAt: typeof submittedAt === 'string' ? submittedAt : null,
    grade: typeof rawGrade === 'number' ? rawGrade : null,
    professorFeedback: typeof professorFeedback === 'string' ? professorFeedback : null,
  };
}

function formatDateBr(isoDate: string | null): string {
  if (!isoDate) return 'Sem prazo definido';
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return 'Sem prazo definido';
  return date.toLocaleDateString('pt-BR');
}

function isOverdue(assignment: AssignmentItem): boolean {
  if (assignment.status !== 'Pending' || !assignment.dueDate) return false;
  const due = new Date(assignment.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now();
}

export function Assignments() {
  const { user } = useAuth();
  const isProfessor = user?.role?.toUpperCase() === 'PROFESSOR';

  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [bannerSuccess, setBannerSuccess] = useState('');

  // Filtros
  const [activeTab, setActiveTab] = useState<StudentTabFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [lessonFilter, setLessonFilter] = useState('all');

  // Modal Criar/Editar Tarefa (Professor)
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingLegacyLessonId, setEditingLegacyLessonId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [catalogLessonId, setCatalogLessonId] = useState('');
  const [formError, setFormError] = useState('');
  const [isSavingForm, setIsSavingForm] = useState(false);

  // Modal Responder Tarefa (Aluno)
  const [submittingAssignment, setSubmittingAssignment] = useState<AssignmentItem | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [attachmentInfo, setAttachmentInfo] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Modal Ver Entregas e Corrigir (Professor)
  const [gradingAssignment, setGradingAssignment] = useState<AssignmentItem | null>(null);
  const [submissions, setSubmissions] = useState<StudentSubmissionItem[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradeDrafts, setGradeDrafts] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [savingGradeId, setSavingGradeId] = useState<string | null>(null);
  const [gradingMessage, setGradingMessage] = useState('');

  // Estado de abertura de anexo protegido
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  const lessonsById = useMemo(
    () => new Map(COURSE_CATALOG.map((lesson) => [lesson.id, lesson])),
    []
  );

  const sequentialLessons = useMemo(
    () =>
      COURSE_CATALOG.filter((l) => l.isSequential).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    []
  );

  const loadAssignments = async () => {
    setLoadError('');
    try {
      const res = await api.get<unknown>('/Assignment');
      if (!Array.isArray(res.data)) {
        throw new Error('Formato de resposta inválido');
      }
      const normalized = res.data
        .map(normalizeAssignment)
        .filter((item): item is AssignmentItem => item !== null);
      setAssignments(normalized);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      setLoadError('Não foi possível carregar as tarefas no momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const counts = useMemo(() => {
    return {
      all: assignments.length,
      pending: assignments.filter((a) => a.status === 'Pending').length,
      submitted: assignments.filter((a) => a.status === 'Submitted').length,
      graded: assignments.filter((a) => a.status === 'Graded').length,
    };
  }, [assignments]);

  const filteredAssignments = useMemo(() => {
    const query = searchTerm.toLowerCase();

    return assignments.filter((item) => {
      if (!isProfessor) {
        if (activeTab === 'pending' && item.status !== 'Pending') return false;
        if (activeTab === 'submitted' && item.status !== 'Submitted') return false;
        if (activeTab === 'graded' && item.status !== 'Graded') return false;
      }

      if (lessonFilter !== 'all' && item.catalogLessonId !== lessonFilter) {
        return false;
      }

      const lessonTitle = item.catalogLessonId
        ? lessonsById.get(item.catalogLessonId)?.title ?? ''
        : '';

      return (
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        lessonTitle.toLowerCase().includes(query)
      );
    });
  }, [assignments, isProfessor, activeTab, lessonFilter, searchTerm, lessonsById]);

  const handleOpenProtectedAttachment = async (submissionId: string, fileName: string | null) => {
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
        link.download = fileName || 'anexo-tarefa';
        document.body.appendChild(link);
        link.click();
        link.remove();
      }

      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 60_000);
    } catch (err) {
      console.error('Erro ao abrir anexo:', err);
      alert('Não foi possível abrir o arquivo anexado.');
    } finally {
      setOpeningFileId(null);
    }
  };

  // --- AÇÕES DO PROFESSOR: CRIAR / EDITAR / EXCLUIR TAREFA ---
  const handleOpenCreateModal = () => {
    setEditingId(null);
    setEditingLegacyLessonId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setCatalogLessonId(sequentialLessons[0]?.id ?? '');
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (assignment: AssignmentItem) => {
    setEditingId(assignment.id);
    setEditingLegacyLessonId(assignment.lessonId);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDueDate(assignment.dueDate ? assignment.dueDate.split('T')[0] : '');
    setCatalogLessonId(
      assignment.catalogLessonId ?? (assignment.lessonId ? '' : (sequentialLessons[0]?.id ?? ''))
    );
    setFormError('');
    setIsFormModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setBannerSuccess('');

    const effectiveLessonId = catalogLessonId ? null : editingLegacyLessonId;
    if (!catalogLessonId && !effectiveLessonId) {
      setFormError('Selecione uma aula do catálogo para vincular esta tarefa.');
      return;
    }

    setIsSavingForm(true);

    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        dueDate: new Date(`${dueDate}T23:59:59`).toISOString(),
        catalogLessonId: catalogLessonId || null,
        lessonId: effectiveLessonId,
      };

      if (editingId) {
        await api.put(`/Assignment/${editingId}`, payload);
        setBannerSuccess('Tarefa atualizada com sucesso!');
      } else {
        await api.post('/Assignment', payload);
        setBannerSuccess('Nova tarefa publicada com sucesso!');
      }

      setIsFormModalOpen(false);
      await loadAssignments();
    } catch (err) {
      const msg = isAxiosError<ErrorPayload>(err) ? err.response?.data?.message : undefined;
      setFormError(msg || 'Não foi possível salvar a tarefa.');
    } finally {
      setIsSavingForm(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa e suas entregas?')) return;

    try {
      await api.delete(`/Assignment/${id}`);
      setAssignments((prev) => prev.filter((item) => item.id !== id));
      setBannerSuccess('Tarefa excluída com sucesso.');
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      const msg = isAxiosError<ErrorPayload>(err)
        ? err.response?.data?.message ||
          (err.response?.status ? `Erro ${err.response.status} ao excluir a tarefa.` : undefined)
        : undefined;
      alert(msg || 'Não foi possível excluir a tarefa.');
    }
  };

  // --- AÇÕES DO ALUNO: RESPONDER / ENVIAR PDF OU FOTO ---
  const handleOpenSubmitModal = (assignment: AssignmentItem) => {
    setSubmittingAssignment(assignment);
    setAnswerText(assignment.answerText ?? '');
    setSelectedFile(null);
    setAttachmentInfo('');
    setSubmitError('');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSubmitError('');
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
      setSubmitError(err instanceof Error ? err.message : 'Arquivo inválido.');
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    const trimmedAnswer = answerText.trim();
    const hasExistingAttachment = Boolean(submittingAssignment.attachmentFileName);

    if (!trimmedAnswer && !selectedFile && !hasExistingAttachment) {
      setSubmitError('Escreva uma resposta ou anexe um arquivo PDF/Foto antes de enviar.');
      return;
    }

    setSubmitError('');
    setIsSubmittingWork(true);

    try {
      const formData = new FormData();
      if (trimmedAnswer) {
        formData.append('answerText', trimmedAnswer);
      }
      if (selectedFile) {
        formData.append('file', selectedFile);
      }

      await api.post(`/Assignment/${submittingAssignment.id}/submit`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSubmittingAssignment(null);
      setBannerSuccess('Tarefa enviada com sucesso!');
      await loadAssignments();
    } catch (err) {
      const msg = isAxiosError<ErrorPayload>(err) ? err.response?.data?.message : undefined;
      setSubmitError(msg || 'Não foi possível enviar a tarefa. Verifique o arquivo e tente novamente.');
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // --- AÇÕES DO PROFESSOR: LISTAR ENTREGAS E CORRIGIR ---
  const handleOpenGradingModal = async (assignment: AssignmentItem) => {
    setGradingAssignment(assignment);
    setSubmissions([]);
    setGradingMessage('');
    setLoadingSubmissions(true);

    try {
      const res = await api.get<unknown>(`/Assignment/${assignment.id}/submissions`);
      const list = Array.isArray(res.data)
        ? res.data
            .map((item, idx) => normalizeSubmission(item, idx))
            .filter((item): item is StudentSubmissionItem => item !== null)
        : [];

      setSubmissions(list);

      const initialDrafts: Record<string, { grade: string; feedback: string }> = {};
      for (const sub of list) {
        initialDrafts[sub.id] = {
          grade: sub.grade !== null ? String(sub.grade) : '',
          feedback: sub.professorFeedback ?? '',
        };
      }
      setGradeDrafts(initialDrafts);
    } catch (err) {
      console.error('Erro ao carregar entregas:', err);
      setGradingMessage('Não foi possível carregar as entregas dos alunos.');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSaveGrade = async (submissionId: string) => {
    const draft = gradeDrafts[submissionId];
    if (!draft) return;

    const numericGrade = Number(draft.grade.replace(',', '.'));
    if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 10) {
      setGradingMessage('Informe uma nota válida entre 0 e 10.');
      return;
    }

    setSavingGradeId(submissionId);
    setGradingMessage('');

    try {
      await api.post(`/Assignment/submissions/${submissionId}/grade`, {
        grade: numericGrade,
        professorFeedback: draft.feedback.trim() || null,
      });

      setSubmissions((prev) =>
        prev.map((sub) =>
          sub.id === submissionId
            ? {
                ...sub,
                grade: numericGrade,
                professorFeedback: draft.feedback.trim() || null,
              }
            : sub
        )
      );
      setGradingMessage('Avaliação salva com sucesso!');
      await loadAssignments();
    } catch (err) {
      const msg = isAxiosError<ErrorPayload>(err) ? err.response?.data?.message : undefined;
      setGradingMessage(msg || 'Erro ao salvar a nota.');
    } finally {
      setSavingGradeId(null);
    }
  };

  if (loading) {
    return <div style={{ padding: '2rem', fontWeight: 'bold' }}>Carregando tarefas...</div>;
  }

  return (
    <div style={{ maxWidth: '1050px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* CABEÇALHO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1
            style={{
              fontSize: '2rem',
              color: 'var(--text-main)',
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
            }}
          >
            {isProfessor ? 'Gerenciamento de Tarefas' : 'Minhas Tarefas'}
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            {isProfessor
              ? 'Crie atividades vinculadas às aulas, visualize anexos e lance notas.'
              : 'Acompanhe suas atividades, envie respostas ou anexos (PDF/Foto) e veja suas notas.'}
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
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-subtitle)',
            }}
          >
            <PlusCircle size={18} />
            Nova Tarefa
          </button>
        )}
      </div>

      {bannerSuccess && (
        <div
          role="status"
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#DCFCE7',
            color: '#166534',
            border: '2px solid #166534',
            fontWeight: 700,
          }}
        >
          {bannerSuccess}
        </div>
      )}

      {loadError && (
        <div
          role="alert"
          style={{
            marginBottom: '1.25rem',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            border: '2px solid #DC2626',
            fontWeight: 700,
          }}
        >
          {loadError}
        </div>
      )}

      {/* BARRA DE ABAS (ALUNO) + BUSCA E FILTRO POR AULA */}
      <div
        className="doodle-card"
        style={{
          backgroundColor: '#FDFBF7',
          border: '2.5px solid #181818',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '4px 4px 0px #181818',
          marginBottom: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {!isProfessor && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
            {(
              [
                { key: 'all', label: `Todas (${counts.all})` },
                { key: 'pending', label: `Pendentes (${counts.pending})` },
                { key: 'submitted', label: `Entregues (${counts.submitted})` },
                { key: 'graded', label: `Avaliadas (${counts.graded})` },
              ] as const
            ).map((tab) => {
              const isSelected = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    backgroundColor: isSelected ? '#181818' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#181818',
                    border: '2px solid #181818',
                    borderRadius: '999px',
                    padding: '0.45rem 1rem',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'none' : '2px 2px 0px #181818',
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '0.85rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              border: '2px solid #181818',
              borderRadius: '10px',
              padding: '0.5rem 0.85rem',
            }}
          >
            <Search size={18} color="#555" style={{ marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Buscar tarefa por título ou instrução..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                width: '100%',
                fontSize: '0.9rem',
                backgroundColor: 'transparent',
              }}
            />
          </div>

          <select
            aria-label="Filtrar tarefas por aula"
            value={lessonFilter}
            onChange={(e) => setLessonFilter(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              border: '2px solid #181818',
              backgroundColor: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 600,
              color: '#181818',
            }}
          >
            <option value="all">Todas as aulas vinculadas</option>
            {sequentialLessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* GRADE DE CARDS DE TAREFAS */}
      {filteredAssignments.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '1.35rem',
          }}
        >
          {filteredAssignments.map((assignment) => {
            const linkedLesson = assignment.catalogLessonId
              ? lessonsById.get(assignment.catalogLessonId)
              : undefined;
            const overdue = !isProfessor && isOverdue(assignment);

            return (
              <div
                key={assignment.id}
                className="doodle-card"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '2.5px solid #181818',
                  borderRadius: '14px',
                  padding: '1.35rem',
                  boxShadow: '4px 4px 0px #181818',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                {/* Topo: Aula vinculada + Status/Prazo */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  {linkedLesson ? (
                    <Link
                      to={`/lesson/${encodeURIComponent(linkedLesson.id)}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: '#F4EFE6',
                        color: '#181818',
                        border: '1.5px solid #181818',
                        borderRadius: '999px',
                        padding: '0.2rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        textDecoration: 'none',
                      }}
                    >
                      <BookOpen size={13} />
                      <span>{linkedLesson.title}</span>
                    </Link>
                  ) : (
                    <span
                      style={{
                        backgroundColor: '#F4EFE6',
                        border: '1.5px solid #181818',
                        borderRadius: '999px',
                        padding: '0.2rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      Atividade Vinculada
                    </span>
                  )}

                  {!isProfessor && (
                    <span
                      style={{
                        backgroundColor:
                          assignment.status === 'Graded'
                            ? '#DCFCE7'
                            : assignment.status === 'Submitted'
                              ? '#DBEAFE'
                              : overdue
                                ? '#FEE2E2'
                                : '#FEF3C7',
                        color:
                          assignment.status === 'Graded'
                            ? '#166534'
                            : assignment.status === 'Submitted'
                              ? '#1E40AF'
                              : overdue
                                ? '#DC2626'
                                : '#92400E',
                        border: '1.5px solid #181818',
                        borderRadius: '999px',
                        padding: '0.2rem 0.65rem',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                      }}
                    >
                      {assignment.status === 'Graded'
                        ? `Nota: ${assignment.grade}/10`
                        : assignment.status === 'Submitted'
                          ? 'Aguardando Correção'
                          : overdue
                            ? 'Prazo Encerrado'
                            : 'Pendente'}
                    </span>
                  )}
                </div>

                {/* Título e Descrição */}
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.15rem', color: '#181818', margin: '0 0 0.35rem 0' }}>
                    {assignment.title}
                  </h3>
                  <p style={{ color: '#444444', fontSize: '0.9rem', margin: 0, lineHeight: 1.45 }}>
                    {assignment.description}
                  </p>
                </div>

                {/* Data Limite */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.83rem',
                    fontWeight: 700,
                    color: overdue ? '#DC2626' : '#555555',
                  }}
                >
                  <Calendar size={15} />
                  <span>Entrega até: {formatDateBr(assignment.dueDate)}</span>
                </div>

                {/* Resumo da entrega do aluno (se já enviada) */}
                {!isProfessor && assignment.status !== 'Pending' && (
                  <div
                    style={{
                      backgroundColor: '#FDFBF7',
                      border: '1.5px solid #D6C7B2',
                      borderRadius: '10px',
                      padding: '0.75rem',
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.45rem',
                    }}
                  >
                    {assignment.answerText && (
                      <p style={{ margin: 0, color: '#181818' }}>
                        <strong>Sua resposta:</strong> {assignment.answerText}
                      </p>
                    )}

                    {assignment.attachmentFileName && assignment.submissionId && (
                      <button
                        type="button"
                        disabled={openingFileId === assignment.submissionId}
                        onClick={() =>
                          handleOpenProtectedAttachment(
                            assignment.submissionId!,
                            assignment.attachmentFileName
                          )
                        }
                        style={{
                          alignSelf: 'flex-start',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          backgroundColor: '#FFFFFF',
                          border: '1.5px solid #181818',
                          borderRadius: '6px',
                          padding: '0.3rem 0.6rem',
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        <FileText size={14} />
                        <span>
                          {openingFileId === assignment.submissionId
                            ? 'Abrindo...'
                            : assignment.attachmentFileName}
                        </span>
                        <ExternalLink size={12} />
                      </button>
                    )}

                    {assignment.status === 'Graded' && assignment.professorFeedback && (
                      <div
                        style={{
                          marginTop: '0.25rem',
                          paddingTop: '0.45rem',
                          borderTop: '1px dashed #D6C7B2',
                          color: '#166534',
                        }}
                      >
                        <strong>Comentário do Professor:</strong> {assignment.professorFeedback}
                      </div>
                    )}
                  </div>
                )}

                {/* Rodapé de Ações */}
                {isProfessor ? (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '0.5rem',
                      paddingTop: '0.5rem',
                      borderTop: '1.5px solid #F4EFE6',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleOpenGradingModal(assignment)}
                      style={{
                        flex: 1,
                        backgroundColor: '#181818',
                        color: '#FFFFFF',
                        border: '2px solid #181818',
                        borderRadius: '8px',
                        padding: '0.55rem 0.85rem',
                        fontWeight: 800,
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      <Users size={16} />
                      <span>
                        Entregas ({assignment.submissionsCount})
                        {assignment.pendingGradingCount > 0
                          ? ` • ${assignment.pendingGradingCount} pendente(s)`
                          : ''}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(assignment)}
                      title="Editar Tarefa"
                      style={{
                        backgroundColor: '#FEF08A',
                        border: '2px solid #181818',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      title="Excluir Tarefa"
                      style={{
                        backgroundColor: '#FEE2E2',
                        border: '2px solid #181818',
                        borderRadius: '8px',
                        padding: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <button
                      type="button"
                      onClick={() => handleOpenSubmitModal(assignment)}
                      style={{
                        width: '100%',
                        backgroundColor:
                          assignment.status === 'Pending' ? 'var(--brand-red)' : '#FFFFFF',
                        color: assignment.status === 'Pending' ? '#FFFFFF' : '#181818',
                        border: '2px solid #181818',
                        borderRadius: '8px',
                        padding: '0.65rem 1rem',
                        fontWeight: 800,
                        fontSize: '0.88rem',
                        cursor: 'pointer',
                        boxShadow: '2px 2px 0px #181818',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.45rem',
                      }}
                    >
                      {assignment.status === 'Pending' ? (
                        <>
                          <Send size={16} />
                          <span>Responder Tarefa</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          <span>
                            {assignment.status === 'Graded' ? 'Reenviar / Atualizar' : 'Editar Entrega'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="doodle-card"
          style={{
            padding: '3rem 1.5rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            border: '2px dashed #181818',
            borderRadius: '14px',
          }}
        >
          <Clock size={40} color="#181818" style={{ opacity: 0.25, margin: '0 auto 0.75rem' }} />
          <h3 style={{ margin: '0 0 0.35rem 0', color: '#181818' }}>Nenhuma tarefa encontrada</h3>
          <p style={{ margin: 0, color: '#555555', fontSize: '0.92rem' }}>
            Não há atividades correspondentes aos filtros selecionados.
          </p>
        </div>
      )}

      {/* MODAL DO ALUNO: ENVIAR RESPOSTA / PDF / FOTO */}
      {submittingAssignment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              boxShadow: '6px 6px 0px #181818',
              padding: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setSubmittingAssignment(null)}
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

            <h2 style={{ marginTop: 0, marginBottom: '0.35rem' }}>{submittingAssignment.title}</h2>
            <p style={{ color: '#555555', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {submittingAssignment.description}
            </p>

            {submitError && (
              <div
                role="alert"
                style={{
                  marginBottom: '1rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1.5px solid #DC2626',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                }}
              >
                <AlertCircle size={17} />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitWork}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="student-answer-text"
                  style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}
                >
                  Sua resposta ou link de apoio
                </label>
                <textarea
                  id="student-answer-text"
                  rows={4}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Escreva aqui as frases, respostas dos exercícios ou cole um link..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    fontFamily: 'inherit',
                    fontSize: '0.95rem',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="student-attachment-file"
                  style={{ display: 'block', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.4rem' }}
                >
                  Anexar PDF ou Foto da atividade (opcional • máx. 5 MB)
                </label>

                <label
                  htmlFor="student-attachment-file"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.55rem',
                    padding: '0.9rem',
                    border: '2px dashed #181818',
                    borderRadius: '10px',
                    backgroundColor: '#FDFBF7',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                  }}
                >
                  <Upload size={18} color="var(--brand-red)" />
                  <span>
                    {selectedFile
                      ? selectedFile.name
                      : submittingAssignment.attachmentFileName
                        ? `Substituir arquivo atual (${submittingAssignment.attachmentFileName})`
                        : 'Selecionar PDF, JPG, PNG ou WEBP'}
                  </span>
                </label>
                <input
                  id="student-attachment-file"
                  type="file"
                  accept=".pdf,image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
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
                  onClick={() => setSubmittingAssignment(null)}
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
                  disabled={isSubmittingWork}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: 'var(--brand-red)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: isSubmittingWork ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSubmittingWork ? 'Enviando...' : 'Enviar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO PROFESSOR: CRIAR / EDITAR TAREFA */}
      {isFormModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '560px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              boxShadow: '6px 6px 0px #181818',
              padding: '1.5rem',
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

            <h2 style={{ marginTop: 0 }}>{editingId ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>

            {formError && (
              <div
                role="alert"
                style={{
                  marginBottom: '1rem',
                  padding: '0.7rem',
                  borderRadius: '8px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1.5px solid #DC2626',
                  fontWeight: 700,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAssignment}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  Título da Tarefa
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Homework — Verb To Be (Afirmativo)"
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
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  Instruções para o Aluno
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o exercício ou peça o envio de foto/PDF..."
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  Aula Vinculada (Catálogo First Step)
                </label>
                <select
                  required={!editingLegacyLessonId}
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
                  {editingLegacyLessonId && (
                    <option value="">Manter vínculo original da aula</option>
                  )}
                  {sequentialLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title} — {lesson.theme}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontWeight: 700, fontSize: '0.88rem', marginBottom: '0.35rem' }}>
                  Data Limite de Entrega
                </label>
                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                  }}
                />
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
                  disabled={isSavingForm}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: 'var(--brand-red)',
                    color: '#FFFFFF',
                    fontWeight: 800,
                    cursor: isSavingForm ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSavingForm ? 'Salvando...' : 'Salvar Tarefa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DO PROFESSOR: VISUALIZAR ENTREGAS E DAR NOTA */}
      {gradingAssignment && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              boxShadow: '6px 6px 0px #181818',
              padding: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setGradingAssignment(null)}
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

            <h2 style={{ marginTop: 0, marginBottom: '0.25rem' }}>
              Entregas — {gradingAssignment.title}
            </h2>
            <p style={{ color: '#555555', fontSize: '0.88rem', marginBottom: '1rem' }}>
              Abra os anexos enviados pelos alunos e atribua a nota (0 a 10).
            </p>

            {gradingMessage && (
              <div
                role="status"
                style={{
                  marginBottom: '1rem',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  backgroundColor: '#F4EFE6',
                  border: '1.5px solid #181818',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                }}
              >
                {gradingMessage}
              </div>
            )}

            {loadingSubmissions ? (
              <p>Carregando entregas...</p>
            ) : submissions.length === 0 ? (
              <div
                style={{
                  padding: '2rem',
                  textAlign: 'center',
                  border: '1.5px dashed #999',
                  borderRadius: '10px',
                  color: '#555555',
                }}
              >
                Nenhum aluno enviou esta tarefa ainda.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {submissions.map((sub) => {
                  const draft = gradeDrafts[sub.id] ?? { grade: '', feedback: '' };
                  return (
                    <div
                      key={sub.id}
                      style={{
                        border: '2px solid #181818',
                        borderRadius: '10px',
                        padding: '1rem',
                        backgroundColor: '#FDFBF7',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: '0.5rem',
                        }}
                      >
                        <div>
                          <strong style={{ fontSize: '1rem', color: '#181818' }}>
                            {sub.studentName}
                          </strong>
                          {sub.studentEmail && (
                            <span style={{ color: '#555555', fontSize: '0.82rem', marginLeft: '0.5rem' }}>
                              ({sub.studentEmail})
                            </span>
                          )}
                        </div>

                        {sub.grade !== null && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              border: '1.5px solid #166534',
                              borderRadius: '999px',
                              padding: '0.15rem 0.65rem',
                              fontSize: '0.78rem',
                              fontWeight: 800,
                            }}
                          >
                            <Award size={14} />
                            Avaliada: {sub.grade}/10
                          </span>
                        )}
                      </div>

                      {sub.answerText && (
                        <div
                          style={{
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #E2D7C5',
                            borderRadius: '8px',
                            padding: '0.65rem 0.85rem',
                            fontSize: '0.9rem',
                          }}
                        >
                          {sub.answerText}
                        </div>
                      )}

                      {sub.attachmentFileName && (
                        <div>
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
                              padding: '0.45rem 0.8rem',
                              fontWeight: 700,
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              boxShadow: '2px 2px 0px #181818',
                            }}
                          >
                            <FileText size={16} color="var(--brand-red)" />
                            <span>
                              {openingFileId === sub.id
                                ? 'Abrindo anexo...'
                                : `Visualizar / Baixar: ${sub.attachmentFileName}`}
                            </span>
                            <ExternalLink size={14} />
                          </button>
                        </div>
                      )}

                      {/* Formulário de Nota e Feedback */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '110px 1fr auto',
                          gap: '0.6rem',
                          alignItems: 'center',
                          paddingTop: '0.5rem',
                          borderTop: '1px dashed #D6C7B2',
                        }}
                      >
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="10"
                          aria-label={`Nota de ${sub.studentName}`}
                          placeholder="Nota (0-10)"
                          value={draft.grade}
                          onChange={(e) =>
                            setGradeDrafts((prev) => ({
                              ...prev,
                              [sub.id]: { ...draft, grade: e.target.value },
                            }))
                          }
                          style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            border: '2px solid #181818',
                            fontWeight: 700,
                          }}
                        />

                        <input
                          type="text"
                          aria-label={`Comentário para ${sub.studentName}`}
                          placeholder="Comentário de correção (opcional)..."
                          value={draft.feedback}
                          onChange={(e) =>
                            setGradeDrafts((prev) => ({
                              ...prev,
                              [sub.id]: { ...draft, feedback: e.target.value },
                            }))
                          }
                          style={{
                            padding: '0.5rem 0.7rem',
                            borderRadius: '6px',
                            border: '2px solid #181818',
                          }}
                        />

                        <button
                          type="button"
                          disabled={savingGradeId === sub.id}
                          onClick={() => handleSaveGrade(sub.id)}
                          style={{
                            backgroundColor: 'var(--brand-red)',
                            color: '#FFFFFF',
                            border: '2px solid #181818',
                            borderRadius: '6px',
                            padding: '0.5rem 0.9rem',
                            fontWeight: 800,
                            cursor: 'pointer',
                          }}
                        >
                          {savingGradeId === sub.id ? 'Salvando...' : 'Salvar Nota'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}