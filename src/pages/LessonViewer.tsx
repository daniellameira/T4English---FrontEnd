import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { COURSE_CATALOG } from '../data/courseCatalog';

export function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  
  const material = COURSE_CATALOG.find(l => l.id === lessonId);

  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    if (timeLeft > 0 && !isCompleted) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, isCompleted]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!material) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Aula não encontrada!</h2>
        <button onClick={() => navigate('/study-materials')}>Voltar à Biblioteca</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* CABEÇALHO DOODLE */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '0.5rem' }}>
        <button 
          onClick={() => navigate('/study-materials')}
          title="Voltar à Biblioteca"
          style={{ position: 'absolute', left: 0, backgroundColor: '#FFFFFF', border: '3px solid #181818', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '3px 3px 0px #181818', transition: 'transform 0.1s' }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0, 0)'}
        >
          <ArrowLeft size={24} color="#181818" style={{ marginLeft: '-2px' }} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--text-main)', marginBottom: '0', textTransform: 'uppercase', textShadow: '2px 2px 0px #FFFFFF, -1px -1px 0px #FFFFFF' }}>
            Conteúdo da Aula
          </h1>
        </div>
      </div>

      {/* TÍTULO DA AULA ESTILO "STICKER" */}
      <div style={{ display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div style={{ backgroundColor: '#F4EFE6', border: '3px solid #181818', borderRadius: '20px', padding: '0.5rem 1.5rem', boxShadow: '4px 4px 0px #181818', display: 'inline-block', transform: 'rotate(-1deg)' }}>
          <h2 style={{ fontSize: '1.2rem', color: '#181818', margin: 0, textTransform: 'uppercase', letterSpacing: '1px' }}>
            {material.title}
          </h2>
        </div>
      </div>

      {/* QUADRO DO SLIDE (IFRAME) - AGORA COM EFEITO DOODLE FORTE */}
      <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          border: '4px solid #181818', // Borda mais grossa
          overflow: 'hidden', 
          boxShadow: '10px 10px 0px #181818', // Sombra sólida forte
          marginTop: '-1rem' // Puxa ligeiramente para cima para intercetar o sticker
        }}>
        <div style={{ position: 'relative', width: '100%', height: 0, paddingTop: '56.25%', paddingBottom: 0, overflow: 'hidden', willChange: 'transform' }}>
          <iframe 
            loading="lazy" 
            style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0, border: 'none', padding: 0, margin: 0 }}
            src={material.embedUrl}
            allowFullScreen 
            title={material.title}
          ></iframe>
        </div>
      </div>

      {/* RODAPÉ E BOTÃO DE CONCLUSÃO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', flexWrap: 'wrap', gap: '1.5rem', padding: '0 1rem' }}>
        
        {/* Aviso de cópia agora bem posicionado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFFFFF', border: '2px solid #181818', padding: '0.5rem 1rem', borderRadius: '8px', boxShadow: '3px 3px 0px #F3B3B7' }}>
          <AlertCircle size={16} color="var(--brand-red)" />
          <p style={{ fontSize: '0.8rem', color: '#181818', margin: 0, fontWeight: 'bold' }}>
            Proibido a venda e cópia deste material.
          </p>
        </div>

        {/* Botão Dinâmico (Tracejado se estiver a contar, Sólido se concluído) */}
        <div>
          <button
            onClick={() => setIsCompleted(true)}
            disabled={timeLeft > 0 || isCompleted}
            style={{
              backgroundColor: isCompleted ? '#DCFCE7' : (timeLeft > 0 ? '#FFFFFF' : 'var(--brand-red)'),
              color: isCompleted ? '#166534' : (timeLeft > 0 ? '#181818' : '#FFFFFF'),
              border: isCompleted ? '3px solid #166534' : (timeLeft > 0 ? '3px dashed #181818' : '3px solid #181818'),
              padding: '1rem 2rem', 
              borderRadius: '12px',
              cursor: (timeLeft > 0 || isCompleted) ? 'not-allowed' : 'pointer',
              fontWeight: 'bold', 
              fontSize: '1.1rem',
              boxShadow: (timeLeft > 0 || isCompleted) ? 'none' : '5px 5px 0px #181818',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              transition: 'all 0.2s ease',
              fontFamily: 'var(--font-subtitle)'
            }}
          >
            {isCompleted ? <CheckCircle size={22} /> : (timeLeft > 0 ? <Clock size={22} /> : <CheckCircle size={22} />)}
            
            {isCompleted 
              ? 'Aula Concluída!' 
              : (timeLeft > 0 ? `Disponível em ${formatTime(timeLeft)}` : 'Marcar Aula como Concluída')}
          </button>
        </div>

      </div>
    </div>
  );
}