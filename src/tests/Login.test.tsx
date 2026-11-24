import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Login } from '../pages/Login';
import { api } from '../api/client';

const loginMock = vi.fn();

vi.mock('../api/client', () => ({
  api: {
    post: vi.fn(),
  },
}));

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: loginMock,
  }),
}));

describe('Página Login (Perfis de Acesso e Interações)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderLogin = () => {
    return render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard/student" element={<div>Painel do Aluno</div>} />
          <Route path="/dashboard/professor" element={<div>Painel do Professor</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve autenticar e redirecionar o ALUNO para /dashboard/student', async () => {
    const studentPayload = {
      token: 'fake-student-jwt',
      name: 'Larissa',
      role: 'STUDENT',
    };
    (api.post as any).mockResolvedValue({ data: studentPayload });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'aluno@t4english.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Senha123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Entrar$/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/Auth/login', {
        email: 'aluno@t4english.com',
        password: 'Senha123!',
      });
      expect(loginMock).toHaveBeenCalledWith(studentPayload);
      expect(screen.getByText('Painel do Aluno')).toBeInTheDocument();
    });
  });

  it('deve autenticar e redirecionar o PROFESSOR para /dashboard/professor', async () => {
    const professorPayload = {
      token: 'fake-prof-jwt',
      name: 'Henrique Torquato',
      role: 'PROFESSOR',
    };
    (api.post as any).mockResolvedValue({ data: professorPayload });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'professor@t4english.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: 'Prof123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Entrar$/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(professorPayload);
      expect(screen.getByText('Painel do Professor')).toBeInTheDocument();
    });
  });

  it('deve alternar a visibilidade da senha ao clicar no ícone de olho', () => {
    renderLogin();

    const passwordInput = screen.getByPlaceholderText('••••••••') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    const toggleButton = screen.getByTitle('Mostrar senha');
    fireEvent.click(toggleButton);

    expect(passwordInput.type).toBe('text');
    expect(screen.getByTitle('Ocultar senha')).toBeInTheDocument();
  });

  it('deve exibir mensagem de erro quando as credenciais forem inválidas', async () => {
    (api.post as any).mockRejectedValue({
      response: { data: { message: 'E-mail ou senha inválidos.' } },
    });

    renderLogin();

    fireEvent.change(screen.getByPlaceholderText('seu@email.com'), {
      target: { value: 'errado@t4english.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('••••••••'), {
      target: { value: '000000' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^Entrar$/i }));

    await waitFor(() => {
      expect(screen.getByText('E-mail ou senha inválidos.')).toBeInTheDocument();
    });
    expect(loginMock).not.toHaveBeenCalled();
  });
});