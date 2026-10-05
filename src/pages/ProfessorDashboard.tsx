import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ProfessorDashboardApiResponse, ProfessorDashboardData } from '../types/dashboard';
import { professorDashboardMock } from '../data/dashboardMocks';
import { DashboardMetricCard } from '../components/DashboardMetricCard';
import { Users, AlertTriangle, FileCheck, Search, BookOpen, CircleAlert } from 'lucide-react';

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
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get<unknown>('/Dashboard/professor');
        if (!isProfessorDashboardApiResponse(response.data)) {
          throw new Error('A resposta do dashboard do professor tem um formato inválido.');
        }
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
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  const students = Array.isArray(data.students) ? data.students : [];
  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(search.toLowerCase()) ||
    student.email.toLowerCase().includes(search.toLowerCase())
  );
  const averageAttendance = students.length
    ? Math.round(students.reduce((total, student) => total + student.attendancePercentage, 0) / students.length)
    : null;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: '#181818', marginBottom: '0.5rem', fontWeight: 700 }}>
          Painel do Professor
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Acompanhe o progresso e a participação da sua turma.
        </p>
      </div>

      <div className={`dashboard-data-notice${loadError ? ' dashboard-data-notice--error' : ''}`} role={loadError ? 'alert' : 'status'}>
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
          description={`${data.studentsAtRiskCount} aluno(s) abaixo da frequência recomendada de 75%.`}
          icon={AlertTriangle}
          tone={averageAttendance !== null && averageAttendance < 75 ? 'red' : 'green'}
          progress={averageAttendance ?? undefined}
        />
        <DashboardMetricCard
          label="Lições concluídas"
          value={data.completedLessonsPercentage === undefined ? '—' : `${data.completedLessonsPercentage}%`}
          description={data.completedLessonsPercentage === undefined ? 'Aguardando este dado no serviço do dashboard.' : 'Progresso geral das lições da turma.'}
          icon={BookOpen}
          tone="yellow"
          progress={data.completedLessonsPercentage}
        />
        <DashboardMetricCard
          label="Tarefas para corrigir"
          value={String(data.pendingGradingCount)}
          description="Envios aguardando avaliação."
          icon={FileCheck}
          tone="red"
        />
      </section>

      {/* Tabela de Alunos */}
      <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2D7C5', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#181818', fontWeight: 600 }}>Acompanhamento dos Alunos</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #E2D7C5', borderRadius: '6px', padding: '0.5rem 0.75rem', backgroundColor: '#FDFBF7', width: '280px' }}>
            <Search size={18} color="#555555" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '0.875rem', color: '#181818' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #F4EFE6', color: '#555555', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>ALUNO</th>
                <th style={{ padding: '0.75rem' }}>E-MAIL</th>
                <th style={{ padding: '0.75rem' }}>FREQUÊNCIA</th>
                <th style={{ padding: '0.75rem' }}>SITUAÇÃO</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isAtRisk = student.isAtRisk ?? student.attendancePercentage < 75;
                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid #F4EFE6', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600, color: '#181818' }}>{student.name}</td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#555555' }}>{student.email}</td>
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <span style={{
                          backgroundColor: isAtRisk ? '#FEE2E2' : '#DCFCE7',
                          color: isAtRisk ? '#DC2626' : '#166534',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {student.attendancePercentage}%
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 0.75rem', color: '#181818', fontWeight: 500 }}>
                        <span style={{
                          backgroundColor: isAtRisk ? '#FEE2E2' : '#DCFCE7',
                          color: isAtRisk ? '#DC2626' : '#166534',
                          padding: '0.25rem 0.6rem',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          fontSize: '0.8rem'
                        }}>
                          {isAtRisk ? 'Atenção' : 'Em dia'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '1.5rem', textAlign: 'center', color: '#555555' }}>
                    Nenhum aluno encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}