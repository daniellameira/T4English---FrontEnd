import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { StudentDashboardData } from '../types/dashboard';
import { studentDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { BookDashed, BookOpen, CheckCircle, PlayCircle, Award, FileCheck, CircleAlert } from 'lucide-react';

function getApiField(value: Record<string, unknown>, fieldName: string): unknown {
  const field = Object.keys(value).find((key) => key.toLowerCase() === fieldName.toLowerCase());
  return field === undefined ? undefined : value[field];
}

function normalizeLessonProgress(value: unknown): StudentDashboardData['lessons'][number] | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const lesson = value as Record<string, unknown>;
  const id = getApiField(lesson, 'id');
  const title = getApiField(lesson, 'title');
  const description = getApiField(lesson, 'description');
  const isCompleted = getApiField(lesson, 'isCompleted');
  const canvaEmbedUrl = getApiField(lesson, 'canvaEmbedUrl');

  if (typeof id !== 'string' || !id.trim() || typeof title !== 'string') {
    return null;
  }

  return {
    id,
    title,
    description: typeof description === 'string' ? description : '',
    isCompleted: typeof isCompleted === 'boolean' ? isCompleted : false,
    ...(typeof canvaEmbedUrl === 'string' ? { canvaEmbedUrl } : {}),
  };
}

function normalizeStudentDashboardData(value: unknown): StudentDashboardData | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const dashboard = value as Record<string, unknown>;
  const subLevelId = getApiField(dashboard, 'subLevelId');
  const subLevelName = getApiField(dashboard, 'subLevelName');
  const attendancePercentage = getApiField(dashboard, 'attendancePercentage');
  const lessons = getApiField(dashboard, 'lessons');

  if (
    typeof subLevelName !== 'string' ||
    (subLevelId !== null && subLevelId !== undefined && typeof subLevelId !== 'string') ||
    typeof attendancePercentage !== 'number' ||
    (lessons !== undefined && !Array.isArray(lessons))
  ) {
    return null;
  }

  const normalizedLessons = Array.isArray(lessons)
    ? lessons.map(normalizeLessonProgress)
    : [];
  if (normalizedLessons.some((lesson) => lesson === null)) {
    return null;
  }

  const optionalNumber = (fieldName: string) => {
    const field = getApiField(dashboard, fieldName);
    return typeof field === 'number' ? field : undefined;
  };

  return {
    subLevelId: typeof subLevelId === 'string' ? subLevelId : null,
    subLevelName,
    attendancePercentage,
    completedLessonsCount: optionalNumber('completedLessonsCount'),
    totalLessonsCount: optionalNumber('totalLessonsCount'),
    completedAssignmentsCount: optionalNumber('completedAssignmentsCount'),
    totalAssignmentsCount: optionalNumber('totalAssignmentsCount'),
    lessons: normalizedLessons.filter((lesson) => lesson !== null),
  };
}

export function StudentDashboard() {
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
        const dashboardData = normalizeStudentDashboardData(response.data);
        if (!dashboardData) {
          throw new Error('A resposta do dashboard do aluno tem um formato inválido.');
        }
        setData(dashboardData);
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

        const dashboardLessonsById = new Map(data.lessons.map((lesson) => [lesson.id, lesson]));
        const loadedLessons = response.data.map((value: unknown) => {
          if (typeof value !== 'object' || value === null) {
            throw new Error('A resposta contém uma lição inválida.');
          }

          const lesson = normalizeLessonProgress(value);
          if (!lesson) {
            throw new Error('A resposta contém uma lição sem identificador ou título.');
          }

          const dashboardLesson = dashboardLessonsById.get(lesson.id);
          return lesson.canvaEmbedUrl || !dashboardLesson?.canvaEmbedUrl
            ? lesson
            : { ...lesson, canvaEmbedUrl: dashboardLesson.canvaEmbedUrl };
        });

        if (!cancelled) {
          setSubLevelLessons({ subLevelId, lessons: loadedLessons });
        }
      })
      .catch((err: unknown) => {
        console.error('Erro ao carregar lições:', err);
        if (!cancelled) {
          setSubLevelLessons(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data.subLevelId, data.lessons]);

  const progressPercentage = data.totalLessonsCount !== undefined &&
    data.totalLessonsCount > 0 &&
    data.completedLessonsCount !== undefined
    ? Math.round((data.completedLessonsCount / data.totalLessonsCount) * 100)
    : undefined;
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
          value={progressPercentage === undefined ? '—' : `${progressPercentage}%`}
          description={
            data.completedLessonsCount === undefined || data.totalLessonsCount === undefined
              ? 'Aguardando este dado no serviço do dashboard.'
              : `${data.completedLessonsCount} de ${data.totalLessonsCount} lições concluídas.`
          }
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

      <div id="aulas">
        {/* Lista das Lições da Trilha */}
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
          Conteúdo das Aulas
        </h2>
      </div>
      
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
                <Link
                  to={`/lesson/${encodeURIComponent(lesson.id)}`}
                  state={{
                    lessonMaterial: {
                      title: lesson.title,
                      canvaEmbedUrl: lesson.canvaEmbedUrl,
                    },
                  }}
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
                  }}
                >
                  <PlayCircle size={18} />
                  {lesson.isCompleted ? 'Revisar' : 'Estudar'}
                </Link>
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