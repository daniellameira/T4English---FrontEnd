import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { BookOpen, CheckCircle, PlayCircle, Award } from 'lucide-react';

interface LessonProgress {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  canvaEmbedUrl?: string;
}

interface StudentDashboardData {
  subLevelName: string;
  attendancePercentage: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lessons: LessonProgress[];
}

export function StudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get<StudentDashboardData>('/Dashboard/student');
        setData(response.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard do aluno:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Carregando sua trilha...</div>;
  }

  const progressPercentage = data?.totalLessonsCount 
    ? Math.round((data.completedLessonsCount / data.totalLessonsCount) * 100) 
    : 0;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      
      {/* Cabeçalho de Boas-Vindas */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Sua Trilha: {data?.subLevelName ?? 'Basic Level'}
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Acompanhe seu progresso e acesse suas aulas diárias.
        </p>
      </div>

      {/* Cards de Desempenho do Aluno */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* Card Frequência */}
        <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--bg-bege-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Frequência Geral</span>
            <Award size={24} color="var(--brand-red)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: (data?.attendancePercentage ?? 0) < 75 ? '#DC2626' : '#166534' }}>
            {data?.attendancePercentage ?? 0}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Meta mínima recomendada: 75%
          </div>
        </div>

        {/* Card Progresso do Curso */}
        <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--bg-bege-dark)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Progresso do Nível</span>
            <BookOpen size={24} color="var(--brand-red)" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
            {progressPercentage}%
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            {data?.completedLessonsCount} de {data?.totalLessonsCount} lições concluídas
          </div>
        </div>

      </div>

      {/* Lista das Lições da Trilha */}
      <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>
        Conteúdo das Aulas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {data?.lessons && data.lessons.length > 0 ? (
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