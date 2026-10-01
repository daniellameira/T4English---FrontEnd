import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Users, UserPlus, Search, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  subLevelName?: string;
  attendancePercentage?: number;
}

interface LevelOption {
  id: string;
  name: string;
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subLevels, setSubLevels] = useState<LevelOption[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados do Formulário de Cadastro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subLevelId, setSubLevelId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setRefreshing(true);
    try {
      // 1. Busca Alunos
      const studentsRes = await api.get('/Student').catch(() => null);
      if (studentsRes?.data) {
        setStudents(studentsRes.data);
      }

      // 2. Busca Níveis e Subníveis reais do banco
      const levelsRes = await api.get('/Level').catch(() => null);

      if (levelsRes?.data && Array.isArray(levelsRes.data)) {
        const extracted: LevelOption[] = [];

        levelsRes.data.forEach((lvl: any) => {
          if (lvl.subLevels && Array.isArray(lvl.subLevels) && lvl.subLevels.length > 0) {
            lvl.subLevels.forEach((sub: any) => {
              extracted.push({ id: sub.id, name: `${lvl.name} - ${sub.name}` });
            });
          } else {
            extracted.push({ id: lvl.id, name: lvl.name });
          }
        });

        setSubLevels(extracted);
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!subLevelId) {
      setFormError('Selecione um nível válido para o aluno.');
      return;
    }

    try {
      await api.post('/Student', {
        name,
        email,
        initialPassword: password,
        subLevelId
      });

      setFormSuccess('Aluno cadastrado com sucesso!');
      setName('');
      setEmail('');
      setPassword('');
      setSubLevelId('');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      console.error('Erro retornado pela API:', err.response?.data);

      // Captura erros de validação do .NET (ModelState/ValidationProblemDetails)
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(' | ');
        setFormError(messages);
      } else if (err.response?.data?.message) {
        setFormError(err.response.data.message);
      } else if (typeof err.response?.data === 'string') {
        setFormError(err.response.data);
      } else {
        setFormError('Erro ao cadastrar aluno. Verifique o console do navegador.');
      }
    }
  };

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Carregando alunos...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

      {/* Cabeçalho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Gerenciamento de Alunos
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Cadastre e acompanhe os alunos matriculados na plataforma.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={loadData}
            disabled={refreshing}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#181818',
              border: '2px solid #181818',
              boxShadow: '3px 3px 0px #181818',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-subtitle)'
            }}
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'A carregar...' : 'Buscar do Banco'}
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            style={{
              backgroundColor: 'var(--brand-red)',
              color: 'var(--white)',
              border: '2px solid #181818',
              boxShadow: '3px 3px 0px #181818',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-subtitle)'
            }}
          >
            <UserPlus size={18} /> Novo Aluno
          </button>
        </div>
      </div>

      {/* Alertas */}
      {formSuccess && (
        <div style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '2px solid #181818', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <CheckCircle size={18} /> {formSuccess}
        </div>
      )}

      {/* Tabela de Alunos */}
      <div className="doodle-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={22} color="var(--brand-red)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>Lista de Matriculados</h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', border: '2px solid #181818', borderRadius: '8px', padding: '0.5rem 0.75rem', backgroundColor: '#FDFBF7', width: '280px' }}>
            <Search size={18} color="#555" style={{ marginRight: '8px' }} />
            <input
              type="text"
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', backgroundColor: 'transparent', width: '100%', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--bg-bege-dark)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <th style={{ padding: '0.75rem' }}>NOME</th>
                <th style={{ padding: '0.75rem' }}>E-MAIL</th>
                <th style={{ padding: '0.75rem' }}>NÍVEL CONTRATADO</th>
                <th style={{ padding: '0.75rem' }}>FREQUÊNCIA</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} style={{ borderBottom: '1px solid var(--bg-bege-dark)', fontSize: '0.9rem' }}>
                    <td style={{ padding: '0.85rem 0.75rem', fontWeight: 600 }}>{student.name}</td>
                    <td style={{ padding: '0.85rem 0.75rem', color: 'var(--text-muted)' }}>{student.email}</td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{ backgroundColor: 'var(--bg-bege)', border: '1px solid #181818', padding: '0.2rem 0.6rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {student.subLevelName || (student as any).subLevel?.name || (student as any).levelName || 'Básico - First Step'}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 0.75rem' }}>
                      <span style={{
                        backgroundColor: (student.attendancePercentage ?? 100) < 75 ? '#FEE2E2' : '#DCFCE7',
                        color: (student.attendancePercentage ?? 100) < 75 ? '#DC2626' : '#166534',
                        padding: '0.25rem 0.6rem',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        fontSize: '0.8rem'
                      }}>
                        {student.attendancePercentage ?? 100}%
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Nenhum aluno encontrado no banco de dados. Clique em <strong>"Buscar do Banco"</strong> para recarregar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Cadastro de Aluno */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(24, 24, 24, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999 }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px solid #181818', padding: '2rem', width: '100%', maxWidth: '450px', boxShadow: '6px 6px 0px #181818' }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '1.25rem', color: 'var(--text-main)' }}>Cadastrar Novo Aluno</h2>

            {formError && (
              <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.6rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleCreateStudent}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nome Completo</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--bg-bege-dark)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>E-mail de Acesso</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--bg-bege-dark)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Senha Provisória</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--bg-bege-dark)', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Nível Liberado</label>
                <select
                  required
                  value={subLevelId}
                  onChange={(e) => setSubLevelId(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '2px solid #181818', outline: 'none', backgroundColor: '#fff', fontSize: '0.9rem' }}
                >
                  <option value="">Selecione o nível...</option>
                  {subLevels.map(lvl => (
                    <option key={lvl.id} value={lvl.id}>{lvl.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '2px solid #181818', backgroundColor: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '0.6rem', borderRadius: '6px', border: '2px solid #181818', backgroundColor: 'var(--brand-red)', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}