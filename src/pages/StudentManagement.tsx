import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { isAxiosError } from 'axios';
import { COURSE_CATALOG, getCourseProgressSummary } from '../data/courseCatalog';
import { calculateStudentEngagement } from '../utils/studentEngagement';
import type {
  EngagementBreakdown,
  StudentAssignmentActivity,
  StudentLessonActivity,
} from '../utils/studentEngagement';
import {
  Users,
  UserPlus,
  Search,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Edit3,
  UserX,
  UserCheck,
  Lock,
  Unlock,
  Copy,
  Check,
  Award,
  Layers,
  X,
  ShieldAlert,
  BookOpen,
  FileCheck2,
  BarChart3,
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  subLevelId?: string | null;
  subLevelName?: string | null;
  subLevel?: { id?: string; name: string } | null;
  levelName?: string | null;
}

interface LevelOption {
  id: string;
  name: string;
  subLevels?: LevelOption[];
}

interface CatalogProgressRecord {
  studentId: string;
  catalogLessonId: string;
  completedAt?: string | null;
}

interface AssignmentMeta {
  id: string;
  title: string;
  dueDate?: string | null;
}

interface AssignmentSubmissionRecord {
  assignmentId: string;
  studentId: string;
  submittedAt?: string | null;
  grade?: number | null;
}

interface StudentValidationError {
  message?: string;
  errors?: Record<string, string[]>;
}

type StatusFilter = 'all' | 'active' | 'inactive';

function getField(obj: Record<string, unknown>, keyName: string): unknown {
  const match = Object.keys(obj).find((k) => k.toLowerCase() === keyName.toLowerCase());
  return match === undefined ? undefined : obj[match];
}

function normalizeStudent(raw: unknown): Student | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const item = raw as Record<string, unknown>;

  const id = getField(item, 'id');
  const name = getField(item, 'name');
  const email = getField(item, 'email');

  if (typeof id !== 'string' || typeof name !== 'string' || typeof email !== 'string') {
    return null;
  }

  const rawIsActive = getField(item, 'isActive') ?? getField(item, 'active');
  const isActive = typeof rawIsActive === 'boolean' ? rawIsActive : true;

  const subLevelId = getField(item, 'subLevelId');
  const subLevelName = getField(item, 'subLevelName');
  const levelName = getField(item, 'levelName');
  const rawSubLevel = getField(item, 'subLevel');

  let parsedSubLevel: { id?: string; name: string } | null = null;
  if (typeof rawSubLevel === 'object' && rawSubLevel !== null) {
    const subObj = rawSubLevel as Record<string, unknown>;
    const subName = getField(subObj, 'name');
    const subId = getField(subObj, 'id');
    if (typeof subName === 'string') {
      parsedSubLevel = {
        id: typeof subId === 'string' ? subId : undefined,
        name: subName,
      };
    }
  }

  return {
    id,
    name,
    email,
    isActive,
    subLevelId:
      typeof subLevelId === 'string' && subLevelId.trim()
        ? subLevelId
        : parsedSubLevel?.id ?? null,
    subLevelName: typeof subLevelName === 'string' && subLevelName.trim() ? subLevelName : null,
    subLevel: parsedSubLevel,
    levelName: typeof levelName === 'string' && levelName.trim() ? levelName : null,
  };
}

export function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subLevels, setSubLevels] = useState<LevelOption[]>([]);
  const [progressRecords, setProgressRecords] = useState<CatalogProgressRecord[]>([]);
  const [assignmentsList, setAssignmentsList] = useState<AssignmentMeta[]>([]);
  const [submissionsRecords, setSubmissionsRecords] = useState<AssignmentSubmissionRecord[]>([]);

  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados do Modal (Criar / Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isIdentityUnlocked, setIsIdentityUnlocked] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subLevelId, setSubLevelId] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados do Modal de Confirmação (Desativar / Reativar)
  const [statusTargetStudent, setStatusTargetStudent] = useState<Student | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Modal de Detalhes de Assiduidade do Aluno
  const [engagementModalTarget, setEngagementModalTarget] = useState<{
    student: Student;
    breakdown: EngagementBreakdown;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setRefreshing(true);
    try {
      const [studentsRes, levelsRes, progressRes, assignmentsRes] = await Promise.all([
        api.get<unknown>('/Student').catch(() => null),
        api.get<LevelOption[]>('/Level').catch(() => null),
        api.get<unknown>('/Lesson/catalog/feedbacks').catch(() => null),
        api.get<unknown>('/Assignment').catch(() => null),
      ]);

      if (studentsRes?.data && Array.isArray(studentsRes.data)) {
        const normalized = studentsRes.data
          .map(normalizeStudent)
          .filter((s): s is Student => s !== null);
        setStudents(normalized);
      }

      if (levelsRes?.data && Array.isArray(levelsRes.data)) {
        const extracted: LevelOption[] = [];
        levelsRes.data.forEach((lvl) => {
          if (lvl.subLevels && Array.isArray(lvl.subLevels) && lvl.subLevels.length > 0) {
            lvl.subLevels.forEach((sub) => {
              extracted.push({ id: sub.id, name: `${lvl.name} - ${sub.name}` });
            });
          } else {
            extracted.push({ id: lvl.id, name: lvl.name });
          }
        });
        setSubLevels(extracted);
      }

      if (progressRes?.data && Array.isArray(progressRes.data)) {
        const parsedProgress: CatalogProgressRecord[] = [];
        for (const raw of progressRes.data) {
          if (typeof raw === 'object' && raw !== null) {
            const rec = raw as Record<string, unknown>;
            const sId = getField(rec, 'studentId');
            const lId = getField(rec, 'catalogLessonId');
            const rawDate =
              getField(rec, 'createdAt') ??
              getField(rec, 'submittedAt') ??
              getField(rec, 'updatedAt');

            if (typeof sId === 'string' && typeof lId === 'string') {
              parsedProgress.push({
                studentId: sId,
                catalogLessonId: lId,
                completedAt: typeof rawDate === 'string' ? rawDate : null,
              });
            }
          }
        }
        setProgressRecords(parsedProgress);
      }

      // Carrega tarefas e suas entregas para cruzar assiduidade automaticamente
      if (assignmentsRes?.data && Array.isArray(assignmentsRes.data)) {
        const parsedAssignments: AssignmentMeta[] = [];
        for (const raw of assignmentsRes.data) {
          if (typeof raw === 'object' && raw !== null) {
            const item = raw as Record<string, unknown>;
            const id = getField(item, 'id');
            const title = getField(item, 'title');
            const dueDate = getField(item, 'dueDate');
            if (typeof id === 'string') {
              parsedAssignments.push({
                id,
                title: typeof title === 'string' ? title : 'Tarefa',
                dueDate: typeof dueDate === 'string' ? dueDate : null,
              });
            }
          }
        }
        setAssignmentsList(parsedAssignments);

        if (parsedAssignments.length > 0) {
          const submissionsResponses = await Promise.all(
            parsedAssignments.map((assignment) =>
              api
                .get<unknown>(`/Assignment/${assignment.id}/submissions`)
                .then((res) => ({ assignmentId: assignment.id, data: res.data }))
                .catch(() => null)
            )
          );

          const allSubs: AssignmentSubmissionRecord[] = [];
          for (const entry of submissionsResponses) {
            if (!entry || !Array.isArray(entry.data)) continue;
            for (const rawSub of entry.data) {
              if (typeof rawSub === 'object' && rawSub !== null) {
                const subObj = rawSub as Record<string, unknown>;
                const studentId = getField(subObj, 'studentId');
                const submittedAt = getField(subObj, 'submittedAt');
                const rawGrade = getField(subObj, 'grade');
                if (typeof studentId === 'string') {
                  allSubs.push({
                    assignmentId: entry.assignmentId,
                    studentId,
                    submittedAt: typeof submittedAt === 'string' ? submittedAt : null,
                    grade: typeof rawGrade === 'number' ? rawGrade : null,
                  });
                }
              }
            }
          }
          setSubmissionsRecords(allSubs);
        } else {
          setSubmissionsRecords([]);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  // Agrupa aulas concluídas por aluno
  const lessonsByStudent = useMemo(() => {
    const map = new Map<string, StudentLessonActivity[]>();
    for (const entry of progressRecords) {
      const list = map.get(entry.studentId) ?? [];
      if (!list.some((item) => item.catalogLessonId === entry.catalogLessonId)) {
        list.push({
          catalogLessonId: entry.catalogLessonId,
          completedAt: entry.completedAt,
        });
      }
      map.set(entry.studentId, list);
    }
    return map;
  }, [progressRecords]);

  // Calcula o índice de assiduidade automático para cada aluno
  const engagementByStudentId = useMemo(() => {
    const totalLessons = COURSE_CATALOG.filter((l) => l.isSequential).length || 47;
    const map = new Map<string, EngagementBreakdown>();

    for (const student of students) {
      const studentLessons = lessonsByStudent.get(student.id) ?? [];
      const studentSubs = submissionsRecords.filter((s) => s.studentId === student.id);

      const studentAssignments: StudentAssignmentActivity[] = assignmentsList.map((assignment) => {
        const sub = studentSubs.find((s) => s.assignmentId === assignment.id);
        return {
          assignmentId: assignment.id,
          dueDate: assignment.dueDate,
          isSubmitted: Boolean(sub),
          grade: sub?.grade ?? null,
        };
      });

      map.set(
        student.id,
        calculateStudentEngagement({
          lessons: studentLessons,
          assignments: studentAssignments,
          totalCatalogLessons: totalLessons,
        })
      );
    }

    return map;
  }, [students, lessonsByStudent, assignmentsList, submissionsRecords]);

  const getStudentLevelDisplay = (student: Student): string | null => {
    if (student.subLevelName) return student.subLevelName;
    if (student.subLevel?.name) return student.subLevel.name;
    if (student.levelName) return student.levelName;
    if (student.subLevelId) {
      const matched = subLevels.find((lvl) => lvl.id === student.subLevelId);
      if (matched) return matched.name;
    }
    return null;
  };

  // Métricas resumidas do topo
  const metrics = useMemo(() => {
    const activeStudents = students.filter((s) => s.isActive);
    const inactiveCount = students.length - activeStudents.length;

    const avgEngagement =
      activeStudents.length > 0
        ? Math.round(
            activeStudents.reduce(
              (sum, s) => sum + (engagementByStudentId.get(s.id)?.score ?? 100),
              0
            ) / activeStudents.length
          )
        : 100;

    const withoutLevelCount = activeStudents.filter((s) => !getStudentLevelDisplay(s)).length;

    return {
      activeCount: activeStudents.length,
      inactiveCount,
      avgEngagement,
      withoutLevelCount,
    };
  }, [students, subLevels, engagementByStudentId]);

  const handleOpenCreateModal = () => {
    setEditingStudent(null);
    setIsIdentityUnlocked(true);
    setName('');
    setEmail('');
    setPassword('');
    setSubLevelId('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (student: Student) => {
    setEditingStudent(student);
    setIsIdentityUnlocked(false);
    setName(student.name);
    setEmail(student.email);
    setPassword('');

    if (student.subLevelId) {
      setSubLevelId(student.subLevelId);
    } else {
      const displayLabel = getStudentLevelDisplay(student);
      const matchedOption = displayLabel
        ? subLevels.find((lvl) => lvl.name.toLowerCase() === displayLabel.toLowerCase())
        : undefined;
      setSubLevelId(matchedOption?.id ?? '');
    }

    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setSaving(true);

    try {
      const normalizedSubLevelId = subLevelId.trim() ? subLevelId.trim() : null;

      if (editingStudent) {
        const finalName = isIdentityUnlocked ? name.trim() : editingStudent.name;
        const finalEmail = isIdentityUnlocked ? email.trim() : editingStudent.email;

        await api.put(`/Student/${editingStudent.id}`, {
          name: finalName,
          email: finalEmail,
          subLevelId: normalizedSubLevelId,
          isActive: editingStudent.isActive,
          ...(isIdentityUnlocked && password.trim()
            ? {
                newPassword: password.trim(),
                initialPassword: password.trim(),
              }
            : {}),
        });
        setFormSuccess('Dados do aluno atualizados com sucesso!');
      } else {
        await api.post('/Student', {
          name: name.trim(),
          email: email.trim(),
          initialPassword: password,
          subLevelId: normalizedSubLevelId,
        });
        setFormSuccess('Aluno cadastrado com sucesso!');
      }

      setName('');
      setEmail('');
      setPassword('');
      setSubLevelId('');
      setEditingStudent(null);
      setIsModalOpen(false);
      await loadData();
    } catch (err: unknown) {
      const responseData = isAxiosError<StudentValidationError>(err)
        ? err.response?.data
        : undefined;
      console.error('Erro retornado pela API:', responseData);

      if (responseData?.errors) {
        const messages = Object.values(responseData.errors).flat().join(' | ');
        setFormError(messages);
      } else if (responseData?.message) {
        setFormError(responseData.message);
      } else if (isAxiosError(err) && typeof err.response?.data === 'string') {
        setFormError(err.response.data);
      } else {
        setFormError(
          editingStudent
            ? 'Não foi possível atualizar o aluno. Verifique se o endpoint PUT /api/Student/{id} está ativo.'
            : 'Erro ao cadastrar aluno. Verifique os dados e tente novamente.'
        );
      }
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmStatusToggle = async () => {
    if (!statusTargetStudent) return;

    const nextIsActive = !statusTargetStudent.isActive;
    setUpdatingStatus(true);
    setFormSuccess('');

    try {
      try {
        await api.patch(`/Student/${statusTargetStudent.id}/status`, {
          isActive: nextIsActive,
        });
      } catch (patchErr) {
        if (
          isAxiosError(patchErr) &&
          (patchErr.response?.status === 404 || patchErr.response?.status === 405)
        ) {
          await api.put(`/Student/${statusTargetStudent.id}`, {
            name: statusTargetStudent.name,
            email: statusTargetStudent.email,
            subLevelId: statusTargetStudent.subLevelId ?? null,
            isActive: nextIsActive,
          });
        } else {
          throw patchErr;
        }
      }

      setStudents((prev) =>
        prev.map((s) =>
          s.id === statusTargetStudent.id ? { ...s, isActive: nextIsActive } : s
        )
      );

      setFormSuccess(
        nextIsActive
          ? `Acesso de "${statusTargetStudent.name}" reativado com sucesso!`
          : `Acesso de "${statusTargetStudent.name}" desabilitado. O histórico de aulas foi mantido.`
      );
      setStatusTargetStudent(null);
    } catch (err) {
      console.error('Erro ao alterar status do aluno:', err);
      const msg = isAxiosError<StudentValidationError>(err)
        ? err.response?.data?.message
        : undefined;
      alert(msg || 'Não foi possível alterar o status de acesso do aluno.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCopyInvite = async (
    studentName: string,
    studentEmail: string,
    studentPassword?: string,
    copyKey = 'modal'
  ) => {
    const loginUrl = `${window.location.origin}/login`;
    const lines = [
      `Olá, ${studentName || 'aluno(a)'}! Segue seu acesso à plataforma *T4 English*:`,
      `🔗 Link: ${loginUrl}`,
      `📧 E-mail: ${studentEmail}`,
    ];

    if (studentPassword && studentPassword.trim()) {
      lines.push(`🔑 Senha provisória: ${studentPassword.trim()}`);
    }

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      setCopiedId(copyKey);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      alert('Não foi possível copiar automaticamente para a área de transferência.');
    }
  };

  const filteredStudents = useMemo(() => {
    const query = search.toLowerCase();

    return students.filter((s) => {
      if (statusFilter === 'active' && !s.isActive) return false;
      if (statusFilter === 'inactive' && s.isActive) return false;

      const matchesSearch =
        s.name?.toLowerCase().includes(query) || s.email?.toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (levelFilter === 'all') return true;
      const levelDisplay = getStudentLevelDisplay(s);
      if (levelFilter === 'none') return !levelDisplay;

      return (
        s.subLevelId === levelFilter ||
        levelDisplay?.toLowerCase() ===
          subLevels.find((l) => l.id === levelFilter)?.name.toLowerCase()
      );
    });
  }, [students, search, levelFilter, statusFilter, subLevels]);

  if (loading) {
    return (
      <div style={{ color: 'var(--text-main)', fontWeight: 'bold', padding: '2rem' }}>
        Carregando alunos...
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1150px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Cabeçalho */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.9rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            Gerenciamento de Alunos
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Cadastre, edite, gerencie permissões de acesso e acompanhe a evolução da turma.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            onClick={loadData}
            disabled={refreshing}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#181818',
              border: '2px solid #181818',
              boxShadow: '3px 3px 0px #181818',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              fontWeight: 'bold',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontFamily: 'var(--font-subtitle)',
            }}
          >
            <RefreshCw size={18} className={refreshing ? 'spin' : ''} />
            {refreshing ? 'Atualizando...' : 'Atualizar'}
          </button>

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
            <UserPlus size={18} /> Novo Aluno
          </button>
        </div>
      </div>

      {/* Cards de Resumo Rápido */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        <div
          className="doodle-card"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2.5px solid #181818',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            boxShadow: '4px 4px 0px #181818',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#F4EFE6',
              border: '2px solid #181818',
              borderRadius: '10px',
              padding: '0.65rem',
            }}
          >
            <Users size={22} color="#181818" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555555' }}>
              ALUNOS ATIVOS
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#181818' }}>
                {metrics.activeCount}
              </span>
              {metrics.inactiveCount > 0 && (
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280' }}>
                  ({metrics.inactiveCount} inativo{metrics.inactiveCount > 1 ? 's' : ''})
                </span>
              )}
            </div>
          </div>
        </div>

        <div
          className="doodle-card"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2.5px solid #181818',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            boxShadow: '4px 4px 0px #181818',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#DCFCE7',
              border: '2px solid #181818',
              borderRadius: '10px',
              padding: '0.65rem',
            }}
          >
            <Award size={22} color="#166534" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555555' }}>
              ASSIDUIDADE MÉDIA
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#181818' }}>
              {metrics.avgEngagement}%
            </div>
          </div>
        </div>

        <div
          className="doodle-card"
          style={{
            backgroundColor: '#FFFFFF',
            border: '2.5px solid #181818',
            borderRadius: '12px',
            padding: '1.15rem 1.25rem',
            boxShadow: '4px 4px 0px #181818',
            display: 'flex',
            alignItems: 'center',
            gap: '0.9rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FEF3C7',
              border: '2px solid #181818',
              borderRadius: '10px',
              padding: '0.65rem',
            }}
          >
            <Layers size={22} color="#92400E" />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#555555' }}>
              NA TRILHA PADRÃO
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#181818' }}>
              {metrics.withoutLevelCount}
            </div>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {formSuccess && (
        <div
          role="status"
          style={{
            backgroundColor: '#DCFCE7',
            color: '#166534',
            border: '2px solid #181818',
            padding: '0.85rem 1rem',
            borderRadius: '10px',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 700,
          }}
        >
          <CheckCircle size={18} /> {formSuccess}
        </div>
      )}

      {/* Tabela de Alunos */}
      <div
        className="doodle-card"
        style={{
          padding: '1.5rem',
          backgroundColor: '#FFFFFF',
          border: '2.5px solid #181818',
          borderRadius: '14px',
          boxShadow: '4px 4px 0px #181818',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={22} color="var(--brand-red)" />
            <h2 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>
              Lista de Matriculados ({filteredStudents.length})
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            <select
              aria-label="Filtrar alunos por status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '2px solid #181818',
                backgroundColor: '#FDFBF7',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#181818',
              }}
            >
              <option value="all">Todos os status</option>
              <option value="active">Somente ativos</option>
              <option value="inactive">Desabilitados</option>
            </select>

            <select
              aria-label="Filtrar alunos por nível"
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '8px',
                border: '2px solid #181818',
                backgroundColor: '#FDFBF7',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#181818',
              }}
            >
              <option value="all">Todos os níveis</option>
              <option value="none">Trilha Padrão (sem nível)</option>
              {subLevels.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.name}
                </option>
              ))}
            </select>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                border: '2px solid #181818',
                borderRadius: '8px',
                padding: '0.5rem 0.75rem',
                backgroundColor: '#FDFBF7',
                width: '240px',
              }}
            >
              <Search size={18} color="#555" style={{ marginRight: '8px' }} />
              <input
                type="text"
                placeholder="Buscar nome ou e-mail..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  border: 'none',
                  outline: 'none',
                  backgroundColor: 'transparent',
                  width: '100%',
                  fontSize: '0.875rem',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '2px solid var(--bg-bege-dark)',
                  color: 'var(--text-muted)',
                  fontSize: '0.82rem',
                }}
              >
                <th style={{ padding: '0.75rem' }}>ALUNO</th>
                <th style={{ padding: '0.75rem' }}>STATUS</th>
                <th style={{ padding: '0.75rem' }}>NÍVEL LIBERADO</th>
                <th style={{ padding: '0.75rem' }}>PROGRESSO (FIRST STEP)</th>
                <th style={{ padding: '0.75rem' }}>ASSIDUIDADE</th>
                <th style={{ padding: '0.75rem', textAlign: 'right' }}>AÇÕES</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const levelDisplay = getStudentLevelDisplay(student);
                  const studentLessons = lessonsByStudent.get(student.id) ?? [];
                  const completedIds = studentLessons.map((l) => l.catalogLessonId);
                  const progress = getCourseProgressSummary(completedIds);
                  const engagement =
                    engagementByStudentId.get(student.id) ??
                    calculateStudentEngagement({ lessons: [], assignments: [] });

                  const badgeColors =
                    engagement.score < 60
                      ? { bg: '#FEE2E2', text: '#DC2626' }
                      : engagement.score < 80
                        ? { bg: '#FEF3C7', text: '#92400E' }
                        : { bg: '#DCFCE7', text: '#166534' };

                  return (
                    <tr
                      key={student.id}
                      style={{
                        borderBottom: '1px solid var(--bg-bege-dark)',
                        fontSize: '0.9rem',
                        backgroundColor: student.isActive ? 'transparent' : '#F9FAFB',
                        opacity: student.isActive ? 1 : 0.78,
                      }}
                    >
                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <div style={{ fontWeight: 700, color: '#181818' }}>{student.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {student.email}
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {student.isActive ? (
                          <span
                            style={{
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              border: '1.5px solid #166534',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                            }}
                          >
                            Ativo
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#4B5563',
                              border: '1.5px solid #6B7280',
                              padding: '0.2rem 0.6rem',
                              borderRadius: '999px',
                              fontSize: '0.75rem',
                              fontWeight: 800,
                            }}
                          >
                            Desabilitado
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        {levelDisplay ? (
                          <span
                            style={{
                              backgroundColor: 'var(--bg-bege)',
                              border: '1.5px solid #181818',
                              padding: '0.22rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            {levelDisplay}
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#F3F4F6',
                              color: '#4B5563',
                              border: '1.5px dashed #9CA3AF',
                              padding: '0.22rem 0.65rem',
                              borderRadius: '6px',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                            }}
                          >
                            First Step (Padrão)
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', minWidth: '165px' }}>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            marginBottom: '0.25rem',
                          }}
                        >
                          <span>
                            {progress.completedCount}/{progress.totalLessons} aulas
                          </span>
                          <span>{progress.percentage}%</span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '7px',
                            backgroundColor: '#F4EFE6',
                            borderRadius: '999px',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              width: `${progress.percentage}%`,
                              height: '100%',
                              backgroundColor: student.isActive ? 'var(--brand-red)' : '#9CA3AF',
                            }}
                          />
                        </div>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem' }}>
                        <button
                          type="button"
                          onClick={() =>
                            setEngagementModalTarget({ student, breakdown: engagement })
                          }
                          title="Clique para ver o detalhamento de aulas e tarefas"
                          style={{
                            backgroundColor: badgeColors.bg,
                            color: badgeColors.text,
                            border: `1.5px solid ${badgeColors.text}`,
                            padding: '0.25rem 0.65rem',
                            borderRadius: '999px',
                            fontWeight: 800,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                          }}
                        >
                          <span>{engagement.score}%</span>
                          <BarChart3 size={13} />
                        </button>
                      </td>

                      <td style={{ padding: '0.85rem 0.75rem', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.45rem' }}>
                          {student.isActive && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyInvite(student.name, student.email, undefined, student.id)
                              }
                              title="Copiar dados de acesso"
                              style={{
                                backgroundColor: '#F4EFE6',
                                border: '2px solid #181818',
                                borderRadius: '6px',
                                padding: '0.42rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              {copiedId === student.id ? (
                                <Check size={16} color="#166534" />
                              ) : (
                                <Copy size={16} color="#181818" />
                              )}
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(student)}
                            title="Editar Aluno"
                            style={{
                              backgroundColor: '#FEF08A',
                              border: '2px solid #181818',
                              borderRadius: '6px',
                              padding: '0.42rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                          >
                            <Edit3 size={16} color="#181818" />
                          </button>

                          {student.isActive ? (
                            <button
                              type="button"
                              onClick={() => setStatusTargetStudent(student)}
                              title="Desabilitar Acesso do Aluno"
                              style={{
                                backgroundColor: '#FEE2E2',
                                border: '2px solid #181818',
                                borderRadius: '6px',
                                padding: '0.42rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                              }}
                            >
                              <UserX size={16} color="#DC2626" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setStatusTargetStudent(student)}
                              title="Reativar Acesso do Aluno"
                              style={{
                                backgroundColor: '#DCFCE7',
                                border: '2px solid #181818',
                                borderRadius: '6px',
                                padding: '0.42rem 0.65rem',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                fontWeight: 800,
                                fontSize: '0.78rem',
                                color: '#166534',
                              }}
                            >
                              <UserCheck size={16} color="#166534" />
                              <span>Habilitar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}
                  >
                    Nenhum aluno encontrado para os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhamento da Assiduidade Automática */}
      {engagementModalTarget && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <button
              type="button"
              onClick={() => setEngagementModalTarget(null)}
              title="Fechar"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: '0.25rem' }}>
              Assiduidade — {engagementModalTarget.student.name}
            </h2>
            <p style={{ color: '#555555', fontSize: '0.88rem', marginTop: 0, marginBottom: '1.25rem' }}>
              Índice calculado automaticamente com base nas aulas concluídas, entregas de tarefas e notas.
            </p>

            {/* Destaque da Nota Geral */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                border: '2px solid #181818',
                backgroundColor: '#FDFBF7',
                marginBottom: '1rem',
              }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#555555' }}>
                  ÍNDICE GERAL
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#181818' }}>
                  {engagementModalTarget.breakdown.statusLabel}
                </div>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--brand-red)' }}>
                {engagementModalTarget.breakdown.score}%
              </div>
            </div>

            {/* 3 Pilares */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <FileCheck2 size={18} color="var(--brand-red)" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      Tarefas no Prazo (Peso 50%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555' }}>
                      {engagementModalTarget.breakdown.relevantTasksCount > 0
                        ? `${engagementModalTarget.breakdown.submittedTasksCount} de ${engagementModalTarget.breakdown.relevantTasksCount} entregues`
                        : 'Nenhuma tarefa vencida até o momento'}
                    </div>
                  </div>
                </div>
                <strong>{engagementModalTarget.breakdown.tasksComponentScore}%</strong>
              </div>

              <div
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <BookOpen size={18} color="#181818" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      Constância nas Aulas (Peso 30%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555' }}>
                      {engagementModalTarget.breakdown.completedLessonsCount} de{' '}
                      {engagementModalTarget.breakdown.totalCatalogLessons} lições concluídas
                      {engagementModalTarget.breakdown.daysSinceLastLesson !== null
                        ? ` • Última há ${engagementModalTarget.breakdown.daysSinceLastLesson} dia(s)`
                        : ''}
                    </div>
                  </div>
                </div>
                <strong>{engagementModalTarget.breakdown.lessonsComponentScore}%</strong>
              </div>

              <div
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.75rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <Award size={18} color="#166534" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.88rem' }}>
                      Aproveitamento nas Notas (Peso 20%)
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#555555' }}>
                      {engagementModalTarget.breakdown.averageGrade !== null
                        ? `Média das correções: ${engagementModalTarget.breakdown.averageGrade}/10`
                        : 'Nenhuma tarefa avaliada com nota ainda'}
                    </div>
                  </div>
                </div>
                <strong>{engagementModalTarget.breakdown.gradesComponentScore}%</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEngagementModalTarget(null)}
              style={{
                width: '100%',
                padding: '0.7rem',
                borderRadius: '8px',
                border: '2px solid #181818',
                backgroundColor: '#181818',
                color: '#FFFFFF',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Fechar Detalhes
            </button>
          </div>
        </div>
      )}

      {/* Modal de Cadastro / Edição de Aluno */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 999,
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '480px',
              maxHeight: '92vh',
              overflowY: 'auto',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              title="Fechar"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <X size={22} />
            </button>

            <h2
              style={{
                fontSize: '1.35rem',
                marginTop: 0,
                marginBottom: '1.1rem',
                color: 'var(--text-main)',
              }}
            >
              {editingStudent ? 'Editar Dados do Aluno' : 'Cadastrar Novo Aluno'}
            </h2>

            {formError && (
              <div
                role="alert"
                style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  border: '1.5px solid #DC2626',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <AlertCircle size={16} /> {formError}
              </div>
            )}

            <form onSubmit={handleSaveStudent}>
              <div style={{ marginBottom: '1.15rem' }}>
                <label
                  htmlFor="student-sublevel-select"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                  }}
                >
                  Nível Liberado (Opcional)
                </label>
                <select
                  id="student-sublevel-select"
                  value={subLevelId}
                  onChange={(e) => setSubLevelId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    outline: 'none',
                    backgroundColor: '#fff',
                    fontSize: '0.9rem',
                  }}
                >
                  <option value="">Definir depois / Trilha Padrão</option>
                  {subLevels.map((lvl) => (
                    <option key={lvl.id} value={lvl.id}>
                      {lvl.name}
                    </option>
                  ))}
                </select>
              </div>

              {editingStudent && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    marginBottom: '1rem',
                    borderRadius: '10px',
                    border: '1.5px solid #181818',
                    backgroundColor: isIdentityUnlocked ? '#FEF3C7' : '#F4EFE6',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: '#181818',
                    }}
                  >
                    {isIdentityUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
                    <span>
                      {isIdentityUnlocked
                        ? 'Dados de acesso destravados'
                        : 'Nome, e-mail e senha protegidos'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsIdentityUnlocked((prev) => !prev)}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1.5px solid #181818',
                      borderRadius: '6px',
                      padding: '0.3rem 0.65rem',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isIdentityUnlocked ? 'Bloquear' : 'Destravar'}
                  </button>
                </div>
              )}

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="student-name-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                  }}
                >
                  Nome Completo
                </label>
                <input
                  id="student-name-input"
                  type="text"
                  required
                  disabled={!isIdentityUnlocked}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Larissa Almeida"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    outline: 'none',
                    backgroundColor: isIdentityUnlocked ? '#FFFFFF' : '#F3F4F6',
                    color: isIdentityUnlocked ? '#181818' : '#6B7280',
                    cursor: isIdentityUnlocked ? 'text' : 'not-allowed',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label
                  htmlFor="student-email-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                  }}
                >
                  E-mail de Acesso
                </label>
                <input
                  id="student-email-input"
                  type="email"
                  required
                  disabled={!isIdentityUnlocked}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aluno@email.com"
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    outline: 'none',
                    backgroundColor: isIdentityUnlocked ? '#FFFFFF' : '#F3F4F6',
                    color: isIdentityUnlocked ? '#181818' : '#6B7280',
                    cursor: isIdentityUnlocked ? 'text' : 'not-allowed',
                  }}
                />
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  htmlFor="student-password-input"
                  style={{
                    display: 'block',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    marginBottom: '0.35rem',
                  }}
                >
                  {editingStudent ? 'Nova Senha (opcional)' : 'Senha Provisória'}
                </label>
                <input
                  id="student-password-input"
                  type="password"
                  required={!editingStudent}
                  disabled={!isIdentityUnlocked}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    !isIdentityUnlocked
                      ? 'Destrave acima para redefinir a senha'
                      : editingStudent
                        ? 'Deixe em branco para manter a senha atual'
                        : 'Digite uma senha inicial'
                  }
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.65rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    outline: 'none',
                    backgroundColor: isIdentityUnlocked ? '#FFFFFF' : '#F3F4F6',
                    color: isIdentityUnlocked ? '#181818' : '#6B7280',
                    cursor: isIdentityUnlocked ? 'text' : 'not-allowed',
                  }}
                />
              </div>

              {name.trim() && email.trim() && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <button
                    type="button"
                    onClick={() => handleCopyInvite(name, email, password, 'modal')}
                    style={{
                      width: '100%',
                      padding: '0.55rem',
                      borderRadius: '8px',
                      border: '1.5px dashed #181818',
                      backgroundColor: '#FDFBF7',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '0.83rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                    }}
                  >
                    {copiedId === 'modal' ? (
                      <>
                        <Check size={15} color="#166534" />
                        <span style={{ color: '#166534' }}>
                          Convite copiado para enviar no WhatsApp!
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy size={15} />
                        <span>Copiar dados de acesso para WhatsApp</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
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
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '0.7rem',
                    borderRadius: '8px',
                    border: '2px solid #181818',
                    backgroundColor: 'var(--brand-red)',
                    color: '#fff',
                    cursor: saving ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  {saving ? 'Salvando...' : editingStudent ? 'Salvar Alterações' : 'Cadastrar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação: Desabilitar ou Reativar Aluno */}
      {statusTargetStudent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(24, 24, 24, 0.6)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '1rem',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              position: 'relative',
              backgroundColor: '#FFFFFF',
              borderRadius: '14px',
              border: '3px solid #181818',
              padding: '1.75rem',
              width: '100%',
              maxWidth: '440px',
              boxShadow: '6px 6px 0px #181818',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginBottom: '0.85rem',
              }}
            >
              <div
                style={{
                  backgroundColor: statusTargetStudent.isActive ? '#FEE2E2' : '#DCFCE7',
                  border: '2px solid #181818',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  display: 'inline-flex',
                }}
              >
                {statusTargetStudent.isActive ? (
                  <ShieldAlert size={22} color="#DC2626" />
                ) : (
                  <UserCheck size={22} color="#166534" />
                )}
              </div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, color: '#181818' }}>
                {statusTargetStudent.isActive
                  ? 'Desabilitar Acesso do Aluno?'
                  : 'Reativar Acesso do Aluno?'}
              </h2>
            </div>

            <p style={{ color: '#444444', fontSize: '0.92rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
              {statusTargetStudent.isActive ? (
                <>
                  O aluno <strong>{statusTargetStudent.name}</strong> ({statusTargetStudent.email})
                  não conseguirá mais fazer login na plataforma.{' '}
                  <strong>Todo o histórico de aulas concluídas, notas e tarefas será preservado</strong>{' '}
                  e você poderá reativá-lo a qualquer momento.
                </>
              ) : (
                <>
                  O aluno <strong>{statusTargetStudent.name}</strong> ({statusTargetStudent.email})
                  voltará a ter acesso imediato à plataforma com todo o seu progresso anterior.
                </>
              )}
            </p>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={() => setStatusTargetStudent(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: '2px solid #181818',
                  backgroundColor: '#FFFFFF',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={updatingStatus}
                onClick={handleConfirmStatusToggle}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  borderRadius: '8px',
                  border: '2px solid #181818',
                  backgroundColor: statusTargetStudent.isActive ? '#DC2626' : '#166534',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  cursor: updatingStatus ? 'not-allowed' : 'pointer',
                }}
              >
                {updatingStatus
                  ? 'Processando...'
                  : statusTargetStudent.isActive
                    ? 'Sim, Desabilitar'
                    : 'Sim, Reativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}