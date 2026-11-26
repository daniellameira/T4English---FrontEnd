import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { ProfessorDashboardApiResponse, ProfessorDashboardData } from '../types/dashboard';
import { professorDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { COURSE_CATALOG, getCourseProgressSummary } from '../data/courseCatalog';
import {
  calculateStudentEngagement,
  type EngagementBreakdown,
  type StudentAssignmentActivity,
  type StudentLessonActivity,
} from '../utils/studentEngagement';
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  FileCheck,
  Search,
  BookOpen,
  CircleAlert,
  MessageSquare,
  Calendar,
  Filter,
  BarChart3,
  FileCheck2,
  Award,
  X,
} from 'lucide-react';

interface CatalogLessonFeedbackItem {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  catalogLessonId: string;
  feedback: string;
  completedAt: string | null;
}

interface AssignmentMeta {
  id: string;
  title: string;
  dueDate?: string | null;
}

interface AssignmentSubmissionRecord {
  assignmentId: string;
  studentId: string;
  submittedAt?: string | null;
  grade?: number | null;
}

type SituationFilter = 'all' | 'in_good_standing' | 'new_student' | 'needs_attention';

function getApiField(value: Record<string, unknown>, fieldName: string): unknown {
  const field = Object.keys(value).find((key) => key.toLowerCase() === fieldName.toLowerCase());
  return field === undefined ? undefined : value[field];
}

function normalizeCatalogFeedback(value: unknown, index: number): CatalogLessonFeedbackItem | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const record = value as Record<string, unknown>;
  const rawId = getApiField(record, 'id');
  const studentId = getApiField(record, 'studentId');
  const studentName = getApiField(record, 'studentName');
  const studentEmail = getApiField(record, 'studentEmail');
  const catalogLessonId = getApiField(record, 'catalogLessonId');
  const feedback = getApiField(record, 'feedback');
  const rawDate =
    getApiField(record, 'completedAt') ??
    getApiField(record, 'createdAt') ??
    getApiField(record, 'submittedAt');

  if (typeof studentId !== 'string' || typeof catalogLessonId !== 'string') {
    return null;
  }

  return {
    id:
      typeof rawId === 'string' && rawId.trim()
        ? rawId
        : `${studentId}-${catalogLessonId}-${index}`,
    studentId,
    studentName: typeof studentName === 'string' && studentName.trim() ? studentName : 'Aluno',
    studentEmail: typeof studentEmail === 'string' ? studentEmail : '',
    catalogLessonId,
    feedback: typeof feedback === 'string' ? feedback.trim() : '',
    completedAt: typeof rawDate === 'string' ? rawDate : null,
  };
}

function formatFeedbackDate(isoDate: string | null): string {
  if (!isoDate) return 'Data não informada';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) return 'Data não informada';

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsed);
}

function isProfessorDashboardApiResponse(value: unknown): value is ProfessorDashboardApiResponse {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Partial<ProfessorDashboardApiResponse>;
  return (
    typeof candidate.totalActiveStudents === 'number' &&
    typeof candidate.studentsAtRiskCount === 'number' &&
    typeof candidate.pendingGradingCount === 'number' &&
    Array.isArray(candidate.studentsSummary) &&
    candidate.studentsSummary.every(
      (student) =>
        typeof student.studentId === 'string' &&
        typeof student.name === 'string' &&
        typeof student.email === 'string' &&
        typeof student.attendancePercentage === 'number' &&
        typeof student.isAtRisk === 'boolean' &&
        (typeof student.averageGrade === 'number' || student.averageGrade === null),
    )
  );
}

export function ProfessorDashboard() {
  const [data, setData] = useState<ProfessorDashboardData>(professorDashboardMock);
  const [catalogProgressEntries, setCatalogProgressEntries] = useState<CatalogLessonFeedbackItem[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<AssignmentMeta[]>([]);
  const [submissionsRecords, setSubmissionsRecords] = useState<AssignmentSubmissionRecord[]>([]);

  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [feedbacksError, setFeedbacksError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState('');
  const [situationFilter, setSituationFilter] = useState<SituationFilter>('all');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');

  const [engagementModalTarget, setEngagementModalTarget] = useState<{
    studentName: string;
    breakdown: EngagementBreakdown;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const response = await api.get<unknown>('/Dashboard/professor');
        if (!isProfessorDashboardApiResponse(response.data)) {
          throw new Error('A resposta do dashboard do professor tem um formato inválido.');
        }
        if (!cancelled) {
          setData({
            totalStudents: response.data.totalActiveStudents,
            studentsAtRiskCount: response.data.studentsAtRiskCount,
            pendingGradingCount: response.data.pendingGradingCount,
            students: response.data.studentsSummary.map((student) => ({
              id: student.studentId,
              name: student.name,
              email: student.email,
              attendancePercentage: student.attendancePercentage,
              isAtRisk: student.isAtRisk,
              averageGrade: student.averageGrade,
            })),
          });
          setUsingMock(false);
        }
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    async function loadCatalogFeedbacks() {
      try {
        const response = await api.get<unknown>('/Lesson/catalog/feedbacks');
        if (!Array.isArray(response.data)) {
          throw new Error('A resposta de feedbacks tem um formato inválido.');
        }

        const normalized = response.data
          .map((item, idx) => normalizeCatalogFeedback(item, idx))
          .filter((item): item is CatalogLessonFeedbackItem => item !== null);

        if (!cancelled) {
          setCatalogProgressEntries(normalized);
          setFeedbacksError(false);
        }
      } catch (err) {
        console.error('Erro ao carregar feedbacks das aulas:', err);
        if (!cancelled) {
          setFeedbacksError(true);
        }
      } finally {
        if (!cancelled) {
          setFeedbacksLoading(false);
        }
      }
    }

    async function loadAssignmentsAndSubmissions() {
      try {
        const assignmentsRes = await api.get<unknown>('/Assignment').catch(() => null);
        if (!assignmentsRes?.data || !Array.isArray(assignmentsRes.data)) {
          return;
        }

        const parsedAssignments: AssignmentMeta[] = [];
        for (const raw of assignmentsRes.data) {
          if (typeof raw === 'object' && raw !== null) {
            const item = raw as Record<string, unknown>;
            const id = getApiField(item, 'id');
            const title = getApiField(item, 'title');
            const dueDate = getApiField(item, 'dueDate');
            if (typeof id === 'string') {
              parsedAssignments.push({
                id,
                title: typeof title === 'string' ? title : 'Tarefa',
                dueDate: typeof dueDate === 'string' ? dueDate : null,
              });
            }
          }
        }

        if (cancelled) return;
        setAssignmentsList(parsedAssignments);

        if (parsedAssignments.length === 0) {
          setSubmissionsRecords([]);
          return;
        }

        const submissionsResponses = await Promise.all(
          parsedAssignments.map((assignment) =>
            api
              .get<unknown>(`/Assignment/${assignment.id}/submissions`)
              .then((res) => ({ assignmentId: assignment.id, data: res.data }))
              .catch(() => null)
          )
        );

        const allSubs: AssignmentSubmissionRecord[] = [];
        for (const entry of submissionsResponses) {
          if (!entry || !Array.isArray(entry.data)) continue;
          for (const rawSub of entry.data) {
            if (typeof rawSub === 'object' && rawSub !== null) {
              const subObj = rawSub as Record<string, unknown>;
              const studentId = getApiField(subObj, 'studentId');
              const submittedAt = getApiField(subObj, 'submittedAt');
              const rawGrade = getApiField(subObj, 'grade');
              if (typeof studentId === 'string') {
                allSubs.push({
                  assignmentId: entry.assignmentId,
                  studentId,
                  submittedAt: typeof submittedAt === 'string' ? submittedAt : null,
                  grade: typeof rawGrade === 'number' ? rawGrade : null,
                });
              }
            }
          }
        }

        if (!cancelled) {
          setSubmissionsRecords(allSubs);
        }
      } catch (err) {
        console.error('Erro ao carregar tarefas para assiduidade:', err);
      }
    }

    loadDashboard();
    loadCatalogFeedbacks();
    loadAssignmentsAndSubmissions();

    return () => {
      cancelled = true;
    };
  }, []);

  const lessonsById = useMemo(
    () => new Map(COURSE_CATALOG.map((lesson) => [lesson.id, lesson])),
    []
  );

  // Agrupa aulas concluídas por aluno
  const lessonsByStudent = useMemo(() => {
    const map = new Map<string, StudentLessonActivity[]>();
    for (const entry of catalogProgressEntries) {
      const list = map.get(entry.studentId) ?? [];
      if (!list.some((item) => item.catalogLessonId === entry.catalogLessonId)) {
        list.push({
          catalogLessonId: entry.catalogLessonId,
          completedAt: entry.completedAt,
        });
      }
      map.set(entry.studentId, list);
    }
    return map;
  }, [catalogProgressEntries]);

  const students = Array.isArray(data.students) ? data.students : [];

  // Calcula a assiduidade automática de cada aluno
  const engagementByStudentId = useMemo(() => {
    const totalCatalogLessons = COURSE_CATALOG.filter((l) => l.isSequential).length || 47;
    const map = new Map<string, EngagementBreakdown>();

    for (const student of students) {
      const studentLessons = lessonsByStudent.get(student.id) ?? [];
      const studentSubs = submissionsRecords.filter((s) => s.studentId === student.id);

      const studentAssignments: StudentAssignmentActivity[] = assignmentsList.map((assignment) => {
        const sub = studentSubs.find((s) => s.assignmentId === assignment.id);
        return {
          assignmentId: assignment.id,
          dueDate: assignment.dueDate,
          isSubmitted: Boolean(sub),
          grade: sub?.grade ?? null,
        };
      });

      map.set(
        student.id,
        calculateStudentEngagement({
          lessons: studentLessons,
          assignments: studentAssignments,
          totalCatalogLessons,
        })
      );
    }

    return map;
  }, [students, lessonsByStudent, assignmentsList, submissionsRecords]);

  // Enriquecimento de cada aluno combinando dados reais ou fallback do mock
  const enrichedStudents = useMemo(() => {
    return students.map((student) => {
      const breakdown =
        engagementByStudentId.get(student.id) ??
        calculateStudentEngagement({ lessons: [], assignments: [] });

      const effectiveScore = usingMock ? student.attendancePercentage : breakdown.score;
      const isBelow75 = effectiveScore < 75;

      let situationText = 'Em dia';
      let situationTone: 'green' | 'blue' | 'yellow' | 'red' = 'green';

      if (usingMock) {
        if (student.isAtRisk || effectiveScore < 75) {
          situationText = 'Atenção';
          situationTone = 'red';
        }
      } else if (breakdown.statusLabel === 'Recém-matriculado') {
        situationText = 'Recém-matriculado';
        situationTone = 'blue';
      } else if (breakdown.statusLabel === 'Em Risco') {
        situationText = 'Em risco';
        situationTone = 'red';
      } else if (breakdown.statusLabel === 'Atenção') {
        situationText = 'Atenção';
        situationTone = 'yellow';
      }

      return {
        ...student,
        breakdown,
        effectiveScore,
        isBelow75,
        situationText,
        situationTone,
      };
    });
  }, [students, engagementByStudentId, usingMock]);

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase();

    return enrichedStudents.filter((student) => {
      const matchesQuery =
        student.name.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query);

      if (!matchesQuery) return false;

      if (situationFilter === 'all') return true;
      if (situationFilter === 'new_student') return student.situationTone === 'blue';
      if (situationFilter === 'in_good_standing') return student.situationTone === 'green';
      if (situationFilter === 'needs_attention') {
        return student.situationTone === 'yellow' || student.situationTone === 'red';
      }
      return true;
    });
  }, [enrichedStudents, search, situationFilter]);

  const averageAttendance = enrichedStudents.length
    ? Math.round(
        enrichedStudents.reduce((total, student) => total + student.effectiveScore, 0) /
          enrichedStudents.length
      )
    : null;

  const studentsBelowRecommended = useMemo(() => {
    if (usingMock) {
      return data.studentsAtRiskCount || 0;
    }
    return enrichedStudents.filter((s) => s.isBelow75).length;
  }, [usingMock, data.studentsAtRiskCount, enrichedStudents]);

  // Progresso médio da turma nas 47 lições sequenciais
  const computedClassLessonsPercentage = useMemo(() => {
    if (data.completedLessonsPercentage !== undefined) {
      return data.completedLessonsPercentage;
    }
    if (students.length === 0 || catalogProgressEntries.length === 0) {
      return undefined;
    }

    const totalPercentage = students.reduce((acc, student) => {
      const completedIds = (lessonsByStudent.get(student.id) ?? []).map((l) => l.catalogLessonId);
      return acc + getCourseProgressSummary(completedIds).percentage;
    }, 0);

    return Math.round(totalPercentage / students.length);
  }, [
    data.completedLessonsPercentage,
    students,
    catalogProgressEntries.length,
    lessonsByStudent,
  ]);

  // Apenas entradas que possuem texto de feedback preenchido
  const feedbackEntries = useMemo(
    () => catalogProgressEntries.filter((entry) => entry.feedback.length > 0),
    [catalogProgressEntries]
  );

  const feedbackStudentOptions = useMemo(() => {
    const unique = new Map<string, string>();
    for (const student of students) {
      unique.set(student.id, student.name);
    }
    for (const entry of feedbackEntries) {
      if (!unique.has(entry.studentId)) {
        unique.set(entry.studentId, entry.studentName);
      }
    }
    return Array.from(unique.entries()).map(([id, name]) => ({ id, name }));
  }, [students, feedbackEntries]);

  const filteredFeedbacks = useMemo(() => {
    const searchLower = feedbackSearch.toLowerCase();

    return feedbackEntries.filter((entry) => {
      const matchesStudent =
        selectedStudentFilter === 'all' || entry.studentId === selectedStudentFilter;

      const lessonTitle = lessonsById.get(entry.catalogLessonId)?.title ?? entry.catalogLessonId;
      const matchesSearch =
        entry.studentName.toLowerCase().includes(searchLower) ||
        lessonTitle.toLowerCase().includes(searchLower) ||
        entry.feedback.toLowerCase().includes(searchLower);

      return matchesStudent && matchesSearch;
    });
  }, [feedbackEntries, selectedStudentFilter, feedbackSearch, lessonsById]);

  const getBadgeStyle = (tone: 'green' | 'blue' | 'yellow' | 'red') => {
    if (tone === 'red') return { bg: '#FEE2E2', text: '#DC2626' };
    if (tone === 'yellow') return { bg: '#FEF3C7', text: '#92400E' };
    if (tone === 'blue') return { bg: '#DBEAFE', text: '#1D4ED8' };
    return { bg: '#DCFCE7', text: '#166534' };
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#181818', marginBottom: '0.5rem', fontWeight: 700 }}>
          Painel do Professor
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Acompanhe o progresso e a participação da sua turma.
        </p>
      </div>

      <div
        className={`dashboard-data-notice${loadError ? ' dashboard-data-notice--error' : ''}`}
        role={loadError ? 'alert' : 'status'}
      >
        {loadError ? <CircleAlert size={18} /> : <FileCheck size={18} />}
        <span>
          {usingMock
            ? loadError
              ? 'Não foi possível carregar os dados reais. Exibindo métricas demonstrativas.'
              : loading
                ? 'Carregando dados reais; as métricas demonstrativas aparecem enquanto isso.'
                : 'Métricas demonstrativas: aguardando conexão com os serviços reais.'
            : 'Métricas atualizadas com os dados da plataforma.'}
        </span>
      </div>

      <section className="dashboard-metrics" aria-label="Métricas da turma">
        <DashboardMetricCard
          label="Alunos acompanhados"
          value={String(data.totalStudents)}
          description="Alunos ativos na sua turma."
          icon={Users}
          tone="beige"
        />
        <DashboardMetricCard
          label="Assiduidade média"
          value={averageAttendance === null ? '—' : `${averageAttendance}%`}
          description={`${studentsBelowRecommended} aluno(s) abaixo da assiduidade recomendada de 75%.`}
          icon={studentsBelowRecommended > 0 ? AlertTriangle : ShieldCheck}
          tone={studentsBelowRecommended > 0 ? 'red' : 'green'}
          progress={averageAttendance ?? undefined}
        />
        <DashboardMetricCard
          label="Lições concluídas"
          value={
            computedClassLessonsPercentage === undefined ? '—' : `${computedClassLessonsPercentage}%`
          }
          description={
            computedClassLessonsPercentage === undefined
              ? 'Aguardando este dado no serviço do dashboard.'
              : 'Progresso médio da turma no módulo First Step.'
          }
          icon={BookOpen}
          tone="yellow"
          progress={computedClassLessonsPercentage}
        />
        <DashboardMetricCard
          label="Tarefas para corrigir"
          value={String(data.pendingGradingCount)}
          description="Envios aguardando avaliação."
          icon={FileCheck}
          tone="red"
        />
      </section>

      {/* Tabela de Alunos com Progresso na Trilha e Assiduidade Automática */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2D7C5',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <h2 style={{ fontSize: '1.2rem', color: '#181818', fontWeight: 600 }}>
            Acompanhamento dos Alunos
          </h2>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <select
              aria-label="Filtrar alunos por situação"
              value={situationFilter}
              onChange={(e) => setSituationFilter(e.target.value as SituationFilter)}
              style={{
                border: '1px solid #E2D7C5',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#FDFBF7',
                fontSize: '0.875rem',
                color: '#181818',
                cursor: 'pointer',
              }}
            >
              <option value="all">Todas as situações</option>
              <option value="in_good_standing">Em dia</option>
              <option value="new_student">Recém-matriculados</option>
              <option value="needs_attention">Atenção / Em risco</option>
            </select>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E2D7C5',
                borderRadius: '6px',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#FDFBF7',
                width: '260px',
              }}
            >
              <Search size={18} color="#555555" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.875rem',
                  color: '#181818',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F4EFE6', color: '#555555', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>ALUNO</th>
                <th style={{ padding: '0.75rem' }}>E-MAIL</th>
                <th style={{ padding: '0.75rem' }}>PROGRESSO (FIRST STEP)</th>
                <th style={{ padding: '0.75rem' }}>ASSIDUIDADE</th>
                <th style={{ padding: '0.75rem' }}>SITUAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const studentCompletedIds = (lessonsByStudent.get(student.id) ?? []).map(
                    (l) => l.catalogLessonId
                  );
                  const progress = getCourseProgressSummary(studentCompletedIds);
                  const scoreColors =
                    student.effectiveScore < 60
                      ? { bg: '#FEE2E2', text: '#DC2626' }
                      : student.effectiveScore < 80
                        ? { bg: '#FEF3C7', text: '#92400E' }
                        : { bg: '#DCFCE7', text: '#166534' };
                  const situationColors = getBadgeStyle(student.situationTone);

                  return (
                    <tr
                      key={student.id}
                      style={{ borderBottom: '1px solid #F4EFE6', fontSize: '0.9rem' }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#181818' }}>
                        {student.name}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#555555' }}>
                        {student.email}
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', minWidth: '210px' }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: '#181818',
                            marginBottom: '0.3rem',
                          }}
                        >
                          <span>
                            {progress.completedCount}/{progress.totalLessons} aulas
                          </span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '7px',
                            backgroundColor: '#F4EFE6',
                            borderRadius: '999px',
                            overflow: 'hidden',
                            marginBottom: '0.3rem',
                          }}
                        >
                          <div
                            style={{
                              width: `${progress.percentage}%`,
                              height: '100%',
                              backgroundColor: 'var(--brand-red)',
                              borderRadius: '999px',
                            }}
                          />
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#555555' }}>
                          {progress.isCourseCompleted
                            ? 'Trilha concluída'
                            : `Atual: ${progress.nextLesson?.title ?? '—'}`}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <button
                          type="button"
                          onClick={() =>
                            setEngagementModalTarget({
                              studentName: student.name,
                              breakdown: student.breakdown,
                            })
                          }
                          title="Clique para ver o detalhamento de aulas e tarefas"
                          style={{
                            backgroundColor: scoreColors.bg,
                            color: scoreColors.text,
                            border: `1.5px solid ${scoreColors.text}`,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span>{student.effectiveScore}%</span>
                          <BarChart3 size={13} />
                        </button>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#181818', fontWeight: 500 }}>
                        <span
                          style={{
                            backgroundColor: situationColors.bg,
                            color: situationColors.text,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                          }}
                        >
                          {student.situationText}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '1.5rem', textAlign: 'center', color: '#555555' }}>
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhamento da Assiduidade Automática */}
      {engagementModalTarget && (
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
              maxWidth: '480px',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <button
              type="button"
              onClick={() => setEngagementModalTarget(null)}
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
              Assiduidade — {engagementModalTarget.studentName}
            </h2>
            <p style={{ color: '#555555', fontSize: '0.88rem', marginTop: 0, marginBottom: '1.25rem' }}>
              Índice calculado automaticamente com base nas aulas concluídas, entregas de tarefas e notas.
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                border: '2px solid #181818',
                backgroundColor: '#FDFBF7',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555555' }}>
                  ÍNDICE GERAL
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#181818' }}>
                  {engagementModalTarget.breakdown.statusLabel}
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-red)' }}>
                {engagementModalTarget.breakdown.score}%
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileCheck2 size={18} color="var(--brand-red)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      Tarefas no Prazo (Peso 50%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555' }}>
                      {engagementModalTarget.breakdown.relevantTasksCount > 0
                        ? `${engagementModalTarget.breakdown.submittedTasksCount} de ${engagementModalTarget.breakdown.relevantTasksCount} entregues`
                        : 'Nenhuma tarefa vencida até o momento'}
                    </div>
                  </div>
                </div>
                <strong>{engagementModalTarget.breakdown.tasksComponentScore}%</strong>
              </div>

              <div
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BookOpen size={18} color="#181818" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      Constância nas Aulas (Peso 30%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555' }}>
                      {engagementModalTarget.breakdown.completedLessonsCount} de{' '}
                      {engagementModalTarget.breakdown.totalCatalogLessons} lições concluídas
                      {engagementModalTarget.breakdown.daysSinceLastLesson !== null
                        ? ` • Última há ${engagementModalTarget.breakdown.daysSinceLastLesson} dia(s)`
                        : ''}
                    </div>
                  </div>
                </div>
                <strong>{engagementModalTarget.breakdown.lessonsComponentScore}%</strong>
              </div>

              <div
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Award size={18} color="#166534" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      Aproveitamento nas Notas (Peso 20%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555' }}>
                      {engagementModalTarget.breakdown.averageGrade !== null
                        ? `Média das correções: ${engagementModalTarget.breakdown.averageGrade}/10`
                        : 'Nenhuma tarefa avaliada com nota ainda'}
                    </div>
                  </div>
                </div>
                <strong>{engagementModalTarget.breakdown.gradesComponentScore}%</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEngagementModalTarget(null)}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '8px',
                border: '2px solid #181818',
                backgroundColor: '#181818',
                color: '#FFFFFF',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Seção de Feedbacks das Aulas */}
      <section
        aria-label="Feedbacks das aulas concluídas"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          border: '1px solid #E2D7C5',
          padding: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} color="var(--brand-red)" />
              <h2 style={{ fontSize: '1.2rem', color: '#181818', fontWeight: 600, margin: 0 }}>
                Feedbacks das Aulas ({filteredFeedbacks.length})
              </h2>
            </div>
            <p style={{ color: '#555555', fontSize: '0.85rem', margin: '0.25rem 0 0 0' }}>
              Comentários enviados pelos alunos ao concluírem cada lição do catálogo.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                border: '1px solid #E2D7C5',
                borderRadius: '6px',
                padding: '0.45rem 0.7rem',
                backgroundColor: '#FDFBF7',
              }}
            >
              <Filter size={16} color="#555555" />
              <select
                aria-label="Filtrar feedbacks por aluno"
                value={selectedStudentFilter}
                onChange={(e) => setSelectedStudentFilter(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  fontSize: '0.875rem',
                  color: '#181818',
                  cursor: 'pointer',
                }}
              >
                <option value="all">Todos os alunos</option>
                {feedbackStudentOptions.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '1px solid #E2D7C5',
                borderRadius: '6px',
                padding: '0.45rem 0.75rem',
                backgroundColor: '#FDFBF7',
                width: '260px',
              }}
            >
              <Search size={17} color="#555555" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Buscar por aula ou comentário..."
                value={feedbackSearch}
                onChange={(e) => setFeedbackSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.875rem',
                  color: '#181818',
                }}
              />
            </div>
          </div>
        </div>

        {feedbacksLoading ? (
          <p style={{ color: '#555555', fontSize: '0.9rem', margin: 0 }}>
            Carregando feedbacks dos alunos...
          </p>
        ) : feedbacksError ? (
          <div
            role="alert"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FEE2E2',
              color: '#DC2626',
              border: '1px solid #FCA5A5',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              fontSize: '0.88rem',
              fontWeight: 600,
            }}
          >
            <CircleAlert size={18} />
            <span>
              Não foi possível carregar os feedbacks das aulas. Verifique se o endpoint
              <code> GET /api/Lesson/catalog/feedbacks </code> está ativo na API.
            </span>
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {filteredFeedbacks.map((entry) => {
              const catalogLesson = lessonsById.get(entry.catalogLessonId);
              const lessonTitle = catalogLesson?.title ?? entry.catalogLessonId;

              return (
                <article
                  key={entry.id}
                  style={{
                    backgroundColor: '#FDFBF7',
                    border: '1.5px solid #E2D7C5',
                    borderRadius: '10px',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.55rem',
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <strong style={{ color: '#181818', fontSize: '0.95rem' }}>
                        {entry.studentName}
                      </strong>
                      <span
                        style={{
                          backgroundColor: '#F4EFE6',
                          color: '#181818',
                          border: '1px solid #181818',
                          borderRadius: '999px',
                          padding: '0.15rem 0.65rem',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                        }}
                      >
                        {lessonTitle}
                      </span>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        color: '#555555',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Calendar size={14} />
                      {formatFeedbackDate(entry.completedAt)}
                    </span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: '#222222',
                      fontSize: '0.92rem',
                      lineHeight: 1.5,
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EFE7DA',
                      borderRadius: '8px',
                      padding: '0.75rem 0.9rem',
                    }}
                  >
                    "{entry.feedback}"
                  </p>
                </article>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem 1rem',
              backgroundColor: '#FDFBF7',
              borderRadius: '10px',
              border: '1px dashed #D6C7B2',
            }}
          >
            <MessageSquare
              size={34}
              color="#181818"
              style={{ opacity: 0.25, margin: '0 auto 0.6rem' }}
            />
            <p style={{ color: '#555555', fontSize: '0.92rem', margin: 0 }}>
              {feedbackEntries.length === 0
                ? 'Nenhum feedback de aula foi enviado pelos alunos ainda.'
                : 'Nenhum feedback corresponde aos filtros selecionados.'}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}