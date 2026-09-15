import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './pages/Login';
import type { JSX } from 'react/jsx-runtime';

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard/professor" 
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}><h1>Dashboard do Professor</h1></div>
              </PrivateRoute>
            } 
          />
          <Route 
            path="/dashboard/student" 
            element={
              <PrivateRoute>
                <div style={{ padding: '2rem' }}><h1>Dashboard do Aluno</h1></div>
              </PrivateRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;