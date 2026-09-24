import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api/client';
import { ArrowLeft, CheckCircle2, FileText, ExternalLink } from 'lucide-react';

interface LessonDetails {
  id: string;
  title: string;
  description: string;
  canvaEmbedUrl?: string;
  pdfUrl?: string;
  isCompleted: boolean;
}

export function LessonView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<LessonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    async function loadLesson() {
      try {
        const response = await api.get<LessonDetails>(`/Lessons/${id}`);
        setLesson(response.data);
      } catch (err) {
        console.error('Erro ao carregar lição:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLesson();
  }, [id]);

  const handleMarkAsCompleted = async () => {
    if (!lesson) return;
    setCompleting(true);

    try {
      await api.post(`/Lessons/${lesson.id}/complete`);
      setLesson({ ...lesson, isCompleted: true });
    } catch (err) {
      console.error('Erro ao marcar aula como concluída:', err);
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>Carregando conteúdo da aula...</div>;
  }

  if (!lesson) {
    return (
      <div>
        <p>Aula não encontrada ou você não tem acesso a este conteúdo.</p>
        <Link to="/dashboard/student">Voltar ao painel</Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* Botão de Voltar */}
      <button
        onClick={() => navigate('/dashboard/student')}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--text-main)',
          cursor: 'pointer',
          marginBottom: '1.5rem',
          fontWeight: 600
        }}
      >
        <ArrowLeft size={18} color="var(--brand-red)" /> Voltar para a Trilha
      </button>

      {/* Titulo e Descrição */}
      <div style={{ backgroundColor: 'var(--white)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--bg-bege-dark)', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          {lesson.title}
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          {lesson.description}
        </p>
      </div>

      {/* Container de Slides do Canva / PDF */}
      <div style={{ backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden', minHeight: '500px', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '1.5rem', position: 'relative' }}>
        {lesson.canvaEmbedUrl ? (
          <iframe
            src={lesson.canvaEmbedUrl}
            title={lesson.title}
            style={{ width: '100%', height: '550px', border: 'none' }}
            allowFullScreen
          />
        ) : (
          <div style={{ color: '#fff', textAlign: 'center', padding: '2rem' }}>
            <FileText size={48} color="var(--bg-bege-dark)" style={{ marginBottom: '1rem' }} />
            <p style={{ marginBottom: '1rem' }}>Esta aula utiliza o material de acompanhamento em PDF.</p>
            {lesson.pdfUrl && (
              <a
                href={lesson.pdfUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  backgroundColor: 'var(--brand-red)',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Abrir Material do Aluno <ExternalLink size={18} />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Barra de Conclusão da Aula */}
      <div style={{ backgroundColor: 'var(--white)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--bg-bege-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Status da Lição: </span>
          <span style={{ color: lesson.isCompleted ? '#166534' : '#DC2626', fontWeight: 'bold' }}>
            {lesson.isCompleted ? 'Concluída' : 'Pendente'}
          </span>
        </div>

        <button
          onClick={handleMarkAsCompleted}
          disabled={lesson.isCompleted || completing}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: lesson.isCompleted ? '#DCFCE7' : 'var(--brand-red)',
            color: lesson.isCompleted ? '#166534' : 'var(--white)',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: lesson.isCompleted ? 'default' : 'pointer',
            fontWeight: 'bold',
            fontSize: '0.95rem'
          }}
        >
          <CheckCircle2 size={20} />
          {lesson.isCompleted ? 'Conteúdo Estudado!' : completing ? 'Salvando...' : 'Marcar como Estudado'}
        </button>
      </div>

    </div>
  );
}