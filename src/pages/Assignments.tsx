import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useAuth } from '../contexts/AuthContext';
import { isAxiosError } from 'axios';
import {
  PlusCircle,
  CheckCircle,
  Calendar,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  lessonId: string;
  isCompleted?: boolean;
}

interface SubLevelOption {
  id: string;
  name: string;
}

interface LessonOption {
  id: string;
  title: string;
}

interface AssignmentErrorResponse {
  message?: string;
}

export function Assignments() {
  const { user } = useAuth();
  const isProfessor = user?.role?.toUpperCase() === 'PROFESSOR';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subLevels, setSubLevels] = useState<SubLevelOption[]>([]);
  const [lessons, setLessons] = useState<LessonOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros da página principal (isolados)
  const [filterSubLevelId, setFilterSubLevelId] = useState('');
  const [filterLessonId, setFilterLessonId] = useState('');

  // Estados do Modal (Criação / Edição)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Campos do Formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [modalSubLevelId, setModalSubLevelId] = useState('');
  const [modalLessonId, setModalLessonId] = useState('');
  const [modalLessons, setModalLessons] = useState<LessonOption[]>([]);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // 1. Carregar subníveis iniciais ao abrir a página
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await api.get('/Level/sublevels').catch(() => null);

        if (
          res?.data &&
          Array.isArray(res.data) &&
          res.data.length > 0
        ) {
          setSubLevels(res.data);
          setFilterSubLevelId(res.data[0].id);
          setModalSubLevelId(res.data[0].id);
        } else {
          const fallback: SubLevelOption[] = [
            {
              id: '552c972b-be2b-4b25-adf5-0964b3f01444',
              name: 'Básico - First Step',
            },
            {
              id: '13a077f9-d7c8-4b09-bc32-5cc1e5d89548',
              name: 'Básico - Basic Level 2',
            },
          ];

          setSubLevels(fallback);
          setFilterSubLevelId(fallback[0].id);
          setModalSubLevelId(fallback[0].id);
        }
      } catch (err) {
        console.error('Erro ao carregar subníveis:', err);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  // 2. Carregar lições do filtro principal
  useEffect(() => {
    if (!filterSubLevelId) {
      return;
    }

    api
      .get(`/Lesson/sublevel/${filterSubLevelId}`)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setLessons(res.data);
          setFilterLessonId(res.data[0].id);
        } else {
          setLessons([]);
          setFilterLessonId('');
          setAssignments([]);
        }
      })
      .catch(() => {
        setLessons([]);
        setFilterLessonId('');
        setAssignments([]);
      });
  }, [filterSubLevelId]);

  // 3. Carregar tarefas da lição selecionada no filtro principal
  useEffect(() => {
    if (!filterLessonId) {
      return;
    }

    api
      .get(`/Assignment/lesson/${filterLessonId}`)
      .then((res) => setAssignments(res.data || []))
      .catch(() => setAssignments([]));
  }, [filterLessonId]);

  // 4. Carregar lições para o Modal (Criação/Edição)
  useEffect(() => {
    if (!modalSubLevelId) {
      return;
    }

    api
      .get(`/Lesson/sublevel/${modalSubLevelId}`)
      .then((res) => {
        const lessonData = res.data || [];
        setModalLessons(lessonData);

        if (lessonData.length > 0 && !editingId) {
          setModalLessonId(lessonData[0].id);
        }
      })
      .catch(() => setModalLessons([]));
  }, [modalSubLevelId, editingId]);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setDueDate('');
    setFormError('');
    setFormSuccess('');

    if (subLevels.length > 0) {
      setModalSubLevelId(subLevels[0].id);
    }

    setModalLessonId('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (assignment: Assignment) => {
    setEditingId(assignment.id);
    setTitle(assignment.title);
    setDescription(assignment.description);
    setDueDate(
      assignment.dueDate ? assignment.dueDate.split('T')[0] : ''
    );
    setModalLessonId(assignment.lessonId);
    setFormError('');
    setFormSuccess('');
    setIsModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();

    setFormError('');
    setFormSuccess('');

    if (!modalLessonId) {
      setFormError('Selecione uma lição válida.');
      return;
    }

    try {
      const payload = {
        title,
        description,
        dueDate: new Date(dueDate).toISOString(),
        lessonId: modalLessonId,
      };

      if (editingId) {
        // Atualizar Tarefa
        await api
          .put(`/Assignment/${editingId}`, payload)
          .catch(() => api.post(`/Assignment/${editingId}`, payload));

        setFormSuccess('Tarefa atualizada com sucesso!');
      } else {
        // Criar Tarefa
        await api.post('/Assignment', payload);
        setFormSuccess('Tarefa criada com sucesso!');
      }

      setIsModalOpen(false);

      if (filterLessonId) {
        const res = await api.get(
          `/Assignment/lesson/${filterLessonId}`
        );
        setAssignments(res.data || []);
      }
    } catch (err: unknown) {
      console.error('Erro ao salvar tarefa:', err);
      const errorMessage = isAxiosError<AssignmentErrorResponse>(err)
        ? err.response?.data?.message
        : undefined;
      setFormError(
        errorMessage || 'Erro ao salvar tarefa.'
      );
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      await api.delete(`/Assignment/${id}`);
      setAssignments((current) =>
        current.filter((assignment) => assignment.id !== id)
      );
    } catch (err) {
      console.error('Erro ao excluir tarefa:', err);
      alert('Não foi possível excluir a tarefa.');
    }
  };

  const handleCompleteAssignment = async (assignmentId: string) => {
    try {
      await api.post(`/Assignment/${assignmentId}/submit`);

      if (filterLessonId) {
        const res = await api.get(
          `/Assignment/lesson/${filterLessonId}`
        );
        setAssignments(res.data || []);
      }
    } catch (err) {
      console.error('Erro ao submeter tarefa:', err);
    }
  };

  if (loading) {
    return <div>Carregando dados...</div>;
  }

  return (
    <div>
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <h1>{isProfessor ? 'Gerenciamento de Tarefas' : 'Minhas Tarefas'}</h1>
          <p>Filtre por subnível e lição para visualizar as atividades.</p>
        </div>

        {isProfessor && (
          <button
            type="button"
            onClick={handleOpenCreateModal}
            style={{
              backgroundColor: 'var(--brand-red)',
              color: 'var(--white)',
              border: '2px solid #181818',
              boxShadow: '3px 3px 0px #181818',
              borderRadius: '8px',
              padding: '0.75rem 1.25rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-subtitle)',
            }}
          >
            <PlusCircle size={18} />
            Nova Tarefa
          </button>
        )}
      </div>

      {/* Filtros Principais da Página (Isolados) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
            }}
          >
            Filtrar Subnível:
          </label>

          <select
            value={filterSubLevelId}
            onChange={(e) => {
              setFilterSubLevelId(e.target.value);
              setFilterLessonId('');
              setLessons([]);
              setAssignments([]);
            }}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '2px solid #181818',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          >
            <option value="">Selecione o subnível...</option>

            {subLevels.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '0.4rem',
            }}
          >
            Filtrar Lição:
          </label>

          <select
            value={filterLessonId}
            onChange={(e) => setFilterLessonId(e.target.value)}
            disabled={!filterSubLevelId || lessons.length === 0}
            style={{
              width: '100%',
              padding: '0.6rem',
              borderRadius: '6px',
              border: '2px solid #181818',
              outline: 'none',
              backgroundColor: '#fff',
            }}
          >
            <option value="">Selecione a lição...</option>

            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Alerta de Sucesso */}
      {formSuccess && !isModalOpen && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem',
            borderRadius: '6px',
            backgroundColor: '#DCFCE7',
            border: '1px solid #166534',
          }}
        >
          {formSuccess}
        </div>
      )}

      {/* Lista de Tarefas */}
      {assignments.length > 0 ? (
        assignments.map((assignment) => (
          <div
            key={assignment.id}
            style={{
              border: '2px solid #181818',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem',
              boxShadow: '3px 3px 0px #181818',
              backgroundColor: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '1rem',
              }}
            >
              <div style={{ flex: 1 }}>
                <h3 style={{ marginTop: 0 }}>{assignment.title}</h3>

                <p>{assignment.description}</p>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.9rem',
                  }}
                >
                  <Calendar size={16} />
                  Entrega:{' '}
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleDateString(
                        'pt-BR'
                      )
                    : 'Sem data'}
                </div>
              </div>

              {isProfessor && (
                <div
                  style={{
                    display: 'flex',
                    gap: '0.5rem',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(assignment)}
                    title="Editar Tarefa"
                    style={{
                      backgroundColor: '#FEF08A',
                      border: '2px solid #181818',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #181818',
                    }}
                  >
                    <Edit3 size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteAssignment(assignment.id)
                    }
                    title="Excluir Tarefa"
                    style={{
                      backgroundColor: '#FEE2E2',
                      border: '2px solid #181818',
                      borderRadius: '6px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #181818',
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>

            {!isProfessor && (
              <div style={{ marginTop: '1rem' }}>
                {assignment.isCompleted ? (
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      fontWeight: 'bold',
                    }}
                  >
                    <CheckCircle size={18} />
                    Entregue
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      handleCompleteAssignment(assignment.id)
                    }
                    style={{
                      backgroundColor: 'var(--brand-red)',
                      color: '#fff',
                      border: '2px solid #181818',
                      padding: '0.6rem 1.25rem',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.85rem',
                      boxShadow: '2px 2px 0px #181818',
                      fontFamily: 'var(--font-subtitle)',
                    }}
                  >
                    Marcar como Entregue
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      ) : (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            border: '1px dashed #999',
            borderRadius: '8px',
          }}
        >
          Nenhuma tarefa cadastrada para a lição selecionada.
        </div>
      )}

      {/* Modal para Criar / Editar Tarefa (Professor) */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#fff',
              borderRadius: '10px',
              border: '2px solid #181818',
              boxShadow: '5px 5px 0px #181818',
              padding: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              title="Fechar"
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h2>
              {editingId ? 'Editar Tarefa' : 'Nova Tarefa'}
            </h2>

            {formError && (
              <div
                style={{
                  marginBottom: '1rem',
                  padding: '0.75rem',
                  borderRadius: '6px',
                  backgroundColor: '#FEE2E2',
                  border: '1px solid #991B1B',
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveAssignment}>
              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Título da Tarefa
                </label>

                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Homework Lesson 02"
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--bg-bege-dark)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Instruções / Descrição
                </label>

                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva o que o aluno deve realizar..."
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--bg-bege-dark)',
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Data Limite de Entrega
                </label>

                <input
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '1px solid var(--bg-bege-dark)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Subnível:
                </label>

                <select
                  value={modalSubLevelId}
                  onChange={(e) => {
                    setModalSubLevelId(e.target.value);
                    setModalLessonId('');
                    setModalLessons([]);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '2px solid #181818',
                    outline: 'none',
                    backgroundColor: '#fff',
                  }}
                >
                  <option value="">Selecione o subnível...</option>

                  {subLevels.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    marginBottom: '0.4rem',
                  }}
                >
                  Lição Destino:
                </label>

                <select
                  required
                  value={modalLessonId}
                  onChange={(e) => setModalLessonId(e.target.value)}
                  disabled={modalLessons.length === 0}
                  style={{
                    width: '100%',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '2px solid #181818',
                    outline: 'none',
                    backgroundColor: '#fff',
                  }}
                >
                  {modalLessons.length === 0 && (
                    <option value="">
                      Nenhuma lição disponível
                    </option>
                  )}

                  {modalLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '2px solid #181818',
                    backgroundColor: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '0.6rem',
                    borderRadius: '6px',
                    border: '2px solid #181818',
                    backgroundColor: 'var(--brand-red)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
