import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Lock, Mail, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      const userRole = user.role?.toUpperCase();

      if (userRole === 'PROFESSOR') {
        navigate('/dashboard/professor', { replace: true });
      } else {
        navigate('/dashboard/student', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/Auth/login', { email, password });

      login(response.data);

      const userRole = response.data.role?.toUpperCase();

      if (userRole === 'PROFESSOR') {
        navigate('/dashboard/professor');
      } else {
        navigate('/dashboard/student');
      }
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;

      setError(message || 'Falha ao realizar login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      position: 'relative', // Permite o posicionamento absoluto do card e do botão
      overflow: 'hidden',
      fontFamily: 'sans-serif',
      backgroundImage: 'url("/Fundo-Login.png")', // Certifique-se de que a imagem está na pasta public
      backgroundSize: 'cover', // Faz com que a imagem cubra toda a tela
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}>
      
      {/* Botão para voltar à Home */}
      <Link to="/" style={{
        position: 'absolute',
        top: '2rem',
        left: '2rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: '#181818', 
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '0.9rem',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        padding: '0.6rem 1.2rem',
        borderRadius: '50px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid rgba(0,0,0,0.1)',
        backdropFilter: 'blur(4px)',
        transition: 'all 0.2s ease',
        zIndex: 10
      }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        }}
      >
        <ArrowLeft size={18} color="#E05A67" /> Voltar para o início
      </Link>

      {/* Card do Formulário */}
      <div style={{
        position: 'absolute', 
        top: '50%',           
        right: '18%', // Ajustado ligeiramente para alinhar melhor com a sua imagem
        transform: 'translateY(-50%)', 
        backgroundColor: '#FFFFFF',
        padding: '3rem 2.5rem',
        borderRadius: '12px',
        border: '3px solid #181818', // Borda no estilo T4 English
        boxShadow: '6px 6px 0px rgba(24, 24, 24, 1)', // Sombra sólida estilo Doodle
        width: '100%',
        maxWidth: '440px',
        zIndex: 10
      }}>

        {/* Logo em destaque */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/logo.png"
            alt="T4 English"
            style={{ height: '150px', objectFit: 'contain', mixBlendMode: 'multiply' }}
          />
          <h2 style={{ 
            fontSize: '1.2rem', 
            color: '#181818', 
            marginTop: '0.75rem', 
            fontWeight: 800,
            textTransform: 'uppercase', // "ACESSE SUA CONTA" conforme imagem
            letterSpacing: '0.5px'
          }}>
            Acesse sua conta
          </h2>
        </div>

        {/* Alerta de Erro */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            padding: '0.75rem',
            borderRadius: '6px',
            border: '2px solid #DC2626',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: 'bold'
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo E-mail */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#181818', fontWeight: 700 }}>
              E-mail
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '2px solid #E2D7C5',
              borderRadius: '8px',
              padding: '0.75rem',
              backgroundColor: '#FDFBF7',
              transition: 'border-color 0.2s'
            }}>
              <Mail size={18} color="#555555" style={{ marginRight: '8px' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#181818',
                  fontSize: '1rem' // Reduzido para ficar mais proporcional
                }}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Campo Senha COM BOTÃO DE VISUALIZAÇÃO */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#181818', fontWeight: 700 }}>
              Senha
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '2px solid #E2D7C5',
              borderRadius: '8px',
              padding: '0.75rem',
              backgroundColor: '#FDFBF7'
            }}>
              <Lock size={18} color="#555555" style={{ marginRight: '8px' }} />
              
              <input
                type={showPassword ? 'text' : 'password'} // Alterna entre text e password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  border: 'none',
                  outline: 'none',
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: '#181818',
                  fontSize: '1.05rem'
                }}
                placeholder="••••••••"
              />

              {/* Botão de Mostrar/Ocultar */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ocultar senha" : "Mostrar senha"}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: '0 4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#555555'
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: '#E05A67',
              color: '#FFFFFF',
              border: '2px solid #181818', 
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              boxShadow: '3px 3px 0px #181818', 
              transition: 'all 0.1s ease',
              transform: loading ? 'translate(2px, 2px)' : 'none'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translate(2px, 2px)';
              e.currentTarget.style.boxShadow = '1px 1px 0px #181818';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translate(0px, 0px)';
              e.currentTarget.style.boxShadow = '3px 3px 0px #181818';
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}