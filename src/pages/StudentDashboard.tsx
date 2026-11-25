import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { StudentDashboardData } from '../types/dashboard';
import { studentDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import {
  COURSE_CATALOG,
  getCourseProgressSummary,
  getLessonAccessInfo,
} from '../data/courseCatalog';
import {
  BookOpen,
  CheckCircle,
  PlayCircle,
  Award,
  FileCheck,
  CircleAlert,
  Lock,
  ArrowRight,
} from 'lucide-react';

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
  const [completedCatalogIds, setCompletedCatalogIds] = useState<string[]>([]);
  const [catalogProgressLoaded, setCatalogProgressLoaded] = useState(false);
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
    let cancelled = false;
    api
      .get<string[]>('/Lesson/progress/me')
      .then((response) => {
        if (!cancelled && Array.isArray(response.data)) {
          setCompletedCatalogIds(response.data);
          setCatalogProgressLoaded(true);
        }
      })
      .catch((err: unknown) => {
        console.error('Erro ao carregar progresso do catálogo:', err);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const subLevelId = data.subLevelId;
    if (!subLevelId) {
      return;
    }

    let cancelled = false;
    api
      .get<unknown>(`/Lesson/sublevel/${subLevelId}`)
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

  const catalogProgress = useMemo(
    () => getCourseProgressSummary(completedCatalogIds),
    [completedCatalogIds]
  );

  const fallbackProgressPercentage =
    data.totalLessonsCount !== undefined &&
    data.totalLessonsCount > 0 &&
    data.completedLessonsCount !== undefined
      ? Math.round((data.completedLessonsCount / data.totalLessonsCount) * 100)
      : undefined;

  const progressPercentage = catalogProgressLoaded
    ? catalogProgress.percentage
    : fallbackProgressPercentage;

  const lessonsMetricDescription = catalogProgressLoaded
    ? `${catalogProgress.completedCount} de ${catalogProgress.totalLessons} lições concluídas.`
    : data.completedLessonsCount === undefined || data.totalLessonsCount === undefined
      ? 'Aguardando este dado no serviço do dashboard.'
      : `${data.completedLessonsCount} de ${data.totalLessonsCount} lições concluídas.`;

  const assignmentProgress = data.totalAssignmentsCount
    ? Math.round(((data.completedAssignmentsCount ?? 0) / data.totalAssignmentsCount) * 100)
    : undefined;

  const completedCatalogSet = useMemo(
    () => new Set(completedCatalogIds),
    [completedCatalogIds]
  );

  const sequentialCatalogLessons = useMemo(
    () =>
      COURSE_CATALOG.filter((item) => item.isSequential).sort(
        (a, b) => (a.order ?? 0) - (b.order ?? 0)
      ),
    []
  );

  const apiLessons =
    subLevelLessons && subLevelLessons.subLevelId === data.subLevelId
      ? subLevelLessons.lessons
      : Array.isArray(data.lessons)
        ? data.lessons
        : [];

  const allLessons = useMemo(() => {
    if (apiLessons.length > 0 && usingMock && catalogProgressLoaded) {
      return sequentialCatalogLessons.map((lesson, idx) => {
        const access = getLessonAccessInfo(lesson, completedCatalogIds);
        return {
          id: lesson.id,
          stepNumber: idx + 1,
          title: lesson.title,
          description: lesson.theme,
          isCompleted: completedCatalogSet.has(lesson.id),
          isLocked: access.isLocked,
          prerequisiteTitle: access.prerequisiteTitle,
          canvaEmbedUrl: lesson.embedUrl,
        };
      });
    }

    if (apiLessons.length > 0) {
      return apiLessons.map((lesson, idx) => ({
        ...lesson,
        stepNumber: idx + 1,
        isCompleted: lesson.isCompleted || completedCatalogSet.has(lesson.id),
        isLocked: false,
        prerequisiteTitle: undefined as string | undefined,
      }));
    }

    return sequentialCatalogLessons.map((lesson, idx) => {
      const access = catalogProgressLoaded
        ? getLessonAccessInfo(lesson, completedCatalogIds)
        : { isLocked: false, prerequisiteTitle: undefined };

      return {
        id: lesson.id,
        stepNumber: idx + 1,
        title: lesson.title,
        description: lesson.theme,
        isCompleted: completedCatalogSet.has(lesson.id),
        isLocked: access.isLocked,
        prerequisiteTitle: access.prerequisiteTitle,
        canvaEmbedUrl: lesson.embedUrl,
      };
    });
  }, [
    apiLessons,
    usingMock,
    catalogProgressLoaded,
    sequentialCatalogLessons,
    completedCatalogIds,
    completedCatalogSet,
  ]);

  // Janela de foco: 1 anterior concluída + aula atual + próximas 2 aulas (máx. 4 itens)
  const focusedLessons = useMemo(() => {
    if (allLessons.length <= 4) {
      return allLessons;
    }

    const currentIndex = allLessons.findIndex((lesson) => !lesson.isCompleted);

    if (currentIndex === -1) {
      return allLessons.slice(-3);
    }

    const startIndex = Math.max(0, currentIndex - 1);
    const endIndex = Math.min(allLessons.length, currentIndex + 3);
    return allLessons.slice(startIndex, endIndex);
  }, [allLessons]);

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', paddingBottom: '2.5rem' }}>
      {/* Cabeçalho de Boas-Vindas */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Sua Trilha: {data.subLevelName}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Acompanhe seu progresso e acesse suas aulas diárias.
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
                ? 'Carregando seus dados reais; as métricas demonstrativas aparecem enquanto isso.'
                : 'Métricas demonstrativas: aguardando conexão com os serviços reais.'
            : 'Métricas atualizadas com os dados da plataforma.'}
        </span>
      </div>

      {/* Atalhos Rápidos: Próxima Aula + Tabela IPA */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <section
          style={{
            backgroundColor: 'var(--white)',
            border: '2px solid var(--text-main)',
            boxShadow: '4px 4px 0 var(--text-main)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '190px' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                backgroundColor: '#F4EFE6',
                border: '1.5px solid var(--text-main)',
                borderRadius: '999px',
                padding: '0.15rem 0.65rem',
                marginBottom: '0.45rem',
              }}
            >
              {catalogProgress.isCourseCompleted ? 'Trilha Concluída' : 'Continuar Estudando'}
            </span>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.3rem' }}>
              {catalogProgress.nextLesson
                ? catalogProgress.nextLesson.title
                : 'Módulo First Step Finalizado!'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              {catalogProgress.nextLesson
                ? catalogProgress.nextLesson.theme
                : 'Você concluiu todas as 47 lições sequenciais.'}
            </p>
          </div>

          <Link
            to={
              catalogProgress.nextLesson
                ? `/lesson/${encodeURIComponent(catalogProgress.nextLesson.id)}`
                : '/study-materials'
            }
            style={{
              backgroundColor: 'var(--text-main)',
              color: 'var(--white)',
              padding: '0.7rem 1rem',
              borderRadius: '8px',
              border: '2px solid var(--text-main)',
              boxShadow: '2px 2px 0 var(--brand-red)',
              textDecoration: 'none',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
            }}
          >
            <span>{catalogProgress.nextLesson ? 'Ir para aula' : 'Abrir biblioteca'}</span>
            <ArrowRight size={16} />
          </Link>
        </section>

        <section
          style={{
            backgroundColor: 'var(--white)',
            border: '1px solid var(--bg-bege-dark)',
            borderRadius: '12px',
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: '190px' }}>
            <h2 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
              Pratique sua pronúncia
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
              Explore os 44 sons IPA e ouça palavras de exemplo.
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
      </div>

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
          description={lessonsMetricDescription}
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

      {/* Cabeçalho da Janela de Foco */}
      <div
        id="aulas"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
          marginBottom: '1.25rem',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.3rem', color: 'var(--text-main)', margin: 0 }}>
            Próximos Passos da Trilha
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
            Exibindo {focusedLessons.length} de {allLessons.length} aulas em foco.
          </p>
        </div>

        <Link
          to="/study-materials"
          style={{
            backgroundColor: '#FFFFFF',
            color: '#181818',
            border: '2px solid #181818',
            borderRadius: '8px',
            padding: '0.5rem 0.95rem',
            fontSize: '0.85rem',
            fontWeight: 800,
            textDecoration: 'none',
            boxShadow: '2px 2px 0px #181818',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          <span>Ver todas ({allLessons.length})</span>
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Lista Resumida (Máx. 4 aulas) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {focusedLessons.map((lesson) => {
          const isCurrentLesson = !lesson.isCompleted && !lesson.isLocked;

          return (
            <div
              key={lesson.id}
              style={{
                backgroundColor: lesson.isLocked ? '#F4EFE6' : 'var(--white)',
                border: isCurrentLesson
                  ? '2px solid var(--text-main)'
                  : '1px solid var(--bg-bege-dark)',
                boxShadow: isCurrentLesson ? '4px 4px 0 var(--text-main)' : 'none',
                borderRadius: '10px',
                padding: '1.15rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                opacity: lesson.isLocked ? 0.85 : 1,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    backgroundColor: lesson.isLocked
                      ? '#E5E7EB'
                      : lesson.isCompleted
                        ? '#DCFCE7'
                        : '#FEE2E2',
                    padding: '0.75rem',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '42px',
                    minHeight: '42px',
                  }}
                >
                  {lesson.isLocked ? (
                    <Lock size={20} color="#4B5563" />
                  ) : lesson.isCompleted ? (
                    <CheckCircle size={22} color="#166534" />
                  ) : (
                    <span
                      style={{ fontWeight: 'bold', color: 'var(--brand-red)', fontSize: '0.9rem' }}
                    >
                      {lesson.stepNumber}
                    </span>
                  )}
                </div>

                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexWrap: 'wrap',
                      marginBottom: '0.25rem',
                    }}
                  >
                    <h3 style={{ fontSize: '1rem', color: 'var(--text-main)', margin: 0 }}>
                      {lesson.title}
                    </h3>
                    {isCurrentLesson && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          backgroundColor: '#FEF3C7',
                          color: '#92400E',
                          border: '1px solid #181818',
                          borderRadius: '999px',
                          padding: '0.1rem 0.55rem',
                        }}
                      >
                        Aula Atual
                      </span>
                    )}
                  </div>
                  <p
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--text-muted)',
                      maxWidth: '600px',
                      margin: 0,
                    }}
                  >
                    {lesson.isLocked && lesson.prerequisiteTitle
                      ? `Conclua "${lesson.prerequisiteTitle}" para liberar esta aula.`
                      : lesson.description}
                  </p>
                </div>
              </div>

              <div>
                {lesson.isLocked ? (
                  <span
                    style={{
                      backgroundColor: '#E5E7EB',
                      color: '#4B5563',
                      padding: '0.6rem 1.1rem',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '0.875rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                    }}
                  >
                    <Lock size={16} />
                    Bloqueada
                  </span>
                ) : (
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
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}