import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { StudentDashboardData } from '../types/dashboard';
import { studentDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { BookOpen, CheckCircle, PlayCircle, Award, FileCheck, CircleAlert } from 'lucide-react';

export function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData>(studentDashboardMock);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get<StudentDashboardData>('/Dashboard/student');
        setData(response.data);
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

  const progressPercentage = data.totalLessonsCount
    ? Math.round((data.completedLessonsCount / data.totalLessonsCount) * 100)
    : 0;
  const assignmentProgress = data.totalAssignmentsCount
    ? Math.round(((data.completedAssignmentsCount ?? 0) / data.totalAssignmentsCount) * 100)
    : undefined;

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
          tone="red"
          progress={assignmentProgress}
        />
      </section>

      {/* Lista das Lições da Trilha */}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
        Conteúdo das Aulas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data.lessons.length > 0 ? (
          data.lessons.map((lesson, index) => (
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
                  to={`/lesson/${lesson.id}`}
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
                    gap: '0.5rem'
                  }}
                >
                  <PlayCircle size={18} />
                  {lesson.isCompleted ? 'Revisar' : 'Estudar'}
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--white)', borderRadius: '10px', color: 'var(--text-muted)' }}>
            Nenhuma lição encontrada para o seu nível atual.
          </div>
        )}
      </div>

    </div>
  );
}