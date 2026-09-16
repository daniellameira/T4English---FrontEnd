import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { AppLayout } from './components/AppLayout';
import type { JSX } from 'react/jsx-runtime';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <AppLayout>{children}</AppLayout> : <Navigate to="/login" />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rota Publica Inicial */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas com Layout */}
          <Route 
            path="/dashboard/professor" 
            element={
              <PrivateRoute>
                <div><h1>Dashboard do Professor</h1></div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/student" 
            element={
              <PrivateRoute>
                <div><h1>Dashboard do Aluno</h1></div>
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;