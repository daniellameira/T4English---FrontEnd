import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LessonViewer } from '../pages/LessonViewer';
import { api } from '../api/client';

// Mock da API
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Página LessonViewer (Visualizador e Temporizador)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 1. Congelamos o tempo para podermos avançar 60s instantaneamente
    vi.useFakeTimers(); 
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  const advanceLessonTimer = () => {
    for (let second = 0; second < 60; second += 1) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }
  };

  const renderLessonViewer = () => {
    return render(
      <MemoryRouter initialEntries={['/lesson/first-step-01']}>
        <Routes>
          <Route path="/lesson/:lessonId" element={<LessonViewer />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('deve desbloquear o botão após 60 segundos e permitir concluir a aula', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] } as never);
    vi.mocked(api.post).mockResolvedValue({ status: 200 } as never);

    renderLessonViewer();

    // Resolvemos a promessa inicial do GET silenciosamente
    await act(async () => {
      await Promise.resolve();
    });

    const button = screen.getByRole('button', { name: /Disponível em/i });
    expect(button).toBeDisabled();

    // Avançamos segundo a segundo para que cada render agende o próximo timer.
    advanceLessonTimer();

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent(/Marcar Aula como Concluída/i);

    // Simulamos o clique
    fireEvent.click(button);

    expect(api.post).toHaveBeenCalledWith('/Lesson/catalog/first-step-01/complete');

    // 3. A MAGIA AQUI: Devolvemos o relógio real ao navegador ANTES do waitFor!
    // Assim o waitFor consegue verificar a promessa da API sem ficar preso.
    vi.useRealTimers();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Aula Concluída/i })).toBeInTheDocument();
    });
  });

  it('NÃO deve mostrar aula concluída se a API falhar (A nossa famosa Regra 8)', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: [] } as never);
    vi.mocked(api.post).mockRejectedValue(new Error('Erro de rede'));
    
    const alertMock = vi.spyOn(window, 'alert').mockImplementation(() => {});

    renderLessonViewer();

    await act(async () => {
      await Promise.resolve();
    });

    advanceLessonTimer();

    const button = screen.getByRole('button', { name: /Marcar Aula/i });
    fireEvent.click(button);

    // Devolvemos o relógio real para o waitFor funcionar
    vi.useRealTimers();

    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(expect.stringContaining('Não foi possível guardar'));
    });
    
    expect(button).not.toHaveTextContent(/Aula Concluída/i);
    
    alertMock.mockRestore();
  });
});