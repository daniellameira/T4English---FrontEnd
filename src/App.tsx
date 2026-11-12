import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { ProfessorDashboard } from './pages/ProfessorDashboard';
import { StudentDashboard } from './pages/StudentDashboard';
import { StudentIpaPage } from './pages/StudentIpaPage';
import { AppLayout } from './components/AppLayout';
import { StudentManagement } from './pages/StudentManagement';
import { LessonViewer } from './pages/LessonViewer';
import { Assignments } from './pages/Assignments';
import type { JSX } from 'react/jsx-runtime';
import { LessonMaterialsManager } from './pages/LessonMaterialsManager';
import { StudentMaterials } from './pages/StudentMaterials';
import { StudentEbooks } from './pages/StudentEbooks';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota PÃºblica Inicial */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route path="/dashboard/professor" element={<PrivateRoute><ProfessorDashboard /></PrivateRoute>} />
          <Route path="/dashboard/student" element={<PrivateRoute><StudentDashboard /></PrivateRoute>} />
          <Route path="/dashboard/student/ipa" element={<PrivateRoute><StudentIpaPage /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><StudentManagement /></PrivateRoute>} />
          <Route path="/assignments" element={<PrivateRoute><Assignments /></PrivateRoute>} />
          
          <Route path="/ebooks" element={<PrivateRoute><StudentEbooks /></PrivateRoute>} />

          <Route path="/study-materials" element={<PrivateRoute><StudentMaterials /></PrivateRoute>} />
          <Route path="/lesson/:lessonId" element={<PrivateRoute><LessonViewer /></PrivateRoute>} />


          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
