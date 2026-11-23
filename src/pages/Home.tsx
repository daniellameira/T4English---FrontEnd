import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  Volume2,
  BookOpen,
  CheckSquare,
  BookMarked,
  LogIn,
  Users,
  Play,
  Target,
  Eye,
  Heart,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

interface FloatingIpaItem {
  symbol: string;
  word: string;
  top: string;
  left?: string;
  right?: string;
  color: string;
  rotate: string;
  delay: string;
  size: string;
}

const FLOATING_IPA_SYMBOLS: FloatingIpaItem[] = [
  { symbol: '/ə/', word: 'about', top: '5%', left: '6%', color: '#E05A67', rotate: '-8deg', delay: '0s', size: '1.35rem' },
  { symbol: '/θ/', word: 'think', top: '10%', left: '22%', color: '#181818', rotate: '6deg', delay: '0.8s', size: '1.2rem' },
  { symbol: '/ʃ/', word: 'ship', top: '7%', right: '20%', color: '#181818', rotate: '-6deg', delay: '1.4s', size: '1.25rem' },
  { symbol: '/ŋ/', word: 'sing', top: '12%', right: '6%', color: '#E05A67', rotate: '10deg', delay: '0.4s', size: '1.35rem' },
  { symbol: '/æ/', word: 'cat', top: '23%', left: '11%', color: '#181818', rotate: '-5deg', delay: '1.1s', size: '1.3rem' },
  { symbol: '/ʤ/', word: 'job', top: '22%', right: '11%', color: '#181818', rotate: '7deg', delay: '1.9s', size: '1.25rem' },
  { symbol: '/tʃ/', word: 'check', top: '38%', left: '4%', color: '#E05A67', rotate: '8deg', delay: '0.6s', size: '1.2rem' },
  { symbol: '/ð/', word: 'this', top: '40%', right: '5%', color: '#E05A67', rotate: '-9deg', delay: '1.5s', size: '1.3rem' },
  { symbol: '/ʊ/', word: 'book', top: '56%', left: '6%', color: '#181818', rotate: '-7deg', delay: '0.3s', size: '1.25rem' },
  { symbol: '/ʒ/', word: 'vision', top: '58%', right: '7%', color: '#181818', rotate: '6deg', delay: '1.2s', size: '1.25rem' },
  { symbol: '/ɪ/', word: 'sit', top: '73%', left: '8%', color: '#E05A67', rotate: '5deg', delay: '1.7s', size: '1.2rem' },
  { symbol: '/ɜː/', word: 'learn', top: '75%', right: '9%', color: '#181818', rotate: '-6deg', delay: '0.9s', size: '1.3rem' },
];

const IPA_SHOWCASE = [
  {
    symbol: '/θ/',
    title: 'Voiceless TH',
    example: 'Think',
    phonetic: '/θɪŋk/',
    tip: 'Ponta da língua levemente entre os dentes, soprando o ar sem vibrar.',
    bg: '#FEE2E2',
  },
  {
    symbol: '/ə/',
    title: 'Schwa Sound',
    example: 'About',
    phonetic: '/əˈbaʊt/',
    tip: 'O som mais frequente do inglês: curto, neutro e totalmente relaxado.',
    bg: '#F4EFE6',
  },
  {
    symbol: '/æ/',
    title: 'Short A',
    example: 'Apple',
    phonetic: '/ˈæp.əl/',
    tip: 'Abra bem a boca como um "é" aberto sorrindo.',
    bg: '#E0F2FE',
  },
  {
    symbol: '/ŋ/',
    title: 'Velar Nasal',
    example: 'English',
    phonetic: '/ˈɪŋ.ɡlɪʃ/',
    tip: 'Som nasal produzido no fundo da garganta, sem pronunciar um "g" seco.',
    bg: '#DCFCE7',
  },
];

export function Home() {
  const [speakingWord, setSpeakingWord] = useState<string | null>(null);

  const playPronunciation = (word: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    setSpeakingWord(word);
    utterance.onend = () => setSpeakingWord(null);
    utterance.onerror = () => setSpeakingWord(null);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        position: 'relative',
        overflowX: 'hidden',
        backgroundColor: '#FDFBF7',
        backgroundImage: 'radial-gradient(#D6CFC2 1.5px, transparent 1.5px)',
        backgroundSize: '22px 22px',
        color: '#181818',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Animações CSS para os símbolos flutuantes */}
      <style>{`
        @keyframes doodleFloat {
          0%, 100% {
            transform: translateY(0px) rotate(var(--rot, 0deg));
          }
          50% {
            transform: translateY(-10px) rotate(calc(var(--rot, 0deg) + 4deg));
          }
        }
        .ipa-floating-badge {
          animation: doodleFloat 4.5s ease-in-out infinite;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
        }
        .ipa-floating-badge:hover {
          animation-play-state: paused;
          transform: scale(1.15) !important;
          background-color: #FFFFFF !important;
          box-shadow: 4px 4px 0px #181818 !important;
          opacity: 1 !important;
          z-index: 15;
        }
      `}</style>

      {/* Símbolos IPA Flutuantes distribuídos por toda a área clara */}
      {FLOATING_IPA_SYMBOLS.map((item) => (
        <button
          key={item.symbol}
          type="button"
          onClick={() => playPronunciation(item.word)}
          title={`Ouvir exemplo: "${item.word}"`}
          className="ipa-floating-badge"
          style={
            {
              position: 'absolute',
              top: item.top,
              left: item.left,
              right: item.right,
              '--rot': item.rotate,
              animationDelay: item.delay,
              backgroundColor: 'rgba(255, 255, 255, 0.72)',
              border: '2px solid rgba(24, 24, 24, 0.28)',
              borderRadius: '14px',
              padding: '0.35rem 0.7rem',
              fontSize: item.size,
              fontWeight: 800,
              color: item.color,
              opacity: 0.65,
              cursor: 'pointer',
              boxShadow: '2px 2px 0px rgba(24, 24, 24, 0.15)',
              zIndex: 1,
              fontFamily: 'serif',
            } as React.CSSProperties
          }
        >
          {item.symbol}
        </button>
      ))}

      {/* Barra Superior */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backgroundColor: 'rgba(253, 251, 247, 0.92)',
          backdropFilter: 'blur(6px)',
          borderBottom: '3px solid #181818',
          padding: '0.9rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1120px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              textDecoration: 'none',
              color: '#181818',
              fontWeight: 800,
              fontSize: '1.1rem',


            }}
          >
            <img
              src="/logo.png"
              alt="T4 English"
              style={{ height: '100px', objectFit: 'contain', mixBlendMode: 'multiply' }}
            />
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <Link
              to="/quem-somos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                textDecoration: 'none',
                color: '#181818',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.55rem 1.1rem',
                borderRadius: '10px',
                border: '2px solid #181818',
                backgroundColor: '#F4EFE6',
                boxShadow: '3px 3px 0px #181818',
              }}
            >
              <Users size={17} color="#E05A67" /> Quem Somos
            </Link>

            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                textDecoration: 'none',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '0.95rem',
                padding: '0.55rem 1.25rem',
                borderRadius: '10px',
                border: '2px solid #181818',
                backgroundColor: '#E05A67',
                boxShadow: '3px 3px 0px #181818',
              }}
            >
              <LogIn size={17} /> Entrar
            </Link>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main style={{ position: 'relative', zIndex: 5, flex: 1 }}>
        {/* 1. HERO SECTION */}
        <section
          style={{
            maxWidth: '920px',
            margin: '0 auto',
            padding: '4.5rem 1.5rem 4rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <img
            src="/logo.png"
            alt="T4 English"
            style={{
              height: '100px',
              objectFit: 'contain',
              mixBlendMode: 'multiply',
              marginBottom: '1.5rem',
            }}
          />

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#FFFFFF',
              border: '2.5px solid #181818',
              borderRadius: '999px',
              padding: '0.45rem 1.25rem',
              fontSize: '0.9rem',
              fontWeight: 800,
              boxShadow: '3px 3px 0px #181818',
              marginBottom: '1.5rem',
            }}
          >
            <Sparkles size={17} color="#E05A67" />
            <span>Aprenda de Forma Prática e Divertida</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
              lineHeight: 1.1,
              color: '#181818',
              textTransform: 'uppercase',
              marginBottom: '1.25rem',
              letterSpacing: '0.5px',
              textShadow: '3px 3px 0px #FFFFFF',
            }}
          >
            FIRST STEP TO YOUR FLUENCY!
          </h1>

          <p
            style={{
              maxWidth: '640px',
              fontSize: '1.15rem',
              lineHeight: 1.6,
              color: '#333333',
              marginBottom: '2.25rem',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '0.85rem 1.25rem',
              borderRadius: '12px',
              border: '2px dashed rgba(24, 24, 24, 0.25)',
            }}
          >
            Do básico ao avançado, acompanhe o seu progresso, a sua frequência e as suas tarefas
            numa plataforma desenhada para a sua evolução real.
          </p>

          <div
            style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Link
              to="/login"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#E05A67',
                color: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '12px',
                padding: '1rem 2rem',
                fontWeight: 800,
                fontSize: '1.1rem',
                textDecoration: 'none',
                boxShadow: '5px 5px 0px #181818',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Começar Agora</span>
              <ArrowRight size={20} />
            </Link>

            <Link
              to="/quem-somos"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.6rem',
                backgroundColor: '#FFFFFF',
                color: '#181818',
                border: '3px solid #181818',
                borderRadius: '12px',
                padding: '1rem 1.75rem',
                fontWeight: 800,
                fontSize: '1.05rem',
                textDecoration: 'none',
                boxShadow: '5px 5px 0px #181818',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-3px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <span>Conhecer o Professor</span>
            </Link>
          </div>
        </section>

        {/* 2. SEÇÃO INTERATIVA: PRONÚNCIA IPA NA PRÁTICA */}
        <section style={{ maxWidth: '1040px', margin: '0 auto 4.5rem', padding: '0 1.5rem' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '3px solid #181818',
              borderRadius: '20px',
              padding: '2.5rem 2rem',
              boxShadow: '8px 8px 0px #181818',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <span
                style={{
                  display: 'inline-block',
                  backgroundColor: '#FEE2E2',
                  color: '#E05A67',
                  border: '2px solid #181818',
                  borderRadius: '20px',
                  padding: '0.25rem 0.9rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '0.6rem',
                }}
              >
                Experimente Agora
              </span>
              <h2 style={{ fontSize: '1.8rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
                Domine os Sons Reais do Inglês (IPA)
              </h2>
              <p style={{ color: '#555555', fontSize: '0.98rem', margin: 0 }}>
                Clique nos cartões (ou nos símbolos flutuantes pela página) para ouvir a pronúncia.
              </p>
            </div>

           <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(215px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {IPA_SHOWCASE.map((item) => {
                const isPlaying = speakingWord === item.example;
                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => playPronunciation(item.example)}
                    style={{
                      textAlign: 'left',
                      backgroundColor: item.bg,
                      border: '2.5px solid #181818',
                      borderRadius: '14px',
                      padding: '1.25rem',
                      cursor: 'pointer',
                      boxShadow: isPlaying ? '2px 2px 0px #181818' : '4px 4px 0px #181818',
                      transform: isPlaying ? 'translate(2px, 2px)' : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div>
                          <span
                            style={{
                              display: 'block',
                              fontSize: '2rem',
                              fontWeight: 800,
                              fontFamily: 'serif',
                              color: '#181818',
                              lineHeight: 1.1,
                            }}
                          >
                            {item.symbol}
                          </span>

                          {/* Nome do símbolo IPA */}
                          <span
                            style={{
                              display: 'inline-block',
                              marginTop: '0.35rem',
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              textTransform: 'uppercase',
                              letterSpacing: '0.5px',
                              color: '#E05A67',
                              backgroundColor: '#FFFFFF',
                              border: '1.5px solid #181818',
                              borderRadius: '6px',
                              padding: '0.15rem 0.5rem',
                            }}
                          >
                            {item.title}
                          </span>
                        </div>

                        <span
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            backgroundColor: isPlaying ? '#E05A67' : '#FFFFFF',
                            color: isPlaying ? '#FFFFFF' : '#181818',
                            border: '2px solid #181818',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Volume2 size={18} />
                        </span>
                      </div>

                      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#181818' }}>
                        {item.example}{' '}
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#555555' }}>
                          {item.phonetic}
                        </span>
                      </div>
                      <p
                        style={{
                          fontSize: '0.85rem',
                          color: '#333333',
                          lineHeight: 1.45,
                          marginTop: '0.5rem',
                          marginBottom: 0,
                        }}
                      >
                        {item.tip}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* 3. RECURSOS DA PLATAFORMA */}
        <section style={{ maxWidth: '1040px', margin: '0 auto 4.5rem', padding: '0 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <h2
              style={{
                fontSize: '1.9rem',
                textTransform: 'uppercase',
                marginBottom: '0.5rem',
                textShadow: '2px 2px 0px #FFFFFF',
              }}
            >
              Tudo o que Você Precisa em um Só Lugar
            </h2>
            <p style={{ color: '#444444', fontSize: '1rem', margin: 0 }}>
              Uma experiência completa pensada para manter sua constância nos estudos.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
              gap: '1.5rem',
            }}
          >
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '14px',
                padding: '1.6rem',
                boxShadow: '5px 5px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <BookOpen size={24} color="#E05A67" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Biblioteca de Aulas</h3>
              <p style={{ color: '#555555', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Slides interativos organizados por módulo, com filtros por tema e marcação
                individual de conclusão.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '14px',
                padding: '1.6rem',
                boxShadow: '5px 5px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#F4EFE6',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <Play size={24} color="#181818" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Tabela IPA Interativa</h3>
              <p style={{ color: '#555555', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Explore vogais, ditongos e consoantes do inglês com exemplos em áudio para treinar o
                ouvido e a fala.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '14px',
                padding: '1.6rem',
                boxShadow: '5px 5px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#DCFCE7',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <CheckSquare size={24} color="#166534" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>Tarefas & Correção</h3>
              <p style={{ color: '#555555', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Envie suas atividades diretamente pela plataforma e receba notas e feedback
                personalizado do professor.
              </p>
            </div>

            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '14px',
                padding: '1.6rem',
                boxShadow: '5px 5px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF3C7',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1rem',
                }}
              >
                <BookMarked size={24} color="#B45309" />
              </div>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>E-books de Apoio</h3>
              <p style={{ color: '#555555', fontSize: '0.92rem', lineHeight: 1.5, margin: 0 }}>
                Guias práticos de vocabulário, verbos e expressões prontos para download e estudo
                offline.
              </p>
            </div>
          </div>
        </section>

        {/* 4. MISSÃO, VISÃO E VALORES */}
        <section
          id="sobre-nos"
          style={{ maxWidth: '1040px', margin: '0 auto 5rem', padding: '0 1.5rem' }}
        >
          <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
            <span
              style={{
                display: 'inline-block',
                backgroundColor: '#F4EFE6',
                color: '#181818',
                border: '2px solid #181818',
                borderRadius: '20px',
                padding: '0.25rem 0.9rem',
                fontSize: '0.8rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                boxShadow: '2px 2px 0px #181818',
                marginBottom: '0.6rem',
              }}
            >
              Nossos Pilares
            </span>
            <h2
              style={{
                fontSize: '1.9rem',
                textTransform: 'uppercase',
                margin: 0,
                textShadow: '2px 2px 0px #FFFFFF',
              }}
            >
              Missão, Visão e Valores
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Missão */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '6px 6px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                }}
              >
                <Target size={24} color="#E05A67" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: '#181818' }}>
                Missão
              </h3>
              <p style={{ color: '#444444', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
                Proporcionar um aprendizado de inglês estruturado e acessível, capacitando alunos a
                se comunicarem com confiança no mundo globalizado.
              </p>
            </div>

            {/* Visão */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '6px 6px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                }}
              >
                <Eye size={24} color="#E05A67" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: '#181818' }}>
                Visão
              </h3>
              <p style={{ color: '#444444', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
                Ser referência em ensino de idiomas pela excelência pedagógica, inovação
                tecnológica e foco no engajamento do aluno.
              </p>
            </div>

            {/* Valores */}
            <div
              style={{
                backgroundColor: '#FFFFFF',
                border: '3px solid #181818',
                borderRadius: '16px',
                padding: '2rem',
                boxShadow: '6px 6px 0px #181818',
              }}
            >
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: '#FEE2E2',
                  border: '2px solid #181818',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.1rem',
                }}
              >
                <Heart size={24} color="#E05A67" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.75rem', color: '#181818' }}>
                Valores
              </h3>
              <p style={{ color: '#444444', fontSize: '0.96rem', lineHeight: 1.6, margin: 0 }}>
                Comprometimento com o aluno, transparência nas métricas pedagógicas, constante
                inovação e respeito ao ritmo individual.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* RODAPÉ ESCURO COM NAVEGAÇÃO E CONTATO */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          backgroundColor: '#181818',
          color: '#FFFFFF',
          borderTop: '4px solid #070707',
          padding: '3.5rem 2rem 2rem',
        }}
      >
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            paddingBottom: '2.5rem',
          }}
        >
          {/* Coluna 1: Marca e Descrição */}
          <div>
            <div
              style={{
                display: 'inline-block',
                backgroundColor: '#F4EFE6',
                padding: '0.75rem 1.75rem',
                borderRadius: '10px',
                border: '2px solid #FFFFFF',
                marginBottom: '1.25rem',
              }}
            >
              <img
                src="/logo.png"
                alt="T4 English"
                style={{ height: '65px', objectFit: 'contain', mixBlendMode: 'multiply', display: 'block' }}
              />
            </div>
            <p style={{ color: '#D4D4D4', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '300px', margin: 0 }}>
              Transformando o ensino de idiomas através de acompanhamento pedagógico contínuo e
              prático.
            </p>
          </div>

          {/* Coluna 2: Navegação */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.15rem', color: '#FFFFFF' }}>
              Navegação
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li>
                <Link
                  to="/quem-somos"
                  style={{ color: '#D4D4D4', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <a
                  href="#sobre-nos"
                  style={{ color: '#D4D4D4', textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem' }}
                >
                  Sobre Nós
                </a>
              </li>
              <li>
                <Link
                  to="/login"
                  style={{ color: '#E05A67', textDecoration: 'none', fontWeight: 700, fontSize: '0.95rem' }}
                >
                  Área do Aluno / Professor
                </Link>
              </li>
            </ul>
          </div>

          {/* Coluna 3: Contato */}
          <div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.15rem', color: '#FFFFFF' }}>
              Contato
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#D4D4D4', fontSize: '0.95rem' }}>
                <Mail size={18} color="#E05A67" />
                <a
                  href="mailto:contato@t4english.com"
                  style={{ color: '#D4D4D4', textDecoration: 'none' }}
                >
                  contato@t4english.com
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#D4D4D4', fontSize: '0.95rem' }}>
                <Phone size={18} color="#E05A67" />
                <a
                  href="tel:+5561998246030"
                  style={{ color: '#D4D4D4', textDecoration: 'none' }}
                >
                  (61) 99824-6030
                </a>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', color: '#D4D4D4', fontSize: '0.95rem' }}>
                <MapPin size={18} color="#E05A67" />
                <span>Brasília, DF</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Linha de Copyright */}
        <div
          style={{
            maxWidth: '1040px',
            margin: '0 auto',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            paddingTop: '1.5rem',
            textAlign: 'center',
            color: '#A3A3A3',
            fontSize: '0.85rem',
          }}
        >
          © 2026 T4 English. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}