import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, PlayCircle, Search, Filter, CheckCircle } from 'lucide-react';
import { COURSE_CATALOG } from '../data/courseCatalog';
import { api } from '../api/client';

export function StudentMaterials() {
  const navigate = useNavigate();

  // Estados para os filtros
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  // NOVO: Estado para guardar os IDs das aulas já concluídas pelo aluno
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  // NOVO: Busca o progresso assim que a página carrega
  useEffect(() => {
    api.get<string[]>('/Lesson/progress/me')
      .then(res => setCompletedLessons(res.data || []))
      .catch(err => console.error('Erro ao buscar progresso:', err));
  }, []);

  // Extrai as categorias únicas do nosso catálogo automaticamente
  const categories = useMemo(() => {
    const uniqueCategories = new Set(COURSE_CATALOG.map(lesson => lesson.category));
    return ['Todos', ...Array.from(uniqueCategories)];
  }, []);

  // Filtra as aulas combinando a categoria escolhida e o texto pesquisado
  const filteredLessons = useMemo(() => {
    return COURSE_CATALOG.filter(lesson => {
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
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
          Biblioteca de Aulas
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Explore os conteúdos, pesquise por temas e inicie os seus estudos.
        </p>
      </div>

      {/* Área de Filtros e Pesquisa */}
      <div className="doodle-card" style={{ backgroundColor: '#FDFBF7', padding: '1.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Barra de Pesquisa */}
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#FFFFFF', border: '2px solid #181818', borderRadius: '12px', padding: '0.5rem 1rem', boxShadow: '2px 2px 0px rgba(0,0,0,0.1)' }}>
          <Search size={20} color="#555" style={{ marginRight: '0.75rem' }} />
          <input 
            type="text" 
            placeholder="Pesquisar por título ou tema da aula..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '1rem', fontFamily: 'inherit', backgroundColor: 'transparent' }}
          />
        </div>

        {/* Pílulas de Categoria */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 'bold', fontSize: '0.9rem', color: '#181818' }}>
            <Filter size={16} /> Filtrar por Módulo:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {categories.map(category => {
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
                    fontFamily: 'var(--font-subtitle)'
                  }}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {filteredLessons.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredLessons.map(lesson => {
      // VERIFICA SE ESTA AULA ESPECÍFICA ESTÁ CONCLUÍDA
            const isCompleted = completedLessons.includes(lesson.id);
            return (
              <div 
                key={lesson.id} 
                className="doodle-card"
                style={{ 
                  backgroundColor: '#FFFFFF', 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  position: 'relative', // Importante para o selo ficar colado ao card!
                  opacity: isCompleted ? 0.9 : 1 // Dá uma leve transparência se já estiver concluído
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                
                {/* SELO DOODLE DE AULA CONCLUÍDA */}
                {isCompleted && (
                  <div style={{
                    position: 'absolute', top: '-12px', right: '-12px', backgroundColor: '#DCFCE7', color: '#166534', border: '3px solid #181818', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: 'rotate(15deg)', boxShadow: '3px 3px 0px #181818', zIndex: 10
                  }} title="Aula já concluída!">
                    <CheckCircle size={24} strokeWidth={3} />
                  </div>
                )}

                <div style={{ display: 'inline-block', backgroundColor: '#F4EFE6', padding: '0.25rem 0.75rem', borderRadius: '12px', border: '1px solid #181818', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '1rem', alignSelf: 'flex-start' }}>
                  {lesson.category}
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                  <div style={{ backgroundColor: isCompleted ? '#DCFCE7' : '#FEE2E2', width: '45px', height: '45px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #181818', flexShrink: 0 }}>
                    <BookOpen size={20} color={isCompleted ? '#166534' : 'var(--brand-red)'} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: '#181818', marginBottom: '0.2rem', lineHeight: '1.2' }}>
                      {lesson.title}
                    </h3>
                  </div>
                </div>
                
                <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                  {lesson.theme}
                </p>

                <button
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  style={{
                    backgroundColor: isCompleted ? '#FFFFFF' : 'var(--brand-red)', 
                    color: isCompleted ? '#181818' : '#FFFFFF', 
                    border: '2px solid #181818', borderRadius: '8px', padding: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', boxShadow: '2px 2px 0px #181818', cursor: 'pointer', fontFamily: 'var(--font-subtitle)'
                  }}
                >
                  <PlayCircle size={18} /> {isCompleted ? 'Revisar Aula' : 'Estudar Aula'}
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        // Estado Vazio (Caso a pesquisa não encontre nada)
        <div className="doodle-card" style={{ padding: '4rem 2rem', textAlign: 'center', backgroundColor: '#FFFFFF' }}>
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