import { useState, useMemo } from 'react';
import { Volume2, Info, Sparkles, Filter } from 'lucide-react';
import {
  IPA_PHONEMES,
  IPA_SUBGROUP_STYLES,
  type IpaCategory,
  type IpaPhoneme,
  type IpaSubGroup,
} from '../data/ipaCatalog';

export function IpaDetailViewer() {
  const [selectedPhoneme, setSelectedPhoneme] = useState<IpaPhoneme>(IPA_PHONEMES[1]); // /i:/
  const [activeFilter, setActiveFilter] = useState<'all' | IpaCategory>('all');
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  const speakWord = (word: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = 'en-US';
    utterance.rate = 0.88;
    setSpeakingText(word);
    utterance.onend = () => setSpeakingText(null);
    utterance.onerror = () => setSpeakingText(null);
    window.speechSynthesis.speak(utterance);
  };

  const filteredPhonemes = useMemo(() => {
    if (activeFilter === 'all') return IPA_PHONEMES;
    return IPA_PHONEMES.filter((item) => item.category === activeFilter);
  }, [activeFilter]);

  const counts = useMemo(
    () => ({
      vowel: IPA_PHONEMES.filter((p) => p.category === 'vowel').length,
      diphthong: IPA_PHONEMES.filter((p) => p.category === 'diphthong').length,
      consonant: IPA_PHONEMES.filter((p) => p.category === 'consonant').length,
      all: IPA_PHONEMES.length,
    }),
    []
  );

  const selectedStyle = IPA_SUBGROUP_STYLES[selectedPhoneme.subGroup];

  const filterTitleMap: Record<'all' | IpaCategory, string> = {
    all: 'Todos os Sons (44)',
    vowel: 'Vogais (Vowels)',
    diphthong: 'Ditongos (Diphthongs)',
    consonant: 'Consoantes (Consonants)',
  };

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* Cabeçalho */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h1
          style={{
            fontSize: '2rem',
            color: 'var(--text-main)',
            marginBottom: '0.25rem',
            textTransform: 'uppercase',
          }}
        >
          Tabela de Sons IPA
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Explore os sons, veja o nome de cada símbolo fonético e pratique com as palavras de exemplo.
        </p>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#FFFFFF',
            border: '2px solid #181818',
            borderRadius: '10px',
            padding: '0.55rem 1rem',
            boxShadow: '3px 3px 0px #181818',
            fontSize: '0.9rem',
          }}
        >
          <Sparkles size={16} color="#E05A67" />
          <span>
            <strong>Dica:</strong> selecione um símbolo abaixo e clique nos botões de áudio acima para ouvir e praticar.
          </span>
        </div>
      </div>

      {/* CARTÃO DE DESTAQUE DO SÍMBOLO SELECIONADO */}
      <div
        className="doodle-card"
        style={{
          backgroundColor: '#FFFFFF',
          border: '3px solid #181818',
          borderRadius: '18px',
          padding: '1.75rem',
          boxShadow: '7px 7px 0px #181818',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem', flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: selectedStyle.bg,
                border: '3px solid #181818',
                borderRadius: '14px',
                padding: '0.75rem 1.25rem',
                boxShadow: '3px 3px 0px #181818',
                fontSize: '2.1rem',
                fontWeight: 800,
                fontFamily: 'serif',
                color: '#181818',
                lineHeight: 1,
              }}
            >
              {selectedPhoneme.symbol}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span
                  style={{
                    backgroundColor: selectedStyle.badgeBg,
                    border: '1.5px solid #181818',
                    borderRadius: '999px',
                    padding: '0.15rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                  }}
                >
                  {selectedStyle.label}
                </span>
                <span
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#E05A67',
                  }}
                >
                  {selectedPhoneme.name}
                </span>
              </div>

              <div
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  color: '#181818',
                  marginTop: '0.25rem',
                }}
              >
                {selectedPhoneme.mainWord}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => speakWord(selectedPhoneme.mainWord)}
            title={`Ouvir "${selectedPhoneme.mainWord}"`}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#E05A67',
              color: '#FFFFFF',
              border: '2.5px solid #181818',
              boxShadow: '3px 3px 0px #181818',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <Volume2 size={22} />
          </button>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: 800,
              fontSize: '0.9rem',
              marginBottom: '0.35rem',
            }}
          >
            <Info size={16} color="#181818" />
            <span>Como fazer o som?</span>
          </div>
          <p style={{ color: '#333333', fontSize: '0.95rem', margin: '0 0 0.9rem 0' }}>
            {selectedPhoneme.description}
          </p>

          <div
            style={{
              display: 'inline-block',
              backgroundColor: '#F4EFE6',
              border: '2px solid #181818',
              borderRadius: '10px',
              padding: '0.75rem 1.25rem',
              fontWeight: 800,
              fontSize: '0.95rem',
              color: '#181818',
            }}
          >
            {selectedPhoneme.mouthCue}
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.6rem' }}>
            Exemplos de palavras
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {selectedPhoneme.examples.map((word) => {
              const isPlaying = speakingText === word;
              return (
                <button
                  key={word}
                  type="button"
                  onClick={() => speakWord(word)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isPlaying ? '#FEE2E2' : '#FFFFFF',
                    border: '2px solid #181818',
                    borderRadius: '10px',
                    padding: '0.6rem 0.9rem',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    color: '#181818',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px #181818',
                  }}
                >
                  <span>{word}</span>
                  <span
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: '#E05A67',
                      color: '#FFFFFF',
                      border: '1.5px solid #181818',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Volume2 size={14} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* BARRA DE FILTROS + LEGENDA DE CORES */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 800,
            fontSize: '1rem',
            marginBottom: '0.75rem',
          }}
        >
          <Filter size={17} color="#E05A67" />
          <span>Mais sons — {filterTitleMap[activeFilter]}</span>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
            <button
              type="button"
              onClick={() => setActiveFilter('vowel')}
              style={{
                backgroundColor: activeFilter === 'vowel' ? '#181818' : '#CFF4FC',
                color: activeFilter === 'vowel' ? '#FFFFFF' : '#181818',
                border: '2px solid #181818',
                borderRadius: '999px',
                padding: '0.45rem 1rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeFilter === 'vowel' ? 'none' : '2px 2px 0px #181818',
              }}
            >
              Vogais ({counts.vowel})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('diphthong')}
              style={{
                backgroundColor: activeFilter === 'diphthong' ? '#181818' : '#D4E6C3',
                color: activeFilter === 'diphthong' ? '#FFFFFF' : '#181818',
                border: '2px solid #181818',
                borderRadius: '999px',
                padding: '0.45rem 1rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeFilter === 'diphthong' ? 'none' : '2px 2px 0px #181818',
              }}
            >
              Ditongos ({counts.diphthong})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('consonant')}
              style={{
                backgroundColor: activeFilter === 'consonant' ? '#181818' : '#FCC484',
                color: activeFilter === 'consonant' ? '#FFFFFF' : '#181818',
                border: '2px solid #181818',
                borderRadius: '999px',
                padding: '0.45rem 1rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeFilter === 'consonant' ? 'none' : '2px 2px 0px #181818',
              }}
            >
              Consoantes ({counts.consonant})
            </button>

            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              style={{
                backgroundColor: activeFilter === 'all' ? '#181818' : '#FFFFFF',
                color: activeFilter === 'all' ? '#FFFFFF' : '#181818',
                border: '2px solid #181818',
                borderRadius: '999px',
                padding: '0.45rem 1rem',
                fontWeight: 800,
                fontSize: '0.88rem',
                cursor: 'pointer',
                boxShadow: activeFilter === 'all' ? 'none' : '2px 2px 0px #181818',
              }}
            >
              Todos ({counts.all})
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.65rem',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            {(Object.keys(IPA_SUBGROUP_STYLES) as IpaSubGroup[]).map((key) => (
              <span
                key={key}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #181818',
                  borderRadius: '8px',
                  padding: '0.2rem 0.55rem',
                }}
              >
                <span
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '3px',
                    backgroundColor: IPA_SUBGROUP_STYLES[key].bg,
                    border: '1.5px solid #181818',
                  }}
                />
                {IPA_SUBGROUP_STYLES[key].label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* GRADE COLORIDA DOS 44 SÍMBOLOS IPA (APENAS SÍMBOLO + NOME, SEM ÁUDIO AO CLICAR) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))',
          gap: '0.75rem',
        }}
      >
        {filteredPhonemes.map((item) => {
          const isSelected = selectedPhoneme.id === item.id;
          const styleInfo = IPA_SUBGROUP_STYLES[item.subGroup];

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedPhoneme(item)}
              style={{
                backgroundColor: styleInfo.bg,
                border: isSelected ? '3px solid #E05A67' : '2.5px solid #181818',
                borderRadius: '12px',
                padding: '0.85rem 0.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                cursor: 'pointer',
                boxShadow: isSelected ? '4px 4px 0px #181818' : '2px 2px 0px #181818',
                transform: isSelected ? 'translateY(-3px)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <span
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  fontFamily: 'serif',
                  color: '#991B1B',
                  lineHeight: 1.1,
                }}
              >
                {item.symbol}
              </span>

              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#181818',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  border: '1px solid rgba(24, 24, 24, 0.35)',
                  borderRadius: '6px',
                  padding: '0.15rem 0.45rem',
                  lineHeight: 1.15,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={item.name}
              >
                {item.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}