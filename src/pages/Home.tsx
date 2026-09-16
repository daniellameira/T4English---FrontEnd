import { Link } from 'react-router-dom';
import { Target, Heart, Eye, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export function Home() {
  return (
    <div style={{ backgroundColor: '#FDFBF7', minHeight: '100vh', color: '#181818', fontFamily: 'sans-serif' }}>
      {/* Header Público */}
      <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2D7C5', padding: '0.75rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src="/logo.png" alt="T4 English Logo" style={{ height: '48px', objectFit: 'contain', mixBlendMode: 'multiply' }} />
        </div>
        <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <a href="#quem-somos" style={{ color: '#181818', textDecoration: 'none', fontWeight: 500 }}>Quem Somos</a>
          <a href="#missao" style={{ color: '#181818', textDecoration: 'none', fontWeight: 500 }}>Sobre Nós</a>
          <a href="#contato" style={{ color: '#181818', textDecoration: 'none', fontWeight: 500 }}>Contato</a>
          <Link to="/login" style={{ backgroundColor: '#E05A67', color: '#FFFFFF', padding: '0.6rem 1.25rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 'bold' }}>
            Área do Aluno / Professor
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{ padding: '5rem 2rem', textAlign: 'center', backgroundColor: '#F4EFE6' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <img src="/logo.png" alt="T4 English Logo" style={{ height: '120px', marginBottom: '1.5rem', mixBlendMode: 'multiply' }} />
          <h1 style={{ fontSize: '2.5rem', color: '#181818', marginBottom: '1rem', fontWeight: 800 }}>
            Aprenda Inglês com Estrutura e Prática Real
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#555555', marginBottom: '2rem', lineHeight: '1.6' }}>
            Do básico ao avançado, acompanhe seu progresso, frequência e tarefas em uma plataforma pedagógica desenhada para a sua evolução.
          </p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#E05A67', color: '#FFFFFF', padding: '0.85rem 1.75rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem' }}>
            Acessar a Plataforma <ArrowRight size={20} />
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

      {/* Missão, Visão e Valores */}
      <section id="missao" style={{ backgroundColor: '#F4EFE6', padding: '4.5rem 2rem', borderTop: '1px solid #E2D7C5', borderBottom: '1px solid #E2D7C5' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          
          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D7C5' }}>
            <Target size={32} color="#E05A67" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#181818' }}>Missão</h3>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6' }}>Proporcionar um aprendizado de inglês estruturado e acessível, capacitando alunos a se comunicarem com confiança no mundo globalizado.</p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D7C5' }}>
            <Eye size={32} color="#E05A67" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#181818' }}>Visão</h3>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6' }}>Ser referência em ensino de idiomas pela excelência pedagógica, inovação tecnológica e foco no engajamento do aluno.</p>
          </div>

          <div style={{ backgroundColor: '#FFFFFF', padding: '2rem', borderRadius: '12px', border: '1px solid #E2D7C5' }}>
            <Heart size={32} color="#E05A67" style={{ marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#181818' }}>Valores</h3>
            <p style={{ color: '#555555', fontSize: '0.95rem', lineHeight: '1.6' }}>Comprometimento com o aluno, transparência nas métricas pedagógicas, constante inovação e respeito ao ritmo individual.</p>
          </div>

        </div>
      </section>

      {/* Rodapé */}
     <footer id="contato" style={{ backgroundColor: '#181818', color: '#FFFFFF', padding: '4rem 2rem 2rem 2rem' }}>
  <div style={{ 
    maxWidth: '1100px', 
    margin: '0 auto', 
    display: 'grid', 
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
    gap: '3rem',
    alignItems: 'start'
  }}>
    
    {/* Coluna 1: Logo & Sobre */}
    <div>
      <div style={{ 
        backgroundColor: '#F4EFE6', 
        padding: '0.5rem 0.75rem', 
        borderRadius: '8px', 
        display: 'inline-block', 
        marginBottom: '1.25rem' 
      }}>
        <img 
          src="/logo.png" 
          alt="T4 English" 
          style={{ height: '85px', objectFit: 'contain', display: 'block', mixBlendMode: 'multiply' }} 
        />
      </div>
      <p style={{ color: '#E2D7C5', fontSize: '0.95rem', lineHeight: '1.6', maxWidth: '300px' }}>
        Transformando o ensino de idiomas através de acompanhamento pedagógico contínuo e prático.
      </p>
    </div>

    {/* Coluna 2: Navegação Rápida */}
    <div>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#F4EFE6', fontWeight: 'bold' }}>
        Navegação
      </h4>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <li><a href="#quem-somos" style={{ color: '#E2D7C5', textDecoration: 'none', fontSize: '0.95rem' }}>Quem Somos</a></li>
        <li><a href="#missao" style={{ color: '#E2D7C5', textDecoration: 'none', fontSize: '0.95rem' }}>Sobre Nós</a></li>
        <li><Link to="/login" style={{ color: '#E05A67', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 'bold' }}>Área do Aluno / Professor</Link></li>
      </ul>
    </div>

    {/* Coluna 3: Contato */}
    <div>
      <h4 style={{ fontSize: '1.1rem', marginBottom: '1.25rem', color: '#F4EFE6', fontWeight: 'bold' }}>
        Contato
      </h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2D7C5', fontSize: '0.95rem' }}>
          <Mail size={18} color="#E05A67" />
          <span>contato@t4english.com</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2D7C5', fontSize: '0.95rem' }}>
          <Phone size={18} color="#E05A67" />
          <span>(61) 99824-6030</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#E2D7C5', fontSize: '0.95rem' }}>
          <MapPin size={18} color="#E05A67" />
          <span>Brasília, DF</span>
        </div>
      </div>
    </div>

  </div>

  {/* Linha Divisória & Copyright */}
  <div style={{ 
    maxWidth: '1100px', 
    margin: '3rem auto 0 auto', 
    paddingTop: '1.5rem', 
    borderTop: '1px solid #333333', 
    textAlign: 'center', 
    color: '#E2D7C5', 
    fontSize: '0.85rem' 
  }}>
    © 2026 T4 English. Todos os direitos reservados.
  </div>
</footer>
    </div>
  );
}