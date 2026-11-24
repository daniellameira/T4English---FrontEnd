import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, Search, Filter, CheckCircle, Lock } from 'lucide-react';
import { COURSE_CATALOG, getLessonAccessInfo } from '../data/courseCatalog';
import { api } from '../api/client';

export function StudentMaterials() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);

  useEffect(() => {
    api
      .get<string[]>('/Lesson/progress/me')
      .then((res) => setCompletedLessons(res.data || []))
      .catch((err) => console.error('Erro ao buscar progresso:', err))
      .finally(() => setIsLoadingProgress(false));
  }, []);

  const categories = useMemo(() => {
    const uniqueCategories = new Set(COURSE_CATALOG.map((lesson) => lesson.category));
    return ['Todos', ...Array.from(uniqueCategories)];
  }, []);

  const filteredLessons = useMemo(() => {
    return COURSE_CATALOG.filter((lesson) => {
      const matchesCategory = activeCategory === 'Todos' || lesson.category === activeCategory;
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        lesson.title.toLowerCase().includes(searchLower) ||
        lesson.theme.toLowerCase().includes(searchLower);

      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '2rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            color: 'var(--text-main)',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
          }}
        >
          Biblioteca de Aulas
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Explore os conteúdos, siga a trilha de estudos e acompanhe o seu progresso.
        </p>
      </div>

      {/* Área de Filtros e Pesquisa */}
      <div
        className="doodle-card"
        style={{
          backgroundColor: '#FDFBF7',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FFFFFF',
            border: '2px solid #181818',
            borderRadius: '12px',
            padding: '0.5rem 1rem',
            boxShadow: '2px 2px 0px rgba(0,0,0,0.1)',
          }}
        >
          <Search size={20} color="#555" style={{ marginRight: '0.75rem' }} />
          <input
            type="text"
            placeholder="Pesquisar por título ou tema da aula..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              width: '100%',
              fontSize: '1rem',
              fontFamily: 'inherit',
              backgroundColor: 'transparent',
            }}
          />
        </div>

        <div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
              fontWeight: 'bold',
              fontSize: '0.9rem',
              color: '#181818',
            }}
          >
            <Filter size={16} /> Filtrar por Módulo:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  style={{
                    backgroundColor: isActive ? '#181818' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#181818',
                    border: '2px solid #181818',
                    borderRadius: '20px',
                    padding: '0.5rem 1rem',
                    fontWeight: 'bold',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    boxShadow: isActive ? 'none' : '2px 2px 0px #181818',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-subtitle)',
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grelha de Aulas */}
      {filteredLessons.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {filteredLessons.map((lesson) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const { isLocked, prerequisiteTitle } = isLoadingProgress
              ? { isLocked: false, prerequisiteTitle: undefined }
              : getLessonAccessInfo(lesson, completedLessons);

            return (
              <div
                key={lesson.id}
                className="doodle-card"
                style={{
                  backgroundColor: isLocked ? '#F4EFE6' : '#FFFFFF',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  position: 'relative',
                  opacity: isLocked ? 0.85 : isCompleted ? 0.95 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLocked) e.currentTarget.style.transform = 'translateY(-5px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Selo de Concluída */}
                {isCompleted && !isLocked && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '-12px',
                      backgroundColor: '#DCFCE7',
                      color: '#166534',
                      border: '3px solid #181818',
                      borderRadius: '50%',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transform: 'rotate(15deg)',
                      boxShadow: '3px 3px 0px #181818',
                      zIndex: 10,
                    }}
                    title="Aula já concluída!"
                  >
                    <CheckCircle size={24} strokeWidth={3} />
                  </div>
                )}

                {/* Selo de Bloqueada */}
                {isLocked && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-12px',
                      right: '-12px',
                      backgroundColor: '#FEF3C7',
                      color: '#92400E',
                      border: '3px solid #181818',
                      borderRadius: '50%',
                      width: '45px',
                      height: '45px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '3px 3px 0px #181818',
                      zIndex: 10,
                    }}
                    title={`Conclua "${prerequisiteTitle}" para liberar`}
                  >
                    <Lock size={20} strokeWidth={2.5} />
                  </div>
                )}

                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: isLocked ? '#FFFFFF' : '#F4EFE6',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    border: '1px solid #181818',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                    alignSelf: 'flex-start',
                  }}
                >
                  {lesson.category}
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: isLocked
                        ? '#E5E7EB'
                        : isCompleted
                        ? '#DCFCE7'
                        : '#FEE2E2',
                      width: '45px',
                      height: '45px',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px solid #181818',
                      flexShrink: 0,
                    }}
                  >
                    {isLocked ? (
                      <Lock size={20} color="#4B5563" />
                    ) : (
                      <BookOpen size={20} color={isCompleted ? '#166534' : 'var(--brand-red)'} />
                    )}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: '1.2rem',
                        color: '#181818',
                        marginBottom: '0.2rem',
                        lineHeight: '1.2',
                      }}
                    >
                      {lesson.title}
                    </h3>
                  </div>
                </div>

                <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                  {isLocked && prerequisiteTitle
                    ? `Conclua "${prerequisiteTitle}" para desbloquear este conteúdo.`
                    : lesson.theme}
                </p>

                <button
                  type="button"
                  disabled={isLocked || isLoadingProgress}
                  onClick={() => {
                    if (!isLocked) {
                      navigate(`/lesson/${encodeURIComponent(lesson.id)}`);
                    }
                  }}
                  style={{
                    backgroundColor: isLocked
                      ? '#E5E7EB'
                      : isCompleted
                      ? '#FFFFFF'
                      : 'var(--brand-red)',
                    color: isLocked ? '#4B5563' : isCompleted ? '#181818' : '#FFFFFF',
                    border: '2px solid #181818',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    width: '100%',
                    boxShadow: isLocked ? 'none' : '2px 2px 0px #181818',
                    cursor: isLocked || isLoadingProgress ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-subtitle)',
                  }}
                >
                  {isLocked ? (
                    <>
                      <Lock size={17} /> Aula Bloqueada
                    </>
                  ) : (
                    <>
                      <PlayCircle size={18} /> {isCompleted ? 'Revisar Aula' : 'Estudar Aula'}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <div
          className="doodle-card"
          style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}
        >
          <Search size={48} color="#181818" style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <h3 style={{ color: '#181818', marginBottom: '0.5rem' }}>Nenhuma aula encontrada</h3>
          <p style={{ color: '#555555', fontFamily: 'var(--font-subtitle)' }}>
            Tente procurar por outro termo ou limpe os filtros selecionados.
          </p>
        </div>
      )}
    </div>
  );
}