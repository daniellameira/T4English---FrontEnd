import { useState } from 'react';
import type { CSSProperties } from 'react';
import { Filter, Info, Sparkles, Volume2 } from 'lucide-react';
import { ipaDetailsData } from '../data/ipaData';

interface IpaDetailViewerProps {
  initialSymbolId?: string;
}

const categories = [
  { id: 'vowels', label: 'Vogais' },
  { id: 'diphthongs', label: 'Ditongos' },
  { id: 'consonants', label: 'Consoantes' },
  { id: 'all', label: 'Todos' },
] as const;

type IpaCategoryTab = (typeof categories)[number]['id'];

const primaryButtonStyle: CSSProperties = {
  backgroundColor: '#E05A67',
  color: '#FFFFFF',
  border: '2px solid #181818',
  boxShadow: '2px 2px 0px #181818',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
};

export function IpaDetailViewer({ initialSymbolId = 'u_long' }: IpaDetailViewerProps) {
  const [selectedId, setSelectedId] = useState(initialSymbolId);
  const [activeTab, setActiveTab] = useState<IpaCategoryTab>('vowels');
  const currentDetail =
    ipaDetailsData.find((item) => item.id === selectedId) ?? ipaDetailsData[0];
  const filteredSymbols = ipaDetailsData.filter(
    (item) => activeTab === 'all' || item.category === activeTab,
  );

  const playSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Seu navegador não suporta a síntese de voz (SpeechSynthesis).');
    }
  };

  const selectCategory = (category: IpaCategoryTab) => {
    setActiveTab(category);
    if (category !== 'all') {
      const firstInCategory = ipaDetailsData.find((item) => item.category === category);
      if (firstInCategory) setSelectedId(firstInCategory.id);
    }
  };

  return (
    <section
      className="ipa-detail-viewer"
      aria-label="Tabela de sons IPA"
      style={{ display: 'grid', gap: '1rem' }}
    >
      <header style={{ marginBottom: '0.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Tabela de Sons IPA</h1>
        <p style={{ color: '#555555', lineHeight: 1.6 }}>
          Explore os sons, leia as dicas de articulação e pratique com as palavras de exemplo.
        </p>
      </header>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.85rem 1rem',
          backgroundColor: '#F4EFE6',
          border: '1px solid #E2D7C5',
          borderRadius: '10px',
          lineHeight: 1.5,
        }}
      >
        <Sparkles size={18} color="#E05A67" aria-hidden="true" />
        <p>
          <strong>Dica:</strong> ouça cada palavra e repita em voz alta para praticar o som.
        </p>
      </div>

      <article
        className="ipa-detail-card"
        aria-label={`Detalhes do som /${currentDetail.symbol}/`}
        style={{
          backgroundColor: '#FFFFFF',
          border: '2px solid #181818',
          borderRadius: '16px',
          boxShadow: '4px 4px 0px #181818',
          padding: 'clamp(1rem, 4vw, 1.5rem)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              aria-label={`Símbolo IPA /${currentDetail.symbol}/`}
              style={{
                fontFamily: 'Arial, sans-serif',
                fontSize: '2.2rem',
                fontWeight: 'bold',
                backgroundColor: '#F4EFE6',
                border: '2px solid #181818',
                borderRadius: '12px',
                minWidth: '76px',
                minHeight: '76px',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              /{currentDetail.symbol}/
            </div>
            <div>
              <p style={{ color: '#555555', marginBottom: '0.25rem' }}>Som</p>
              <h3 style={{ fontSize: '1.4rem' }}>{currentDetail.keyword}</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={() => playSpeech(currentDetail.keyword)}
            style={{
              ...primaryButtonStyle,
              borderRadius: '50%',
              width: '46px',
              height: '46px',
            }}
            title={`Ouvir ${currentDetail.keyword}`}
            aria-label={`Ouvir ${currentDetail.keyword}`}
          >
            <Volume2 size={20} aria-hidden="true" />
          </button>
        </header>

        <section aria-labelledby="ipa-how-to" style={{ display: 'grid', gap: '0.75rem' }}>
          <h4
            id="ipa-how-to"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Info size={17} aria-hidden="true" />
            Como fazer o som?
          </h4>
          <p style={{ lineHeight: 1.7 }}>{currentDetail.description}</p>
          {currentDetail.diagramUrl && (
            <img
              src={currentDetail.diagramUrl}
              alt={`Diagrama articulatório do som /${currentDetail.symbol}/`}
              loading="lazy"
              style={{
                display: 'block',
                width: 'min(100%, 240px)',
                height: 'auto',
                border: '1px solid #E2D7C5',
                borderRadius: '10px',
              }}
            />
          )}
        </section>

        <section aria-labelledby="ipa-examples" style={{ display: 'grid', gap: '0.75rem' }}>
          <h4 id="ipa-examples">Exemplos de palavras</h4>
          <ul
            style={{
              listStyle: 'none',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {currentDetail.examples.map((item) => (
              <li
                key={item.word}
                style={{
                  border: '1.5px solid #181818',
                  borderRadius: '10px',
                  padding: '0.65rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                }}
              >
                <span>{item.word}</span>
                <button
                  type="button"
                  onClick={() => playSpeech(item.word)}
                  style={{
                    ...primaryButtonStyle,
                    border: '1.5px solid #181818',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    flexShrink: 0,
                  }}
                  title={`Ouvir ${item.word}`}
                  aria-label={`Ouvir ${item.word}`}
                >
                  <Volume2 size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <nav aria-label="Navegação por categoria e sons IPA">
          <h3
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem',
            }}
          >
            <Filter size={18} aria-hidden="true" />
            Mais sons - {currentDetail.categoryLabel}
          </h3>
          <div
            role="group"
            aria-label="Filtrar sons por categoria"
            style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}
          >
            {categories.map((tab) => {
              const isActive = activeTab === tab.id;
              const count =
                tab.id === 'all'
                  ? ipaDetailsData.length
                  : ipaDetailsData.filter((item) => item.category === tab.id).length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => selectCategory(tab.id)}
                  aria-pressed={isActive}
                  style={{
                    backgroundColor: isActive ? '#181818' : '#FFFFFF',
                    color: isActive ? '#FFFFFF' : '#181818',
                    border: '1.5px solid #181818',
                    borderRadius: '8px',
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                  }}
                >
                  {tab.label} ({count})
                </button>
              );
            })}
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))',
              gap: '0.75rem',
            }}
          >
            {filteredSymbols.map((item) => {
              const isSelected = item.id === currentDetail.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedId(item.id)}
                  aria-pressed={isSelected}
                  style={{
                    backgroundColor: isSelected ? '#E05A67' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#181818',
                    border: '2px solid #181818',
                    borderRadius: '12px',
                    padding: '0.6rem 0.25rem',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.15rem',
                    boxShadow: isSelected ? '3px 3px 0px #181818' : '2px 2px 0px #181818',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '1.2rem' }}>
                    /{item.symbol}/
                  </span>
                  <small>{item.keyword}</small>
                </button>
              );
            })}
          </div>
        </nav>
      </article>
    </section>
  );
}
