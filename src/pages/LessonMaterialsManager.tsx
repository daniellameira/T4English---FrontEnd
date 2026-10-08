import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Presentation, Code, Edit3, Info, CheckCircle, X } from 'lucide-react';

interface SubLevelOption {
    id: string;
    name: string;
}

interface Material {
    id: string;
    title: string;
    embedUrl: string;
}

interface Lesson {
    id: string;
    title: string;
    orderIndex: number;
}

export function LessonMaterialsManager() {
    const [subLevels, setSubLevels] = useState<SubLevelOption[]>([]);
    const [selectedSubLevelId, setSelectedSubLevelId] = useState('');
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [loading, setLoading] = useState(true);

    // Estados do Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
    const [materialTitle, setMaterialTitle] = useState('');
    const [embedInput, setEmbedInput] = useState(''); // Agora aceita textos maiores (código HTML)
    const [formSuccess, setFormSuccess] = useState('');
    const [formError, setFormError] = useState('');

    useEffect(() => {
        let cancelled = false;

        async function loadSubLevels() {
            try {
                const res = await api.get<SubLevelOption[]>('/Level/sublevels');
                if (!cancelled && res.data && res.data.length > 0) {
                    setSubLevels(res.data);
                    setSelectedSubLevelId(res.data[0].id);
                }
            } catch (err) {
                console.error('Erro ao carregar subníveis:', err);
            } finally {
                if (!cancelled) {
                    setLoading(false);
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
            try {
                const res = await api.get<Lesson[]>(`/Lesson/sublevel/${selectedSubLevelId}`);
                if (!cancelled) {
                    setLessons(res.data || []);
                }
            } catch (err) {
                console.error('Erro ao carregar lições:', err);
                if (!cancelled) {
                    setLessons([]);
                }
            }
        }

        loadLessons();
        return () => {
            cancelled = true;
        };
    }, [selectedSubLevelId]);

    const handleOpenModal = async (lesson: Lesson) => {
        setActiveLesson(lesson);
        setFormSuccess('');

        try {
            const res = await api.get<Material[]>(`/Lesson/${lesson.id}/materials`);
            if (res.data && res.data.length > 0) {
                setMaterialTitle(res.data[0].title);
                setEmbedInput(res.data[0].embedUrl);
            } else {
                setMaterialTitle(`Slides: ${lesson.title}`);
                setEmbedInput('');
            }
        } catch (err) {
            console.error('Erro ao carregar materiais da lição:', err);
            setMaterialTitle(`Slides: ${lesson.title}`);
            setEmbedInput('');
        }

        setIsModalOpen(true);
    };

    const handleSaveMaterial = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeLesson) return;

        setFormError(''); // Limpa erros anteriores
        setFormSuccess('');

        let finalUrl = embedInput.trim();

        // MÁGICA MELHORADA: Se o professor colou um código HTML (tem '<')
        if (finalUrl.includes('<')) {
            try {
                const parser = new DOMParser();
                const doc = parser.parseFromString(finalUrl, 'text/html');
                const iframe = doc.querySelector('iframe');

                if (iframe && iframe.src) {
                    finalUrl = iframe.src; // Sucesso: Pegou o link limpo do iframe!
                } else {
                    // Se não achou iframe, tenta ver se o Canva colou apenas uma tag <a>
                    const aTag = doc.querySelector('a');
                    if (aTag && aTag.href && aTag.href.includes('canva.com')) {
                        // Converte link de visualização para link de embed do Canva
                        finalUrl = aTag.href.replace('/view', '/view?embed');
                    } else {
                        // BLOQUEIA O ENVIO: Previne o Erro 400 do ASP.NET Core
                        setFormError('Não foi possível extrair um link seguro deste código. Tente copiar apenas o URL.');
                        return;
                    }
                }
            } catch {
                setFormError('O código colado é inválido.');
                return;
            }
        }

        try {
            // ATENÇÃO: Verifique no seu Swagger se a propriedade esperada pelo C# é 'embedUrl' ou apenas 'url'
            await api.post(`/Lesson/${activeLesson.id}/materials`, {
                title: materialTitle,
                embedUrl: finalUrl // Se o seu DTO no C# pedir "Url", mude isto para -> url: finalUrl
            });

            setFormSuccess('Material da aula guardado com sucesso!');

            setTimeout(() => {
                setIsModalOpen(false);
                setActiveLesson(null);
            }, 1500);

        } catch (err: unknown) {
            console.error('Erro ao guardar material da lição:', err);
            const error = err as {
                response?: {
                    data?: {
                        errors?: Record<string, string[]>;
                        message?: string;
                    };
                };
            };
            const errorData = error.response?.data;

            // EXIBE O ERRO EXATO DO C# NA TELA PARA O PROFESSOR
            if (errorData?.errors) {
                const messages = Object.values(errorData.errors).flat().join(' | ');
                setFormError(`Erro da API: ${messages}`);
            } else if (errorData?.message) {
                setFormError(errorData.message);
            } else {
                setFormError('Erro 400 (Bad Request): Verifique se o DTO no backend espera a propriedade "embedUrl" com este nome exato.');
            }
        }
    };

    if (loading) {
        return <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>A carregar dados...</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    Gestão de Materiais e Slides
                </h1>
                <p style={{ color: 'var(--text-muted)' }}>
                    Vincule apresentações do Canva ou Google Slides às suas aulas.
                </p>
            </div>

            <div className="doodle-card" style={{ padding: '1.25rem', marginBottom: '1.5rem', backgroundColor: '#FFFFFF' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '0.4rem' }}>
                    Selecione a Trilha (Subnível):
                </label>
                <select
                    value={selectedSubLevelId}
                    onChange={(e) => setSelectedSubLevelId(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', padding: '0.6rem', borderRadius: '6px', border: '2px solid #181818', outline: 'none', fontWeight: 'bold' }}
                >
                    {subLevels.length === 0 && <option value="">Nenhum subnível encontrado</option>}
                    {subLevels.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {lessons.length > 0 ? (
                    lessons.map((lesson) => (
                        <div key={lesson.id} className="doodle-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: '#FDFBF7' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Presentation size={24} color="var(--brand-red)" />
                                <h3 style={{ fontSize: '1.2rem', color: '#181818' }}>{lesson.title}</h3>
                            </div>

                            <button
                                onClick={() => handleOpenModal(lesson)}
                                style={{
                                    marginTop: 'auto',
                                    backgroundColor: '#FFFFFF',
                                    color: '#181818',
                                    border: '2px solid #181818',
                                    borderRadius: '8px',
                                    padding: '0.6rem 1rem',
                                    fontWeight: 'bold',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    cursor: 'pointer',
                                    boxShadow: '2px 2px 0px #181818',
                                    fontFamily: 'var(--font-subtitle)'
                                }}
                            >
                                <Edit3 size={16} /> Gerir Material / Slide
                            </button>
                        </div>
                    ))
                ) : (
                    <p style={{ color: 'var(--text-muted)' }}>Nenhuma lição encontrada para esta trilha.</p>
                )}
            </div>

            {isModalOpen && activeLesson && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(24, 24, 24, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 999, padding: '1rem' }}>
                    <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '2px solid #181818', padding: '2rem', width: '100%', maxWidth: '550px', boxShadow: '6px 6px 0px #181818', position: 'relative' }}>

                        <button
                            onClick={() => setIsModalOpen(false)}
                            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} color="#181818" />
                        </button>

                        <h2 style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                            Vincular Slide: {activeLesson.title}
                        </h2>

                        {/* Dica Pedagógica atualizada para CANVA e Google Slides */}
                        <div style={{ backgroundColor: '#F4EFE6', border: '1px dashed #181818', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Info size={16} color="var(--brand-red)" />
                                <h4 style={{ fontSize: '0.9rem', color: '#181818' }}>Como colar o Canva aqui?</h4>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: '#555', lineHeight: '1.5' }}>
                                Vá ao seu design no Canva, clique em <strong>Partilhar &gt; Mais &gt; Incorporar</strong>.
                                Copie o "Código de incorporação HTML" inteiro e cole na caixa abaixo. Nós tratamos do resto!
                            </p>
                        </div>
                        {formError && (
                            <div style={{ backgroundColor: '#FEE2E2', color: '#DC2626', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 'bold' }}>
                                <X size={18} /> {formError}
                            </div>
                        )}
                        {formSuccess && (
                            <div style={{ backgroundColor: '#DCFCE7', color: '#166534', border: '2px solid #181818', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                                <CheckCircle size={18} /> {formSuccess}
                            </div>
                        )}

                        <form onSubmit={handleSaveMaterial}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Título do Material</label>
                                <input
                                    type="text"
                                    required
                                    value={materialTitle}
                                    onChange={(e) => setMaterialTitle(e.target.value)}
                                    style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--bg-bege-dark)', outline: 'none' }}
                                />
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>Código de Incorporação (HTML) ou Link</label>
                                <div style={{ display: 'flex', alignItems: 'flex-start', border: '1px solid var(--bg-bege-dark)', borderRadius: '6px', overflow: 'hidden' }}>
                                    <div style={{ padding: '0.6rem', backgroundColor: '#F4EFE6', borderRight: '1px solid var(--bg-bege-dark)', height: '100%' }}>
                                        <Code size={16} color="#555" />
                                    </div>
                                    <textarea
                                        required
                                        value={embedInput}
                                        onChange={(e) => setEmbedInput(e.target.value)}
                                        placeholder='Cole aqui o link ou o código HTML gigante (<div...><iframe...)'
                                        rows={4}
                                        style={{ flex: 1, padding: '0.6rem', border: 'none', outline: 'none', resize: 'vertical' }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '2px solid #181818', backgroundColor: 'var(--brand-red)', color: '#fff', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', boxShadow: '2px 2px 0px #181818', fontFamily: 'var(--font-subtitle)' }}
                            >
                                Guardar Slide
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}