import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import type { ProfessorDashboardApiResponse, ProfessorDashboardData } from '../types/dashboard';
import { professorDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { COURSE_CATALOG, getCourseProgressSummary } from '../data/courseCatalog';
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
  const completedAt = getApiField(record, 'completedAt');

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
    completedAt: typeof completedAt === 'string' ? completedAt : null,
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
  const [feedbacksLoading, setFeedbacksLoading] = useState(true);
  const [feedbacksError, setFeedbacksError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [search, setSearch] = useState('');
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [selectedStudentFilter, setSelectedStudentFilter] = useState('all');

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

    loadDashboard();
    loadCatalogFeedbacks();

    return () => {
      cancelled = true;
    };
  }, []);

  const lessonsById = useMemo(
    () => new Map(COURSE_CATALOG.map((lesson) => [lesson.id, lesson])),
    []
  );

  // Agrupa os IDs de lições concluídas por aluno
  const completedIdsByStudent = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const entry of catalogProgressEntries) {
      const list = map.get(entry.studentId) ?? [];
      if (!list.includes(entry.catalogLessonId)) {
        list.push(entry.catalogLessonId);
      }
      map.set(entry.studentId, list);
    }
    return map;
  }, [catalogProgressEntries]);

  const students = Array.isArray(data.students) ? data.students : [];

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
  );

  const averageAttendance = students.length
    ? Math.round(
        students.reduce((total, student) => total + student.attendancePercentage, 0) / students.length
      )
    : null;

  const studentsAtRisk = data.studentsAtRiskCount || 0;

  // Calcula o progresso médio da turma nas 47 lições sequenciais caso existam registros reais
  const computedClassLessonsPercentage = useMemo(() => {
    if (data.completedLessonsPercentage !== undefined) {
      return data.completedLessonsPercentage;
    }
    if (students.length === 0 || catalogProgressEntries.length === 0) {
      return undefined;
    }

    const totalPercentage = students.reduce((acc, student) => {
      const completedIds = completedIdsByStudent.get(student.id) ?? [];
      return acc + getCourseProgressSummary(completedIds).percentage;
    }, 0);

    return Math.round(totalPercentage / students.length);
  }, [
    data.completedLessonsPercentage,
    students,
    catalogProgressEntries.length,
    completedIdsByStudent,
  ]);

  // Apenas entradas que possuem texto de feedback preenchido
  const feedbackEntries = useMemo(
    () => catalogProgressEntries.filter((entry) => entry.feedback.length > 0),
    [catalogProgressEntries]
  );

  // Opções únicas de alunos para o filtro do mural de feedbacks
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
          label="Frequência média"
          value={averageAttendance === null ? '—' : `${averageAttendance}%`}
          description={`${studentsAtRisk} aluno(s) abaixo da frequência recomendada de 75%.`}
          icon={studentsAtRisk > 0 ? AlertTriangle : ShieldCheck}
          tone={studentsAtRisk > 0 ? 'red' : 'green'}
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

      {/* Tabela de Alunos com Progresso na Trilha */}
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #E2D7C5',
              borderRadius: '6px',
              padding: '0.5rem 0.75rem',
              backgroundColor: '#FDFBF7',
              width: '280px',
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

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F4EFE6', color: '#555555', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>ALUNO</th>
                <th style={{ padding: '0.75rem' }}>E-MAIL</th>
                <th style={{ padding: '0.75rem' }}>PROGRESSO (FIRST STEP)</th>
                <th style={{ padding: '0.75rem' }}>FREQUÊNCIA</th>
                <th style={{ padding: '0.75rem' }}>SITUAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isAtRisk = student.isAtRisk ?? student.attendancePercentage < 75;
                  const studentCompletedIds = completedIdsByStudent.get(student.id) ?? [];
                  const progress = getCourseProgressSummary(studentCompletedIds);

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
                        <span
                          style={{
                            backgroundColor: isAtRisk ? '#FEE2E2' : '#DCFCE7',
                            color: isAtRisk ? '#DC2626' : '#166534',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                          }}
                        >
                          {student.attendancePercentage}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#181818', fontWeight: 500 }}>
                        <span
                          style={{
                            backgroundColor: isAtRisk ? '#FEE2E2' : '#DCFCE7',
                            color: isAtRisk ? '#DC2626' : '#166534',
                            padding: '0.25rem 0.6rem',
                            borderRadius: '12px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                          }}
                        >
                          {isAtRisk ? 'Atenção' : 'Em dia'}
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