import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StudentMaterials } from '../pages/StudentMaterials';
import { api } from '../api/client';

// 1. "Mockamos" (Simulamos) o Axios para não fazer chamadas reais ao backend durante o teste
vi.mock('../api/client', () => ({
  api: {
    get: vi.fn(),
  },
}));

describe('Página StudentMaterials (Biblioteca de Aulas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve carregar a biblioteca e marcar a aula como concluída com base na API', async () => {
    // Simulamos que a API do C# respondeu que a aula "first-step-01" já foi feita
    (api.get as any).mockResolvedValue({ data: ['first-step-01'] });

    // Renderizamos o componente dentro de um MemoryRouter (necessário porque usamos useNavigate)
    render(
      <MemoryRouter>
        <StudentMaterials />
      </MemoryRouter>
    );

    // Verificamos se o título principal carregou
    expect(screen.getByText('Biblioteca de Aulas')).toBeInTheDocument();

    // Verificamos se a API foi chamada no onLoad
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/Lesson/progress/me');
    });

    // Como mockámos que a 'first-step-01' está concluída, o botão deve mudar para "Revisar Aula"
    expect(await screen.findByText('Revisar Aula')).toBeInTheDocument();
  });

  it('deve filtrar as aulas corretamente ao usar a barra de pesquisa', async () => {
    // Neste teste, o aluno não tem aulas concluídas
    (api.get as any).mockResolvedValue({ data: [] });

    render(
      <MemoryRouter>
        <StudentMaterials />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    
    // Procura o input de pesquisa pelo placeholder
    const searchInput = screen.getByPlaceholderText('Pesquisar por título ou tema da aula...');
    
    // Digita um termo que sabemos que não existe no catálogo
    await user.type(searchInput, 'PalavraQueNaoExiste');

    // Verifica se a interface mostra a mensagem de estado vazio
    expect(screen.getByText('Nenhuma aula encontrada')).toBeInTheDocument();
  });
});