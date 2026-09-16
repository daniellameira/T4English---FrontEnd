import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, Users, FileText } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfessor = user?.role?.toUpperCase() === 'PROFESSOR';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      {/* Sidebar Lateral */}
      <aside style={{ width: '250px', backgroundColor: 'var(--text-main)', color: 'var(--white)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #2a2a2a' }}>
          <img src="/logo.png" alt="T4 English" style={{ height: '42px', filter: 'brightness(0) invert(1)' }} />
        </div>

        <nav style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link
            to={isProfessor ? '/dashboard/professor' : '/dashboard/student'}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--bg-bege)', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
          >
            <LayoutDashboard size={18} color="var(--brand-red)" /> Dashboard
          </Link>

          {isProfessor && (
            <Link
              to="/students"
              style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--bg-bege)', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
            >
              <Users size={18} color="var(--brand-red)" /> Gerenciar Alunos
            </Link>
          )}

          <Link
            to="/assignments"
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--bg-bege)', padding: '0.75rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 500 }}
          >
            <FileText size={18} color="var(--brand-red)" /> Tarefas
          </Link>
        </nav>

        {/* Perfil & Logout */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--white)' }}>{user?.name}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--bg-bege-dark)' }}>{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--brand-red)', cursor: 'pointer', padding: '0.25rem' }}
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Conteúdo Principal */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
}