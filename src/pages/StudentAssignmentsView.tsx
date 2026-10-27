import { useEffect, useState } from 'react';
import { FileText, Clock, CheckCircle, Send, X, AlertCircle } from 'lucide-react';
import { api } from '../api/client';

interface Assignment {
  id: string;
  title: string;
  dueDate: string;
  status: 'Pending' | 'Submitted' | 'Corrected';
  lessonTitle?: string;
  description?: string; // O que o professor pediu
}

export function StudentAssignmentsView() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para o Modal de Entrega
  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadAssignments();
  }, []);

  async function loadAssignments() {
    try {
      // Ajuste para o endpoint real que lista as tarefas do aluno logado
      const res = await api.get<Assignment[]>('/Assignment/student/me'); 
      setAssignments(res.data || []);
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenTask = (task: Assignment) => {
    setActiveAssignment(task);
    setSubmissionContent('');
    setSuccessMessage('');
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAssignment || !submissionContent.trim()) return;

    setIsSubmitting(true);
    try {
      // Faz o POST da submissão para a API
      await api.post('/Submission', {
        assignmentId: activeAssignment.id,
        content: submissionContent
      });

      setSuccessMessage('Tarefa entregue com sucesso! 🎉');
      
      // Atualiza o status localmente para refletir na UI sem recarregar a página
      setAssignments(prev => prev.map(a => 
        a.id === activeAssignment.id ? { ...a, status: 'Submitted' } : a
      ));

      setTimeout(() => {
        setActiveAssignment(null);
        setIsSubmitting(false);
      }, 2000);

    } catch (err) {
      console.error('Erro ao enviar tarefa:', err);
      alert('Ocorreu um erro ao enviar a sua tarefa.');
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ fontWeight: 'bold' }}>A carregar as suas tarefas...</div>;

  const pendingTasks = assignments.filter(a => a.status === 'Pending');
  const completedTasks = assignments.filter(a => a.status !== 'Pending');

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          As Suas Tarefas
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Visualize as atividades publicadas pelo seu professor e envie as suas respostas.
        </p>
      </div>

      {/* TAREFAS PENDENTES */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <AlertCircle size={20} color="var(--brand-red)" /> Pendentes ({pendingTasks.length})
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '3rem' }}>
        {pendingTasks.length > 0 ? pendingTasks.map(task => (
          <div key={task.id} className="doodle-card" style={{ padding: '1.5rem', backgroundColor: '#FDFBF7', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
              <div style={{ backgroundColor: '#FEE2E2', padding: '0.5rem', borderRadius: '8px', border: '2px solid #181818' }}>
                <FileText size={24} color="var(--brand-red)" />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', color: '#181818', marginBottom: '0.2rem' }}>{task.title}</h3>
                <span style={{ fontSize: '0.8rem', color: '#555', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                  <Clock size={12} /> Prazo: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => handleOpenTask(task)}
              style={{ marginTop: 'auto', backgroundColor: 'var(--brand-red)', color: '#FFFFFF', border: '2px solid #181818', borderRadius: '8px', padding: '0.6rem 1rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', boxShadow: '2px 2px 0px #181818', fontFamily: 'var(--font-subtitle)' }}
            >
              Resolver Tarefa
            </button>
          </div>
        )) : (
          <p style={{ color: '#555' }}>Nenhuma tarefa pendente! Bom trabalho.</p>
        )}
      </div>

      {/* TAREFAS ENTREGUES */}
      <h2 style={{ fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <CheckCircle size={20} color="#166534" /> Entregues e Avaliadas
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
        {completedTasks.map(task => (
          <div key={task.id} className="doodle-card" style={{ padding: '1.5rem', backgroundColor: '#F4EFE6', opacity: 0.8 }}>
             <h3 style={{ fontSize: '1.1rem', color: '#181818', textDecoration: 'line-through' }}>{task.title}</h3>
             <span style={{ fontWeight: 'bold', color: task.status === 'Corrected' ? '#166534' : '#181818', fontSize: '0.85rem' }}>
               Status: {task.status === 'Corrected' ? 'Corrigida' : 'Aguardando Correção'}
             </span>
          </div>
        ))}
      </div>

      {/* MODAL DE RESOLUÇÃO DA TAREFA */}
      {activeAssignment && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(24, 24, 24, 0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: '1rem' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px solid #181818', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: '6px 6px 0px #181818', position: 'relative' }}>
            
            <button onClick={() => setActiveAssignment(null)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <X size={24} color="#181818" />
            </button>

            <h2 style={{ fontSize: '1.4rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
              {activeAssignment.title}
            </h2>
            
            <div style={{ backgroundColor: '#F4EFE6', padding: '1rem', borderRadius: '8px', border: '1px dashed #181818', marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Descrição da atividade:</h4>
              <p style={{ fontSize: '0.95rem', color: '#333' }}>
                {activeAssignment.description || 'Preencha o campo abaixo com a sua resposta para esta tarefa.'}
              </p>
            </div>

            {successMessage ? (
               <div style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '2px solid #181818', padding: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontWeight: 'bold' }}>
                 <CheckCircle size={20} /> {successMessage}
               </div>
            ) : (
              <form onSubmit={handleSubmitTask}>
                <label style={{ display: 'block', fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  A sua Resposta:
                </label>
                <textarea
                  required
                  rows={6}
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder="Escreva a sua resposta aqui..."
                  style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #181818', outline: 'none', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical', marginBottom: '1.5rem' }}
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ width: '100%', backgroundColor: '#181818', color: '#fff', border: '2px solid #181818', borderRadius: '8px', padding: '0.85rem', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-subtitle)' }}
                >
                  <Send size={18} /> {isSubmitting ? 'A Enviar...' : 'Enviar Tarefa'}
                </button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}