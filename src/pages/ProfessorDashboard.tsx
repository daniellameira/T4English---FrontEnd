import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { ProfessorDashboardData } from '../types/dashboard';
import { Users, AlertTriangle, FileCheck, Search } from 'lucide-react';

export function ProfessorDashboard() {
  const [data, setData] = useState<ProfessorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get<ProfessorDashboardData>('/Dashboard/professor');
        setData(response.data);
      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ color: '#181818', fontWeight: 'bold' }}>Carregando dados...</div>;
  }

  const filteredStudents = (data?.students ?? []).filter((student) =>
  student?.name?.toLowerCase().includes(search.toLowerCase()) ||
  student?.email?.toLowerCase().includes(search.toLowerCase())
);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.8rem', color: '#181818', marginBottom: '1.5rem', fontWeight: 700 }}>
        Painel do Professor
      </h1>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        
        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D7C5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#F4EFE6', padding: '0.8rem', borderRadius: '8px' }}>
            <Users size={28} color="#181818" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#555555' }}>Total de Alunos</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#181818' }}>{data?.totalStudents ?? 0}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D7C5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#FEE2E2', padding: '0.8rem', borderRadius: '8px' }}>
            <AlertTriangle size={28} color="#DC2626" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#555555' }}>Presença Crítica (&lt; 75%)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#DC2626' }}>{data?.studentsAtRiskCount ?? 0}</div>
          </div>
        </div>

        <div style={{ backgroundColor: '#FFFFFF', padding: '1.5rem', borderRadius: '12px', border: '1px solid #E2D7C5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ backgroundColor: '#F4EFE6', padding: '0.8rem', borderRadius: '8px' }}>
            <FileCheck size={28} color="#E05A67" />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: '#555555' }}>Tarefas Pendentes</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#181818' }}>{data?.pendingAssignmentsTotal ?? 0}</div>
          </div>
        </div>

      </div>

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
                <th style={{ padding: '0.75rem' }}>TAREFAS PENDENTES</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents && filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isAtRisk = student.attendancePercentage < 75;
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
                        {student.pendingAssignmentsCount}
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