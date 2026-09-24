import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { IpaChart } from '../components/IpaChart';
import { Target, Heart, Eye, Mail, Phone, MapPin, ArrowRight, Volume2, Sparkles, BookOpen, GraduationCap, Music, Lightbulb, Globe, Pencil, Ruler, Mic, Brain, Compass, Star, Smile, Bookmark, Compass as CompassIcon, Award } from 'lucide-react';

export function Home() {
  const { user, isAuthenticated } = useAuth();

  const dashboardLink = user?.role?.toUpperCase() === 'PROFESSOR'
    ? '/dashboard/professor'
    : '/dashboard/student';

  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', color: '#181818' }}>
      {/* Header Público */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '2px solid #181818', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="T4 English Logo" style={{ height: '80px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#quem-somos" style={{ color: '#181818', textDecoration: 'none', fontWeight: 'bold' }}>Quem Somos</a>
          <a href="#fonetica" style={{ color: '#181818', textDecoration: 'none', fontWeight: 'bold' }}>Tabela IPA</a>
          <a href="#missao" style={{ color: '#181818', textDecoration: 'none', fontWeight: 'bold' }}>Sobre Nós</a>
          <a href="#contato" style={{ color: '#181818', textDecoration: 'none', fontWeight: 'bold' }}>Contato</a>

          {isAuthenticated ? (
            <Link to={dashboardLink} style={{ backgroundColor: '#181818', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontFamily: 'var(--font-subtitle)' }}>
              Ir para meu Painel
            </Link>
          ) : (
            <Link to="/login" style={{ backgroundColor: '#E05A67', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', border: '2px solid #181818', boxShadow: '2px 2px 0px #181818', fontFamily: 'var(--font-subtitle)' }}>
              Área do Aluno / Professor
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section com Estilo Doodle/Lúdico */}
      {/* Hero Section com Logo Centralizada e Desenhos Doodle */}
      <section className="doodle-bg hero-container" style={{ padding: '5rem 2rem', textAlign: 'center', borderBottom: '2px solid #181818', position: 'relative' }}>

        {/* Desenhos / Rabiscos Decorativos (Doodles Educacionais) */}
        {/* Desenhos / Rabiscos Decorativos Espalhados (Doodles Educacionais) */}
        {/* Canto Superior Esquerdo */}
        <BookOpen className="doodle-icon" size={42} style={{ top: '8%', left: '5%', transform: 'rotate(-15deg)' }} />
        <Pencil className="doodle-icon" size={34} style={{ top: '25%', left: '12%', transform: 'rotate(25deg)' }} />
        <Lightbulb className="doodle-icon" size={38} style={{ top: '12%', left: '22%', transform: 'rotate(-8deg)' }} />

        {/* Canto Superior Direito */}
        <Sparkles className="doodle-icon" size={36} color="#E05A67" style={{ top: '10%', right: '8%', opacity: 0.7 }} />
        <Ruler className="doodle-icon" size={38} style={{ top: '22%', right: '18%', transform: 'rotate(45deg)' }} />
        <Brain className="doodle-icon" size={40} style={{ top: '8%', right: '28%', transform: 'rotate(-10deg)' }} />

        {/* Centro / Laterais Intermediárias */}
        <Star className="doodle-icon" size={28} color="#E05A67" style={{ top: '48%', left: '4%', opacity: 0.8, transform: 'rotate(15deg)' }} />
        <Mic className="doodle-icon" size={36} style={{ top: '52%', left: '14%', transform: 'rotate(-20deg)' }} />
        <Music className="doodle-icon" size={32} style={{ top: '45%', right: '6%', transform: 'rotate(-10deg)' }} />
        <Bookmark className="doodle-icon" size={34} style={{ top: '55%', right: '15%', transform: 'rotate(18deg)' }} />

        {/* Canto Inferior Esquerdo */}
        <GraduationCap className="doodle-icon" size={48} style={{ bottom: '12%', left: '8%', transform: 'rotate(12deg)' }} />
        <Compass className="doodle-icon" size={36} style={{ bottom: '28%', left: '18%', transform: 'rotate(-15deg)' }} />
        <Smile className="doodle-icon" size={30} color="#E05A67" style={{ bottom: '8%', left: '26%', opacity: 0.7 }} />

        {/* Canto Inferior Direito */}
        <Globe className="doodle-icon" size={40} style={{ bottom: '15%', right: '10%', transform: 'rotate(15deg)' }} />
        <Award className="doodle-icon" size={42} style={{ bottom: '28%', right: '20%', transform: 'rotate(-12deg)' }} />
        <Sparkles className="doodle-icon" size={30} style={{ bottom: '8%', right: '30%', opacity: 0.5 }} />

        <div style={{ maxWidth: '850px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>

          {/* 1. Logo Centralizada */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: '1rem' }}>
            <img
              src="/logo.png"
              alt="T4 English Logo"
              style={{
                height: '140px',
                objectFit: 'contain',
                mixBlendMode: 'multiply',
                display: 'block'
              }}
            />
          </div>

          {/* 2. Badge de Destaque */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.5rem 1.2rem', borderRadius: '20px', border: '2px solid #181818', boxShadow: '3px 3px 0px #181818', marginBottom: '1.5rem' }}>
            <Sparkles size={20} color="#E05A67" />
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold', fontFamily: 'var(--font-subtitle)' }}>Aprenda de Forma Prática e Divertida</span>
          </div>

          {/* 3. Título Principal em Bungee */}
          <h1 style={{ fontSize: '2.6rem', color: '#181818', marginBottom: '1rem', lineHeight: '1.2' }}>
            FIRST STEP TO YOUR FLUENCY!
          </h1>

          {/* 4. Subtítulo */}
          <p style={{ fontSize: '1.15rem', color: '#555555', marginBottom: '2rem', lineHeight: '1.6', maxWidth: '700px' }}>
            Do básico ao avançado, acompanhe o seu progresso, a sua frequência e as suas tarefas numa plataforma desenhada para a sua evolução real.
          </p>

          {/* 5. Botão de Chamada */}
          <Link to={isAuthenticated ? dashboardLink : "/login"} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', backgroundColor: '#E05A67', color: '#FFFFFF', padding: '0.9rem 2rem', borderRadius: '12px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', border: '2px solid #181818', boxShadow: '4px 4px 0px #181818', fontFamily: 'var(--font-subtitle)' }}>
            {isAuthenticated ? 'Acessar Minhas Aulas' : 'Começar Agora'} <ArrowRight size={22} />
          </Link>
        </div>
      </section>

      {/* Quem Somos */}
      <section id="quem-somos" style={{ padding: '4.5rem 2rem', maxWidth: '900px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '1.5rem', color: '#181818' }}>Quem Somos</h2>
        <p style={{ textAlign: 'center', fontSize: '1.1rem', color: '#555555', lineHeight: '1.8' }}>
          A <strong>T4 English</strong> é uma escola focada no desenvolvimento real da fluência em inglês. Trabalhamos com métricas claras de frequência, acompanhamento individualizado e uma matriz curricular sólida baseada em fonética e estruturação prática da língua.
        </p>
      </section>

      {/* Seção Demonstrativa da Tabela Fonética (IPA) */}
      <section id="fonetica" className="doodle-bg" style={{ padding: '4.5rem 2rem', borderTop: '2px solid #181818', borderBottom: '2px solid #181818' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', padding: '0.4rem 1rem', borderRadius: '20px', border: '2px solid #181818', marginBottom: '1rem' }}>
            <Volume2 size={18} color="#E05A67" />
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', fontFamily: 'var(--font-subtitle)' }}>Método Exclusivo T4</span>
          </div>

          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#181818' }}>
            TABELA FONÉTICA INTERATIVA
          </h2>
          <p style={{ fontSize: '1rem', color: '#555555', marginBottom: '2.5rem', maxWidth: '650px', margin: '0 auto 2.5rem' }}>
            Clique nos símbolos liberados para ouvir a pronúncia exata. Seja aluno para ter acesso completo a todos os sons, exemplos e exercícios interativos!
          </p>

          <IpaChart mode="preview" />
        </div>
      </section>

      {/* Missão, Visão e Valores (Cards estilo Doodle) */}
      <section id="missao" style={{ padding: '4.5rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>

          <div className="doodle-card" style={{ padding: '2rem' }}>
            <Target size={36} color="#E05A67" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#181818' }}>Missão</h3>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6' }}>Proporcionar um aprendizado de inglês estruturado e acessível, capacitando alunos a se comunicarem com confiança no mundo globalizado.</p>
          </div>

          <div className="doodle-card" style={{ padding: '2rem' }}>
            <Eye size={36} color="#E05A67" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#181818' }}>Visão</h3>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6' }}>Ser referência em ensino de idiomas pela excelência pedagógica, inovação tecnológica e foco no engajamento do aluno.</p>
          </div>

          <div className="doodle-card" style={{ padding: '2rem' }}>
            <Heart size={36} color="#E05A67" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#181818' }}>Valores</h3>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6' }}>Comprometimento com o aluno, transparência nas métricas pedagógicas, constante inovação e respeito ao ritmo individual.</p>
          </div>

        </div>
      </section>

      {/* Rodapé */}
      <footer id="contato" style={{ backgroundColor: '#181818', color: '#FFFFFF', padding: '4rem 2rem 2rem 2rem' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          <div>
            <div style={{ backgroundColor: '#F4EFE6', padding: '0.5rem 0.75rem', borderRadius: '8px', display: 'inline-block', marginBottom: '1.25rem', border: '1px solid #FFFFFF' }}>
              <img src="/logo.png" alt="T4 English" style={{ height: '42px', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }} />
            </div>
            <p style={{ color: '#E2D7C5', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '300px' }}>
              Transformando o ensino de idiomas através de acompanhamento pedagógico contínuo e prático.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#F4EFE6' }}>Navegação</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><a href="#quem-somos" style={{ color: '#E2D7C5', textDecoration: 'none', fontSize: '0.95rem' }}>Quem Somos</a></li>
              <li><a href="#fonetica" style={{ color: '#E2D7C5', textDecoration: 'none', fontSize: '0.95rem' }}>Tabela Fonética</a></li>
              <li><a href="#missao" style={{ color: '#E2D7C5', textDecoration: 'none', fontSize: '0.95rem' }}>Sobre Nós</a></li>
              <li><Link to="/login" style={{ color: '#E05A67', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 'bold' }}>Área do Aluno / Professor</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#F4EFE6' }}>Contato</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2D7C5', fontSize: '0.95rem' }}>
                <Mail size={18} color="#E05A67" /> <span>contato@t4english.com</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2D7C5', fontSize: '0.95rem' }}>
                <Phone size={18} color="#E05A67" /> <span>(61) 99824-6030</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2D7C5', fontSize: '0.95rem' }}>
                <MapPin size={18} color="#E05A67" /> <span>Brasília, DF</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '3rem auto 0 auto', paddingTop: '1.5rem', borderTop: '1px solid #333333', textAlign: 'center', color: '#E2D7C5', fontSize: '0.85rem' }}>
          © 2026 T4 English. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}