import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { IpaDetailViewer } from '../components/IpaDetailViewer';

describe('Componente IpaDetailViewer (Tabela IPA, Filtros e Áudio)', () => {
  const speakMock = vi.fn();
  const cancelMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'speechSynthesis', {
      writable: true,
      value: {
        speak: speakMock,
        cancel: cancelMock,
      },
    });

    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      vi.fn().mockImplementation(function (this: { text: string; lang: string; rate: number }, text: string) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
      })
    );
  });

  it('deve renderizar os 44 símbolos inicialmente e exibir o destaque do fonema /i:/ (Long E)', () => {
    render(<IpaDetailViewer />);

    expect(screen.getByText(/Mais sons — Todos os Sons \(44\)/i)).toBeInTheDocument();
    expect(screen.getByTitle('Ouvir "see"')).toBeInTheDocument();
    expect(screen.getAllByText('Long E').length).toBeGreaterThanOrEqual(1);
  });

  it('deve filtrar corretamente entre Vogais, Ditongos e Consoantes', () => {
    render(<IpaDetailViewer />);

    // Filtra apenas Ditongos (8)
    fireEvent.click(screen.getByRole('button', { name: /Ditongos \(8\)/i }));

    expect(screen.getByText(/Mais sons — Ditongos \(Diphthongs\)/i)).toBeInTheDocument();
    expect(screen.getByText('Diphthong AY')).toBeInTheDocument();
    expect(screen.queryByText('Long U')).not.toBeInTheDocument();

    // Retorna para Todos (44)
    fireEvent.click(screen.getByRole('button', { name: /Todos \(44\)/i }));
    expect(screen.getByText('Long U')).toBeInTheDocument();
  });

  it('deve atualizar o painel superior ao clicar em um símbolo da grade SEM disparar áudio automático', () => {
    render(<IpaDetailViewer />);

    const thCardButton = screen.getByText('Voiceless TH').closest('button');
    expect(thCardButton).not.toBeNull();

    fireEvent.click(thCardButton!);

    // O painel superior passa a exibir /θ/ (think)
    expect(screen.getByTitle('Ouvir "think"')).toBeInTheDocument();
    // Nenhum áudio deve tocar ao selecionar a caixa na grade
    expect(speakMock).not.toHaveBeenCalled();
  });

  it('deve reproduzir a pronúncia apenas ao clicar nos botões de áudio do painel superior', () => {
    render(<IpaDetailViewer />);

    const mainAudioButton = screen.getByTitle('Ouvir "see"');
    fireEvent.click(mainAudioButton);

    expect(cancelMock).toHaveBeenCalledTimes(1);
    expect(speakMock).toHaveBeenCalledTimes(1);
  });
});