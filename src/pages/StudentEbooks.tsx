import { BookText, Download, Lock, Unlock } from 'lucide-react';
import { EBOOK_CATALOG } from '../data/ebookCatalog';

export function StudentEbooks() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* Cabeçalho */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-main)', marginBottom: '0.25rem', textTransform: 'uppercase' }}>
          Biblioteca de E-books
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>
          Faça o download de materiais exclusivos para complementar os seus estudos.
        </p>
      </div>

      {/* Grelha de E-books */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
        {EBOOK_CATALOG.map((ebook) => (
          <div 
            key={ebook.id} 
            className="doodle-card"
            style={{ 
              backgroundColor: '#FFFFFF', 
              borderRadius: '12px',
              border: '3px solid #181818',
              boxShadow: '6px 6px 0px #181818',
              display: 'flex', 
              flexDirection: 'column',
              overflow: 'hidden',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {/* Capa do E-book (Simulada com cor e ícone, mas podia ser uma imagem <img src={...} />) */}
            <div style={{ 
              backgroundColor: ebook.coverColor, 
              height: '140px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              borderBottom: '3px solid #181818',
              position: 'relative'
            }}>
              <BookText size={60} color="#181818" strokeWidth={1.5} />
              
              {/* Etiqueta Premium (Preparação para V2) */}
              {ebook.isPremium && (
                <div style={{
                  position: 'absolute', top: '10px', right: '10px', backgroundColor: '#F59E0B', color: '#FFF', border: '2px solid #181818', borderRadius: '20px', padding: '0.2rem 0.6rem', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem', boxShadow: '2px 2px 0px #181818'
                }}>
                  <Lock size={12} /> PREMIUM
                </div>
              )}
            </div>

            {/* Conteúdo do Card */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1.2rem', color: '#181818', marginBottom: '0.5rem', lineHeight: '1.2' }}>
                {ebook.title}
              </h3>
              <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem', flex: 1 }}>
                {ebook.description}
              </p>

              {/* Botão de Download */}
              <a
                href={ebook.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                // O atributo download força o navegador a baixar o arquivo, se estiver no mesmo domínio.
                download 
                style={{
                  backgroundColor: ebook.isPremium ? '#181818' : 'var(--brand-red)', 
                  color: '#FFFFFF', 
                  border: '2px solid #181818', 
                  borderRadius: '8px', 
                  padding: '0.85rem', 
                  fontWeight: 'bold', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '0.5rem', 
                  textDecoration: 'none',
                  boxShadow: '3px 3px 0px rgba(0,0,0,0.15)', 
                  transition: 'all 0.1s ease',
                  fontFamily: 'var(--font-subtitle)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'translate(2px, 2px)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'translate(0px, 0px)'}
              >
                {ebook.isPremium ? (
                  <>
                    <Unlock size={18} /> Acessar Conteúdo VIP
                  </>
                ) : (
                  <>
                    <Download size={18} /> Fazer Download
                  </>
                )}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}