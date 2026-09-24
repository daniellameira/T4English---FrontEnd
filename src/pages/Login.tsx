import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      backgroundColor: '#FDFBF7', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      padding: '1.5rem',
      fontFamily: 'sans-serif'
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
        fontWeight: 500,
        fontSize: '0.95rem'
      }}>
        <ArrowLeft size={18} color="#E05A67" /> Voltar para o início
      </Link>

      {/* Card do Formulário */}
      <div style={{ 
        backgroundColor: '#FFFFFF', 
        padding: '2.5rem 2rem', 
        borderRadius: '12px', 
        border: '1px solid #E2D7C5',
        boxShadow: '0 4px 20px rgba(24, 24, 24, 0.05)', 
        width: '100%', 
        maxWidth: '400px' 
      }}>
        
        {/* Logo em destaque */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <img 
            src="/logo.png" 
            alt="T4 English" 
            style={{ height: '70px', objectFit: 'contain', mixBlendMode: 'multiply' }} 
          />
          <h2 style={{ fontSize: '1.25rem', color: '#181818', marginTop: '0.75rem', fontWeight: 700 }}>
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
            marginBottom: '1.25rem', 
            fontSize: '0.875rem' 
          }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Campo E-mail */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#181818', fontWeight: 600 }}>
              E-mail
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #E2D7C5', 
              borderRadius: '6px', 
              padding: '0.6rem 0.75rem',
              backgroundColor: '#FDFBF7'
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
                  fontSize: '0.95rem'
                }}
                placeholder="seu@email.com"
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div style={{ marginBottom: '1.75rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#181818', fontWeight: 600 }}>
              Senha
            </label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              border: '1px solid #E2D7C5', 
              borderRadius: '6px', 
              padding: '0.6rem 0.75rem',
              backgroundColor: '#FDFBF7'
            }}>
              <Lock size={18} color="#555555" style={{ marginRight: '8px' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ 
                  border: 'none', 
                  outline: 'none', 
                  width: '100%', 
                  backgroundColor: 'transparent',
                  color: '#181818',
                  fontSize: '0.95rem'
                }}
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '0.85rem', 
              backgroundColor: '#E05A67', 
              color: '#FFFFFF', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: 'pointer', 
              fontWeight: 'bold',
              fontSize: '1rem',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

      </div>
    </div>
  );
}