import { useState } from 'react';
import { Volume2, Lock, Sparkles, X } from 'lucide-react';
import { Link } from 'react-router-dom';

interface IpaSymbol {
  symbol: string;
  example: string;
  audioUrl?: string;
  isFree: boolean;
}

// Amostra inicial dos símbolos IPA
const ipaSymbols: IpaSymbol[] = [
  { symbol: '/i:/', example: 'see', isFree: true },
  { symbol: '/ɪ/', example: 'sit', isFree: true },
  { symbol: '/e/', example: 'ten', isFree: true },
  { symbol: '/æ/', example: 'cat', isFree: true },
  { symbol: '/ɑ:/', example: 'father', isFree: false },
  { symbol: '/ɒ/', example: 'got', isFree: false },
  { symbol: '/ɔ:/', example: 'saw', isFree: false },
  { symbol: '/ʊ/', example: 'put', isFree: false },
  { symbol: '/u:/', example: 'too', isFree: false },
  { symbol: '/ʌ/', example: 'cup', isFree: false },
  { symbol: '/ɜ:/', example: 'bird', isFree: false },
  { symbol: '/ə/', example: 'about', isFree: false },
];

interface IpaChartProps {
  mode: 'preview' | 'full';
}

export function IpaChart({ mode }: IpaChartProps) {
  const [showModal, setShowModal] = useState(false);
  const [activeSymbol, setActiveSymbol] = useState<string | null>(null);

  const handleSymbolClick = (item: IpaSymbol) => {
    // Se for modo preview e o símbolo não for gratuito, abre o modal de conversão
    if (mode === 'preview' && !item.isFree) {
      setShowModal(true);
      return;
    }

    // Toca o som (quando o cliente enviar os MP3s)
    setActiveSymbol(item.symbol);
    if (item.audioUrl) {
      const audio = new Audio(item.audioUrl);
      audio.play().catch(() => console.log('Áudio ainda não configurado'));
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Grade de Símbolos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
        gap: '0.85rem'
      }}>
        {ipaSymbols.map((item) => {
          const isLocked = mode === 'preview' && !item.isFree;

          return (
            <button
              key={item.symbol}
              onClick={() => handleSymbolClick(item)}
              style={{
                backgroundColor: isLocked ? '#F4EFE6' : activeSymbol === item.symbol ? '#E05A67' : '#FFFFFF',
                color: activeSymbol === item.symbol && !isLocked ? '#FFFFFF' : '#181818',
                border: '1px solid #E2D7C5',
                borderRadius: '8px',
                padding: '0.85rem 0.5rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.25rem',
                position: 'relative',
                transition: 'all 0.2s ease',
                opacity: isLocked ? 0.8 : 1
              }}
            >
              {isLocked ? (
                <Lock size={14} color="#555555" style={{ position: 'absolute', top: '6px', right: '6px' }} />
              ) : (
                <Volume2 size={14} color={activeSymbol === item.symbol ? '#FFFFFF' : '#E05A67'} style={{ position: 'absolute', top: '6px', right: '6px' }} />
              )}

              <span className="ipa-symbol" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                {item.symbol}
              </span>
              <span style={{ fontSize: '0.75rem', color: activeSymbol === item.symbol && !isLocked ? '#F4EFE6' : '#555555' }}>
                {item.example}
              </span>
            </button>
          );
        })}
      </div>

      {/* Pop-up / Modal de Bloqueio para a Home Page */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(24, 24, 24, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '420px',
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            border: '1px solid #E2D7C5'
          }}>
            <button
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={20} color="#181818" />
            </button>

            <div style={{ backgroundColor: '#F4EFE6', width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Sparkles size={28} color="#E05A67" />
            </div>

            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem', color: '#181818' }}>
              Acesso Exclusivo para Alunos
            </h3>

            <p style={{ fontSize: '0.9rem', color: '#555555', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              Seja aluno da <strong>T4 English</strong> para ter acesso completo à Tabela Fonética IPA, áudios explicativos, frases de treino e jogos interativos!
            </p>

            <Link
              to="/login"
              style={{
                display: 'block',
                backgroundColor: '#E05A67',
                color: '#FFFFFF',
                padding: '0.75rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: 'bold',
                fontSize: '0.95rem'
              }}
            >
              Quero ser Aluno T4 English
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}