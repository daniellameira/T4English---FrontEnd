import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Presentation } from 'lucide-react';
import { api } from '../api/client';

interface Material {
  id: string;
  title: string;
  embedUrl: string; // Ex: "https://docs.google.com/presentation/d/e/.../embed"
}

export function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [material, setMaterial] = useState<Material | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    // 1. Busca os materiais da aula
    // O endpoint deve retornar os materiais. Aqui assumimos que pega o primeiro (o slide principal).
    api.get<Material[]>(`/Lesson/${lessonId}/materials`)
      .then(res => {
        if (res.data && res.data.length > 0) {
          setMaterial(res.data[0]);
        }
      })
      .catch(err => console.error('Erro ao carregar slide:', err))
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleMarkAsCompleted = async () => {
    try {
      // Faz um POST ou PUT para marcar a aula como concluÃ­da na tabela StudentLessonProgress
      await api.post(`/Lesson/${lessonId}/complete`);
      setIsCompleted(true);
    } catch (err) {
      console.error('Erro ao marcar como concluÃ­da', err);
    }
  };

  if (loading) {
    return <div style={{ fontWeight: 'bold', color: 'var(--text-main)', textAlign: 'center', marginTop: '2rem' }}>A carregar a aula...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* CabeÃ§alho */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/dashboard/student')}
            style={{ backgroundColor: '#F4EFE6', border: '2px solid #181818', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '2px 2px 0px #181818' }}
          >
            <ArrowLeft size={20} color="#181818" />
          </button>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
              {material?.title || 'ConteÃºdo da Aula'}
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Passe os slides abaixo para estudar.</p>
          </div>
        </div>
      </div>

      {/* Visualizador de Slides (Iframe) */}
      <div className="doodle-card" style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
        {material?.embedUrl ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', border: '2px solid #181818' }}>
            <iframe
              src={material.embedUrl}
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            ></iframe>
          </div>
        ) : (
          <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <Presentation size={48} color="#181818" style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
            <p style={{ color: '#555555', fontFamily: 'var(--font-subtitle)' }}>Nenhum material de slide disponÃ­vel para esta liÃ§Ã£o.</p>
          </div>
        )}
      </div>

      {/* RodapÃ© / AcÃ£o de ConclusÃ£o */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button
          onClick={handleMarkAsCompleted}
          disabled={isCompleted}
          style={{
            backgroundColor: isCompleted ? '#DCFCE7' : 'var(--brand-red)',
            color: isCompleted ? '#166534' : '#fff',
            border: '2px solid #181818',
            padding: '0.85rem 1.5rem',
            borderRadius: '8px',
            cursor: isCompleted ? 'default' : 'pointer',
            fontWeight: 'bold',
            fontSize: '1rem',
            boxShadow: isCompleted ? 'none' : '3px 3px 0px #181818',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            fontFamily: 'var(--font-subtitle)'
          }}
        >
          <CheckCircle size={20} />
          {isCompleted ? 'Aula ConcluÃ­da!' : 'Marcar Aula como ConcluÃ­da'}
        </button>
      </div>

    </div>
  );
}
