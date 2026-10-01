import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { IpaDetailViewer } from '../components/IpaDetailViewer';

export function StudentIpaPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <Link
        to="/dashboard/student"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: 'var(--text-main)',
          textDecoration: 'none',
          fontWeight: 'bold',
          marginBottom: '1.5rem',
        }}
      >
        <ArrowLeft size={18} />
        Voltar ao dashboard
      </Link>

      <IpaDetailViewer />
    </div>
  );
}

export default StudentIpaPage;
