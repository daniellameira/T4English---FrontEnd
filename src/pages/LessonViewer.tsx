import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';
import {
  COURSE_CATALOG,
  getLessonAccessInfo,
  getNextSequentialLesson,
} from '../data/courseCatalog';
import { api } from '../api/client';

const MIN_FEEDBACK_LENGTH = 20;

export function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();

  const material = COURSE_CATALOG.find((l) => l.id === lessonId);
  const nextLesson = material ? getNextSequentialLesson(material) : null;

  const [isCompleted, setIsCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Reinicia estados e valida acesso/progresso sempre que a aula (lessonId) mudar
  useEffect(() => {
    if (!material || !lessonId) {
      setIsCheckingAccess(false);
      return;
    }

    let isMounted = true;
    setIsCheckingAccess(true);
    setIsCompleted(false);
    setTimeLeft(60);
    setFeedback('');
    setErrorMessage('');

    api
      .get<string[]>('/Lesson/progress/me')
      .then((res) => {
        if (!isMounted) return;
        const completedIds = res.data || [];
        const { isLocked } = getLessonAccessInfo(material, completedIds);

        if (isLocked) {
          navigate('/study-materials', { replace: true });
          return;
        }

        if (completedIds.includes(material.id)) {
          setIsCompleted(true);
          setTimeLeft(0);
        }
      })
      .catch((err) => {
        console.error('Erro ao verificar progresso da aula:', err);
      })
      .finally(() => {
        if (isMounted) setIsCheckingAccess(false);
      });

    return () => {
      isMounted = false;
    };
  }, [lessonId, material, navigate]);

  // Temporizador de 60 segundos
  useEffect(() => {
    if (!isCheckingAccess && timeLeft > 0 && !isCompleted) {
      const timerId = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [timeLeft, isCompleted, isCheckingAccess]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const trimmedFeedbackLength = feedback.trim().length;
  const hasValidFeedback = trimmedFeedbackLength >= MIN_FEEDBACK_LENGTH;
  const canComplete = timeLeft === 0 && hasValidFeedback && !isCompleted && !isSubmitting;

  const handleMarkAsCompleted = async () => {
    if (!lessonId || !canComplete) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      await api.post(`/Lesson/catalog/${encodeURIComponent(lessonId)}/complete`, {
        feedback: feedback.trim(),
      });
      setIsCompleted(true);
    } catch (err: unknown) {
      console.error('Erro ao marcar como concluída:', err);
      const apiMessage =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { message?: string } | string } }).response?.data
          : undefined;

      const resolvedMessage =
        typeof apiMessage === 'string'
          ? apiMessage
          : apiMessage?.message ||
            'Não foi possível guardar o seu progresso. Verifique a ligação e tente novamente.';

      setErrorMessage(resolvedMessage);
    } finally {
      setIsSubmitting(false);
    }
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
    <div
      style={{
        maxWidth: '950px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        paddingBottom: '3rem',
      }}
    >
      {/* CABEÇALHO DOODLE */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          marginBottom: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => navigate('/study-materials')}
          title="Voltar à Biblioteca"
          style={{
            position: 'absolute',
            left: 0,
            backgroundColor: '#FFFFFF',
            border: '3px solid #181818',
            borderRadius: '50%',
            width: '45px',
            height: '45px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '3px 3px 0px #181818',
            transition: 'transform 0.1s',
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'translate(2px, 2px)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'translate(0, 0)')}
        >
          <ArrowLeft size={24} color="#181818" style={{ marginLeft: '-2px' }} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '2.2rem',
              color: 'var(--text-main)',
              marginBottom: '0',
              textTransform: 'uppercase',
              textShadow: '2px 2px 0px #FFFFFF, -1px -1px 0px #FFFFFF',
            }}
          >
            Conteúdo da Aula
          </h1>
        </div>
      </div>

      {/* TÍTULO DA AULA ESTILO "STICKER" */}
      <div style={{ display: 'flex', justifyContent: 'center', zIndex: 10 }}>
        <div
          style={{
            backgroundColor: '#F4EFE6',
            border: '3px solid #181818',
            borderRadius: '20px',
            padding: '0.5rem 1.5rem',
            boxShadow: '4px 4px 0px #181818',
            display: 'inline-block',
            transform: 'rotate(-1deg)',
          }}
        >
          <h2
            style={{
              fontSize: '1.2rem',
              color: '#181818',
              margin: 0,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            {material.title}
          </h2>
        </div>
      </div>

      {/* QUADRO DO SLIDE (IFRAME) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '4px solid #181818',
          overflow: 'hidden',
          boxShadow: '10px 10px 0px #181818',
          marginTop: '-1rem',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 0,
            paddingTop: '56.25%',
            paddingBottom: 0,
            overflow: 'hidden',
            willChange: 'transform',
          }}
        >
          <iframe
            loading="lazy"
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              border: 'none',
              padding: 0,
              margin: 0,
            }}
            src={material.embedUrl}
            allowFullScreen
            title={material.title}
          ></iframe>
        </div>
      </div>

      {/* CAMPO DE FEEDBACK OBRIGATÓRIO (EXIBIDO ANTES DE CONCLUIR) */}
      {!isCompleted && !isCheckingAccess && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '3px solid #181818',
            borderRadius: '14px',
            padding: '1.5rem',
            boxShadow: '5px 5px 0px #181818',
            marginTop: '0.5rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <label
              htmlFor="lesson-feedback"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#181818',
              }}
            >
              <MessageSquare size={18} color="#E05A67" />
              <span>Feedback da Aula (obrigatório para concluir)</span>
            </label>

            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 800,
                padding: '0.2rem 0.65rem',
                borderRadius: '999px',
                border: '1.5px solid #181818',
                backgroundColor: hasValidFeedback ? '#DCFCE7' : '#FEF3C7',
                color: hasValidFeedback ? '#166534' : '#92400E',
              }}
            >
              {trimmedFeedbackLength}/{MIN_FEEDBACK_LENGTH} caracteres mínimos
            </span>
          </div>

          <textarea
            id="lesson-feedback"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Conte o que você aprendeu nesta aula, se teve alguma dúvida ou o que achou do conteúdo..."
            style={{
              width: '100%',
              boxSizing: 'border-box',
              border: '2px solid #181818',
              borderRadius: '10px',
              padding: '0.85rem',
              fontSize: '0.95rem',
              fontFamily: 'inherit',
              backgroundColor: '#FDFBF7',
              color: '#181818',
              resize: 'vertical',
              outline: 'none',
            }}
          />

          {errorMessage && (
            <div
              role="alert"
              style={{
                marginTop: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                border: '2px solid #DC2626',
                borderRadius: '8px',
                padding: '0.65rem 0.9rem',
                fontSize: '0.88rem',
                fontWeight: 700,
              }}
            >
              <AlertCircle size={17} />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      )}

      {/* RODAPÉ E BOTÕES DE AÇÃO */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '0.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        {/* Aviso de cópia */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#FFFFFF',
            border: '2px solid #181818',
            padding: '0.55rem 1rem',
            borderRadius: '8px',
            boxShadow: '3px 3px 0px #F3B3B7',
          }}
        >
          <AlertCircle size={16} color="var(--brand-red)" />
          <p style={{ fontSize: '0.8rem', color: '#181818', margin: 0, fontWeight: 'bold' }}>
            Proibido a venda e cópia deste material.
          </p>
        </div>

        {/* Botões de Conclusão / Avançar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {!isCompleted ? (
            <button
              type="button"
              onClick={handleMarkAsCompleted}
              disabled={!canComplete}
              style={{
                backgroundColor: canComplete ? 'var(--brand-red)' : '#FFFFFF',
                color: canComplete ? '#FFFFFF' : '#181818',
                border: canComplete ? '3px solid #181818' : '3px dashed #181818',
                padding: '0.95rem 1.75rem',
                borderRadius: '12px',
                cursor: canComplete ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '1.05rem',
                boxShadow: canComplete ? '5px 5px 0px #181818' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '0.7rem',
                transition: 'all 0.2s ease',
                fontFamily: 'var(--font-subtitle)',
                opacity: canComplete ? 1 : 0.75,
              }}
            >
              {timeLeft > 0 ? <Clock size={20} /> : <CheckCircle size={20} />}
              {isSubmitting
                ? 'Salvando...'
                : timeLeft > 0
                ? `Disponível em ${formatTime(timeLeft)}`
                : !hasValidFeedback
                ? `Preencha o feedback (${trimmedFeedbackLength}/${MIN_FEEDBACK_LENGTH})`
                : 'Marcar Aula como Concluída'}
            </button>
          ) : (
            <>
              <div
                style={{
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                  border: '3px solid #166534',
                  padding: '0.85rem 1.4rem',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                }}
              >
                <CheckCircle size={20} />
                <span>Aula Concluída!</span>
              </div>

              {nextLesson ? (
                <button
                  type="button"
                  onClick={() => navigate(`/lesson/${encodeURIComponent(nextLesson.id)}`)}
                  style={{
                    backgroundColor: '#181818',
                    color: '#FFFFFF',
                    border: '3px solid #181818',
                    padding: '0.9rem 1.65rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: '4px 4px 0px #E05A67',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontFamily: 'var(--font-subtitle)',
                  }}
                >
                  <span>Próximo Conteúdo</span>
                  <ArrowRight size={20} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/study-materials')}
                  style={{
                    backgroundColor: '#F4EFE6',
                    color: '#181818',
                    border: '3px solid #181818',
                    padding: '0.9rem 1.5rem',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontWeight: 800,
                    fontSize: '1rem',
                    boxShadow: '4px 4px 0px #181818',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    fontFamily: 'var(--font-subtitle)',
                  }}
                >
                  <span>Voltar à Biblioteca</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}