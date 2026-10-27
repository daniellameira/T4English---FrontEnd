import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// Importamos o Ã­cone Presentation
import { LogOut, LayoutDashboard, Users, FileText, PlayCircle, Presentation, BookOpen } from 'lucide-react';

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isProfessor = user?.role?.toUpperCase() === 'PROFESSOR';

  const getLinkStyle = (path: string) => {
    const isActive = location.pathname.startsWith(path); // Alterado para 'startsWith' para manter ativo em sub-rotas

    return {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      color: '#181818',
      padding: '0.75rem',
      borderRadius: '8px',
      textDecoration: 'none',
      fontWeight: 'bold',
      fontFamily: 'var(--font-subtitle)',
      backgroundColor: isActive ? '#FFFFFF' : 'transparent',
      border: isActive ? '2px solid #181818' : '2px solid transparent',
      boxShadow: isActive ? '2px 2px 0px #181818' : 'none',
      transition: 'all 0.2s ease'
    };
  };

  const dashboardPath = isProfessor ? '/dashboard/professor' : '/dashboard/student';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-light)' }}>
      {/* Sidebar Lateral */}
      <aside style={{
        width: '260px',
        backgroundColor: '#F4EFE6',
        color: '#181818',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '2px solid #181818'
      }}>
        {/* Topo da Logo */}
        <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '2px solid #181818', backgroundColor: '#FFFFFF' }}>
          <img src="/logo.png" alt="T4 English" style={{ height: '70px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>

        {/* Links de Navegação Dinâmicos */}
        <nav style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link to={dashboardPath} style={getLinkStyle(dashboardPath)}>
            <LayoutDashboard size={20} color="#E05A67" /> Dashboard
          </Link>

          {isProfessor ? (
            <>
              <Link to="/students" style={getLinkStyle('/students')}>
                <Users size={20} color="#E05A67" /> Gerenciar Alunos
              </Link>
              <Link to="/lesson-materials" style={getLinkStyle('/lesson-materials')}>
                <Presentation size={20} color="#E05A67" /> Materiais e Slides
              </Link>
            </>
          ) : (
            <>
              {/* Botão de Atalho para o Visualizador de Aulas */}
              <Link to="/lesson/current" style={getLinkStyle('/lesson')}>
                <BookOpen size={20} color="#E05A67" /> Ver Aula
              </Link>
              
              <Link to="/dashboard/student/ipa" style={getLinkStyle('/dashboard/student/ipa')}>
                <PlayCircle size={20} color="#E05A67" /> Tabela IPA
              </Link>
            </>
          )}
          
          <Link to="/assignments" style={getLinkStyle('/assignments')}>
            <FileText size={20} color="#E05A67" /> Tarefas
          </Link>
        </nav>

        {/* Perfil do Utilizador & Sair */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '2px solid #181818', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF' }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#181818' }}>{user?.name || 'UsuÃ¡rio'}</div>
            <div style={{ fontSize: '0.75rem', color: '#555555' }}>{user?.role || 'Professor'}</div>
          </div>
          <button
            onClick={handleLogout}
            title="Sair"
            style={{ backgroundColor: 'transparent', border: 'none', color: '#E05A67', cursor: 'pointer', padding: '0.25rem' }}
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
