import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import type { StudentDashboardData } from '../types/dashboard';
import { studentDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { BookDashed, BookOpen, CheckCircle, PlayCircle, Award, FileCheck, CircleAlert } from 'lucide-react';

function isLessonProgress(value: unknown): value is StudentDashboardData['lessons'][number] {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const lesson = value as Partial<StudentDashboardData['lessons'][number]>;
  return (
    typeof lesson.id === 'string' &&
    typeof lesson.title === 'string' &&
    typeof lesson.description === 'string' &&
    typeof lesson.isCompleted === 'boolean' &&
    (lesson.canvaEmbedUrl === undefined || typeof lesson.canvaEmbedUrl === 'string')
  );
}

function isStudentDashboardData(value: unknown): value is StudentDashboardData {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const dashboard = value as Partial<StudentDashboardData>;
  return (
    typeof dashboard.subLevelName === 'string' &&
    (dashboard.subLevelId === undefined ||
      dashboard.subLevelId === null ||
      typeof dashboard.subLevelId === 'string') &&
    typeof dashboard.attendancePercentage === 'number' &&
    typeof dashboard.completedLessonsCount === 'number' &&
    typeof dashboard.totalLessonsCount === 'number' &&
    (dashboard.completedAssignmentsCount === undefined ||
      typeof dashboard.completedAssignmentsCount === 'number') &&
    (dashboard.totalAssignmentsCount === undefined ||
      typeof dashboard.totalAssignmentsCount === 'number') &&
    (dashboard.lessons === undefined ||
      (Array.isArray(dashboard.lessons) && dashboard.lessons.every(isLessonProgress)))
  );
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<StudentDashboardData>(studentDashboardMock);
  const [subLevelLessons, setSubLevelLessons] = useState<{
    subLevelId: string;
    lessons: StudentDashboardData['lessons'];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get<unknown>('/Dashboard/student');
        if (!isStudentDashboardData(response.data)) {
          throw new Error('A resposta do dashboard do aluno tem um formato inválido.');
        }
        setData({ ...response.data, lessons: response.data.lessons ?? [] });
        setUsingMock(false);
      } catch (err) {
        console.error('Erro ao carregar dashboard do aluno:', err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  useEffect(() => {
    const subLevelId = data.subLevelId;
    if (!subLevelId) {
      return;
    }

    let cancelled = false;
    api.get<unknown>(`/Lesson/sublevel/${subLevelId}`)
      .then((response) => {
        if (!Array.isArray(response.data)) {
          throw new Error('A resposta das lições do subnível tem um formato inválido.');
        }

        const loadedLessons = response.data.map((value: unknown) => {
          if (typeof value !== 'object' || value === null) {
            throw new Error('A resposta contém uma lição inválida.');
          }

          const lesson = value as Record<string, unknown>;
          if (typeof lesson.id !== 'string' || typeof lesson.title !== 'string') {
            throw new Error('A resposta contém uma lição sem identificador ou título.');
          }

          return {
            id: lesson.id,
            title: lesson.title,
            description: typeof lesson.description === 'string' ? lesson.description : '',
            isCompleted: typeof lesson.isCompleted === 'boolean' ? lesson.isCompleted : false,
            ...(typeof lesson.canvaEmbedUrl === 'string' ? { canvaEmbedUrl: lesson.canvaEmbedUrl } : {}),
          };
        });

        if (!cancelled) {
          setSubLevelLessons({ subLevelId, lessons: loadedLessons });
        }
      })
      .catch((err: unknown) => {
        console.error('Erro ao carregar lições:', err);
        if (!cancelled) {
          setSubLevelLessons({ subLevelId, lessons: [] });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data.subLevelId]);

  const progressPercentage = data.totalLessonsCount
    ? Math.round((data.completedLessonsCount / data.totalLessonsCount) * 100)
    : 0;
  const assignmentProgress = data.totalAssignmentsCount
    ? Math.round(((data.completedAssignmentsCount ?? 0) / data.totalAssignmentsCount) * 100)
    : undefined;
  const lessons = subLevelLessons && subLevelLessons.subLevelId === data.subLevelId
    ? subLevelLessons.lessons
    : (Array.isArray(data.lessons) ? data.lessons : []);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Cabeçalho de Boas-Vindas */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Sua Trilha: {data.subLevelName}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Acompanhe seu progresso e acesse suas aulas diárias.
        </p>
      </div>

      <div className={`dashboard-data-notice${loadError ? ' dashboard-data-notice--error' : ''}`} role={loadError ? 'alert' : 'status'}>
        {loadError ? <CircleAlert size={18} /> : <FileCheck size={18} />}
        <span>
          {usingMock
            ? loadError
              ? 'Não foi possível carregar os dados reais. Exibindo métricas demonstrativas.'
              : loading
                ? 'Carregando seus dados reais; as métricas demonstrativas aparecem enquanto isso.'
                : 'Métricas demonstrativas: aguardando conexão com os serviços reais.'
            : 'Métricas atualizadas com os dados da plataforma.'}
        </span>
      </div>

      <section
        style={{
          backgroundColor: 'var(--white)',
          border: '1px solid var(--bg-bege-dark)',
          borderRadius: '12px',
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>
            Pratique sua pronúncia
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Explore os sons IPA e ouça palavras de exemplo.
          </p>
        </div>
        <Link
          to="/dashboard/student/ipa"
          style={{
            backgroundColor: 'var(--brand-red)',
            color: 'var(--white)',
            padding: '0.7rem 1rem',
            borderRadius: '8px',
            border: '2px solid var(--text-main)',
            boxShadow: '2px 2px 0 var(--text-main)',
            textDecoration: 'none',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
          }}
        >
          Abrir tabela IPA
        </Link>
      </section>

      <section className="dashboard-metrics" aria-label="Suas métricas de aprendizagem">
        <DashboardMetricCard
          label="Frequência geral"
          value={`${data.attendancePercentage}%`}
          description="Meta mínima recomendada: 75%."
          icon={Award}
          tone={data.attendancePercentage < 75 ? 'red' : 'green'}
          progress={data.attendancePercentage}
        />
        <DashboardMetricCard
          label="Lições concluídas"
          value={`${progressPercentage}%`}
          description={`${data.completedLessonsCount} de ${data.totalLessonsCount} lições concluídas.`}
          icon={BookOpen}
          tone="yellow"
          progress={progressPercentage}
        />
        <DashboardMetricCard
          label="Tarefas concluídas"
          value={assignmentProgress === undefined ? '—' : `${assignmentProgress}%`}
          description={
            data.totalAssignmentsCount === undefined
              ? 'Aguardando este dado no serviço do dashboard.'
              : `${data.completedAssignmentsCount ?? 0} de ${data.totalAssignmentsCount} tarefas entregues.`
          }
          icon={FileCheck}
          tone="black"
          progress={assignmentProgress}
        />
      </section>

      {/* Lista das Lições da Trilha */}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
        Conteúdo das Aulas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {lessons.length > 0 ? (
          lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              style={{
                backgroundColor: 'var(--white)',
                border: '1px solid var(--bg-bege-dark)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  backgroundColor: lesson.isCompleted ? '#DCFCE7' : 'var(--bg-bege)',
                  padding: '0.75rem',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {lesson.isCompleted ? (
                    <CheckCircle size={22} color="#166534" />
                  ) : (
                    <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                      {index + 1}
                    </span>
                  )}
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {lesson.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '600px' }}>
                    {lesson.description}
                  </p>
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  style={{
                    backgroundColor: lesson.isCompleted ? 'var(--bg-bege)' : 'var(--brand-red)',
                    color: lesson.isCompleted ? 'var(--text-main)' : 'var(--white)',
                    padding: '0.6rem 1.25rem',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.875rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <PlayCircle size={18} />
                  {lesson.isCompleted ? 'Revisar' : 'Estudar'}
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="doodle-card" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
            <BookDashed size={48} color="#181818" style={{ opacity: 0.2, display: 'block', margin: '0 auto 1rem' }} />
            <p style={{ color: '#555555', fontSize: '1.05rem', fontFamily: 'var(--font-subtitle)' }}>
              Nenhuma lição encontrada para o seu nível atual.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}