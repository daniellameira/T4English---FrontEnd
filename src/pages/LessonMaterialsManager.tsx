import { isAxiosError } from 'axios';
import { useEffect, useState, type FormEvent } from 'react';
import {
  CheckCircle,
  Edit3,
  Info,
  Presentation,
  X,
} from 'lucide-react';
import { api } from '../api/client';

interface SubLevelOption {
  id: string;
  name: string;
}

interface Lesson {
  id: string;
  title: string;
  orderIndex?: number;
}

interface ApiErrorBody {
  message?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    const data = error.response?.data;
    const validationMessages = data?.errors
      ? Object.values(data.errors).flat().join(' | ')
      : '';

    return validationMessages || data?.message || data?.title || error.message || fallback;
  }

  return error instanceof Error ? error.message || fallback : fallback;
}

function getMaterialUrl(input: string): string {
  let candidate = input.trim();

  if (candidate.includes('<')) {
    const document = new DOMParser().parseFromString(candidate, 'text/html');
    candidate = document.querySelector('iframe')?.getAttribute('src')?.trim() ?? '';

    if (!candidate) {
      throw new Error('Não foi possível encontrar um link no HTML. Cole o link de partilha ou um iframe válido.');
    }
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(candidate);
  } catch {
    throw new Error('Insira um link válido do Canva ou Google Slides.');
  }

  if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
    throw new Error('O link precisa começar com https:// ou http://.');
  }

  const isCanvaUrl =
    parsedUrl.hostname === 'canva.com' ||
    parsedUrl.hostname.endsWith('.canva.com');

  if (
    isCanvaUrl &&
    /\/view\/?$/.test(parsedUrl.pathname) &&
    !parsedUrl.searchParams.has('embed')
  ) {
    const hashIndex = candidate.indexOf('#');
    const hash = hashIndex >= 0 ? candidate.slice(hashIndex) : '';
    const urlWithoutHash = hashIndex >= 0 ? candidate.slice(0, hashIndex) : candidate;
    candidate = `${urlWithoutHash}${urlWithoutHash.includes('?') ? '&' : '?'}embed${hash}`;
  }

  return candidate;
}

const alertStyle = {
  border: '2px solid #181818',
  borderRadius: '8px',
  padding: '0.85rem',
  marginBottom: '1rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  fontWeight: 'bold',
} as const;

const fieldStyle = {
  width: '100%',
  padding: '0.75rem',
  borderRadius: '8px',
  border: '2px solid #181818',
  outline: 'none',
  backgroundColor: '#FFFFFF',
  fontSize: '1rem',
  fontFamily: 'inherit',
} as const;

export function LessonMaterialsManager() {
  const [subLevels, setSubLevels] = useState<SubLevelOption[]>([]);
  const [selectedSubLevelId, setSelectedSubLevelId] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingSubLevels, setLoadingSubLevels] = useState(true);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [pageError, setPageError] = useState('');
  const [lessonsError, setLessonsError] = useState('');

  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialLink, setMaterialLink] = useState('');
  const [saving, setSaving] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSubLevels() {
      try {
        const response = await api.get<SubLevelOption[]>('/Level/sublevels');
        if (cancelled) return;

        const availableSubLevels = Array.isArray(response.data) ? response.data : [];
        setSubLevels(availableSubLevels);
        setSelectedSubLevelId(availableSubLevels[0]?.id ?? '');
      } catch (error: unknown) {
        if (!cancelled) {
          setPageError(getErrorMessage(error, 'Não foi possível carregar os subníveis.'));
        }
      } finally {
        if (!cancelled) {
          setLoadingSubLevels(false);
        }
      }
    }

    loadSubLevels();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSubLevelId) {
      return;
    }

    let cancelled = false;

    async function loadLessons() {
      setLoadingLessons(true);
      setLessonsError('');
      try {
        const response = await api.get<Lesson[]>(
          `/Lesson/sublevel/${selectedSubLevelId}`,
        );
        if (!cancelled) {
          setLessons(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error: unknown) {
        if (!cancelled) {
          setLessons([]);
          setLessonsError(getErrorMessage(error, 'Não foi possível carregar as aulas.'));
        }
      } finally {
        if (!cancelled) {
          setLoadingLessons(false);
        }
      }
    }

    loadLessons();
    return () => {
      cancelled = true;
    };
  }, [selectedSubLevelId]);

  const handleOpenModal = (lesson: Lesson) => {
    setActiveLesson(lesson);
    setMaterialTitle(`Slides: ${lesson.title}`);
    setMaterialLink('');
    setFormSuccess('');
    setFormError('');
  };

  const handleCloseModal = () => {
    if (saving) return;
    setActiveLesson(null);
    setFormError('');
    setFormSuccess('');
  };

  const handleSaveMaterial = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!activeLesson || saving) return;

    setFormError('');
    setFormSuccess('');

    let url: string;
    try {
      url = getMaterialUrl(materialLink);
    } catch (error: unknown) {
      setFormError(getErrorMessage(error, 'Verifique o link informado.'));
      return;
    }

    setSaving(true);
    try {
      await api.post(`/Lesson/${activeLesson.id}/materials`, {
        title: materialTitle.trim(),
        url,
        type: 1,
      });
      setFormSuccess('Material da aula guardado com sucesso!');
    } catch (error: unknown) {
      if (isAxiosError(error) && error.response?.status === 405) {
        setFormError(
          'O servidor recusou o POST para guardar o material (405). Confirme se a API tem o método POST /api/Lesson/{lessonId}/materials ativo.',
        );
      } else {
        setFormError(getErrorMessage(error, 'Não foi possível guardar o material. Tente novamente.'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '1.8rem',
            color: 'var(--text-main)',
            marginBottom: '0.25rem',
          }}
        >
          Gestão de materiais e slides
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Escolha uma aula para vincular uma apresentação do Canva ou Google Slides.
        </p>
      </header>

      {pageError && (
        <div
          role="alert"
          style={{
            ...alertStyle,
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            boxShadow: '2px 2px 0px #181818',
          }}
        >
          <X size={18} /> {pageError}
        </div>
      )}

      <section
        className="doodle-card"
        style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}
      >
        <label
          htmlFor="sublevel-select"
          style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.5rem' }}
        >
          Selecione a trilha (subnível)
        </label>
        <select
          id="sublevel-select"
          value={selectedSubLevelId}
          onChange={(event) => setSelectedSubLevelId(event.target.value)}
          disabled={loadingSubLevels || subLevels.length === 0}
          style={{ ...fieldStyle, maxWidth: '420px', fontWeight: 'bold' }}
        >
          {loadingSubLevels && <option value="">A carregar subníveis...</option>}
          {!loadingSubLevels && subLevels.length === 0 && (
            <option value="">Nenhum subnível encontrado</option>
          )}
          {subLevels.map((subLevel) => (
            <option key={subLevel.id} value={subLevel.id}>
              {subLevel.name}
            </option>
          ))}
        </select>
      </section>

      {lessonsError && (
        <div
          role="alert"
          style={{
            ...alertStyle,
            backgroundColor: '#FEE2E2',
            color: '#991B1B',
            boxShadow: '2px 2px 0px #181818',
          }}
        >
          <X size={18} /> {lessonsError}
        </div>
      )}

      {loadingLessons ? (
        <p style={{ color: 'var(--text-muted)', fontWeight: 'bold' }}>A carregar aulas...</p>
      ) : lessons.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {lessons.map((lesson) => (
            <article
              key={lesson.id}
              className="doodle-card"
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                backgroundColor: '#FDFBF7',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Presentation size={24} color="var(--brand-red)" />
                <h2 style={{ fontSize: '1.15rem', color: '#181818', margin: 0 }}>
                  {lesson.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handleOpenModal(lesson)}
                style={{
                  marginTop: 'auto',
                  backgroundColor: '#FFFFFF',
                  color: '#181818',
                  border: '2px solid #181818',
                  borderRadius: '8px',
                  padding: '0.7rem 1rem',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #181818',
                  fontFamily: 'var(--font-subtitle)',
                }}
              >
                <Edit3 size={16} /> Vincular material
              </button>
            </article>
          ))}
        </div>
      ) : (
        !lessonsError && (
          <p style={{ color: 'var(--text-muted)' }}>
            {selectedSubLevelId
              ? 'Nenhuma aula encontrada para esta trilha.'
              : 'Selecione um subnível para ver as aulas.'}
          </p>
        )
      )}

      {activeLesson && (
        <div
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) handleCloseModal();
          }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 999,
            padding: '1rem',
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="material-modal-title"
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              border: '2px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '540px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '6px 6px 0px #181818',
              position: 'relative',
            }}
          >
            <button
              type="button"
              aria-label="Fechar"
              onClick={handleCloseModal}
              disabled={saving}
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                border: '2px solid #181818',
                borderRadius: '50%',
                backgroundColor: '#FFFFFF',
                width: '34px',
                height: '34px',
                display: 'grid',
                placeItems: 'center',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              <X size={18} color="#181818" />
            </button>

            <h2
              id="material-modal-title"
              style={{ fontSize: '1.3rem', margin: '0 2.5rem 1rem 0', color: '#181818' }}
            >
              Vincular material: {activeLesson.title}
            </h2>

            <div
              style={{
                backgroundColor: '#FFF3D6',
                border: '2px solid #181818',
                borderRadius: '8px',
                padding: '0.85rem',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.6rem',
              }}
            >
              <Info size={18} color="#181818" style={{ flexShrink: 0, marginTop: '2px' }} />
              <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.5 }}>
                Cole apenas o link de partilha do Canva ou Google Slides. Se colar um iframe,
                extrairemos o link automaticamente.
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                style={{ ...alertStyle, backgroundColor: '#FEE2E2', color: '#991B1B' }}
              >
                <X size={18} style={{ flexShrink: 0 }} /> <span>{formError}</span>
              </div>
            )}
            {formSuccess && (
              <div
                role="status"
                style={{
                  ...alertStyle,
                  backgroundColor: '#DCFCE7',
                  color: '#166534',
                }}
              >
                <CheckCircle size={18} /> {formSuccess}
              </div>
            )}

            <form onSubmit={handleSaveMaterial}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="material-title"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}
                >
                  Título do material
                </label>
                <input
                  id="material-title"
                  type="text"
                  required
                  maxLength={200}
                  value={materialTitle}
                  onChange={(event) => {
                    setMaterialTitle(event.target.value);
                    setFormSuccess('');
                  }}
                  style={fieldStyle}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="material-link"
                  style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem' }}
                >
                  Link de partilha
                </label>
                <textarea
                  id="material-link"
                  required
                  value={materialLink}
                  onChange={(event) => {
                    setMaterialLink(event.target.value);
                    setFormSuccess('');
                  }}
                  placeholder="https://www.canva.com/design/.../view"
                  rows={3}
                  style={{ ...fieldStyle, resize: 'vertical' }}
                />
              </div>

              <button
                type="submit"
                disabled={saving || Boolean(formSuccess)}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  borderRadius: '8px',
                  border: '2px solid #181818',
                  backgroundColor: 'var(--brand-red)',
                  color: '#FFFFFF',
                  cursor: saving || formSuccess ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: '3px 3px 0px #181818',
                  fontFamily: 'var(--font-subtitle)',
                  opacity: saving || formSuccess ? 0.7 : 1,
                }}
              >
                {saving
                  ? 'A guardar...'
                  : formSuccess
                    ? 'Material guardado'
                    : 'Guardar material'}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
