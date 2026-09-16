import { useState } from 'react';
import { Volume2, Info } from 'lucide-react';
import { ipaSymbols } from '../data/ipaSymbols';

export function IPAGrid() {
  const [filter, setFilter] = useState<'all' | 'vowel' | 'diphthong' | 'consonant'>('all');
  const [search, setSearch] = useState('');

  const playSound = (example: string) => {
    // Exemplo usando a Web Speech API nativa
    const utterance = new SpeechSynthesisUtterance(example);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
  };

  const filteredSymbols = ipaSymbols.filter((item) => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.symbol.includes(search) || item.example.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#0f172a', padding: '2rem', borderRadius: '12px', color: '#fff' }}>
      {/* Barra de Busca e Filtros */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search by symbol or sample word..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #334155', backgroundColor: '#1e293b', color: '#fff', flex: 1 }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'vowel', 'diphthong', 'consonant'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: filter === cat ? '#3b82f6' : '#1e293b',
                color: '#fff',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Cards do IPA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '1rem' }}>
        {filteredSymbols.map((item) => (
          <div
            key={item.id}
            onClick={() => playSound(item.example)}
            style={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '1rem',
              textAlign: 'center',
              cursor: 'pointer',
              position: 'relative',
              transition: 'transform 0.1s'
            }}
          >
            <Info size={14} color="#64748b" style={{ position: 'absolute', top: '8px', left: '8px' }} />
            <Volume2 size={14} color="#64748b" style={{ position: 'absolute', top: '8px', right: '8px' }} />
            
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: '0.5rem 0', color: '#f8fafc' }}>
              {item.symbol}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
              {item.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}